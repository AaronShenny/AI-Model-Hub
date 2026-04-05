import { Router, type IRouter } from "express";

type GitHubContentResponse = {
  sha: string;
  content: string;
};

type ReviewInput = {
  model_id: string;
  rating: number;
  comment: string;
  username?: string;
};

type StoredReview = {
  rating: number;
  comment: string;
  date: string;
  username?: string;
};

type ModelRecord = {
  model_id: string;
  reviews?: StoredReview[];
};

const router: IRouter = Router();

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const requestTracker = new Map<string, number[]>();

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} environment variable is required.`);
  }

  return value;
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const recent = (requestTracker.get(ip) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    requestTracker.set(ip, recent);
    return false;
  }

  recent.push(now);
  requestTracker.set(ip, recent);
  return true;
}

function parseReviewInput(body: unknown): ReviewInput {
  if (!body || typeof body !== "object") {
    throw new Error("Request body must be an object.");
  }

  const model_id = String((body as Record<string, unknown>).model_id ?? "").trim();
  const rating = Number((body as Record<string, unknown>).rating);
  const comment = String((body as Record<string, unknown>).comment ?? "").trim();
  const username = String((body as Record<string, unknown>).username ?? "").trim();

  if (!model_id) {
    throw new Error("model_id is required.");
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("rating must be an integer between 1 and 5.");
  }

  if (!comment) {
    throw new Error("comment is required.");
  }

  if (comment.length > 1000) {
    throw new Error("comment cannot exceed 1000 characters.");
  }

  if (username.length > 50) {
    throw new Error("username cannot exceed 50 characters.");
  }

  return {
    model_id,
    rating,
    comment,
    username: username || undefined,
  };
}

function githubHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

router.post("/add-review", async (req, res) => {
  const ip = req.ip || "unknown";

  if (!checkRateLimit(ip)) {
    res.status(429).json({
      error: "Too many review submissions. Please wait and try again.",
      retry_after_ms: RATE_LIMIT_WINDOW_MS,
    });
    return;
  }

  let payload: ReviewInput;

  try {
    payload = parseReviewInput(req.body);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
    return;
  }

  try {
    const owner = getRequiredEnv("REVIEWS_GH_OWNER");
    const repo = getRequiredEnv("REVIEWS_GH_REPO");
    const token = getRequiredEnv("REVIEWS_GH_TOKEN");
    const branch = process.env["REVIEWS_GH_BRANCH"] ?? "main";
    const contentPath =
      process.env["REVIEWS_MODELS_PATH"] ?? "public/data/models.json";

    const contentUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${contentPath}?ref=${branch}`;

    const getResponse = await fetch(contentUrl, {
      headers: githubHeaders(token),
    });

    if (!getResponse.ok) {
      req.log.error({ status: getResponse.status }, "Failed to read models.json from GitHub");
      res.status(502).json({
        error: "Unable to read models.json from GitHub.",
      });
      return;
    }

    const filePayload = (await getResponse.json()) as GitHubContentResponse;
    const decoded = Buffer.from(filePayload.content, "base64").toString("utf8");
    const models = JSON.parse(decoded) as ModelRecord[];

    const targetModel = models.find((model) => model.model_id === payload.model_id);

    if (!targetModel) {
      res.status(404).json({
        error: `Model not found for model_id '${payload.model_id}'.`,
      });
      return;
    }

    const newReview: StoredReview = {
      rating: payload.rating,
      comment: payload.comment,
      date: new Date().toISOString(),
      ...(payload.username ? { username: payload.username } : {}),
    };

    targetModel.reviews = [...(targetModel.reviews ?? []), newReview];

    const updatedContent = Buffer.from(
      `${JSON.stringify(models, null, 2)}\n`,
      "utf8",
    ).toString("base64");

    const putResponse = await fetch(contentUrl, {
      method: "PUT",
      headers: {
        ...githubHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Add review for ${payload.model_id}`,
        content: updatedContent,
        sha: filePayload.sha,
        branch,
      }),
    });

    if (!putResponse.ok) {
      req.log.error({ status: putResponse.status }, "Failed to commit updated models.json to GitHub");
      res.status(502).json({
        error: "Unable to commit updated models.json to GitHub.",
      });
      return;
    }

    const commitData = (await putResponse.json()) as { commit?: { sha?: string } };

    res.status(201).json({
      success: true,
      review: newReview,
      commit_sha: commitData.commit?.sha,
      content_path: contentPath,
      branch,
    });
  } catch (error) {
    req.log.error({ err: error }, "Unhandled error while adding review");
    res.status(500).json({
      error: "Unexpected server error while adding review.",
    });
  }
});

export default router;
