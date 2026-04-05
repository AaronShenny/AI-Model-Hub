import { Router, type IRouter } from "express";
import healthRouter from "./health";
import reviewRouter from "./reviews";

const router: IRouter = Router();

router.use(healthRouter);
router.use(reviewRouter);

export default router;
