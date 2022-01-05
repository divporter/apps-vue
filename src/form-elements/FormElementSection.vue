<script lang="ts">
import Vue, { PropType } from "vue"
import { Component, Watch, Inject } from "vue-property-decorator"
import { FormTypes } from "@oneblink/types"
import { TippyComponent } from "vue-tippy"

import { checkSectionValidity } from "../services/form-validation"
import {
  FormElementsValidation,
  FormElementConditionallyShown,
} from "../types/form"
import { MergeLookupResults, LookupCallback } from "../types/lookups"

type DataProps = {
  isDisplayingError: boolean
  expanded: boolean
  wrapperSize: string
}

const FormElementSectionBase = Vue.extend({
  components: {
    tippy: TippyComponent,
  },
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
      expanded: !this.element.isCollapsed,
      wrapperSize: "auto",
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
      return !this.expanded
    },
  },
  methods: {
    updateSubmission(event: {
      newSubmission: Record<string, unknown>
      element: FormTypes.FormElement
    }): void {
      this.$emit("updateSubmission", event)
    },
    setWrapperSize() {
      // await Vue.nextTick()
      let wrapperSize = 0
      if (this.$refs.section) {
        wrapperSize = (this.$refs.section as HTMLDivElement).clientHeight
      }
      this.wrapperSize = `${wrapperSize}px`
    },
    transitionEnd() {
      if (!this.isCollapsed) {
        this.wrapperSize = "auto"
      }
    },
  },
  mounted() {
    Vue.nextTick().then(this.setWrapperSize)
    // this.setWrapperSize()
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

    if (newValue) {
      this.wrapperSize = "0px"
    } else {
      this.setWrapperSize()
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
    <ui-collapse v-model="expanded">
      <template v-slot:toggle>
        <div>
          <div class="ob-section__header cypress-section-header">
            <h3 class="ob-section__header-text title is-3">
              {{ element.label }}
              <tippy
                v-if="element.label && element.hint"
                arrow
                theme="google"
                size="large"
                placement="bottom"
              >
                <template v-slot:trigger>
                  <i class="material-icons has-text-grey-light ob-label__hint">
                    info
                  </i>
                </template>
                {{ element.hint }}
              </tippy>
            </h3>
            <div class="ob-section__header-icon-container">
              <tippy
                v-if="isInvalid"
                arrow
                theme="google"
                size="large"
                placement="bottom"
              >
                <template v-slot:trigger>
                  <i
                    class="
                      material-icons
                      has-text-danger
                      cypress-section-invalid-icon
                      section-invalid-icon
                      fade-in
                    "
                  >
                    warning
                  </i>
                </template>
                <span>Section has errors</span>
              </tippy>

              <i
                :class="{
                  'ob-section__header-icon': true,
                  'material-icons': true,
                  'is-rotated': !isCollapsed,
                }"
              >
                expand_more
              </i>
            </div>
          </div>
          <hr class="ob-section__divider" />
        </div>
      </template>
    </ui-collapse>

    <div
      :style="{
        height: wrapperSize,
        '--wrapper-size': wrapperSize,
        'min-height': '0px',
        overflow: 'hidden',
      }"
      :class="{
        'ob-section__content': true,
        'ob-section__expanded': !isCollapsed,
        'ob-section__collapsed': isCollapsed,
      }"
      @transitionend="transitionEnd"
    >
      <div ref="section">
        <OneBlinkFormElements
          :model="model"
          :formElementsConditionallyShown="formElementsConditionallyShown"
          :formElementsValidation="formElementsValidation"
          :displayValidationMessages="displayValidationMessage"
          :elements="element.elements"
          :idPrefix="idPrefix"
          @updateSubmission="updateSubmission"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.mdc-collapse /deep/ .mdc-collapse__header,
.mdc-collapse /deep/ .mdc-collapse__title {
  width: 100%;
}

.mdc-collapse /deep/ .mdc-collapse__content {
  display: none;
}

.ob-section__content {
  transition: height 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
}
</style>
