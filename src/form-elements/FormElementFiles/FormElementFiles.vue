<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"

import Files from "@/components/attachments/Files.vue"
import FormElementFile from "./FormElementFile.vue"

import { checkFileNameIsValid } from "@/services/form-validation"
import {
  prepareNewAttachment,
  correctFileOrientation,
} from "@/services/attachments"
import { canvasToBlob } from "@/services/blob-utils"
import { Attachment, AttachmentNew } from "@/types/attachments"

export default Vue.extend({
  components: {
    Files,
    FormElementFile,
  },
  props: {
    id: { type: String, required: true },
    element: {
      type: Object as PropType<FormTypes.FilesElement>,
      required: true,
    },
    value: Array as PropType<Attachment[]>,
    displayValidationMessage: Boolean,
    validationMessage: String,
  },
  data() {
    return {
      isDirty: false,
    }
  },
  computed: {
    attachments(): Attachment[] {
      return this.value || []
    },
  },
  methods: {
    setIsDirty() {
      this.isDirty = true
    },
    disableUpload(attachment: Attachment): boolean {
      return (
        (!!this.element.maxEntries &&
          this.attachments.length > this.element.maxEntries) ||
        !checkFileNameIsValid(this.element, attachment.fileName)
      )
    },
    async addAttachments(files: File[]) {
      if (!files.length) return
      const newAttachments: AttachmentNew[] = await Promise.all(
        files.map(async (file) => {
          const result = await correctFileOrientation(file)
          if (result instanceof Blob) {
            return prepareNewAttachment(result, file.name, this.element)
          }

          const blob = await canvasToBlob(result)
          return prepareNewAttachment(blob, file.name, this.element)
        })
      )

      if (!Array.isArray(this.value) || !this.value.length) {
        this.$emit("updateSubmission", newAttachments)
        return
      }

      this.$emit("updateSubmission", [...this.value, ...newAttachments])

      this.setIsDirty()
    },
    changeAttachment({
      id,
      attachment,
    }: {
      id: string
      attachment: Attachment
    }) {
      if (!this.value) {
        return
      }
      this.$emit(
        "updateSubmission",
        this.value.map((att) => {
          // Can only change attachments that are not uploaded (have a type)
          if (att.type && att._id === id) {
            return attachment
          }
          return att
        })
      )
      this.setIsDirty()
    },
    removeAttachment(id: string) {
      if (!this.value) {
        return
      }
      this.$emit(
        "updateSubmission",
        this.value.filter((att) => {
          if (!att.type) {
            return att.id !== id
          }
          return att._id !== id
        })
      )

      this.setIsDirty()
    },
    updateSubmission({
      value: payload,
    }: {
      value: {
        id?: string
        attachment?: Attachment
      }
    }) {
      const { id, attachment } = payload
      if (attachment && !attachment.type) {
        this.$emit(
          "updateSubmission",
          this.value.map((att) => {
            // override attachments with a type with an that are uploaded (do not have a type)
            if (att.type && att._id === id) {
              return attachment
            }
            return att
          })
        )
      }
    },
  },
})
</script>

<template>
  <Files
    :id="id"
    :isDirty="isDirty"
    :element="element"
    :attachments="attachments"
    :displayValidationMessage="displayValidationMessage"
    :validationMessage="validationMessage"
    @addFiles="addAttachments"
  >
    <FormElementFile
      v-for="(attachment, index) of attachments"
      :key="index"
      :element="element"
      @remove="removeAttachment"
      :value="attachment"
      @changeAttachment="changeAttachment"
      :disableUpload="disableUpload(attachment)"
      @updateSubmission="updateSubmission"
    />
  </Files>
</template>
