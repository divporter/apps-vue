<script lang="ts">
import Vue from "vue"

export default Vue.extend({
  props: {
    label: { type: String, required: true },
    icon: String,
  },
})
</script>

<template>
  <span class="ob-customisable-button-inner">
    <i v-if="!!icon" class="material-icons">{{ icon }}</i>
    <span>{{ label }}</span>
  </span>
</template>
