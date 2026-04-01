module.exports = {
  stylesheet: ['https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css'],
  body_class: [],
  css: `
    body { font-family: "Segoe UI", sans-serif; font-size: 14px; }
    table { border-collapse: collapse; width: 100%; margin: 10px 0; }
    th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
    th { background-color: #f0f0f0; }
    h1 { page-break-before: avoid; }
    h2 { page-break-before: always; }
    h2:first-of-type { page-break-before: avoid; }
    blockquote { background: #f9f9f9; border-left: 4px solid #ccc; padding: 8px 12px; margin: 10px 0; }
  `,
  marked_options: {},
  pdf_options: {
    format: 'A4',
    margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    printBackground: true,
  },
  marked_extensions: [],
};
