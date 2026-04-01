# MD to PDF

Markdown 轉 PDF 桌面工具，支援數學公式（KaTeX）渲染。

## 功能

- 將 `.md` 檔案轉換為 PDF
- 支援 KaTeX 數學公式（行內 `$...$` 及區塊 `$$...$$`）
- GUI 介面：選擇輸入檔案、自訂輸出檔名、選擇輸出資料夾
- 應用程式內檢查更新，一鍵前往下載最新版本
- 打包為 Windows `.exe` 安裝程式

## 快速開始

```bash
# 安裝依賴
npm install

# 啟動開發模式
npm start

# 打包為 Windows exe
npm run build
```

## 發佈流程

```bash
# Beta 版（pre-release）
npm run release:beta
# 執行 npm version prerelease --preid=beta（例如 1.0.0 → 1.0.1-beta.0）
# 自動 commit + push tag → 觸發 CI，標記為 Pre-release

# Patch 版
npm run release:patch
# 執行 npm version patch（例如 1.0.13 → 1.0.14）
# 自動 commit + push tag（v1.0.14）→ 觸發 CI

# Stable 版（minor）
npm run release:stable
# 執行 npm version minor（例如 1.0.14 → 1.1.0）
# 自動 commit + push tag（v1.1.0）→ 觸發 CI
# GitHub Release 標記為 Latest
```

## 專案結構

```
main.js          # Electron 主程序
preload.js       # 安全 IPC 橋接
renderer/
  index.html     # GUI 頁面
  renderer.js    # 前端邏輯
gen-pdf.js       # 原始 CLI 轉換腳本（參考用）
package.json
```

## 技術棧

- **Electron** — 桌面 GUI
- **markdown-it** + **@vscode/markdown-it-katex** — Markdown & 數學公式渲染
- **Puppeteer** — HTML → PDF
- **electron-builder** — 打包為 exe
