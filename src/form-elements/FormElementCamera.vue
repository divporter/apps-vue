<script lang="ts">
import { PropType } from "vue"
import mixins from "vue-typed-mixins"

import AttachmentMixin from "../mixins/Attachment"
import { FormElementBinaryStorageValue } from "../types/attachments"

import downloadAttachment, {
  downloadFileLegacy,
} from "../services/download-file"
import { FormTypes } from "@oneblink/types"

import drawTimestampOnCanvas from "../services/drawTimestampOnCanvas"

import { Fragment } from "vue-frag"
import FormElementLabelContainer from "@/components/FormElementLabelContainer.vue"
import DisplayImage from "@/components/DisplayImage.vue"

import AnnotationModal from "@/components/AnnotationModal.vue"
import Modal from "@/components/Modal.vue"
import {
  checkIfContentTypeIsImage,
  checkIsUsingLegacyStorage,
  prepareNewAttachment,
  correctFileOrientation,
} from "../services/attachments"
import {
  blobToCanvas,
  canvasToBlob,
  urlToBlobAsync,
} from "../services/blob-utils"

type DataProps = {
  isLoading: boolean
  cameraError: Error | null
  isAnnotating: boolean
  isDirty: boolean
}

export default mixins(AttachmentMixin).extend({
  components: {
    Fragment,
    FormElementLabelContainer,
    DisplayImage,
    AnnotationModal,
    Modal,
  },
  props: {
    id: { type: String, required: true },
    element: {
      type: Object as PropType<FormTypes.CameraElement>,
      required: true,
    },
    value: {
      type: Object as PropType<FormElementBinaryStorageValue>,
      required: false,
    },
    displayValidationMessage: Boolean,
    validationMessage: { type: String, required: false },
  },
  data(): DataProps {
    return {
      isLoading: false,
      cameraError: null,
      isAnnotating: false,
      isDirty: false,
    }
  },
  methods: {
    async setBase64DataUri(dataUri: string, fileName: string) {
      if (checkIsUsingLegacyStorage(this.element)) {
        this.updateSubmission({ attachment: dataUri })
        return
      }

      // Convert base64 data uri to blob and send it on its way
      const blob = await urlToBlobAsync(dataUri)
      this.updateSubmission({
        attachment: prepareNewAttachment(blob, fileName, this.element),
      })
    },
    clearImage() {
      this.updateSubmission({ attachment: undefined })
    },
    async fileChange(changeEvent: { target: HTMLInputElement }) {
      if (!changeEvent.target || !changeEvent.target.files) {
        return
      }

      const file = changeEvent.target.files[0]
      if (!file) {
        return
      }

      this.isLoading = true

      console.log("File selected event", file)
      try {
        if (!checkIfContentTypeIsImage(file.type)) {
          throw new Error(
            `Invalid file type "${file.type}". Please select an image.`
          )
        }
        const result = await correctFileOrientation(
          file,
          this.element.includeTimestampWatermark
            ? drawTimestampOnCanvas
            : undefined
        )

        const isUsingLegacyStorage = checkIsUsingLegacyStorage(this.element)
        if (result instanceof Blob) {
          if (isUsingLegacyStorage) {
            const canvas = await blobToCanvas(result)
            this.updateSubmission({ attachment: canvas.toDataURL() })
          } else {
            this.updateSubmission({
              attachment: prepareNewAttachment(result, file.name, this.element),
            })
          }
        } else {
          if (isUsingLegacyStorage) {
            this.updateSubmission({ attachment: result.toDataURL() })
          } else {
            const blob = await canvasToBlob(result)
            this.updateSubmission({
              attachment: prepareNewAttachment(blob, file.name, this.element),
            })
          }
        }

        this.isDirty = true
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        this.cameraError = error as Error
      }
    },
    openCamera() {
      if (window.cordova && navigator.camera && navigator.camera.getPicture) {
        this.isLoading = true
        navigator.camera.getPicture(
          (base64Data: string) => {
            this.setBase64DataUri(
              `data:image/jpeg;base64,${base64Data}`,
              "photo.jpeg"
            )
              .then(() => {
                this.isLoading = false
              })
              .catch((error) => {
                this.cameraError = error
                this.isLoading = false
              })
          },
          (error: Error) => {
            console.warn(
              "An error occurred while attempting to take a photo",
              error
            )
            this.isLoading = false
            this.cameraError = error
          },
          {
            quality: 100,
            destinationType: window.Camera.DestinationType.DATA_URL,
            sourceType: window.Camera.PictureSourceType.CAMERA,
            allowEdit: false,
            encodingType: window.Camera.EncodingType.JPEG,
            mediaType: window.Camera.MediaType.PICTURE,
            correctOrientation: true,
            saveToPhotoAlbum: false,
            cameraDirection: window.Camera.Direction.BACK,
          }
        )
      } else if (this.$refs.fileInputRef) {
        // RESET HTML FILE INPUT VALUE SO FILES PREVIOUSLY ADDED AND REMOVED ARE RECOGNIZED
        //TODO type this
        ;(this.$refs.fileInputRef as HTMLInputElement).value = ""
        ;(this.$refs.fileInputRef as HTMLInputElement).click()
      } else {
        console.error(
          'Could not find "input" element in Camera component template'
        )
      }
    },
    async handleDownload() {
      if (typeof this.value === "string") {
        await downloadFileLegacy(this.value, this.id)
      } else if (this.value && this.value.type !== "ERROR") {
        await downloadAttachment(this.value)
      }
    },
    handleSaveAnnotation(annotationDataUri: string) {
      this.isAnnotating = false

      if (typeof this.imageUrl !== "string") {
        return
      }

      this.isLoading = true

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        return
      }

      const image = new Image()
      image.onload = () => {
        canvas.width = image.width
        canvas.height = image.height

        ctx.drawImage(image, 0, 0)

        const annotationImage = new Image()
        annotationImage.onload = () => {
          ctx.drawImage(annotationImage, 0, 0, canvas.width, canvas.height)

          try {
            const base64Data = canvas.toDataURL()
            this.setBase64DataUri(base64Data, "photo.png")
              .then(() => {
                this.isLoading = false
              })
              .catch((error) => {
                this.cameraError = error
                this.isLoading = false
              })
          } catch (error) {
            this.cameraError = error as Error
            this.isLoading = false
          }
        }
        annotationImage.src = annotationDataUri
      }
      image.setAttribute("crossorigin", "anonymous")
      image.src = this.imageUrl
    },
  },
})
</script>

<template>
  <Fragment>
    <FormElementLabelContainer
      className="ob-camera"
      :element="element"
      :id="id"
      :required="element.required"
    >
      <div class="control">
        <figure v-if="value || isLoading" class="ob-figure">
          <DisplayImage
            :isUploading="isUploading"
            :uploadErrorMessage="uploadErrorMessage"
            :isLoadingImageUrl="imageUrl === undefined"
            :imageUrl="imageUrl"
            :loadImageUrlError="loadImageUrlError"
            :isLoading="isLoading"
            :element="element"
            @annotate="() => (isAnnotating = true)"
            :canDownload="canDownload"
          />
        </figure>
        <input
          ref="fileInputRef"
          class="ob-input ob-camera__input-hidden cypress-camera-control"
          type="file"
          accept="image/*"
          capture="environment"
          :id="id"
          :name="element.name"
          :required="element.required"
          :disabled="element.readOnly"
          @change="fileChange"
        />
        <div class="buttons ob-buttons">
          <template v-if="value">
            <button
              type="button"
              class="
                button
                ob-button ob-button__clear
                is-light
                cypress-clear-camera
              "
              @click="
                {
                  clearImage
                }
              "
              :disabled="element.readOnly || isLoading"
            >
              Clear
            </button>
            <button
              v-if="canDownload"
              type="button"
              class="
                button
                ob-button ob-button__download
                is-primary
                cypress-download-file-button
              "
              @click="handleDownload"
            >
              <span class="icon">
                <i class="material-icons">cloud_download</i>
              </span>
              <span>&nbsp;Download</span>
            </button>
          </template>
          <button
            v-else
            type="button"
            class="
              button
              ob-button ob-button__open
              is-primary
              cypress-open-camera
            "
            @click="openCamera"
            :disabled="element.readOnly || isLoading"
          >
            Open Camera
          </button>
        </div>
      </div>

      <div
        v-if="(isDirty || displayValidationMessage) && !!validationMessage"
        role="alert"
        class="has-margin-top-8"
      >
        <div class="has-text-danger ob-error__text cypress-validation-message">
          {{ validationMessage }}
        </div>
      </div>
    </FormElementLabelContainer>

    <AnnotationModal
      v-if="isAnnotating && imageUrl"
      :imageSrc="imageUrl"
      @cancelAnnotation="() => (this.isAnnotating = false)"
      @saveAnnotation="handleSaveAnnotation"
    />

    <Modal
      :isOpen="cameraError"
      title="Whoops..."
      class="cypress-error-modal"
      titleClassName="cypress-error-title"
    >
      <template v-slot:default>
        <p>
          An error occurred while attempting to take a photo. Please click{" "}
          <b>Okay</b> below to try again. If the problem persists, please
          contact support.
        </p>

        <div class="content has-margin-top-6">
          <blockquote>{cameraError.toString()}</blockquote>
        </div>
      </template>
      <template v-slot:footer>
        <button
          type="button"
          class="button ob-button is-primary cypress-close-error-button"
          @click="() => (this.isLoading = false)"
        >
          Okay
        </button>
      </template>
    </Modal>
  </Fragment>
</template>
