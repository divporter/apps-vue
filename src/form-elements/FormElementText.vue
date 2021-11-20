<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"
import FormElementLabelContainer from "@/components/FormElementLabelContainer.vue"

export default Vue.extend({
  components: {
    FormElementLabelContainer,
  },
  props: {
    id: String,
    element: Object as PropType<FormTypes.TextElement>,
    value: { required: true },
    displayValidationMessage: Boolean,
    validationMessage: { type: String, required: false },
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
  },
})

/* TODO 
  data look up
  element look up
*/
</script>

<template>
  <div class="cypress-text-element">
    <FormElementLabelContainer
      className="ob-text"
      :id="id"
      :element="element"
      :required="element.required"
    >
      <div class="field has-addons">
        <div class="control is-expanded">
          <input
            type="text"
            :placeholder="element.placeholderValue"
            :id="id"
            :name="element.name"
            class="input ob-input cypress-text-control"
            :value="text"
            @input="updateSubmission"
            :required="element.required"
            :disabled="element.readOnly"
            @blur="setIsDirty"
          />
        </div>
        <div class="control" v-if="!!element.readOnly && !!value">
          <CopyToClipboardButton
            className="button is-input-addon cypress-copy-to-clipboard-button"
            isInputButton
            text="{text}"
          />
        </div>

        <!-- 
          TODO <LookupButton
            isInputButton
            value={value}
            validationMessage={validationMessage}
          /> -->
      </div>
      <div
        v-if="isDisplayingValidationMessage || !!element.maxLength"
        role="alert"
        class="has-margin-top-8"
      >
        <div clas="is-flex is-justify-content-space-between">
          <div
            v-if="isDisplayingValidationMessage"
            class="has-text-danger ob-error__text cypress-validation-message"
          >
            {{ validationMessage }}
          </div>
          <div v-else></div>

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
    </FormElementLabelContainer>
  </div>
</template>
