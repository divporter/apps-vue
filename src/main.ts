import Vue from "vue"
import App from "./App.vue"

//TODO replace with tippy
import vuetify from "./plugins/vuetify"

Vue.config.productionTip = false
Vue.config.ignoredElements = ["on-loading"]

new Vue({
  vuetify,
  render: (h) => h(App),
}).$mount("#app")
