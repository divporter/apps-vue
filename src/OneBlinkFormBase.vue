<script lang="ts">
// export type BaseProps = {
//   onCancel: () => unknown
//   onSubmit: (newFormSubmission: submissionService.NewFormSubmission) => unknown
//   disabled?: boolean
//   isPreview?: boolean
//   googleMapsApiKey?: string
//   captchaSiteKey?: string
//   buttons?: FormsAppsTypes.FormsListStyles["buttons"]
//   primaryColour?: string
//   onSaveDraft?: (
//     newDraftSubmission: submissionService.NewDraftSubmission
//   ) => unknown
// }

// export type ControlledProps = {
//   definition: FormTypes.Form
//   submission: FormSubmissionModel
//   setFormSubmission: SetFormSubmission
// }
import Vue, { PropType } from "vue"
import { Component, ProvideReactive } from "vue-property-decorator"
import { FormTypes } from "@oneblink/types"
import { localisationService } from "@oneblink/apps"
import { Fragment } from "vue-frag"

import PageFormElements from "@/components/PageFormElements.vue"
import NavigationStep from "@/components/NavigationStep.vue"

import generateFormElementsConditionallyShown from "./services/generate-form-elements-conditionally-shown"
import {
  validateSubmission,
  generateValidationSchema,
  checkSectionValidity,
} from "./services/form-validation"

import {
  FormElementsValidation,
  FormElementsConditionallyShown,
  // FormElementValueChangeHandler,
  // FormSubmissionModel,
  // SetFormSubmission,
} from "./types/form"

import eventBus from "@/services/event-bus"

type DataProps = {
  currentPageId?: string
  isStepsHeaderActive: boolean
  visitedPageIds: string[]
  hasAttemptedSubmit: boolean
  elementIdsWithLookupsExecuted: string[]
}

const OneBlinkFormBaseBase = Vue.extend({
  components: {
    PageFormElements,
    NavigationStep,
    Fragment,
  },
  props: {
    definition: Object as PropType<FormTypes.Form>,
    submission: Object as PropType<Record<string, unknown>>,
    isReadOnly: Boolean,
  },
  data(): DataProps {
    return {
      currentPageId: undefined,
      isStepsHeaderActive: false,
      visitedPageIds: [],
      hasAttemptedSubmit: false,
      elementIdsWithLookupsExecuted: [],
    }
  },
  mounted() {
    this.setPageId(this.pages[0].id)

    eventBus.$on("OneBlinkFormBase-executedLookup", (id: string) => {
      if (!this.elementIdsWithLookupsExecuted.includes(id)) {
        this.elementIdsWithLookupsExecuted.push(id)
      }
    })

    eventBus.$on("OneBlinkFormBase-executeLookupFailed", (id: string) => {
      this.elementIdsWithLookupsExecuted =
        this.elementIdsWithLookupsExecuted.filter(
          (elementId) => elementId === id
        )
    })
  },
  beforeDestroy() {
    eventBus.$off("OneBlinkFormBase-executedLookup")
    eventBus.$off("OneBlinkFormBase-executeLookupFailed")
  },
  methods: {
    updateSubmission(newSubmission: Record<string, unknown>) {
      this.$emit("updateSubmission", newSubmission)
    },
    toggleStepsNavigation() {
      this.isStepsHeaderActive = !this.isStepsHeaderActive
    },
    setPageId(pageId: string) {
      if (
        this.currentPageId &&
        !this.visitedPageIds.includes(this.currentPageId)
      ) {
        this.visitedPageIds = [...this.visitedPageIds, this.currentPageId]
      }
      this.currentPageId = pageId
      this.isStepsHeaderActive = false
      if (
        this.isShowingMultiplePages &&
        this.$refs.scrollToTopOfPageHTMLElementRef
      ) {
        window.requestAnimationFrame(() => {
          if (this.$refs.scrollToTopOfPageHTMLElementRef instanceof Element)
            this.$refs.scrollToTopOfPageHTMLElementRef.scrollIntoView({
              block: "start",
              behavior: "smooth",
            })
        })
      }
    },
    checkDisplayPageError(page: FormTypes.PageElement) {
      // If we have not visited the page yet, we will not display errors
      if (!this.visitedPageIds.includes(page.id)) {
        return false
      }

      return checkSectionValidity(page, this.formElementsValidation)
    },
    formatDatetimeLong: localisationService.formatDatetimeLong,
  },
  computed: {
    pages(): Array<FormTypes.PageElement> {
      if (this.definition.isMultiPage) {
        return this.definition.elements.reduce(
          (
            pageElements: FormTypes.PageElement[],
            formElement: FormTypes.FormElement
          ) => {
            if (formElement.type === "page") {
              pageElements.push(formElement)
            }
            return pageElements
          },
          []
        )
      } else {
        return [
          {
            type: "page",
            id: this.definition.id.toString(),
            label: this.definition.name,
            elements: this.definition.elements,
            conditionallyShow: false,
            requiresAllConditionallyShowPredicates: false,
          },
        ]
      }
    },
    formElementsConditionallyShownResult(): {
      formElementsConditionallyShown: FormElementsConditionallyShown
      conditionalLogicError?: Error
    } {
      return generateFormElementsConditionallyShown(
        this.definition.elements,
        this.submission,
        undefined
      )
    },
    formElementsConditionallyShown(): FormElementsConditionallyShown {
      return this.formElementsConditionallyShownResult
        .formElementsConditionallyShown
    },
    conditionalLogicError(): Error | undefined {
      return this.formElementsConditionallyShownResult.conditionalLogicError
    },
    visiblePages(): Array<FormTypes.PageElement> {
      return this.pages.filter(
        (pageElement) =>
          !this.formElementsConditionallyShown?.[pageElement.id]?.isHidden
      )
    },
    currentPage(): FormTypes.PageElement {
      const currentPageById = this.visiblePages.find((pageElement) => {
        return pageElement.id === this.currentPageId
      })
      if (currentPageById) {
        return currentPageById
      } else {
        return this.visiblePages[0]
      }
    },
    currentPageIndex(): number {
      return this.visiblePages.indexOf(this.currentPage)
    },
    currentPageNumber(): number | undefined {
      if (this.currentPage) {
        return this.visiblePages.indexOf(this.currentPage) + 1
      }
      return undefined
    },
    isShowingMultiplePages(): boolean {
      return this.visiblePages.length > 1
    },

    validationSchema(): Record<string, unknown> {
      return generateValidationSchema(
        this.pages,
        this.elementIdsWithLookupsExecuted
      )
    },
    formElementsValidation(): FormElementsValidation | undefined {
      return validateSubmission(
        this.validationSchema,
        this.submission,
        this.formElementsConditionallyShown
      )
    },
    isDisplayingCurrentPageError(): boolean {
      return this.checkDisplayPageError(this.currentPage)
    },
    computedIsReadOnly(): boolean {
      return this.isReadOnly
    },
  },
})

@Component
export default class OneBlinkFormBase extends OneBlinkFormBaseBase {
  //@ts-expect-error dun worry about it
  @ProvideReactive() definition: FormTypes.Form = this.definition
  @ProvideReactive() formIsReadOnly: boolean = this.isReadOnly
}
</script>

<template>
  <Fragment>
    <div v-if="conditionalLogicError" class="has-text-centered">
      <i class="material-icons has-text-warning icon-x-large">error</i>
      <h3 class="title is-3">Bad Form Configuration</h3>
      <p class="cypress-conditional-logic-error-message">
        {{ conditionalLogicError.message }}
      </p>
      <p class="has-text-grey">
        {{ formatDatetimeLong(new Date()) }}
      </p>
    </div>
    <!-- TODO loadDynamicOptionsState -->
    <div class="ob-form-container" ref="obFormContainerHTMLElementRef">
      <form
        name="obForm"
        :class="[
          'ob-form',
          'cypress-ob-form',
          'ob-form__page' + (currentPageIndex + 1),
        ]"
        noValidate
        onSubmit="handleSubmit"
      >
        <div>
          <div ref="scrollToTopOfPageHTMLElementRef" />
          <div
            v-if="isShowingMultiplePages"
            :class="{
              'ob-steps-navigation': true,
              'is-active': isStepsHeaderActive,
            }"
          >
            <div
              :class="{
                'ob-steps-navigation__header': true,
                'is-active': isStepsHeaderActive,
              }"
              @click="toggleStepsNavigation"
            >
              <span class="icon is-invisible">
                <i class="material-icons">keyboard_arrow_down</i>
              </span>
              <div class="steps-header-active-page">
                <span v-if="isDisplayingCurrentPageError" class="icon">
                  <i class="material-icons has-text-danger is-size-4">
                    warning
                  </i>
                </span>

                <span v-else class="steps-header-active-page-icon">
                  {{ currentPageNumber }}
                </span>
                <span
                  class="
                    steps-header-active-page-label
                    cypress-tablet-step-title
                  "
                >
                  {{ currentPage ? currentPage.label : "" }}
                </span>
              </div>
              <span class="dropdown icon">
                <i class="material-icons">keyboard_arrow_down</i>
              </span>
            </div>
            <!-- navigation steps in here -->
            <div
              :class="{
                'ob-steps-navigation__steps': true,
                'is-active': isStepsHeaderActive,
              }"
            >
              <div class="steps is-small is-horizontal-tablet cypress-steps">
                <NavigationStep
                  v-for="(page, index) of visiblePages"
                  :key="page.id"
                  :page="page"
                  :currentPage="currentPage"
                  :currentPageIndex="currentPageIndex"
                  :index="index"
                  :hasErrors="checkDisplayPageError(page)"
                  @setPageId="setPageId"
                />
              </div>
            </div>
          </div>
          <div
            :class="{
              'ob-steps-navigation__background': true,
              'is-active': isStepsHeaderActive,
            }"
            @click="
              {
                toggleStepsNavigation
              }
            "
          />
        </div>
        <div className="steps">
          <div
            :class="{
              'steps-content': true,
              'is-single-step': !isShowingMultiplePages,
            }"
          >
            <PageFormElements
              v-for="page of pages"
              :key="page.id"
              :definition="definition"
              :pageElement="page"
              :model="submission"
              :isActive="page.id === currentPageId"
              :formElementsConditionallyShown="formElementsConditionallyShown"
              :formElementsValidation="formElementsValidation"
              :displayValidationMessages="
                hasAttemptedSubmit || isDisplayingCurrentPageError
              "
              @updateSubmission="updateSubmission"
            />
          </div>
          <!-- next/previous buttons go here -->
        </div>
      </form>
    </div>
  </Fragment>
</template>
