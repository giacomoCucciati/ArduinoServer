import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import ArduinoGui from '@/components/ArduinoGui'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/thegui/',
      name: 'ArduinoGui',
      component: ArduinoGui
    }
  ]
})
