// app/error.tsx
"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-6">500</div>
        <h1
          className="text-xl font-semibold mb-2"
          style={{ color: "var(--color-neutral-900)" }}
        >
          エラーが発生しました
        </h1>
        <p
          className="text-sm mb-6"
          style={{ color: "var(--color-neutral-500)" }}
        >
          予期しないエラーが発生しました。もう一度お試しください。
        </p>
        <button onClick={reset} className="btn btn-primary">
          もう一度試す
        </button>
      </div>
    </main>
  );
}
