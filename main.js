const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 530,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());

// ── IPC handlers ──

ipcMain.handle('select-md-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '選擇 Markdown 檔案',
    filters: [{ name: 'Markdown', extensions: ['md'] }],
    properties: ['openFile'],
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('select-output-dir', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '選擇輸出資料夾',
    properties: ['openDirectory'],
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('get-version', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
  return pkg.version;
});

ipcMain.handle('convert', async (_event, { inputFile, outputDir, outputFileName }) => {
  try {
    const markdownIt = require('markdown-it');
    const mk = require('@vscode/markdown-it-katex');

    const mdContent = fs.readFileSync(inputFile, 'utf-8');
    const baseName = path.basename(inputFile, '.md');
    const outputFile = path.join(outputDir, outputFileName || `${baseName}.pdf`);

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
  pre { background: #f4f4f4; padding: 12px; border-radius: 5px; overflow-x: auto; }
  pre code { background: none; padding: 0; }
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

    const puppeteer = require('puppeteer');
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

    return { success: true, outputFile };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('check-for-updates', async () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
  const currentVersion = pkg.version;

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      path: '/repos/ShuoKuro/mdToPDF/releases/latest',
      headers: { 'User-Agent': 'mdToPDF' },
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const release = JSON.parse(data);
          const latestVersion = release.tag_name.replace(/^v/, '');
          if (latestVersion !== currentVersion) {
            const asset = release.assets?.find((a) => a.name.endsWith('.exe'));
            resolve({
              hasUpdate: true,
              currentVersion,
              latestVersion,
              downloadUrl: asset?.browser_download_url || release.html_url,
              releaseUrl: release.html_url,
            });
          } else {
            resolve({ hasUpdate: false, currentVersion });
          }
        } catch (e) {
          resolve({ hasUpdate: false, error: e.message });
        }
      });
    }).on('error', (e) => {
      resolve({ hasUpdate: false, error: e.message });
    });
  });
});

ipcMain.handle('open-external', async (_event, url) => {
  if (url && url.startsWith('https://github.com/ShuoKuro/mdToPDF/')) {
    await shell.openExternal(url);
  }
});
