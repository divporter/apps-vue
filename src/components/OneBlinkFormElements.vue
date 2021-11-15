<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"
import {
  FormElementValidation,
  FormElementConditionallyShown,
  FormElementValueChangeHandler,
  FormElementLookupHandler,
} from "../types/form"
import FormElementText from "@/form-elements/FormElementText.vue"

export default Vue.extend({
  components: {
    FormElementText,
  },
  props: {
    formId: Number,
    elements: Array as PropType<FormTypes.FormElement[]>,
    model: Object as PropType<Record<string, unknown>>,
    formElementValidation: {
      type: Object as PropType<FormElementValidation>,
      required: false,
    },
    displayValidationMessage: Boolean,
    formElementConditionallyShown: {
      type: Object as PropType<FormElementConditionallyShown>,
      required: false,
    },
    id: String,
    isEven: { type: Boolean, required: false },
    onChange: Object as PropType<FormElementValueChangeHandler>,
    onLookup: Object as PropType<FormElementLookupHandler>,
  },
  mounted() {
    // console.log(this.element)
  },
  methods: {
    updateSubmission(input: unknown, name: string) {
      this.$emit("updateSubmission", {
        [name]: input || undefined,
      })
    },
  },
})
</script>

<template>
  <div>
    <template v-for="element of elements">
      <FormElementText
        :key="element.id"
        v-if="element.type === 'text'"
        :element="element"
        :value="model[element.name]"
        @updateSubmission="updateSubmission"
      />
    </template>
  </div>
</template>
