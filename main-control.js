const express = require('express')
//const errorLog = require('./utils/logger').errorlog;
//const successlog = require('./utils/logger').successlog;


module.exports = function(theSocket) {

  var arduino = require('./board')();
  var temperatureValues = [];
  var temperatureValues2 = [];
  var luminosityValues = [];
  var mysocket = theSocket.of("/control");
  var mytimer = undefined;
  var configs = require('./configs')();
  var chosenPort = undefined;

  var configure = function(port) {
    console.log("maincontrol");
    //successlog.info(`Configure action.`);

    return arduino.connectserial(port,57600).then(function() {
      console.log("main control promise");

      return new Promise(function(fulfill,reject) {
        chosenPort = port;
        arduino.eventEmitter.on("new-serial-data", elaborateData);
        fulfill('OK');
      });
    });

  };

  var close = function() {
    arduino.eventEmitter.removeListener("new-serial-data", elaborateData)
    arduino.closeserial();
  };

  var elaborateData = function(theSerialData) {
    var d = new Date();
    for (var property in theSerialData) {
      if (theSerialData.hasOwnProperty(property)) {
          if(property === "Temperature") {
            temperatureValues.push({x: d.getTime(), y: parseFloat(theSerialData[property])});
            if(temperatureValues.length > configs.temp_length) temperatureValues = temperatureValues.slice(-configs.temp_length);
          } else if(property === "Temperature2") {
            temperatureValues2.push({x: d.getTime(), y: parseFloat(theSerialData[property])});
            if(temperatureValues2.length > configs.temp_length) temperatureValues2 = temperatureValues2.slice(-configs.temp_length);
          } else if(property === "Luminosity") {
            luminosityValues.push({x: d.getTime(), y: parseFloat(theSerialData[property])});
            if(luminosityValues.length > configs.temp_length) luminosityValues = luminosityValues.slice(-configs.temp_length);
          }
      }
    }
    mysocket.emit("new-data");
  };

  var readSingleTemp = function() {
    console.log("Activating reading...");
    arduino.activatereading();
  };

  var startTempCycle = function() {
    console.log("Activating cycle reading...");
    if(mytimer === undefined) {
      mytimer = setInterval( function(){
        arduino.activatereading();
      }, configs.intervalReading*1000);
      arduino.activatereading();
    }
  };

  var stopTempCycle = function() {
    console.log("Stopping cycle reading...");
    if(mytimer !== undefined) {
      clearInterval(mytimer);
      mytimer = undefined;
    }
  };

  var getData = function() {
    return {
      message: "Updating last value.",
      temperatureData: temperatureValues[temperatureValues.length-1],
      temperatureData2: temperatureValues2[temperatureValues2.length-1],
      luminosityData: luminosityValues[luminosityValues.length-1]
    };
  };

  var getFullUpdate = function() {
      return {
        message: "Updating arduino status.",
        temperatureData: temperatureValues,
        temperatureData2: temperatureValues2,
        luminosityData: luminosityValues,
        ports: configs.ports,
        thePort: chosenPort,
        arduino: arduino.isConnected(),
        reading: (mytimer !== undefined)
      };
  };

  var changecolor = function(r,g,b) {
    arduino.changecolor(r, g, b);
  };

  return {
    arduino,
    mysocket,
    configure,
    close,
    getData,
    getFullUpdate,
    changecolor,
    readSingleTemp,
    startTempCycle,
    stopTempCycle
  };

}
