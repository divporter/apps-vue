<script lang="ts">
import Vue, { PropType } from "vue"

import { FormTypes } from "@oneblink/types"

import CopyToClipboardButton from "@/components/CopyToClipboardButton.vue"
import LookupButton from "@/components/LookupButton.vue"
import FormElementLabelContainer from "@/components/FormElementLabelContainer.vue"
import BarcodeScanner from "@/components/BarcodeScanner.vue"

type DataProps = {
  isDirty: boolean
  isCameraOpen: boolean
  error: Error | null
}

export default Vue.extend({
  components: {
    CopyToClipboardButton,
    LookupButton,
    FormElementLabelContainer,
    BarcodeScanner,
  },
  props: {
    id: { type: String, required: true },
    element: {
      type: Object as PropType<FormTypes.BarcodeScannerElement>,
      required: true,
    },
    value: {
      required: false,
    },
    displayValidationMessage: Boolean,
    validationMessage: { type: String, required: false },
    isLookup: Boolean,
  },
  data(): DataProps {
    return {
      isDirty: false,
      isCameraOpen: false,
      error: null,
    }
  },
  computed: {
    text(): string {
      return typeof this.value === "string" ? this.value : ""
    },
  },
  methods: {
    setIsDirty() {
      this.isDirty = true
    },
    updateSubmission(value: string | undefined) {
      this.$emit("updateSubmission", { name: this.element.name, value })
    },
    handleChange(e: { target: HTMLInputElement }) {
      this.updateSubmission(e.target.value || undefined)
    },
    handleScan(newValue: string | undefined) {
      this.setIsDirty()
      this.updateSubmission(newValue)
      this.isCameraOpen = false
      this.$emit("triggerLookup", newValue)
    },
    openBarcodeScanner() {
      if (window.cordova) {
        this.error = null
        // @ts-expect-error ???
        window.cordova.plugins.barcodeScanner.scan(
          // @ts-expect-error ???
          (result) => {
            if (!result.cancelled) {
              this.handleScan(result.text)
            }
          },
          // @ts-expect-error ???
          (error) => {
            this.error = new Error(
              `An error has occurred: "${error}". Please click "Cancel" below to try again. If the problem persists, please contact support.`
            )
          },
          {
            showFlipCameraButton: true,
            showTorchButton: true,
          }
        )
      } else {
        this.isCameraOpen = true
      }
    },
    triggerLookup() {
      this.$emit("triggerLookup", this.value)
    },
  },
})
</script>

<template>
  <div class="cypress-barcode-scanner-element">
    <FormElementLabelContainer
      className="ob-barcode-scanner"
      :element="element"
      :id="id"
      :required="element.required"
    >
      <figure v-if="error" class="ob-figure">
        <div class="figure-content has-text-centered">
          <div>
            <h4 className="title is-4">Whoops...</h4>
            <p>{{ error.message }}</p>
          </div>
        </div>
      </figure>
      <BarcodeScanner
        v-if="isCameraOpen"
        :element="element"
        @scan="handleScan"
        @close="() => (isCameraOpen = false)"
      />
      <div v-else>
        <div class="field has-addons">
          <div class="control is-expanded has-icons-right">
            <input
              type="text"
              :placeholder="element.placeholderValue"
              :id="id"
              :name="element.name"
              class="
                input
                ob-input
                cypress-barcode-scanner-control
                has-margin-bottom-8
              "
              :value="text"
              @input="handleChange"
              :required="element.required"
              :disabled="element.readOnly"
              @blur="setIsDirty"
            />
            <span class="ob-input-icon icon is-small is-right">
              <i class="material-icons is-size-5">document_scanner</i>
            </span>
          </div>
          <div v-if="!!element.readOnly && !!value" className="control">
            <CopyToClipboardButton
              className="button is-input-addon cypress-copy-to-clipboard-button"
              isInputButton
              :text="text"
            />
          </div>
          <LookupButton
            v-if="isLookup"
            isInputButton
            :value="value"
            :validationMessage="validationMessage"
            @click="triggerLookup"
          />
        </div>
        <button
          type="button"
          class="
            button
            ob-button ob-button__open
            is-primary
            cypress-start-scan-barcode-button
          "
          :disabled="element.readOnly"
          @click="() => (isCameraOpen = true)"
        >
          Scan Barcode
        </button>
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
  </div>
</template>
