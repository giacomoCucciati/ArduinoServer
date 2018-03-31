<template>
  <nav class="navbar has-shadow is-link">
      <div class="navbar-start">
        <router-link to="/welcome" class="navbar-item is-tab">Welcome</router-link>
        <router-link to="/thegui" class="navbar-item is-tab">Arduino</router-link>
      </div>
  </nav>
</template>

<script>
export default {
  name: 'navbar'
}
</script>

<style>
</style>
