const { existsSync } = require("node:fs");
const { join } = require("node:path");
const { execFileSync } = require("node:child_process");

const projectRoot = join(__dirname, "..");
const serverEntry = join(projectRoot, "src", "server.ts");

if (process.env.SKIP_POSTINSTALL_BUILD === "1") {
  console.log("Skipping postinstall build because SKIP_POSTINSTALL_BUILD=1.");
  process.exit(0);
}

const shouldBuild =
  process.env.RENDER === "true" ||
  process.env.CI === "true" ||
  process.env.NODE_ENV === "production";

if (!shouldBuild) {
  console.log("Skipping postinstall build (local install). Run npm run build before deploy.");
  process.exit(0);
}

if (!existsSync(serverEntry)) {
  console.log("Skipping postinstall build because src/server.ts is not available.");
  process.exit(0);
}

console.log("Building TypeScript output for deployment...");
execFileSync(process.execPath, [require.resolve("typescript/bin/tsc"), "-p", "tsconfig.json"], {
  cwd: projectRoot,
  stdio: "inherit",
});
