<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"

export default Vue.extend({
  props: {
    id: {
      type: String,
      required: true,
    },
    element: {
      type: Object as PropType<FormTypes.CheckboxElement>,
      required: true,
    },
    options: {
      type: Array as PropType<FormTypes.ChoiceElementOption[]>,
      required: true,
    },
    selected: {
      type: Array as PropType<Array<string>>,
      required: true,
    },
    disabled: Boolean,
  },
  computed: {
    allSelected(): boolean {
      return this.options.every((option) => {
        return this.selected.includes(option.value)
      })
    },
  },
  methods: {
    handleToggleAll(input: boolean) {
      this.$emit("toggleAll", input)
    },
  },
})
</script>

<template>
  <label
    class="checkbox ob-checkbox__input-label cypress-checkbox-label"
    :for="id + '_select-all'"
    :style="{ fontStyle: 'italic', marginBottom: '1.25rem' }"
  >
    <v-checkbox
      color="default"
      :class="{
        'ob-checkbox__input-checked': allSelected,
        'ob-checkbox__input': true,
        'cypress-checkbox-control': true,
      }"
      :label="allSelected ? 'Deselect All' : 'Select All'"
      :id="id + '_select-all'"
      :ripple="false"
      :checked="allSelected"
      :indeterminate="!!selected.length && !allSelected"
      @change="handleToggleAll"
      :disabled="disabled"
    />
  </label>
</template>
