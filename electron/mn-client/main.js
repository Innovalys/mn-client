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

var fileExtension = function( url ) {
    return url.split('.').pop().split(/\#|\?/)[0];
}

var download = function(url, filename, callback){
  
  var req = http.request(url, function(res) {
    
    if(res.statusCode != 200) {
      callback(false, req);
      return;
    } else {
      // File to write to
      var file = fs.createWriteStream(filename);
      
      res.on('data', function(d) {
        file.write(d);
      });
      
      res.on('end', function(d) {
        file.close();
        callback(true, null);
      });
    }
    
  });
  req.end();
  
  req.on('error', function(e) {
    console.error(e);
    callback(false, e);
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

  // Return the application path
  mainWindow.getPath = function () {
    return __dirname;
  };

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/index.html');
  
    
    mainWindow.getFile = function(dir, url, clbk) {

      // Create the directory if it doesn't exist
      dir = __dirname + '/' + dir;
      
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
      }

      // Filename is an hash of the URL + the previous file extension
      var filename = dir + '/' + crypto.createHash('md5').update(url).digest('hex') + '.' + fileExtension(url);
        
      fs.readFile(filename, 'utf8', function (err, data) {
        if (!err) {
          // Open localy the file
          console.log("File localy loaded");
          clbk(filename, null);
        } else {
          // Download & save the file
          download(url, filename, function(ok, error) {
            console.log("File downloaded");
            clbk(ok ? filename : null, error);
          });
        }
      });
  };
  
  // Show google dev tools
  //mainWindow.toggleDevTools();
  
  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});