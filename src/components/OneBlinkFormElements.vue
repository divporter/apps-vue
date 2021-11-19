<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"
import {
  FormElementValidation,
  FormElementConditionallyShown,
  FormElementValueChangeHandler,
  FormElementLookupHandler,
} from "../types/form"
import FormElementText from "@/form-elements/FormElementText.vue"
import FormElementTextarea from "@/form-elements/FormElementTextarea.vue"
import FormElementNumber from "@/form-elements/FormElementNumber.vue"
import FormElementRadio from "@/form-elements/FormElementRadio.vue"
import FormElementCheckBoxes from "@/form-elements/FormElementCheckBoxes.vue"

export default Vue.extend({
  components: {
    FormElementText,
    FormElementTextarea,
    FormElementNumber,
    FormElementRadio,
    FormElementCheckBoxes,
  },
  props: {
    formId: Number,
    elements: Array as PropType<FormTypes.FormElement[]>,
    model: Object as PropType<Record<string, unknown>>,
    formElementValidation: {
      type: Object as PropType<FormElementValidation>,
      required: false,
    },
    displayValidationMessage: Boolean,
    formElementConditionallyShown: {
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
    updateSubmission({
      name,
      value,
    }: {
      name: string
      value: string | undefined
    }) {
      this.$emit("updateSubmission", {
        [name]: value,
      })
    },
  },
})
</script>

<template>
  <div>
    <template v-for="element of elements">
      <FormElementText
        :key="element.id"
        v-if="element.type === 'text'"
        :element="element"
        :value="model[element.name]"
        @updateSubmission="updateSubmission"
      />
      <FormElementTextarea
        :key="element.id"
        v-if="element.type === 'textarea'"
        :element="element"
        :value="model[element.name]"
        @updateSubmission="updateSubmission"
      />
      <FormElementNumber
        :key="element.id"
        v-if="element.type === 'number'"
        :element="element"
        :value="model[element.name]"
        @updateSubmission="updateSubmission"
      />
      <FormElementRadio
        :key="element.id"
        v-if="element.type === 'radio'"
        :element="element"
        :value="model[element.name]"
        @updateSubmission="updateSubmission"
      />
      <FormElementCheckBoxes
        :key="element.id"
        v-if="element.type === 'checkboxes'"
        :element="element"
        :value="model[element.name]"
        @updateSubmission="updateSubmission"
      />
    </template>
  </div>
</template>
