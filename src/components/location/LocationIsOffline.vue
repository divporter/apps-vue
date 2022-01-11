<script lang="ts">
import Vue, { PropType } from "vue"
import { Fragment } from "vue-frag"

import LocationIsOfflineFigureContent from "@/components/location/LocationIsOfflineFigureContent.vue"

import { Coords } from "@/types/location"

export default Vue.extend({
  components: {
    Fragment,
    LocationIsOfflineFigureContent,
  },
  props: {
    location: Object as PropType<Coords>,
    isOpen: Boolean,
  },
})
</script>

<template>
  <Fragment>
    <template v-if="isOpen">
      <LocationIsOfflineFigureContent v-if="location">
        <template v-slot>
          <p>
            Click the <b>Confirm</b> button below to set the location to your
            current position.
          </p>
        </template>
      </LocationIsOfflineFigureContent>
      <LocationIsOfflineFigureContent v-else>
        <template v-slot>
          <p>
            We could not find your current location. Click the <b>Cancel</b>
            button below to try again.
          </p>
        </template>
      </LocationIsOfflineFigureContent>
    </template>
    <template v-else-if="location">
      <LocationIsOfflineFigureContent>
        <template v-slot>
          <h3 class="title is-3 ob-location__latitude">Latitude</h3>
          <p>
            <b>{{ location.latitude }}</b>
          </p>
          <h3 class="title is-3 ob-location__longitude">Longitude</h3>
          <p>
            <b>{{ location.longitude }}</b>
          </p>
        </template>
      </LocationIsOfflineFigureContent>
    </template>
  </Fragment>
</template>
