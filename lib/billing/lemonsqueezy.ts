// lib/billing/lemonsqueezy.ts
const API_BASE = "https://api.lemonsqueezy.com/v1";

function getEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

export async function createCheckoutUrl(email: string) {
  const apiKey = getEnv("LEMONSQUEEZY_API_KEY");
  const storeId = getEnv("LEMONSQUEEZY_STORE_ID");
  const variantId = getEnv("LEMONSQUEEZY_VARIANT_ID");
  const appUrl = getEnv("APP_URL");

  const res = await fetch(`${API_BASE}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: { email },
          checkout_options: {
            redirect_url: `${appUrl}/billing`,
          },
        },
        relationships: {
          store: {
            data: { type: "stores", id: storeId },
          },
          variant: {
            data: { type: "variants", id: variantId },
          },
        },
      },
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Lemon Squeezy error: ${t}`);
  }

  const json = await res.json();
  return json.data.attributes.url as string;
}
