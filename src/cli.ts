#!/usr/bin/env bun

import { chromium } from "playwright";
import { mkdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { breakpoints } from "./breakpoints";

type CliOptions = {
  url: string;
  outDir: string;
  fullPage: boolean;
  waitFor: number;
};

function parseArgs(argv: string[]): CliOptions {
  const [, , ...rest] = argv;

  if (rest.length === 0 || rest[0].startsWith("-")) {
    console.error("Usage: screenshot <url> [--out ./screenshots] [--full-page] [--wait 2000]");
    process.exit(1);
  }

  const url = rest[0];
  let outDir = "screenshots";
  let fullPage = true;
  let waitFor = 50;

  for (let i = 1; i < rest.length; i++) {
    const arg = rest[i];

    if (arg === "--out" && rest[i + 1]) {
      outDir = rest[i + 1];
      i++;
    } else if (arg === "--no-full-page") {
      fullPage = false;
    } else if (arg === "--full-page") {
      fullPage = true;
    } else if (arg === "--wait" && rest[i + 1]) {
      const parsed = Number(rest[i + 1]);
      if (!Number.isNaN(parsed)) {
        waitFor = parsed;
      }
      i++;
    }
  }

  return {
    url,
    outDir,
    fullPage,
    waitFor
  };
}

async function main() {
  const opts = parseArgs(process.argv);

  const outDir = resolve(process.cwd(), opts.outDir);
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  console.log(`Taking screenshots of ${opts.url}`);
  console.log(`Output directory: ${outDir}`);
  console.log(`Full page: ${opts.fullPage ? "yes" : "no"}`);
  console.log(`Wait after load: ${opts.waitFor}ms`);
  console.log("");

  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (const bp of breakpoints) {
    console.log(`→ ${bp.name} (${bp.width}px)`);

    await page.setViewportSize({ width: bp.width, height: 1000 });

    await page.goto(opts.url, { waitUntil: "networkidle" });

    if (opts.waitFor > 0) {
      await page.waitForTimeout(opts.waitFor);
    }

    const safeName = `${bp.name}-${bp.width}.png`;
    const filePath = join(outDir, safeName);

    await page.screenshot({
      path: filePath,
      fullPage: opts.fullPage
    });

    console.log(`   Saved: ${filePath}`);
  }

  await browser.close();
  console.log("\nDone ✅");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
