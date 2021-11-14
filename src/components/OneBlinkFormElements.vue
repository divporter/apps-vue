<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"
import {
  FormElementValidation,
  FormElementConditionallyShown,
  FormElementValueChangeHandler,
  FormElementLookupHandler,
} from "../types/form"
export default Vue.extend({
  props: {
    formId: Number,
    element: Object as PropType<FormTypes.FormElement>,
    value: { required: true },
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
})
</script>

<template>
  <div></div>
</template>
