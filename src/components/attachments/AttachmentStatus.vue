<script lang="ts">
import Vue, { PropType } from "vue"
import { Fragment } from "vue-frag"

import UploadingAttachment from "./UploadingAttachment.vue"
import { FormTypes } from "@oneblink/types"
import { checkIsUsingLegacyStorage } from "../../services/attachments"

export default Vue.extend({
  components: {
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
    <v-tooltip v-if="uploadError" top>
      <template v-slot:activator="{ on, attrs }">
        <i class="material-icons has-text-danger" v-bind="attrs" v-on="on">
          error
        </i>
      </template>
      {{ uploadError.message }}
    </v-tooltip>
    <template v-else-if="checkIsUsingLegacyStorage(element)"><!-- --></template>
    <template v-else-if="isUploading">
      <span v-if="isUploadPaused" class="attachment__status-wrapper">
        <i class="material-icons">pause</i>
      </span>
      <UploadingAttachment v-else />
    </template>
    <v-tooltip v-else top>
      <template v-slot:activator="{ on, attrs }">
        <span class="attachment__status-wrapper" v-bind="attrs" v-on="on">
          <i class="material-icons has-text-success">check_circle</i>
        </span>
      </template>
      {{ tooltip }}
    </v-tooltip>
  </Fragment>
</template>
