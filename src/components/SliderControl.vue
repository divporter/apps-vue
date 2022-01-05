<script lang="ts">
import Vue, { PropType } from "vue"
import { Component, Watch } from "vue-property-decorator"
import { FormTypes } from "@oneblink/types"
import _debounce from "lodash.debounce"

const sliderBubbleWidthInPixels = 24

const SliderControlBase = Vue.extend({
  props: {
    id: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    value: {
      required: true,
    },
    element: {
      type: Object as PropType<FormTypes.NumberElement>,
      required: true,
    },
  },
  computed: {
    number(): number {
      return typeof this.value === "number"
        ? this.value
        : parseFloat(this.value as string)
    },
  },
  methods: {
    onBlur() {
      this.$emit("blur")
    },
    onChange(event: unknown) {
      this.$emit("change", event)
    },
  },
})

@Component
export default class SliderControl extends SliderControlBase {
  public removeIsDraggingClass = _debounce(
    (outputElement: HTMLOutputElement) => {
      if (outputElement.classList.contains("is-dragging")) {
        outputElement.classList.remove("is-dragging")
      }
    },
    500
  )

  public onNumberChange() {
    if (
      Number.isNaN(this.number) ||
      typeof this.element.maxNumber !== "number" ||
      typeof this.element.minNumber !== "number"
    ) {
      return
    }

    const outputElement = this.$refs.sliderOutputRef as HTMLOutputElement
    const inputElement = this.$refs.sliderInputRef as HTMLInputElement
    if (outputElement && inputElement) {
      const range = this.element.maxNumber - this.element.minNumber
      const percentage = (this.number - this.element.minNumber) / range
      const inputWidth = inputElement.getBoundingClientRect().width
      const outputWidth = outputElement.getBoundingClientRect().width
      const sliderBubbleOffSetPixels =
        (percentage - 0.5) * -sliderBubbleWidthInPixels

      outputElement.style.left = `${percentage * inputWidth}px`
      outputElement.style.marginLeft = `-${
        outputWidth / 2 - sliderBubbleOffSetPixels
      }px`

      if (!outputElement.classList.contains("is-dragging")) {
        outputElement.classList.add("is-dragging")
      }
      this.removeIsDraggingClass(outputElement)
    }
  }

  get maxNumber() {
    return this.element.maxNumber
  }

  get minNumber() {
    return this.element.minNumber
  }

  @Watch("number")
  @Watch("maxNumber")
  @Watch("minNumber")
  onNumberChanged() {
    this.onNumberChange()
  }

  mounted() {
    Vue.nextTick().then(this.onNumberChange)
  }
}
</script>

<template>
  <div class="control">
    <output
      ref="sliderOutputRef"
      class="ob-number__output cypress-number-output"
      :for="id"
    >
      {{ text }}
    </output>
    <input
      ref="sliderInputRef"
      :id="id"
      :name="element.name"
      class="
        slider
        ob-input
        is-fullwidth
        cypress-slider-number-control
        is-large is-circle
        cypress-number-control
      "
      :step="element.sliderIncrement ? element.sliderIncrement : 1"
      :min="element.minNumber"
      :max="element.maxNumber"
      :value="text"
      type="range"
      @input="onChange"
      :required="element.required"
      :disabled="element.readOnly"
      @blur="onBlur"
    />
  </div>
</template>
