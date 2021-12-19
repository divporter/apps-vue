<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"
import Files from "@/components/attachments/Files.vue"
import FormElementFile from "./FormElementFile.vue"
import { parseFilesAsAttachmentsLegacy } from "@/services/attachments"
import { FilesElementFile } from "@/types/files"

export default Vue.extend({
  props: {
    id: { type: String, required: true },
    element: {
      type: Object as PropType<FormTypes.FilesElement>,
      required: true,
    },
    value: Array as PropType<Array<FilesElementFile>>,
    displayValidationMessage: Boolean,
    validationMessage: String,
  },
  components: {
    Files,
    FormElementFile,
  },
  data() {
    return {
      isDirty: false,
    }
  },
  methods: {
    async addFile(newFiles: File[]) {
      const attachments = await parseFilesAsAttachmentsLegacy(newFiles)
      if (!attachments.length) {
        return
      }
      this.$emit("updateSubmission", [...(this.value || []), ...attachments])
      this.isDirty = true
    },
    handleRemove(index: number) {
      let newValue
      if (this.value) {
        newValue = this.value.filter((file, i) => i !== index)
        if (newValue.length === 0) {
          newValue = undefined
        }
      }
      this.$emit("updateSubmission", newValue)
    },
  },
})
</script>

<template>
  <Files
    :id="id"
    :element="element"
    :isDirty="isDirty"
    :attachments="value || []"
    :displayValidationMessage="displayValidationMessage"
    :validationMessage="validationMessage"
    @addFiles="addFile"
  >
    <template v-slot>
      <FormElementFile
        v-for="(attachment, index) of value || []"
        :key="index"
        :element="element"
        @remove="handleRemove"
        :file="attachment"
        :index="index"
      />
    </template>
  </Files>
</template>
