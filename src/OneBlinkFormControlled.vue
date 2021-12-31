<script lang="ts">
import Vue, { PropType } from "vue"
import { Component, ProvideReactive, Watch } from "vue-property-decorator"
import { FormTypes, FormsAppsTypes } from "@oneblink/types"
import OneBlinkFormBase from "./OneBlinkFormBase.vue"
import generateDefaultData from "./services/generate-default-data"
import _cloneDeep from "lodash.clonedeep"

import { FormSubmissionModel } from "@/types/form"

type DataProps = {
  clonedDefinition: FormTypes.Form
}

const OneBlinkFormControlledBase = Vue.extend({
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
    submission: {
      type: Object as PropType<FormSubmissionModel>,
      required: true,
    },
    primaryColor: String,
  },
  data(): DataProps {
    return {
      clonedDefinition: _cloneDeep(this.definition),
    }
  },
  mounted() {
    this.$emit("updateSubmission", {
      submission: generateDefaultData(
        this.definition.elements,
        this.submission || {}
      ),
      definition: this.definition,
    })
  },
  computed: {
    showSaveDraft(): boolean {
      return this.$listeners && !!this.$listeners["saveDraft"]
    },
  },
  methods: {
    updateSubmission(newSubmission: Record<string, unknown>) {
      this.$emit("updateSubmission", {
        submission: { ...this.submission, ...newSubmission },
        definition: this.definition,
      })
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
export default class OneBlinkFormControlled extends OneBlinkFormControlledBase {
  //@ts-expect-error don't worry about it typescript
  @ProvideReactive() submission: Record<string, unknown> = this.submission

  @Watch("definition", { deep: true })
  onDefinitionChange() {
    Vue.set(this, "clonedDefinition", _cloneDeep(this.definition))
  }
}
</script>

<template>
  <div>
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
  </div>
</template>
