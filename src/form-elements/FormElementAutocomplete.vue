<script lang="ts">
import Vue, { PropType } from "vue"
import { Component, Watch } from "vue-property-decorator"
import { FormTypes } from "@oneblink/types"
import { Fragment } from "vue-frag"
import { formElementsService } from "@oneblink/sdk-core"
import { generateHeaders } from "@oneblink/apps/dist/services/fetch"

import FormElementLabelContainer from "@/components/FormElementLabelContainer.vue"
import FormElementOptions from "@/components/FormElementOptions.vue"
import AutocompleteDropdown from "@/components/AutocompleteDropdown.vue"

const FormElementAutocompleteBase = Vue.extend({
  components: {
    FormElementLabelContainer,
    FormElementOptions,
    AutocompleteDropdown,
    Fragment,
  },
  props: {
    id: { type: String, required: true },
    element: {
      type: Object as PropType<FormTypes.AutoCompleteElement>,
      required: true,
    },
    value: { required: true },
    displayValidationMessage: Boolean,
    validationMessage: { type: String, required: false },
    conditionallyShownOptions: Array as PropType<
      FormTypes.ChoiceElementOption[]
    >,
  },
  data() {
    return {
      label: "",
    }
  },
  methods: {
    async handleSearchFetch(search: string, abortSignal: AbortSignal) {
      if (!this.element.searchUrl) {
        return
      }
      const headers = await generateHeaders()
      const url = new URL(this.element.searchUrl)
      url.searchParams.append("value", search)
      const response = await fetch(url.href, {
        headers,
        signal: abortSignal,
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text)
      }

      const data = await response.json()
      return formElementsService.parseFormElementOptionsSet(data)
    },
    setLabel(newLabel: string) {
      this.label = newLabel
    },
    onFilter(option: FormTypes.ChoiceElementOption) {
      // If the user has typed nothing in, display all options
      if (!this.label) {
        return true
      }
      const lowerCase = this.label.toLowerCase()
      return option.label.toLowerCase().includes(lowerCase)
    },
    async handleSearch() {
      return this.filteredOptions
    },
    updateSubmission(input: string | undefined) {
      this.$emit("updateSubmission", {
        name: this.element.name,
        value: input || undefined,
      })
    },
  },
  computed: {
    filteredOptions(): FormTypes.ChoiceElementOption[] {
      if (!this.element.options) {
        return []
      }
      if (!this.conditionallyShownOptions && !this.onFilter) {
        return this.element.options
      }
      return this.element.options.filter((option) => {
        return (
          (!this.conditionallyShownOptions ||
            this.conditionallyShownOptions.some(
              ({ id }) => id === option.id
            )) &&
          (!this.onFilter || this.onFilter(option))
        )
      })
    },
  },
})

@Component
export default class FormElementAutocomplete extends FormElementAutocompleteBase {
  @Watch("label")
  onLabelChanged(newValue: string): void {
    if (!newValue && typeof this.value === "string") {
      this.label = this.value
    }
  }

  @Watch("value", { immediate: true })
  onWatchChanged(newValue: unknown) {
    if (this.element.optionsType === "SEARCH") {
      return
    }
    if (!Array.isArray(this.element.options)) {
      return
    }
    const option = this.element.options.find(
      (option) => option.value === newValue
    )
    if (option && this.label !== option.label) {
      this.setLabel(option.label)
    }
  }
}
</script>

<template>
  <Fragment>
    <div
      v-if="element.optionsType === 'SEARCH' && element.searchUrl"
      class="cypress-autocomplete-search-element"
    >
      <FormElementLabelContainer
        className="ob-autocomplete"
        :element="element"
        :id="id"
        :required="element.required"
      >
        <AutocompleteDropdown
          :id="id"
          :label="label"
          :disabled="element.readOnly"
          :placeholder="element.placeholderValue"
          :required="element.required"
          :value="value"
          :validationMessage="validationMessage"
          :displayValidationMessage="displayValidationMessage"
          @changeValue="updateSubmission"
          @changeLabel="setLabel"
          :searchDebounceMs="750"
          :searchMinCharacters="1"
          :onSearch="handleSearchFetch"
        />
      </FormElementLabelContainer>
    </div>

    <div v-else class="cypress-autocomplete-filter-element">
      <FormElementLabelContainer
        className="ob-autocomplete"
        :element="element"
        :id="id"
        :required="element.required"
      >
        <FormElementOptions :options="element.options || []">
          <AutocompleteDropdown
            :id="id"
            :label="label"
            :disabled="element.readOnly"
            :placeholder="element.placeholderValue"
            :required="element.required"
            :value="value"
            :validationMessage="validationMessage"
            :displayValidationMessage="displayValidationMessage"
            @changeValue="updateSubmission"
            @changeLabel="setLabel"
            :searchDebounceMs="0"
            :searchMinCharacters="0"
            :onSearch="handleSearch"
          />
        </FormElementOptions>
      </FormElementLabelContainer>
    </div>
  </Fragment>
</template>
