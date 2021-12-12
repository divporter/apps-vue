<script lang="ts">
import Vue, { PropType } from "vue"
import { Component, Provide, ProvideReactive } from "vue-property-decorator"
import { FormTypes } from "@oneblink/types"
import OneBlinkFormBase from "./OneBlinkFormBase.vue"
import generateDefaultData from "./services/generate-default-data"
// import eventBus from "./services/event-bus"

type DataProps = {
  submission: Record<string, unknown>
}

const OneBlinkFormUncontrolledBase = Vue.extend({
  components: {
    OneBlinkFormBase,
  },
  props: {
    definition: Object as PropType<FormTypes.Form>,
    isReadOnly: Boolean,
  },
  data(): DataProps {
    return {
      //TODO use prefill
      submission: generateDefaultData(this.definition.elements, {})
    }
  },
  methods: {
    updateSubmission(newSubmission: Record<string, unknown>) {
      Vue.set(this, "submission", { ...this.submission, ...newSubmission })
      console.log(JSON.stringify(this.submission, null, 2))
      // eventBus.$emit("submissionChanged", { ...this.submission })
    },
  },
  mounted() {
    // eventBus.$emit("submissionChanged", { ...this.submission })
  },
})

@Component
export default class OneBlinkFormUncontrolled extends OneBlinkFormUncontrolledBase {
  @ProvideReactive() submission: Record<string, unknown> = this.submission
  // @Provide() formSubmissionModel: string = this.submissionStr
}
</script>

<template>
  <div>
    <OneBlinkFormBase
      :definition="definition"
      :submission="submission"
      @updateSubmission="updateSubmission"
      :isReadOnly="isReadOnly"
    />
  </div>
</template>
