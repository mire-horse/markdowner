const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  // Load the index.html of the app
  mainWindow.loadFile(path.join(__dirname, 'src/index.html'));

  // Set up the application menu
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'CmdOrCtrl+N',
          click() {
            mainWindow.webContents.send('file-new');
          }
        },
        {
          label: 'Open File',
          accelerator: 'CmdOrCtrl+O',
          click() {
            openFile();
          }
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click() {
            mainWindow.webContents.send('file-save');
          }
        },
        {
          label: 'Save As',
          accelerator: 'CmdOrCtrl+Shift+S',
          click() {
            mainWindow.webContents.send('file-save-as');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click() {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click() {
            dialog.showMessageBox(mainWindow, {
              title: 'About Markdowner',
              message: 'Markdowner v1.0.0',
              detail: 'A simple open-source markdown editor.\nCreated with Electron.',
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    // Dereference the window object
    mainWindow = null;
  });
}

// Open file dialog
function openFile() {
  dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Markdown Files', extensions: ['md', 'markdown'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  }).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
          dialog.showErrorBox('Error', `Failed to open file: ${err.message}`);
          return;
        }
        mainWindow.webContents.send('file-opened', { filePath, content: data });
      });
    }
  }).catch(err => {
    dialog.showErrorBox('Error', `Failed to open file dialog: ${err.message}`);
  });
}

// Save file dialog
ipcMain.on('save-file-dialog', (event, { content, currentFilePath }) => {
  if (currentFilePath) {
    fs.writeFile(currentFilePath, content, 'utf-8', err => {
      if (err) {
        dialog.showErrorBox('Error', `Failed to save file: ${err.message}`);
        return;
      }
      event.reply('file-saved', { filePath: currentFilePath });
    });
  } else {
    dialog.showSaveDialog(mainWindow, {
      filters: [
        { name: 'Markdown Files', extensions: ['md'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    }).then(result => {
      if (!result.canceled && result.filePath) {
        fs.writeFile(result.filePath, content, 'utf-8', err => {
          if (err) {
            dialog.showErrorBox('Error', `Failed to save file: ${err.message}`);
            return;
          }
          event.reply('file-saved', { filePath: result.filePath });
        });
      }
    }).catch(err => {
      dialog.showErrorBox('Error', `Failed to open save dialog: ${err.message}`);
    });
  }
});

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
