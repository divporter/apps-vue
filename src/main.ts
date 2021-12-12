import Vue from "vue"
import App from "./App.vue"
import VueSignaturePad from "vue-signature-pad"

//TODO replace with tippy
import vuetify from "./plugins/vuetify"

Vue.config.productionTip = false
Vue.config.ignoredElements = ["on-loading"]

Vue.use(VueSignaturePad)

new Vue({
  vuetify,
  render: (h) => h(App),
}).$mount("#app")
