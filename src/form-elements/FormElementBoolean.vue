<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"
import FormElementLabelContainer from "@/components/FormElementLabelContainer.vue"

export default Vue.extend({
  components: {
    FormElementLabelContainer,
  },
  props: {
    id: { type: String, required: true },
    element: {
      type: Object as PropType<FormTypes.BooleanElement>,
      required: true,
    },
    value: { required: true },
    displayValidationMessage: Boolean,
    validationMessage: { type: String, required: false },
  },
  data() {
    return {
      isDirty: false,
    }
  },
  methods: {
    updateSubmission(input: boolean | undefined) {
      this.setIsDirty()
      this.$emit("updateSubmission", {
        name: this.element.name,
        value: input !== undefined ? !!input : undefined,
      })
    },
    setIsDirty() {
      this.isDirty = true
    },
  },
})
</script>

<template>
  <div class="cypress-boolean-element">
    <FormElementLabelContainer
      className="ob-boolean"
      :id="id"
      :element="element"
      :required="element.required"
    >
      <template v-slot:leading>
        <ui-switch
          :id="id"
          :name="element.name"
          :class="{
            'ob-boolean__input': true,
            'cypress-boolean-control': true,
            'ob-boolean__input-checked': value,
          }"
          :model="!!value"
          :disabled="element.readOnly"
          @change="updateSubmission"
        />
      </template>
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

<style scoped>
.mdc-switch {
  padding-right: 12px;
}
</style>
