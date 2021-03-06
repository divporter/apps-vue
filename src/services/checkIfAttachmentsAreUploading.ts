import { FormTypes } from "@oneblink/types"
import { Attachment } from "../types/attachments"
import { FormElementComplianceValue } from "@/types/compliance"
import { checkIsUsingLegacyStorage } from "./attachments"
import { FormSubmissionModel } from "../types/form"

function checkIfAttachmentsAreUploadingForFormElements(
  formElements: FormTypes.FormElement[],
  submission: FormSubmissionModel
): boolean {
  return formElements.some((formElement) => {
    switch (formElement.type) {
      case "page":
      case "section": {
        return checkIfAttachmentsAreUploadingForFormElements(
          formElement.elements,
          submission
        )
      }
      case "form": {
        const nestedSubmission = submission[formElement.name]
        if (!nestedSubmission || typeof nestedSubmission !== "object") {
          break
        }
        return checkIfAttachmentsAreUploadingForFormElements(
          formElement.elements || [],
          nestedSubmission as FormSubmissionModel
        )
      }
      case "repeatableSet": {
        const entries = submission[formElement.name]
        if (!Array.isArray(entries)) {
          break
        }
        return entries.some((entry) => {
          return (
            typeof entry === "object" &&
            checkIfAttachmentsAreUploadingForFormElements(
              formElement.elements,
              entry
            )
          )
        })
      }
      case "camera":
      case "draw":
      case "compliance":
      case "files": {
        if (checkIsUsingLegacyStorage(formElement)) {
          break
        }

        const value = submission[formElement.name]
        if (!value) {
          break
        }

        // If the attachment has a type, it has not finished uploading
        switch (formElement.type) {
          case "camera":
          case "draw": {
            return !!(value as Attachment)?.type
          }
          case "compliance": {
            return (value as FormElementComplianceValue).files?.some((file) => {
              return !!(file as Attachment)?.type
            })
          }
          case "files": {
            return (value as Attachment[])?.some((attachment) => {
              return !!attachment?.type
            })
          }
        }
      }
    }
  })
}

export default function checkIfAttachmentsAreUploading(
  form: FormTypes.Form,
  submission: FormSubmissionModel
): boolean {
  return checkIfAttachmentsAreUploadingForFormElements(
    form.elements,
    submission
  )
}
