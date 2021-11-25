<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"
import FormElementLabelContainer from "@/components/FormElementLabelContainer.vue"
import LookupButton from "@/components/LookupButton.vue"
import CopyToClipboardButton from "@/components/CopyToClipboardButton.vue"

type DataProps = {
  isDirty: boolean
}

export default Vue.extend({
  components: {
    FormElementLabelContainer,
    LookupButton,
    CopyToClipboardButton
  },
  props: {
    id: String,
    element: Object as PropType<FormTypes.TextareaElement>,
    value: { required: true },
    displayValidationMessage: Boolean,
    validationMessage: { type: String, required: false },
    isLookup: Boolean,
  },
  data(): DataProps {
    return {
      isDirty: false,
    }
  },
  computed: {
    text(): string {
      return typeof this.value === "string" ? this.value : ""
    },
    isDisplayingValidationMessage(): boolean {
      return (
        (this.isDirty || this.displayValidationMessage) &&
        !!this.validationMessage
      )
    },
    isDisplayingCopyButton(): boolean {
      return !!this.element.readOnly && !!this.value
    },
  },
  methods: {
    updateSubmission(event: { target: HTMLInputElement }) {
      this.$emit("updateSubmission", {
        name: this.element.name,
        value: event.target.value || undefined,
      })
    },
    setIsDirty() {
      this.isDirty = true
    },
    triggerLookup() {
      this.$emit("triggerLookup", this.value)
    },
  },
})
</script>

<template>
  <div class="cypress-textarea-element">
    <FormElementLabelContainer
      class="ob-textarea"
      :id="id"
      :element="element"
      :required="element.required"
    >
      <div class="control">
        <textarea
          :placeholder="element.placeholderValue"
          :id="id"
          :name="element.name"
          class="textarea input ob-input cypress-textarea-control"
          :value="text"
          @input="updateSubmission"
          :required="element.required"
          :disabled="element.readOnly"
          @blur="setIsDirty"
        />
      </div>

      <div
        v-if="isDisplayingValidationMessage || !!element.maxLength"
        role="alert"
        class="has-margin-top-8"
      >
        <div class="is-flex is-justify-content-space-between">
          <div
            v-if="isDisplayingValidationMessage"
            class="has-text-danger ob-error__text cypress-validation-message"
          >
            {{ validationMessage }}
          </div>
          <div v-else />

          <div
            v-if="!!element.maxLength"
            :class="{
              'ob-max-length__text': true,
              'cypress-max-length-message': true,
              'has-text-danger': text.length > element.maxLength,
            }"
          >
            {{ text.length }} / {{ element.maxLength }}
          </div>
        </div>
      </div>

      <div
        v-if="isLookup || isDisplayingCopyButton"
        class="buttons ob-buttons has-margin-top-8"
      >
        <CopyToClipboardButton
          v-if="isDisplayingCopyButton"
          class="button ob-button cypress-copy-to-clipboard-button"
          :text="text"
        />
        <LookupButton
          v-if="isLookup"
          :element="element"
          :value="value"
          :validationMessage="validationMessage"
          @click="triggerLookup"
        />
      </div>
    </FormElementLabelContainer>
  </div>
</template>
