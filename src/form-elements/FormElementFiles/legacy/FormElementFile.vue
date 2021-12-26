<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"
import { FilesElementFile } from "@/types/files"
import { checkIfContentTypeIsImage } from "../../../services/attachments"
import { downloadFileLegacy } from "../../../services/download-file"
import FileCard from "@/components/attachments/FileCard.vue"

export default Vue.extend({
  components: {
    FileCard,
  },
  props: {
    file: { type: Object as PropType<FilesElementFile>, required: true },
    element: {
      type: Object as PropType<FormTypes.FilesElement>,
      required: true,
    },
    index: { type: Number, required: true },
  },
  computed: {
    isImageType(): boolean {
      const matches = this.file.data.match(/data:(\w*\/\w*);base64/)
      if (!matches) {
        return false
      }
      return checkIfContentTypeIsImage(matches[1])
    },
  },
  methods: {
    handleRemove() {
      this.$emit("remove", this.index)
    },
    handleDownload() {
      downloadFileLegacy(this.file.data, this.file.fileName)
    },
  },
})
</script>

<template>
  <FileCard
    :element="element"
    :imageUrl="isImageType ? file.data : undefined"
    :fileName="file.fileName"
    canDownload
    @download="handleDownload"
    @remove="handleRemove"
  />
</template>
