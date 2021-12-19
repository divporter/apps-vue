<script lang="ts">
import Vue, { PropType } from "vue"
// import {Component, Inject} from "vue-property-decorator"
import { Loader } from "@googlemaps/js-api-loader"
import { Coords } from "@/types/location"

type DataProps = {
  map: google.maps.Map | null
  marker: google.maps.Marker | null
  mapHeight: number
}

const mapHeight = 300
export default Vue.extend({
  inject: ["googleMapsApiKey"],
  props: { location: { type: Object as PropType<Coords>, required: true } },
  data(): DataProps {
    return {
      map: null,
      marker: null,
      mapHeight,
    }
  },
  computed: {
    center(): { lat: number; lng: number } {
      return {
        lat: this.location.latitude,
        lng: this.location.longitude,
      }
    },
  },
  methods: {
    onChange(coords: Coords) {
      this.$emit("setLocation", coords)
    },
  },
  mounted() {
    const loader = new Loader({
      //@ts-expect-error injected
      apiKey: this.googleMapsApiKey,
      version: "weekly",
    })

    loader.load().then(() => {
      this.map = new google.maps.Map(this.$refs.mapCanvas as HTMLElement, {
        center: this.center,
        zoom: this.location.zoom,
      })

      this.map.addListener("zoom_changed", () => {
        this.onChange({
          latitude: this.location.latitude,
          longitude: this.location.longitude,
          zoom: this.map?.getZoom() || this.location.zoom,
        })
      })

      this.marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: this.center,
        draggable: true,
        map: this.map,
      })

      this.marker.addListener("dragend", (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const { lat, lng } = event.latLng.toJSON()
          this.onChange({
            latitude: lat,
            longitude: lng,
            zoom: this.location.zoom,
          })
        }
      })
    })
  },
})
</script>

<template>
  <figure class="ob-figure">
    <div ref="mapCanvas" :style="{ height: mapHeight + 'px' }"></div>
  </figure>
</template>
