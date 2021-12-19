<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"
import sanitizeHtml from "../services/sanitize-html"

export default Vue.extend({
  inject: {
    index: { default: 0 },
  },
  props: {
    element: {
      type: Object as PropType<FormTypes.HtmlElement>,
      required: true,
    },
  },
  computed: {
    html(): string {
      return this.element.defaultValue.replace(
        "{INDEX}",
        //@ts-expect-error it's injected
        (this.index + 1).toString()
      )
    },
  },
  methods: {
    sanitizeHtml,
  },
})
</script>

<template>
  <div class="cypress-html-element">
    <div class="ob-form__element ob-information cypress-html-element">
      <div
        class="cypress-html-element-content ob-information__content ql-editor"
        v-html="sanitizeHtml(html)"
      />
    </div>
  </div>
</template>
