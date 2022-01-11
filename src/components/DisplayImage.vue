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
    uploadErrorMessage: String,
    isUploading: Boolean,
    isLoadingImageUrl: Boolean,
    imageUrl: String,
    loadImageUrlError: Error,
    isLoading: Boolean,
    element: {
      type: Object as PropType<FormTypes.CameraElement>,
      required: true,
    },
  },
  methods: {
    onAnnotate() {
      this.$emit("annotate")
    },
  },
})
</script>

<template>
  <Fragment>
    <div v-if="uploadErrorMessage" class="figure-content">
      <h3 class="title is-3">Upload Failed</h3>
      <p>
        Your photo failed to upload, please press the <b>Clear</b> button and
        try again.
      </p>
    </div>
    <div v-else-if="loadImageUrlError" class="figure-content">
      <h3 class="title is-3">Preview Failed</h3>
      <p>{{ loadImageUrlError.message }}</p>
    </div>
    <div
      v-else-if="isLoadingImageUrl || isLoading"
      class="figure-content has-text-centered cypress-camera-loading-image"
    >
      <OnLoading small />
    </div>
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
      <img
        :src="imageUrl"
        class="cypress-camera-image ob-camera__img"
        crossorigin="anonymous"
      />
      <button
        type="button"
        class="
          button
          is-primary
          ob-camera__annotate-button
          cypress-annotate-button
        "
        @click="onAnnotate"
        :disabled="element.readOnly"
      >
        <span class="icon">
          <i class="material-icons">brush</i>
        </span>
      </button>
    </template>
    <div v-else class="figure-content">
      <ImagePreviewUnavailable />
    </div>
  </Fragment>
</template>
