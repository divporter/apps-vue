<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"

export default Vue.extend({
  props: {
    page: Object as PropType<FormTypes.PageElement>,
    currentPage: Object as PropType<FormTypes.PageElement>,
    currentPageIndex: Number,
    index: Number,
    hasErrors: Boolean,
  },
  methods: {
    onClick() {
      if (this.page.id !== this.currentPage.id) {
        this.$emit("setPageId", this.page.id)
      }
    },
  },
})
</script>

<template>
  <div
    :id="'steps-navigation-step-' + page.id"
    :class="{
      'step-item': true,
      'cypress-step-item': true,
      'is-active': currentPage.id === page.id,
      'is-completed': currentPageIndex > index,
      'is-error': false,
    }"
    @click.stop="onClick"
  >
    <div
      class="step-marker step-marker-error ob-step-marker cypress-step-marker"
      :name="'cypress-page-stepper' + (index + 1)"
      :value="index + 1"
    >
      <v-tool-tip v-if="hasErrors" title="Page has errors">
        <span class="icon tooltip has-tooltip-top cypress-page-error">
          <i class="material-icons has-text-danger is-size-3"> warning </i>
        </span>
      </v-tool-tip>
      <span v-else>{{ index + 1 }}</span>
    </div>
    <div class="step-details ob-step-details">
      <p class="step-title ob-step-title cypress-desktop-step-title">
        {{ page.label }}
      </p>
    </div>
  </div>
</template>
