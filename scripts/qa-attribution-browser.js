// Browserbase-only replacement for the former local Chrome attribution test.
// Pass the authorized Browserbase CDP connection as a single JSON line on stdin.
// It tests scoped local preview responses with production analytics blocked.
// Set CODEX_NODE_MODULES when Playwright comes from the bundled runtime.
require("./qa-browserbase-seo-20261015.cjs");
