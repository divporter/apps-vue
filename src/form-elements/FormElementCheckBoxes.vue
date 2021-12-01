<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"
import FormElementLabelContainer from "@/components/FormElementLabelContainer.vue"
import LookupButton from "@/components/LookupButton.vue"
import OptionButton from "@/form-elements/OptionButton.vue"
import ToggleAllCheckbox from "@/components/ToggleAllCheckbox.vue"
import FormElementOptions from "@/components/FormElementOptions.vue"

export default Vue.extend({
  components: {
    FormElementLabelContainer,
    LookupButton,
    OptionButton,
    ToggleAllCheckbox,
    FormElementOptions,
  },
  props: {
    id: { type: String, required: true },
    element: {
      type: Object as PropType<FormTypes.CheckboxElement>,
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
    selectedValues(): string[] {
      if (!Array.isArray(this.value)) {
        return []
      }
      return this.value
    },
  },
  methods: {
    updateSubmission(input: string[] | undefined) {
      this.$emit("updateSubmission", {
        name: this.element.name,
        value: input || undefined,
      })
    },
    setIsDirty() {
      this.isDirty = true
    },
    updateSubmissionAndSetDirty(input: string[] | undefined) {
      this.setIsDirty()
      this.updateSubmission(input)
    },
    triggerLookup() {
      this.$emit("triggerLookup", this.value)
    },
    toggleAll(selectAll: boolean) {
      let newValue
      if (selectAll) {
        newValue = this.filteredOptions.map((option) => option.value)
      }
      this.updateSubmissionAndSetDirty(newValue)
    },
  },
})

/* TODO 
  option set
*/
</script>

<template>
  <div className="cypress-checkbox-element">
    <FormElementLabelContainer
      className="ob-checkbox"
      :id="id"
      :element="element"
      :required="element.required"
    >
      <FormElementOptions :options="element.options">
        <ToggleAllCheckbox
          v-if="element.canToggleAll"
          :id="id"
          :element="element"
          :options="filteredOptions"
          :selected="selectedValues"
          :disabled="element.readOnly"
          @toggleAll="toggleAll"
        />
        <div v-if="element.buttons" class="ob-button-radio-container">
          <div class="buttons ob-buttons ob-buttons-radio">
            <OptionButton
              v-for="(option, index) of filteredOptions"
              :key="index"
              :element="element"
              :option="option"
              :isSelected="selectedValues.includes(option.value)"
              @click="updateSubmissionAndSetDirty"
              :class="{
                button: true,
                'ob-button': true,
                'ob-button__input': true,
                'ob-checkbox__button': true,
                'cypress-checkbox-button-control': true,
                'is-primary': selectedValues.includes(option.value),
                'is-light': !selectedValues.includes(option.value),
              }"
            />
          </div>
        </div>
        <div v-else>
          <div
            class="control"
            :key="index"
            v-for="(option, index) of filteredOptions"
          >
            <label
              class="checkbox ob-checkbox__input-label cypress-checkbox-label"
              :for="id + '_' + option.value"
            >
              <v-checkbox
                :id="id + '_' + option.value"
                :class="{
                  'ob-checkbox__input': true,
                  'cypress-checkbox-control': true,
                  'ob-checkbox__input-checked': selectedValues.includes(
                    option.value
                  ),
                }"
                dense
                hide-details
                :label="option.label"
                :value="option.value"
                :input-value="value || []"
                :ripple="false"
                :disabled="element.readOnly"
                @change="updateSubmissionAndSetDirty"
              />
            </label>
          </div>
        </div>
        <LookupButton
          v-if="isLookup"
          hasMarginTop
          :element="element"
          :value="value"
          :validationMessage="validationMessage"
          @click="triggerLookup"
        />
      </FormElementOptions>
      <div
        v-if="displayValidationMessage && !!validationMessage"
        role="alert"
        class="has-margin-top-8"
      >
        <div
          className="has-text-danger ob-error__text cypress-validation-message"
        >
          {{ validationMessage }}
        </div>
      </div>
    </FormElementLabelContainer>
  </div>
</template>
