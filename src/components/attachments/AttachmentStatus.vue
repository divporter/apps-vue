<script lang="ts">
import Vue, { PropType } from "vue"
import { Fragment } from "vue-frag"
import { TippyComponent } from "vue-tippy"

import UploadingAttachment from "./UploadingAttachment.vue"
import { FormTypes } from "@oneblink/types"
import { checkIsUsingLegacyStorage } from "../../services/attachments"

export default Vue.extend({
  components: {
    tippy: TippyComponent,
    Fragment,
    UploadingAttachment,
  },
  props: {
    element: {
      type: Object as PropType<FormTypes.FormElementBinaryStorage>,
      required: true,
    },
    isUploading: Boolean,
    isUploadPaused: Boolean,
    uploadError: Error,
    loadImageUrlError: Error,
    isLoadingImageUrl: Boolean,
    imageUrl: String,
  },
  computed: {
    tooltip(): string {
      if (this.isLoadingImageUrl && !this.imageUrl) {
        return "Attempting to load file preview. File is synced with submission."
      }
      if (this.loadImageUrlError && !this.imageUrl) {
        return "File preview not available, however file is synced with submission."
      }

      return "Synced with submission."
    },
  },
  methods: {
    checkIsUsingLegacyStorage,
  },
})
</script>

<template>
  <Fragment>
    <tippy
      v-if="uploadError"
      arrow
      theme="google"
      size="large"
      placement="bottom"
    >
      <template v-slot:trigger>
        <i class="material-icons has-text-danger"> error </i>
      </template>
      {{ uploadError.message }}
    </tippy>
    <template v-else-if="checkIsUsingLegacyStorage(element)"><!-- --></template>
    <template v-else-if="isUploading">
      <span v-if="isUploadPaused" class="attachment__status-wrapper">
        <i class="material-icons">pause</i>
      </span>
      <UploadingAttachment v-else />
    </template>
    <tippy v-else arrow theme="google" size="large" placement="bottom">
      <span class="attachment__status-wrapper">
        <i class="material-icons has-text-success">check_circle</i>
      </span>
      {{ tooltip }}
    </tippy>
  </Fragment>
</template>
