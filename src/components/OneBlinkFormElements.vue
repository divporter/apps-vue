<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"
import {
  FormElementsValidation,
  FormElementConditionallyShown,
  FormElementValueChangeHandler,
  FormElementLookupHandler,
} from "../types/form"
import FormElement from "@/components/FormElement.vue"

export default Vue.extend({
  components: {
    FormElement,
  },
  props: {
    elements: Array as PropType<FormTypes.FormElement[]>,
    model: Object as PropType<Record<string, unknown>>,
    formElementsValidation: {
      type: Object as PropType<FormElementsValidation>,
      required: false,
    },
    displayValidationMessages: Boolean,
    formElementsConditionallyShown: {
      type: Object as PropType<FormElementConditionallyShown>,
      required: false,
    },
    id: String,
    isEven: { type: Boolean, required: false },
    onChange: Object as PropType<FormElementValueChangeHandler>,
    onLookup: Object as PropType<FormElementLookupHandler>,
  },
  mounted() {
    // console.log(this.element)
  },
  methods: {
    updateSubmission(newSubmission: Record<string, unknown>) {
      this.$emit("updateSubmission", newSubmission)
    },
  },
})
</script>

<template>
  <div>
    <template v-for="element of elements">
      <FormElement
        :key="element.id"
        v-if="
          element.type !== 'section' &&
          element.type !== 'page' &&
          formElementsConditionallyShown &&
          formElementsConditionallyShown[element.name] &&
          !formElementsConditionallyShown[element.name].isHidden
        "
        :element="element"
        :model="model"
        :value="model[element.name]"
        :formElementValidation="
          formElementsValidation
            ? formElementsValidation[element.name]
            : undefined
        "
        :displayValidationMessage="displayValidationMessages"
        @updateSubmission="updateSubmission"
      >
      </FormElement>
    </template>
  </div>
</template>
