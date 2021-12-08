<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"
import OneBlinkFormBase from "./OneBlinkFormBase.vue"
import generateDefaultData from "./services/generate-default-data"
import eventBus from "./services/event-bus"

export default Vue.extend({
  components: {
    OneBlinkFormBase,
  },
  props: {
    definition: Object as PropType<FormTypes.Form>,
    isReadOnly: Boolean,
  },
  data() {
    return {
      //TODO use prefill
      submission: {},
    }
  },
  methods: {
    updateSubmission(newSubmission: Record<string, unknown>) {
      Vue.set(this, "submission", { ...this.submission, ...newSubmission })
      console.log(JSON.stringify(this.submission, null, 2))
      eventBus.$emit("submissionChanged", { ...this.submission })
    },
  },
  mounted() {
    this.submission = generateDefaultData(this.definition.elements, {})
    eventBus.$emit("submissionChanged", { ...this.submission })
  },
})
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
