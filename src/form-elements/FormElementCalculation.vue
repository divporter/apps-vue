<script lang="ts">
import Vue, { PropType } from "vue"
import { Component, Watch, InjectReactive } from "vue-property-decorator"

import ExpressionParser from "morph-expressions"
import escapeString from "escape-string-regexp"
import sanitizeHtmlStandard from "../services/sanitize-html"
import { FormTypes } from "@oneblink/types"
import { localisationService, Sentry } from "@oneblink/apps"
import { FormSubmissionModel } from "../types/form"

const FormElementCalculationBase = Vue.extend({
  props: {
    value: { required: true },
    element: {
      type: Object as PropType<FormTypes.CalculationElement>,
      required: true,
    },
  },
  computed: {
    htmlValue(): string {
      let htmlTemplate

      if (!isNaN(this.value as number)) {
        htmlTemplate = this.element.defaultValue
      } else {
        console.log(
          "[Calculation] Was not a number... setting pre-calculation display"
        )
        htmlTemplate = this.element.preCalculationDisplay
      }

      const numberValue = typeof this.value === "number" ? this.value : 0
      return sanitizeHtmlStandard(
        (htmlTemplate || "").replace(
          /{result}/gi,
          this.element.displayAsCurrency
            ? localisationService.formatCurrency(numberValue)
            : localisationService.formatNumber(numberValue)
        )
      )
    },
    calculationResult(): { calculation: unknown; hasError: boolean } {
      const exprParser = new ExpressionParser()
      exprParser.registerFunction(
        "ROUND",
        (value: number, precision: number) => {
          if (!Number.isNaN(value) && Number.isFinite(value)) {
            return parseFloat(value.toFixed(precision))
          }
          return null
        }
      )
      exprParser.registerFunction(
        "ISNULL",
        (value: unknown | undefined, defaultValue: number) => {
          if (this.isUnenteredValue(value)) {
            return defaultValue || 0
          }
          return value
        }
      )

      try {
        if (!this.element.calculation) {
          throw new Error("Element has no calculation.")
        }
        let matches
        const elementNames = []
        const re = /({ELEMENT:)([^}]+)(})/g

        while ((matches = re.exec(this.element.calculation)) !== null) {
          if (matches) {
            elementNames.push(matches[2])
          }
        }

        const code = elementNames.reduce((code, elementName, index) => {
          const regex = new RegExp(
            escapeString(`{ELEMENT:${elementName}}`),
            "g"
          )
          const replacement = `a${index}`
          this.registerProperty(exprParser, {
            replacement,
            nestedElementNames: elementName.split("|"),
          })
          return code.replace(regex, replacement)
        }, this.element.calculation || "")

        return {
          calculation: exprParser.parse(code.trim()),
          hasError: false,
        }
      } catch (e) {
        console.warn(
          "Error while setting up parsing for calculation element",
          this.element,
          e
        )
        Sentry.captureException(e)
        return {
          calculation: null,
          hasError: true,
        }
      }
    },
    calculation(): unknown {
      return this.calculationResult.calculation
    },
    hasError(): boolean {
      return this.calculationResult.hasError
    },
  },
  methods: {
    isUnenteredValue(value: unknown): boolean {
      return !value && value !== 0
    },
    registerProperty(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      exprParser: any,
      {
        replacement,
        nestedElementNames,
      }: {
        replacement: string
        nestedElementNames: string[]
      }
    ) {
      exprParser.registerProperty(
        replacement,
        (submission: FormSubmissionModel) => {
          const defaultAccumulator = submission[nestedElementNames[0]]

          return nestedElementNames.reduce(
            (
              elementValue: unknown | undefined,
              elementName: string,
              index: number
            ) => {
              // Numbers can just be returned as is
              if (typeof elementValue === "number") {
                return elementValue
              }

              // attempt to get a number from the element value as a string.
              // NaN is accounted for is the calculation
              // so we can return that from here
              if (typeof elementValue === "string") {
                return parseFloat(elementValue)
              }

              if (Array.isArray(elementValue)) {
                // If there are no entries, we can return null
                // to prevent the calculation from running.
                if (!elementValue.length) {
                  return NaN
                }

                // An array could be an element that allows multiple
                // values e.g. checkboxes. If thats that case, we just
                // add them all together and move on
                const elementValues = elementValue.map((entry) =>
                  parseFloat(entry)
                )
                if (elementValues.every((entry) => !Number.isNaN(entry))) {
                  return elementValues.reduce(
                    (number, entry) => number + entry,
                    0
                  )
                }

                // Other wise attempt to process it as a repeatable set
                // If we found another repeatable set to process,
                // pass it to the next element name to
                // iterate over the entries

                // If we are processing the entries in a repeatable set,
                // we can sum the numbers elements in the entries
                const nextElementName = nestedElementNames[index + 1]

                let isNestedRepeatableSet = false
                const nestedElementValues = elementValue.reduce(
                  (nestedElementValues, entry) => {
                    if (entry) {
                      const nextElementValue = entry[nextElementName]
                      if (Array.isArray(nextElementValue)) {
                        if (nextElementValue.length) {
                          nestedElementValues.push(...nextElementValue)
                          isNestedRepeatableSet = true
                        }
                      } else {
                        nestedElementValues.push(nextElementValue)
                      }
                    }
                    return nestedElementValues
                  },
                  []
                )

                // If the nested element values are all arrays, we can pass them on to the next iteration
                if (isNestedRepeatableSet) {
                  return nestedElementValues
                }

                return nestedElementValues.reduce(
                  (total: number, nestedElementValue: unknown | undefined) => {
                    if (Number.isNaN(total)) {
                      return NaN
                    }
                    const value = parseFloat(nestedElementValue as string)
                    if (Number.isNaN(value)) {
                      return NaN
                    }
                    return total + value
                  },
                  0
                )
              }

              // We did not find a number value from the known elements,
              // we will assume we are at the end of the line.
              return NaN
            },
            defaultAccumulator
          )
        }
      )
    },
    updateSubmission(input: unknown | undefined) {
      this.$emit("updateSubmission", {
        name: this.element.name,
        value: input !== undefined ? input : undefined,
      })
    },
    recalculate() {
      if (!this.calculation) return
      //@ts-expect-error not typed unfortunately
      const newValue = this.calculation.eval(this.formSubmissionModel)
      if (
        this.value === newValue ||
        (this.value === undefined && isNaN(newValue))
      ) {
        return
      }
      if (!isNaN(newValue)) {
        this.updateSubmission(newValue)
      } else {
        this.updateSubmission(undefined)
      }
    },
  },
})

@Component
export default class FormElementCalculation extends FormElementCalculationBase {
  @InjectReactive() readonly submission!: Record<string, unknown>

  get formSubmissionModel() {
    return this.submission
  }

  @Watch("calculation", { immediate: true })
  @Watch("formSubmissionModel", { immediate: true })
  onCalculationChange() {
    if (!this.calculation) return
    //@ts-expect-error not typed unfortunately
    const newValue = this.calculation.eval(this.formSubmissionModel)
    if (
      this.value === newValue ||
      (this.value === undefined && isNaN(newValue))
    ) {
      return
    }
    if (!isNaN(newValue)) {
      this.updateSubmission(newValue)
    } else {
      this.updateSubmission(undefined)
    }
  }
}
</script>

<template>
  <div class="cypress-calculation-element">
    <div class="ob-form__element ob-calculation">
      <div
        class="cypress-calculation-result ob-calculation__content ql-editor"
        v-html="htmlValue"
      ></div>
      <div
        v-if="hasError"
        class="notification cypress-calculation-is-invalid"
        role="alert"
      >
        <div class="columns is-vcentered">
          <div class="column is-narrow">
            <i class="material-icons has-text-warning">error</i>
          </div>
          <div class="column">
            <p>There is an error in the calculation for this element.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
