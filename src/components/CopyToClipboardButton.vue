<script lang="ts">
import Vue from "vue"
import utilsService from "../services/utils-service"

export default Vue.extend({
  props: {
    text: { type: String, required: true },
    className: { type: String, required: false },
    isInputButton: { type: Boolean, required: false },
  },
  methods: {
    copy() {
      utilsService.copyToClipboard(this.text)
    },
  },
})
</script>

<template>
  <button @click="copy" :class="className" type="button">
    <span></span>
    <span class="icon">
      <i class="material-icons">file_copy</i>
    </span>
    <span :class="{ 'is-hidden-mobile': isInputButton }"> &nbsp;Copy </span>
  </button>
</template>
