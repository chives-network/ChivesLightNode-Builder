import { app, BrowserWindow, Menu } from 'electron';
import isDev from 'electron-is-dev'
import { server, getPort } from './expressApp.js';
import syncing from './src/syncing.js';

// 启动 Express 服务器
const PORT = getPort();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL('http://localhost:' + PORT);

  const template = [
    {
      label: 'About',
      submenu: [
        {
          label: 'Website',
          click: () => {
            openNewURL('https://chivesweave.org/');
          }
        },
        {
          label: 'Github',
          click: () => {
            openNewURL('https://github.com/chives-network');
          }
        },
        {
          label: 'Discord',
          click: () => {
            openNewURL('https://discord.com/invite/8KrtgBRjZn');
          }
        },
        {
          label: 'Twitter',
          click: () => {
            openNewURL('https://twitter.com/chivesweave');
          }
        },
        {
          label: 'Task To Earn',
          click: () => {
            openNewURL('https://chivesweave.org/task-to-earn/');
          }
        }
      ]
    },
    // 其他菜单...
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit();
  });
}

function openNewURL(url) {
  const newWindow = new BrowserWindow({ width: 800, height: 600 });
  newWindow.loadURL(url);
}

async function intervalTaskShortTime() {
  try {
    console.log('Executing intervalTaskShortTime tasks...');
    const startTime = Date.now();
    await Promise.all([
      syncing.syncingBlockPromiseAll(20),
      syncing.syncingTxPromiseAll(10),
      syncing.syncingChunksPromiseAll(5),
      syncing.syncingTxParseBundle(1)
    ]);
    const executionTime = Date.now() - startTime;
    console.log(`All syncing tasks completed in ${executionTime} ms. Waiting for next interval...`);
    console.log('Resuming interval tasks.');
    const nextInterval = 10 * 1000;
    setTimeout(intervalTask, nextInterval);
  } catch (error) {
    console.error('Error in intervalTask:', error);
  }
}

async function intervalTaskLongTime() {
  try {
    console.log('Executing intervalTaskLongTime tasks...');
    const startTime = Date.now();
    await Promise.all([
      //syncing.resetTx404(),
      syncing.calculatePeers(),
      syncing.syncingBlockAndTxStatAllDates(),
      syncing.deleteBlackTxsAndAddress()
    ]);
    const executionTime = Date.now() - startTime;
    console.log(`All syncing tasks completed in ${executionTime} ms. Waiting for next interval...`);
    console.log('Resuming interval tasks.');
    const nextInterval = 1800 * 1000;
    setTimeout(intervalTask, nextInterval);
  } catch (error) {
    console.error('Error in intervalTask:', error);
  }
}

app.whenReady().then(()=>{
  setTimeout(intervalTaskShortTime, 10 * 1000);
  setTimeout(intervalTaskLongTime, 1800 * 1000);
  createWindow();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    server.close();
    app.quit();
  }
});
