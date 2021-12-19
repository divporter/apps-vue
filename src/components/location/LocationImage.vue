<script lang="ts">
import Vue, { PropType } from "vue"
import { Component, InjectReactive } from "vue-property-decorator"

import { Coords } from "@/types/location"
const apiUrl = "https://maps.googleapis.com/maps/api/staticmap"

const LocationImageDisplayBase = Vue.extend({
  props: {
    location: Object as PropType<Coords>,
  },
  data() {
    return {
      mapHeight: 300,
    }
  },
})

@Component
export default class LocationImageDisplay extends LocationImageDisplayBase {
  @InjectReactive() readonly googleMapsApiKey!: string

  get staticUrl() {
    const center = `${this.location.latitude},${this.location.longitude}`
    const queries: Record<string, string> = {
      key: this.googleMapsApiKey,
      size: `${this.mapHeight}x${this.mapHeight}`,
      zoom: this.location.zoom.toString(),
      center,
      markers: `color:red|${center}`,
    }

    const qs = new URLSearchParams(queries)

    return `${apiUrl}?${qs.toString()}`
  }
}
</script>

<template>
  <figure class="ob-figure">
    <img
      class="ob-location__map"
      alt="'map with center at ' + location.latitude + 'latitude, ' + location.longitude + 'longitude'"
      :src="staticUrl"
      :height="mapHeight"
      :width="mapHeight"
    />
  </figure>
</template>
