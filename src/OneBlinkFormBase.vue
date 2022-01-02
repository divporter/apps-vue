<script lang="ts">
import { PropType } from "vue"
import mixins from "vue-typed-mixins"
import {
  Component,
  ProvideReactive,
  Provide,
  Watch,
} from "vue-property-decorator"
import { FormTypes, FormsAppsTypes } from "@oneblink/types"
import { localisationService, formService } from "@oneblink/apps"
import { formElementsService } from "@oneblink/sdk-core"
import { Fragment } from "vue-frag"
import * as bulmaToast from "bulma-toast"
import _cloneDeep from "lodash.clonedeep"

import IsOfflineMixin from "@/mixins/IsOffline"

import PageFormElements from "@/components/PageFormElements.vue"
import NavigationStep from "@/components/NavigationStep.vue"
import CustomisableButtonInner from "@/components/CustomisableButtonInner.vue"
import Modal from "@/components/Modal.vue"
import OneBlinkAppsErrorOriginalMessage from "@/components/OneBlinkAppsErrorOriginalMessage.vue"

import generateFormElementsConditionallyShown from "./services/generate-form-elements-conditionally-shown"
import {
  validateSubmission,
  generateValidationSchema,
  checkSectionValidity,
} from "./services/form-validation"
import cleanFormSubmissionModel from "./services/cleanFormSubmissionModel"
import checkIfAttachmentsAreUploading from "./services/checkIfAttachmentsAreUploading"
import generateDefaultData from "./services/generate-default-data"

import {
  FormElementsValidation,
  FormElementsConditionallyShown,
  FormSubmissionModel,
  // SetFormSubmission,
} from "./types/form"

type DataProps = {
  currentPageId?: string
  isStepsHeaderActive: boolean
  visitedPageIds: string[]
  hasAttemptedSubmit: boolean
  elementIdsWithLookupsExecuted: string[]
  isDirty: boolean
  hasConfirmedNavigation: boolean | null
  isNavigationAllowed: boolean
  goToLocation: ((value: unknown) => void) | null
  loadDynamicOptionsState: formService.LoadFormElementDynamicOptionsResult | null
}

const OneBlinkFormBaseBase = mixins(IsOfflineMixin).extend({
  components: {
    PageFormElements,
    NavigationStep,
    Fragment,
    CustomisableButtonInner,
    Modal,
    OneBlinkAppsErrorOriginalMessage,
  },
  props: {
    definition: { type: Object as PropType<FormTypes.Form>, required: true },
    submission: {
      type: Object as PropType<Record<string, unknown>>,
      required: true,
    },
    isReadOnly: Boolean,
    primaryColor: String,
    googleMapsApiKey: String,
    captchaSiteKey: String,
    showSaveDraft: Boolean,
    isPreview: Boolean,
    disabled: Boolean,
    buttons: Object as PropType<FormsAppsTypes.FormsListStyles["buttons"]>,
  },
  data(): DataProps {
    return {
      currentPageId: undefined,
      isStepsHeaderActive: false,
      visitedPageIds: [],
      hasAttemptedSubmit: false,
      elementIdsWithLookupsExecuted: [],
      isDirty: false,
      hasConfirmedNavigation: null,
      isNavigationAllowed: false,
      goToLocation: null,
      loadDynamicOptionsState: null,
    }
  },
  mounted() {
    this.currentPageId = this.visiblePages[0].id
    if (this.loadDynamicOptionsState) {
      return
    }
    ;(async () => {
      const optionsByElementId = await formService.getFormElementDynamicOptions(
        this.definition
      )

      if (!optionsByElementId.length) {
        return
      }

      const nonOkResponse = optionsByElementId.find(
        (optionsForElementId) => !optionsForElementId.ok
      )
      if (nonOkResponse && !nonOkResponse.ok) {
        this.loadDynamicOptionsState = nonOkResponse
        return
      }

      const clonedForm: FormTypes.Form = _cloneDeep(this.definition)
      for (const optionsForElementId of optionsByElementId) {
        if (optionsForElementId.ok) {
          formElementsService.forEachFormElementWithOptions(
            clonedForm.elements,
            (formElement) => {
              if (formElement.id === optionsForElementId.elementId) {
                formElement.options = optionsForElementId.options
              }
            }
          )
        }
      }

      this.updateDefinition(clonedForm)
    })()
  },
  methods: {
    updateSubmission(newSubmission: Record<string, unknown>) {
      this.setIsDirty()
      this.$emit("updateSubmission", newSubmission)
    },
    updateDefinition(newDefinition: FormTypes.Form) {
      this.setIsDirty()
      this.$emit("updateDefinition", newDefinition)
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
    setIsDirty() {
      this.isDirty = true
    },
    showDialog() {
      this.hasConfirmedNavigation = false
      return new Promise((resolve) => {
        this.goToLocation = resolve
      })
    },
    goToPreviousPage() {
      const prevPage = this.visiblePages[this.currentPageIndex - 1]
      if (prevPage) {
        this.setPageId(prevPage.id)
      }
    },
    goToNextPage() {
      const nextPage = this.visiblePages[this.currentPageIndex + 1]
      if (nextPage) {
        this.setPageId(nextPage.id)
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
    executedLookup(id: string) {
      if (!this.elementIdsWithLookupsExecuted.includes(id)) {
        this.elementIdsWithLookupsExecuted.push(id)
      }
    },
    executeLookupFailed(id: string) {
      this.elementIdsWithLookupsExecuted =
        this.elementIdsWithLookupsExecuted.filter(
          (elementId) => elementId === id
        )
    },
    checkAttachmentsCanBeSubmitted(submission: FormSubmissionModel) {
      // Prevent submission until all attachment uploads are finished
      // Unless the user is offline, in which case, the uploads will
      // be taken care of by a pending queue...hopefully.
      if (this.isOffline) {
        return true
      }

      if (checkIfAttachmentsAreUploading(this.definition, submission)) {
        bulmaToast.toast({
          message:
            "Attachments are still uploading, please wait for them to finish before trying again.",
          // @ts-expect-error bulma sets this string as a class, so we are hacking in our own classes
          type: "ob-toast is-primary cypress-still-uploading-toast",
          duration: 4000,
          pauseOnHover: true,
          closeOnClick: true,
        })
        return false
      }

      return true
    },
    getCurrentSubmissionData(stripBinaryData: boolean) {
      const { model, captchaTokens } = cleanFormSubmissionModel(
        this.submission,
        this.definition.elements,
        this.formElementsConditionallyShown,
        stripBinaryData
      )
      return {
        submission: model,
        captchaTokens,
      }
    },
    handleSaveDraft() {
      if (this.disabled) return
      if (this.showSaveDraft) {
        this.isNavigationAllowed = true

        // For drafts we don't need to save the captcha tokens,
        // they will need to prove they are not robot again
        const { submission } = this.getCurrentSubmissionData(false)

        if (!this.checkAttachmentsCanBeSubmitted(submission)) {
          return
        }

        this.$emit("saveDraft", { definition: this.definition, submission })
      }
    },
    handleKeepGoing() {
      this.goToLocation = null
      this.hasConfirmedNavigation = null
    },
    async handleDiscardUnsavedChanges() {
      this.isNavigationAllowed = true
      this.hasConfirmedNavigation = true
    },
    handleCancel() {
      if (this.isDirty) {
        this.hasConfirmedNavigation = false
      } else {
        this.$emit("cancel")
      }
    },
    handleSubmit() {
      if (this.disabled || this.isReadOnly) return
      this.hasAttemptedSubmit = true

      if (this.formElementsValidation) {
        console.log("Validation errors", this.formElementsValidation)
        bulmaToast.toast({
          message: "Please fix validation errors",
          // @ts-expect-error bulma sets this string as a class, so we are hacking in our own classes
          type: "ob-toast is-danger cypress-invalid-submit-attempt",
          duration: 4000,
          pauseOnHover: true,
          closeOnClick: true,
        })
        return
      }

      const submissionData = this.getCurrentSubmissionData(false)

      if (!this.checkAttachmentsCanBeSubmitted(submissionData.submission)) {
        return
      }

      this.isNavigationAllowed = true

      this.$emit("submit", {
        definition: this.definition,
        submission: submissionData.submission,
        captchaTokens: submissionData.captchaTokens,
      })
    },
    handlePagesLookupResult(
      element: FormTypes.LookupFormElement,
      elementLookupData: FormTypes.PageElement[],
      dataLookupResult?: FormSubmissionModel
    ) {
      const newPageElements = elementLookupData.map((e) => ({
        ...e,
        injectedByElementId: element.id,
      }))

      const definition = {
        ...this.definition,
        isMultiPage: true,
      }

      if (!this.definition.isMultiPage) {
        definition.elements = [
          {
            id: definition.id.toString(),
            type: "page",
            label: "Page 1",
            elements: this.definition.elements,
            conditionallyShow: false,
            requiresAllConditionallyShowPredicates: false,
          },
          ...newPageElements,
        ]
      } else {
        const indexOfPage = this.definition.elements.findIndex(
          (pageElement: FormTypes.FormElement) => {
            if (pageElement.type === "page") {
              return formElementsService.findFormElement(
                pageElement.elements,
                (el) => el.id === element.id
              )
            }
          }
        )
        console.log(indexOfPage)
        if (indexOfPage === -1) {
          return
        }
        definition.elements = this.definition.elements.reduce(
          (
            partialPageElements: FormTypes.FormElement[],
            pageElement: FormTypes.FormElement,
            index: number
          ) => {
            // @ts-expect-error Sorry typescript, we need to add a property you don't approve of :(
            if (pageElement.injectedByElementId !== element.id) {
              partialPageElements.push(pageElement)
            }
            if (index === indexOfPage) {
              partialPageElements.push(...newPageElements)
            }
            return partialPageElements
          },
          []
        )
      }

      const submission = generateDefaultData(definition.elements, {
        ...this.submission,
        ...dataLookupResult,
      })
      this.updateSubmission(submission)
      this.updateDefinition(definition)
    },
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
    firstVisiblePage(): FormTypes.PageElement {
      return this.visiblePages[0]
    },
    lastVisiblePage(): FormTypes.PageElement {
      return this.visiblePages[this.visiblePages.length - 1]
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
  //@ts-expect-error don't worry about it typescript
  @ProvideReactive() definition: FormTypes.Form = this.definition
  //@ts-expect-error don't worry about it typescript
  @ProvideReactive() isReadOnly: boolean = this.isReadOnly
  //@ts-expect-error don't worry about it typescript
  @ProvideReactive() primaryColor: string = this.primaryColor
  @Provide() executedLookup: (id: string) => void = this.executedLookup
  @Provide() executeLookupFailed: (id: string) => void =
    this.executeLookupFailed
  //@ts-expect-error don't worry about it typescript
  @ProvideReactive() googleMapsApiKey: string = this.googleMapsApiKey
  //@ts-expect-error don't worry about it typescript
  @ProvideReactive() captchaSiteKey: string = this.captchaSiteKey
  @Provide() handlePagesLookupResult: (
    element: FormTypes.LookupFormElement,
    elementLookupData: FormTypes.PageElement[],
    dataLookupResult?: FormSubmissionModel
  ) => void = this.handlePagesLookupResult

  //@ts-expect-error any are you ok?
  beforeRouteLeave(to, from, next) {
    if (this.isDirty && !this.isNavigationAllowed) {
      this.showDialog().then(next)
    }
  }

  @Watch("hasConfirmedNavigation")
  onHasConfirmedNavigation() {
    if (this.hasConfirmedNavigation) {
      // Navigate to the previous blocked location with your navigate function
      if (this.goToLocation) {
        this.goToLocation({})
      } else {
        this.$emit("cancel")
      }
    }
  }
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
    <template v-if="loadDynamicOptionsState && !loadDynamicOptionsState.ok">
      <div class="has-text-centered">
        <i class="material-icons has-text-warning icon-x-large">error</i>
        <h3 class="title is-3">{{ loadDynamicOptionsState.error.title }}</h3>
        <p>
          {{ loadDynamicOptionsState.error.message }}
        </p>
        <p class="has-text-grey">
          {{ formatDatetimeLong(new Date()) }}
        </p>
      </div>

      <OneBlinkAppsErrorOriginalMessage
        :error="loadDynamicOptionsState.error.originalError"
      />
    </template>
    <div class="ob-form-container" ref="obFormContainerHTMLElementRef">
      <form
        name="obForm"
        :class="[
          'ob-form',
          'cypress-ob-form',
          'ob-form__page' + (currentPageIndex + 1),
        ]"
        noValidate
        @submit.prevent="handleSubmit"
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
          <div class="steps">
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
                @updateDefintion="updateDefinition"
              />
            </div>
            <div v-if="isShowingMultiplePages" class="steps-actions">
              <div class="steps-action">
                <button
                  type="button"
                  @click="goToPreviousPage"
                  :disabled="currentPageId === firstVisiblePage.id"
                  class="button is-light cypress-pages-previous"
                >
                  <span class="icon">
                    <i class="material-icons">keyboard_arrow_left</i>
                  </span>
                  <span>Back</span>
                </button>
              </div>
              <!--TODO styles come down in the API :S -->
              <div class="step-progress-mobile cypress-steps-mobile">
                <div
                  v-for="page of visiblePages"
                  :key="page.id"
                  :class="{
                    'step-progress-mobile-dot': true,
                    'is-active': currentPage.id === page.id,
                    'has-background-danger':
                      currentPage.id !== page.id && checkDisplayPageError(page),
                  }"
                />
              </div>
              <div class="steps-action">
                <button
                  type="button"
                  @click="goToNextPage"
                  :disabled="currentPageId === lastVisiblePage.id"
                  class="button is-light cypress-pages-next"
                >
                  <span>Next</span>
                  <span class="icon">
                    <i class="material-icons">keyboard_arrow_right</i>
                  </span>
                </button>
              </div>
            </div>
          </div>
          <div v-if="!isReadOnly" class="buttons ob-buttons ob-buttons-submit">
            <button
              v-if="showSaveDraft && !definition.isInfoPage"
              type="button"
              class="
                button
                ob-button
                is-primary
                ob-button-save-draft
                cypress-save-draft-form
              "
              @click="handleSaveDraft"
              :disabled="isPreview || disabled"
            >
              <CustomisableButtonInner
                :label="
                  buttons && buttons.saveDraft
                    ? buttons.saveDraft.label
                    : 'Save Draft'
                "
                :icon="
                  buttons && buttons.saveDraft
                    ? buttons.saveDraft.icon
                    : undefined
                "
              />
            </button>
            <span class="ob-buttons-submit__spacer"></span>
            <button
              v-if="!definition.isInfoPage"
              type="button"
              class="
                button
                ob-button
                is-light
                ob-button-submit-cancel
                cypress-cancel-form
              "
              @click="handleCancel"
              :disabled="isPreview || disabled"
            >
              <CustomisableButtonInner
                :label="
                  buttons && buttons.cancel ? buttons.cancel.label : 'Cancel'
                "
                :icon="
                  buttons && buttons.cancel ? buttons.cancel.icon : undefined
                "
              />
            </button>
            <button
              v-if="currentPageId === lastVisiblePage.id"
              type="submit"
              class="
                button
                ob-button
                is-success
                ob-button-submit
                cypress-submit-form-button cypress-submit-form
              "
              :disabled="isPreview || disabled"
            >
              <CustomisableButtonInner
                :label="
                  definition.isInfoPage
                    ? 'Done'
                    : buttons && buttons.submit
                    ? buttons.submit.label
                    : 'Submit'
                "
                :icon="
                  buttons && buttons.submit ? buttons.submit.icon : undefined
                "
              />
            </button>
          </div>
        </div>
      </form>

      <Modal
        :isOpen="!isReadOnly && hasConfirmedNavigation === false"
        title="Unsaved Changes"
        cardClassName="cypress-cancel-confirm"
        titleClassName="cypress-cancel-confirm-title"
        bodyClassName="cypress-cancel-confirm-body"
      >
        <template v-slot:actions>
          <button
            v-if="showSaveDraft"
            type="button"
            class="
              button
              ob-button
              is-success
              cypress-cancel-confirm-save-draft
            "
            @click="handleSaveDraft"
          >
            <CustomisableButtonInner
              :label="
                buttons && buttons.saveDraft
                  ? buttons.saveDraft.label
                  : 'Save Draft'
              "
              :icon="
                buttons && buttons.saveDraft
                  ? buttons.saveDraft.icon
                  : undefined
              "
            />
          </button>

          <span style="flex: 1"></span>

          <button
            type="button"
            class="button ob-button is-light cypress-cancel-confirm-back"
            @click="handleKeepGoing"
          >
            <CustomisableButtonInner
              :label="
                buttons && buttons.cancelPromptNo
                  ? buttons.cancelPromptNo.label
                  : 'Back'
              "
              :icon="
                buttons && buttons.cancelPromptNo
                  ? buttons.cancelPromptNo.icon
                  : undefined
              "
            />
          </button>
          <button
            type="button"
            class="button ob-button is-primary cypress-cancel-confirm-discard"
            @click="handleDiscardUnsavedChanges"
          >
            <CustomisableButtonInner
              :label="
                buttons && buttons.cancelPromptYes
                  ? buttons.cancelPromptYes.label
                  : 'Discard'
              "
              :icon="
                buttons && buttons.cancelPromptYes
                  ? buttons.cancelPromptYes.icon
                  : undefined
              "
            />
          </button>
        </template>
        <p>You have unsaved changes, are you sure you want discard them?</p>
      </Modal>
    </div>
  </Fragment>
</template>

<style scoped>
.figure-content .title {
  font-weight: 200;
  line-height: 1.125;
  font-family: BlinkMacSystemFont, -apple-system, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    "Helvetica", "Arial", sans-serif !important;
}

.is-3 {
  font-size: 2rem !important;
}
</style>
