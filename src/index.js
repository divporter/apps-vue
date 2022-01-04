import VueSignaturePad from "vue-signature-pad"
import LoadScript from "vue-plugin-load-script"
import OneBlinkForm from "./OneBlinkFormUncontrolled.vue"

const OneBlinkFormComponents = {
  install(Vue) {
    Vue.config.ignoredElements = ["on-loading"]
    Vue.use(VueSignaturePad)
    Vue.use(LoadScript)
    Vue.component("OneBlinkForm", OneBlinkForm)
  },
}

// Automatic installation if Vue has been added to the global scope.
if (typeof window !== "undefined" && window.Vue) {
  window.Vue.use(OneBlinkFormComponents)
}


export default OneBlinkFormComponents
