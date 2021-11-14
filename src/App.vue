<template>
  <OneBlinkForm />
</template>

<script lang="ts">
import OneBlinkForm from "./OneBlinkFormUncontrolled.vue"

export default {
  components: {
    OneBlinkForm,
  },
  data() {
    return {
      definition: {
        id: 9050,
        name: "Text Field",
        description: "Just a text field",
        organisationId: "5f3f597239c5511100000007",
        elements: [
          {
            name: "TField",
            label: "Text Field",
            type: "text",
            required: false,
            id: "76763797-479b-4754-8897-a083d62a0ff1",
            conditionallyShow: false,
            readOnly: false,
            isDataLookup: false,
            isElementLookup: false,
          },
        ],
        isAuthenticated: false,
        submissionEvents: [],
        createdAt: "2021-11-13T02:34:42.000Z",
        updatedAt: "2021-11-14T00:15:58.000Z",
        isMultiPage: false,
        postSubmissionAction: "FORMS_LIBRARY",
        cancelAction: "FORMS_LIBRARY",
        isInfoPage: false,
        formsAppEnvironmentId: 363,
        tags: [],
        formsAppIds: [992],
      },
    }
  },
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
