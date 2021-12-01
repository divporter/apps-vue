<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"

import FormElementLabelContainer from "@/components/FormElementLabelContainer.vue"
import ToggleAllCheckbox from "@/components/ToggleAllCheckbox.vue"
import FormElementOptions from "@/components/FormElementOptions.vue"
import LookupButton from "@/components/LookupButton.vue"

export default Vue.extend({
  components: {
    FormElementLabelContainer,
    ToggleAllCheckbox,
    FormElementOptions,
    LookupButton,
  },
  props: {
    id: { type: String, required: true },
    element: {
      type: Object as PropType<FormTypes.SelectElement>,
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
    selectedValuesAsArray(): string[] {
      if (Array.isArray(this.value)) {
        console.log("is cool it's an array")
        return this.value
      }
      if (typeof this.value === "string") {
        return [this.value]
      }
      return []
    },
  },
  methods: {
    updateSubmission(input: string | string[] | undefined) {
      this.$emit("updateSubmission", {
        name: this.element.name,
        value: input || undefined,
      })
    },
    setIsDirty() {
      this.isDirty = true
    },
    updateSubmissionAndSetDirty(input: string | string[] | undefined) {
      this.setIsDirty()
      this.updateSubmission(input)
    },
    toggleAll(selectAll: boolean) {
      let newValue
      if (selectAll) {
        newValue = this.filteredOptions.map((option) => option.value)
      }
      this.updateSubmissionAndSetDirty(newValue)
    },
    handleSingle(event: { target: HTMLSelectElement }) {
      const val = event.target.value || undefined
      this.updateSubmissionAndSetDirty(val)
    },
    handleMulti(event: { target: HTMLSelectElement }) {
      console.log(this.value)
      const vals = Array.from(event.target.selectedOptions).map(
        (opt) => opt.value
      )
      console.log(vals)
      this.updateSubmissionAndSetDirty(vals)
    },
    triggerLookup() {
      this.$emit("triggerLookup", this.value)
    },
  },
})
</script>

<template>
  <div class="cypress-select-element">
    <FormElementLabelContainer
      className="ob-select"
      :id="id"
      :element="element"
      :required="element.required"
    >
      <FormElementOptions :options="element.options">
        <ToggleAllCheckbox
          v-if="element.multi && element.canToggleAll"
          :id="id"
          :element="element"
          :options="filteredOptions"
          :selected="selectedValuesAsArray"
          :disabled="element.readOnly"
          @toggleAll="toggleAll"
        />
        <div v-if="!element.multi" class="field has-addons">
          <div class="control is-expanded">
            <div class="select is-fullwidth">
              <select
                :id="id"
                :name="element.name"
                class="cypress-select-single-control ob-input ob-select__single"
                :value="typeof value === 'string' ? value : ''"
                :required="element.required"
                :disabled="element.readOnly"
                @change="handleSingle"
                @blur="setIsDirty"
              >
                <option value="">Please choose</option>
                <option
                  v-for="{ label, value } of filteredOptions"
                  :key="value"
                  :value="value"
                >
                  {{ label }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div v-else class="select is-multiple control">
          <select
            multiple
            :id="id"
            :name="element.name"
            class="cypress-select-multiple-control ob-input ob-select__multi"
            @change="handleMulti"
            :required="element.required"
            :disabled="element.readOnly"
            @blur="setIsDirty"
          >
            <option
              v-for="option of filteredOptions"
              :key="option.value"
              :value="option.value"
              :selected="Array.isArray(value) && value.includes(option.value)"
            >
              {{ option.label }}
            </option>
          </select>

          <LookupButton
            v-if="isLookup"
            hasMarginTop
            :element="element"
            :value="value"
            :validationMessage="validationMessage"
            @click="triggerLookup"
          />
        </div>

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
      </FormElementOptions>
    </FormElementLabelContainer>
  </div>
</template>
