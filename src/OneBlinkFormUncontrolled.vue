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

const OneBlinkFormUncontrolledBase = Vue.extend({
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
    showSaveDraft(): boolean {
      return this.$listeners && !!this.$listeners["saveDraft"]
    },
  },
  methods: {
    updateSubmission(newSubmission: Record<string, unknown>) {
      Vue.set(this, "submission", { ...this.submission, ...newSubmission })
      console.log(JSON.stringify(this.submission, null, 2))
    },
    updateDefinition(newDefinition: FormTypes.Form) {
      Vue.set(this, "clonedDefinition", newDefinition)
    },
    handleCancel() {
      this.$emit("cancel")
    },
    handleSaveDraft(event: unknown) {
      this.$emit("saveDraft", event)
    },
    handleSubmit(event: unknown) {
      this.$emit("submit", event)
    },
  },
})

@Component
export default class OneBlinkFormUncontrolled extends OneBlinkFormUncontrolledBase {
  @ProvideReactive() submission: Record<string, unknown> = this.submission
}
</script>

<template>
  <OneBlinkFormBase
    :definition="clonedDefinition"
    @updateDefinition="updateDefinition"
    :submission="submission"
    @updateSubmission="updateSubmission"
    :isReadOnly="isReadOnly"
    :googleMapsApiKey="googleMapsApiKey"
    :captchaSiteKey="captchaSiteKey"
    :isPreview="isPreview"
    :disabled="disabled"
    :buttons="buttons"
    @cancel="handleCancel"
    @saveDraft="handleSaveDraft"
    @submit="handleSubmit"
    :showSaveDraft="showSaveDraft"
    :primaryColor="primaryColor"
  />
</template>
