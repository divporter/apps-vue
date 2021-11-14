<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"
import OneBlinkFormBase from "./OneBlinkFormBase.vue"

export default Vue.extend({
  components: {
    OneBlinkFormBase,
  },
  props: {
    definition: Object as PropType<FormTypes.Form>,
  },
})
</script>

<template>
  <OneBlinkFormBase :definition="definition" />
</template>
