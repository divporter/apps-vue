<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"

export default Vue.extend({
  props: {
    id: String,
    element: Object as PropType<FormTypes.RadioButtonElement>,
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
  display as buttons
  conditional options
  option set
*/
</script>

<template>
  <v-radio-group
    outlined
    :label="element.label"
    value="value"
    @change="updateSubmission"
    :disabled="element.readOnly"
  >
    <v-radio
      v-for="option in element.options"
      :key="option.id"
      :label="option.label"
      :value="option.value"
    />
  </v-radio-group>
</template>
