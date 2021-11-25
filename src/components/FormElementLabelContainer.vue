<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"

export default Vue.extend({
  props: {
    className: String,
    element: Object as PropType<FormTypes.FormElementBase>,
    id: String,
    required: Boolean,
  },
})
</script>

<template>
  <div :class="['ob-form__element', className]">
    <div class="label ob-label__container">
      <slot name="leading"></slot>
      <label
        :class="{
          'ob-label': true,
          'ob-label__required': required,
          'is-required': required,
        }"
        :for="id"
      >
        {{ element.label }}
      </label>
      <v-tooltip v-if="element.hint" top>
        <template v-slot:activator="{ on, attrs }">
          <i
            class="material-icons has-text-grey-light ob-label__hint"
            v-bind="attrs"
            v-on="on"
          >
            info
          </i>
        </template>
        {{ element.hint }}
      </v-tooltip>
    </div>
    <slot></slot>
  </div>
</template>
