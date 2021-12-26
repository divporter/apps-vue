<script lang="ts">
import Vue from "vue"

export default Vue.extend({
  props: {
    icon: { type: String, required: true },
    isActive: Boolean,
    disabled: Boolean,
  },
  methods: {
    onClick() {
      this.$emit("click")
    },
  },
})
</script>

<template>
  <button
    :disabled="disabled"
    type="button"
    :class="{
      button: true,
      'ob-button__compliance': true,
      'is-primary': isActive,
      'is-light': !isActive,
    }"
    @click="onClick"
  >
    <i class="material-icons is-size-5 ob-button__compliance-icon">
      {{ icon }}
    </i>
    <slot></slot>
  </button>
</template>
