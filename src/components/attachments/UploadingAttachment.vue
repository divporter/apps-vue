<script lang="ts">
import mixins from "vue-typed-mixins"

import IsOfflineMixin from "@/mixins/IsOffline"
import OnLoading from "../OnLoading.vue"

export default mixins(IsOfflineMixin).extend({
  components: {
    OnLoading,
  },
})
</script>

<template>
  <v-tooltip top>
    <template v-slot:activator="{ on, attrs }">
      <div class="cypress-attachment-uploading" v-bind="attrs" v-on="on">
        <i v-if="isOffline" class="material-icons has-text-warning">wifi_off</i>
        <OnLoading v-else tiny />
      </div>
    </template>
    {{
      isOffline
        ? "Upload will start when you connect to the internet"
        : "Uploading"
    }}
  </v-tooltip>
</template>
