<script lang="ts">
import Vue, { PropType } from "vue"
import Color from "color"
import { FormTypes } from "@oneblink/types"

export default Vue.extend({
  props: {
    element: {
      type: Object as PropType<
        | FormTypes.RadioButtonElement
        | FormTypes.CheckboxElement
        | FormTypes.ComplianceElement
      >,
      required: true,
    },
    option: {
      type: Object as PropType<FormTypes.ChoiceElementOption>,
      required: true,
    },
    isSelected: Boolean,
    // onClick
    className: String,
  },
  computed: {
    buttonContrastColor(): string {
      const black = "#000000"
      const white = "#FFFFFF"
      if (!this.option.colour) return white
      const color = Color(this.option.colour)
      return color.isLight() ? black : white
    },
    style(): Record<string, string> | undefined {
      return this.option.colour && this.isSelected
        ? {
            backgroundColor: this.option.colour,
            color: this.buttonContrastColor,
          }
        : undefined
    },
  },
  methods: {
    onClick() {
      this.$emit("click", this.option.value)
    },
  },
})
</script>

<template>
  <!-- TOOD emit instead of passing function -->
  <button
    type="button"
    :style="style"
    :disabled="element.readOnly"
    @click="onClick"
  >
    {{ option.label }}
  </button>
</template>
