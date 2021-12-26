<script lang="ts">
import Vue, { PropType } from "vue"

import FormElementOptions from "@/components/FormElementOptions.vue"
import { FormTypes } from "@oneblink/types"
import OptionButton from "./OptionButton.vue"
import FormElementLabelContainer from "@/components/FormElementLabelContainer.vue"
import ComplianceButton from "./ComplianceButton.vue"
import FormElementFiles from "./FormElementFiles/index.vue"
import FormElementTextarea from "./FormElementTextarea.vue"
import { PossibleFileConfiguration } from "@/types/files"

export interface Value {
  value?: string
  notes?: string
  files?: PossibleFileConfiguration[]
}

const baseElement = {
  conditionallyShow: false,
  isDataLookup: false,
  isElementLookup: false,
  required: false,
  requiresAllConditionallyShowPredicates: false,
}

type DataProps = {
  isDirty: boolean
  isShowingNotes: boolean
  isShowingFiles: boolean
}

export default Vue.extend({
  components: {
    FormElementLabelContainer,
    FormElementOptions,
    OptionButton,
    ComplianceButton,
    FormElementTextarea,
    FormElementFiles,
  },
  props: {
    id: { type: String, required: true },
    element: {
      type: Object as PropType<FormTypes.ComplianceElement>,
      required: true,
    },
    value: { required: true },
    displayValidationMessage: Boolean,
    validationMessage: { type: String, required: false },
    conditionallyShownOptions: Array as PropType<
      FormTypes.ChoiceElementOption[]
    >,
    isEven: Boolean,
  },
  data(): DataProps {
    return {
      isDirty: false,
      isShowingNotes: false,
      isShowingFiles: false,
    }
  },
  computed: {
    typedValue(): Value | undefined {
      return this.value as Value | undefined
    },
    notesElement(): FormTypes.TextareaElement {
      return {
        ...baseElement,
        readOnly: this.element.readOnly,
        id: `${this.element.id}-notes`,
        label: "Notes",
        name: `${this.element.name}_notes`,
        type: "textarea",
      }
    },
    filesElement(): FormTypes.FilesElement {
      return {
        ...baseElement,
        readOnly: this.element.readOnly,
        id: `${this.element.id}-files`,
        label: "Media",
        name: `${this.element.name}_files`,
        type: "files",
        maxEntries: undefined,
        minEntries: undefined,
        restrictFileTypes: false,
        storageType: this.element.storageType,
      }
    },
    filteredOptions(): FormTypes.ChoiceElementOption[] {
      if (!this.element.options) {
        return []
      }
      if (!this.conditionallyShownOptions) {
        return this.element.options
      }
      return this.element.options.filter((option) => {
        return (
          !this.conditionallyShownOptions ||
          this.conditionallyShownOptions.some(({ id }) => id === option.id)
        )
      })
    },
  },
  methods: {
    setIsDirty() {
      this.isDirty = true
    },
    updateSubmission(value: Value) {
      this.$emit("updateSubmission", {
        name: this.element.name,
        value,
      })
    },
    handleValueChange(newValue: string | undefined) {
      this.updateSubmission({ ...this.typedValue, value: newValue })
    },
    handleNotesChange({ value: newNotes }: { value: string | undefined }) {
      this.updateSubmission({ ...this.typedValue, notes: newNotes })
    },
    handleFilesChange({
      value: newFiles,
    }: {
      value: PossibleFileConfiguration[] | undefined
    }) {
      this.updateSubmission({
        ...this.typedValue,
        files: newFiles?.length ? newFiles : undefined,
      })
    },
    toggleIsShowingNotes() {
      if (this.isShowingNotes) {
        this.handleNotesChange({ value: undefined })
      }
      this.isShowingNotes = !this.isShowingNotes
    },
    toggleIsShowingFiles() {
      if (this.isShowingFiles) {
        this.handleFilesChange({ value: undefined })
      }
      this.isShowingFiles = !this.isShowingFiles
    },
    onClickOption(value: string) {
      this.setIsDirty()
      this.handleValueChange(value)
    },
  },
  mounted() {
    this.isShowingNotes = !!this.typedValue?.notes
    this.isShowingFiles = !!this.typedValue?.files
  },
})
</script>

<template>
  <div class="cypress-compliance-element">
    <FormElementLabelContainer
      :className="`ob-compliance ${!isEven ? 'even' : 'odd'}`"
      :id="id"
      :element="element"
      :required="element.required"
    >
      <div class="ob-compliance__container">
        <FormElementOptions :options="element.options">
          <div
            class="
              buttons
              ob-buttons ob-buttons-radio
              cypress-radio-button-group
            "
          >
            <div
              v-for="option of filteredOptions"
              class="ob-button-radio-container"
              :key="option.value"
            >
              <OptionButton
                :element="element"
                :option="option"
                :isSelected="typedValue && typedValue.value === option.value"
                @click="() => onClickOption(option.value)"
                :class="{
                  button: true,
                  'ob-button': true,
                  'ob-button__input': true,
                  'ob-radio__button': true,
                  'cypress-radio-button-control': true,
                  'is-primary': typedValue && typedValue.value === option.value,
                  'is-light': !typedValue || typedValue.value !== option.value,
                }"
              />
            </div>
          </div>
        </FormElementOptions>
        <div
          v-if="(isDirty || displayValidationMessage) && !!validationMessage"
          role="alert"
          class="has-margin-top-8"
        >
          <div
            class="has-text-danger ob-error__text cypress-validation-message"
          >
            {{ validationMessage }}
          </div>
        </div>
        <div
          class="
            buttons
            ob-buttons ob-buttons-compliance
            cypress-compliance-button-group
          "
        >
          <ComplianceButton
            :isActive="isShowingNotes"
            icon="notes"
            @click="toggleIsShowingNotes"
            :disabled="element.readOnly || !typedValue || !typedValue.value"
          >
            Notes
          </ComplianceButton>
          <ComplianceButton
            :isActive="isShowingFiles"
            icon="perm_media"
            @click="toggleIsShowingFiles"
            :disabled="element.readOnly || !typedValue || !typedValue.value"
          >
            Media
          </ComplianceButton>
        </div>
        <div v-if="isShowingNotes" class="ob-compliance-child-element">
          <FormElementTextarea
            :id="`${id}-notes`"
            @updateSubmission="handleNotesChange"
            :displayValidationMessage="false"
            :validationMessage="undefined"
            :value="typedValue ? typedValue.notes : undefined"
            :element="notesElement"
          />
        </div>
        <div v-if="isShowingFiles" class="ob-compliance-child-element">
          <FormElementFiles
            :id="`${id}-files`"
            @updateSubmission="handleFilesChange"
            :displayValidationMessage="false"
            :validationMessage="undefined"
            :value="typedValue ? typedValue.files : undefined"
            :element="filesElement"
          />
        </div>
      </div>
    </FormElementLabelContainer>
  </div>
</template>
