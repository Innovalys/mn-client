var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var fs = require('fs'); // Used to read local files
var http   = require('http');

//var request = require('./request/request.js');
var crypto = require('crypto'); // Used to read local files

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

var download = function(url, filename, callback){
  
  var file = fs.createWriteStream(filename);
  
  var req = http.request(url, function(res) {
    console.log("statusCode: ", res.statusCode);
    console.log("headers: ", res.headers);
    res.on('data', function(d) {
      file.write(d);
    });
    res.on('end', function(d) {
      file.close();
      callback(true);
    });
  });
  req.end();
  
  req.on('error', function(e) {
    console.error(e);
    callback(false);
  });
};

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit();
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({ 'min-width' : 960, 'min-height' : 640, width : 1200, height : 800});

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/index.html');
  
  
	mainWindow.getFile = function(dir, url, clbk) {
    // Filename is an hash of the URL + the previous file extension
    var filename = __dirname + '/' + dir + '/' + crypto.createHash('md5').update(url).digest('hex') + '.' + url.split(".").pop();
    
    fs.readFile(filename, 'utf8', function (err, data) {
      if (!err) {
        // Open localy the file
        console.log("File localy loaded");
        clbk(filename);
      } else {
        // Download & save the file
        download(url, filename, function(ok) {
          console.log("File downloaded");
          clbk(ok ? filename : null);
        });
      }
    });
  };
  
  // Show google dev tools
  mainWindow.toggleDevTools();
  
  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});