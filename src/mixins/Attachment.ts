import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"
import { authService, submissionService } from "@oneblink/apps"
import { checkIfContentTypeIsImage } from "../services/attachments"
//TODO
// import useAuth from "../../hooks/useAuth"
import { urlToBlobAsync } from "../services/blob-utils"

import {
  AttachmentNew,
  FormElementBinaryStorageValue,
} from "../types/attachments"

type DataProps = {
  isPrivate: boolean
  imageUrl: string | null
  loadImageUrlError: Error | null
  abortControllerUpload: AbortController
  ignoreUpload: boolean
  abortControllerDownload: AbortController
  ignoreDownload: boolean
}

export default Vue.extend({
  inject: ["definition"],
  props: {
    element: {
      type: Object as PropType<FormTypes.CameraElement>,
      required: true,
    },
    value: {
      type: Object as PropType<FormElementBinaryStorageValue>,
      required: false,
    },
    disableUpload: Boolean,
  },
  data(): DataProps {
    return {
      isPrivate: this.element.storageType === "private",
      imageUrl: null,
      loadImageUrlError: null,
      abortControllerUpload: new AbortController(),
      ignoreUpload: false,
      abortControllerDownload: new AbortController(),
      ignoreDownload: false,
    }
  },
  computed: {
    formId(): number {
      //@ts-expect-error it's injected
      return this.definition.id
    },
    isOffline(): boolean {
      return window.navigator && !window.navigator.onLine
    },
    isLoggedIn(): boolean {
      return authService.isLoggedIn()
    },
    isUsingFormsKey(): boolean {
      //TODO need to pass down from top
      return false
    },
    isAuthenticated(): boolean {
      return this.isLoggedIn || this.isUsingFormsKey
    },
    isUploading(): boolean {
      return !!(
        this.value &&
        typeof this.value !== "string" &&
        this.value.type &&
        this.value.type === "NEW"
      )
    },
    uploadErrorMessage(): string | null {
      if (
        this.value &&
        typeof this.value !== "string" &&
        this.value.type &&
        this.value.type === "ERROR"
      ) {
        return this.value.errorMessage
      }
      return null
    },
    canDownload(): boolean {
      return (
        !!this.value &&
        (typeof this.value === "string" ||
          !!this.value.type ||
          !this.value.isPrivate ||
          this.isAuthenticated)
      )
    },
  },
  methods: {
    updateSubmission(attachment?: FormElementBinaryStorageValue) {
      this.$emit("updateSubmission", {
        name: this.element.name,
        value: attachment,
      })
    },
    triggerUpload() {
      this.abortControllerUpload.abort()
      this.ignoreUpload = true
      const formId = this.formId

      if (
        this.isOffline ||
        this.disableUpload ||
        !this.formId ||
        !this.value ||
        typeof this.value !== "object" ||
        this.value.type !== "NEW"
      ) {
        return
      }

      const newAttachment = this.value as AttachmentNew

      this.ignoreUpload = false
      const abortController = new AbortController()

      const effect = async () => {
        try {
          console.log(
            "Attempting to upload attachment...",
            newAttachment.fileName
          )
          const upload = await submissionService.uploadAttachment(
            {
              formId,
              fileName: newAttachment.fileName,
              contentType: newAttachment.data.type,
              data: newAttachment.data,
              isPrivate: this.isPrivate,
            },
            abortController.signal
          )
          if (this.ignoreUpload) {
            return
          }

          console.log("Successfully Uploaded attachment!", upload)

          // UPDATE ATTACHMENT
          //TODO $emit
          this.updateSubmission(upload)
          // onChange(newAttachment._id, upload)
        } catch (error) {
          if (this.ignoreUpload) {
            return
          }

          console.warn(
            "Failed to upload attachment...",
            newAttachment.fileName,
            error
          )
          this.updateSubmission({
            ...newAttachment,
            type: "ERROR",
            errorMessage: (error as Error).message,
          })
          //TODO $emit
          // onChange(newAttachment._id, {
          //   ...newAttachment,
          //   type: "ERROR",
          //   errorMessage: (error as Error).message,
          // })
        }
      }

      effect()
    },
    triggerDownload() {
      this.ignoreDownload = true
      this.abortControllerDownload.abort()
      if (!this.value) {
        return
      }

      // If the value is string we will assume a base64 data uri
      if (typeof this.value === "string") {
        this.imageUrl = this.value
        return
      }

      if (this.value.type) {
        if (!checkIfContentTypeIsImage(this.value.data.type)) {
          // Not an image which we will represent as null
          this.imageUrl = null
          return
        }

        const imageUrl = URL.createObjectURL(this.value.data)
        console.log("Created object url from blob for image", imageUrl)
        this.imageUrl = imageUrl
        return
      }

      if (!checkIfContentTypeIsImage(this.value.contentType)) {
        // Not an image which we will represent as null
        this.imageUrl = null
        return
      }

      // If the file is a public url we can finish here and just use that
      if (!this.value.isPrivate) {
        this.imageUrl = this.value.url
        return
      }

      // If user is not logged in, we can't download private images.
      // Luckily, the imageUrl should already be set as the blob
      // url from when they uploaded it. Same applies if they are offline.
      if (!this.isAuthenticated || this.isOffline) {
        this.imageUrl = this.imageUrl || null
        return
      }

      this.ignoreDownload = false
      const abortController = new AbortController()
      const privateImageUrl = this.value.url

      const effect = async () => {
        try {
          const blob = await urlToBlobAsync(
            privateImageUrl,
            true,
            abortController.signal
          )
          if (this.ignoreDownload) {
            return
          }

          const imageUrl = URL.createObjectURL(blob)
          console.log(
            "Created object url from private attachment for image",
            imageUrl
          )
          this.imageUrl = imageUrl
        } catch (error) {
          if (this.ignoreDownload) {
            return
          }
          console.warn("Error loading file:", error)
          this.loadImageUrlError = error
        }
      }
      effect()
    },
  },
  watch: {
    disableUpload() {
      this.triggerUpload()
    },
    formId() {
      this.triggerUpload()
    },
    isOffline() {
      this.triggerUpload()
      this.triggerDownload()
    },
    isPrivate() {
      this.triggerUpload()
    },
    value() {
      this.triggerUpload()
      this.triggerDownload()
    },
    isAuthenticated() {
      this.triggerDownload()
    },
  },
  beforeDestroy() {
    const imageUrl = this.imageUrl
    if (imageUrl && imageUrl.startsWith("blob:")) {
      console.log("revoking image url:", imageUrl)
      URL.revokeObjectURL(imageUrl)
    }
  },
})
