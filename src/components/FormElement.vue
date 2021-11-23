<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"
import {
  FormElementValidation,
  FormElementConditionallyShown,
} from "../types/form"

import LookupNotification from "@/components/LookupNotification.vue"
import FormElementText from "@/form-elements/FormElementText.vue"
import FormElementTextarea from "@/form-elements/FormElementTextarea.vue"
import FormElementNumber from "@/form-elements/FormElementNumber.vue"
import FormElementRadio from "@/form-elements/FormElementRadio.vue"
import FormElementCheckBoxes from "@/form-elements/FormElementCheckBoxes.vue"

export default Vue.extend({
  components: {
    LookupNotification,
    FormElementText,
    FormElementTextarea,
    FormElementNumber,
    FormElementRadio,
    FormElementCheckBoxes,
  },
  props: {
    element: Object as PropType<FormTypes.FormElement>,
    model: Object as PropType<Record<string, unknown>>,
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
    validationMessage(): string | undefined {
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
    <!-- TODO use a real value for formIsReadOnly -->
    <LookupNotification :element="element" :model="model">
      <template v-slot:default="{ triggerLookup }">
        <FormElementText
          :key="element.id"
          v-if="element.type === 'text'"
          :element="element"
          :value="value"
          :validationMessage="validationMessage"
          :displayValidationMessage="displayValidationMessage"
          @updateSubmission="updateSubmission"
          @triggerLookup="triggerLookup"
        />
      </template>
    </LookupNotification>
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
