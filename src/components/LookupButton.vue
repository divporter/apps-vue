<script lang="ts">
import Vue from "vue"
import { Component, InjectReactive } from "vue-property-decorator"
import { lookupValidationMessage } from "@/services/form-validation"

type DataProps = {
  lookupValidationMessage: string
}

const LookupButtonBase = Vue.extend({
  props: {
    value: { required: false },
    validationMessage: { type: String, required: false },
    hasMarginTop: { type: Boolean, required: false },
    isInputButton: { type: Boolean, required: false },
    isDisabled: Boolean,
  },
  data(): DataProps {
    return { lookupValidationMessage }
  },
  methods: {
    handleClick() {
      this.$emit("click")
    },
  },
})

@Component
export default class LookupButton extends LookupButtonBase {
  @InjectReactive() formIsReadOnly!: boolean
}
</script>

<template>
  <button
    type="button"
    :class="{
      button: true,
      'is-primary': true,
      'ob-lookup__button': true,
      'cypress-lookup-button': true,
      'is-input-addon': isInputButton,
      'ob-button': !isInputButton,
      'has-margin-top-8': hasMarginTop,
    }"
    :disabled="
      formIsReadOnly ||
      isDisabled ||
      value === undefined ||
      (!!validationMessage && validationMessage !== lookupValidationMessage)
    "
    @click="handleClick"
  >
    <span v-if="isInputButton"></span>
    <span class="icon">
      <i class="material-icons">search</i>
    </span>
    <span :class="{ 'is-hidden-mobile': isInputButton }"> &nbsp;Lookup </span>
  </button>
</template>
