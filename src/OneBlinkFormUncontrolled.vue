<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"
import OneBlinkFormBase from "./OneBlinkFormBase.vue"
import generateDefaultData from "./services/generate-default-data"

export default Vue.extend({
  components: {
    OneBlinkFormBase,
  },
  props: {
    definition: Object as PropType<FormTypes.Form>,
  },
  data() {
    return {
      //TODO use prefill
      submission: generateDefaultData(this.definition.elements, {}),
    }
  },
  methods: {
    updateSubmission(newSubmission: Record<string, unknown>) {
      Vue.set(this, "submission", { ...this.submission, ...newSubmission })
    },
  },
})
</script>

<template>
  <OneBlinkFormBase
    :definition="definition"
    :submission="submission"
    @updateSubmission="updateSubmission"
  />
</template>
