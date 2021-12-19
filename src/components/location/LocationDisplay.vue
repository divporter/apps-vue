<script lang="ts">
import { PropType } from "vue"
import { Component, Watch } from "vue-property-decorator"
import mixins from "vue-typed-mixins"

import IsOfflineMixin from "@/mixins/IsOffline"

import { Fragment } from "vue-frag"
import OnLoading from "@/components/OnLoading.vue"
import LocationIsOffline from "./LocationIsOffline.vue"
import LocationImage from "./LocationImage.vue"
import LocationPicker from "./LocationPicker.vue"

import { Coords } from "../..//types/location"

const LocationDisplayBase = mixins(IsOfflineMixin).extend({
  components: {
    Fragment,
    OnLoading,
    LocationIsOffline,
    LocationImage,
    LocationPicker,
  },
  props: {
    isLoading: Boolean,
    isOpen: Boolean,
    location: Object as PropType<Coords>,
  },
  methods: {
    updateSubmission(coords?: Coords) {
      this.$emit("setLocation", coords)
    },
  },
})

@Component
export default class LocationDisplay extends LocationDisplayBase {
  @Watch("isOpen")
  isOpenChange() {
    if (this.isOpen && !this.isOffline && !this.isLoading) {
      if (!this.location) {
        throw new Error(
          'Default location was not set for "location" form element'
        )
      }
    }
  }
}
</script>

<template>
  <Fragment>
    <figure v-if="isLoading" class="ob-figure">
      <div class="figure-content">
        <OnLoading small></OnLoading>
      </div>
    </figure>

    <LocationIsOffline
      v-else-if="isOffline"
      :location="location"
      :isOpen="isOpen"
    />

    <LocationPicker
      v-else-if="isOpen"
      :location="location"
      @setLocation="onChange"
    />

    <LocationImage v-else-if="location" :location="location" />
    <template v-else><!-- --></template>
  </Fragment>
</template>
