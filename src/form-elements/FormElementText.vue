<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"

export default Vue.extend({
  props: {
    id: String,
    element: Object as PropType<FormTypes.TextElement>,
    value: { required: true },
    displayValidationMessage: Boolean,
    validationMessage: { type: String, required: false },
  },
  methods: {
    updateSubmission(input: string) {
      this.$emit("updateSubmission", {
        [this.element.name]: input || undefined,
      })
    },
  },
})
</script>

<template>
  <v-text-field
    outlined
    :label="element.label"
    :value="value"
    @input="updateSubmission"
  />
</template>
