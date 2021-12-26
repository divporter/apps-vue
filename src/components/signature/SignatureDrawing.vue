<script lang="ts">
import Vue, { PropType } from "vue"
import { Component, Watch } from "vue-property-decorator"
import mixins from "vue-typed-mixins"
import { Fragment } from "vue-frag"
import trimCanvas from "trim-canvas"

import AttachmentMixin from "../../mixins/Attachment"

import { FormTypes } from "@oneblink/types"

import scrollingService from "../../services/scrolling-service"
import {
  checkIsUsingLegacyStorage,
  prepareNewAttachment,
} from "../../services/attachments"
import { urlToBlobAsync } from "../../services/blob-utils"

const SignatureDrawingBase = mixins(AttachmentMixin).extend({
  components: {
    Fragment,
  },
  props: {
    element: { type: Object as PropType<FormTypes.DrawElement> },
  },
  data() {
    return {
      isEmpty: true,
    }
  },
  methods: {
    onBegin() {
      window.cordova ? scrollingService.disableScrolling : undefined
      // @ts-expect-error js module
      this.$refs.canvasRef.resizeCanvas()
    },
    handleClear() {
      if (this.$refs.canvasRef) {
        console.log("Clearing signature...")
        //@ts-expect-error js module
        this.$refs.canvasRef.clearSignature()
      }
      this.isEmpty = true
    },
    async handleDone() {
      const canvasRef = this.$refs.canvasRef as Vue
      if (!canvasRef) return
      trimCanvas(canvasRef.$refs.signaturePadCanvas)
      // trimCanvas(this.$refs.canvasRef)
      //@ts-expect-error js module
      const { data } = this.$refs.canvasRef.saveSignature()

      if (checkIsUsingLegacyStorage(this.element)) {
        this.$emit("updateSubmission", { attachment: data })
        return
      }

      // Convert base64 data uri to blob and send it on its way
      const blob = await urlToBlobAsync(data)
      this.$emit("updateSubmission", {
        attachment: prepareNewAttachment(blob, "signature.png", this.element),
      })
    },
    handleEndDraw() {
      if (window.cordova) {
        scrollingService.enableScrolling()
      }
      if (this.isEmpty) {
        this.isEmpty = false
      }
    },
    resize() {
      if (this.$refs.canvasRef) {
        //@ts-expect-error js module
        this.$refs.canvasRef.resizeCanvas()
      }
    },
  },
  mounted() {
    window.addEventListener("resize", this.resize)
    // this.resize()
  },
})

@Component
export default class SignatureDrawing extends SignatureDrawingBase {
  beforeDestroy() {
    window.removeEventListener("resize", this.resize)
  }

  @Watch("element")
  onElementChange() {
    if (!this.$refs.canvasRef) {
      return
    }
    if (this.element.readOnly) {
      //@ts-expect-error js module
      this.$refs.canvasRef.lockSignaturePad()
    } else {
      //@ts-expect-error js module
      this.$refs.canvasRef.openSignaturePad()
    }
  }
}
</script>

<template>
  <Fragment>
    <div>
      <div class="ob-signature__control">
        <VueSignaturePad
          ref="canvasRef"
          :options="{ onBegin, onEnd: handleEndDraw }"
          class="
            input
            ob-signature__control
            cypress-signature-control
            signature-pad
          "
        />
      </div>
    </div>

    <div class="buttons ob-buttons">
      <button
        type="button"
        class="
          button
          ob-button
          is-light
          ob-button__clear
          cypress-clear-signature
        "
        @click="handleClear"
        :disabled="element.readOnly || isEmpty"
      >
        Clear
      </button>
      <button
        type="button"
        class="
          button
          ob-button ob-button__done
          is-primary
          cypress-done-signature-button
        "
        @click="handleDone"
        :disabled="element.readOnly || isEmpty"
      >
        Done
      </button>
    </div>
  </Fragment>
</template>
