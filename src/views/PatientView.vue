<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useSmartStore } from "../stores/smart";
import { useRouter } from "vue-router";

const smart = useSmartStore();
const router = useRouter();

// On mount, guard against missing SMART client by redirecting back to the launch page. If the patient data hasn't been loaded yet, fetch it from the FHIR server via the store.
onMounted(async () => {
  if (!smart.client) {
    await router.replace("/");
    return;
  }
  if (!smart.patient) await smart.loadPatient();
});

const p = computed(() => smart.patient);

// Returns the patient's full name by joining given names and family name. Falls back to "Unknown" if no name data is present.
function fullName(patient: any) {
  const given = patient.name?.[0]?.given?.join(" ") ?? "";
  const family = patient.name?.[0]?.family ?? "";
  return (given + " " + family).trim() || "Unknown";
}

// Returns up to two uppercase initials (first given + family) for the avatar. Falls back to "?" if neither name field is available.
function initials(patient: any) {
  const given = patient.name?.[0]?.given?.[0] ?? "";
  const family = patient.name?.[0]?.family ?? "";
  return ((given[0] ?? "") + (family[0] ?? "")).toUpperCase() || "?";
}

// Calculates the patient's current age in years from a FHIR birthDate string. Adjusts for whether the birthday has occurred yet in the current year.
function calcAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return String(age);
}

// Formats a FHIR address object into a single comma-separated string including street lines, city, state, postal code, and country.
function formatAddress(addr: any): string {
  const parts: string[] = [];
  if (addr.line?.length) parts.push(addr.line.join(", "));
  if (addr.city) parts.push(addr.city);
  if (addr.state) parts.push(addr.state);
  if (addr.postalCode) parts.push(addr.postalCode);
  if (addr.country) parts.push(addr.country);
  return parts.join(", ");
}

// Filters the patient's telecom entries by the given system (e.g. "phone", "email", "fax") and returns the list of corresponding values.
function getTelecom(patient: any, system: string): string[] {
  return (patient.telecom ?? [])
    .filter((t: any) => t.system === system)
    .map((t: any) => t.value);
}

// Extracts patient identifiers and resolves a human-readable label (from type text, coding display, or system URL e.g. SSN, MRN, Passport). Filters out entries with no value.
function getIdentifiers(patient: any): { label: string; value: string }[] {
  return (patient.identifier ?? []).map((id: any) => {
    const system = id.system ?? "";
    let label = id.type?.text ?? id.type?.coding?.[0]?.display ?? "";
    if (!label) {
      if (system.includes("ssn") || system.includes("ss-")) label = "SSN";
      else if (system.includes("mrn") || system.includes("MR")) label = "MRN";
      else if (system.includes("passport")) label = "Passport";
      else if (system.includes("driver")) label = "Driver's License";
      else label = system.split("/").pop() ?? "ID";
    }
    return { label, value: id.value ?? "" };
  }).filter((x: any) => x.value);
}

// Returns a list of the patient's communication languages, appending "(preferred)" where applicable.
function getLanguages(patient: any): string[] {
  return (patient.communication ?? []).map((c: any) => {
    const display = c.language?.coding?.[0]?.display ?? c.language?.text ?? c.language?.coding?.[0]?.code ?? "";
    const pref = c.preferred ? " (preferred)" : "";
    return display + pref;
  }).filter(Boolean);
}

// Resolves the patient's marital status to a display string, falling back through text, coding display, and code.
function maritalStatusText(patient: any): string {
  return patient.maritalStatus?.text
    ?? patient.maritalStatus?.coding?.[0]?.display
    ?? patient.maritalStatus?.coding?.[0]?.code
    ?? "";
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
          <h1 class="title">Patient Record</h1>
          <p class="subtitle">SMART on FHIR — Vue 3 Starter</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="smart.loading" class="state-box">
        <div class="spinner" />
        <span>Loading patient data...</span>
      </div>

      <!-- Error -->
      <div v-else-if="smart.error" class="alert alert-error" style="margin: 24px 32px">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:2px">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        Error: {{ smart.error }}
      </div>

      <!-- Patient info -->
      <div v-else-if="p" class="patient-body">

        <!-- Avatar + name -->
        <div class="patient-hero">
          <div class="avatar">{{ initials(p) }}</div>
          <div>
            <div class="patient-name">{{ fullName(p) }}</div>
            <div class="patient-tags">
              <span v-if="p.gender" class="tag tag-blue" style="text-transform:capitalize">{{ p.gender }}</span>
              <span v-if="p.birthDate" class="tag tag-gray">{{ calcAge(p.birthDate) }} yrs</span>
              <span v-if="p.deceasedBoolean || p.deceasedDateTime" class="tag tag-red">Deceased</span>
              <span v-if="p.active === false" class="tag tag-red">Inactive</span>
            </div>
          </div>
        </div>

        <div class="divider" />

        <!-- Section: Demographics -->
        <div class="section-title">Demographics</div>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">Patient ID</span>
            <code class="detail-value mono">{{ p.id }}</code>
          </div>
          <div v-if="p.birthDate" class="detail-item">
            <span class="detail-label">Date of Birth</span>
            <span class="detail-value">{{ p.birthDate }} <span class="muted">(age {{ calcAge(p.birthDate) }})</span></span>
          </div>
          <div v-if="p.gender" class="detail-item">
            <span class="detail-label">Gender</span>
            <span class="detail-value" style="text-transform:capitalize">{{ p.gender }}</span>
          </div>
          <div v-if="maritalStatusText(p)" class="detail-item">
            <span class="detail-label">Marital Status</span>
            <span class="detail-value">{{ maritalStatusText(p) }}</span>
          </div>
          <div v-if="p.multipleBirthBoolean || p.multipleBirthInteger" class="detail-item">
            <span class="detail-label">Multiple Birth</span>
            <span class="detail-value">
              {{ typeof p.multipleBirthInteger === 'number' ? `Yes (birth order: ${p.multipleBirthInteger})` : 'Yes' }}
            </span>
          </div>
          <div v-if="p.deceasedDateTime" class="detail-item">
            <span class="detail-label">Deceased Date</span>
            <span class="detail-value">{{ p.deceasedDateTime }}</span>
          </div>
        </div>

        <!-- Section: Contact -->
        <template v-if="getTelecom(p, 'phone').length || getTelecom(p, 'email').length || getTelecom(p, 'fax').length">
          <div class="divider" />
          <div class="section-title">Contact</div>
          <div class="detail-grid">
            <div v-for="phone in getTelecom(p, 'phone')" :key="phone" class="detail-item">
              <span class="detail-label">Phone</span>
              <a :href="`tel:${phone}`" class="detail-value link">{{ phone }}</a>
            </div>
            <div v-for="email in getTelecom(p, 'email')" :key="email" class="detail-item">
              <span class="detail-label">Email</span>
              <a :href="`mailto:${email}`" class="detail-value link">{{ email }}</a>
            </div>
            <div v-for="fax in getTelecom(p, 'fax')" :key="fax" class="detail-item">
              <span class="detail-label">Fax</span>
              <span class="detail-value">{{ fax }}</span>
            </div>
          </div>
        </template>

        <!-- Section: Address -->
        <template v-if="p.address?.length">
          <div class="divider" />
          <div class="section-title">Address</div>
          <div class="detail-grid">
            <div v-for="(addr, i) in p.address" :key="i" class="detail-item">
              <span class="detail-label">
                {{ addr.use ? addr.use.charAt(0).toUpperCase() + addr.use.slice(1) : 'Address' }}
              </span>
              <span class="detail-value">{{ formatAddress(addr) }}</span>
            </div>
          </div>
        </template>

        <!-- Section: Language -->
        <template v-if="getLanguages(p).length">
          <div class="divider" />
          <div class="section-title">Language</div>
          <div class="detail-grid">
            <div v-for="lang in getLanguages(p)" :key="lang" class="detail-item">
              <span class="detail-label">Language</span>
              <span class="detail-value">{{ lang }}</span>
            </div>
          </div>
        </template>

        <!-- Section: Identifiers -->
        <template v-if="getIdentifiers(p).length">
          <div class="divider" />
          <div class="section-title">Identifiers</div>
          <div class="detail-grid">
            <div v-for="id in getIdentifiers(p)" :key="id.label + id.value" class="detail-item">
              <span class="detail-label">{{ id.label }}</span>
              <code class="detail-value mono">{{ id.value }}</code>
            </div>
          </div>
        </template>

        <!-- Raw JSON -->
        <div class="divider" style="margin-top: 20px" />
        <details class="collapsible">
          <summary class="collapsible-summary">Raw JSON</summary>
          <pre class="json-block">{{ JSON.stringify(p, null, 2) }}</pre>
        </details>
      </div>

      <!-- Footer -->
      <div class="card-footer">
        <button @click="router.push('/')" class="btn-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:7px">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Launch
        </button>
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
  max-width: 660px;
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

/* Loading */
.state-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 32px;
  color: #6b7280;
  font-size: 14px;
}
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #1d4ed8;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Patient body */
.patient-body {
  padding: 28px 32px 8px;
}

/* Hero */
.patient-hero {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 24px;
}
.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1d4ed8, #0ea5e9);
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  letter-spacing: 1px;
}
.patient-name {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.3px;
  margin-bottom: 6px;
}
.patient-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: 20px;
  letter-spacing: 0.2px;
}
.tag-blue  { background: #dbeafe; color: #1d4ed8; }
.tag-gray  { background: #f3f4f6; color: #4b5563; }
.tag-red   { background: #fef2f2; color: #b91c1c; }

/* Section heading */
.section-title {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 14px;
}

.divider {
  height: 1px;
  background: #f1f5f9;
  margin: 20px 0;
}

/* Detail grid */
.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 4px;
}
.detail-item {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.detail-label {
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  min-width: 110px;
  flex-shrink: 0;
}
.detail-value {
  font-size: 14px;
  color: #111827;
  word-break: break-word;
}
.muted {
  color: #9ca3af;
  font-size: 13px;
}
.mono {
  font-family: 'Courier New', monospace;
  font-size: 12.5px;
  background: #f1f5f9;
  padding: 3px 8px;
  border-radius: 5px;
  word-break: break-all;
}
.link {
  color: #1d4ed8;
  text-decoration: none;
}
.link:hover { text-decoration: underline; }

/* Collapsible */
.collapsible { margin-bottom: 8px; }
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
  padding: 8px 0;
}
.collapsible-summary::before {
  content: '▸';
  font-size: 11px;
  transition: transform 0.2s;
}
details[open] .collapsible-summary::before {
  transform: rotate(90deg);
}
.json-block {
  background: #1e293b;
  color: #7dd3fc;
  border-radius: 10px;
  padding: 16px;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 8px 0 0;
}

/* Footer */
.card-footer {
  padding: 20px 32px 28px;
  border-top: 1px solid #f1f5f9;
  margin-top: 16px;
}
.btn-back {
  display: inline-flex;
  align-items: center;
  padding: 9px 18px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, transform 0.1s;
}
.btn-back:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateX(-2px);
}

/* Alerts */
.alert {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13.5px;
  line-height: 1.55;
}
.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}
</style>
