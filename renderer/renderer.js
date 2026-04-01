(async () => {
  const $ = (sel) => document.querySelector(sel);

  const inputEl = $('#inputPath');
  const outputEl = $('#outputPath');
  const convertBtn = $('#convertBtn');
  const statusEl = $('#status');
  const versionLabel = $('#versionLabel');

  // Show version
  const version = await window.api.getVersion();
  versionLabel.textContent = `v${version}`;

  // Select .md file
  $('#selectFileBtn').addEventListener('click', async () => {
    const filePath = await window.api.selectMdFile();
    if (filePath) inputEl.value = filePath;
  });

  // Select output directory
  $('#selectDirBtn').addEventListener('click', async () => {
    const dirPath = await window.api.selectOutputDir();
    if (dirPath) outputEl.value = dirPath;
  });

  // Convert
  convertBtn.addEventListener('click', async () => {
    const inputFile = inputEl.value;
    const outputDir = outputEl.value;

    if (!inputFile) {
      statusEl.className = 'error';
      statusEl.textContent = '請先選擇 Markdown 檔案';
      return;
    }
    if (!outputDir) {
      statusEl.className = 'error';
      statusEl.textContent = '請先選擇輸出資料夾';
      return;
    }

    convertBtn.disabled = true;
    statusEl.className = 'info';
    statusEl.textContent = '轉換中，請稍候…';

    const result = await window.api.convert({ inputFile, outputDir });

    if (result.success) {
      statusEl.className = 'success';
      statusEl.textContent = `轉換完成：${result.outputFile}`;
    } else {
      statusEl.className = 'error';
      statusEl.textContent = `轉換失敗：${result.error}`;
    }

    convertBtn.disabled = false;
  });
})();
