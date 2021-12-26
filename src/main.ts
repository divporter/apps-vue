import Vue from "vue"
import App from "./App.vue"
import VueSignaturePad from "vue-signature-pad"
import LoadScript from "vue-plugin-load-script"

//TODO replace with tippy
import vuetify from "./plugins/vuetify"

Vue.config.productionTip = false
//TODO do we need this really?
Vue.config.ignoredElements = ["on-loading"]

Vue.use(VueSignaturePad)
Vue.use(LoadScript)

new Vue({
  vuetify,
  render: (h) => h(App),
}).$mount("#app")
