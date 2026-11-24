// Renders docs/guide/user-guide.html to docs/English-Journey-User-Guide.pdf.
// Run with: npm run guide   (uses Electron's built-in Chromium PDF printer)
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const SRC = path.join(__dirname, '..', 'docs', 'guide', 'user-guide.html');
const OUT = path.join(__dirname, '..', 'docs', 'English-Journey-User-Guide.pdf');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 900, height: 1200 });
  await win.loadFile(SRC);
  await new Promise((r) => setTimeout(r, 800)); // let images load
  const pdf = await win.webContents.printToPDF({
    pageSize: 'A4',
    printBackground: true,
    margins: { top: 0.55, bottom: 0.65, left: 0.6, right: 0.6 },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `<div style="width:100%;font-family:Segoe UI,sans-serif;font-size:8px;color:#6b7185;padding:0 0.6in;display:flex;justify-content:space-between">
      <span>English Journey · User guide</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
  });
  fs.writeFileSync(OUT, pdf);
  console.log('wrote', OUT, Math.round(pdf.length / 1024), 'KB');
  app.exit(0);
});
