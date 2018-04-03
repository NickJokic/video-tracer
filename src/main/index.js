import {
  app,
  BrowserWindow,
  ipcMain,
  Menu
} from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
let aboutWindow
let tmpFoldersCleaned = false;
const winURL = process.env.NODE_ENV === 'development' ?
  `http://localhost:9080` :
  `file://${__dirname}/index.html`

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 600,
    useContentSize: true,
    width: 750,
    preload: `file://${__dirname}/index.html`,
    fullscreen: false,
    fullscreenable: false,
    resizable: false,
    movable: true,
    frameless: true,
    vibrancy: 'ultra-dark',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      webSecurity: true,
      nodeIntegration: true
    }
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function setMainMenu() {
  const template = [
    {
      label: 'Filter',
      submenu: [
        {
          label: 'About',
          click() {
            if (!aboutWindow)
              createAboutWindow();
            else
              aboutWindow.focus();
          }
                },
        {
          type: 'separator'
                },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click() {
            app.quit();
          }
                }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.on('ready', () => {
  createWindow();
  setMainMenu();

  mainWindow.on('close', (e) => {
    if (!tmpFoldersCleaned) {
      e.preventDefault();
      mainWindow.webContents.send('clearTempFiles', "1");
    }
  });

  /* Wait for cleaning status - quit app after tmp files have been cleaned */
  ipcMain.on('cleaningStatus', (info, message) => {
    if (message == 'doneCleaning') {
      tmpFoldersCleaned = true;
      app.quit();
    }
  });

})

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

function createAboutWindow() {
  let modalPath = process.env.NODE_ENV === 'development' ?
    `http://localhost:9080/#/about` :
    `file://${__dirname}/index.html#about`

  aboutWindow = new BrowserWindow({
    width: 450,
    height: 450,
    show: false,
    useContentSize: true,
    fullscreen: false,
    fullscreenable: false,
    resizable: false,
    movable: true,
    frameless: true,
    vibrancy: 'ultra-dark',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      webSecurity: true,
      nodeIntegration: true
    }
  });

  aboutWindow.on('close', function () {
    aboutWindow = null
  });

  aboutWindow.loadURL(modalPath)

  aboutWindow.on('ready-to-show', function () {
    aboutWindow.show();
  });
}
