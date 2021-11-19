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
    updateSubmission(input: string[]) {
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
  enable toggle all
  conditional options
  option set
*/
</script>

<template>
  <div>
    <v-checkbox
      v-for="option of element.options"
      :key="option.id"
      :label="option.label"
      :value="option.value"
      :input-value="value || []"
      @change="updateSubmission"
    />
  </div>
</template>
