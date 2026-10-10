const defaultOrigin = 'https://apkina-creator-gear.rabiajamal760.chatgpt.site';
const configuredOrigin = [
  process.env.PUBLIC_SITE_URL,
  process.env.SITE_URL,
  process.env.VERCEL_PROJECT_PRODUCTION_URL,
  process.env.VERCEL_URL,
].map(value => value?.trim()).find(Boolean) || defaultOrigin;

function normalizeOrigin(value) {
  const candidate = value.startsWith('//') ? `https:${value}`
    : /^[a-z][a-z\d+.-]*:\/\//i.test(value) ? value
    : `https://${value}`;
  try {
    const url = new URL(candidate);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error();
    return url.origin;
  } catch {
    // Never include configured values or credentials in build error messages.
    throw new Error('Invalid site origin configuration. Use an HTTP or HTTPS URL without credentials.');
  }
}

export const SITE_ORIGIN = normalizeOrigin(configuredOrigin);
