<script lang="ts">
import Vue, { PropType } from "vue"
import { Component, InjectReactive, Watch } from "vue-property-decorator"

import { formService } from "@oneblink/apps"
import { FormTypes, CivicaTypes } from "@oneblink/types"
import FormElementLabelContainer from "@/components/FormElementLabelContainer.vue"
import AutocompleteDropdown from "@/components/AutocompleteDropdown.vue"

type DataProps = {
  label: string
  error: Error | null
  abortController: AbortController
}

const FormElementCivicaStreetNameBase = Vue.extend({
  components: {
    FormElementLabelContainer,
    AutocompleteDropdown,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    element: {
      type: Object as PropType<FormTypes.CivicaStreetNameElement>,
    },
    value: Object as PropType<CivicaTypes.CivicaStreetName | undefined>,
    displayValidationMessage: Boolean,
    validationMessage: { type: String, required: false },
  },
  data(): DataProps {
    return {
      label: "",
      error: null,
      abortController: new AbortController(),
    }
  },
  methods: {
    updateSubmission(e: unknown) {
      this.$emit("updateSubmission", e)
    },
    setLabel(newLabel: string) {
      this.label = newLabel
    },
  },
})

@Component
export default class FormElementCivicaStreetName extends FormElementCivicaStreetNameBase {
  @InjectReactive() definition!: FormTypes.Form

  get formId(): number {
    return this.definition.id
  }

  @Watch("value")
  onValueChange() {
    if (this.value) {
      const newLabel = this.value?.formattedStreet as string
      if (this.label !== newLabel) {
        this.setLabel(newLabel || "")
      }
    }
  }

  public async handleSearch(searchTerm: string, abortSignal: AbortSignal) {
    this.error = null
    const results = await formService.searchCivicaStreetNames(
      this.formId,
      {
        search: searchTerm,
      },
      abortSignal
    )
    return results.map((suggestion, index) => ({
      value: suggestion.formattedAccount || index.toString(),
      label: suggestion.formattedStreet || index.toString(),
      data: suggestion,
    }))
  }
}
</script>

<template>
  <div class="cypress-civica-street-name-element">
    <FormElementLabelContainer
      className="ob-civica-street-name ob-autocomplete"
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
          cypress-civica-street-name-error-message
        "
      >
        {{ error.toString() }}
      </div>
    </div>
  </div>
</template>
