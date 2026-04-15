# Vue SMART on FHIR Starter

## English

### Overview

This is a SMART on FHIR sample project built with `Vue 3`, `TypeScript`, `Vite`, `Pinia`, and `fhirclient`.

Its main purpose is to demonstrate how a frontend app can:

- Launch from a SMART launcher
- Receive `iss` and `launch` parameters
- Complete the SMART OAuth2 authorization flow
- Fetch and display the current patient's `Patient` resource

This project is a good starting point for:

- Learning the SMART on FHIR app launch flow
- Integrating with the SMART Health IT Sandbox
- Building a healthcare frontend proof of concept
- Serving as a base template for Epic sandbox or other FHIR servers

### Tech Stack

- `Vue 3`
- `TypeScript`
- `Vite`
- `Vue Router`
- `Pinia`
- `fhirclient`

### Features

- The launch page can accept or manually edit the FHIR server `issuer URL`
- Supports `launch` parameters passed from the SMART Sandbox
- Starts authorization via `FHIR.oauth2.authorize()`
- Finishes the OAuth2 handshake on `/callback`
- Reads and renders patient data on `/patient`
- Shows raw FHIR JSON for debugging

### Project Structure

```text
src/
  main.ts                 App entry point
  router.ts               Route configuration
  smart.ts                SMART OAuth base config
  stores/
    smart.ts              SMART client and patient state store
  views/
    LaunchView.vue        Launch page, starts SMART login
    CallbackView.vue      OAuth callback page
    PatientView.vue       Patient details page
```

### Requirements

- `Node.js 18+` or newer
- `npm 9+` or newer

For local development, a current LTS version is recommended.

### Installation

Run the following in the project root:

```bash
npm install
```

### How to Run

This project uses Vite to start the development server.

```bash
npm run dev
```

After startup, the terminal usually shows something like:

```text
Local: http://localhost:5173/
```

Then open this URL in your browser:

```text
http://localhost:5173/
```

If port `5173` is already in use, Vite may switch to another port automatically. Use the actual URL shown in the terminal.

### Build and Preview

Production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

### SMART on FHIR Flow

The flow in this project is:

1. The user starts at `/`
2. `iss` and `launch` are passed in from the SMART launcher
3. The user clicks `Start SMART Login` on the launch page
4. The frontend calls `FHIR.oauth2.authorize(...)`
5. After authorization, the user returns to `/callback`
6. `CallbackView` runs `FHIR.oauth2.ready()`
7. On success, the app redirects to `/patient`
8. `PatientView` calls `client.patient.read()` to load patient data

### Routes

#### `/`

Launch page responsibilities:

- Show testing instructions
- Read `iss` / `launch` from the URL
- Let the user confirm the issuer URL
- Start the SMART authorization flow

#### `/callback`

OAuth callback page responsibilities:

- Complete the SMART OAuth2 login flow
- Create the authorized SMART client
- Save the client to the Pinia store
- Redirect to `/patient` on success
- Redirect back to the home page with an error on failure

#### `/patient`

Patient page responsibilities:

- Check whether the SMART client exists
- Read the patient `Patient` resource
- Show demographics, contact info, address, language, and identifiers
- Show raw JSON for debugging

### Testing with SMART Health IT Sandbox

This project is currently best tested with the SMART Health IT Sandbox.

#### 1. Start the app first

```bash
npm run dev
```

Assume your local URL is:

```text
http://localhost:5173
```

#### 2. Open SMART Sandbox

Go to:

```text
https://launch.smarthealthit.org/
```

#### 3. Configure the launch settings

In the Sandbox UI:

- Choose a patient launch scenario, for example `patient`
- Set the App Launch URL to your app homepage, for example:

```text
http://localhost:5173
```

Notes:

- You do not need to manually add the `launch` parameter
- The Sandbox automatically appends `launch` and `iss`

#### 4. Launch the app from the Sandbox

After clicking Launch, the Sandbox redirects back to your app with a URL like:

```text
/?launch=xxx&iss=https://launch.smarthealthit.org/v/r4/fhir
```

#### 5. Click `Start SMART Login`

The app will redirect to the SMART authorization flow, then return to:

```text
/callback
```

Then it will automatically redirect to:

```text
/patient
```

If everything works correctly, you should see the patient data.

### Current SMART Configuration

The current SMART configuration is defined in [src/smart.ts](/c:/webprojects/202602_vue-SMARTonFHIR/src/smart.ts:1):

```ts
export const SMART_CONFIG = {
  clientId: "my-vue-app",
  redirectUri: `${window.location.origin}/callback`,
  scope: "launch openid profile patient/*.read",
};
```

Details:

- `clientId`: currently set to `my-vue-app`
- `redirectUri`: automatically becomes `http://your-host/callback`
- `scope`: currently requests `launch openid profile patient/*.read`

If you later connect this app to your own EHR sandbox or production environment, you will usually need to adjust:

- `clientId`
- `redirectUri`
- `scope`
- Whether the app must be registered in advance

### State Management

The Pinia store is located at [src/stores/smart.ts](/c:/webprojects/202602_vue-SMARTonFHIR/src/stores/smart.ts:1) and manages:

- `client`: the authorized FHIR client
- `patient`: the loaded patient data
- `loading`: loading state
- `error`: error message

### Common Startup Issues

#### 1. The launch param shows as `none`

This usually means you opened the app directly instead of launching it from the SMART Sandbox.

Fix:

- Go to `https://launch.smarthealthit.org/`
- Use the Sandbox Launch action to open the app

#### 2. Clicking `Start SMART Login` does nothing or fails

Please verify:

- Whether the `issuer URL` is correct
- Whether the current URL actually contains `launch`
- Whether `redirectUri` matches your actual current host

#### 3. `/patient` redirects back to home

This usually means there is no valid SMART client. Common reasons include:

- The authorization flow was not completed
- The authorization state was not restored after refresh
- An error occurred during the callback process

#### 4. Patient data cannot be loaded

Please verify:

- Whether the requested scope includes `patient/*.read`
- Whether the current Sandbox launch scenario includes patient context
- Whether the FHIR server allows that patient context

### Possible Next Steps

- Add `Observation`, `Condition`, and `MedicationRequest` queries
- Show logged-in user info and token details
- Move SMART settings into `.env`
- Add a dedicated error page and loading skeleton
- Support browsing multiple FHIR resource types
- Add unit tests and E2E tests

### Notes

- This project is currently geared toward frontend demonstration use
- There is currently no automated test setup in the repo
- The README mainly focuses on local development and SMART Sandbox testing

### Commands

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## 中文

### 專案簡介

這是一個使用 `Vue 3`、`TypeScript`、`Vite`、`Pinia` 與 `fhirclient` 建立的 SMART on FHIR 範例專案。

主要用途是示範一個前端應用如何：

- 從 SMART Launcher 啟動
- 接收 `iss` 與 `launch` 參數
- 完成 SMART OAuth2 授權流程
- 取得目前病人的 `Patient` 資料並顯示在畫面上

這個專案很適合作為以下用途的起點：

- 練習 SMART on FHIR App Launch 流程
- 串接 SMART Health IT Sandbox
- 製作醫療資訊系統的前端 PoC
- 作為後續接 Epic sandbox 或其他 FHIR server 的基礎範本

### 技術棧

- `Vue 3`
- `TypeScript`
- `Vite`
- `Vue Router`
- `Pinia`
- `fhirclient`

### 功能摘要

- 啟動畫面可輸入或帶入 FHIR Server 的 `issuer URL`
- 支援從 SMART Sandbox 帶入 `launch` 參數
- 呼叫 `FHIR.oauth2.authorize()` 啟動授權
- 在 `/callback` 完成 OAuth2 handshake
- 在 `/patient` 讀取並顯示 Patient 資料
- 顯示原始 FHIR JSON，方便除錯

### 專案結構

```text
src/
  main.ts                 App 進入點
  router.ts               路由設定
  smart.ts                SMART OAuth 基本設定
  stores/
    smart.ts              SMART client 與 patient 狀態管理
  views/
    LaunchView.vue        啟動頁，負責發起 SMART login
    CallbackView.vue      OAuth callback 頁
    PatientView.vue       病人資料頁
```

### 環境需求

- `Node.js 18+` 或更新版本
- `npm 9+` 或更新版本

如果只是本機開發，使用目前常見的 LTS 版本即可。

### 安裝方式

在專案根目錄執行：

```bash
npm install
```

### 如何啟用

本專案使用 Vite 啟動開發伺服器。

```bash
npm run dev
```

啟動後，終端機通常會顯示類似：

```text
Local: http://localhost:5173/
```

接著用瀏覽器開啟：

```text
http://localhost:5173/
```

如果 `5173` 已被占用，Vite 可能會自動改用其他 port，請以終端機實際顯示的網址為準。

### 建置與預覽

正式建置：

```bash
npm run build
```

本機預覽建置結果：

```bash
npm run preview
```

### SMART on FHIR 啟動流程

此專案的流程如下：

1. 使用者先進入 `/`
2. 從 SMART Launcher 帶入 `iss` 與 `launch` 參數
3. 在 Launch 頁按下 `Start SMART Login`
4. 前端呼叫 `FHIR.oauth2.authorize(...)`
5. 使用者完成授權後回到 `/callback`
6. `CallbackView` 執行 `FHIR.oauth2.ready()`
7. 授權成功後導到 `/patient`
8. `PatientView` 呼叫 `client.patient.read()` 讀取病人資料

### 路由說明

#### `/`

啟動頁，負責：

- 顯示測試說明
- 接收 URL 上的 `iss` / `launch`
- 讓使用者確認 issuer URL
- 觸發 SMART 授權流程

#### `/callback`

OAuth callback 頁，負責：

- 完成 SMART OAuth2 登入
- 建立授權後的 SMART client
- 將 client 存到 Pinia store
- 成功後跳轉到 `/patient`
- 失敗時帶錯誤訊息回首頁

#### `/patient`

病人資訊頁，負責：

- 檢查 SMART client 是否存在
- 讀取病人 Patient resource
- 顯示病人基本資訊、聯絡方式、地址、語言、識別碼
- 顯示原始 JSON 方便除錯

### 如何用 SMART Health IT Sandbox 測試

這個專案目前預設最適合搭配 SMART Health IT Sandbox 測試。

#### 1. 先啟動本專案

```bash
npm run dev
```

假設你的本機網址是：

```text
http://localhost:5173
```

#### 2. 打開 SMART Sandbox

前往：

```text
https://launch.smarthealthit.org/
```

#### 3. 設定啟動資訊

在 Sandbox 畫面中：

- 選擇一個病人情境，例如 `patient`
- App Launch URL 填入你的前端首頁網址，例如：

```text
http://localhost:5173
```

注意：

- 不需要自己手動加上 `launch` 參數
- Sandbox 會在啟動時自動附加 `launch` 與 `iss`

#### 4. 從 Sandbox 啟動 App

按下 Launch 後，Sandbox 會把你導回本專案首頁，網址會帶有類似：

```text
/?launch=xxx&iss=https://launch.smarthealthit.org/v/r4/fhir
```

#### 5. 在首頁按下 `Start SMART Login`

系統會導向 SMART 授權流程，授權完成後會回到：

```text
/callback
```

接著自動跳轉到：

```text
/patient
```

若流程正常，你就會看到病人的資料。

### 目前 SMART 設定

目前專案中的 SMART 設定位於 [src/smart.ts](/c:/webprojects/202602_vue-SMARTonFHIR/src/smart.ts:1)：

```ts
export const SMART_CONFIG = {
  clientId: "my-vue-app",
  redirectUri: `${window.location.origin}/callback`,
  scope: "launch openid profile patient/*.read",
};
```

說明如下：

- `clientId`: 目前使用 `my-vue-app`
- `redirectUri`: 會依照目前網域自動組成 `http://你的網址/callback`
- `scope`: 目前要求 `launch openid profile patient/*.read`

如果你之後要接自己的 EHR sandbox 或正式環境，通常要依對方規格調整：

- `clientId`
- `redirectUri`
- `scope`
- 是否需要事先註冊 app

### 狀態管理

Pinia store 位於 [src/stores/smart.ts](/c:/webprojects/202602_vue-SMARTonFHIR/src/stores/smart.ts:1)，主要管理：

- `client`: SMART 授權後的 FHIR client
- `patient`: 已讀回來的病人資料
- `loading`: 讀取中狀態
- `error`: 錯誤訊息

### 常見啟動問題

#### 1. 首頁顯示 launch param 是 `none`

原因通常是你直接打開本機首頁，而不是從 SMART Sandbox 啟動。

解法：

- 請先到 `https://launch.smarthealthit.org/`
- 用 Sandbox 的 Launch 功能打開這個 app

#### 2. 按下 `Start SMART Login` 沒反應或失敗

請確認：

- `issuer URL` 是否正確
- 目前網址是否真的有帶 `launch`
- `redirectUri` 是否和目前實際網址一致

#### 3. `/patient` 會被導回首頁

這通常表示目前沒有有效的 SMART client，常見原因包括：

- 尚未經過完整授權流程
- 重新整理後授權狀態未成功恢復
- callback 過程出錯

#### 4. 拿不到病人資料

請確認：

- 授權 scope 是否包含 `patient/*.read`
- 目前 Sandbox 啟動情境是否有病人內容
- FHIR server 是否允許該 patient context

### 後續可延伸方向

- 增加 `Observation`、`Condition`、`MedicationRequest` 查詢
- 加入登入者資訊與 token 顯示
- 將 SMART 設定改成 `.env`
- 補上錯誤頁與 loading skeleton
- 支援多種 FHIR resource 瀏覽
- 加入單元測試與 E2E 測試

### 開發備註

- 目前專案偏向前端示範用途
- 尚未看到自動化測試設定
- README 中的啟動方式以本機開發與 SMART Sandbox 測試為主

### 指令整理

安裝依賴：

```bash
npm install
```

啟動開發環境：

```bash
npm run dev
```

建置：

```bash
npm run build
```

預覽建置結果：

```bash
npm run preview
```
