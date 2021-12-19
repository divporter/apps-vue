<template>
  <v-app>
    <OneBlinkForm
      v-if="definition"
      :definition="definition"
      googleMapsApiKey="AIzaSyDO61UD5hx75GEPeDvJozrQT-ipPO2PGTs"
    />
  </v-app>
</template>

<script lang="ts">
import Vue from "vue"
import OneBlinkForm from "./OneBlinkFormUncontrolled.vue"
import { formService } from "@oneblink/apps"
import { FormTypes } from "@oneblink/types"
import "@oneblink/apps-react/dist/styles.css"

type DataProps = {
  definition?: FormTypes.Form
  loading: boolean
}

export default Vue.extend({
  components: {
    OneBlinkForm,
  },
  data(): DataProps {
    return {
      definition: undefined,
      loading: false,
    }
  },
  async mounted() {
    this.loading = true
    this.definition = await formService.getForm(9050, 992)
    this.loading = false
  },
})
</script>

<style lang="scss">
.ob-input-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.v-application {
  font-family: BlinkMacSystemFont, -apple-system, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    "Helvetica", "Arial", sans-serif;
}
</style>
