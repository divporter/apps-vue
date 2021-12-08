<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"
import { Fragment } from "vue-frag"
import {
  FormElementsValidation,
  FormElementConditionallyShown,
} from "../types/form"
import FormElement from "@/components/FormElement.vue"
import FormElementSection from "@/form-elements/FormElementSection.vue"

export default Vue.extend({
  components: {
    FormElement,
    FormElementSection,
    Fragment,
  },
  props: {
    elements: {
      type: Array as PropType<FormTypes.FormElement[]>,
      required: true,
    },
    model: {
      type: Object as PropType<Record<string, unknown>>,
      required: true,
    },
    formElementsValidation: {
      type: Object as PropType<FormElementsValidation>,
      required: false,
    },
    displayValidationMessages: Boolean,
    formElementsConditionallyShown: {
      type: Object as PropType<FormElementConditionallyShown>,
      required: false,
    },
    idPrefix: { type: String, required: true },
    isEven: { type: Boolean, required: false },
  },
  mounted() {
    // console.log(this.element)
  },
  methods: {
    updateSubmission({
      newSubmission,
      element,
    }: {
      newSubmission: Record<string, unknown>
      element: FormTypes.FormElement
    }) {
      this.$emit("updateSubmission", { newSubmission, element })
    },
  },
})
</script>

<template>
  <Fragment>
    <template v-for="element of elements">
      <div
        :key="element.id"
        v-if="
          element.type === 'section' &&
          formElementsConditionallyShown &&
          formElementsConditionallyShown[element.id] &&
          !formElementsConditionallyShown[element.id].isHidden
        "
        class="ob-element cypress-element-container"
      >
        <FormElementSection
          :element="element"
          :displayValidationMessages="displayValidationMessages"
          :idPrefix="idPrefix"
          :formElementsConditionallyShown="formElementsConditionallyShown"
          :formElementsValidation="formElementsValidation"
          :model="model"
          @updateSubmission="updateSubmission"
        />
      </div>

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
        :name="element.name"
        :id="idPrefix + element.name"
        :formElementValidation="
          formElementsValidation
            ? formElementsValidation[element.name]
            : undefined
        "
        :formElementConditionallyShown="
          formElementsConditionallyShown[element.name]
        "
        :displayValidationMessage="displayValidationMessages"
        @updateSubmission="updateSubmission"
      >
      </FormElement>
    </template>
  </Fragment>
</template>
