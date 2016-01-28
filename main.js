'use strict';

var app           = require('app')
  , BrowserWindow = require('browser-window')
  , dialog        = require('dialog')
  , ipcMain       = require('electron').ipcMain
  , Menu          = require('menu');

//
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
//
var mainWindow = null;

//
// Quit when all windows are closed.
//
app.on('window-all-closed', function() {
  //
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  //
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', function() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720
  });
  
  mainWindow.loadURL('file://' + __dirname + '/app/view/default.html');
  //mainWindow.webContents.openDevTools();
  
  mainWindow.on('closed', function() {
    //
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    //
    mainWindow = null;
  });
  
  var template = [
    {
      label: 'Source',
      submenu: [
        {
          label: "DGS"
        },
        {
          label: 'WebSocket',
          click: function() {
          }
        }
      ]
    },
    {
      label: 'Layout',
      submenu: [
        {
          label: 'Compute',
          accelerator: 'Ctrl+L',
          click: function() {
            mainWindow.webContents.send('compute-layout');
          }
        }
      ]
    }
  ];
    
  var menu = Menu.buildFromTemplate(template);
  mainWindow.setMenu(menu);
});
