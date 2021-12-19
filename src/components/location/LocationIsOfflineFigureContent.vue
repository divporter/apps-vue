<script>
import Vue from "vue"
export default Vue.extend({})
</script>

<template>
  <figure class="ob-figure">
    <div class="figure-content has-text-centered">
      <h4 class="title is-4">You are currently offline</h4>
      <slot></slot>
    </div>
  </figure>
</template>

<style scoped>
.figure-content .title {
  font-weight: 200;
  line-height: 1.125;
  font-family: BlinkMacSystemFont, -apple-system, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    "Helvetica", "Arial", sans-serif !important;
}

.is-4 {
  font-size: 1.5rem !important;
}
</style>
