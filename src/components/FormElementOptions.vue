<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"

import { Fragment } from "vue-frag"
import OnLoading from "./OnLoading.vue"

export default Vue.extend({
  components: {
    Fragment,
    OnLoading,
  },
  props: {
    options: Array as PropType<FormTypes.ChoiceElementOption[]>,
  },
})
</script>

<template>
  <Fragment>
    <div v-if="!options">
      <OnLoading className="has-text-centered" small></OnLoading>
    </div>
    <div v-if="!options.length">
      <div class="has-text-grey is-size-7">
        We were unable to load your options. Please contact your administrator.
      </div>
    </div>
    <slot></slot>
  </Fragment>
</template>
