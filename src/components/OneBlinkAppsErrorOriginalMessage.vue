<script>
import Vue from "vue"
import { Fragment } from "vue-frag"
import { OneBlinkAppsError } from "@oneblink/apps"

export default Vue.extend({
  name: "OneBlinkAppsErrorOriginalMessage",
  components: { Fragment },
  props: {
    error: Error,
  },
  computed: {
    isOneBlinkAppsError() {
      return this.error instanceof OneBlinkAppsError
    },
  },
})
</script>

<template>
  <Fragment>
    <div class="content has-margin-top-6">
      <pre>{{ error.message }}</pre>
    </div>
    <OneBlinkAppsErrorOriginalMessage
      v-if="isOneBlinkAppsError"
      :error="error.originalError"
    />
  </Fragment>
</template>
