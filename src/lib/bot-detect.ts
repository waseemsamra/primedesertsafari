const BOT_PATTERNS = [
  // Search engines
  "googlebot",
  "google-inspectiontool",
  "google-extended",
  "bingbot",
  "bingpreview",
  "duckduckbot",
  "yandexbot",
  "baiduspider",
  "applebot",
  // Social / link previews
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
  "whatsapp",
  "slackbot",
  "discordbot",
  "telegrambot",
  "pinterestbot",
  "redditbot",
  "embedly",
  "w3c_validator",
  // AI assistants / answer engines
  "gptbot",
  "chatgpt-user",
  "oai-searchbot",
  "claudebot",
  "claude-web",
  "claude-searchbot",
  "perplexitybot",
  "perplexity-user",
  "ccbot",
  "bytespider",
  "amazonbot",
  "meta-externalagent",
  "cohere-ai",
  "youbot",
  "diffbot",
  "ai2bot",
  "amazonbot",
];

export function isSearchBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_PATTERNS.some((p) => ua.includes(p));
}

export const BOT_EXPIRY_SECONDS = 86400;
export const USER_EXPIRY_SECONDS = 300;