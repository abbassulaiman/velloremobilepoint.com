const { chromium } = require('playwright');
const path = require('path');

const BASE = 'http://localhost:9000';
const pages = ['index.html', 'pages/about.html', 'pages/service.html', 'pages/contact.html'];
const OUT = path.join(__dirname, 'screenshots');

(async () => {
    const fs = require('fs');
    if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

    const browser = await chromium.launch();

    // Desktop
    const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    for (const page of pages) {
        const p = await desktop.newPage();
        await p.goto(`${BASE}/${page}`, { waitUntil: 'networkidle', timeout: 15000 });
        // Scroll through the page to trigger WOW.js animations
        await p.evaluate(async () => {
            await new Promise(resolve => {
                const total = document.body.scrollHeight;
                let pos = 0;
                const step = 600;
                const timer = setInterval(() => {
                    window.scrollBy(0, step);
                    pos += step;
                    if (pos >= total) { clearInterval(timer); resolve(); }
                }, 80);
            });
        });
        await p.waitForTimeout(800);
        await p.evaluate(() => window.scrollTo(0, 0));
        await p.waitForTimeout(400);
               const name = page.replace('pages/', '').replace('.html', '');
               await p.screenshot({ path: `${OUT}/${name}-desktop.png`, fullPage: true });
        console.log(`✅ desktop: ${name}`);
        await p.close();
    }

    // Mobile
    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    for (const page of pages) {
        const p = await mobile.newPage();
        await p.goto(`${BASE}/${page}`, { waitUntil: 'networkidle', timeout: 15000 });
        await p.evaluate(async () => {
            await new Promise(resolve => {
                const total = document.body.scrollHeight;
                let pos = 0;
                const step = 400;
                const timer = setInterval(() => {
                    window.scrollBy(0, step);
                    pos += step;
                    if (pos >= total) { clearInterval(timer); resolve(); }
                }, 80);
            });
        });
        await p.waitForTimeout(800);
        await p.evaluate(() => window.scrollTo(0, 0));
        await p.waitForTimeout(400);
               const name = page.replace('pages/', '').replace('.html', '');
               await p.screenshot({ path: `${OUT}/${name}-mobile.png`, fullPage: true });
        console.log(`✅ mobile:  ${name}`);
        await p.close();
    }

    await browser.close();
    console.log('\nDone! Screenshots saved to ./screenshots/');
})();
