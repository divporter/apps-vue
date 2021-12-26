<script lang="ts">
import Vue, { PropType } from "vue"
import { FormTypes } from "@oneblink/types"

//TODO retry load script if user comes online

export default Vue.extend({
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
                console.log(token)
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
