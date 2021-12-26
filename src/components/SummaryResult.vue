<script lang="ts">
import Vue, { PropType } from "vue"
import { Fragment } from "vue-frag"

type FormElementSummaryResults = Array<string | FormElementSummaryResults>

export default Vue.extend({
  name: "SummaryResult",
  components: {
    Fragment,
  },
  props: {
    results: Array as PropType<FormElementSummaryResults>,
  },
})
</script>

<template>
  <Fragment>
    <div
      v-for="(result, i) of results"
      :key="`${result.toString()}-${i}`"
      class="ob-summary__result-container"
    >
      <p
        v-if="typeof result === 'string'"
        class="ob-summary__result has-line-breaks cypress-summary-result-text"
      >
        {{ result }}
      </p>
      <SummaryResult v-else-if="result" :results="result"></SummaryResult>
    </div>
  </Fragment>
</template>
