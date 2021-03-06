<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"
import {
  FormElementValidation,
  FormElementConditionallyShown,
} from "@/types/form"

import { FormElementBinaryStorageValue } from "@/types/attachments"

import { stringifyLocation } from "@/form-elements/FormElementLocation.vue"

import LookupNotification from "@/components/LookupNotification.vue"
import FormElementText from "@/form-elements/FormElementText.vue"
import FormElementTextarea from "@/form-elements/FormElementTextarea.vue"
import FormElementNumber from "@/form-elements/FormElementNumber.vue"
import FormElementEmail from "@/form-elements/FormElementEmail.vue"
import FormElementTelephone from "@/form-elements/FormElementTelephone.vue"
import FormElementRadio from "@/form-elements/FormElementRadio.vue"
import FormElementCheckBoxes from "@/form-elements/FormElementCheckBoxes.vue"
import FormElementSelect from "@/form-elements/FormElementSelect.vue"
import FormElementAutocomplete from "@/form-elements/FormElementAutocomplete.vue"
import FormElementBoolean from "@/form-elements/FormElementBoolean.vue"
import FormElementDate from "@/form-elements/FormElementDate.vue"
import FormElementDateTime from "@/form-elements/FormElementDateTime.vue"
import FormElementTime from "@/form-elements/FormElementTime.vue"
import FormElementHeading from "@/form-elements/FormElementHeading.vue"
import FormElementHTML from "@/form-elements/FormElementHTML.vue"
import FormElementImage from "@/form-elements/FormElementImage.vue"
import FormElementForm from "@/form-elements/FormElementForm.vue"
import FormElementCalculation from "@/form-elements/FormElementCalculation.vue"
import FormElementCamera from "@/form-elements/FormElementCamera.vue"
import FormElementRepeatableSet from "@/form-elements/FormElementRepeatableSet.vue"
import FormElementSignature from "@/form-elements/FormElementSignature.vue"
import FormElementLocation from "@/form-elements/FormElementLocation.vue"
import FormElementFiles, {
  stringifyAttachments,
} from "@/form-elements/FormElementFiles/index.vue"
import FormElementCaptcha from "@/form-elements/FormElementCaptcha.vue"
import FormElementSummary from "@/form-elements/FormElementSummary.vue"
import FormElementCompliance from "@/form-elements/FormElementCompliance.vue"
import FormElementBarcodeScanner from "@/form-elements/FormElementBarcodeScanner.vue"
import FormElementGeoscapeAddress from "@/form-elements/FormElementGeoscapeAddress.vue"
import FormElementPointAddress from "@/form-elements/FormElementPointAddress.vue"
import FormElementCivicaNameRecord from "@/form-elements/FormElementCivicaNameRecord.vue"
import FormElementCivicaStreetName from "@/form-elements/FormElementCivicaStreetName.vue"
import FormElementBSB from "@/form-elements/FormElementBSB.vue"
import FormElementABN from "@/form-elements/FormElementABN.vue"

export default Vue.extend({
  components: {
    LookupNotification,
    FormElementText,
    FormElementTextarea,
    FormElementNumber,
    FormElementEmail,
    FormElementTelephone,
    FormElementRadio,
    FormElementCheckBoxes,
    FormElementSelect,
    FormElementAutocomplete,
    FormElementBoolean,
    FormElementDate,
    FormElementDateTime,
    FormElementTime,
    FormElementHeading,
    FormElementHTML,
    FormElementImage,
    FormElementForm,
    FormElementCalculation,
    FormElementCamera,
    FormElementRepeatableSet,
    FormElementSignature,
    FormElementLocation,
    FormElementFiles,
    FormElementCaptcha,
    FormElementSummary,
    FormElementCompliance,
    FormElementBarcodeScanner,
    FormElementGeoscapeAddress,
    FormElementPointAddress,
    FormElementCivicaNameRecord,
    FormElementCivicaStreetName,
    FormElementBSB,
    FormElementABN,
  },
  props: {
    element: {
      type: Object as PropType<FormTypes.FormElement>,
      required: true,
    },
    model: {
      type: Object as PropType<Record<string, unknown>>,
      required: true,
    },
    value: { required: false },
    name: { type: String, required: true },
    formElementValidation: {
      type: String as PropType<FormElementValidation>,
      required: false,
    },
    displayValidationMessage: { type: Boolean, required: true },
    formElementConditionallyShown: {
      type: Object as PropType<FormElementConditionallyShown>,
      required: false,
    },
    id: { type: String, required: true },
    isEven: { type: Boolean, required: false },
  },
  methods: {
    updateSubmission({
      name,
      value,
    }: {
      name: string
      value: unknown | undefined
    }) {
      this.$emit("updateSubmission", {
        newSubmission: {
          [name]: value,
        },
        element: this.element,
      })
    },
    updateAttachmentSubmission({
      name,
      value,
    }: {
      name: string
      value?: { attachment?: FormElementBinaryStorageValue }
    }) {
      this.updateSubmission({
        name,
        value: value?.attachment,
      })
    },
    stringifyLocation,
    stringifyAttachments,
  },
  computed: {
    validationMessage(): string | undefined {
      return this.formElementValidation &&
        typeof this.formElementValidation === "string"
        ? this.formElementValidation
        : undefined
    },
    conditionallyShownOptions(): FormTypes.ChoiceElementOption[] | undefined {
      return this.formElementConditionallyShown &&
        this.formElementConditionallyShown.type === "formElement"
        ? this.formElementConditionallyShown.options
        : undefined
    },
  },
})
</script>

<template>
  <div
    class="ob-element cypress-element-container"
    :data-cypress-element-name="name"
    :data-ob-name="name"
  >
    <LookupNotification
      :element="element"
      :model="model"
      v-if="element.type === 'text'"
    >
      <template v-slot:default="{ triggerLookup, isLookup }">
        <FormElementText
          :id="id"
          :element="element"
          :value="value"
          :validationMessage="validationMessage"
          :displayValidationMessage="displayValidationMessage"
          :isLookup="isLookup"
          @updateSubmission="updateSubmission"
          @triggerLookup="triggerLookup"
        />
      </template>
    </LookupNotification>
    <LookupNotification
      :element="element"
      :model="model"
      v-if="element.type === 'textarea'"
    >
      <template v-slot:default="{ triggerLookup, isLookup }">
        <FormElementTextarea
          :id="id"
          :element="element"
          :value="value"
          :validationMessage="validationMessage"
          :displayValidationMessage="displayValidationMessage"
          :isLookup="isLookup"
          @updateSubmission="updateSubmission"
          @triggerLookup="triggerLookup"
        />
      </template>
    </LookupNotification>
    <LookupNotification
      :element="element"
      :model="model"
      v-if="element.type === 'number'"
    >
      <template v-slot:default="{ triggerLookup, isLookup }">
        <FormElementNumber
          :id="id"
          :element="element"
          :value="value"
          :validationMessage="validationMessage"
          :displayValidationMessage="displayValidationMessage"
          :isLookup="isLookup"
          @updateSubmission="updateSubmission"
          @triggerLookup="triggerLookup"
        />
      </template>
    </LookupNotification>
    <LookupNotification
      :element="element"
      :model="model"
      v-if="element.type === 'email'"
    >
      <template v-slot:default="{ triggerLookup, isLookup }">
        <FormElementEmail
          :id="id"
          :element="element"
          :value="value"
          :validationMessage="validationMessage"
          :displayValidationMessage="displayValidationMessage"
          :isLookup="isLookup"
          @updateSubmission="updateSubmission"
          @triggerLookup="triggerLookup"
        />
      </template>
    </LookupNotification>
    <LookupNotification
      :element="element"
      :model="model"
      v-if="element.type === 'telephone'"
    >
      <template v-slot:default="{ triggerLookup, isLookup }">
        <FormElementTelephone
          :id="id"
          :element="element"
          :value="value"
          :validationMessage="validationMessage"
          :displayValidationMessage="displayValidationMessage"
          :isLookup="isLookup"
          @updateSubmission="updateSubmission"
          @triggerLookup="triggerLookup"
        />
      </template>
    </LookupNotification>
    <LookupNotification
      :element="element"
      :model="model"
      :autoLookupValue="value"
      v-if="element.type === 'radio'"
    >
      <FormElementRadio
        :id="id"
        :element="element"
        :value="value"
        :validationMessage="validationMessage"
        :displayValidationMessage="displayValidationMessage"
        :conditionallyShownOptions="conditionallyShownOptions"
        @updateSubmission="updateSubmission"
      />
    </LookupNotification>
    <LookupNotification
      :element="element"
      :model="model"
      v-if="element.type === 'checkboxes'"
    >
      <template v-slot:default="{ triggerLookup, isLookup }">
        <FormElementCheckBoxes
          :id="id"
          :element="element"
          :value="value"
          :validationMessage="validationMessage"
          :displayValidationMessage="displayValidationMessage"
          :isLookup="isLookup"
          :conditionallyShownOptions="conditionallyShownOptions"
          @updateSubmission="updateSubmission"
          @triggerLookup="triggerLookup"
        />
      </template>
    </LookupNotification>
    <LookupNotification
      :autoLookupValue="!element.multi ? value : undefined"
      :element="element"
      :model="model"
      v-if="element.type === 'select'"
    >
      <template v-slot:default="{ triggerLookup, isLookup }">
        <FormElementSelect
          :id="id"
          :element="element"
          :value="value"
          :validationMessage="validationMessage"
          :displayValidationMessage="displayValidationMessage"
          :isLookup="isLookup"
          :conditionallyShownOptions="conditionallyShownOptions"
          @updateSubmission="updateSubmission"
        />
      </template>
    </LookupNotification>
    <LookupNotification
      :autoLookupValue="value"
      :element="element"
      :model="model"
      v-if="element.type === 'autocomplete'"
    >
      <FormElementAutocomplete
        :id="id"
        :element="element"
        :value="value"
        :validationMessage="validationMessage"
        :displayValidationMessage="displayValidationMessage"
        :conditionallyShownOptions="conditionallyShownOptions"
        @updateSubmission="updateSubmission"
      />
    </LookupNotification>
    <LookupNotification
      :autoLookupValue="value"
      :element="element"
      :model="model"
      v-if="element.type === 'boolean'"
    >
      <FormElementBoolean
        :id="id"
        :element="element"
        :value="value"
        :validationMessage="validationMessage"
        :displayValidationMessage="displayValidationMessage"
        :conditionallyShownOptions="conditionallyShownOptions"
        @updateSubmission="updateSubmission"
      />
    </LookupNotification>
    <LookupNotification
      :element="element"
      :model="model"
      v-if="element.type === 'date'"
    >
      <template v-slot:default="{ triggerLookup, isLookup }">
        <FormElementDate
          :id="id"
          :element="element"
          :value="value"
          :validationMessage="validationMessage"
          :displayValidationMessage="displayValidationMessage"
          :isLookup="isLookup"
          @updateSubmission="updateSubmission"
          @triggerLookup="triggerLookup"
        />
      </template>
    </LookupNotification>
    <LookupNotification
      :element="element"
      :model="model"
      v-if="element.type === 'datetime'"
    >
      <template v-slot:default="{ triggerLookup, isLookup }">
        <FormElementDateTime
          :id="id"
          :element="element"
          :value="value"
          :validationMessage="validationMessage"
          :displayValidationMessage="displayValidationMessage"
          :isLookup="isLookup"
          @updateSubmission="updateSubmission"
          @triggerLookup="triggerLookup"
        />
      </template>
    </LookupNotification>
    <LookupNotification
      :element="element"
      :model="model"
      v-if="element.type === 'time'"
    >
      <template v-slot:default="{ triggerLookup, isLookup }">
        <FormElementTime
          :id="id"
          :element="element"
          :value="value"
          :validationMessage="validationMessage"
          :displayValidationMessage="displayValidationMessage"
          :isLookup="isLookup"
          @updateSubmission="updateSubmission"
          @triggerLookup="triggerLookup"
        />
      </template>
    </LookupNotification>
    <FormElementHeading :element="element" v-if="element.type === 'heading'" />
    <FormElementHTML :element="element" v-if="element.type === 'html'" />
    <FormElementImage :element="element" v-if="element.type === 'image'" />
    <FormElementForm
      v-if="element.type === 'infoPage' || element.type === 'form'"
      :id="id"
      :element="element"
      :value="value"
      :displayValidationMessages="displayValidationMessage"
      :formElementValidation="formElementValidation"
      :formElementConditionallyShown="formElementConditionallyShown"
      @updateSubmission="updateSubmission"
    />
    <FormElementCalculation
      v-if="element.type === 'calculation'"
      :element="element"
      :value="value"
      @updateSubmission="updateSubmission"
    />
    <FormElementCamera
      v-if="element.type === 'camera'"
      :id="id"
      :element="element"
      :value="value"
      :validationMessage="validationMessage"
      :displayValidationMessage="displayValidationMessage"
      @updateSubmission="updateAttachmentSubmission"
    />
    <FormElementRepeatableSet
      v-if="element.type === 'repeatableSet'"
      :id="id"
      :isEven="!isEven"
      :element="element"
      :value="value"
      :displayValidationMessages="displayValidationMessage"
      :formElementValidation="formElementValidation"
      :formElementConditionallyShown="formElementConditionallyShown"
      @updateSubmission="updateSubmission"
    />
    <FormElementSignature
      v-if="element.type === 'draw'"
      :id="id"
      :element="element"
      :value="value"
      :validationMessage="validationMessage"
      :displayValidationMessage="displayValidationMessage"
      @updateSubmission="updateAttachmentSubmission"
    />
    <LookupNotification
      v-if="element.type === 'location'"
      :autoLookupValue="value"
      :stringifyAutoLookupValue="stringifyLocation"
      :element="element"
      :model="model"
    >
      <FormElementLocation
        :id="id"
        :element="element"
        :value="value"
        :validationMessage="validationMessage"
        :displayValidationMessage="displayValidationMessage"
        @updateSubmission="updateSubmission"
      />
    </LookupNotification>
    <LookupNotification
      :autoLookupValue="value"
      :stringifyAutoLookupValue="stringifyAttachments"
      :element="element"
      :model="model"
      v-if="element.type === 'files'"
    >
      <FormElementFiles
        :id="id"
        :element="element"
        :value="value"
        :validationMessage="validationMessage"
        :displayValidationMessage="displayValidationMessage"
        @updateSubmission="updateSubmission"
      />
    </LookupNotification>
    <FormElementCaptcha
      v-if="element.type === 'captcha' && false"
      :id="id"
      :element="element"
      @updateSubmission="updateSubmission"
      :validationMessage="validationMessage"
      :displayValidationMessage="displayValidationMessage"
    />
    <FormElementSummary
      v-if="element.type === 'summary'"
      :id="id"
      :value="value"
      :element="element"
      @updateSubmission="updateSubmission"
    />
    <LookupNotification
      :autoLookupValue="value ? value.value : undefined"
      :element="element"
      :model="model"
      v-if="element.type === 'compliance'"
    >
      <FormElementCompliance
        :id="id"
        :value="value"
        :element="element"
        @updateSubmission="updateSubmission"
      />
    </LookupNotification>
    <LookupNotification
      :element="element"
      :model="model"
      v-if="element.type === 'barcodeScanner'"
    >
      <template v-slot:default="{ triggerLookup, isLookup }">
        <FormElementBarcodeScanner
          :id="id"
          :element="element"
          :value="value"
          :validationMessage="validationMessage"
          :displayValidationMessage="displayValidationMessage"
          :isLookup="isLookup"
          @updateSubmission="updateSubmission"
          @triggerLookup="triggerLookup"
        />
      </template>
    </LookupNotification>
    <LookupNotification
      :autoLookupValue="value"
      :element="element"
      :model="model"
      v-if="element.type === 'geoscapeAddress'"
    >
      <FormElementGeoscapeAddress
        :id="id"
        :element="element"
        :value="value"
        :validationMessage="validationMessage"
        :displayValidationMessage="displayValidationMessage"
        @updateSubmission="updateSubmission"
      />
    </LookupNotification>
    <LookupNotification
      :autoLookupValue="value"
      :element="element"
      :model="model"
      v-if="element.type === 'pointAddress'"
    >
      <FormElementPointAddress
        :id="id"
        :element="element"
        :value="value"
        :validationMessage="validationMessage"
        :displayValidationMessage="displayValidationMessage"
        @updateSubmission="updateSubmission"
      />
    </LookupNotification>
    <FormElementCivicaNameRecord
      v-if="element.type === 'civicaNameRecord'"
      :id="id"
      :element="element"
      :value="value"
      :displayValidationMessages="displayValidationMessage"
      :formElementValidation="formElementValidation"
      :formElementConditionallyShown="formElementConditionallyShown"
      @updateSubmission="updateSubmission"
    />
    <LookupNotification
      :autoLookupValue="value"
      :element="element"
      :model="model"
      v-if="element.type === 'civicaStreetName'"
    >
      <template>
        <FormElementCivicaStreetName
          :id="id"
          :element="element"
          :value="value"
          :validationMessage="validationMessage"
          :displayValidationMessage="displayValidationMessage"
          @updateSubmission="updateSubmission"
        />
      </template>
    </LookupNotification>
    <LookupNotification
      v-if="element.type === 'bsb'"
      :element="element"
      :model="model"
    >
      <template v-slot:default="{ triggerLookup, isLookup }">
        <FormElementBSB
          :id="id"
          :element="element"
          :value="value"
          @updateSubmission="updateSubmission"
          :validationMessage="validationMessage"
          :displayValidationMessage="displayValidationMessage"
          :isLookup="isLookup"
          @triggerLookup="triggerLookup"
        />
      </template>
    </LookupNotification>
    <LookupNotification
      v-if="element.type === 'abn'"
      :element="element"
      :model="model"
    >
      <template v-slot:default="{ triggerLookup, isLookup }">
        <FormElementABN
          :id="id"
          :element="element"
          :value="value"
          @updateSubmission="updateSubmission"
          :validationMessage="validationMessage"
          :displayValidationMessage="displayValidationMessage"
          :isLookup="isLookup"
          @triggerLookup="triggerLookup"
        />
      </template>
    </LookupNotification>
  </div>
</template>
