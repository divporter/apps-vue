<script lang="ts">
import Vue, { PropType } from "vue"
import { Component, Watch, InjectReactive } from "vue-property-decorator"
import { formService } from "@oneblink/apps"

import AutocompleteDropdown from "@/components/AutocompleteDropdown.vue"
import FormElementLabelContainer from "@/components/FormElementLabelContainer.vue"
import { FormTypes, GeoscapeTypes } from "@oneblink/types"

type DataProps = {
  label: string
  error: Error | null
  isLoadingAddressDetails: boolean
}

const FormElementGeoscapeAddressBase = Vue.extend({
  components: {
    AutocompleteDropdown,
    FormElementLabelContainer,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    element: {
      type: Object as PropType<FormTypes.GeoscapeAddressElement>,
    },
    value: Object as PropType<GeoscapeTypes.GeoscapeAddress | undefined>,
    displayValidationMessage: Boolean,
    validationMessage: { type: String, required: false },
  },
  data(): DataProps {
    return {
      label: "",
      error: null,
      isLoadingAddressDetails: false,
    }
  },
  methods: {
    setLabel(newLabel: string) {
      this.label = newLabel
    },
  },
})

@Component
export default class FormElementGeoscapeAddress extends FormElementGeoscapeAddressBase {
  @InjectReactive() definition!: FormTypes.Form

  @Watch("value")
  onValueChange() {
    if (this.value) {
      const newLabel =
        this.value.addressDetails?.formattedAddress || this.value.addressId
      if (this.label !== newLabel) {
        this.setLabel(newLabel || "")
      }
    }
  }

  async handleSearch(query: string, abortSignal: AbortSignal) {
    this.error = null

    const params: {
      query: string
      maxNumberOfResults?: number
      stateTerritory?: string
    } = {
      query,
      maxNumberOfResults: 10,
    }

    if (this.element.stateTerritoryFilter) {
      params.stateTerritory = this.element.stateTerritoryFilter.join(",")
    }

    const result = await formService.searchGeoscapeAddresses(
      this.definition.id,
      params,
      abortSignal
    )

    return result.suggest.map((suggestion, index) => ({
      value: suggestion.id || index.toString(),
      label: suggestion.address || index.toString(),
    }))
  }

  async updateSubmission(addressId: string | undefined) {
    if (!addressId) {
      this.$emit("updateSubmission", {
        name: this.element.name,
        value: undefined,
      })
      return
    }

    this.isLoadingAddressDetails = true
    try {
      const result = await formService.getGeoscapeAddress(
        this.definition.id,
        addressId
      )
      this.$emit("updateSubmission", {
        name: this.element.name,
        value: result,
      })
    } catch (newError) {
      this.error = newError as Error
    }

    this.isLoadingAddressDetails = false
  }
}
</script>

<template>
  <div class="cypress-geoscape-address-element">
    <FormElementLabelContainer
      className="ob-geoscape-address ob-autocomplete"
      :element="element"
      :id="id"
      :required="element.required"
    >
      <AutocompleteDropdown
        :id="id"
        :label="label"
        :disabled="element.readOnly || isLoadingAddressDetails"
        :placeholder="element.placeholderValue"
        :required="element.required"
        :value="value"
        :validationMessage="validationMessage"
        :displayValidationMessage="displayValidationMessage"
        @changeValue="updateSubmission"
        @changeLabel="setLabel"
        :isLoading="isLoadingAddressDetails"
        :hasError="!!error"
        :searchDebounceMs="750"
        :searchMinCharacters="4"
        :onSearch="handleSearch"
      />
    </FormElementLabelContainer>

    <div v-if="error" role="alert" class="has-margin-top-8">
      <div
        class="
          has-text-danger
          ob-error__text
          cypress-geoscape-address-details-error-message
        "
      >
        {{ error.toString() }}
      </div>
    </div>
  </div>
</template>
