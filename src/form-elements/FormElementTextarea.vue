<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"

export default Vue.extend({
  props: {
    id: String,
    element: Object as PropType<FormTypes.TextareaElement>,
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
})

/* TODO 
  conditionally show
  required
  data look up
  element look up
  default value
  min, max
  regex
*/
</script>

<template>
  <v-textarea
    outlined
    :label="element.label"
    :value="value"
    @input="updateSubmission"
    :disabled="element.readOnly"
    :placeholder="element.placeholderValue"
  />
</template>
