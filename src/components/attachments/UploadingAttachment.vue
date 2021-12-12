<script lang="ts">
import Vue from "vue"
import OnLoading from "../OnLoading.vue"

export default Vue.extend({
  components: {
    OnLoading,
  },
  computed: {
    isOffline(): boolean {
      return window.navigator && !window.navigator.onLine
    },
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
