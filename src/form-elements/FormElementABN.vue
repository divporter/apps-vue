<script lang="ts">
import Vue, { PropType } from "vue"
import { Component, Watch, InjectReactive } from "vue-property-decorator"

import { TheMask } from "vue-the-mask"
import { parseString } from "xml2js"
import CopyToClipboardButton from "@/components/CopyToClipboardButton.vue"
import LookupButton from "@/components/LookupButton.vue"
import { FormTypes, MiscTypes } from "@oneblink/types"
import FormElementLabelContainer from "@/components/FormElementLabelContainer.vue"
import { abnService } from "@oneblink/sdk-core"

type DataProps = {
  label: string
  isFocused: boolean
  isDirty: boolean
  isLoading: boolean
  error: Error | null
  abortController: AbortController
}

const FormElementABNBase = Vue.extend({
  components: {
    TheMask,
    CopyToClipboardButton,
    LookupButton,
    FormElementLabelContainer,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    element: {
      type: Object as PropType<FormTypes.ABNElement>,
    },
    value: Object as PropType<MiscTypes.ABNRecord>,
    displayValidationMessage: Boolean,
    validationMessage: { type: String, required: false },
    isLookup: Boolean,
  },
  data(): DataProps {
    return {
      label: this.value
        ? abnService.getABNNumberFromABNRecord(this.value) || ""
        : "",
      isFocused: false,
      isDirty: false,
      isLoading: false,
      error: null,
      abortController: new AbortController(),
    }
  },
  methods: {
    updateSubmission(value: unknown | undefined) {
      this.$emit("updateSubmission", {
        name: this.element.name,
        value: value,
      })
    },
    setLabel(value: string) {
      this.label = value
    },
    setLabelAndClearValue(e: string) {
      this.setLabel(e)
      if (this.value) {
        this.updateSubmission(undefined)
      }
    },
    setIsDirty() {
      this.isDirty = true
    },
    setIsDirtyAndRemoveFocus() {
      this.setIsDirty()
      this.isFocused = false
    },
    setIsFocused() {
      this.isFocused = true
    },
    triggerLookup() {
      this.$emit("triggerLookup")
    },
    displayBusinessNameFromABNRecord:
      abnService.displayBusinessNameFromABNRecord,
  },
})

@Component
export default class FormElementABN extends FormElementABNBase {
  @InjectReactive() abnLookupAuthenticationGuid!: string

  @Watch("label")
  onLabelChange() {
    const searchString = this.label.replace(/[^\d]/g, "")
    const isSearchStringValid =
      searchString.length === 11 ||
      (searchString.length === 9 && !this.isFocused)

    const currentABNNumber = this.value
      ? abnService.getABNNumberFromABNRecord(this.value)
      : ""
    if (!isSearchStringValid || currentABNNumber === searchString) {
      return
    }

    this.isLoading = true
    this.error = null

    this.abortController = new AbortController()
    const fetchRecord = async () => {
      try {
        const urlSearchParams = new URLSearchParams()
        urlSearchParams.append("searchString", searchString)
        urlSearchParams.append("includeHistoricalDetails", "N")
        if (this.abnLookupAuthenticationGuid) {
          urlSearchParams.append(
            "authenticationGuid",
            this.abnLookupAuthenticationGuid
          )
        }

        const url =
          searchString.length === 11
            ? "https://abr.business.gov.au/abrxmlsearch/AbrXmlSearch.asmx/SearchByABNv202001"
            : "https://abr.business.gov.au/abrxmlsearch/AbrXmlSearch.asmx/SearchByASICv201408"
        const response = await fetch(`${url}?${urlSearchParams.toString()}`, {
          mode: "cors",
          signal: this.abortController.signal,
        })
        const text = await response.text()
        if (!response.ok) {
          throw new Error(text)
        }

        const result = await new Promise<{
          ABRPayloadSearchResults: {
            response: {
              businessEntity201408?: MiscTypes.ABNRecord
              businessEntity202001: MiscTypes.ABNRecord
              exception?: {
                exceptionDescription: string
                exceptionCode: string
              }
            }
          }
        }>((resolve, reject) => {
          parseString(
            text,
            {
              explicitArray: false,
            },
            (err, result) => {
              if (err) {
                reject(err)
              } else {
                resolve(result)
              }
            }
          )
        })
        if (result.ABRPayloadSearchResults.response.exception) {
          throw new Error(
            result.ABRPayloadSearchResults.response.exception.exceptionDescription
          )
        }

        if (result.ABRPayloadSearchResults.response.businessEntity201408) {
          result.ABRPayloadSearchResults.response.businessEntity202001 =
            result.ABRPayloadSearchResults.response.businessEntity201408
        }

        if (
          !Array.isArray(
            result.ABRPayloadSearchResults.response.businessEntity202001
              .businessName
          )
        ) {
          result.ABRPayloadSearchResults.response.businessEntity202001.businessName =
            [
              result.ABRPayloadSearchResults.response.businessEntity202001
                .businessName,
            ]
        }

        if (!this.abortController.signal.aborted) {
          this.updateSubmission(
            result.ABRPayloadSearchResults.response.businessEntity202001
          )
          this.isLoading = false
          this.error = null
        }
      } catch (err) {
        if (!this.abortController.signal.aborted) {
          this.isLoading = false
          this.error = err as Error
        }
      }
    }

    fetchRecord()
  }

  @Watch("value")
  onValueChange() {
    if (this.value) {
      const newLabel = abnService.getABNNumberFromABNRecord(this.value)
      if (!newLabel) {
        // Record in value had no ABN Number. This should never happen
        return
      }
      if (this.label !== newLabel) {
        this.label = newLabel.split("").reduce((memo, character, index) => {
          switch (index) {
            case 2:
            case 5:
            case 8: {
              return `${memo} ${character}`
            }
            default: {
              return `${memo}${character}`
            }
          }
        }, "")
      }
    }
  }
}
</script>

<template>
  <div class="cypress-abn-element">
    <FormElementLabelContainer
      className="ob-abn"
      :id="id"
      :element="element"
      :required="element.required"
    >
      <div class="field has-addons">
        <div :class="{ 'control is-expanded': true, 'is-loading': isLoading }">
          <the-mask
            :mask="isFocused || value ? '## ### ### ###' : '### ### ###'"
            :masked="true"
            type="text"
            :placeholder="element.placeholderValue"
            :id="id"
            :name="element.name"
            class="input ob-input cypress-bsb-control"
            :value="label"
            @input="setLabelAndClearValue"
            :required="element.required"
            :disabled="element.readOnly"
            @blur.native="setIsDirtyAndRemoveFocus"
            @focus.native="setIsFocused"
          />
        </div>
        <div v-if="value" class="control ob-abn__record-control">
          <a class="button is-static ob-abn__record-button">
            {{ displayBusinessNameFromABNRecord(value) }}
          </a>
        </div>
        <div v-if="!!element.readOnly && !!value" class="control">
          <CopyToClipboardButton
            className="button is-input-addon cypress-copy-to-clipboard-button"
            isInputButton
            :text="label"
          />
        </div>
        <LookupButton
          v-if="isLookup"
          isInputButton
          :value="value"
          :validationMessage="validationMessage"
          :isLookup="isLookup"
          @click="triggerLookup"
        />
      </div>

      <div
        v-if="
          ((isDirty || displayValidationMessage) &&
            !!validationMessage &&
            !isLoading) ||
          error
        "
        role="alert"
        class="has-margin-top-8"
      >
        <div class="has-text-danger ob-error__text cypress-validation-message">
          {{ error ? error.message : validationMessage }}
        </div>
      </div>
    </FormElementLabelContainer>
  </div>
</template>
