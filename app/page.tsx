// app/page.tsx
import Link from "next/link";
import { t } from "@/lib/i18n";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-semibold text-lg">{t.common.appName}</div>
          <Link
            href="/login"
            className="text-sm font-medium hover:underline"
          >
            {t.landing.hero.ctaLogin}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {t.landing.hero.title}
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          {t.landing.hero.subtitle}
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/login"
            className="rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            {t.landing.hero.cta}
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-16">
            {t.landing.features.title}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold mb-4">
                1
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {t.landing.features.step1.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {t.landing.features.step1.description}
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold mb-4">
                2
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {t.landing.features.step2.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {t.landing.features.step2.description}
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold mb-4">
                3
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {t.landing.features.step3.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {t.landing.features.step3.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-16">
            {t.landing.pricing.title}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free */}
            <div className="rounded-lg border p-6">
              <h3 className="font-semibold text-lg">{t.landing.pricing.free.name}</h3>
              <div className="mt-4">
                <span className="text-3xl font-bold">{t.landing.pricing.free.price}</span>
                <span className="text-gray-600">{t.landing.pricing.free.period}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {t.landing.pricing.free.features.map((feature, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Starter */}
            <div className="rounded-lg border-2 border-black p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-3 py-1 rounded-full">
                人気
              </div>
              <h3 className="font-semibold text-lg">{t.landing.pricing.starter.name}</h3>
              <div className="mt-4">
                <span className="text-3xl font-bold">{t.landing.pricing.starter.price}</span>
                <span className="text-gray-600">{t.landing.pricing.starter.period}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {t.landing.pricing.starter.features.map((feature, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="rounded-lg border p-6">
              <h3 className="font-semibold text-lg">{t.landing.pricing.pro.name}</h3>
              <div className="mt-4">
                <span className="text-3xl font-bold">{t.landing.pricing.pro.price}</span>
                <span className="text-gray-600">{t.landing.pricing.pro.period}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {t.landing.pricing.pro.features.map((feature, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          <div>{t.landing.footer.copyright}</div>
          <div className="flex gap-6">
            <a href="#" className="hover:underline">{t.landing.footer.terms}</a>
            <a href="#" className="hover:underline">{t.landing.footer.privacy}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
