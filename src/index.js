import VueSignaturePad from "vue-signature-pad"
import LoadScript from "vue-plugin-load-script"
import VueTippy from "vue-tippy/dist/vue-tippy.esm"

import UiRadio from "balm-ui/components/radio"
import UiCheckbox from "balm-ui/components/checkbox"
import UiSwitch from "balm-ui/components/switch"
import UiCollapse from "balm-ui/components/collapse"
import vRipple from "balm-ui/directives/ripple"
import $theme from "balm-ui/plugins/theme"

import OneBlinkForm from "./OneBlinkFormUncontrolled.vue"

import "@/styles/oneblink-apps-vue.scss"
import "tippy.js/themes/google.css"

//TODO add primary color option
const OneBlinkFormComponents = {
  install(Vue, { primary }) {
    Vue.config.ignoredElements = ["on-loading"]
    Vue.use(VueSignaturePad)
    Vue.use(LoadScript)
    Vue.use(VueTippy)
    //balm ui components
    Vue.use(UiRadio)
    Vue.use(UiCheckbox)
    Vue.use(UiSwitch)
    Vue.use(UiCollapse)
    Vue.directive(vRipple.name, vRipple)
    Vue.use($theme, {
      secondary: primary,
    })

    Vue.component("OneBlinkForm", OneBlinkForm)
  },
}

// Automatic installation if Vue has been added to the global scope.
if (typeof window !== "undefined" && window.Vue) {
  window.Vue.use(OneBlinkFormComponents)
}

export default OneBlinkFormComponents
