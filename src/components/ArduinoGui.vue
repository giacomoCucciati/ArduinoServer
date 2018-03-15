<template>
  <div id="ArduinoGui" class="container">
    <div class="row">
      <div class="col">
        Message from server: {{ message }}
      </div>
    </div>
      <div>
        <button type="button" class="btn btn-default" v-on:click="connectArduino" :disabled="connected">Connect Arduino</button>
        <button type="button" class="btn btn-default" v-on:click="closeArduino" :disabled="!connected">Close Arduino</button>
      </div>
      <div>
        <select v-model="portselected">
            <option v-for="port in ports" v-bind:value="port" v-bind:key="port">
                {{ port }}
            </option>
        </select>
      </div>
      <div>
        <button type="button" class="btn btn-default" v-on:click="readSingleTemp">Read Temperature</button>
      </div>
      <div>
        <!-- <input type="checkbox" id="contReading" v-model="contreading" v-on:click="toggleTempReading"> -->
        <input type="checkbox" id="contReading" v-model="contreading">
        <label for="checkbox">Continuos Reading</label>
      </div>
      <div>
        <div v-if="this.mydata.options !== undefined">
          <line-chart :width="600" :height="500" :chartData="mydata"></line-chart>
        </div>
      </div>
      <div>
        <div v-if="this.lummydata.options !== undefined">
          <line-chart :width="600" :height="500" :chartData="lummydata"></line-chart>
        </div>
      </div>
        <chrome-picker :value="colors" @input="updateValue"></chrome-picker>
    </div>
</template>

<script>
import axios from 'axios'
import io from 'socket.io-client'
import lineChart from './LineChart'
import chrome from './ChromePicker'
var defaultProps = {
  rgba: {
    r: 0,
    g: 255,
    b: 0,
    a: 1
  }
}

export default {
  name: 'ArduinoGui',
  components: { 'line-chart': lineChart, 'chrome-picker': chrome },
  data () {
    return {
      message: 'Welcome!',
      colors: defaultProps,
      contreading: false,
      socket: null,
      mydata: {},
      lummydata: {},
      xyvector: [],
      lumxyvector: [],
      options: { responsive: false, maintainAspectRatios: false },
      portselected: '',
      ports: [],
      arduino: false,
      errors: []
    }
  },

  methods: {

    connectArduino (event) {
      axios.post(`/guiapi/connect-arduino/`, { port: this.portselected })
        .then(response => {
          this.message = response.data.message
          this.arduino = response.data.arduino
        })
        .catch(e => {
          this.errors.push(e)
        })
    },

    closeArduino (event) {
      axios.post(`/guiapi/close-arduino`)
        .then(response => {
          this.message = response.data.message
          this.arduino = response.data.arduino
        })
        .catch(e => {
          this.errors.push(e)
        })
    },

    readSingleTemp (event) {
      axios.post('/guiapi/read-single-temp')
        .then((response) => {
          this.message = response.data.message
        }).catch(e => {
          this.errors.push(e)
        })
    },

    toggleTempReading (event) {
      axios.post('/guiapi/toggle-reading-temp', { reading: this.contreading })
        .then((response) => {
          this.message = response.data.message
        }).catch(e => {
          this.errors.push(e)
        })
    },

    fetchData (type) {
      if (type === 'last') {
        axios.post('/guiapi/data', { load: type })
          .then((response) => {
            this.fillData(type, response.data)
          }).catch(e => {
            this.errors.push(e)
          })
      } else if (type === 'all') {
        axios.post('/guiapi/fullupdate', { load: type })
          .then((response) => {
            this.fillData(type, response.data)
          }).catch(e => {
            this.errors.push(e)
          })
      }
    },

    updateValue (value) {
      this.colors = value
      axios.post('/guiapi/changecolor', {r: this.colors.rgba.r, g: this.colors.rgba.g, b: this.colors.rgba.b})
        .then((response) => {
          this.message = response.data.message
        }).catch(e => {
          this.errors.push(e)
        })
    },

    fillData (type, payload) {
      let temperatureValue = payload['temperatureData']
      let luminosityValue = payload['luminosityData']

      if (type === 'last') {
        this.xyvector.push({x: new Date(temperatureValue.x), y: temperatureValue.y})
        this.lumxyvector.push({x: new Date(luminosityValue.x), y: luminosityValue.y})
      } else if (type === 'all') {
        this.ports = payload['ports']
        this.arduino = payload['arduino']
        this.contreading = payload['reading']
        this.xyvector = []
        this.lumxyvector = []
        if (this.ports.indexOf(payload['thePort']) > 0) {
          this.portselected = payload['thePort']
        }
        for (let el in temperatureValue) {
          let singleValue = temperatureValue[el]
          this.xyvector.push({x: new Date(singleValue.x), y: singleValue.y})
        }
        for (let el in luminosityValue) {
          let singleValue = luminosityValue[el]
          this.lumxyvector.push({x: new Date(singleValue.x), y: singleValue.y})
        }
      }

      let preparingChart = {}
      preparingChart.type = 'line'
      preparingChart.labels = []
      preparingChart.datasets = []

      preparingChart.datasets.push({
        label: 'Temp (C)',
        backgroundColor: 'transparent',
        pointBorderColor: 'orange',
        data: this.xyvector
      })
      let preparingChart1 = {}
      preparingChart1.type = 'line'
      preparingChart1.labels = []
      preparingChart1.datasets = []

      preparingChart1.datasets.push({
        label: 'Luminosity (byte)',
        backgroundColor: 'transparent',
        pointBorderColor: 'green',
        data: this.lumxyvector
      })

      // this.lummydata.datasets.push({
      //   label: 'Luminosity (byte)',
      //   backgroundColor: 'transparent',
      //   pointBorderColor: 'green',
      //   data: this.lumxyvector
      // })

      preparingChart.options = {
        responsive: true,
        maintainAspectRatio: false,
        title: {
          display: true,
          text: 'Temperatura'
        },
        scales: {
          xAxes: [{
            type: 'time',
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Data'
            }
          }],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Gradi'
            }
          }]
        }
      }
      preparingChart1.options = preparingChart.options
      this.mydata = preparingChart
      this.lummydata = preparingChart1
    }

  },

  computed: {
    isDefined () {
      if (this.series !== undefined) {
        return true
      } else {
        return false
      }
    },

    connected () {
      return this.arduino
    }
  },

  mounted () {
    // Creating the socket for updates notifications
    this.socket = io('/control')
    // Callback for new-data event
    this.socket.on('new-data', () => this.fetchData('last'))
    // Callback for new-data event
    this.socket.on('full-update', () => this.fetchData('all'))
    // Ask for the latest data collected
    this.fetchData('all')
  },

  // This function is called before a change of component by the router.
  // We have to close the socket in order to clean the component.
  beforeRouteLeave (to, from, next) {
    this.socket.close()
    next()
  },

  watch: {
    contreading: 'toggleTempReading'
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
