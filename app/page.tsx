// app/page.tsx
import Link from "next/link";
import { t } from "@/lib/i18n";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-neutral-0)" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid var(--color-neutral-200)" }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-semibold text-xl" style={{ color: "var(--color-neutral-900)" }}>
            {t.common.appName}
          </div>
          <Link href="/login" className="btn btn-secondary btn-sm">
            {t.landing.hero.ctaLogin}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6 text-center">
          {/* Trust Badge */}
          <div className="flex justify-center mb-8">
            <span className="badge-trust">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {t.landing.hero.badge}
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
            style={{ color: "var(--color-neutral-900)", lineHeight: "1.1" }}
          >
            {t.landing.hero.title}
          </h1>

          {/* Subtitle */}
          <p
            className="mt-6 text-lg md:text-xl max-w-xl mx-auto"
            style={{ color: "var(--color-neutral-500)", lineHeight: "1.7" }}
          >
            {t.landing.hero.subtitle}
          </p>

          {/* CTA */}
          <div className="mt-10">
            <Link href="/login" className="btn btn-primary btn-xl">
              {t.landing.hero.cta}
            </Link>
          </div>

          {/* Visual Flow */}
          <div className="mt-20 flex items-center justify-center gap-3 md:gap-6">
            <div className="card card-elevated px-5 py-4 text-center">
              <div className="text-2xl mb-2">📝</div>
              <div className="text-sm font-medium" style={{ color: "var(--color-neutral-700)" }}>
                フォーム送信
              </div>
            </div>
            <svg className="w-6 h-6 flex-shrink-0" style={{ color: "var(--color-neutral-300)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <div className="card card-elevated px-5 py-4 text-center">
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-sm font-medium" style={{ color: "var(--color-neutral-700)" }}>
                自動処理
              </div>
            </div>
            <svg className="w-6 h-6 flex-shrink-0" style={{ color: "var(--color-neutral-300)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <div
              className="card card-elevated px-5 py-4 text-center"
              style={{ background: "var(--color-success-50)" }}
            >
              <div className="text-2xl mb-2">✅</div>
              <div className="text-sm font-medium" style={{ color: "var(--color-success-700)" }}>
                Backlog課題
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20" style={{ background: "var(--color-neutral-50)" }}>
        <div className="max-w-5xl mx-auto px-6">
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-16"
            style={{ color: "var(--color-neutral-900)" }}
          >
            {t.landing.features.title}
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="card card-hover">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-4"
                style={{ background: "var(--color-accent-100)", color: "var(--color-accent-700)" }}
              >
                1
              </div>
              <h3 className="font-semibold text-lg mb-2" style={{ color: "var(--color-neutral-800)" }}>
                {t.landing.features.step1.title}
              </h3>
              <p style={{ color: "var(--color-neutral-500)", fontSize: "0.9375rem" }}>
                {t.landing.features.step1.description}
              </p>
            </div>

            {/* Step 2 */}
            <div className="card card-hover">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-4"
                style={{ background: "var(--color-accent-100)", color: "var(--color-accent-700)" }}
              >
                2
              </div>
              <h3 className="font-semibold text-lg mb-2" style={{ color: "var(--color-neutral-800)" }}>
                {t.landing.features.step2.title}
              </h3>
              <p style={{ color: "var(--color-neutral-500)", fontSize: "0.9375rem" }}>
                {t.landing.features.step2.description}
              </p>
            </div>

            {/* Step 3 */}
            <div className="card card-hover">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-4"
                style={{ background: "var(--color-accent-100)", color: "var(--color-accent-700)" }}
              >
                3
              </div>
              <h3 className="font-semibold text-lg mb-2" style={{ color: "var(--color-neutral-800)" }}>
                {t.landing.features.step3.title}
              </h3>
              <p style={{ color: "var(--color-neutral-500)", fontSize: "0.9375rem" }}>
                {t.landing.features.step3.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20" style={{ background: "var(--color-neutral-0)" }}>
        <div className="max-w-5xl mx-auto px-6">
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-16"
            style={{ color: "var(--color-neutral-900)" }}
          >
            {t.landing.pricing.title}
          </h2>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Free */}
            <div className="card">
              <h3 className="font-semibold text-lg" style={{ color: "var(--color-neutral-800)" }}>
                {t.landing.pricing.free.name}
              </h3>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-bold" style={{ color: "var(--color-neutral-900)" }}>
                  {t.landing.pricing.free.price}
                </span>
                <span className="text-sm" style={{ color: "var(--color-neutral-500)" }}>
                  {t.landing.pricing.free.period}
                </span>
              </div>
              <ul className="space-y-3 mb-6">
                {t.landing.pricing.free.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--color-neutral-600)" }}>
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "var(--color-success-500)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="btn btn-secondary w-full">
                {t.landing.hero.cta}
              </Link>
            </div>

            {/* Starter - Highlighted */}
            <div
              className="card relative"
              style={{ border: "2px solid var(--color-accent-500)" }}
            >
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-medium"
                style={{
                  background: "var(--color-accent-600)",
                  color: "white",
                  borderRadius: "var(--radius-full)"
                }}
              >
                人気
              </div>
              <h3 className="font-semibold text-lg" style={{ color: "var(--color-neutral-800)" }}>
                {t.landing.pricing.starter.name}
              </h3>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-bold" style={{ color: "var(--color-neutral-900)" }}>
                  {t.landing.pricing.starter.price}
                </span>
                <span className="text-sm" style={{ color: "var(--color-neutral-500)" }}>
                  {t.landing.pricing.starter.period}
                </span>
              </div>
              <ul className="space-y-3 mb-6">
                {t.landing.pricing.starter.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--color-neutral-600)" }}>
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "var(--color-success-500)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="btn btn-primary w-full">
                {t.landing.hero.cta}
              </Link>
            </div>

            {/* Pro */}
            <div className="card">
              <h3 className="font-semibold text-lg" style={{ color: "var(--color-neutral-800)" }}>
                {t.landing.pricing.pro.name}
              </h3>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-bold" style={{ color: "var(--color-neutral-900)" }}>
                  {t.landing.pricing.pro.price}
                </span>
                <span className="text-sm" style={{ color: "var(--color-neutral-500)" }}>
                  {t.landing.pricing.pro.period}
                </span>
              </div>
              <ul className="space-y-3 mb-6">
                {t.landing.pricing.pro.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--color-neutral-600)" }}>
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "var(--color-success-500)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="btn btn-secondary w-full">
                {t.landing.hero.cta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20" style={{ background: "var(--color-accent-600)" }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            今すぐ始めよう
          </h2>
          <p className="text-lg mb-8" style={{ color: "rgba(255,255,255,0.8)" }}>
            5分でセットアップ完了。クレジットカード不要。
          </p>
          <Link
            href="/login"
            className="btn btn-xl"
            style={{ background: "white", color: "var(--color-accent-700)" }}
          >
            {t.landing.hero.cta}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "var(--color-neutral-50)" }}>
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style={{ color: "var(--color-neutral-500)" }}>
          <div>{t.landing.footer.copyright}</div>
          <div className="flex gap-6">
            <a href="/terms" className="hover:underline">{t.landing.footer.terms}</a>
            <a href="/privacy" className="hover:underline">{t.landing.footer.privacy}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
