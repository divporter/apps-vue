<script lang="ts">
import Vue, { PropType } from "vue"

// import useBooleanState from '../hooks/useBooleanState'
import generateDefaultData from "../services/generate-default-data"
import { FormTypes } from "@oneblink/types"
import FormElementLabelContainer from "@/components/FormElementLabelContainer.vue"
import {
  FormElementConditionallyShown,
  FormElementsConditionallyShown,
  FormElementsValidation,
  FormElementValidation,
  FormSubmissionModel,
} from "../types/form"

import RepeatableSetEntry from "@/components/RepeatableSetEntry.vue"

type DataProps = {
  isDirty: boolean
}

type RepeatableSetValidation = {
  type: "repeatableSet"
  set: string | undefined
  entries: Record<string, FormElementsValidation | undefined>
}

export default Vue.extend({
  components: {
    FormElementLabelContainer,
    RepeatableSetEntry,
  },
  props: {
    id: { type: String, required: true },
    element: {
      type: Object as PropType<FormTypes.RepeatableSetElement>,
      required: true,
    },
    value: Array as PropType<Array<FormSubmissionModel>>,
    displayValidationMessage: Boolean,
    validationMessage: { type: String, required: false },
    isLookup: Boolean,
    isEven: Boolean,
    formElementConditionallyShown:
      Object as PropType<FormElementConditionallyShown>,
    formElementValidation: Object as PropType<FormElementValidation>,
    // onLookup: FormElementLookupHandler
  },
  data(): DataProps {
    return {
      isDirty: false,
    }
  },
  computed: {
    entries(): Array<FormSubmissionModel> {
      return Array.isArray(this.value) ? this.value : []
    },
    repeatableSetValidation(): RepeatableSetValidation | undefined {
      return !this.formElementValidation ||
        typeof this.formElementValidation === "string" ||
        this.formElementValidation.type !== "repeatableSet"
        ? undefined
        : this.formElementValidation
    },
    repeatableSetEntriesConditionallyShown(): Record<
      string,
      FormElementsConditionallyShown | undefined
    > {
      return this.formElementConditionallyShown &&
        this.formElementConditionallyShown.type === "repeatableSet"
        ? this.formElementConditionallyShown.entries
        : {}
    },
  },
  methods: {
    setIsDirty() {
      this.isDirty = true
    },
    updateSubmission(newEntries: Array<Record<string, unknown>>): void {
      this.$emit("updateSubmission", {
        name: this.element.name,
        value: newEntries.length > 0 ? newEntries : undefined,
      })
    },
    handleAddEntry() {
      const newEntries = [...(this.value || [])]
      const entry = generateDefaultData(this.element.elements, {})
      newEntries.push(entry)
      this.updateSubmission(newEntries)
      this.setIsDirty()
    },
    handleRemoveEntry(index: number) {
      const newEntries = [...(this.value || [])]
      newEntries.splice(index, 1)
      this.updateSubmission(newEntries)
      this.setIsDirty()
    },
    handleNestedChange({
      index,
      element: nestedElement,
      value,
    }: {
      index: number
      element: FormTypes.FormElement
      value: Record<string, unknown>
    }) {
      if (nestedElement.type === "page" || !("name" in nestedElement)) {
        return
      }
      const newEntries = (this.value || []).map((entry, i) => {
        if (i === index) {
          return {
            ...entry,
            ...value,
          }
        } else {
          return entry
        }
      })
      this.updateSubmission(newEntries)
    },
  },
})
</script>

<template>
  <div class="cypress-repeatable-set-element">
    <FormElementLabelContainer
      :className="['ob-repeatable-set', isEven ? 'even' : 'odd'].join(' ')"
      :element="element"
      :id="id"
      :required="!!element.minSetEntries"
    >
      <RepeatableSetEntry
        v-for="(entry, index) of entries"
        :key="index"
        :index="index"
        :id="id"
        :isEven="isEven"
        :entry="entry"
        :element="element"
        @change="handleNestedChange"
        @remove="handleRemoveEntry"
        :formElementsConditionallyShown="
          repeatableSetEntriesConditionallyShown[index.toString()]
        "
        :formElementsValidation="
          repeatableSetValidation &&
          repeatableSetValidation.entries[index.toString()]
        "
        :displayValidationMessages="displayValidationMessage"
      />
      <button
        v-if="!element.maxSetEntries || entries.length < element.maxSetEntries"
        type="button"
        class="
          button
          ob-button ob-button__add
          is-primary
          cypress-add-repeatable-set
        "
        @click="handleAddEntry"
        :disabled="element.readOnly"
      >
        <span class="icon">
          <i class="material-icons">add</i>
        </span>
        <span v-if="!!element.addSetEntryLabel">{{
          element.addSetEntryLabel
        }}</span>
      </button>
      <div
        v-if="
          (isDirty || displayValidationMessage) &&
          !!repeatableSetValidation &&
          !!repeatableSetValidation.set
        "
        role="alert"
        class="has-margin-top-8"
      >
        <div class="has-text-danger ob-error__text cypress-validation-message">
          {{ repeatableSetValidation.set }}
        </div>
      </div>
    </FormElementLabelContainer>
  </div>
</template>
