<script lang="ts">
import Vue from "vue"
import { Fragment } from "vue-frag"

export default Vue.extend({
  components: {
    Fragment,
  },
  props: { refName: String },
  methods: {
    handleClickOutside(event: MouseEvent) {
      //@ts-expect-error Vetur doesn't like it
      const defaultSlot = this.$scopedSlots.default()[0]
      if (
        //@ts-expect-error blah
        defaultSlot.context.$refs &&
        //@ts-expect-error blah
        !(defaultSlot.context.$refs[this.refName] as EventTarget).contains(
          event.target
        )
      ) {
        this.$emit("clickOutside")
      }
    },
  },
  mounted() {
    console.log(this.$refs)
    document.addEventListener("mousedown", this.handleClickOutside)
  },
  beforeDestroy() {
    document.removeEventListener("mousedown", this.handleClickOutside)
  },
})
</script>

<template>
  <Fragment>
    <slot></slot>
  </Fragment>
</template>
