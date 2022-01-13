<script lang="ts">
import Vue, { PropType } from "vue"
import { Component, Watch } from "vue-property-decorator"
import { localisationService, Sentry } from "@oneblink/apps"
import { FormTypes } from "@oneblink/types"
import Flatpickr from "flatpickr"
import { Options as FlatpickrOptions } from "flatpickr/dist/types/options"
import { Instance as FlatpickrInstance } from "flatpickr/dist/types/instance"

import CopyToClipboardButton from "@/components/CopyToClipboardButton.vue"
import LookupButton from "@/components/LookupButton.vue"
import FormElementLabelContainer from "@/components/FormElementLabelContainer.vue"

import { generateDate, parseDateValue } from "../services/generate-default-data"

type DataProps = {
  isDirty: boolean
  vp: FlatpickrInstance | null
  dateOnly: boolean
}

const FormElementDateBase = Vue.extend({
  components: {
    FormElementLabelContainer,
    CopyToClipboardButton,
    LookupButton,
  },
  props: {
    id: { type: String, required: true },
    element: {
      type: Object as PropType<FormTypes.DateElement>,
      required: true,
    },
    value: { required: true },
    displayValidationMessage: Boolean,
    validationMessage: { type: String, required: false },
    isLookup: Boolean,
  },
  data(): DataProps {
    return { isDirty: false, vp: null, dateOnly: true }
  },
  computed: {
    flatpickrOptions(): FlatpickrOptions {
      return {
        altInput: true,
        dateFormat: "Y-m-d",
        altFormat: localisationService.flatpickrDateFormat,
        allowInput: true,
        altInputClass: "input ob-input cypress-date-control",
        minDate: parseDateValue({
          dateOnly: this.dateOnly,
          daysOffset: this.element.fromDateDaysOffset,
          value: this.element.fromDate,
        }),
        maxDate: parseDateValue({
          dateOnly: this.dateOnly,
          daysOffset: this.element.toDateDaysOffset,
          value: this.element.toDate,
        }),
        defaultDate: undefined,
        allowInvalidPreload: true,
        onClose: this.setIsDirty,
        static: true,
        onChange: this.onChange,
      }
    },
    text(): string | null {
      if (typeof this.value === "string") {
        const date = generateDate({
          daysOffset: undefined,
          value: this.value,
          dateOnly: true,
        })
        if (date) {
          return localisationService.formatDate(date)
        }
      }
      return null
    },
    valueAndVp(): { value?: unknown; vp: FlatpickrInstance | null } {
      return {
        value: this.value,
        vp: this.vp,
      }
    },
  },
  methods: {
    setIsDirty() {
      this.isDirty = true
    },
    getDateValue(date: Date | undefined) {
      if (!date) return
      if (this.dateOnly && this.vp) {
        return this.vp.formatDate(date, "Y-m-d")
      }
      return date.toISOString()
    },
    onChange(selectedDates: Date[]) {
      const date = this.getDateValue(selectedDates[0])
      this.updateSubmission(date)
    },
    triggerLookup() {
      this.$emit("triggerLookup", this.value)
    },
    updateSubmission(input: string | undefined) {
      if (input !== this.value) {
        this.$emit("updateSubmission", {
          name: this.element.name,
          value: input || undefined,
        })
      }
    },
  },
  mounted() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.vp = new (Flatpickr as any)(`[id="${this.id}"]`, {
      ...this.flatpickrOptions,
      appendTo: this.$refs.htmlDivElementRef as Element,
    })
  },
})

@Component
export default class FormElementDate extends FormElementDateBase {
  @Watch("valueAndVp", { immediate: true })
  onValueChange() {
    if (this.vp && this.vp.selectedDates) {
      const selectedDate = this.vp.selectedDates[0]
      if (!this.value && selectedDate) {
        try {
          this.vp.clear(false)
        } catch (error) {
          Sentry.captureException(new Error("Error clearing value"))
        }
      } else if (
        this.value &&
        typeof this.value === "string" &&
        (!selectedDate || this.getDateValue(selectedDate) !== this.value)
      ) {
        try {
          this.vp.setDate(this.value, false)
        } catch (error) {
          Sentry.captureException(
            new Error(`Error setting date: ${this.value}`)
          )
        }
      }
    }
  }

  beforeDestroy() {
    if (this.vp) {
      this.vp.destroy()
    }
  }
}
</script>

<template>
  <div class="cypress-date-element" ref="htmlDivElementRef">
    <FormElementLabelContainer
      className="ob-date"
      :id="id"
      :element="element"
      :required="element.required"
    >
      <div class="field has-addons">
        <div class="control is-expanded has-icons-right">
          <input
            type="date"
            :id="id"
            :name="element.name"
            :placeholder="element.placeholderValue"
            :disabled="element.readOnly"
            class="input ob-input"
          />
          <span class="ob-input-icon icon is-small is-right">
            <i class="material-icons is-size-5">event</i>
          </span>
        </div>
        <div v-if="!!element.readOnly && !!text" class="control">
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
