import Vue from "vue"
import App from "./App.vue"
import VueSignaturePad from "vue-signature-pad"
import LoadScript from "vue-plugin-load-script"
import VueTippy from "vue-tippy/dist/vue-tippy.esm"

import UiRadio from "balm-ui/components/radio"
import UiCheckbox from "balm-ui/components/checkbox"
import UiSwitch from "balm-ui/components/switch"
import UiCollapse from "balm-ui/components/collapse"
import vRipple from "balm-ui/directives/ripple"
import $theme from "balm-ui/plugins/theme"

Vue.use(UiRadio)
Vue.use(UiCheckbox)
Vue.use(UiSwitch)
Vue.use(UiCollapse)
Vue.directive(vRipple.name, vRipple)
Vue.use($theme, {
  secondary: "#4c8da7",
})

Vue.config.productionTip = false
//TODO do we need this really?
Vue.config.ignoredElements = ["on-loading"]

Vue.use(VueSignaturePad)
Vue.use(LoadScript)
Vue.use(VueTippy)

new Vue({
  render: (h) => h(App),
}).$mount("#app")
