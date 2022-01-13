<script lang="ts">
import Vue, { PropType } from "vue"
import { Component, ProvideReactive } from "vue-property-decorator"
import { FormTypes, FormsAppsTypes } from "@oneblink/types"
import OneBlinkFormBase from "./OneBlinkFormBase.vue"
import generateDefaultData from "./services/generate-default-data"
import _cloneDeep from "lodash.clonedeep"

import { FormSubmissionModel } from "@/types/form"

type DataProps = {
  submission: Record<string, unknown>
  clonedDefinition: FormTypes.Form
}

const OneBlinkReadOnlyFormBase = Vue.extend({
  components: {
    OneBlinkFormBase,
  },
  props: {
    definition: { type: Object as PropType<FormTypes.Form>, required: true },
    isReadOnly: Boolean,
    googleMapsApiKey: String,
    captchaSiteKey: String,
    isPreview: Boolean,
    disabled: Boolean,
    buttons: Object as PropType<FormsAppsTypes.FormsListStyles["buttons"]>,
    initialSubmission: {
      type: Object as PropType<FormSubmissionModel>,
      required: false,
    },
    primaryColor: String,
    abnLookupAuthenticationGuid: String,
  },
  data(): DataProps {
    return {
      submission: generateDefaultData(
        this.definition.elements,
        this.initialSubmission || {}
      ),
      clonedDefinition: _cloneDeep(this.definition),
    }
  },
  computed: {
    readOnlyDefinition(): FormTypes.Form {
      return {
        ...this.clonedDefinition,
        elements: this.recursivelySetReadOnly(this.clonedDefinition.elements),
      }
    },
  },
  methods: {
    recursivelySetReadOnly(
      elements: FormTypes.FormElement[]
    ): FormTypes.FormElement[] {
      const newElements = elements
        .filter((element) => element.type !== "captcha")
        .map((element) => {
          if (
            (element.type === "form" ||
              element.type === "section" ||
              element.type === "page" ||
              element.type === "repeatableSet") &&
            Array.isArray(element.elements)
          ) {
            return {
              ...element,
              readOnly: true,
              elements: this.recursivelySetReadOnly(element.elements) || [],
            }
          }

          if (
            element.type !== "section" &&
            element.type !== "heading" &&
            element.type !== "page" &&
            element.type !== "html" &&
            element.type !== "captcha" &&
            element.type !== "image" &&
            element.type !== "calculation" &&
            element.type !== "summary" &&
            element.type !== "form" &&
            element.type !== "infoPage"
          ) {
            return {
              ...element,
              readOnly: true,
            }
          }

          return element
        })

      return newElements
    },
    updateSubmission(newSubmission: Record<string, unknown>) {
      Vue.set(this, "submission", { ...this.submission, ...newSubmission })
    },
    updateDefinition(newDefinition: FormTypes.Form) {
      Vue.set(this, "clonedDefinition", newDefinition)
    },
  },
})

@Component
export default class OneBlinkReadOnlyForm extends OneBlinkReadOnlyFormBase {
  @ProvideReactive() submission: Record<string, unknown> = this.submission
}
</script>

<template>
  <OneBlinkFormBase
    :definition="readOnlyDefinition"
    :submission="submission"
    :isReadOnly="true"
    :googleMapsApiKey="googleMapsApiKey"
    :captchaSiteKey="captchaSiteKey"
    :isPreview="isPreview"
    :disabled="true"
    :buttons="buttons"
    :showSaveDraft="false"
    :primaryColor="primaryColor"
  />
</template>
