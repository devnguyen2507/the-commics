
const fs = require('fs');
const path = require('path');
const { XMLParser } = require('fast-xml-parser');

const parser = new XMLParser({ ignoreAttributes: false });

const TMP_DIR = process.argv[2] || './tmp';
const LOCAL_SITEMAP_DIR = process.argv[3] || 'src/ui/dist/client';

const FILES = [
    { prod: path.join(TMP_DIR, 'prod-sitemap-index.xml'), local: path.join(LOCAL_SITEMAP_DIR, 'sitemap-index.xml'), name: 'sitemap-index.xml' },
    { prod: path.join(TMP_DIR, 'prod-sitemap-page.xml'), local: path.join(LOCAL_SITEMAP_DIR, 'sitemap-page.xml'), name: 'sitemap-page.xml' },
    { prod: path.join(TMP_DIR, 'prod-sitemap-comics.xml'), local: path.join(LOCAL_SITEMAP_DIR, 'sitemap-comics.xml'), name: 'sitemap-comics.xml' },
    { prod: path.join(TMP_DIR, 'prod-sitemap-categories.xml'), local: path.join(LOCAL_SITEMAP_DIR, 'sitemap-categories.xml'), name: 'sitemap-categories.xml' },
    { prod: path.join(TMP_DIR, 'prod-sitemap-chapters.xml'), local: path.join(LOCAL_SITEMAP_DIR, 'sitemap-chapters.xml'), name: 'sitemap-chapters.xml' }
];

function normalizeLastMod(dateStr) {
    if (!dateStr || dateStr === 'null' || dateStr === 'undefined') return null;
    return dateStr.substring(0, 16);
}

function extractEntries(xmlData) {
    const entries = {};
    const root = xmlData.sitemapindex || xmlData.urlset;
    if (!root) return entries;

    const list = root.sitemap || root.url || [];
    const items = Array.isArray(list) ? list : [list];

    items.forEach(item => {
        const loc = item.loc;
        if (loc) {
            entries[loc] = {
                lastmod: normalizeLastMod(String(item.lastmod)),
                priority: item.priority,
                changefreq: item.changefreq
            };
        }
    });
    return entries;
}

function compare(prodEntries, localEntries, fileName) {
    console.log(`\n=== Comparing ${fileName} ===`);
    const prodUrls = Object.keys(prodEntries);
    const localUrls = Object.keys(localEntries);

    const missingInLocal = prodUrls.filter(url => !localEntries[url]);
    const extraInLocal = localUrls.filter(url => !prodEntries[url]);
    const commonUrls = prodUrls.filter(url => localEntries[url]);

    if (missingInLocal.length > 0) {
        console.log(`[!] THIẾU LINK (${missingInLocal.length}):`);
        missingInLocal.forEach(url => console.log(`  - ${url}`));
    } else {
        console.log(`[✓] Không thiếu link nào.`);
    }

    if (extraInLocal.length > 0) {
        console.log(`[!] DƯ LINK (${extraInLocal.length}):`);
        extraInLocal.forEach(url => console.log(`  + ${url}`));
    }

    let diffCount = 0;
    commonUrls.forEach(url => {
        const p = prodEntries[url];
        const l = localEntries[url];
        const diffs = [];

        if (p.lastmod !== l.lastmod) {
            diffs.push(`lastmod: prod=${p.lastmod}, local=${l.lastmod}`);
        }
        if (p.priority !== l.priority) {
            diffs.push(`priority: prod=${p.priority}, local=${l.priority}`);
        }
        if (p.changefreq !== l.changefreq) {
            diffs.push(`changefreq: prod=${p.changefreq}, local=${l.changefreq}`);
        }

        if (diffs.length > 0) {
            diffCount++;
            console.log(`[!] SAI THÔNG TIN: ${url}`);
            diffs.forEach(d => console.log(`    - ${d}`));
        }
    });

    if (diffCount === 0 && missingInLocal.length === 0 && extraInLocal.length === 0) {
        console.log(`[✓] Khớp hoàn toàn!`);
    }
}

FILES.forEach(file => {
    try {
        if (!fs.existsSync(file.prod)) {
            console.log(`[!] Bỏ qua ${file.name}: Không tìm thấy file production tại ${file.prod}`);
            return;
        }
        if (!fs.existsSync(file.local)) {
            console.log(`[!] Bỏ qua ${file.name}: Không tìm thấy file local tại ${file.local}`);
            return;
        }

        const prodRaw = fs.readFileSync(file.prod, 'utf-8');
        const localRaw = fs.readFileSync(file.local, 'utf-8');

        const prodXml = parser.parse(prodRaw);
        const localXml = parser.parse(localRaw);

        const prodEntries = extractEntries(prodXml);
        const localEntries = extractEntries(localXml);

        compare(prodEntries, localEntries, file.name);
    } catch (e) {
        console.log(`[!] Lỗi khi xử lý ${file.name}: ${e.message}`);
    }
});
