<script lang="ts">
// const FormElementFilesController = ({ value, onChange, ...props }: Props) => {
//   if (checkIsUsingLegacyStorage(props.element)) {
//     return (
//       <FormElementFilesLegacy
//         value={value as FilesElementFile[] | undefined}
//         onChange={onChange as FormElementValueChangeHandler<FilesElementFile[]>}
//         {...props}
//       />
//     )
//   }
//   return (

//   )
// }

import Vue, { PropType } from "vue"
import { Fragment } from "vue-frag"

import { FormTypes } from "@oneblink/types"
import FormElementFilesLegacy from "./legacy/FormElementFiles.vue"
// import FormElementFiles from "./FormElementFiles"
import { Attachment } from "../../types/attachments"

import { checkIsUsingLegacyStorage } from "../../services/attachments"

export default Vue.extend({
  components: {
    Fragment,
    FormElementFilesLegacy,
  },
  props: {
    id: { type: String, required: true },
    element: {
      type: Object as PropType<FormTypes.FilesElement>,
      required: true,
    },
    value: Array as PropType<Attachment[]>,
    displayValidationMessage: Boolean,
    validationMessage: String,
  },
  methods: {
    checkIsUsingLegacyStorage,
    updateSubmission(attachments?: Attachment[]) {
      this.$emit("updateSubmission", {
        name: this.element.name,
        value: attachments,
      })
    },
  },
})
</script>

<template>
  <Fragment v-if="checkIsUsingLegacyStorage(element)">
    <FormElementFilesLegacy
      :id="id"
      :element="element"
      :value="value"
      :validationMessage="validationMessage"
      :displayValidationMessage="displayValidationMessage"
      @updateSubmission="updateSubmission"
    />
    <!--FormElementFiles
      value={value as Attachment[] | undefined}
      onChange={onChange as FormElementValueChangeHandler<Attachment[]>}
      {...props}
    /-->
  </Fragment>
</template>
