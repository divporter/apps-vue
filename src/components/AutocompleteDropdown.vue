<script lang="ts">
import Vue, { PropType } from "vue"
import { Component, Watch } from "vue-property-decorator"
import { Fragment } from "vue-frag"
import { Sentry } from "@oneblink/apps"

type AutocompleteOption = {
  label: string
  value: string
  data?: unknown
}

type DataProps = {
  isDirty: boolean
  currentFocusedOptionIndex: number
  options: AutocompleteOption[]
  error: Error | null
  isFetchingOptions: boolean
  isOpen: boolean
  abortController: AbortController
  timeoutId: number
  ignore: boolean
}

const AutocompleteDropdownBase = Vue.extend({
  components: {
    Fragment,
  },
  props: {
    id: { type: String, required: true },
    label: { type: String, required: true },
    value: { required: false },
    placeholder: String,
    required: Boolean,
    disabled: Boolean,
    isLoading: Boolean,
    hasError: Boolean,
    validationMessage: String,
    displayValidationMessage: Boolean,
    searchDebounceMs: { type: Number, required: true },
    searchMinCharacters: { type: Number, required: true },
    onSearch: Function as PropType<
      (label: string, abortSignal: AbortSignal) => Promise<AutocompleteOption[]>
    >,
  },
  data(): DataProps {
    return {
      isDirty: false,
      currentFocusedOptionIndex: 0,
      options: [],
      error: null,
      isFetchingOptions: false,
      isOpen: false,
      abortController: new AbortController(),
      timeoutId: 0,
      ignore: false,
    }
  },
  computed: {
    isShowingLoading(): boolean {
      return this.isFetchingOptions || !!this.isLoading
    },
    isShowingValid(): boolean {
      return !this.isShowingLoading && this.value !== undefined
    },
    isShowingError(): boolean {
      return !this.isShowingLoading && !!this.hasError
    },
  },
  methods: {
    selectOption(option: AutocompleteOption) {
      this.$emit("changeLabel", option.label)
      this.$emit("changeValue", option.value, option.data)
      // onChangeLabel(option.label)
      // onChangeValue(option.value, option.data)
      this.isOpen = false
      return
    },
    clickOption(option: AutocompleteOption) {
      console.log("Selected element option in autocomplete", option)
      this.selectOption(option)
    },
    focus() {
      this.currentFocusedOptionIndex = 0
      this.isOpen = true
    },
    handleBlur() {
      this.isDirty = true
      this.error = null
      this.isOpen = false

      if (!this.value && Array.isArray(this.options)) {
        // If there is no option currently selected but the typed in label
        // matches an option's label, set that option as the value, otherwise remove label
        if (this.label) {
          const lowerCase = this.label.toLowerCase()
          const option = this.options.find(
            (option) => option.label.toLowerCase() === lowerCase
          )
          if (option) {
            console.log("Setting value after blurring away from autocomplete")
            this.selectOption(option)
            return
          }
        }
        console.log("Removing label after blurring away from autocomplete")
        this.$emit("changeLabel", "")
        // onChangeLabel("")
      }
    },
    onKeyDown(event: KeyboardEvent) {
      if (!this.options) {
        return
      }
      const enterPressed = event.keyCode === 13
      const upArrowPressed = event.keyCode === 38
      const downArrowPressed = event.keyCode === 40
      if (!upArrowPressed && !downArrowPressed && !enterPressed) {
        return
      }

      event.preventDefault()

      const previousFocusedOptionIndex = this.currentFocusedOptionIndex
      let nextFocusedOptionIndex = this.currentFocusedOptionIndex
      if (upArrowPressed) {
        nextFocusedOptionIndex = Math.max(0, this.currentFocusedOptionIndex - 1)
      } else if (downArrowPressed) {
        nextFocusedOptionIndex = Math.min(
          this.options.length - 1,
          this.currentFocusedOptionIndex + 1
        )
      } else if (enterPressed) {
        const option = this.options[nextFocusedOptionIndex]
        if (option) {
          this.selectOption(option)
        }
      }

      // If the index has changed, need to ensure the active option is visible
      if (
        previousFocusedOptionIndex !== nextFocusedOptionIndex &&
        this.$refs.optionsContainerElement
      ) {
        const activeStepElement = (
          this.$refs.optionsContainerElement as Element
        ).querySelector(
          `.ob-autocomplete__drop-down-item-${nextFocusedOptionIndex}`
        )
        if (activeStepElement) {
          activeStepElement.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "start",
          })
        }
        this.currentFocusedOptionIndex = nextFocusedOptionIndex
      }
    },
    handleChangeLabel(e: { target: HTMLInputElement }) {
      const newLabel = e.target.value
      this.isOpen = true
      this.currentFocusedOptionIndex = 0

      // Remove value when changing label
      this.$emit("changeValue", undefined)
      this.$emit("changeLabel", newLabel)
    },
    search() {
      this.error = null
      clearTimeout(this.timeoutId)
      this.abortController.abort()
      this.ignore = true

      if (!this.isOpen || this.label.length < this.searchMinCharacters) {
        this.isFetchingOptions = false
        return
      }

      this.isFetchingOptions = true

      this.abortController = new AbortController()

      this.ignore = false
      this.timeoutId = setTimeout(async () => {
        let newOptions: AutocompleteOption[] = []
        let newError = null

        try {
          newOptions = await this.onSearch(
            this.label,
            this.abortController.signal
          )
        } catch (error) {
          // Cancelling will throw an error.
          if (!this.abortController.signal.aborted) {
            console.warn("Error while fetching autocomplete options", error)
            Sentry.captureException(error)
            newError = error as Error
          }
        }
        if (!this.ignore) {
          this.error = newError
          this.options = newOptions
          this.isFetchingOptions = false
        }
      }, this.searchDebounceMs)
    },
    highlightLabel(text: string, phrase: string) {
      if (phrase) {
        text = text.replace(new RegExp("(" + phrase + ")", "gi"), "<b>$1</b>")
      }
      return text
    },
  },
  //TODO refs in property decorator
})

@Component
export default class AutocompleteDropdown extends AutocompleteDropdownBase {
  @Watch("label")
  onLabelChange() {
    this.search()
  }

  @Watch("isOpen")
  onIsOpenChange() {
    this.search()
  }

  beforeUnmount() {
    clearTimeout(this.timeoutId)
  }
}

//TODO
// const optionsContainerElement = React.useRef<HTMLDivElement>(null)
</script>

<template>
  <Fragment>
    <div
      :class="{ dropdown: true, 'is-active': isOpen && Array.isArray(options) }"
    >
      <div class="field">
        <div
          :class="{
            'cypress-autocomplete-field-control': true,
            control: true,
            'is-expanded': true,
            'is-loading': isShowingLoading,
            'has-icons-right': isShowingValid || isShowingError,
          }"
        >
          <input
            type="text"
            :placeholder="placeholder"
            :id="id"
            autocomplete="off"
            class="cypress-autocomplete-control input ob-input"
            :required="required"
            :value="label"
            :disabled="disabled"
            @focus="focus"
            @blur="handleBlur"
            @keydown="onKeyDown"
            @input="handleChangeLabel"
          />
          <span
            v-if="isShowingValid"
            class="ob-input-icon icon is-small is-right"
          >
            <i class="material-icons is-size-5 has-text-success"> check </i>
          </span>
          <span
            v-if="isShowingError"
            class="ob-input-icon icon is-small is-right"
          >
            <i class="material-icons is-size-5 has-text-danger"> error </i>
          </span>
        </div>
      </div>

      <div class="dropdown-menu">
        <div
          ref="optionsContainerElement"
          class="
            ob-autocomplete__dropdown-content
            dropdown-content
            cypress-autocomplete-dropdown-content
          "
        >
          <a
            v-if="error"
            class="
              dropdown-item
              cypress-autocomplete-error
              ob-autocomplete__drop-down-item-error
            "
          >
            <span class="has-text-danger">{{ error.message }}</span>
          </a>
          <a
            v-else-if="label.length < searchMinCharacters"
            class="
              dropdown-item
              cypress-max-characters
              ob-autocomplete__drop-down-item-max-characters
            "
          >
            <i>
              Enter at least {{ searchMinCharacters }} character(s) to search
            </i>
          </a>
          <a
            v-else-if="isShowingLoading"
            class="
              dropdown-item
              cypress-searching-options
              ob-autocomplete__drop-down-item-searching
            "
          >
            <i>Searching...</i>
          </a>

          <template v-else-if="options && options.length">
            <a
              v-for="(option, index) of options"
              :key="option.value"
              :class="{
                'dropdown-item': true,
                'cypress-autocomplete-dropdown-item': true,
                ['ob-autocomplete__drop-down-item-' + index]: true,
                'is-active': currentFocusedOptionIndex === index,
              }"
              @mousedown.stop.prevent="() => clickOption(option)"
              v-html="highlightLabel(option.label, label)"
          /></template>
          <a
            v-else
            class="
              dropdown-item
              cypress-no-matches-found
              ob-autocomplete__drop-down-item-no-matches
            "
          >
            <i>No matches found</i>
          </a>
        </div>
      </div>
    </div>

    <div
      v-if="
        (isDirty || displayValidationMessage) &&
        !!validationMessage &&
        !isShowingLoading
      "
      role="alert"
      class="has-margin-top-8"
    >
      <div class="has-text-danger ob-error__text cypress-validation-message">
        {{ validationMessage }}
      </div>
    </div>
  </Fragment>
</template>
