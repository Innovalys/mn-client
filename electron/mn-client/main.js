var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var fs = require('fs'); // Used to read local files
var http   = require('http');
var https   = require('https');
var mkpath = require('mkpath');
var dialog = require('dialog');
var archiver = require('archiver'); // Zip export

//var request = require('./request/request.js');
var crypto = require('crypto'); // Used to read local files

// Load the configuration file
var conf = require('./conf.json');

conf.path = __dirname;
conf.image = conf.path + conf.image;
conf.cache = conf.path + conf.cache;
conf.download = conf.path + conf.download;


// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

var fileExtension = function( url ) {
    return url.split('.').pop().split(/\#|\?/)[0];
}

var download = function(url, filename, callback) {
  var request = (url.startsWith('https') ? https : http).get(url, function(response) {
    
    if (response.statusCode === 200) {
      var file = fs.createWriteStream(filename);
      
      // File finished downloading
      file.on('finish', function () {
        file.close(function() {
          var stats = fs.statSync(filename);
          
          if(stats["size"] > 0)
            callback(true);
           else {
             fs.unlink(filename);
             callback(false, 'empty');
           }
        });
      });
      
      // Error on file
      file.on('error', function (err) {
        fs.unlink(filename);
        callback(false, err.message);
      });
      
      response.pipe(file);
    } else {
      callback(false, response.statusCode);
    }
    
    // Add timeout.
    request.setTimeout(12000, function () {
        request.abort();
    });
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

  // To use in the webview
  mainWindow.crypto = crypto;

  // Return the list of file/directory contained in a directory
  mainWindow.getDirContent = function(path, success, error) {
    var dir = conf.download + '/' + path;
    
    fs.readdir(dir, function(err, files) {
      if(err) {
        error(err);
        return;
      }
      
      success(files);
    });
  }
  
  // Function to read a file
  mainWindow.readFileSync = function(path, filename, success, error) {
    var dir = conf.download + '/' + path + '/' + filename;

    var data = fs.readFileSync(dir, {encoding: 'utf-8'});
  
    try {
      console.log("File loaded : " + filename);
      return JSON.parse(data);
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  // Function to read a file
  mainWindow.readFile = function(path, filename, success, error) {
    var file = conf.download + '/' + path + '/' + filename;

    fs.readFile(file, {encoding: 'utf-8'}, function(err, data){
      if (err){
        if(error) error(err);
        else console.log(err);
        return;
      }
      
      try {
        success(JSON.parse(data));
        console.log("File loaded : " + filename);
      } catch (err) {
        if(error) error(err);
        else console.log(err);
      }
    });
  }

  // Function to write a provided content (JSON object) to a file
  mainWindow.writeFile = function(path, filename, content, success, error) {
    // Create the directory if it doesn't exist
    var dir = conf.download + '/' + path;
    
    // Create the file
    if (!fs.existsSync(dir)) {
      mkpath.sync(dir, 0x0700);
    }
    
    // Write 
    fs.writeFile(dir + '/' + filename, JSON.stringify(content), function(err) {
      if(err) {
        if(error) error(err);
        else console.log(err);
        return;
      }
      
      success();
      console.log("File saved : " + filename);
    }); 
    
  }

  // Return the application path
  mainWindow.getPath = function () {
    return __dirname;
  }
  
  mainWindow.getConf = function() {
    return conf;
  }

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/index.html');
  
  // Download a list of files
  mainWindow.downloadFiles = function(dir, filenames, urls, done, oneDone) {
    
    var filesToDownload = urls.length > filenames.length ? filenames.length : urls.length;
    var results = [];
    
    if(filesToDownload <= 0)
      done(results);
    
    while(filenames.length > 0 && urls.length > 0) {
      var filename = filenames.shift();
      
      mainWindow.downloadFile(dir, filename, urls.shift(), function(newFilename, error) {
        if(oneDone)
          oneDone(newFilename, error);
          
        results[filename] = { filename : newFilename, error : error };
          
        if(--filesToDownload <= 0)
          done(results);
      });
    }
    
  }
  
  // TODO
  mainWindow.exportFiles = function(files, done) {
    
    dialog.showSaveDialog(mainWindow, { title : "Emplacement de la sauvegarde" }, function(filename) {
      if(filename) {
        var archive = archiver('zip');
        
        // Set to the selected filename
        archive.pipe(fs.createWriteStream(filename));

        // Export each files
        files.forEach(function(file, index) {
          archive.append(fs.createReadStream(file), { name : 'page' + index + '.' + fileExtension(file) });
        });
        
        // Finalize the zip
        archive.finalize();
      }
      
      done(filename, filename ? "No filename specified" : null);
    });
  }
    
  // Download a file
  mainWindow.downloadFile = function(dir, filename, url, done) {
    if(!url || url == '') {
      done(null, 'No URL provided');
      return;
    }
    
    // Create the directory if it doesn't exist
    dir = conf.download + '/' + dir;
    
    if (!fs.existsSync(dir)){
      mkpath.sync(dir, 0x0700);
    }
    
    // Download & save the file
    download(url, dir + '/' + filename, function(ok, error) {
      console.log("File downloaded : " + url);
      done(ok ? filename : null, error);
    });
  }
  
  mainWindow.getDownloadedFile = function(dir, filename, clbk) {
    // Create the directory if it doesn't exist
    filename = conf.download + dir + '/' + filename;
    
    console.log(filename);

    fs.readFile(filename, 'utf8', function (err, data) {
      if (!err) {
        // Open localy the file
        console.log("File localy loaded : " + filename);
        clbk(filename, null);
      } else {
        clbk(null, err);
      }
    });
  }
    
  mainWindow.getFile = function(dir, url, clbk) {
    
    console.log(url);
    
    if(!url || url == '') {
      clbk(null, 'No URL provided');
      return;
    }

    // Create the directory if it doesn't exist
    dir = conf.cache + '/' + dir;
    
    if (!fs.existsSync(dir)){
      mkpath.sync(dir, 0x0700);
    }

    // Filename is an hash of the URL + the previous file extension
    var filename = dir + '/' + crypto.createHash('md5').update(url).digest('hex') + '.' + fileExtension(url);
      
    fs.readFile(filename, 'utf8', function (err, data) {
      if (!err) {
        // Open localy the file
        console.log("File localy loaded : " + url);
        clbk(filename, null);
      } else {
        // Download & save the file
        try {
          download(url, filename, function(ok, error) {
            console.log("File downloaded : " + url);
            clbk(ok ? filename : null, error);
          });
        } catch (error) {
          clbk(null, error);
        }
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
  
  mainWindow.setMenu(null);
});
