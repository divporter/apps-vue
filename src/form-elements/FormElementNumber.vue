<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"

export default Vue.extend({
  props: {
    id: String,
    element: Object as PropType<FormTypes.NumberElement>,
    value: { required: true },
    displayValidationMessage: Boolean,
    validationMessage: { type: String, required: false },
  },
  methods: {
    updateSubmission(input: string) {
      this.$emit("updateSubmission", {
        name: this.element.name,
        value: input || undefined,
      })
    },
  },
  computed: {
    showSlider() {
      return (
        this.element.isSlider &&
        this.element.minNumber &&
        this.element.maxNumber
      )
    },
  },
})

/* TODO 
  conditionally show
  required
  data look up
  element look up
  default value
  min, max
  regex
  only allow whole numbers
*/
</script>

<template>
  <div>
    <v-text-field
      v-if="!showSlider"
      outlined
      type="number"
      :label="element.label"
      :value="value"
      @input="updateSubmission"
      :disabled="element.readOnly"
      :placeholder="element.placeholderValue"
    />
    <v-slider
      v-if="showSlider"
      :label="element.label"
      :value="value"
      @change="updateSubmission"
      :disabled="element.readOnly"
      :placeholder="element.placeholderValue"
      :min="element.minNumber"
      :max="element.maxNumber"
    />
  </div>
</template>
