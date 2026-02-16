// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-6">404</div>
        <h1
          className="text-xl font-semibold mb-2"
          style={{ color: "var(--color-neutral-900)" }}
        >
          ページが見つかりません
        </h1>
        <p
          className="text-sm mb-6"
          style={{ color: "var(--color-neutral-500)" }}
        >
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link href="/" className="btn btn-primary">
          トップページへ戻る
        </Link>
      </div>
    </main>
  );
}
