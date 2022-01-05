<template>
  <div>
    <!-- <OneBlinkForm
      v-if="definition"
      :definition="definition"
      :googleMapsApiKey="process.env.VUE_APP_GOOGLE_MAPS_API_KEY"
      :captchaSiteKey="process.env.VUE_APP_CAPTCHA_SITE_KEY"
      :initialSubmission="{
        TField1: 'bye',
        Number: 2,
        Email: 'david@oneblink.io',
      }"
      @saveDraft="onSaveDraft"
      @submit="onSubmit"
      @cancel="onCancel"
    /> -->
    <!-- <OneBlinkFormControlled
      v-if="definition"
      :definition="definition"
      :googleMapsApiKey="process.env.VUE_APP_GOOGLE_MAPS_API_KEY"
      :captchaSiteKey="process.env.VUE_APP_CAPTCHA_SITE_KEY"
      :submission="submission"
      @saveDraft="onSaveDraft"
      @submit="onSubmit"
      @cancel="onCancel"
      @updateSubmission="updateSubmission"
    /> -->
    <OneBlinkAutoSaveForm
      v-if="definition"
      :definition="definition"
      googleMapsApiKey="process.env.VUE_APP_GOOGLE_MAPS_API_KEY"
      captchaSiteKey="process.env.VUE_APP_CAPTCHA_SITE_KEY"
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
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import OneBlinkAutoSaveForm from "./OneBlinkAutoSaveForm.vue"
import OneBlinkForm from "./OneBlinkFormUncontrolled.vue"
import OneBlinkFormControlled from "./OneBlinkFormControlled.vue"
import { formService, submissionService } from "@oneblink/apps"
import { FormTypes } from "@oneblink/types"
import { FormSubmissionModel } from "@/types/form"

import "@oneblink/apps-react/dist/styles.css"
import "balm-ui-css"
import "tippy.js/themes/google.css"

type DataProps = {
  definition: FormTypes.Form | null
  loading: boolean
  submission: FormSubmissionModel
}

export default Vue.extend({
  components: {
    // OneBlinkForm,
    // OneBlinkFormControlled,
    OneBlinkAutoSaveForm,
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
    }
  },
  async mounted() {
    this.loading = true
    this.definition = await formService.getForm(9050, 992)
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
  },
})
</script>

<style lang="scss">
.ob-input-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.v-application {
  font-family: BlinkMacSystemFont, -apple-system, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    "Helvetica", "Arial", sans-serif;
}
</style>
