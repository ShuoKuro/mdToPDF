const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  selectMdFile: () => ipcRenderer.invoke('select-md-file'),
  selectOutputDir: () => ipcRenderer.invoke('select-output-dir'),
  getVersion: () => ipcRenderer.invoke('get-version'),
  convert: (opts) => ipcRenderer.invoke('convert', opts),
});
