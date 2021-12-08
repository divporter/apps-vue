<script lang="ts">
import Vue, { PropType } from "vue"
import {
  Component,
  Watch,
  Inject,
  InjectReactive,
} from "vue-property-decorator"
import { FormTypes } from "@oneblink/types"
import { formService, Sentry } from "@oneblink/apps"
import { generateHeaders } from "@oneblink/apps/dist/services/fetch"

import generateDefaultData from "../services/generate-default-data"
import { FormSubmissionModel } from "../types/form"
import { MergeLookupResults, LookupCallback } from "../types/lookups"
import eventBus from "@/services/event-bus"

import OnLoading from "@/components/OnLoading.vue"

type DataProps = {
  isLookingUp: boolean
  hasLookupFailed: boolean
  hasLookupSucceeded: boolean
  isDisabled: boolean
  isCancellable: boolean
  lookupErrorHTML: string | null
  cancelLookupDisabled: boolean
  abortController: AbortController
}

const LookupNotificationBase = Vue.extend({
  components: {
    OnLoading,
  },
  props: {
    autoLookupValue: {
      required: false,
    },
    stringifyAutoLookupValue: {
      type: Function as PropType<(autoLookupValue: unknown) => string>,
      required: false,
    },
    element: {
      type: Object as PropType<FormTypes.LookupFormElement>,
      required: true,
    },
    validationMessage: { type: String, required: false },
    hasMarginTop: { type: Boolean, required: false },
    isInputButton: { type: Boolean, required: false },
    // formIsReadOnly: Boolean,
    model: {
      type: Object as PropType<Record<string, unknown>>,
      required: true,
    },
  },
  data(): DataProps {
    return {
      isLookingUp: false,
      hasLookupFailed: false,
      hasLookupSucceeded: false,
      isDisabled: false,
      isCancellable: false,
      lookupErrorHTML: null,
      cancelLookupDisabled: false,
      abortController: new AbortController(),
    }
  },
  computed: {
    isOffline(): boolean {
      return window.navigator && !window.navigator.onLine
    },
    autoLookupValueString(): unknown {
      return this.stringifyAutoLookupValue
        ? this.stringifyAutoLookupValue(this.autoLookupValue)
        : this.autoLookupValue
    },
    isLookup(): boolean {
      return this.element.isDataLookup || this.element.isElementLookup
    },
  },
})

@Component
export default class LookupNotification extends LookupNotificationBase {
  @Inject() readonly handleLookup!: (callback: LookupCallback) => void
  //TODO verify these
  @InjectReactive() definition!: FormTypes.Form
  @InjectReactive() formIsReadOnly!: boolean

  mounted() {
    if (this.autoLookupValueString) {
      this.triggerLookup(this.autoLookupValueString)
    }
  }

  @Watch("autoLookupValueString")
  onAutoLookupValueStringChanged(newValue: string): void {
    if (newValue !== undefined) {
      this.triggerLookup(newValue)
    }
  }

  onCancelLookup(): void {
    if (!this.cancelLookupDisabled) {
      this.abortController.abort()
    }
  }

  async fetchLookup(
    formElementLookupId: number | undefined,
    organisationId: string | undefined,
    formsAppEnvironmentId: number | undefined,
    payload: FormSubmissionModel,
    abortSignal: AbortSignal
  ): Promise<unknown> {
    if (
      typeof formElementLookupId !== "number" ||
      !organisationId ||
      typeof formsAppEnvironmentId !== "number"
    ) {
      return
    }

    console.log(
      "Attempting to retrieve form element lookup for id:",
      formElementLookupId
    )
    const formElementLookup = await formService.getFormElementLookupById(
      organisationId,
      formsAppEnvironmentId,
      formElementLookupId
    )

    if (!formElementLookup || !formElementLookup.url) {
      console.log(
        "Could not find URL for form element lookup for id:",
        formElementLookupId,
        formElementLookup
      )
      throw new Error("Could not find element lookup configuration")
    }

    const headers = await generateHeaders()
    console.log(
      `Attempting a ${formElementLookup.type} lookup request to:`,
      formElementLookup.url
    )
    const response = await fetch(formElementLookup.url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: abortSignal,
    })

    const data = await response.json()
    console.log(
      "Response from lookup to: POST",
      formElementLookup.url,
      response.status,
      data
    )

    if (!response.ok) {
      Sentry.captureException(
        new Error(`Received ${response.status} status code from lookup`)
      )
      if (response.status === 400 && data && data.message) {
        throw data.message
      }
      throw new Error("Invalid response from lookup")
    }

    return data
  }

  mergeLookupData(
    newValue: unknown,
    dataLookupResult: Record<string, unknown>,
    elementLookupResult: FormTypes.FormElement[]
  ): void {
    if (elementLookupResult) {
      if (elementLookupResult[0] && elementLookupResult[0].type === "page") {
        // TODO use injected function instead
        // eventBus.$emit("injectPagesAfter", {
        //   element: this.element,
        //   elementLookupResult,
        //   dataLookupResult,
        // })
        return
      }
    }

    this.handleLookup(({ submission, elements }: MergeLookupResults) => {
      let allElements = elements
      if (Array.isArray(elementLookupResult)) {
        const indexOfElement = elements.findIndex(
          ({ id }) => id === this.element.id
        )
        if (indexOfElement === -1) {
          console.log("Could not find element", this.element)
        } else {
          // Filter out already injected elements
          allElements = elements.filter(
            // @ts-expect-error Sorry typescript, we need to check a property you don't approve of :(
            (e) => e.injectedByElementId !== this.element.id
          )
          allElements.splice(
            indexOfElement + 1,
            0,
            ...elementLookupResult.map((e) => {
              // @ts-expect-error Sorry typescript, we need to check a property you don't approve of :(
              e.injectedByElementId = this.element.id
              return e
            })
          )
        }
      }

      return {
        elements: allElements,
        submission: generateDefaultData(allElements, {
          ...submission,
          [this.element.name]: newValue,
          ...dataLookupResult,
        }),
      }
    })
  }

  async triggerLookup(newValue: unknown): Promise<void> {
    // No lookups for read only forms
    if (this.formIsReadOnly || !this.isLookup) return
    // if the element triggering the lookup has no value..
    // ..return and do nothing
    if (newValue === undefined || newValue === null) return

    this.isLookingUp = true

    if (!window.navigator.onLine) {
      this.hasLookupFailed = true
      return
    }

    eventBus.$emit("OneBlinkFormBase-executedLookup", this.element.id)
    this.isDisabled = true
    this.isCancellable = false
    this.hasLookupFailed = false
    this.hasLookupSucceeded = false
    this.lookupErrorHTML = null

    // After certain amount of time, show the cancel button
    const isCancellableTimeout = setTimeout(() => {
      this.isCancellable = !this.abortController.signal.aborted
    }, 5000)

    const payload = {
      definition: this.definition,
      submission: {
        ...this.model,
        [this.element.name]: newValue,
      },
    }

    try {
      const [dataLookupResult, elementLookupResult] = await Promise.all([
        this.fetchLookup(
          this.element.dataLookupId,
          this.definition?.organisationId,
          this.definition?.formsAppEnvironmentId,
          payload,
          this.abortController.signal
        ),
        this.fetchLookup(
          this.element.elementLookupId,
          this.definition?.organisationId,
          this.definition?.formsAppEnvironmentId,
          payload,
          this.abortController.signal
        ),
      ])

      this.mergeLookupData(
        newValue,
        dataLookupResult as Record<string, unknown>,
        elementLookupResult as FormTypes.FormElement[]
      )
      this.hasLookupSucceeded = true

      // After certain amount of time, hide the lookup succeeded message
      await new Promise((resolve) => setTimeout(() => resolve(false), 750))
      this.isLookingUp = false
    } catch (error) {
      eventBus.$emit("OneBlinkFormBase-executeLookupFailed", this.element.id)

      // Cancelling will throw an error.
      if (this.abortController.signal.aborted) {
        console.log("Fetch aborted")
        this.isLookingUp = false
        return
      }

      this.hasLookupFailed = true
      this.lookupErrorHTML =
        typeof error === "string"
          ? error
          : "It looks like something went wrong.<br/>Please try again.<br />If the issue continues, please contact support."
    } finally {
      clearTimeout(isCancellableTimeout)
      this.isDisabled = false
      this.cancelLookupDisabled = true
    }
  }
}
</script>

<template>
  <div>
    <slot
      v-bind:triggerLookup="triggerLookup"
      v-bind:isLookup="isLookup"
    ></slot>
    <div
      v-if="isLookup"
      :class="{
        'ob-lookup__notification': true,
        'is-looking-up': isLookingUp,
        'is-extended':
          hasLookupFailed || (isCancellable && !hasLookupSucceeded),
      }"
    >
      <div class="notification has-margin-top-7 has-text-centered">
        <template v-if="hasLookupFailed">
          <button
            type="button"
            class="delete fade-in"
            @click="() => (this.isLookingUp = false)"
          />

          <div>
            <div v-if="isOffline">
              <i class="material-icons fade-in has-text-warning"> wifi_off </i>
              <p class="fade-in">
                It looks like you&apos;re offline. Please try again when
                connectivity is restored.
              </p>
            </div>

            <div v-else>
              <i class="material-icons fade-in has-text-danger">
                error_outline
              </i>
              <p class="fade-in" v-html="lookupErrorHTML || ''" />
            </div>
          </div>
        </template>

        <i
          v-if="hasLookupSucceeded"
          class="material-icons has-text-success fade-in"
        >
          check_circle_outline
        </i>
        <OnLoading v-if="!hasLookupSucceeded && !hasLookupFailed" small />
        <div
          v-if="isCancellable && !hasLookupSucceeded && !hasLookupFailed"
          class="has-margin-top-5 fade-in"
        >
          <p>Taking longer than expected?</p>
          <button
            type="button"
            class="button has-margin-top-8"
            @click="onCancelLookup"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
