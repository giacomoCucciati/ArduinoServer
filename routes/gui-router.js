// Router for request from the gui page
// const path = require('path')
const express = require('express')

module.exports = function (theSocket) {
  const router = express.Router()
  var maincontrol = require('../main-control')(theSocket)

  // // Home page route
  // router.get('/', (req, res, next) => {
  //   res.sendFile(path.join(__dirname, 'frontend', 'index.html'))
  // })

  // About page route
  router.get('/about', (req, res) => {
    res.send('About this wiki')
  })

  // Read serial port
  router.post('/connect-arduino', (req, res) => {
    console.log('Requested opening Serial Port on: ', req.body.port)

    maincontrol.configure(req.body.port).then(function () {
      console.log('Finally')
      maincontrol.mysocket.emit('full-update')
      res.send({message: 'Connection with Arduino done', arduino: true})
    }).catch(function () {
      console.log('Finally BAD')
      res.send({message: 'Connection with Arduino failed', arduino: false})
    })
  })

  // Close connection with Arduino
  router.post('/close-arduino', (req, res) => {
    console.log('Requested closing connection with Arduino.')
    maincontrol.close()
    maincontrol.mysocket.emit('full-update')
    res.send({message: 'Closing connection with Arduino.', arduino: false})
  })

  // Read serial port
  router.post('/read-single-temp', (req, res) => {
    console.log('Requested single reading temperature.')
    maincontrol.readSingleTemp()
    res.send({message: 'Reading temperature.'})
  })

  // Read serial port
  router.post('/toggle-reading-temp', (req, res) => {
    console.log('Requested toggle reading temperature: ', req.body.reading)
    if (req.body.reading === true) {
      console.log('Start reading')
      maincontrol.startTempCycle()
      res.send({message: 'Start reading temperature.'})
    } else {
      console.log('Stop reading')
      maincontrol.stopTempCycle()
      res.send({message: 'Stop reading temperature.'})
    }
    maincontrol.mysocket.emit('full-update')
  })

  // Get single value
  router.post('/data', (req, res) => {
    console.log('Requested new data.')
    res.send(maincontrol.getData())
  })

  // Get full update
  router.post('/fullupdate', (req, res) => {
    console.log('Requested full update.')
    let answer = maincontrol.getFullUpdate()
    console.log(answer)
    res.send(answer)
  })

  // Change color
  router.post('/changecolor', (req, res) => {
    console.log('Requested new color: ', req.body.r, req.body.g, req.body.b)
    maincontrol.changecolor(req.body.r, req.body.g, req.body.b)
    maincontrol.mysocket.emit('full-update')
    res.send('Setting new color')
  })

  return {
    router
  }
}
