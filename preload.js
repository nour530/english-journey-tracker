const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  getStartup: () => ipcRenderer.invoke('get-startup'),
  setStartup: (on) => ipcRenderer.invoke('set-startup', on),
  showWindow: () => ipcRenderer.send('show-window'),
});
