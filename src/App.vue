<template>
  <div>
    <OneBlinkForm
      v-if="formType === 'uncontrolled' && definition"
      :definition="definition"
      :googleMapsApiKey="googleMapsApiKey"
      :captchaSiteKey="captchaSiteKey"
      :initialSubmission="{
        TField1: 'bye',
        Number: 2,
        Email: 'david@oneblink.io',
      }"
      @saveDraft="onSaveDraft"
      @submit="onSubmit"
      @cancel="onCancel"
    />
    <OneBlinkFormControlled
      v-else-if="formType === 'controlled' && definition"
      :definition="definition"
      :googleMapsApiKey="googleMapsApiKey"
      :captchaSiteKey="captchaSiteKey"
      :submission="submission"
      @saveDraft="onSaveDraft"
      @submit="onSubmit"
      @cancel="onCancel"
      @updateSubmission="updateSubmission"
    />
    <OneBlinkAutoSaveForm
      v-else-if="formType === 'autoSave' && definition"
      :definition="definition"
      :googleMapsApiKey="googleMapsApiKey"
      :captchaSiteKey="captchaSiteKey"
      :initialSubmission="{
        TField1: 'bye',
        Number: 2,
        Email: 'david@oneblink.io',
      }"
      @saveDraft="onSaveDraft"
      @submit="onSubmit"
      @cancel="onCancel"
      autoSaveKey="otto"
    />
    <OneBlinkReadOnlyForm
      v-else-if="formType === 'readOnly' && definition"
      :definition="definition"
      :googleMapsApiKey="googleMapsApiKey"
      :captchaSiteKey="captchaSiteKey"
      :initialSubmission="{
        TField1: 'bye',
        Number: 2,
        Email: 'david@oneblink.io',
      }"
      @saveDraft="onSaveDraft"
      @submit="onSubmit"
      @cancel="onCancel"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import OneBlinkAutoSaveForm from "./OneBlinkAutoSaveForm.vue"
import OneBlinkForm from "./OneBlinkFormUncontrolled.vue"
import OneBlinkFormControlled from "./OneBlinkFormControlled.vue"
import OneBlinkReadOnlyForm from "./OneBlinkReadOnlyForm.vue"
import { formService, submissionService } from "@oneblink/apps"
import { FormTypes } from "@oneblink/types"
import { FormSubmissionModel } from "@/types/form"

import "tippy.js/themes/google.css"

type DataProps = {
  definition: FormTypes.Form | null
  loading: boolean
  submission: FormSubmissionModel
  formType: "uncontrolled" | "controlled" | "autoSave" | "readOnly"
}

export default Vue.extend({
  components: {
    OneBlinkForm,
    OneBlinkFormControlled,
    OneBlinkAutoSaveForm,
    OneBlinkReadOnlyForm,
  },
  data(): DataProps {
    return {
      definition: null,
      loading: false,
      submission: {
        TField1: "bye",
        Number: 2,
        Email: "david@oneblink.io",
      },
      formType: "uncontrolled",
    }
  },
  computed: {
    googleMapsApiKey(): string {
      return process.env.VUE_APP_GOOGLE_MAPS_API_KEY || ""
    },
    captchaSiteKey(): string {
      return process.env.VUE_APP_CAPTCHA_SITE_KEY || ""
    },
  },
  async mounted() {
    this.loading = true
    // this.definition = await formService.getForm(9050, 992)
    const definition = await formService.getForm(9050, 992)
    this.definition = this.removeCaptchaElement(definition)
    this.loading = false
  },
  methods: {
    onSaveDraft(newDraftSubmission: submissionService.NewDraftSubmission) {
      console.log(newDraftSubmission)
    },
    onSubmit(newFormSubmission: submissionService.NewFormSubmission) {
      console.log(newFormSubmission)
    },
    onCancel() {
      console.log("canchel")
    },
    updateSubmission({
      submission: newSubmission,
      definition,
    }: {
      submission: FormSubmissionModel
      definition: FormTypes.Form
    }) {
      console.log(JSON.stringify(newSubmission, null, 2))
      if (newSubmission.TField1 === "four") {
        newSubmission.Number = 4
      }
      //@ts-expect-error bossing it
      definition.elements[0].elements[2].readOnly =
        newSubmission.TField1 === "four"
      Vue.set(this, "submission", newSubmission)
      Vue.set(this, "definition", definition)
    },
    removeCaptchaElement(definition: FormTypes.Form) {
      const page = definition.elements.find(
        (el) => el.type === "page" && el.label === "Advanced"
      ) as FormTypes.PageElement
      if (!page) {
        return definition
      }
      const index = page.elements.findIndex(
        (el) => "name" in el && el.name === "Recaptcha"
      )
      if (index === -1) {
        return definition
      }
      page.elements.splice(index, 1)
      return definition
    },
  },
})
</script>

<style lang="scss">
$primary: #ff0000;
@import "@/styles/oneblink-apps-vue.scss";

.ob-input-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
