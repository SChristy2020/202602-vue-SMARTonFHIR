<script setup lang="ts">
import FHIR from "fhirclient";
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useSmartStore } from "../stores/smart";

const router = useRouter();
const smart = useSmartStore();

// On mount, finalize the SMART OAuth2 handshake. On success, stores the authorized client and navigates to the patient page. On failure, redirects back to the launch page with the error message as a query param.
onMounted(async () => {
  smart.reset();

  try {
    const client = await FHIR.oauth2.ready();
    smart.setClient(client);
    await router.replace("/patient");
  } catch (e: any) {
    smart.error = e?.message ?? String(e);
    const errMsg = e?.message ?? String(e);
    // Check if the error came from URL params (server-side error redirect)
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get("error");
    const urlDesc = params.get("error_description");
    const displayError = urlDesc
      ? `${urlError}: ${urlDesc}`
      : urlError ?? errMsg;
    await router.replace(`/?callback_error=${encodeURIComponent(displayError)}`);
  }
});
</script>

<template>
  <div style="max-width: 720px; margin: 40px auto; padding: 16px">
    <h2>Callback</h2>
    <p v-if="!smart.error">Finishing authorization...</p>
    <p v-else style="color: red">Error: {{ smart.error }}</p>
  </div>
</template>