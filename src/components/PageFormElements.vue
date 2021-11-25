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
    isActive: Boolean,
    definition: Object as PropType<FormTypes.Form>,
    pageElement: Object as PropType<FormTypes.PageElement>,
    model: Object as PropType<Record<string, unknown>>,
    formElementsConditionallyShown: Object as PropType<
      Record<string, FormElementConditionallyShown>
    >,
    formElementsValidation: {
      type: Object as PropType<FormElementsValidation>,
      required: false,
    },
    displayValidationMessages: Boolean,
  },
  methods: {
    updateSubmission(newSubmission: Record<string, unknown>): void {
      this.$emit("updateSubmission", newSubmission)
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
      this.updateSubmission(submission)
      //TODO function to update definition
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
      v-show="isActive"
      :definition="definition"
      :elements="pageElement.elements"
      :model="model"
      :formElementsConditionallyShown="formElementsConditionallyShown"
      :formElementsValidation="formElementsValidation"
      :displayValidationMessages="displayValidationMessages"
      @updateSubmission="updateSubmission"
    />
  </div>
</template>
