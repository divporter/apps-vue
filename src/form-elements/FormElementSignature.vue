<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"
import { FormElementBinaryStorageValue } from "@/types/attachments"

import FormElementLabelContainer from "@/components/FormElementLabelContainer.vue"
import SignatureDisplay from "@/components/signature/SignatureDisplay.vue"
import SignatureDrawing from "@/components/signature/SignatureDrawing.vue"

export default Vue.extend({
  components: {
    FormElementLabelContainer,
    SignatureDisplay,
    SignatureDrawing,
  },
  props: {
    id: { type: String, required: true },
    element: {
      type: Object as PropType<FormTypes.DrawElement>,
      required: true,
    },
    value: Object as PropType<FormElementBinaryStorageValue>,
    displayValidationMessage: Boolean,
    validationMessage: String,
  },
  data() {
    return {
      isDirty: false,
    }
  },
  methods: {
    updateSubmission({
      attachment,
    }: {
      attachment?: FormElementBinaryStorageValue
    }) {
      this.isDirty = true
      this.$emit("updateSubmission", {
        name: this.element.name,
        value: attachment,
      })
    },
    nestedUpdateSubmission({
      value,
    }: {
      value?: FormElementBinaryStorageValue
    }) {
      this.updateSubmission({ attachment: value })
    },
  },
})
</script>

<template>
  <div class="cypress-signature-element">
    <FormElementLabelContainer
      className="ob-signature"
      :id="id"
      :element="element"
      :required="element.required"
    >
      <div class="control">
        <SignatureDisplay
          v-if="value"
          :element="element"
          :value="value"
          @updateSubmission="nestedUpdateSubmission"
        />
        <SignatureDrawing
          v-else
          :element="element"
          @updateSubmission="updateSubmission"
        />
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
