// Normalizers for social links entered at sign-up.

// --------------------
// Normalizers
// --------------------
export function normalizeInstagram(input?: string) {
  const raw = (input || "").trim();
  if (!raw) return "";

  let s = raw.replace(/\s+/g, "");

  // allow "www.instagram.com/..." without protocol
  if (s.startsWith("www.")) s = `https://${s}`;

  // @username
  if (s.startsWith("@")) s = s.slice(1);

  // url cases
  const isUrl = /^https?:\/\//i.test(s);
  if (isUrl) {
    try {
      const u = new URL(s);
      const host = u.hostname.replace(/^m\./, "").toLowerCase();

      if (!host.includes("instagram.com")) return ""; // not instagram
      const parts = u.pathname.split("/").filter(Boolean);
      const first = parts[0] || "";

      // ignore post/reel/story links etc.
      const banned = new Set(["p", "reel", "tv", "stories", "explore", "accounts", "about"]);
      if (!first || banned.has(first.toLowerCase())) return "";

      const username = first.replace(/^@/, "");
      if (!/^[A-Za-z0-9._]{1,30}$/.test(username)) return "";
      return `${username}`;
    } catch {
      return "";
    }
  }

  // "instagram.com/username" without protocol
  if (/^(?:m\.)?instagram\.com\//i.test(s)) {
    return normalizeInstagram(`https://${s}`);
  }

  // username only
  const username = s.replace(/^@/, "");
  if (!/^[A-Za-z0-9._]{1,30}$/.test(username)) return "";
  return `${username}`;
}

// optional, light facebook normalize
export function normalizeFacebook(input?: string) {
  const raw = (input || "").trim();
  if (!raw) return "";

  let s = raw.replace(/\s+/g, "");
  if (s.startsWith("www.")) s = `https://${s}`;

  // already url
  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      const host = u.hostname.replace(/^m\./, "").toLowerCase();
      if (!host.includes("facebook.com") && !host.includes("fb.com")) return "";
      // keep clean canonical
      const path = u.pathname.replace(/\/+$/, "");
      return `https://facebook.com${path}`;
    } catch {
      return "";
    }
  }

  // "facebook.com/xxx" without protocol
  if (/^(?:m\.)?(?:facebook\.com|fb\.com)\//i.test(s)) {
    return normalizeFacebook(`https://${s}`);
  }

  // username-ish => turn into url
  // (fb usernames can be more permissive, keep it simple)
  return `https://facebook.com/${s.replace(/^@/, "")}`;
}
