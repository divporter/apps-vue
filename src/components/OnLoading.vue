<script lang="ts">
import Vue from "vue"

export default Vue.extend({
  props: {
    className: String,
    small: Boolean,
    large: Boolean,
    tiny: Boolean,
  },
})
</script>

<template>
  <on-loading :class="className">
    <div
      :class="{
        'ob-loading': true,
        'on-loading': true,
        small: this.small,
        large: this.large,
        tiny: this.tiny,
      }"
    />
  </on-loading>
</template>
