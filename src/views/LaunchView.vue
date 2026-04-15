<script setup lang="ts">
import FHIR from "fhirclient";
import { ref, onMounted } from "vue";
import { SMART_CONFIG } from "../smart";

const issuer = ref("https://launch.smarthealthit.org/v/r4/fhir"); // Commonly used Sandbox R4
const launch = ref<string | null>(null);
const message = ref("");
const launchWarning = ref("");
const callbackError = ref("");

const origin = window.location.origin;

// On mount, parse URL query params to extract the launch token, iss (Issuer URL), and any callback_error from a failed authorization redirect. Clears the error param from the URL after reading it to keep the address bar clean.
onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  launch.value = params.get("launch");
  const iss = params.get("iss");
  if (iss) issuer.value = iss;
  const cbErr = params.get("callback_error");
  if (cbErr) {
    callbackError.value = cbErr;
    const clean = window.location.pathname;
    window.history.replaceState({}, "", clean);
  }
});

// Initiates the SMART authorization flow. Guards against a missing launch token, then calls FHIR.oauth2.authorize() with the client config to redirect the user to the authorization server for login.
function start() {
  launchWarning.value = "";
  if (!launch.value) {
    launchWarning.value = "Please follow the 'How to Test' instructions above and launch this app from the SMART Sandbox to receive the launch parameter.";
    return;
  }
  message.value = "Redirecting to SMART authorization...";
  const authorizeOptions: any = {
    clientId: SMART_CONFIG.clientId,
    scope: SMART_CONFIG.scope,
    redirectUri: SMART_CONFIG.redirectUri,
    iss: issuer.value,
  };
  if (launch.value) authorizeOptions.launch = launch.value;

  FHIR.oauth2.authorize(authorizeOptions);
}
</script>

<template>
  <div class="page-bg">
    <div class="card">
      <!-- Header -->
      <div class="card-header">
        <div class="logo-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
        <div>
          <h1 class="title">SMART on FHIR</h1>
          <p class="subtitle">Vue 3 Starter App</p>
        </div>
      </div>

      <!-- How to test -->
      <div class="section info-box">
        <div class="section-label">
          <span class="badge badge-blue">How to Test</span>
        </div>
        <p class="info-text">
          Open
          <a href="https://launch.smarthealthit.org/" target="_blank" class="link">SMART Sandbox</a>,
          select <strong>patient</strong>, then set the App launch URL to:
        </p>
        <div class="code-block">
          <code>{{ origin }}</code>
        </div>
        <p class="info-text info-text-mt">
          The launch parameter will be automatically appended. Click Launch to return to this app and start the SMART login flow.
        </p>
      </div>

      <div class="divider" />

      <!-- Issuer URL -->
      <div class="section">
        <label class="field-label">Issuer URL <span class="field-hint">(SMART / FHIR server's base URL)</span></label>
        <input v-model="issuer" class="text-input" placeholder="https://..." />

        <details class="collapsible">
          <summary class="collapsible-summary">Common Issuer URL Reference</summary>
          <ul class="issuer-list">
            <li><span class="issuer-tag">R4</span> https://launch.smarthealthit.org/v/r4/fhir</li>
            <li><span class="issuer-tag">STU3</span> https://launch.smarthealthit.org/v/stu3/fhir</li>
            <li><span class="issuer-tag">DSTU2</span> https://launch.smarthealthit.org/v/dstu2/fhir</li>
            <li><span class="issuer-tag">HAPI</span> https://hapi.fhir.org/baseR4</li>
            <li><span class="issuer-tag">EHR</span> Your hospital's Epic sandbox URL</li>
            <li><span class="issuer-tag">Custom</span> Your organization's own FHIR server</li>
          </ul>
        </details>
      </div>

      <!-- Launch param status -->
      <div class="section">
        <label class="field-label">Launch param <span class="field-hint">(Passed from SMART Launcher)</span></label>
        <div class="launch-status" :class="launch ? 'status-ok' : 'status-none'">
          <div class="status-dot" />
          <code class="status-value">{{ launch ?? "none" }}</code>
        </div>
      </div>

      <!-- Button -->
      <button @click="start" class="btn-primary">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
        Start SMART Login
      </button>

      <!-- Warnings / messages -->
      <div v-if="launchWarning" class="alert alert-warning">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="alert-icon">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ launchWarning }}
      </div>

      <div v-if="callbackError" class="alert alert-error">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="alert-icon">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        Error: {{ callbackError }}
      </div>

      <div v-else-if="message" class="alert alert-info">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="alert-icon">
          <circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/>
        </svg>
        {{ message }}
      </div>
    </div>
  </div>
</template>

<style scoped>
* { box-sizing: border-box; }

.page-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 48px 16px;
}

.card {
  width: 100%;
  max-width: 680px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

/* Header */
.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 28px 32px 24px;
  background: linear-gradient(135deg, #1d4ed8, #0ea5e9);
  color: #fff;
}

.logo-icon {
  width: 52px;
  height: 52px;
  background: rgba(255,255,255,0.18);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.3px;
}

.subtitle {
  font-size: 13px;
  margin: 2px 0 0;
  opacity: 0.8;
}

/* Sections */
.section {
  padding: 20px 32px;
}

.divider {
  height: 1px;
  background: #f1f5f9;
  margin: 0 32px;
}

/* Info box */
.info-box {
  background: #f8faff;
  margin: 0;
  padding: 20px 32px;
  border-bottom: 1px solid #e8f0fe;
}

.section-label {
  margin-bottom: 10px;
}

.badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 20px;
}

.badge-blue {
  background: #dbeafe;
  color: #1d4ed8;
}

.info-text {
  font-size: 14px;
  color: #374151;
  margin: 0 0 8px;
  line-height: 1.6;
}

.link {
  color: #1d4ed8;
  text-decoration: none;
  font-weight: 600;
}
.link:hover { text-decoration: underline; }

.code-block {
  background: #1e293b;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  color: #7dd3fc;
  font-family: 'Courier New', monospace;
  word-break: break-all;
}

/* Field */
.field-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.field-hint {
  font-weight: 400;
  color: #9ca3af;
}

.text-input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  background: #fff;
  transition: border-color 0.15s, box-shadow 0.15s;
  outline: none;
}
.text-input:focus {
  border-color: #1d4ed8;
  box-shadow: 0 0 0 3px rgba(29,78,216,0.12);
}

/* Collapsible */
.collapsible {
  margin-top: 12px;
}

.collapsible-summary {
  font-size: 13px;
  color: #1d4ed8;
  cursor: pointer;
  font-weight: 500;
  user-select: none;
  list-style: none;
  display: flex;
  align-items: center;
  gap: 6px;
}
.collapsible-summary::before {
  content: '▸';
  font-size: 11px;
  transition: transform 0.2s;
}
details[open] .collapsible-summary::before {
  transform: rotate(90deg);
}

.issuer-list {
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.issuer-list li {
  font-size: 13px;
  color: #4b5563;
  display: flex;
  align-items: center;
  gap: 8px;
}

.issuer-tag {
  display: inline-block;
  min-width: 52px;
  text-align: center;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
  background: #e0f2fe;
  color: #0369a1;
  letter-spacing: 0.3px;
  flex-shrink: 0;
}

/* Launch status */
.launch-status {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  width: 100%;
  min-width: 0;
}

.status-ok {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.status-none {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}

.status-ok .status-dot { background: #22c55e; }
.status-none .status-dot { background: #d1d5db; }

.status-label {
  color: #6b7280;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-value {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #111827;
  word-break: break-all;
  min-width: 0;
}

/* Button */
.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 4px 32px 24px;
  padding: 13px 24px;
  width: calc(100% - 64px);
  background: linear-gradient(135deg, #1d4ed8, #0ea5e9);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.2px;
  box-shadow: 0 4px 14px rgba(29,78,216,0.35);
  transition: opacity 0.15s, transform 0.1s, box-shadow 0.15s;
}
.btn-primary:hover {
  opacity: 0.92;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(29,78,216,0.45);
}
.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(29,78,216,0.3);
}

/* Alerts */
.alert {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 0 32px 20px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13.5px;
  line-height: 1.55;
}

.alert-warning {
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
}

.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.alert-info {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
}

.info-text-mt {
  margin-top: 8px;
}

.btn-icon {
  margin-right: 8px;
}

.alert-icon {
  flex-shrink: 0;
  margin-top: 2px;
}
</style>
