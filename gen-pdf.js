const fs = require('fs');
const path = require('path');

async function main() {
  // Dynamic imports
  const markdownIt = require('markdown-it');
  const mk = require('@vscode/markdown-it-katex');

  const inputFile = path.resolve(__dirname, 'L1-L6_Review.md');
  const outputFile = path.resolve(__dirname, 'L1-L6_Review.pdf');
  const mdContent = fs.readFileSync(inputFile, 'utf-8');

  // Render markdown with KaTeX
  const md = markdownIt({ html: true });
  md.use(mk.default || mk);
  const htmlBody = md.render(mdContent);

  const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<style>
  body { font-family: "Segoe UI", "Microsoft JhengHei", sans-serif; font-size: 13px; line-height: 1.6; padding: 20px; max-width: 210mm; margin: 0 auto; }
  h1 { font-size: 22px; border-bottom: 2px solid #333; padding-bottom: 6px; }
  h2 { font-size: 18px; color: #1a5276; border-bottom: 1px solid #aaa; padding-bottom: 4px; margin-top: 30px; page-break-before: always; }
  h2:first-of-type { page-break-before: avoid; }
  h3 { font-size: 15px; color: #2c3e50; }
  h4 { font-size: 14px; }
  table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 12px; }
  th, td { border: 1px solid #ccc; padding: 5px 8px; text-align: left; }
  th { background-color: #f0f0f0; }
  blockquote { background: #f9f9f9; border-left: 4px solid #3498db; padding: 8px 14px; margin: 10px 0; }
  code { background: #f4f4f4; padding: 1px 4px; border-radius: 3px; font-size: 12px; }
  .katex { font-size: 1.05em; }
  .katex-display { margin: 12px 0; overflow-x: auto; }
  ul, ol { margin: 4px 0; }
  li { margin: 2px 0; }
  hr { border: none; border-top: 1px solid #ccc; margin: 20px 0; }
</style>
</head>
<body>
${htmlBody}
</body>
</html>`;

  // Use Puppeteer (installed by md-to-pdf) to generate PDF
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch {
    // md-to-pdf bundles puppeteer, find it
    const mdToPdfPath = require.resolve('md-to-pdf');
    const mdToPdfDir = path.dirname(mdToPdfPath);
    puppeteer = require(path.join(mdToPdfDir, '..', 'puppeteer'));
  }

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: outputFile,
    format: 'A4',
    margin: { top: '18mm', bottom: '18mm', left: '14mm', right: '14mm' },
    printBackground: true,
  });
  await browser.close();
  console.log('PDF generated:', outputFile);
}

main().catch(e => { console.error(e); process.exit(1); });
