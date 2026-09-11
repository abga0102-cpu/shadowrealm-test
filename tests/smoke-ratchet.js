const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const [baselineArg, currentArg] = process.argv.slice(2);

if (!baselineArg || !currentArg) {
  console.error('Usage: node tests/smoke-ratchet.js <baseline-root> <current-root>');
  process.exit(2);
}

const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

function startStaticServer(rootDir) {
  const root = path.resolve(rootDir);
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
        const relative = pathname.replace(/^\/+/, '') || 'index.html';
        let filePath = path.resolve(root, relative);

        if (filePath !== root && !filePath.startsWith(root + path.sep)) {
          res.writeHead(403).end('Forbidden');
          return;
        }

        if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
          filePath = path.join(filePath, 'index.html');
        }

        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
          res.writeHead(404).end('Not found');
          return;
        }

        res.setHeader('Content-Type', MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream');
        fs.createReadStream(filePath).pipe(res);
      } catch (error) {
        res.writeHead(500).end(String(error));
      }
    });

    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({
        server,
        url: `http://127.0.0.1:${address.port}`
      });
    });
  });
}

async function readSmokeFailures(browser, rootDir, label) {
  const { server, url } = await startStaticServer(rootDir);
  const page = await browser.newPage();

  try {
    // The legacy smoke suite exercises randomized combat, loot and item rolls.
    // Baseline and current run in separate pages, so unseeded Math.random can
    // make the ratchet compare two different simulations and invent a failure.
    // Give every document/frame the same deterministic sequence before any game
    // script executes. This keeps the contract strict while making the A/B
    // comparison reproducible.
    await page.addInitScript(() => {
      let state = 0x5eed1234;
      Math.random = function () {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        return state / 0x100000000;
      };
    });

    await page.route('**/npm/**', (route) => route.abort());
    await page.goto(`${url}/smoke-test.html`, { waitUntil: 'domcontentloaded' });

    const summary = page.locator('#big');
    await summary.waitFor({ state: 'visible', timeout: 15000 });
    await summary.waitFor({ state: 'attached' });
    await page.waitForFunction(() => {
      const el = document.querySelector('#big');
      if (!el) return false;
      return /AUCUNE RÉGRESSION|RÉGRESSION\(S\) DÉTECTÉE/.test((el.textContent || '').trim());
    }, null, { timeout: 170000 });

    const text = ((await summary.textContent()) || '').trim();
    const failures = /AUCUNE RÉGRESSION/.test(text)
      ? 0
      : Number((text.match(/(\d+)\s+RÉGRESSION/) || [])[1]);

    if (!Number.isFinite(failures)) {
      throw new Error(`${label} smoke suite did not report a numeric result: ${text}`);
    }

    const failureMessages = await page.locator('#out .r.ko .m').allTextContents();
    console.log(`${label} legacy smoke failures: ${failures}`);
    if (failureMessages.length) {
      console.log(`${label} legacy smoke failure details:`);
      failureMessages.forEach((message) => console.log(`- ${message.trim()}`));
    }
    return failures;
  } finally {
    await page.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const baselineFailures = await readSmokeFailures(browser, baselineArg, 'Baseline');
    const currentFailures = await readSmokeFailures(browser, currentArg, 'Current');

    if (currentFailures > baselineFailures) {
      console.error(`Legacy smoke regression detected: ${baselineFailures} -> ${currentFailures}`);
      process.exitCode = 1;
      return;
    }

    console.log(`Legacy smoke ratchet passed: ${baselineFailures} -> ${currentFailures}`);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});