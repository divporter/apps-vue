<script lang="ts">
import Vue, { PropType } from "vue"
import { Component, Watch } from "vue-property-decorator"
import { FormTypes } from "@oneblink/types"
import jsQR from "jsqr"
import { Sentry } from "@oneblink/apps"

import quaggaReader from "@/services/barcode-readers/quagger"

import OnLoading from "@/components/OnLoading.vue"

type DataProps = {
  isLoading: boolean
  selectedDeviceId: string | null
  error: Error | null
  camera: HTML5Camera | null
  ignore: boolean
}

const MS_BETWEEN_IMAGE_PROCESSING = 10
const fadedSquareWidthInPixels = 200
const fadedSquareHeightInPixels = 150
const redLineHeightInPixels = 1

const BarcodeScannerBase = Vue.extend({
  components: {
    OnLoading,
  },
  props: {
    element: {
      type: Object as PropType<FormTypes.BarcodeScannerElement>,
      required: true,
    },
  },
  data(): DataProps {
    //TODO try using state, see if things are faster
    return {
      isLoading: true,
      selectedDeviceId: null,
      error: null,
      camera: null,
      ignore: false,
    }
  },
  methods: {
    setError(error: Error) {
      this.error = error
      this.isLoading = false
      this.selectedDeviceId = null
    },
    scanImageForBarcode(
      videoElement: HTMLVideoElement,
      waitInMS: number,
      options: Record<string, number>,
      checkStop: () => boolean
    ) {
      const restrictedBarcodeTypes = this.element.restrictedBarcodeTypes || []
      // Using $timeout here instead of $interval as we dont know
      // exactly how long each processing of the image will take.
      setTimeout(async () => {
        if (checkStop()) return
        const canvasElement = document.createElement("canvas")

        canvasElement.width = options.sourceWidth
        canvasElement.height = options.sourceHeight

        const canvasContext = canvasElement.getContext("2d")
        if (canvasContext) {
          canvasContext.drawImage(
            videoElement,
            options.sourceX,
            options.sourceY,
            canvasElement.width,
            canvasElement.height,
            0,
            0,
            canvasElement.width,
            canvasElement.height
          )

          if (
            !this.element.restrictBarcodeTypes ||
            (this.element.restrictedBarcodeTypes || []).indexOf("qr_reader") >
              -1
          ) {
            const imageData = canvasContext.getImageData(
              0,
              0,
              canvasElement.width,
              canvasElement.height
            )

            const code = jsQR(
              imageData.data,
              imageData.width,
              imageData.height,
              {
                inversionAttempts: "dontInvert",
              }
            )

            if (code) {
              return this.$emit("scan", code.data)
            }
          }
        }

        if (
          !this.element.restrictBarcodeTypes ||
          !(
            restrictedBarcodeTypes.length === 1 &&
            restrictedBarcodeTypes[0] === "qr_reader"
          )
        ) {
          const base64Image = canvasElement.toDataURL("image/png")
          const quaggaResult = await quaggaReader(
            base64Image,
            restrictedBarcodeTypes
          )
          if (quaggaResult) {
            return this.$emit("scan", quaggaResult)
          }
        }

        if (checkStop()) return

        this.scanImageForBarcode(
          videoElement,
          MS_BETWEEN_IMAGE_PROCESSING,
          options,
          checkStop
        )
      }, waitInMS)
    },
    switchCamera() {
      if (!this.camera) {
        return
      }

      // We will just be rotating between the available camera.
      const nextDeviceIndex =
        this.camera.availableDevices.findIndex(
          (mediaDeviceInfo) =>
            this.camera !== null &&
            mediaDeviceInfo.deviceId === this.camera.activeDeviceId
        ) + 1
      const nextDevice =
        this.camera.availableDevices[nextDeviceIndex] ||
        this.camera.availableDevices[0]
      this.error = null
      this.isLoading = true
      this.selectedDeviceId = nextDevice.deviceId
    },
    onClose() {
      this.$emit("close")
    },
  },
  mounted() {
    if (!this.$refs.videoElementRef) {
      return
    }

    const newCamera = new HTML5Camera(
      this.$refs.videoElementRef as HTMLVideoElement
    )
    this.camera = newCamera
  },
})

@Component
export default class BarcodeScanner extends BarcodeScannerBase {
  beforeDestroy() {
    if (this.camera) {
      this.camera.close()
    }
  }

  @Watch("camera")
  onChange() {
    if (
      !this.camera ||
      this.error ||
      // If attempting to open the device that is currently open,
      // we will not attempt to open again.
      (this.selectedDeviceId &&
        this.camera.activeDeviceId === this.selectedDeviceId)
    ) {
      return
    }

    this.ignore = false
    ;(async () => {
      try {
        const videoElement = this.$refs.videoElementRef as HTMLVideoElement
        const figureElement = this.$refs.figureElementRef as Element
        if (!videoElement || !figureElement || !this.camera) {
          return
        }

        console.log("Opening camera with:", this.selectedDeviceId || "UNKNOWN")
        await this.camera.open(this.selectedDeviceId || undefined)

        if (this.ignore) {
          return
        }

        this.error = null
        this.isLoading = false

        await Vue.nextTick()

        const fadedSquareElement = figureElement.getElementsByClassName(
          "ob-barcode-scanner__square"
        )[0] as HTMLDivElement
        const redLineElement = figureElement.getElementsByClassName(
          "ob-barcode-scanner__line"
        )[0] as HTMLDivElement
        console.log("videoElement Width pixels", videoElement.clientWidth)
        console.log("videoElement Height pixels", videoElement.clientHeight)
        console.log("videoElement Width", videoElement.videoWidth)
        console.log("videoElement Height", videoElement.videoHeight)

        // Faded Square needs its values set in pixels
        const fadedSquareLeftInPixels =
          (videoElement.clientWidth - fadedSquareWidthInPixels) / 2
        console.log("fadedSquareLeftInPixels", fadedSquareLeftInPixels)
        const fadedSquareTopInPixels =
          (videoElement.clientHeight - fadedSquareHeightInPixels) / 2
        console.log("fadedSquareTopInPixels", fadedSquareTopInPixels)

        fadedSquareElement.style.borderBottom = `${fadedSquareTopInPixels}px`
        fadedSquareElement.style.borderTop = `${fadedSquareTopInPixels}px`
        fadedSquareElement.style.borderLeft = `${fadedSquareLeftInPixels}px`
        fadedSquareElement.style.borderRight = `${fadedSquareLeftInPixels}px`
        fadedSquareElement.style.borderColor = "rgba(0, 0, 0, 0.25)"
        fadedSquareElement.style.borderStyle = "solid"

        redLineElement.style.height = `${redLineHeightInPixels}px`
        redLineElement.style.top = `${
          (videoElement.clientHeight - redLineHeightInPixels) / 2
        }px`
        redLineElement.style.left = `${fadedSquareLeftInPixels}px`
        redLineElement.style.right = `${fadedSquareLeftInPixels}px`

        // Need to calculate the actual width, which is not in pixels
        const ratio = videoElement.videoWidth / videoElement.clientWidth
        console.log("pixel to video Ratio", ratio)

        const left = ratio * fadedSquareLeftInPixels
        console.log("left in video measurement", left)
        const top = ratio * fadedSquareTopInPixels
        console.log("top in video measurement", top)

        const fadedSquareWidth = fadedSquareWidthInPixels * ratio
        console.log("red square in video measurement", fadedSquareWidth)

        // Wait a little before scanning the first image
        // to prevent image processing staring before
        // camera is ready.
        this.scanImageForBarcode(
          videoElement,
          250,
          {
            sourceX: left,
            sourceY: top,
            sourceWidth: fadedSquareWidth,
            sourceHeight: fadedSquareWidth,
          },
          () => this.ignore
        )
      } catch (error) {
        if (this.ignore) {
          return
        }
        console.warn("Error while attempting to open camera", error)
        Sentry.captureException(error)
        switch ((error as Error).name) {
          case "NotSupportedError": {
            this.setError(
              new Error(
                'Your browser does not support accessing your camera. Please click "Cancel" below and type in the barcode value manually.'
              )
            )
            break
          }
          case "NotAllowedError": {
            this.setError(
              new Error(
                'Cannot scan for barcodes without granting the application access to the camera. Please click "Cancel" below to try again.'
              )
            )
            break
          }
          default: {
            this.setError(
              new Error(
                'An unknown error has occurred, please click "Cancel" below to try again. If the problem persists, please contact support.'
              )
            )
          }
        }
      }
    })()
  }
}

class HTML5Camera {
  availableDevices: MediaDeviceInfo[]
  htmlVideoElement: HTMLVideoElement
  mediaStream: MediaStream | undefined

  constructor(htmlVideoElement: HTMLVideoElement) {
    this.htmlVideoElement = htmlVideoElement
    this.availableDevices = []
    this.mediaStream = undefined
  }

  get activeDeviceId(): string | undefined {
    if (this.mediaStream) {
      const [activeMediaStreamTrack] = this.mediaStream.getTracks()
      return activeMediaStreamTrack?.getSettings()?.deviceId
    }
    return undefined
  }

  async open(deviceId?: string) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const error = new Error()
      error.name = "NotSupportedError"
      throw error
    }

    this.close()

    const constraints = {
      video: {
        facingMode: deviceId ? undefined : "environment",
        deviceId: deviceId ? { exact: deviceId } : undefined,
      },
    }
    const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
    this.mediaStream = mediaStream
    this.htmlVideoElement.srcObject = mediaStream

    if (!this.availableDevices.length) {
      const availableDevices = await navigator.mediaDevices.enumerateDevices()
      this.availableDevices = availableDevices.filter(
        (mediaDeviceInfo) =>
          mediaDeviceInfo.kind === "videoinput" && !!mediaDeviceInfo.deviceId
      )
    }

    await new Promise((resolve) =>
      this.htmlVideoElement.addEventListener("canplay", resolve, {
        once: true,
      })
    )
  }

  close() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => {
        track.stop()
      })
      this.mediaStream = undefined
    }
  }
}
</script>

<template>
  <div>
    <figure class="ob-figure" ref="figureElementRef">
      <div class="figure-content has-text-centered">
        <OnLoading v-if="isLoading" small />

        <div v-if="!!error">
          <h4 className="title is-4">Whoops...</h4>
          <p>{{ error.message }}</p>
        </div>

        <div :class="{ 'is-relative': true, 'is-hidden': isLoading || error }">
          <div class="ob-barcode-scanner__square"></div>
          <div class="ob-barcode-scanner__line"></div>
          <video
            ref="videoElementRef"
            autoPlay
            playsInline
            class="ob-barcode-scanner__video"
          />
        </div>
      </div>
    </figure>

    <div class="buttons ob-buttons">
      <button
        type="button"
        class="
          button
          ob-button ob-button__cancel
          is-light
          cypress-cancel-scan-barcode-button
        "
        @click="onClose"
      >
        Cancel
      </button>
      <button
        v-if="camera && (camera.availableDevices.length || 1) > 1"
        type="button"
        className="button ob-button ob-button__switch-camera is-primary cypress-switch-camera-button"
        @click="switchCamera"
      >
        Switch Camera
      </button>
    </div>
  </div>
</template>
