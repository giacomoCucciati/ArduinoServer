<template>
  <div id="app">
    <navbar></navbar>
    <router-view/>
  </div>
</template>

<script>
import navbar from './components/navbar.vue'

export default {
  name: 'App',
  components: { navbar }
}
</script>

<style lang="css">
/* #app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
} */
@import '../node_modules/bulma/css/bulma.css';

</style>
