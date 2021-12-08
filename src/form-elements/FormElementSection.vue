<script lang="ts">
import Vue, { PropType } from "vue"
import { Component, Watch, Inject } from "vue-property-decorator"
import { FormTypes } from "@oneblink/types"

import { checkSectionValidity } from "../services/form-validation"
import {
  FormElementsValidation,
  FormElementConditionallyShown,
} from "../types/form"
import { MergeLookupResults, LookupCallback } from "../types/lookups"

type DataProps = {
  panel: number[]
  isDisplayingError: boolean
}

const FormElementSectionBase = Vue.extend({
  components: {},
  props: {
    element: {
      type: Object as PropType<FormTypes.SectionElement>,
      required: true,
    },
    model: {
      type: Object as PropType<Record<string, unknown>>,
      required: true,
    },
    displayValidationMessages: Boolean,
    formElementsValidation: {
      type: Object as PropType<FormElementsValidation>,
      required: false,
    },
    formElementsConditionallyShown: {
      type: Object as PropType<FormElementConditionallyShown>,
      required: false,
    },
    idPrefix: {
      type: String,
      required: true,
    },
  },
  data(): DataProps {
    return {
      isDisplayingError: this.element.isCollapsed,
      panel: !this.element.isCollapsed ? [0] : [],
    }
  },
  computed: {
    displayValidationMessage(): boolean {
      return this.displayValidationMessages || this.isDisplayingError
    },
    isInvalid(): boolean {
      return (
        this.displayValidationMessage &&
        checkSectionValidity(this.element, this.formElementsValidation)
      )
    },
    isCollapsed(): boolean {
      return this.panel.length === 0
    },
  },
  methods: {
    updateSubmission(event: {
      newSubmission: Record<string, unknown>
      element: FormTypes.FormElement
    }): void {
      this.$emit("updateSubmission", event)
    },
  },
})

@Component
export default class FormElementSection extends FormElementSectionBase {
  @Inject() readonly handleLookup!: (callback: LookupCallback) => void

  beforeCreate() {
    if (this.$options.components) {
      this.$options.components.OneBlinkFormElements =
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("../components/OneBlinkFormElements.vue").default
    }
  }

  @Watch("isCollapsed")
  onIsCollapsedChange(newValue: boolean) {
    if (newValue && !this.isDisplayingError) {
      this.isDisplayingError = true
    }
  }

  handleLookupInternal(
    mergeLookupResults: ({
      submission,
      elements,
    }: MergeLookupResults) => MergeLookupResults
  ): void {
    this.handleLookup((currentFormSubmission) => {
      let model = currentFormSubmission.submission
      const elements = currentFormSubmission.elements.map((formElement) => {
        if (
          formElement.type === "section" &&
          formElement.id === this.element.id
        ) {
          const { elements, submission } = mergeLookupResults({
            elements: formElement.elements,
            submission: currentFormSubmission.submission,
          })
          model = submission
          return {
            ...formElement,
            elements,
          }
        }
        return formElement
      })

      return {
        elements,
        submission: model,
      }
    })
  }
}
</script>

<template>
  <div :class="{ 'ob-section': true, 'ob-section__invalid': isInvalid }">
    <v-expansion-panels v-model="panel" multiple>
      <v-expansion-panel>
        <v-expansion-panel-header>
          <div>
            <div class="ob-section__header cypress-section-header">
              <h3 class="ob-section__header-text title is-3">
                {{ element.label }}
                <v-tooltip v-if="element.label && element.hint" top>
                  <template v-slot:activator="{ on, attrs }">
                    <i
                      class="material-icons has-text-grey-light ob-label__hint"
                      v-bind="attrs"
                      v-on="on"
                    >
                      info
                    </i>
                  </template>
                  {{ element.hint }}
                </v-tooltip>
              </h3>
              <div class="ob-section__header-icon-container">
                <v-tooltip v-if="isInvalid" top>
                  <template v-slot:activator="{ on, attrs }">
                    <i
                      class="
                        material-icons
                        has-text-danger
                        cypress-section-invalid-icon
                        section-invalid-icon
                        fade-in
                      "
                      v-bind="attrs"
                      v-on="on"
                    >
                      warning
                    </i>
                  </template>
                  <span>Section has errors</span>
                </v-tooltip>
              </div>
            </div>
            <hr class="ob-section__divider" />
          </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content
          :class="{
            'ob-section__content': true,
            'ob-section__expanded': !isCollapsed,
            'ob-section__collapsed': isCollapsed,
          }"
        >
          <OneBlinkFormElements
            :model="model"
            :formElementsConditionallyShown="formElementsConditionallyShown"
            :formElementsValidation="formElementsValidation"
            :displayValidationMessages="displayValidationMessage"
            :elements="element.elements"
            :idPrefix="idPrefix"
            @updateSubmission="updateSubmission"
          />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<style scoped>
.title.ob-section__header-text {
  font-weight: 200;
  line-height: 1.125;
  font-family: BlinkMacSystemFont, -apple-system, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    "Helvetica", "Arial", sans-serif !important;
}

.is-3 {
  font-size: 2rem !important;
}

.v-expansion-panel-header {
  padding: 0;
}

.v-expansion-panel-content /deep/ .v-expansion-panel-content__wrap {
  padding: 0;
}

.v-expansion-panel::before {
  box-shadow: none;
}
</style>
