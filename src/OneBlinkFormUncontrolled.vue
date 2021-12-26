<script lang="ts">
import Vue, { PropType } from "vue"
import { Component, ProvideReactive } from "vue-property-decorator"
import { FormTypes } from "@oneblink/types"
import OneBlinkFormBase from "./OneBlinkFormBase.vue"
import generateDefaultData from "./services/generate-default-data"

type DataProps = {
  submission: Record<string, unknown>
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
  },
  data(): DataProps {
    return {
      //TODO use prefill
      submission: generateDefaultData(this.definition.elements, {}),
    }
  },
  methods: {
    updateSubmission(newSubmission: Record<string, unknown>) {
      Vue.set(this, "submission", { ...this.submission, ...newSubmission })
      console.log(JSON.stringify(this.submission, null, 2))
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
      :definition="definition"
      :submission="submission"
      @updateSubmission="updateSubmission"
      :isReadOnly="isReadOnly"
      :googleMapsApiKey="googleMapsApiKey"
      :captchaSiteKey="captchaSiteKey"
    />
  </div>
</template>
