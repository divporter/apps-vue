<script lang="ts">
import Vue, { PropType } from "vue"
import { Component, InjectReactive, Watch } from "vue-property-decorator"

import { formService } from "@oneblink/apps"
import { FormTypes } from "@oneblink/types"
import FormElementForm from "./FormElementForm.vue"
import generateCivicaNameRecordElements from "@/services/generateCivicaNameRecordElements"

import {
  FormElementConditionallyShown,
  FormElementValidation,
} from "../types/form"

type DataProps = {
  isLoading: boolean
  titleCodeOptions: FormTypes.ChoiceElementOption[] | null
  loadError: Error | null
  abortController: AbortController
}

const FormElementCivicaNameRecordBase = Vue.extend({
  components: {
    FormElementForm,
  },
  props: {
    id: { type: String, required: true },
    element: {
      type: Object as PropType<FormTypes.CivicaNameRecordElement>,
      required: true,
    },
    value: {
      type: Object as PropType<Record<string, unknown>>,
    },
    displayValidationMessages: Boolean,
    validationMessage: { type: String, required: false },
    formElementConditionallyShown:
      Object as PropType<FormElementConditionallyShown>,
    formElementValidation: Object as PropType<FormElementValidation>,
  },
  data(): DataProps {
    return {
      isLoading: true,
      titleCodeOptions: null,
      loadError: null,
      abortController: new AbortController(),
    }
  },
  computed: {
    formElement(): FormTypes.FormFormElement {
      return {
        id: this.element.id,
        conditionallyShow: false,
        requiresAllConditionallyShowPredicates: false,
        type: "form",
        name: this.element.name,
        formId: NaN,
        elements: generateCivicaNameRecordElements(
          this.element,
          this.titleCodeOptions || undefined
        ),
      }
    },
  },
  methods: {
    updateSubmission(e: unknown) {
      this.$emit("updateSubmission", e)
    },
  },
})

@Component
export default class FormElementCivicaNameRecord extends FormElementCivicaNameRecordBase {
  @InjectReactive() definition!: FormTypes.Form

  get formId(): number {
    return this.definition.id
  }

  @Watch("formId")
  onFormIdChange(newValue: number, oldValue: number) {
    if (newValue === oldValue) {
      return
    }
    this.abortController.abort()
    this.isLoading = true

    this.abortController = new AbortController()

    const request = async () => {
      try {
        const items = await formService.getCivicaTitleCodes(
          this.formId,
          this.abortController.signal
        )
        if (!this.abortController.signal.aborted) {
          this.isLoading = false
          this.titleCodeOptions = items
        }
      } catch (error) {
        if (!this.abortController.signal.aborted) {
          this.isLoading = false
          this.loadError = error as Error
        }
      }
    }
    request()
  }
}
</script>

<template>
  <FormElementForm
    :element="formElement"
    @updateSubmission="updateSubmission"
    v-bind="$props"
  />
</template>
