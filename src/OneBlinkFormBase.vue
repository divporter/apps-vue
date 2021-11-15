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

// type Props = BaseProps &
//   ControlledProps & {
//     isReadOnly: boolean
//   }
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"
import PageFormElements from "@/components/PageFormElements.vue"
import NavigationStep from "@/components/NavigationStep.vue"

type DataProps = {
  currentPageId?: string
  isStepsHeaderActive: boolean
  visitedPageIds: string[]
  isDisplayingCurrentPageError: boolean
}

export default Vue.extend({
  components: {
    PageFormElements,
    NavigationStep,
  },
  props: {
    definition: Object as PropType<FormTypes.Form>,
    submission: Object as PropType<Record<string, unknown>>,
  },
  data(): DataProps {
    return {
      currentPageId: undefined,
      isStepsHeaderActive: false,
      visitedPageIds: [],
      isDisplayingCurrentPageError: false,
    }
  },
  mounted() {
    this.setPageId(this.pages[0].id)
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
    //TODO logic applied to pages
    visiblePages(): Array<FormTypes.PageElement> {
      return this.pages
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
  },
})
</script>

<template>
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
                class="steps-header-active-page-label cypress-tablet-step-title"
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
              <!--TODO const hasErrors = checkDisplayPageError(page) -->
              <NavigationStep
                v-for="(page, index) of visiblePages"
                :key="page.id"
                :page="page"
                :currentPage="currentPage"
                :currentPageIndex="currentPageIndex"
                :index="index"
                :hasErrors="false"
                @setPageId="setPageId"
              >
                <div
                  class="
                    step-marker step-marker-error
                    ob-step-marker
                    cypress-step-marker
                  "
                  :name="'cypress-page-stepper' + (index + 1)"
                  :value="index + 1"
                >
                  <!-- TODO v-if hasErrors -->
                  <v-tool-tip title="Page has errors">
                    <span
                      class="icon tooltip has-tooltip-top cypress-page-error"
                    >
                      <i class="material-icons has-text-danger is-size-3">
                        warning
                      </i>
                    </span>
                  </v-tool-tip>
                  <!-- TODO v-else -->
                  <span>{{ index + 1 }}</span>
                </div>
                <div class="step-details ob-step-details">
                  <p
                    class="step-title ob-step-title cypress-desktop-step-title"
                  >
                    {{ page.label }}
                  </p>
                </div>
              </NavigationStep>
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
            :formId="definition.id"
            :pageElement="page"
            :model="submission"
            :isActive="page.id === currentPageId"
            @updateSubmission="updateSubmission"
          />
        </div>
        <!-- next/previous buttons go here -->
      </div>
    </form>
  </div>
</template>
