<script lang="ts">
import mixins from "vue-typed-mixins"
import { Fragment } from "vue-frag"

import AttachmentMixin from "../../mixins/Attachment"

import DisplayImage from "./DisplayImage.vue"

export default mixins(AttachmentMixin).extend({
  components: {
    DisplayImage,
    Fragment,
  },
  methods: {
    clear() {
      this.$emit("updateSubmission", { value: undefined })
    },
  },
})
</script>

<template>
  <Fragment>
    <figure class="ob-figure">
      <div class="figure-content">
        <DisplayImage
          :isUploading="isUploading"
          :uploadErrorMessage="uploadErrorMessage"
          :isLoadingImageUrl="imageUrl === undefined"
          :imageUrl="imageUrl"
          :loadImageUrlError="loadImageUrlError"
          :element="element"
          @annotate="() => (isAnnotating = true)"
          :canDownload="canDownload"
        />
      </div>
    </figure>

    <div class="buttons ob-buttons">
      <button
        type="button"
        class="
          button
          ob-button
          is-light
          ob-button__clear
          cypress-clear-signature
        "
        @click="clear"
        :disabled="element.readOnly"
      >
        Clear
      </button>
    </div>
  </Fragment>
</template>
