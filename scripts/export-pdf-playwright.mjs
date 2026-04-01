#!/usr/bin/env node

import { spawn } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { PDFDocument } from "pdf-lib";
import { chromium } from "playwright";

const rootDir = path.resolve(process.argv[2] ?? ".");
const bookDir = path.join(rootDir, "_book");
const distDir = path.join(rootDir, "dist");
const outputFile = path.join(distDir, "anthropic-src-gitbook.pdf");
const port = 41793;
const host = "127.0.0.1";
const bookUrl = `http://${host}:${port}/`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForServer(serverProcess) {
  return new Promise((resolve, reject) => {
    let settled = false;

    const onExit = (code) => {
      if (!settled) {
        settled = true;
        reject(new Error(`Static server exited before PDF export completed (code ${code ?? "unknown"}).`));
      }
    };

    serverProcess.once("exit", onExit);

    const attempt = async () => {
      for (let tries = 0; tries < 40; tries += 1) {
        if (serverProcess.exitCode !== null) {
          return;
        }
        try {
          const response = await fetch(bookUrl);
          if (response.ok) {
            if (!settled) {
              settled = true;
              serverProcess.off("exit", onExit);
              resolve();
            }
            return;
          }
        } catch {
          // The server is still starting.
        }
        await sleep(250);
      }
      if (!settled) {
        settled = true;
        serverProcess.off("exit", onExit);
        reject(new Error("Timed out while waiting for the local book server to become ready."));
      }
    };

    attempt().catch(reject);
  });
}

function getOrderedBookPages(summaryMarkdown) {
  const pages = [];
  const seen = new Set();

  for (const line of summaryMarkdown.split("\n")) {
    const match = line.match(/\(([^)]+\.md)\)/);
    if (!match) {
      continue;
    }
    const mdPath = match[1];
    const htmlPath =
      mdPath === "README.md"
        ? "index.html"
        : mdPath.replace(/\.md$/, ".html");
    if (!seen.has(htmlPath)) {
      seen.add(htmlPath);
      pages.push(htmlPath);
    }
  }

  return pages;
}

async function main() {
  await mkdir(distDir, { recursive: true });
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "anthropic-src-gitbook-pdf-"));
  const summaryMarkdown = await readFile(path.join(rootDir, "SUMMARY.md"), "utf8");
  const pages = getOrderedBookPages(summaryMarkdown);

  if (pages.length === 0) {
    throw new Error("Could not find any Markdown entries in SUMMARY.md for PDF export.");
  }

  const serverProcess = spawn(
    "python3",
    ["-m", "http.server", String(port), "--bind", host],
    {
      cwd: bookDir,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  let browser;
  try {
    await waitForServer(serverProcess);
    browser = await chromium.launch({ headless: true });
    const pdfInputs = [];
    for (let index = 0; index < pages.length; index += 1) {
      const pagePath = pages[index];
      const page = await browser.newPage({
        viewport: { width: 1440, height: 2200 },
      });
      const pageUrl = new URL(pagePath, bookUrl).toString();
      const tempPdf = path.join(tempDir, `${String(index + 1).padStart(2, "0")}.pdf`);

      await page.goto(pageUrl, { waitUntil: "networkidle" });
      await page.emulateMedia({ media: "screen" });
      await page.addStyleTag({
        content: `
          .book-summary {
            display: none !important;
          }
          .book-body {
            left: 0 !important;
          }
          .page-wrapper {
            margin: 0 auto !important;
            max-width: 980px !important;
          }
        `,
      });
      await page.waitForTimeout(600);
      await page.pdf({
        path: tempPdf,
        format: "A4",
        printBackground: true,
        margin: {
          top: "16mm",
          right: "14mm",
          bottom: "18mm",
          left: "14mm",
        },
      });
      await page.close();
      pdfInputs.push(tempPdf);
    }

    const mergedPdf = await PDFDocument.create();
    for (const pdfInput of pdfInputs) {
      const bytes = await readFile(pdfInput);
      const inputPdf = await PDFDocument.load(bytes);
      const copiedPages = await mergedPdf.copyPages(inputPdf, inputPdf.getPageIndices());
      for (const copiedPage of copiedPages) {
        mergedPdf.addPage(copiedPage);
      }
    }

    const mergedBytes = await mergedPdf.save();
    await writeFile(outputFile, mergedBytes);
  } finally {
    if (browser) {
      await browser.close();
    }
    if (serverProcess.exitCode === null) {
      serverProcess.kill("SIGTERM");
      await new Promise((resolve) => {
        serverProcess.once("exit", resolve);
      });
    }
    await rm(tempDir, { recursive: true, force: true });
  }

  process.stdout.write(`Exported PDF book to ${outputFile}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
