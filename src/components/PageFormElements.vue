<script lang="ts">
import Vue, { PropType } from "vue"
import { Component, Provide } from "vue-property-decorator"
import { FormTypes } from "@oneblink/types"
import {
  FormElementConditionallyShown,
  FormElementsValidation,
} from "../types/form"
import { MergeLookupResults } from "../types/lookups"

import OneBlinkFormElements from "@/components/OneBlinkFormElements.vue"

const PageFormElementsBase = Vue.extend({
  components: {
    OneBlinkFormElements,
  },
  props: {
    isActive: { type: Boolean, required: true },
    definition: { type: Object as PropType<FormTypes.Form>, required: true },
    pageElement: {
      type: Object as PropType<FormTypes.PageElement>,
      required: true,
    },
    model: {
      type: Object as PropType<Record<string, unknown>>,
      required: true,
    },
    formElementsConditionallyShown: {
      type: Object as PropType<Record<string, FormElementConditionallyShown>>,
      required: true,
    },
    formElementsValidation: {
      type: Object as PropType<FormElementsValidation>,
      required: false,
    },
    displayValidationMessages: Boolean,
  },
  methods: {
    updateSubmission({
      newSubmission,
    }: {
      newSubmission: Record<string, unknown>
    }): void {
      this.$emit("updateSubmission", newSubmission)
    },
    updateDefinition(newDefinition: FormTypes.Form): void {
      this.$emit("updateDefinition", newDefinition)
    },
    handleLookup(
      mergeLookupResults: ({
        submission,
        elements,
      }: MergeLookupResults) => MergeLookupResults
    ): void {
      const { submission, elements } = mergeLookupResults({
        elements: this.pageElement.elements,
        submission: this.model,
      })

      const definition = this.definition
      if (this.pageElement.id === this.definition.id.toString()) {
        definition.elements = elements
      } else {
        definition.elements = this.definition.elements.map((formElement) => {
          if (
            formElement.id === this.pageElement.id &&
            formElement.type === "page"
          ) {
            return {
              ...formElement,
              elements,
            }
          } else {
            return formElement
          }
        })
      }
      this.updateSubmission({ newSubmission: submission })
      this.updateDefinition(definition)
    },
  },
})

type LookupCallback = ({
  submission,
  elements,
}: MergeLookupResults) => MergeLookupResults

@Component
export default class PageFormElements extends PageFormElementsBase {
  @Provide() handleLookup: (callback: LookupCallback) => void =
    this.handleLookup
}
</script>

<template>
  <div
    :class="{
      'ob-page': true,
      'step-content': true,
      'is-active': true,
      'cypress-page': true,
      'is-invisible': !isActive,
    }"
  >
    <OneBlinkFormElements
      :elements="pageElement.elements"
      :model="model"
      :formElementsConditionallyShown="formElementsConditionallyShown"
      :formElementsValidation="formElementsValidation"
      :displayValidationMessages="displayValidationMessages"
      idPrefix=""
      @updateSubmission="updateSubmission"
    />
  </div>
</template>
