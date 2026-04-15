# Vue SMART on FHIR Starter

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

## 技術棧

- `Vue 3`
- `TypeScript`
- `Vite`
- `Vue Router`
- `Pinia`
- `fhirclient`

## 功能摘要

- 啟動畫面可輸入或帶入 FHIR Server 的 `issuer URL`
- 支援從 SMART Sandbox 帶入 `launch` 參數
- 呼叫 `FHIR.oauth2.authorize()` 啟動授權
- 在 `/callback` 完成 OAuth2 handshake
- 在 `/patient` 讀取並顯示 Patient 資料
- 顯示原始 FHIR JSON，方便除錯

## 專案結構

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

## 環境需求

- `Node.js 18+` 或更新版本
- `npm 9+` 或更新版本

如果只是本機開發，使用目前常見的 LTS 版本即可。

## 安裝方式

在專案根目錄執行：

```bash
npm install
```

## 如何啟用

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

## 建置與預覽

正式建置：

```bash
npm run build
```

本機預覽建置結果：

```bash
npm run preview
```

## SMART on FHIR 啟動流程

此專案的流程如下：

1. 使用者先進入 `/`
2. 從 SMART Launcher 帶入 `iss` 與 `launch` 參數
3. 在 Launch 頁按下 `Start SMART Login`
4. 前端呼叫 `FHIR.oauth2.authorize(...)`
5. 使用者完成授權後回到 `/callback`
6. `CallbackView` 執行 `FHIR.oauth2.ready()`
7. 授權成功後導到 `/patient`
8. `PatientView` 呼叫 `client.patient.read()` 讀取病人資料

## 路由說明

### `/`

啟動頁，負責：

- 顯示測試說明
- 接收 URL 上的 `iss` / `launch`
- 讓使用者確認 issuer URL
- 觸發 SMART 授權流程

### `/callback`

OAuth callback 頁，負責：

- 完成 SMART OAuth2 登入
- 建立授權後的 SMART client
- 將 client 存到 Pinia store
- 成功後跳轉到 `/patient`
- 失敗時帶錯誤訊息回首頁

### `/patient`

病人資訊頁，負責：

- 檢查 SMART client 是否存在
- 讀取病人 Patient resource
- 顯示病人基本資訊、聯絡方式、地址、語言、識別碼
- 顯示原始 JSON 方便除錯

## 如何用 SMART Health IT Sandbox 測試

這個專案目前預設最適合搭配 SMART Health IT Sandbox 測試。

### 1. 先啟動本專案

```bash
npm run dev
```

假設你的本機網址是：

```text
http://localhost:5173
```

### 2. 打開 SMART Sandbox

前往：

```text
https://launch.smarthealthit.org/
```

### 3. 設定啟動資訊

在 Sandbox 畫面中：

- 選擇一個病人情境，例如 `patient`
- App Launch URL 填入你的前端首頁網址，例如：

```text
http://localhost:5173
```

注意：

- 不需要自己手動加上 `launch` 參數
- Sandbox 會在啟動時自動附加 `launch` 與 `iss`

### 4. 從 Sandbox 啟動 App

按下 Launch 後，Sandbox 會把你導回本專案首頁，網址會帶有類似：

```text
/?launch=xxx&iss=https://launch.smarthealthit.org/v/r4/fhir
```

### 5. 在首頁按下 `Start SMART Login`

系統會導向 SMART 授權流程，授權完成後會回到：

```text
/callback
```

接著自動跳轉到：

```text
/patient
```

若流程正常，你就會看到病人的資料。

## 目前 SMART 設定

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

## 狀態管理

Pinia store 位於 [src/stores/smart.ts](/c:/webprojects/202602_vue-SMARTonFHIR/src/stores/smart.ts:1)，主要管理：

- `client`: SMART 授權後的 FHIR client
- `patient`: 已讀回來的病人資料
- `loading`: 讀取中狀態
- `error`: 錯誤訊息

## 常見啟動問題

### 1. 首頁顯示 launch param 是 `none`

原因通常是你直接打開本機首頁，而不是從 SMART Sandbox 啟動。

解法：

- 請先到 `https://launch.smarthealthit.org/`
- 用 Sandbox 的 Launch 功能打開這個 app

### 2. 按下 `Start SMART Login` 沒反應或失敗

請確認：

- `issuer URL` 是否正確
- 目前網址是否真的有帶 `launch`
- `redirectUri` 是否和目前實際網址一致

### 3. `/patient` 會被導回首頁

這通常表示目前沒有有效的 SMART client，常見原因包括：

- 尚未經過完整授權流程
- 重新整理後授權狀態未成功恢復
- callback 過程出錯

### 4. 拿不到病人資料

請確認：

- 授權 scope 是否包含 `patient/*.read`
- 目前 Sandbox 啟動情境是否有病人內容
- FHIR server 是否允許該 patient context

## 後續可延伸方向

- 增加 `Observation`、`Condition`、`MedicationRequest` 查詢
- 加入登入者資訊與 token 顯示
- 將 SMART 設定改成 `.env`
- 補上錯誤頁與 loading skeleton
- 支援多種 FHIR resource 瀏覽
- 加入單元測試與 E2E 測試

## 開發備註

- 目前專案偏向前端示範用途
- 尚未看到自動化測試設定
- README 中的啟動方式以本機開發與 SMART Sandbox 測試為主

## 指令整理

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
