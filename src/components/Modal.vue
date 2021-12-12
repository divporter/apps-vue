<script lang="ts">
import Vue from "vue"

export default Vue.extend({
  props: {
    isOpen: Boolean,
    title: { type: String, required: true },
    className: String,
    cardClassName: String,
    titleClassName: String,
    bodyClassName: String,
  },
})
</script>

<template>
  <div
    :class="{
      modal: true,
      'ob-modal': true,
      [className]: !!className,
      'is-active': isOpen,
    }"
  >
    <div class="modal-background-faded"></div>
    <div :class="{ 'modal-card': true, [cardClassName]: !!cardClassName }">
      <header class="modal-card-head">
        <p
          :class="{
            'modal-card-title': true,
            [titleClassName]: !!titleClassName,
          }"
        >
          {{ title }}
        </p>
      </header>
      <section
        :class="{ 'modal-card-body': true, [bodyClassName]: !!bodyClassName }"
      >
        <slot></slot>
      </section>
      <footer v-if="$slots.actions" class="modal-card-foot">
        <slot name="actions"></slot>
      </footer>
    </div>
  </div>
</template>
