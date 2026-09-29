// Accept standard Next.js flags and the host flags used by supervised previews.
const args = process.argv.slice(2).filter(arg => arg !== "--strictPort")
  .map(arg => arg === "--host" ? "--hostname" : arg);
process.argv = [process.execPath, new URL("../node_modules/next/dist/bin/next", import.meta.url).pathname, "dev", ...args];
await import("../node_modules/next/dist/bin/next");
