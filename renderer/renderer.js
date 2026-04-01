(async () => {
  const $ = (sel) => document.querySelector(sel);

  const inputEl = $('#inputPath');
  const outputEl = $('#outputPath');
  const outputNameEl = $('#outputName');
  const convertBtn = $('#convertBtn');
  const statusEl = $('#status');
  const versionLabel = $('#versionLabel');
  const checkUpdateBtn = $('#checkUpdateBtn');
  const updateMsg = $('#updateMsg');

  // Show version
  const version = await window.api.getVersion();
  versionLabel.textContent = `v${version}`;

  // Select .md file
  $('#selectFileBtn').addEventListener('click', async () => {
    const filePath = await window.api.selectMdFile();
    if (filePath) {
      inputEl.value = filePath;
      // Auto-fill output filename
      const baseName = filePath.split(/[\\/]/).pop().replace(/\.md$/i, '');
      outputNameEl.value = baseName + '.pdf';
    }
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
    let outputFileName = outputNameEl.value.trim();

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
    if (!outputFileName) {
      statusEl.className = 'error';
      statusEl.textContent = '請輸入輸出檔名';
      return;
    }

    // Ensure .pdf extension
    if (!outputFileName.endsWith('.pdf')) {
      outputFileName += '.pdf';
    }

    convertBtn.disabled = true;
    statusEl.className = 'info';
    statusEl.textContent = '轉換中，請稍候…';

    const result = await window.api.convert({ inputFile, outputDir, outputFileName });

    if (result.success) {
      statusEl.className = 'success';
      statusEl.textContent = `轉換完成：${result.outputFile}`;
    } else {
      statusEl.className = 'error';
      statusEl.textContent = `轉換失敗：${result.error}`;
    }

    convertBtn.disabled = false;
  });

  // Check for updates
  checkUpdateBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    checkUpdateBtn.style.display = 'none';
    updateMsg.textContent = '正在檢查更新…';
    updateMsg.style.color = '#2980b9';

    const result = await window.api.checkForUpdates();

    if (result.hasUpdate) {
      updateMsg.textContent = `新版本 v${result.latestVersion} 可用 `;
      updateMsg.style.color = '#27ae60';
      checkUpdateBtn.textContent = '前往下載';
      checkUpdateBtn.style.display = '';
      checkUpdateBtn.onclick = (ev) => {
        ev.preventDefault();
        window.api.openExternal(result.releaseUrl);
      };
    } else if (result.error) {
      updateMsg.textContent = '檢查失敗 ';
      updateMsg.style.color = '#e74c3c';
      checkUpdateBtn.style.display = '';
    } else {
      updateMsg.textContent = '已是最新版本';
      updateMsg.style.color = '#888';
    }
  });
})();
