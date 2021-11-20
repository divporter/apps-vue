<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"
import {
  FormElementConditionallyShown,
  FormElementsValidation,
} from "../types/form"
import OneBlinkFormElements from "@/components/OneBlinkFormElements.vue"

export default Vue.extend({
  components: {
    OneBlinkFormElements,
  },
  props: {
    formId: Number,
    isActive: Boolean,
    pageElement: Object as PropType<FormTypes.PageElement>,
    model: Object as PropType<Record<string, unknown>>,
    formElementsConditionallyShown: Object as PropType<
      Record<string, FormElementConditionallyShown>
    >,
    formElementsValidation: {
      type: Object as PropType<FormElementsValidation>,
      required: false,
    },
  },
  methods: {
    updateSubmission(newSubmission: Record<string, unknown>) {
      this.$emit("updateSubmission", newSubmission)
    },
  },
})
</script>

<template>
  <div>
    <OneBlinkFormElements
      v-show="isActive"
      :formId="formId"
      :elements="pageElement.elements"
      :model="model"
      :formElementsConditionallyShown="formElementsConditionallyShown"
      :formElementsValidation="formElementsValidation"
      @updateSubmission="updateSubmission"
    />
  </div>
</template>
