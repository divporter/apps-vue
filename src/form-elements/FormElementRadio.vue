<script lang="ts">
import Vue, { PropType } from "vue"
import { Component, InjectReactive, Watch } from "vue-property-decorator"
import { FormTypes } from "@oneblink/types"
import FormElementLabelContainer from "@/components/FormElementLabelContainer.vue"
import FormElementOptions from "@/components/FormElementOptions.vue"
import OptionButton from "@/form-elements/OptionButton.vue"

const FormElementRadioBase = Vue.extend({
  components: {
    FormElementLabelContainer,
    FormElementOptions,
    OptionButton,
  },
  props: {
    id: { type: String, required: true },
    element: {
      type: Object as PropType<FormTypes.RadioButtonElement>,
      required: true,
    },
    value: { required: true },
    displayValidationMessage: Boolean,
    validationMessage: { type: String, required: false },
    conditionallyShownOptions: Array as PropType<
      FormTypes.ChoiceElementOption[]
    >,
    isLookup: Boolean,
  },
  data() {
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
    filteredOptions() {
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
    updateSubmission(input: string | undefined) {
      this.$emit("updateSubmission", {
        name: this.element.name,
        value: input || undefined,
      })
    },
    setIsDirty() {
      this.isDirty = true
    },
    updateSubmissionAndSetDirty(input: string | undefined) {
      this.setIsDirty()
      this.updateSubmission(input)
    },
  },
})

@Component
export default class FormElementRadio extends FormElementRadioBase {
  @InjectReactive() primaryColor?: string
  @Watch("value")
  onValueChanged(newValue: string | undefined) {
    if (!this.element.options) {
      return
    }
    if (
      typeof newValue === "string" &&
      newValue &&
      !this.filteredOptions.some((option) => newValue === option.value)
    ) {
      this.updateSubmission(undefined)
      return
    }
  }
}
</script>

<template>
  <div class="cypress-radio-element">
    <FormElementLabelContainer
      className="ob-radio"
      :id="id"
      :element="element"
      :required="element.required"
    >
      <FormElementOptions :options="element.options">
        <div v-if="!element.buttons">
          <v-radio-group :value="value" @change="updateSubmission">
            <div
              v-for="option of filteredOptions"
              class="control"
              :key="option.value"
            >
              <label
                class="radio ob-radio__input-label cypress-radio-label"
                :for="id + '_' + option.value"
              >
                <v-radio
                  :key="option.id"
                  class="ob-radio__input cypress-radio-control"
                  :active-class="'ob-radio__input-checked'"
                  :color="primaryColor || 'primary'"
                  :value="option.value"
                  :ripple="!!option.value"
                  :disabled="element.readOnly"
                  :label="option.label"
                  @change="setIsDirty"
                />
              </label>
            </div>
          </v-radio-group>
        </div>

        <div
          v-else
          class="buttons ob-buttons ob-buttons-radio cypress-radio-button-group"
        >
          <div
            v-for="option of filteredOptions"
            class="ob-button-radio-container"
            :key="option.value"
          >
            <OptionButton
              :element="element"
              :option="option"
              :isSelected="value === option.value"
              @click="updateSubmissionAndSetDirty"
              :class="{
                button: true,
                'ob-button': true,
                'ob-button__input': true,
                'ob-radio__button': true,
                'cypress-radio-button-control': true,
                'is-primary': value === option.value,
                'is-light': value !== option.value,
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
        <div class="has-text-danger ob-error__text cypress-validation-message">
          {{ validationMessage }}
        </div>
      </div>
    </FormElementLabelContainer>
  </div>
</template>
