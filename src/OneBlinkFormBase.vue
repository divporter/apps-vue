<script lang="ts">
// export type BaseProps = {
//   onCancel: () => unknown
//   onSubmit: (newFormSubmission: submissionService.NewFormSubmission) => unknown
//   disabled?: boolean
//   isPreview?: boolean
//   googleMapsApiKey?: string
//   captchaSiteKey?: string
//   buttons?: FormsAppsTypes.FormsListStyles["buttons"]
//   primaryColour?: string
//   onSaveDraft?: (
//     newDraftSubmission: submissionService.NewDraftSubmission
//   ) => unknown
// }

// export type ControlledProps = {
//   definition: FormTypes.Form
//   submission: FormSubmissionModel
//   setFormSubmission: SetFormSubmission
// }

// type Props = BaseProps &
//   ControlledProps & {
//     isReadOnly: boolean
//   }
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"
import OneBlinkFormElements from "@/components/OneBlinkFormElements.vue"

export default Vue.extend({
  components: {
    OneBlinkFormElements,
  },
  props: {
    definition: Object as PropType<FormTypes.Form>,
  },
})
</script>

<template>
  <OneBlinkFormElements
    :formId="definition.id"
    :element="definition.elements[0]"
    :id="definition.elements[0].id"
  />
</template>
