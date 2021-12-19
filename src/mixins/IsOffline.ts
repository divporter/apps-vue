import Vue from "vue"

export default Vue.extend({
  data() {
    return {
      isOffline: window.navigator && !window.navigator.onLine,
    }
  },
  methods: {
    onChange() {
      this.isOffline = window.navigator && !window.navigator.onLine
    },
  },
  mounted() {
    window.addEventListener("online", this.onChange)

    window.addEventListener("offline", this.onChange)
  },
  beforeDestroy() {
    window.removeEventListener("online", this.onChange)
    window.removeEventListener("offline", this.onChange)
  },
})
