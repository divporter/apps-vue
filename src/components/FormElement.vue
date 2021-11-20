<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"
import {
  FormElementValidation,
  FormElementConditionallyShown,
} from "../types/form"

import FormElementText from "@/form-elements/FormElementText.vue"
import FormElementTextarea from "@/form-elements/FormElementTextarea.vue"
import FormElementNumber from "@/form-elements/FormElementNumber.vue"
import FormElementRadio from "@/form-elements/FormElementRadio.vue"
import FormElementCheckBoxes from "@/form-elements/FormElementCheckBoxes.vue"

export default Vue.extend({
  components: {
    FormElementText,
    FormElementTextarea,
    FormElementNumber,
    FormElementRadio,
    FormElementCheckBoxes,
  },
  props: {
    formId: Number,
    element: Object as PropType<FormTypes.FormElement>,
    value: { required: false },
    formElementValidation: {
      type: String as PropType<FormElementValidation>,
      required: false,
    },
    displayValidationMessage: Boolean,
    formElementConditionallyShown: {
      type: Object as PropType<FormElementConditionallyShown>,
      required: false,
    },
    id: String,
    isEven: { type: Boolean, required: false },
  },
  methods: {
    updateSubmission({
      name,
      value,
    }: {
      name: string
      value: string | undefined
    }) {
      this.$emit("updateSubmission", {
        [name]: value,
      })
    },
  },
  computed: {
    validationMessage() {
      return this.formElementValidation &&
        typeof this.formElementValidation === "string"
        ? this.formElementValidation
        : undefined
    },
  },
})
</script>

<template>
  <div>
    <FormElementText
      :key="element.id"
      v-if="element.type === 'text'"
      :element="element"
      :value="value"
      :validationMessage="validationMessage"
      @updateSubmission="updateSubmission"
    />
    <FormElementTextarea
      :key="element.id"
      v-if="element.type === 'textarea'"
      :element="element"
      :value="value"
      @updateSubmission="updateSubmission"
    />
    <FormElementNumber
      :key="element.id"
      v-if="element.type === 'number'"
      :element="element"
      :value="value"
      @updateSubmission="updateSubmission"
    />
    <FormElementRadio
      :key="element.id"
      v-if="element.type === 'radio'"
      :element="element"
      :value="value"
      @updateSubmission="updateSubmission"
    />
    <FormElementCheckBoxes
      :key="element.id"
      v-if="element.type === 'checkboxes'"
      :element="element"
      :value="value"
      @updateSubmission="updateSubmission"
    />
  </div>
</template>
