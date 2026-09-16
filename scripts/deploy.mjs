// NOTE (2026-09-15): this uploads to a staging/preview path
// (artbit.com.br/<FTP_REMOTE_DIR>, an old addon-domain leftover) — it does
// NOT touch the real production site. ateliersaintsebastian.com is served
// by Cloudflare Pages/Workers, connected to this repo's GitHub remote;
// production deploys happen via `git push origin master`, not this script.
// Kept around only for previewing a build before pushing, if that's ever
// useful. See README.md > Deployment for details.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "basic-ftp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(root, "dist");
const envFile = path.join(root, ".env.deploy.local");

async function loadDeployConfig() {
  const contents = await fs.readFile(envFile, "utf8");
  const values = Object.fromEntries(
    contents
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );

  for (const key of ["FTP_HOST", "FTP_USER", "FTP_PASSWORD", "FTP_REMOTE_DIR"]) {
    if (!values[key]) throw new Error(`Missing ${key} in .env.deploy.local`);
  }

  return values;
}

async function deploy() {
  console.warn(
    "\n[deploy.mjs] Heads up: this uploads to a STAGING path, not the live site.\n" +
      "ateliersaintsebastian.com is deployed via Cloudflare Pages from GitHub —\n" +
      "use `git push origin master` for a real production deploy.\n" +
      "See README.md > Deployment.\n",
  );

  const config = await loadDeployConfig();
  await fs.access(path.join(distDir, "index.html"));

  const client = new Client(30_000);
  client.ftp.verbose = false;

  try {
    console.log(`Connecting to ${config.FTP_HOST}...`);
    await client.access({
      host: config.FTP_HOST,
      user: config.FTP_USER,
      password: config.FTP_PASSWORD,
      secure: false,
    });
    await client.ensureDir(config.FTP_REMOTE_DIR);
    await client.uploadFromDir(distDir);
    console.log(`Deploy completed: ${config.FTP_REMOTE_DIR}`);
  } finally {
    client.close();
  }
}

deploy().catch((error) => {
  console.error(`Deploy failed: ${error.message}`);
  process.exitCode = 1;
});
