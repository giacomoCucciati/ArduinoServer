module.exports = function() {

  var configs = {
    secure: true,
    serverPort: 4481,
    ports:[
      '/dev/ttyACM0',
      '/dev/tty.usbmodem1411',
    ],
    intervalReading: 600, // seconds
    temp_length: 300
  }

  return configs;
}
