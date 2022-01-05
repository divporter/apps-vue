<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"
import FormElementLabelContainer from "@/components/FormElementLabelContainer.vue"
import LookupButton from "@/components/LookupButton.vue"
import CopyToClipboardButton from "@/components/CopyToClipboardButton.vue"
import SliderControl from "@/components/SliderControl.vue"

type DataProps = {
  isDirty: boolean
}

export default Vue.extend({
  components: {
    FormElementLabelContainer,
    LookupButton,
    CopyToClipboardButton,
    SliderControl,
  },
  props: {
    id: { type: String, required: true },
    element: {
      type: Object as PropType<FormTypes.NumberElement>,
      required: true,
    },
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
  methods: {
    updateSubmission(event: { target: HTMLInputElement }) {
      const value = parseFloat(event.target.value)
      this.$emit("updateSubmission", {
        name: this.element.name,
        value: !Number.isNaN(value) ? value : undefined,
      })
    },
    // updateSubmissionSlider(input: number) {
    //   this.$emit("updateSubmission", {
    //     name: this.element.name,
    //     value: input || undefined,
    //   })
    // },
    setIsDirty() {
      this.isDirty = true
    },
    triggerLookup() {
      this.$emit("triggerLookup", this.value)
    },
  },
  computed: {
    showSlider(): boolean {
      return (
        this.element.isSlider &&
        !Number.isNaN(this.element.minNumber) &&
        !Number.isNaN(this.element.maxNumber)
      )
    },
    text(): string {
      return typeof this.value === "number" ? this.value.toString() : ""
    },
  },
})
</script>

<template>
  <div class="cypress-number-element">
    <FormElementLabelContainer
      className="ob-number"
      :id="id"
      :element="element"
      :required="element.required"
    >
      <div v-if="!showSlider" class="field has-addons">
        <div class="control is-expanded has-icons-right">
          <input
            ref="htmlInputElementRef"
            type="number"
            :value="text"
            :placeholder="element.placeholderValue"
            :id="id"
            :name="element.name"
            class="input ob-input cypress-number-control"
            @input="updateSubmission"
            :required="element.required"
            :disabled="element.readOnly"
            @blur="setIsDirty"
          />
          <span class="ob-input-icon icon is-small is-right">
            <i class="material-icons is-size-5">tag</i>
          </span>
        </div>
        <div v-if="!!element.readOnly && !!text" class="control">
          <CopyToClipboardButton
            className="button is-input-addon cypress-copy-to-clipboard-button"
            isInputButton
            :text="text"
          />
        </div>
        <div class="control">
          <LookupButton
            v-if="isLookup"
            isInputButton
            :value="value"
            :validationMessage="validationMessage"
            @click="triggerLookup"
          />
        </div>
      </div>
      <SliderControl
        :id="id"
        :text="text"
        :value="value"
        :element="element"
        @change="updateSubmission"
        @blur="setIsDirty"
      />

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
