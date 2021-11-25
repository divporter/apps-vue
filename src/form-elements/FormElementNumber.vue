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
    CopyToClipboardButton,
  },
  props: {
    id: String,
    element: Object as PropType<FormTypes.NumberElement>,
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
    updateSubmissionInput(event: { target: HTMLInputElement }) {
      this.$emit("updateSubmission", {
        name: this.element.name,
        value: parseFloat(event.target.value) || undefined,
      })
    },
    updateSubmissionSlider(input: number) {
      this.$emit("updateSubmission", {
        name: this.element.name,
        value: input || undefined,
      })
    },
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

//TODO recreate the apps-react slider (maybe)
</script>

<template>
  <div class="cypress-number-element">
    <FormElementLabelContainer
      class="ob-number"
      :id="id"
      :element="element"
      :required="element.required"
    >
      <div v-if="!showSlider" class="field has-addons">
        <div class="control is-expanded has-icons-right">
          <input
            ref="htmlInputElementRef"
            type="number"
            :placeholder="element.placeholderValue"
            :id="id"
            :name="element.name"
            class="input ob-input cypress-number-control"
            @input="updateSubmissionInput"
            :required="element.required"
            :disabled="element.readOnly"
            @blur="setIsDirty"
          />
          <span class="ob-input-icon icon is-small is-right">
            <i class="material-icons is-size-5">tag</i>
          </span>
        </div>
        <div v-if="!!element.readOnly && !!text" className="control">
          <CopyToClipboardButton
            class="button is-input-addon cypress-copy-to-clipboard-button"
            isInputButton
            :text="text"
          />
        </div>
        <div class="control">
          <LookupButton
            v-if="isLookup"
            isInputButton
            :element="element"
            :value="value"
            :validationMessage="validationMessage"
            @click="triggerLookup"
          />
        </div>
      </div>
      <v-slider
        v-if="showSlider"
        :id="id"
        :label="element.label"
        :value="value"
        @change="updateSubmissionSlider"
        :disabled="element.readOnly"
        :placeholder="element.placeholderValue"
        :min="element.minNumber"
        :max="element.maxNumber"
        :step="element.sliderIncrement"
        thumb-label="always"
        @blur="setIsDirty"
      />
      <!-- TODO implement this
      <SliderControl
        id="{id}"
        text="{text}"
        value="{value}"
        element="{element}"
        onChange="{handleChange}"
        onBlur="{setIsDirty}"
      />
      -->
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
