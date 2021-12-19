<script lang="ts">
import Vue, { PropType } from "vue"

import ClickOutsideElement from "@/components/ClickOutsideElement.vue"
import { FormTypes } from "@oneblink/types"
import FileCardContent from "./FileCardContent.vue"
import AttachmentStatus from "@/components/attachments/AttachmentStatus.vue"
import { checkFileNameIsValid } from "../../services/form-validation"

type DataProps = {
  isShowingMore: boolean
}

export default Vue.extend({
  components: {
    ClickOutsideElement,
    AttachmentStatus,
    FileCardContent,
  },
  props: {
    element: {
      type: Object as PropType<FormTypes.FilesElement>,
      required: true,
    },
    isUploading: Boolean,
    isUploadPaused: Boolean,
    uploadErrorMessage: String,
    loadImageUrlError: Error,
    isLoadingImageUrl: Boolean,
    imageUrl: String,
    fileName: String,
    canRetry: Boolean,
    canDownload: Boolean,
  },
  data(): DataProps {
    return {
      isShowingMore: false,
    }
  },
  computed: {
    uploadError(): Error | undefined {
      if (!checkFileNameIsValid(this.element, this.fileName)) {
        return new Error(
          `${this.fileName.split(".").pop()} files are not allowed`
        )
      }
      if (this.uploadErrorMessage) {
        return new Error(this.uploadErrorMessage)
      }
      return undefined
    },
  },
  methods: {
    hideMore() {
      this.isShowingMore = false
    },
    showMore() {
      this.isShowingMore = true
    },
    handleClickOutside() {
      if (this.isShowingMore) {
        this.hideMore()
      }
    },
    handleRetry() {
      this.hideMore()
      this.$emit("retry")
    },
    handleDownload() {
      this.hideMore()
      this.$emit("download")
    },
    handleRemove() {
      this.hideMore()
      this.$emit("remove")
    },
    toggle() {
      this.isShowingMore ? this.hideMore() : this.showMore()
    },
  },
})
</script>

<template>
  <div class="column is-one-quarter">
    <div class="ob-files__box">
      <div class="ob-files__content">
        <FileCardContent :imageUrl="imageUrl" />
      </div>
      <ClickOutsideElement
        @clickOutside="handleClickOutside"
        refName="dropDownRef"
      >
        <template v-slot>
          <div
            :class="{
              dropdown: true,
              'is-right': true,
              'ob-files__menu': true,
              'is-active': isShowingMore,
            }"
            ref="dropDownRef"
          >
            <div class="dropdown-trigger">
              <button
                type="button"
                class="button ob-files__menu-button cypress-file-menu-button"
                aria-haspopup="true"
                aria-controls="dropdown-menu"
                @click="toggle"
              >
                <i class="material-icons ob-files__menu-icon">more_vert</i>
              </button>
            </div>
            <div class="dropdown-menu" role="menu">
              <div class="dropdown-content">
                <a
                  v-if="canRetry"
                  class="dropdown-item cypress-file-retry-button"
                  @click="handleRetry"
                >
                  Retry
                </a>

                <a
                  v-if="canDownload"
                  class="dropdown-item cypress-file-download-button"
                  @click="handleDownload"
                >
                  Download
                </a>
                <a
                  :class="{
                    'dropdown-item': true,
                    'cypress-file-remove-button': true,
                    'ob-files__menu-remove-hidden': element.readOnly,
                  }"
                  @click="handleRemove"
                >
                  Remove
                </a>
              </div>
            </div>
          </div>
        </template>
      </ClickOutsideElement>
      <div class="ob-files__file-name is-size-6">
        <span clas="ob-files__file-name-inner">{{ fileName }}</span>
        <AttachmentStatus
          :element="element"
          :isUploading="isUploading"
          :isUploadPaused="isUploadPaused"
          :uploadError="uploadError"
          :loadImageUrlError="loadImageUrlError"
          :isLoadingImageUrl="isLoadingImageUrl"
          :imageUrl="imageUrl"
        />
      </div>
    </div>
  </div>
</template>
