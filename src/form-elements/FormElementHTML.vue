<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"
import sanitizeHtml from "../services/sanitize-html"
//TODO
// import { RepeatableSetIndexContext } from './FormElementRepeatableSet'
//const index = React.useContext(RepeatableSetIndexContext)

export default Vue.extend({
  props: {
    element: {
      type: Object as PropType<FormTypes.HtmlElement>,
      required: true,
    },
    index: Number,
  },
  computed: {
    html(): string {
      return this.element.defaultValue.replace(
        "{INDEX}",
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

type Props = { element: FormTypes.HtmlElement } function FormElementHTML({
element }: Props) { const index = React.useContext(RepeatableSetIndexContext)
const html = React.useMemo(() => { return
element.defaultValue.replace('{INDEX}', (index + 1).toString()) },
[element.defaultValue, index]) return ( ) } export default
React.memo(FormElementHTML)
