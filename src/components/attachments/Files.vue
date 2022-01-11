<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"

import FormElementLabelContainer from "../FormElementLabelContainer.vue"

export default Vue.extend({
  components: {
    FormElementLabelContainer,
  },
  props: {
    id: { type: String, required: true },
    element: {
      type: Object as PropType<FormTypes.FilesElement>,
      required: true,
    },
    isDirty: Boolean,
    attachments: Array,
    displayValidationMessage: Boolean,
    validationMessage: String,
  },
  methods: {
    handleAdd() {
      if (!this.$refs.inputRef)
        return // RESET HTML FILE INPUT VALUE SO FILES PREVIOUSLY ADDED AND REMOVED ARE RECOGNISED
      ;(this.$refs.inputRef as HTMLInputElement).value = ""
      ;(this.$refs.inputRef as HTMLInputElement).click()
    },
    handleChange(event: { target: HTMLInputElement }) {
      this.$emit(
        "addFiles",
        event.target.files ? Array.from(event.target.files) : []
      )
    },
  },
})
</script>

<template>
  <div class="cypress-files-element">
    <FormElementLabelContainer
      className="ob-files"
      :element="element"
      :id="id"
      :required="!!element.minEntries"
    >
      <input
        ref="inputRef"
        type="file"
        :name="element.name"
        :id="id"
        class="file-input ob-input"
        :multiple="element.maxEntries !== 1"
        :disabled="element.readOnly"
        @change="handleChange"
      />
      <div class="control cypress-files-control">
        <div class="columns is-multiline">
          <slot></slot>
          <div
            v-if="
              !element.readOnly &&
              (!element.maxEntries || attachments.length < element.maxEntries)
            "
            class="column is-one-quarter"
          >
            <button
              type="button"
              class="button ob-files__add-new-button"
              @click="handleAdd"
            >
              <i class="material-icons icon-x-large">add</i>
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="(isDirty || displayValidationMessage) && !!validationMessage"
        role="alert"
        class="has-margin-top-8"
      >
        <div class="has-text-danger ob-error__text cypress-validation-message">
          {{ validationMessage }}
        </div>
      </div>
    </FormElementLabelContainer>
  </div>
</template>
