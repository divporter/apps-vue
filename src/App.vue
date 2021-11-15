<template>
  <div v-if="definition">
    <OneBlinkForm :definition="definition" />
  </div>
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
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
