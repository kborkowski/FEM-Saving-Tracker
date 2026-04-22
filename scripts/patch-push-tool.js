#!/usr/bin/env node
/**
 * Patches the power-apps-cli and power-apps-actions packages to correctly
 * upload binary files (WOFF2, PNG, etc.) without UTF-8 corruption.
 *
 * Root causes fixed:
 * 1. CliFs.js reads binary files as UTF-8 string → corrupts bytes
 * 2. PushApp.js forces 'utf-8' encoding on readFile → corrupts binary
 * 3. CliHttpClient.js does JSON.stringify(Buffer) → corrupts binary body
 *
 * These patches must be re-applied after npm install.
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

let allOk = true;

function patch(filePath, description, search, replace) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    if (content.includes(replace.trim().split('\n')[0])) {
      console.log(`  [SKIP] Already patched: ${description}`);
      return;
    }
    if (!content.includes(search.trim().split('\n')[0])) {
      console.warn(`  [WARN] Cannot find target in ${description} — patch may be outdated`);
      allOk = false;
      return;
    }
    writeFileSync(filePath, content.replace(search, replace), 'utf-8');
    console.log(`  [OK]   Patched: ${description}`);
  } catch (e) {
    console.error(`  [FAIL] ${description}: ${e.message}`);
    allOk = false;
  }
}

console.log('Applying power-apps binary upload patches...');

// Patch 1: CliFs.js — read binary extensions as Buffer
patch(
  join(root, 'node_modules/@microsoft/power-apps-cli/dist/FS/CliFs.js'),
  'CliFs.js — binary readFile',
  `async readFile(path, encoding) {
        return fs.readFile(path, encoding);
    }`,
  `async readFile(path, encoding) {
        const binaryExts = ['.woff2', '.woff', '.ttf', '.otf', '.eot', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp'];
        if (binaryExts.some(ext => path.endsWith(ext))) {
            return fs.readFile(path); // return Buffer for binary files
        }
        return fs.readFile(path, encoding);
    }`
);

// Patch 2: PushApp.js — remove forced 'utf-8' encoding on readFile
patch(
  join(root, 'node_modules/@microsoft/power-apps-actions/dist/Actions/PushApp.js'),
  'PushApp.js — remove forced utf-8',
  `const fileContent = await vfs.readFile(fullFilePath, 'utf-8');`,
  `const fileContent = await vfs.readFile(fullFilePath);`
);

// Patch 3: CliHttpClient.js — don't JSON.stringify Buffer body
patch(
  join(root, 'node_modules/@microsoft/power-apps-cli/dist/HttpClient/CliHttpClient.js'),
  'CliHttpClient.js — Buffer body passthrough',
  `bodyContent =
                    typeof config.body === 'string' && !isJsonContentType
                        ? config.body
                        : JSON.stringify(config.body);`,
  `if (Buffer.isBuffer(config.body)) {
                    bodyContent = config.body; // pass binary as-is, never JSON.stringify
                } else if (typeof config.body === 'string' && !isJsonContentType) {
                    bodyContent = config.body;
                } else {
                    bodyContent = JSON.stringify(config.body);
                }`
);

if (allOk) {
  console.log('All patches applied successfully.');
} else {
  console.warn('Some patches could not be applied. Fonts may not load correctly.');
  process.exit(1);
}
