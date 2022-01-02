import VueSignaturePad from "vue-signature-pad"
import LoadScript from "vue-plugin-load-script"
import OneBlinkForm from "./OneBlinkFormUncontrolled.vue"

const OneBlinkFormComponent = {
  install(Vue) {
    Vue.config.ignoredElements = ["on-loading"]
    Vue.use(VueSignaturePad)
    Vue.use(LoadScript)
    // Let's register our component globally
    // https://vuejs.org/v2/guide/components-registration.html
    Vue.component("OneBlinkForm", OneBlinkForm)
  },
}

// Automatic installation if Vue has been added to the global scope.
if (typeof window !== "undefined" && window.Vue) {
  window.Vue.use(OneBlinkFormComponent)
}

export { OneBlinkFormComponent as OneBlinkForm }
