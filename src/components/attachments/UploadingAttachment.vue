<script lang="ts">
import mixins from "vue-typed-mixins"
import { TippyComponent } from "vue-tippy"

import IsOfflineMixin from "@/mixins/IsOffline"
import OnLoading from "../OnLoading.vue"

export default mixins(IsOfflineMixin).extend({
  components: {
    OnLoading,
    tippy: TippyComponent,
  },
})
</script>

<template>
  <tippy arrow theme="google" size="large" placement="bottom">
    <template v-slot:trigger>
      <div class="cypress-attachment-uploading">
        <i v-if="isOffline" class="material-icons has-text-warning">wifi_off</i>
        <OnLoading v-else tiny />
      </div>
    </template>
    {{
      isOffline
        ? "Upload will start when you connect to the internet"
        : "Uploading"
    }}
  </tippy>
</template>
