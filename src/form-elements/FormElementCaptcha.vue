<script lang="ts">
import { PropType } from "vue"
import mixins from "vue-typed-mixins"
import { Component, Watch } from "vue-property-decorator"
import { FormTypes } from "@oneblink/types"

import IsOfflineMixin from "@/mixins/IsOffline"

const FormElementCaptchaBase = mixins(IsOfflineMixin).extend({
  inject: ["captchaSiteKey"],
  props: {
    element: {
      type: Object as PropType<FormTypes.CaptchaElement>,
      required: true,
    },
    id: { type: String, required: true },
    displayValidationMessage: Boolean,
    validationMessage: String,
  },
  methods: {
    initGRecaptcha() {
      this.$loadScript(
        "https://www.google.com/recaptcha/api.js?render=explicit"
      )
        .then(() => {
          // eslint-disable-next-line no-undef
          grecaptcha.ready(() => {
            // eslint-disable-next-line no-undef
            grecaptcha.render(this.$refs.recaptcha as HTMLElement, {
              //@ts-expect-error injected prop
              sitekey: this.captchaSiteKey,
              badge: "bottomright",
              size: "normal",
              type: "image",
              callback: (token: string) => {
                this.$emit("updateSubmission", {
                  name: this.element.name,
                  value: token,
                })
              },
            })
          })
        })
        .catch(() => {
          // Failed to fetch script
        })
    },
  },
  mounted() {
    this.initGRecaptcha()
  },
})

@Component
export default class FormElementCaptchaComponent extends FormElementCaptchaBase {
  @Watch("isOffline")
  isOfflineChange(newValue: boolean) {
    //user is online
    if (!newValue) {
      this.initGRecaptcha()
    }
  }
}
</script>

<template>
  <div class="cypress-captcha-element">
    <div class="ob-form__element ob-captcha">
      <div ref="recaptcha" class="ob-input cypress-captcha-control" />
      <div
        v-if="displayValidationMessage && !!validationMessage"
        role="alert"
        class="has-margin-top-8"
      >
        <div
          class="
            has-text-danger
            ob-error__text
            cypress-required cypress-validation-message
          "
        >
          {{ validationMessage }}
        </div>
      </div>
    </div>
  </div>
</template>
