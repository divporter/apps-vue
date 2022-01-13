<script lang="ts">
import Vue, { PropType } from "vue"
import { Component, InjectReactive, Watch } from "vue-property-decorator"
import { localisationService } from "@oneblink/apps"

import flattenFormElements from "@/services/flattenFormElements"
import { FormTypes } from "@oneblink/types"
import { FormSubmissionModel } from "@/types/form"
import { generateDate } from "../services/generate-default-data"

import SummaryResult from "@/components/SummaryResult.vue"

type FormElementSummaryResults = Array<string | FormElementSummaryResults>

const FormElementSummaryBase = Vue.extend({
  components: {
    SummaryResult,
  },
  props: {
    id: { type: String, required: true },
    element: {
      type: Object as PropType<FormTypes.SummaryElement>,
      required: true,
    },
    value: { required: true },
  },
  methods: {
    updateSubmission(value: unknown) {
      this.$emit("updateSubmission", { name: this.element.name, value })
    },
    arraysAreEqual(a: unknown[], b: unknown[]) {
      if (!Array.isArray(a) || !Array.isArray(b)) {
        if (a !== b) return false
        return true
      }
      if (a.length !== b.length) return false

      for (let i = 0; i < a.length; i++) {
        if (Array.isArray(a[i]) && Array.isArray(b[i])) {
          const areEqual = this.arraysAreEqual(a[i], b[i])
          if (!areEqual) return false
          continue
        }
        if (a[i] !== b[i]) return false
      }
      return true
    },
    reducer(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      partialSummary: Array<any>,
      formElement: FormTypes.FormElement,
      submission: FormSubmissionModel
    ) {
      if (formElement.type === "page") return partialSummary
      if (
        formElement.type !== "repeatableSet" &&
        formElement.type !== "form" &&
        !this.element.elementIds.some(
          (elementId) => elementId === formElement.id
        )
      ) {
        return partialSummary
      }

      const formElementValue =
        "name" in formElement ? submission[formElement.name] : undefined
      if (!formElementValue && formElementValue !== 0) {
        return partialSummary
      }

      switch (formElement.type) {
        case "repeatableSet": {
          if (!Array.isArray(formElementValue)) return partialSummary
          // If we found a repeatable set, look through child elements
          // to find the summary elements. Need to start a new array for
          // this structure and look at each entry in the repeatable set
          for (const entry of formElementValue) {
            const repeatableSetSummaryValues: Array<unknown> =
              formElement.elements.reduce(
                (
                  partialSummary: FormElementSummaryResults,
                  formElement: FormTypes.FormElement
                ) =>
                  this.reducer(
                    partialSummary,
                    formElement,
                    // Pleasing TypeScript
                    entry instanceof Object ? entry : {}
                  ),
                []
              )
            if (repeatableSetSummaryValues.length) {
              partialSummary.push(repeatableSetSummaryValues)
            }
          }
          break
        }
        case "form": {
          const formSummaryValues = (formElement.elements || []).reduce(
            (
              partialSummary: FormElementSummaryResults,
              formElement: FormTypes.FormElement
            ) =>
              this.reducer(
                partialSummary,
                formElement,
                // @ts-expect-error instanceof Object is ok
                formElementValue instanceof Object ? formElementValue : {}
              ),
            []
          )
          if (formSummaryValues.length) {
            partialSummary.push(formSummaryValues)
          }

          break
        }
        case "select":
        case "autocomplete":
        case "radio":
        case "checkboxes": {
          const optionValues = []
          if (Array.isArray(formElementValue)) {
            optionValues.push(...formElementValue)
          } else {
            optionValues.push(formElementValue)
          }
          if (Array.isArray(formElement.options)) {
            partialSummary.push(
              ...optionValues.reduce((optionLabels, optionValue) => {
                if (!formElement.options) {
                  return optionLabels
                }
                const option = formElement.options.find(
                  ({ value }: FormTypes.ChoiceElementOption) =>
                    optionValue === value
                )
                if (option) {
                  optionLabels.push(option.label)
                }
                return optionLabels
              }, [])
            )
          }
          break
        }
        case "date": {
          const date = generateDate({
            daysOffset: undefined,
            value: formElementValue as string,
            dateOnly: true,
          })
          if (date) {
            partialSummary.push(localisationService.formatDate(date))
          }
          break
        }
        case "datetime": {
          if (typeof formElementValue !== "string") return partialSummary
          partialSummary.push(
            localisationService.formatDatetime(new Date(formElementValue))
          )
          break
        }
        case "time": {
          if (typeof formElementValue !== "string") return partialSummary
          partialSummary.push(
            localisationService.formatTime(new Date(formElementValue))
          )
          break
        }
        default: {
          // Pleasing TypeScript WHILE COVERING ALL BASES
          if (
            typeof formElementValue !== "string" &&
            typeof formElementValue !== "object" &&
            typeof formElementValue !== "number" &&
            typeof formElementValue !== "function" &&
            typeof formElementValue !== "boolean"
          ) {
            return partialSummary
          }

          if (formElementValue) {
            partialSummary.push(formElementValue.toString())
          }
        }
      }
      return partialSummary
    },
  },
})

@Component
export default class FormElementSummary extends FormElementSummaryBase {
  @InjectReactive() readonly submission!: Record<string, unknown>
  @InjectReactive() readonly definition!: FormTypes.Form

  get flattenedElements() {
    return flattenFormElements(this.definition.elements)
  }

  @Watch("submission", { immediate: true })
  onSubmissionChange() {
    const summary = this.flattenedElements.reduce(
      (partialSummary: Array<unknown>, formElement) => {
        return this.reducer(partialSummary, formElement, this.submission)
      },
      []
    )

    if (this.value === undefined) {
      if (!summary.length) return
    }
    if (this.arraysAreEqual(this.value as FormElementSummaryResults, summary)) {
      return
    }
    if (summary.length) {
      this.updateSubmission(summary)
      // onChange(element, summary)
    } else {
      this.updateSubmission(undefined)
    }
  }
}
</script>

<template>
  <div class="ob-form__element ob-summary cypress-summary-result">
    <SummaryResult
      v-if="!!value && Array.isArray(value)"
      :results="value"
    ></SummaryResult>
  </div>
</template>
