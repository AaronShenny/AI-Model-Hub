import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-6xl font-bold text-foreground">404</h1>
      <p className="text-xl text-muted-foreground mt-4">Page not found</p>
      <Link href="/" className="mt-6 text-primary hover:underline">
        Back to directory
      </Link>
    </div>
  );
}
