#!/usr/bin/env node

/**
 * Auto-bump patch versions for plugins whose files changed since last commit.
 *
 * Usage:
 *   node scripts/bump-plugin-versions.js            # diff HEAD~1
 *   node scripts/bump-plugin-versions.js <base-ref>  # diff <base-ref>
 */

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MARKETPLACE_PATH = path.resolve(
  __dirname,
  '../.claude-plugin/marketplace.json'
)

function getChangedFiles(baseRef) {
  const ref = baseRef || "HEAD~1";
  try {
    return execSync(`git diff --name-only ${ref}`, { encoding: "utf-8" })
      .trim()
      .split("\n")
      .filter(Boolean);
  } catch {
    console.log("Could not compute diff — skipping auto-bump.");
    process.exit(0);
  }
}

function extractPluginNames(files) {
  const names = new Set();
  for (const file of files) {
    const match = file.match(/^packs\/([^/]+)\//);
    if (match) {
      names.add(match[1]);
    }
  }
  return names;
}

function bumpPatch(version) {
  const parts = version.split(".");
  parts[2] = String(Number(parts[2]) + 1);
  return parts.join(".");
}

function run() {
  const baseRef = process.argv[2];
  const changedFiles = getChangedFiles(baseRef);

  if (changedFiles.length === 0) {
    console.log("No changed files detected — nothing to bump.");
    return;
  }

  const changedPlugins = extractPluginNames(changedFiles);

  if (changedPlugins.size === 0) {
    console.log("No plugin files changed — nothing to bump.");
    return;
  }

  const marketplace = JSON.parse(fs.readFileSync(MARKETPLACE_PATH, "utf-8"));
  let bumped = 0;

  for (const plugin of marketplace.plugins) {
    if (changedPlugins.has(plugin.name)) {
      const oldVersion = plugin.version;
      plugin.version = bumpPatch(oldVersion);
      console.log(`  ${plugin.name}: ${oldVersion} → ${plugin.version}`);
      bumped++;
    }
  }

  if (bumped > 0) {
    const oldRoot = marketplace.version;
    marketplace.version = bumpPatch(oldRoot);
    console.log(`  marketplace: ${oldRoot} → ${marketplace.version}`);

    fs.writeFileSync(
      MARKETPLACE_PATH,
      JSON.stringify(marketplace, null, 2) + "\n"
    );
    console.log(`\nBumped ${bumped} plugin(s) + marketplace root.`);
  } else {
    console.log("Changed plugins not found in marketplace — nothing to bump.");
  }
}

run();
