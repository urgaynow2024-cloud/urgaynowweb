import Link from "next/link";
import { Container } from "@/components/Container";

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <div className="text-6xl">🏳️‍🌈</div>
      <h1 className="mt-6 text-4xl font-extrabold text-zinc-900 dark:text-white">Page not found</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        We couldn’t find what you were looking for.
      </p>
      <Link href="/" className="btn-primary mt-8 inline-flex">
        Back to home
      </Link>
    </Container>
  );
}
