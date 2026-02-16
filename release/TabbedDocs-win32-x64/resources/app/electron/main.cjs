const { app, BrowserWindow, ipcMain, safeStorage } = require('electron');
const path = require('path');
const fs = require('fs/promises');

const isDev = !app.isPackaged;
let mainWindow = null;
const KEY_FILE_NAME = 'gemini-api-key.enc';

const getKeyFilePath = () => path.join(app.getPath('userData'), KEY_FILE_NAME);

const getStoredApiKey = async () => {
  if (!safeStorage.isEncryptionAvailable()) {
    return null;
  }

  const encryptedBufferBase64 = await fs.readFile(getKeyFilePath(), 'utf8');
  if (!encryptedBufferBase64) {
    return null;
  }

  const encryptedBuffer = Buffer.from(encryptedBufferBase64, 'base64');
  return safeStorage.decryptString(encryptedBuffer);
};

const setStoredApiKey = async (apiKey) => {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Secure encryption is not available on this device.');
  }

  const trimmed = typeof apiKey === 'string' ? apiKey.trim() : '';
  if (!trimmed) {
    throw new Error('API key cannot be empty.');
  }

  const encryptedBuffer = safeStorage.encryptString(trimmed);
  await fs.writeFile(getKeyFilePath(), encryptedBuffer.toString('base64'), 'utf8');
};

const removeStoredApiKey = async () => {
  await fs.rm(getKeyFilePath(), { force: true });
};

const registerIpcHandlers = () => {
  ipcMain.handle('secure-key:get', async () => {
    try {
      return await getStoredApiKey();
    } catch (error) {
      if (error && error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  });

  ipcMain.handle('secure-key:set', async (_event, apiKey) => {
    await setStoredApiKey(apiKey);
    return true;
  });

  ipcMain.handle('secure-key:remove', async () => {
    await removeStoredApiKey();
    return true;
  });

  ipcMain.handle('ai:generate', async (_event, payload) => {
    const apiKey = typeof payload?.apiKey === 'string' ? payload.apiKey.trim() : '';
    const prompt = typeof payload?.prompt === 'string' ? payload.prompt.trim() : '';

    if (!apiKey) {
      throw new Error('Gemini API key is required.');
    }

    if (!prompt) {
      throw new Error('Prompt cannot be empty.');
    }

    if (typeof fetch !== 'function') {
      throw new Error('Desktop runtime cannot perform network requests.');
    }

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
        },
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.error?.message || `Gemini API request failed (${response.status}).`;
      throw new Error(errorMessage);
    }

    const generatedText = (data?.candidates || [])
      .flatMap((candidate) => candidate?.content?.parts || [])
      .map((part) => part?.text || '')
      .join('')
      .trim();

    if (!generatedText) {
      throw new Error('Gemini did not return any text.');
    }

    return generatedText;
  });
};

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error('Renderer failed to load', { errorCode, errorDescription, validatedURL });
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
