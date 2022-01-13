<script lang="ts">
import Vue, { PropType } from "vue"
import { Component, Watch, InjectReactive } from "vue-property-decorator"

import { TheMask } from "vue-the-mask"
import CopyToClipboardButton from "@/components/CopyToClipboardButton.vue"
import LookupButton from "@/components/LookupButton.vue"
import { FormTypes, MiscTypes } from "@oneblink/types"
import FormElementLabelContainer from "@/components/FormElementLabelContainer.vue"
import { formService } from "@oneblink/apps"

type DataProps = {
  text: string
  isDirty: boolean
  isLoading: boolean
  errorMessage: string | null
  bsbRecord: MiscTypes.BSBRecord | null
  abortController: AbortController
}

const FormElementBSBBase = Vue.extend({
  components: {
    CopyToClipboardButton,
    LookupButton,
    FormElementLabelContainer,
    TheMask,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    element: {
      type: Object as PropType<FormTypes.BSBElement>,
    },
    value: { required: true },
    displayValidationMessage: Boolean,
    validationMessage: { type: String, required: false },
    isLookup: Boolean,
  },
  data(): DataProps {
    return {
      text: typeof this.value === "string" ? this.value : "",
      isDirty: false,
      isLoading: false,
      errorMessage: null,
      bsbRecord: null,
      abortController: new AbortController(),
    }
  },
  computed: {
    isValidFormat(): boolean {
      return /\d{3}-\d{3}/.test(this.text)
    },
  },
  methods: {
    updateSubmission(
      value?: string | { isValidating: boolean; isInvalid: boolean }
    ) {
      this.$emit("updateSubmission", {
        name: this.element.name,
        value: value || undefined,
      })
    },
    setIsDirty() {
      this.isDirty = true
    },
    triggerLookup() {
      this.$emit("triggerLookup", this.value)
    },
    setText(e: string) {
      this.text = e
    },
  },
})

@Component
export default class FormElementBSB extends FormElementBSBBase {
  @InjectReactive() definition!: FormTypes.Form

  @Watch("bsbRecord")
  onValueChange() {
    if (this.bsbRecord) {
      this.updateSubmission(this.bsbRecord.bsb)
    }
  }

  @Watch("text")
  onTextChange(text: string) {
    this.abortController.abort()
    if (text === "") {
      return
    }

    if (!this.isValidFormat) {
      this.isLoading = false
      this.errorMessage = null
      this.bsbRecord = null
      return
    }

    this.isLoading = true
    this.errorMessage = null
    this.bsbRecord = null

    this.abortController = new AbortController()
    const getBSBRecord = async () => {
      this.updateSubmission({ isValidating: true, isInvalid: false })
      try {
        const bsbRecord = await formService.getBSBRecord(
          this.definition.id,
          text,
          this.abortController.signal
        )
        if (!this.abortController.signal.aborted) {
          this.isLoading = false
          this.errorMessage = null
          this.bsbRecord = bsbRecord
        }
      } catch (error) {
        console.warn("Error validating BSB number", error)
        if (!this.abortController.signal.aborted) {
          this.updateSubmission({ isValidating: false, isInvalid: true })
          this.isLoading = false
          this.errorMessage = `The BSB number "${text}" does not exist`
          this.bsbRecord = null
        }
      }
    }

    getBSBRecord()
  }
}
</script>

<template>
  <div class="cypress-bsb-element">
    <FormElementLabelContainer
      className="ob-bsb"
      :id="id"
      :element="element"
      :required="element.required"
    >
      <div class="field has-addons">
        <div :class="{ 'control is-expanded': true, 'is-loading': isLoading }">
          <the-mask
            mask="###-###"
            :masked="true"
            type="text"
            :placeholder="element.placeholderValue"
            :id="id"
            :name="element.name"
            class="input ob-input cypress-bsb-control"
            :value="text"
            @input="setText"
            :required="element.required"
            :disabled="element.readOnly"
            @blur.native="setIsDirty"
          />
        </div>

        <div v-if="bsbRecord" class="control ob-bsb__record-control">
          <a class="button is-static ob-bsb__record-button">
            {{ bsbRecord.financialInstitutionMnemonic }} - {{ bsbRecord.name }}
          </a>
        </div>

        <div v-if="!!element.readOnly && !!value" class="control">
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
          :isLookup="isLookup"
          :validationMessage="validationMessage"
          @click="triggerLookup"
        />
      </div>
      <div
        v-if="
          ((isDirty || displayValidationMessage) &&
            !!validationMessage &&
            !isLoading) ||
          errorMessage
        "
        role="alert"
        class="has-margin-top-8"
      >
        <div class="has-text-danger ob-error__text cypress-validation-message">
          {{ errorMessage || validationMessage }}
        </div>
      </div>
    </FormElementLabelContainer>
  </div>
</template>
