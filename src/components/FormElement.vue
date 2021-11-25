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
    name: String,
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
  <div
    :key="element.id"
    class="ob-element cypress-element-container"
    :data-cypress-element-name="name"
    :data-ob-name="name"
  >
    <LookupNotification
      :element="element"
      :model="model"
      v-if="element.type === 'text'"
    >
      <template v-slot:default="{ triggerLookup, isLookup }">
        <FormElementText
          :key="element.id"
          :element="element"
          :value="value"
          :validationMessage="validationMessage"
          :displayValidationMessage="displayValidationMessage"
          :isLookup="isLookup"
          @updateSubmission="updateSubmission"
          @triggerLookup="triggerLookup"
        />
      </template>
    </LookupNotification>
    <LookupNotification
      :element="element"
      :model="model"
      v-if="element.type === 'textarea'"
    >
      <template v-slot:default="{ triggerLookup, isLookup}">
        <FormElementTextarea
          :key="element.id"
          :element="element"
          :value="value"
          :validationMessage="validationMessage"
          :displayValidationMessage="displayValidationMessage"
          :isLookup="isLookup"
          @updateSubmission="updateSubmission"
          @triggerLookup="triggerLookup"
        />
      </template>
    </LookupNotification>
    <LookupNotification
      :element="element"
      :model="model"
      v-if="element.type === 'number'"
    >
      <template v-slot:default="{ triggerLookup, isLookup }">
        <FormElementNumber
          :key="element.id"
          :element="element"
          :value="value"
          :validationMessage="validationMessage"
          :displayValidationMessage="displayValidationMessage"
          :isLookup="isLookup"
          @updateSubmission="updateSubmission"
          @triggerLookup="triggerLookup"
        />
      </template>
    </LookupNotification>
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
