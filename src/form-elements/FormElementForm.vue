<script lang="ts">
import Vue, { PropType } from "vue"
import { Component, Inject } from "vue-property-decorator"
import { FormTypes } from "@oneblink/types"
import { MergeLookupResults, LookupCallback } from "../types/lookups"

import {
  FormElementConditionallyShown,
  FormElementsConditionallyShown,
  FormElementValidation,
  FormElementsValidation,
  FormSubmissionModel,
} from "../types/form"

const FormElementFormBase = Vue.extend({
  props: {
    id: { type: String, required: true },
    element: {
      type: Object as PropType<
        FormTypes.FormFormElement | FormTypes.InfoPageElement
      >,
      required: true,
    },
    value: {
      type: Object as PropType<Record<string, unknown>>,
    },
    displayValidationMessages: Boolean,
    validationMessage: { type: String, required: false },
    formElementConditionallyShown:
      Object as PropType<FormElementConditionallyShown>,
    formElementValidation: Object as PropType<FormElementValidation>,
  },
  methods: {
    updateSubmission({
      newSubmission,
      element: nestedElement,
    }: {
      newSubmission: Record<string, unknown>
      element: FormTypes.FormElement
    }): void {
      if (nestedElement.type === "page") return
      this.$emit("updateSubmission", {
        name: this.element.name,
        value: { ...this.value, ...newSubmission },
      })
    },
  },
  computed: {
    validation(): FormElementsValidation | undefined {
      return !!this.formElementValidation &&
        typeof this.formElementValidation !== "string" &&
        this.formElementValidation.type === "formElements"
        ? this.formElementValidation.formElements
        : undefined
    },
    formElementsConditionallyShown():
      | FormElementsConditionallyShown
      | undefined {
      return this.formElementConditionallyShown &&
        this.formElementConditionallyShown.type === "formElements"
        ? this.formElementConditionallyShown.formElements
        : undefined
    },
    parentElement(): { elements: FormTypes.FormElement[] } {
      return {
        elements: Array.isArray(this.element.elements)
          ? this.element.elements
          : [],
      }
    },
  },
})

@Component
export default class FormElementForm extends FormElementFormBase {
  @Inject() readonly handleLookup!: (callback: LookupCallback) => void

  beforeCreate() {
    if (this.$options.components) {
      this.$options.components.OneBlinkFormElements =
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("../components/OneBlinkFormElements.vue").default
    }
  }

  handleLookupInternal(
    mergeLookupResults: ({
      submission,
      elements,
    }: MergeLookupResults) => MergeLookupResults
  ): void {
    this.handleLookup((currentFormSubmission) => {
      let model = currentFormSubmission.submission[
        this.element.name
      ] as FormSubmissionModel
      const elements = currentFormSubmission.elements.map((formElement) => {
        if (
          formElement.type === "form" &&
          formElement.name === this.element.name &&
          Array.isArray(formElement.elements)
        ) {
          const { elements, submission } = mergeLookupResults({
            elements: formElement.elements,
            submission: model,
          })
          model = submission
          return {
            ...formElement,
            elements,
          }
        }
        return formElement
      })

      const submission = {
        ...currentFormSubmission.submission,
        [this.element.name]: model,
      }

      return {
        elements,
        submission,
      }
    })
  }
}
</script>

<template>
  <OneBlinkFormElements
    :elements="element.elements"
    :model="value || {}"
    :formElementsConditionallyShown="formElementsConditionallyShown"
    :formElementsValidation="validation"
    :displayValidationMessages="displayValidationMessages"
    idPrefix=""
    @updateSubmission="updateSubmission"
  />
</template>
