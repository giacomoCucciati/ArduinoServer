var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var book = require('./routes/book');
var debug = require('debug')('mean-app:server')
var https = require('https')
var http = require('http')
var app = express();
var helmet = require('helmet');
var fs = require('fs');
var configs = require('./configs')();


// Implement X-Frame: Deny
app.use(helmet.frameguard('deny'));
// Hide X-Powered-By
app.use(helmet.hidePoweredBy());
// Implement X-XSS-Protection
app.use(helmet.xssFilter());

app.use(bodyParser.urlencoded({
   extended: true
}));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


app.use(express.static(path.join(__dirname, 'dist')));
app.use('/books', express.static(path.join(__dirname, 'dist')));
app.use('/book', book);
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname , "dist","index.html"));
});


// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });
//
// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// FROM WWW

/**
 * Module dependencies.
 */



/**
 * Get port from environment and store in Express.
 */
var port = normalizePort(process.env.PORT || configs.serverPort)
app.set('port', port)

/**
 * Create HTTP server.
 */
var server = null;
if(configs.secure) {
  const opts = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.crt'),
    requestCert: true,
    rejectUnauthorized: true,
    ca: [ fs.readFileSync('myCA.pem') ]
  }
  server = https.createServer(opts,app)
} else {
  server = http.createServer(app)
}
/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port)
server.on('error', onError)
server.on('listening', onListening)

var io = require('socket.io')(server);
var guiRouter = require('./routes/gui-router')(io);
app.use('/guiapi', guiRouter.router);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort (val) {
  var port = parseInt(val, 10)

  if (isNaN(port)) {
    // named pipe
    return val
  }

  if (port >= 0) {
    // port number
    return port
  }

  return false
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError (error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening () {
  var addr = server.address()
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port
  debug('Listening on ' + bind)
}



//module.exports = app;
