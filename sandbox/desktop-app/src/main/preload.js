const { contextBridge, ipcRenderer } = require('electron');

const invoke = (channel, data) => ipcRenderer.invoke(channel, data);

contextBridge.exposeInMainWorld('sandbox', {
  start: () => invoke('sandbox:start'),
  stop: () => invoke('sandbox:stop'),
  reset: () => invoke('sandbox:reset'),
  status: () => invoke('sandbox:status'),
  logs: () => invoke('sandbox:logs'),
  showError: (message) => invoke('sandbox:show-error', message),
});

