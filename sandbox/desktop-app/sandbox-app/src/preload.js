const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sandbox', {
  start: () => ipcRenderer.invoke('sandbox:start'),
  stop: () => ipcRenderer.invoke('sandbox:stop'),
  reset: () => ipcRenderer.invoke('sandbox:reset'),
  status: () => ipcRenderer.invoke('sandbox:status'),
  logs: () => ipcRenderer.invoke('sandbox:logs'),
  showError: (message) => ipcRenderer.invoke('sandbox:show-error', message),
});
