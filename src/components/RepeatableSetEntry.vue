<script lang="ts">
import Vue, { PropType } from "vue"
import { Component, Inject, ProvideReactive } from "vue-property-decorator"
import { Fragment } from "vue-frag"
import Modal from "@/components/Modal.vue"

import { FormTypes } from "@oneblink/types"
import { MergeLookupResults, LookupCallback } from "../types/lookups"

import {
  FormElementsConditionallyShown,
  FormElementsValidation,
  FormSubmissionModel,
} from "../types/form"

const RepeatableSetEntryBase = Vue.extend({
  components: {
    Fragment,
    Modal,
  },
  props: {
    id: { type: String, required: true },
    index: { type: Number, required: true },
    isEven: Boolean,
    entry: {
      type: Object as PropType<FormSubmissionModel>,
      required: true,
    },
    element: {
      type: Object as PropType<FormTypes.RepeatableSetElement>,
      required: true,
    },
    formElementsConditionallyShown:
      Object as PropType<FormElementsConditionallyShown>,
    formElementsValidation: Object as PropType<FormElementsValidation>,
    displayValidationMessages: Boolean,
  },
  data() {
    return {
      isConfirmingRemove: false,
    }
  },
  methods: {
    handleChange({
      newSubmission,
      element: nestedElement,
    }: {
      newSubmission: Record<string, unknown>
      element: FormTypes.FormElement
    }) {
      console.log("emitting like crazy")
      console.log(newSubmission)
      this.$emit("change", {
        index: this.index,
        element: nestedElement,
        value: newSubmission,
      })
    },
    handleRemove() {
      this.$emit("remove", this.index)
    },
    handleYes() {
      this.isConfirmingRemove = false
      this.handleRemove()
    },
  },
})

@Component
export default class RepeatableSetEntry extends RepeatableSetEntryBase {
  //@ts-expect-error don't worry about it typescript
  @ProvideReactive() index: number = this.index
  @Inject() readonly handleLookup!: (callback: LookupCallback) => void

  beforeCreate() {
    if (this.$options.components) {
      this.$options.components.OneBlinkFormElements =
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("./OneBlinkFormElements.vue").default
    }
  }

  handleLookupInternal(
    mergeLookupResults: ({
      submission,
      elements,
    }: MergeLookupResults) => MergeLookupResults
  ): void {
    this.handleLookup((currentFormSubmission) => {
      let newEntry = {}
      const entries = currentFormSubmission.submission[
        this.element.name
      ] as Array<FormSubmissionModel>
      const elements = currentFormSubmission.elements.map((formElement) => {
        if (
          formElement.type === "repeatableSet" &&
          formElement.name === this.element.name
        ) {
          const { elements, submission } = mergeLookupResults({
            elements: formElement.elements,
            submission: entries[this.index],
          })
          newEntry = submission
          return {
            ...formElement,
            elements,
          }
        }
        return formElement
      })

      const submission = {
        ...currentFormSubmission.submission,
        [this.element.name]: entries.map((entry, i) => {
          if (i === this.index) {
            return newEntry
          }
          return entry
        }),
      }

      return {
        elements,
        submission,
      }
    })
  }
}
</script>

<template>
  <Fragment>
    <Modal
      :isOpen="isConfirmingRemove"
      className="cypress-repeatable-set-prompt"
      titleClassName="cypress-repeatable-set-remove-entry-header"
      :title="element.removeSetEntryLabel || 'Remove Entry'"
    >
      <template v-slot:default>
        Are you sure you want to remove this entry?
      </template>
      <template v-slot:actions>
        <button
          type="button"
          class="button ob-button is-light cypress-cancel-repeatable-set"
          @click="isConfirmingRemove = false"
        >
          Cancel
        </button>
        <button
          type="button"
          class="button ob-button is-primary cypress-confirm-repeatable-set"
          @click="handleYes"
        >
          Yes
        </button>
      </template>
    </Modal>

    <div
      :key="index"
      class="ob-repeatable-set__container cypress-repeatable-set-container"
    >
      <button
        type="button"
        class="
          button
          ob-button ob-button_remove
          is-light
          cypress-remove-repeatable-set-entry
        "
        @click="() => (isConfirming = true)"
        :disabled="element.readOnly"
      >
        <span class="icon">
          <i class="material-icons">delete_outline</i>
        </span>
        <span v-if="!!element.removeSetEntryLabel">{{
          element.removeSetEntryLabel
        }}</span>
      </button>

      <OneBlinkFormElements
        :idPrefix="id + '_entry-' + index + '_'"
        :isEven="isEven"
        :formElementsValidation="formElementsValidation"
        :displayValidationMessages="displayValidationMessages"
        :elements="element.elements"
        @updateSubmission="handleChange"
        :model="entry"
        :formElementsConditionallyShown="formElementsConditionallyShown"
      />
    </div>
  </Fragment>
</template>
