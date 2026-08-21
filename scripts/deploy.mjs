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
