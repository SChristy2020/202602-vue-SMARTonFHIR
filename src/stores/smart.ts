import { defineStore } from "pinia";
import type Client from "fhirclient/lib/Client";

type SmartState = {
  client: Client | null;
  patient: any | null;
  loading: boolean;
  error: string | null;
};

export const useSmartStore = defineStore("smart", {
  state: (): SmartState => ({
    client: null,
    patient: null,
    loading: false,
    error: null,
  }),
  actions: {
    setClient(client: Client) {
      this.client = client;
    },
    async loadPatient() {
      if (!this.client) throw new Error("SMART client not ready");
      this.loading = true;
      this.error = null;
      try {
        this.patient = await this.client.patient.read();
      } catch (e: any) {
        this.error = e?.message ?? String(e);
      } finally {
        this.loading = false;
      }
    },
    reset() {
      this.client = null;
      this.patient = null;
      this.loading = false;
      this.error = null;
    },
  },
});