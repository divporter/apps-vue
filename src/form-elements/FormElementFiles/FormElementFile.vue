<script lang="ts">
import Vue, { PropType } from "vue"
import mixins from "vue-typed-mixins"

import AttachmentMixin from "@/mixins/Attachment"
import downloadAttachment from "@/services/download-file"
import { FormTypes } from "@oneblink/types"
// import useAttachment, { OnChange } from '../../hooks/attachments/useAttachment'
import FileCard from "@/components/attachments/FileCard.vue"
import { Attachment } from "@/types/attachments"

export default mixins(AttachmentMixin).extend({
  components: {
    FileCard,
  },
  props: {
    element: {
      type: Object as PropType<FormTypes.FilesElement>,
      required: true,
    },
    value: {
      type: Object as PropType<Attachment>,
      required: true,
    },
    disableUpload: Boolean,
  },
  methods: {
    handleRemove() {
      if (!this.value.type) {
        this.$emit("remove", this.value.id)
        return
      }
      this.$emit("remove", this.value._id)
    },
    handleDownload() {
      downloadAttachment(this.value)
    },
    handleRetry() {
      if (this.value.type === "ERROR") {
        this.$emit("changeAttachment", {
          id: this.value._id,
          attachment: {
            type: "NEW",
            _id: this.value._id,
            data: this.value.data,
            fileName: this.value.fileName,
            isPrivate: this.value.isPrivate,
          },
        })
      }
    },
  },
})
</script>

<template>
  <FileCard
    :element="element"
    :isUploading="isUploading"
    :isUploadPaused="disableUpload"
    :uploadErrorMessage="uploadErrorMessage"
    :loadImageUrlError="loadImageUrlError"
    :isLoadingImageUrl="imageUrl === undefined"
    :imageUrl="imageUrl"
    :fileName="value.fileName"
    :canDownload="canDownload"
    @download="handleDownload"
    :canRetry="value && value.type === 'ERROR'"
    @retry="handleRetry"
    @remove="handleRemove"
  />
</template>
