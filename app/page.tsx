// app/page.tsx
import Link from "next/link";
import { t } from "@/lib/i18n";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-neutral-0)" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid var(--color-neutral-100)" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-semibold text-xl" style={{ color: "var(--color-neutral-900)" }}>
            {t.common.appName}
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn btn-tertiary btn-sm">
              {t.landing.hero.ctaLogin}
            </Link>
            <Link href="/login" className="btn btn-primary btn-sm">
              {t.landing.hero.cta}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-32 md:py-40">
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
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
            style={{ color: "var(--color-neutral-900)", lineHeight: "1.08" }}
          >
            {t.landing.hero.title}
          </h1>

          {/* Subtitle */}
          <p
            className="mt-8 text-lg md:text-xl max-w-xl mx-auto"
            style={{ color: "var(--color-neutral-500)", lineHeight: "1.7" }}
          >
            {t.landing.hero.subtitle}
          </p>

          {/* CTA */}
          <div className="mt-12 flex items-center justify-center gap-4">
            <Link href="/login" className="btn btn-primary btn-xl">
              {t.landing.hero.cta}
            </Link>
          </div>

          {/* Trust bar */}
          <div
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm"
            style={{ color: "var(--color-neutral-400)" }}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" style={{ color: "var(--color-success-500)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t.landing.trustBar.api}
            </span>
            <span style={{ color: "var(--color-neutral-200)" }}>|</span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" style={{ color: "var(--color-success-500)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t.landing.trustBar.setup}
            </span>
            <span style={{ color: "var(--color-neutral-200)" }}>|</span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" style={{ color: "var(--color-success-500)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t.landing.trustBar.serverSide}
            </span>
          </div>

          {/* Visual Flow */}
          <div className="mt-20 flex items-center justify-center gap-3 md:gap-6">
            <div className="card card-elevated px-6 py-5 text-center">
              <div
                className="w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center"
                style={{ background: "var(--color-accent-100)", color: "var(--color-accent-600)" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-sm font-medium" style={{ color: "var(--color-neutral-700)" }}>
                {t.landing.flow.form}
              </div>
            </div>
            <svg className="w-6 h-6 flex-shrink-0" style={{ color: "var(--color-neutral-300)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <div className="card card-elevated px-6 py-5 text-center">
              <div
                className="w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center"
                style={{ background: "var(--color-primary-100)", color: "var(--color-primary-600)" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-sm font-medium" style={{ color: "var(--color-neutral-700)" }}>
                {t.landing.flow.process}
              </div>
            </div>
            <svg className="w-6 h-6 flex-shrink-0" style={{ color: "var(--color-neutral-300)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <div
              className="card card-elevated px-6 py-5 text-center"
              style={{ background: "var(--color-success-50)" }}
            >
              <div
                className="w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center"
                style={{ background: "var(--color-success-100)", color: "var(--color-success-600)" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-sm font-medium" style={{ color: "var(--color-success-700)" }}>
                {t.landing.flow.ticket}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24" style={{ background: "var(--color-neutral-50)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-16"
            style={{ color: "var(--color-neutral-900)" }}
          >
            {t.landing.features.title}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="card card-hover">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-5"
                style={{ background: "var(--color-accent-100)", color: "var(--color-accent-600)" }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2" style={{ color: "var(--color-neutral-800)" }}>
                {t.landing.features.step1.title}
              </h3>
              <p style={{ color: "var(--color-neutral-500)", fontSize: "0.9375rem", lineHeight: "1.7" }}>
                {t.landing.features.step1.description}
              </p>
            </div>

            {/* Step 2 */}
            <div className="card card-hover">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-5"
                style={{ background: "var(--color-primary-100)", color: "var(--color-primary-600)" }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2" style={{ color: "var(--color-neutral-800)" }}>
                {t.landing.features.step2.title}
              </h3>
              <p style={{ color: "var(--color-neutral-500)", fontSize: "0.9375rem", lineHeight: "1.7" }}>
                {t.landing.features.step2.description}
              </p>
            </div>

            {/* Step 3 */}
            <div className="card card-hover">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-5"
                style={{ background: "var(--color-success-100)", color: "var(--color-success-600)" }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2" style={{ color: "var(--color-neutral-800)" }}>
                {t.landing.features.step3.title}
              </h3>
              <p style={{ color: "var(--color-neutral-500)", fontSize: "0.9375rem", lineHeight: "1.7" }}>
                {t.landing.features.step3.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Point: Before vs After */}
      <section className="py-24" style={{ background: "var(--color-neutral-0)" }}>
        <div className="max-w-5xl mx-auto px-6">
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-16"
            style={{ color: "var(--color-neutral-900)" }}
          >
            {t.landing.pain.title}
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Before */}
            <div className="card" style={{ padding: "var(--space-10)", borderColor: "var(--color-error-200)", background: "var(--color-error-50)" }}>
              <div className="flex items-center gap-2 mb-6">
                <svg className="w-5 h-5" style={{ color: "var(--color-error-500)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="font-semibold" style={{ color: "var(--color-error-700)" }}>
                  {t.landing.pain.before}
                </span>
              </div>
              <ol className="space-y-3">
                {t.landing.pain.beforeSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm" style={{ color: "var(--color-error-700)" }}>
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                      style={{ background: "var(--color-error-200)", color: "var(--color-error-700)" }}
                    >
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* After */}
            <div className="card" style={{ padding: "var(--space-10)", borderColor: "var(--color-success-200)", background: "var(--color-success-50)" }}>
              <div className="flex items-center gap-2 mb-6">
                <svg className="w-5 h-5" style={{ color: "var(--color-success-500)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-semibold" style={{ color: "var(--color-success-700)" }}>
                  {t.landing.pain.after}
                </span>
              </div>
              <ol className="space-y-3">
                {t.landing.pain.afterSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm" style={{ color: "var(--color-success-700)" }}>
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                      style={{ background: "var(--color-success-200)", color: "var(--color-success-700)" }}
                    >
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24" style={{ background: "var(--color-neutral-50)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-16"
            style={{ color: "var(--color-neutral-900)" }}
          >
            {t.landing.pricing.title}
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Free */}
            <div className="card" style={{ padding: "var(--space-10)" }}>
              <h3 className="font-semibold text-lg" style={{ color: "var(--color-neutral-800)" }}>
                {t.landing.pricing.free.name}
              </h3>
              <div className="mt-4 mb-8">
                <span className="text-4xl font-bold" style={{ color: "var(--color-neutral-900)" }}>
                  {t.landing.pricing.free.price}
                </span>
                <span className="text-sm ml-1" style={{ color: "var(--color-neutral-500)" }}>
                  {t.landing.pricing.free.period}
                </span>
              </div>
              <ul className="space-y-3 mb-8">
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
              style={{ border: "2px solid var(--color-accent-500)", padding: "var(--space-10)" }}
            >
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-medium"
                style={{
                  background: "var(--color-accent-600)",
                  color: "white",
                  borderRadius: "var(--radius-full)"
                }}
              >
                {t.landing.pricing.popular}
              </div>
              <h3 className="font-semibold text-lg" style={{ color: "var(--color-neutral-800)" }}>
                {t.landing.pricing.starter.name}
              </h3>
              <div className="mt-4 mb-8">
                <span className="text-4xl font-bold" style={{ color: "var(--color-neutral-900)" }}>
                  {t.landing.pricing.starter.price}
                </span>
                <span className="text-sm ml-1" style={{ color: "var(--color-neutral-500)" }}>
                  {t.landing.pricing.starter.period}
                </span>
              </div>
              <ul className="space-y-3 mb-8">
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
            <div className="card" style={{ padding: "var(--space-10)" }}>
              <h3 className="font-semibold text-lg" style={{ color: "var(--color-neutral-800)" }}>
                {t.landing.pricing.pro.name}
              </h3>
              <div className="mt-4 mb-8">
                <span className="text-4xl font-bold" style={{ color: "var(--color-neutral-900)" }}>
                  {t.landing.pricing.pro.price}
                </span>
                <span className="text-sm ml-1" style={{ color: "var(--color-neutral-500)" }}>
                  {t.landing.pricing.pro.period}
                </span>
              </div>
              <ul className="space-y-3 mb-8">
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

          {/* Enterprise mention */}
          <p className="text-center mt-8 text-sm" style={{ color: "var(--color-neutral-500)" }}>
            {t.landing.pricing.enterprise}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24" style={{ background: "var(--color-neutral-0)" }}>
        <div className="max-w-3xl mx-auto px-6">
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-16"
            style={{ color: "var(--color-neutral-900)" }}
          >
            {t.landing.faq.title}
          </h2>

          <div className="space-y-4">
            {t.landing.faq.items.map((item, i) => (
              <details
                key={i}
                className="card group"
                style={{ padding: "0" }}
              >
                <summary
                  className="flex items-center justify-between cursor-pointer px-6 py-5 select-none"
                  style={{ color: "var(--color-neutral-800)" }}
                >
                  <span className="font-medium text-sm md:text-base pr-4">{item.q}</span>
                  <svg
                    className="w-5 h-5 flex-shrink-0 transition-transform group-open:rotate-180"
                    style={{ color: "var(--color-neutral-400)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div
                  className="px-6 pb-5 text-sm"
                  style={{ color: "var(--color-neutral-600)", lineHeight: "1.7" }}
                >
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        className="py-24"
        style={{ background: "linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-accent-600) 100%)" }}
      >
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t.landing.finalCta.title}
          </h2>
          <p className="text-lg mb-10" style={{ color: "rgba(255,255,255,0.8)" }}>
            {t.landing.finalCta.subtitle}
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
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <div className="font-semibold text-lg mb-2" style={{ color: "var(--color-neutral-900)" }}>
                {t.common.appName}
              </div>
              <p className="text-sm" style={{ color: "var(--color-neutral-500)" }}>
                {t.common.tagline}
              </p>
            </div>
            {/* Product */}
            <div>
              <div className="text-sm font-medium mb-3" style={{ color: "var(--color-neutral-700)" }}>
                {t.landing.footer.product}
              </div>
              <div className="flex flex-col gap-2 text-sm" style={{ color: "var(--color-neutral-500)" }}>
                <a href="#features" className="hover:underline">{t.landing.features.title}</a>
                <a href="/login" className="hover:underline">{t.landing.hero.ctaLogin}</a>
              </div>
            </div>
            {/* Legal */}
            <div>
              <div className="text-sm font-medium mb-3" style={{ color: "var(--color-neutral-700)" }}>
                {t.landing.footer.legal}
              </div>
              <div className="flex flex-col gap-2 text-sm" style={{ color: "var(--color-neutral-500)" }}>
                <a href="/terms" className="hover:underline">{t.landing.footer.terms}</a>
                <a href="/privacy" className="hover:underline">{t.landing.footer.privacy}</a>
              </div>
            </div>
          </div>
          <div
            className="mt-10 pt-6 text-sm text-center"
            style={{ borderTop: "1px solid var(--color-neutral-200)", color: "var(--color-neutral-400)" }}
          >
            {t.landing.footer.copyright}
          </div>
        </div>
      </footer>
    </div>
  );
}
