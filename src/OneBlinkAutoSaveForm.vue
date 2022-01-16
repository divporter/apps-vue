<script lang="ts">
import Vue, { PropType } from "vue"
import { Component, ProvideReactive } from "vue-property-decorator"
import { FormTypes, FormsAppsTypes } from "@oneblink/types"
import { autoSaveService, Sentry } from "@oneblink/apps"
import _cloneDeep from "lodash.clonedeep"
import _throttle from "lodash.throttle"
import { Fragment } from "vue-frag"

import generateDefaultData from "./services/generate-default-data"

import { FormSubmissionModel } from "@/types/form"

import OneBlinkFormBase from "./OneBlinkFormBase.vue"
import OnLoading from "@/components/OnLoading.vue"
import Modal from "@/components/Modal.vue"

type DataProps = {
  submission: Record<string, unknown>
  clonedDefinition: FormTypes.Form
  isLoadingAutoSaveSubmission: boolean
  autoSaveSubmission: FormSubmissionModel | null
}

const OneBlinkFormUncontrolledBase = Vue.extend({
  components: {
    OneBlinkFormBase,
    Fragment,
    OnLoading,
    Modal,
  },
  props: {
    definition: { type: Object as PropType<FormTypes.Form>, required: true },
    isReadOnly: Boolean,
    googleMapsApiKey: String,
    captchaSiteKey: String,
    isPreview: Boolean,
    disabled: Boolean,
    buttons: Object as PropType<FormsAppsTypes.FormsListStyles["buttons"]>,
    initialSubmission: {
      type: Object as PropType<FormSubmissionModel>,
      required: false,
    },
    primaryColor: String,
    autoSaveKey: {
      type: String,
      required: true,
      default: "",
    },
    abnLookupAuthenticationGuid: String,
  },
  data(): DataProps {
    return {
      submission: generateDefaultData(
        this.definition.elements,
        this.initialSubmission || {}
      ),
      clonedDefinition: _cloneDeep(this.definition),
      isLoadingAutoSaveSubmission: true,
      autoSaveSubmission: null,
    }
  },
  computed: {
    showSaveDraft(): boolean {
      return this.$listeners && !!this.$listeners["saveDraft"]
    },
    isAutoSaveSubmissionAvailable(): boolean {
      return this.autoSaveSubmission !== null
    },
  },
  methods: {
    updateDefinition(newDefinition: FormTypes.Form) {
      Vue.set(this, "clonedDefinition", newDefinition)
    },
    deleteAutoSaveSubmission() {
      return autoSaveService
        .deleteAutoSaveData(this.definition.id, this.autoSaveKey)
        .catch((error) => {
          console.warn("Error removing auto save data: ", error)
          Sentry.captureException(error)
        })
    },

    autoSave(model: FormSubmissionModel) {
      console.log("Auto saving...")
      autoSaveService
        .upsertAutoSaveData(this.definition.id, this.autoSaveKey, model)
        .catch((error) => {
          console.warn("Error while auto saving", error)
          Sentry.captureException(error)
        })
    },
    async loadAutoSaveData() {
      let ignore = false
      try {
        const autoSaveData =
          await autoSaveService.getAutoSaveData<FormSubmissionModel>(
            this.definition.id,
            this.autoSaveKey
          )
        if (!ignore) {
          this.isLoadingAutoSaveSubmission = false
          this.autoSaveSubmission = autoSaveData
        }
      } catch (error) {
        console.warn("Error loading auto save data", error)
        Sentry.captureException(error)
        if (!ignore) {
          this.isLoadingAutoSaveSubmission = false
          this.autoSaveSubmission = null
        }
      }
    },
    startNewSubmission() {
      this.deleteAutoSaveSubmission()
      this.isLoadingAutoSaveSubmission = false
      this.autoSaveSubmission = null
    },
  },
  mounted() {
    this.loadAutoSaveData()
  },
})

@Component
export default class OneBlinkFormUncontrolled extends OneBlinkFormUncontrolledBase {
  @ProvideReactive() submission: Record<string, unknown> = this.submission

  public throttledAutoSave = _throttle(
    this.autoSave,
    9580, // https://en.wikipedia.org/wiki/100_metres
    { trailing: true, leading: false }
  )

  updateSubmission(newSubmission: Record<string, unknown>) {
    Vue.set(this, "submission", { ...this.submission, ...newSubmission })
    this.throttledAutoSave(this.submission)
  }

  cancelAutoSave() {
    if (this.throttledAutoSave) {
      this.throttledAutoSave.cancel()
    }
  }

  handleCancel() {
    this.cancelAutoSave()
    this.deleteAutoSaveSubmission()
    this.$emit("cancel")
  }

  handleSaveDraft(event: unknown) {
    this.cancelAutoSave()
    this.deleteAutoSaveSubmission()
    this.$emit("saveDraft", event)
  }

  handleSubmit(event: unknown) {
    this.cancelAutoSave()
    this.deleteAutoSaveSubmission()
    this.$emit("submit", event)
  }

  continueAutoSaveSubmission() {
    if (this.autoSaveSubmission) {
      this.updateSubmission(this.autoSaveSubmission)
    }
    this.isLoadingAutoSaveSubmission = false
    this.autoSaveSubmission = null
  }

  beforeDestroy() {
    this.cancelAutoSave()
  }
}
</script>

<template>
  <Fragment>
    <div
      v-if="isLoadingAutoSaveSubmission"
      class="cypress-loading has-text-centered"
    >
      <OnLoading className="has-text-centered"></OnLoading>
    </div>

    <Modal
      :isOpen="isAutoSaveSubmissionAvailable"
      title="Continue?"
      cardClassName="cypress-continue-auto-save"
    >
      <template v-slot:actions>
        <button
          type="button"
          class="
            button
            ob-button
            is-light
            cypress-continue-auto-save-start-again-button
          "
          @click="startNewSubmission"
        >
          Start Again
        </button>
        <button
          type="button"
          class="
            button
            ob-button
            is-primary
            cypress-continue-auto-save-continue-button
          "
          @click="continueAutoSaveSubmission"
        >
          Continue
        </button>
      </template>
      We found an in progress submission, would you like to pick up where you
      left off or start again?
    </Modal>

    <OneBlinkFormBase
      :definition="clonedDefinition"
      @updateDefinition="updateDefinition"
      :submission="submission"
      @updateSubmission="updateSubmission"
      :isReadOnly="isReadOnly"
      :googleMapsApiKey="googleMapsApiKey"
      :captchaSiteKey="captchaSiteKey"
      :isPreview="isPreview"
      :disabled="disabled"
      :buttons="buttons"
      @cancel="handleCancel"
      @saveDraft="handleSaveDraft"
      @submit="handleSubmit"
      :showSaveDraft="showSaveDraft"
      :primaryColor="primaryColor"
    />
  </Fragment>
</template>
