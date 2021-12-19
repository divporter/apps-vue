<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"

import { Fragment } from "vue-frag"
import OnLoading from "@/components/OnLoading.vue"
import AttachmentStatus from "@/components/attachments/AttachmentStatus.vue"
import ImagePreviewUnavailable from "@/components/attachments/ImagePreviewUnavailable.vue"

export default Vue.extend({
  components: {
    Fragment,
    OnLoading,
    AttachmentStatus,
    ImagePreviewUnavailable,
  },
  props: {
    element: {
      type: Object as PropType<FormTypes.DrawElement>,
      required: true,
    },
    uploadErrorMessage: String,
    isUploading: Boolean,
    isLoadingImageUrl: Boolean,
    imageUrl: String,
    loadImageUrlError: Error,
  },
})
</script>

<template>
  <Fragment>
    <template v-if="uploadErrorMessage">
      <h3 class="title is-3">Upload Failed</h3>
      <p>
        Your signature failed to upload, please press the <b>Clear</b> button
        and try again.
      </p>
    </template>
    <template v-else-if="loadImageUrlError">
      <h3 class="title is-3">Preview Failed</h3>
      <p>{{ loadImageUrlError.message }}</p>
    </template>
    <OnLoading
      v-else-if="isLoadingImageUrl"
      small
      className="cypress-signature-loading-image"
    />
    <template v-else-if="imageUrl">
      <span class="ob-figure__status">
        <AttachmentStatus
          :element="element"
          :isLoadingImageUrl="isLoadingImageUrl"
          :loadImageUrlError="loadImageUrlError"
          :isUploading="isUploading"
          :imageUrl="imageUrl"
        />
      </span>
      <img :src="imageUrl" class="cypress-signature-image ob-signature__img" />
    </template>
    <ImagePreviewUnavailable v-else />
  </Fragment>
</template>

<style scoped>
.title {
  font-weight: 200;
  line-height: 1.125;
  font-family: BlinkMacSystemFont, -apple-system, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    "Helvetica", "Arial", sans-serif !important;
}

.is-3 {
  font-size: 2rem !important;
}
</style>
