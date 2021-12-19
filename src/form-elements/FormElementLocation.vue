<script lang="ts">
import Vue, { PropType } from "vue"
import { Component, Watch } from "vue-property-decorator"
import { FormTypes } from "@oneblink/types"
import geolocation from "@blinkmobile/geolocation"

import { Coords } from "../types/location"

import defaultCoords from "../services/defaultCoordinates"

import FormElementLabelContainer from "@/components/FormElementLabelContainer.vue"
import LocationDisplay from "@/components/location/LocationDisplay.vue"

import { Sentry } from "@oneblink/apps"

type DataProps = {
  isDirty: boolean
  isLocationPickerOpen: boolean
  location?: Coords | null
}

export const stringifyLocation = (location: Coords | undefined) => {
  if (location) {
    return `${location.latitude},${location.longitude}`
  }
}

function parseLocationValue(value: unknown): Coords | undefined {
  if (!value || typeof value !== "object") {
    return
  }

  const { latitude, longitude, zoom } = value as Record<string, unknown>
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return
  }

  return {
    latitude,
    longitude,
    zoom: typeof zoom === "number" ? zoom : initialMapZoom,
  }
}

const initialMapZoom = 15

const FormElementLocationBase = Vue.extend({
  components: {
    FormElementLabelContainer,
    LocationDisplay,
  },
  props: {
    id: { type: String, required: true },
    element: {
      type: Object as PropType<FormTypes.LocationElement>,
      required: true,
    },
    value: { required: true },
    displayValidationMessage: Boolean,
    validationMessage: String,
    isLookup: Boolean,
  },
  data(): DataProps {
    return {
      isDirty: false,
      isLocationPickerOpen: false,
      location: null,
    }
  },
  computed: {
    isLoadingLocation(): boolean {
      return !this.location && this.isLocationPickerOpen
    },
  },
  methods: {
    updateSubmission(coords?: Coords | null) {
      this.$emit("updateSubmission", {
        name: this.element.name,
        value: coords || undefined,
      })
    },
    onClear() {
      this.isLocationPickerOpen = false
      // onChange(element, undefined)
      this.location = null
    },
    onCancel() {
      this.isLocationPickerOpen = false
      Vue.set(this, "location", parseLocationValue(this.value))
    },
    async onLocate() {
      this.isLocationPickerOpen = true
      if (this.location) {
        return
      }

      let currentLocation = null
      try {
        const result = await geolocation.getCurrentPosition()
        currentLocation = result.coords
      } catch (err) {
        console.error(
          "Error while attempting to find the users current location",
          err
        )
        Sentry.captureException(err)
      } finally {
        Vue.set(
          this,
          "location",
          parseLocationValue(currentLocation || defaultCoords())
        )
      }
    },
    onConfirm() {
      this.isDirty = true
      this.isLocationPickerOpen = false
      this.updateSubmission(this.location)
    },
    setLocation(coords: Coords) {
      this.location = coords
    },
  },
})

@Component
export default class FormElementLocation extends FormElementLocationBase {
  @Watch("value")
  onValueChange() {
    const newValue = parseLocationValue(this.value)
    if (newValue) {
      this.location = newValue
    }
  }
}
</script>

<template>
  <div class="cypress-location-element">
    <FormElementLabelContainer
      className="ob-location"
      :id="id"
      :element="element"
      :required="element.required"
    >
      <div class="control">
        <LocationDisplay
          :isOpen="isLocationPickerOpen"
          :isLoading="isLoadingLocation"
          :location="location"
          @setLocation="setLocation"
        />

        <div class="buttons ob-buttons ob-location__buttons">
          <template v-if="isLocationPickerOpen">
            <button
              type="button"
              class="
                is-light
                button
                ob-button ob-button__cancel
                ob-location__button ob-location__button-cancel
                cypress-cancel-location-button
              "
              @click="onCancel"
              disabled="element.readOnly"
            >
              Cancel
            </button>
            <button
              type="button"
              class="
                is-primary
                button
                ob-button ob-button__confirm
                ob-location__button ob-location__button-confirm
                cypress-confirm-location-button
              "
              @click="onConfirm"
              :disabled="element.readOnly || !location"
            >
              Confirm
            </button>
          </template>
          <template v-else>
            <button
              type="button"
              class="
                is-light
                button
                ob-button ob-button__clear
                ob-button-clear
                ob-location__button ob-location__button-clear
                cypress-clear-location-button
              "
              @click="onClear"
              :disabled="element.readOnly"
            >
              Clear
            </button>
            <button
              type="button"
              class="
                is-primary
                button
                ob-button ob-button__edit
                ob-location__button ob-location__button-edit
                cypress-locate-button
              "
              @click="onLocate"
              :disabled="element.readOnly"
            >
              Locate
            </button>
          </template>
        </div>
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
