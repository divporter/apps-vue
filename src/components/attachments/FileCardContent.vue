<script lang="ts">
import Vue from "vue"
import { Fragment } from "vue-frag"

export default Vue.extend({
  components: {
    Fragment,
  },
  props: {
    imageUrl: String,
  },
})
</script>

<template>
  <Fragment>
    <div v-if="imageUrl" class="ob-files__content-image">
      <img class="ob-files__image" :src="imageUrl" />
    </div>
    <div v-else class="ob-files__content-file has-text-centered">
      <i class="material-icons icon-large ob-files__attach-icon has-text-grey">
        attach_file
      </i>
    </div>
  </Fragment>
</template>
