<script lang="ts">
import Vue from "vue"
import { Component, Watch } from "vue-property-decorator"

import scrollingService from "../services/scrolling-service"

type DataProps = {
  isDirty: boolean
  penColour: string
  annotationButtonColours: string[]
}

const AnnotationModalBase = Vue.extend({
  props: {
    imageSrc: String,
  },
  data(): DataProps {
    return {
      isDirty: false,
      penColour: "#000000",
      annotationButtonColours: [
        "#000000",
        "#ffffff",
        "#f44336",
        "#e91e63",
        "#9c27b0",
        "#673ab7",
        "#3f51b5",
        "#2196f3",
        "#03a9f4",
        "#00bcd4",
        "#009688",
        "#4caf50",
        "#8bc34a",
        "#cddc39",
        "#ffee58",
        "#ffca28",
        "#ffa726",
        "#ff5722",
      ],
    }
  },
  methods: {
    handleCancelAnnotation() {
      if (this.$refs.signatureCanvasRef) {
        //@ts-expect-error js module
        this.$refs.signatureCanvasRef.clearSignature()
      }

      this.$emit("cancelAnnotation")
    },
    handleSaveAnnotation() {
      if (this.$refs.signatureCanvasRef) {
        //@ts-expect-error js module
        const { data } = this.$refs.signatureCanvasRef.saveSignature()
        this.$emit("saveAnnotation", data)
      }
    },
    onBegin() {
      // @ts-expect-error js module
      this.$refs.signatureCanvasRef.resizeCanvas()
    },
    onEnd() {
      this.isDirty = true
    },
    setCanvas() {
      // SETTING CANVAS FROM PASSED VALUE
      const annotationContentElement = this.$refs
        .annotationContentElementRef as Element
      const bmSignaturePadElement = this.$refs
        .bmSignaturePadRef as HTMLDivElement
      const signatureCanvas = this.$refs.signatureCanvasRef
      if (
        !annotationContentElement ||
        !bmSignaturePadElement ||
        !signatureCanvas ||
        typeof this.imageSrc !== "string"
      ) {
        return
      }
      this.isDirty = true

      // Disable scrolling to allow for smooth drawing
      scrollingService.disableScrolling()

      const maxWidth = annotationContentElement.clientWidth
      const maxHeight = annotationContentElement.clientHeight

      const i = new Image()
      i.onload = () => {
        const imageWidth = i.width
        const imageHeight = i.height
        let canvasWidth = imageWidth
        let canvasHeight = imageHeight

        if (imageWidth > maxWidth || imageHeight > maxHeight) {
          const widthRatio = maxWidth / imageWidth
          const heightRatio = maxHeight / imageHeight
          const ratio = Math.min(widthRatio, heightRatio)

          canvasWidth = ratio * imageWidth
          canvasHeight = ratio * imageHeight
        }

        bmSignaturePadElement.style.width = `${canvasWidth}px`
        bmSignaturePadElement.style.height = `${canvasHeight}px`
        bmSignaturePadElement.style.backgroundSize = "cover"
        bmSignaturePadElement.style.backgroundImage = `url(${this.imageSrc})`
      }
      i.src = this.imageSrc
    },
  },
})

@Component
export default class AnnotationModal extends AnnotationModalBase {
  @Watch("imageSrc")
  onImageSrcChange() {
    this.setCanvas()
  }

  mounted() {
    this.setCanvas()
  }

  beforeUnmount() {
    scrollingService.enableScrolling()
  }
}
</script>

<template>
  <div class="modal is-active">
    <div class="modal-background-faded"></div>
    <div class="ob-annotation">
      <div class="ob-annotation__buttons ob-annotation__buttons-colours">
        <button
          v-for="(colour, index) of annotationButtonColours"
          :key="index"
          type="button"
          :class="{
            button: true,
            'ob-annotation__button': true,
            'ob-annotation__button-colour': true,
            'cypress-annotation-colour-button': true,
            'is-selected': penColour === colour,
          }"
          @click="() => (penColour = colour)"
          :style="{ 'background-color': colour }"
        />
      </div>
      <div ref="annotationContentElementRef" class="ob-annotation__content">
        <div
          ref="bmSignaturePadRef"
          class="ob-annotation__signature-pad cypress-annotation-signature-pad"
        >
          <VueSignaturePad
            ref="signatureCanvasRef"
            :options="{ onBegin, onEnd, penColor: penColour }"
          />
        </div>
      </div>
      <div class="ob-annotation__buttons ob-annotation__buttons-actions">
        <button
          type="button"
          class="
            button
            is-light
            ob-button
            ob-annotation__button ob-annotation__button-action
            cypress-annotation-cancel-button
          "
          @click="handleCancelAnnotation"
        >
          Cancel
        </button>
        <button
          type="button"
          class="
            button
            is-primary
            ob-button
            ob-annotation__button ob-annotation__button-action
            cypress-annotation-save-button
          "
          :disabled="!isDirty"
          @click="handleSaveAnnotation"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>
