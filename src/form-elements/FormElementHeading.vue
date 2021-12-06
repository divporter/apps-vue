<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"

export default Vue.extend({
  props: {
    element: {
      type: Object as PropType<FormTypes.HeadingElement>,
      required: true,
    },
  },
  computed: {
    headingElement(): string {
      switch (this.element.headingType) {
        case 1:
          return "h1"
        case 2:
          return "h2"
        case 3:
          return "h3"
        case 4:
          return "h4"
        case 5:
        default:
          return "h5"
      }
    },
  },
})
</script>
<template>
  <div class="cypress-heading-element">
    <div class="ob-form__element ob-heading">
      <component
        :is="headingElement"
        :class="'ob-heading__text title is-' + element.headingType"
        >{{ element.label }}</component
      >
    </div>
  </div>
</template>

<style scoped>
.title.ob-heading__text {
  font-weight: 200;
  line-height: 1.125;
  font-family: BlinkMacSystemFont, -apple-system, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    "Helvetica", "Arial", sans-serif !important;
}
.is-1 {
  font-size: 3rem !important;
}

.is-2 {
  font-size: 2.5rem !important;
}

.is-3 {
  font-size: 2rem !important;
}

.is-4 {
  font-size: 1.5rem !important;
}

.is-5 {
  font-weight: 300;
  font-size: 1.25rem !important;
}
</style>
