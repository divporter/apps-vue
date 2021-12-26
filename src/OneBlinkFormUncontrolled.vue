<script lang="ts">
import Vue, { PropType } from "vue"
import { Component, ProvideReactive } from "vue-property-decorator"
import { FormTypes, FormsAppsTypes } from "@oneblink/types"
import OneBlinkFormBase from "./OneBlinkFormBase.vue"
import generateDefaultData from "./services/generate-default-data"
import _cloneDeep from "lodash.clonedeep"

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
  },
  data(): DataProps {
    return {
      //TODO use prefill
      submission: generateDefaultData(this.definition.elements, {}),
      clonedDefinition: _cloneDeep(this.definition),
    }
  },
  methods: {
    updateSubmission(newSubmission: Record<string, unknown>) {
      Vue.set(this, "submission", { ...this.submission, ...newSubmission })
      console.log(JSON.stringify(this.submission, null, 2))
    },
    updateDefinition(newDefinition: FormTypes.Form) {
      Vue.set(this, "definition", newDefinition)
    },
    handleCancel() {
      this.$emit("cancel")
    },
  },
})

@Component
export default class OneBlinkFormUncontrolled extends OneBlinkFormUncontrolledBase {
  @ProvideReactive() submission: Record<string, unknown> = this.submission
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
    />
  </div>
</template>
