import { PossibleFileConfiguration } from "../form-elements/FormElementFiles"
export interface FormElementComplianceValue {
  value?: string
  notes?: string
  files?: PossibleFileConfiguration[]
}
