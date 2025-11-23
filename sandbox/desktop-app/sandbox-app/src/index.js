const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const { spawn } = require('node:child_process');

// Project root is 3 levels up: sandbox-app/src -> sandbox-app -> desktop-app -> sandbox
const projectRoot = path.join(__dirname, '..', '..', '..');
const composeArgsBase = ['compose'];

const WINDOW_CSP = "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; script-src 'self'";

function runDocker(args, options = {}) {
  return new Promise((resolve, reject) => {
    const dockerCmd = process.platform === 'win32' ? 'docker.exe' : 'docker';
    const child = spawn(dockerCmd, [...composeArgsBase, ...args], {
      cwd: projectRoot,
      env: { ...process.env },
      shell: false,
      ...options,
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        const error = new Error(stderr || `Command exited with code ${code}`);
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
      }
    });
  });
}

async function composeUp() {
  return runDocker(['up', '--build', '-d']);
}

async function composeDown({ withVolumes = false } = {}) {
  const extra = withVolumes ? ['--volumes', '--remove-orphans'] : [];
  return runDocker(['down', ...extra]);
}

async function getComposeStatus() {
  try {
    const { stdout } = await runDocker(['ps']);
    return stdout.trim();
  } catch (err) {
    return `Error retrieving status:\n${err.stderr || err.message}`;
  }
}

async function fetchRecentLogs() {
  try {
    const { stdout } = await runDocker(['logs', '--tail', '200']);
    return stdout.trim();
  } catch (err) {
    return `Error retrieving logs:\n${err.stderr || err.message}`;
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 720,
    title: 'Studyjam Sandbox Controller',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      enableRemoteModule: false,
    },
  });

  win.loadFile(path.join(__dirname, 'index.html'));
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [WINDOW_CSP],
      },
    });
  });
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

ipcMain.handle('sandbox:start', async () => {
  await composeUp();
  return getComposeStatus();
});

ipcMain.handle('sandbox:stop', async () => {
  await composeDown();
  return getComposeStatus();
});

ipcMain.handle('sandbox:reset', async () => {
  await composeDown({ withVolumes: true });
  await composeUp();
  return getComposeStatus();
});

ipcMain.handle('sandbox:status', async () => getComposeStatus());
ipcMain.handle('sandbox:logs', async () => fetchRecentLogs());

ipcMain.handle('sandbox:show-error', async (_event, message) => {
  dialog.showErrorBox('Sandbox Error', message);
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
