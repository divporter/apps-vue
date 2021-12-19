<script lang="ts">
import Vue, { VueConstructor } from "vue"

const ClickOutsideElement = (
  component: VueConstructor<Vue>,
  ref: Element,
  callback: () => void
) => {
  return Vue.component("ClickOutsideElement", {
    render(createElement) {
      return createElement(component, {
        props: {
          returnedData: this.returnedData,
        },
      })
    },
    data() {
      return {
        returnedData: fetchData(mockData),
      }
    },
  })
}

export default HoComponent
</script>
