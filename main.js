const { app, BrowserWindow, Tray, Menu, ipcMain, shell, nativeImage } = require('electron');
const path = require('path');

let win = null;
let tray = null;
let quitting = false;

const ICON = path.join(__dirname, 'assets', 'icon.png');

function createWindow() {
  win = new BrowserWindow({
    width: 1180,
    height: 780,
    minWidth: 960,
    minHeight: 640,
    title: 'English Journey',
    icon: ICON,
    backgroundColor: '#f6f7fb',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false, // keep reminder timers running while hidden
    },
  });

  win.loadFile(path.join(__dirname, 'src', 'index.html'));

  // Links (podcasts, resources) open in the normal browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url);
    return { action: 'deny' };
  });

  // Closing the window hides it to the tray so reminders keep working.
  win.on('close', (e) => {
    if (!quitting) {
      e.preventDefault();
      win.hide();
    }
  });
}

function createTray() {
  tray = new Tray(nativeImage.createFromPath(ICON).resize({ width: 16, height: 16 }));
  tray.setToolTip('English Journey');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Open English Journey', click: showWindow },
    { type: 'separator' },
    { label: 'Quit', click: () => { quitting = true; app.quit(); } },
  ]));
  tray.on('click', showWindow);
}

function showWindow() {
  if (!win) return;
  win.show();
  win.focus();
}

ipcMain.handle('get-startup', () => app.getLoginItemSettings().openAtLogin);
ipcMain.handle('set-startup', (_e, on) => {
  app.setLoginItemSettings({ openAtLogin: !!on });
  return app.getLoginItemSettings().openAtLogin;
});
ipcMain.on('show-window', showWindow);

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', showWindow);
  app.whenReady().then(() => {
    app.setAppUserModelId('com.nour530.englishjourney'); // needed for Windows notifications
    createWindow();
    createTray();
  });
  app.on('before-quit', () => { quitting = true; });
}
