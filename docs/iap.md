# 第十二轮开发指南：IAP 内购 + Paywall（RevenueCat）

> 本指南手把手教你为 OneRN Starter 集成应用内购（订阅 + 一次性购买），并搭建 Paywall 付费墙界面。不需要编程知识，按步骤操作即可。

---

## 目录

1. [概述](#1-概述)
2. [技术实施规划](#2-技术实施规划)
3. [注册 RevenueCat 账号](#3-注册-revenuecat-账号)
4. [App Store Connect 配置 iOS 产品](#4-app-store-connect-配置-ios-产品)
5. [RevenueCat 配置权益与套餐](#5-revenuecat-配置权益与套餐)
6. [获取 API Key，填入项目](#6-获取-api-key填入项目)
7. [（可选）Google Play 配置 Android 产品](#7-可选google-play-配置-android-产品)
8. [重新构建应用](#8-重新构建应用)
9. [沙盒测试](#9-沙盒测试)
10. [常见问题排查](#10-常见问题排查)

---

## 1. 概述

### 1.1 什么是 RevenueCat？

RevenueCat 是一个专门处理应用内购的中间层服务。它解决了一个痛点：App Store 和 Google Play 的内购 API 设计复杂、各不相同，出错后退款/恢复逻辑很难做对。RevenueCat 把这些复杂性全部封装起来，你只需要：

- 在 RevenueCat 后台配置好产品和价格
- 在 App Store Connect / Google Play Console 创建对应产品
- 用一套 API 搞定购买、恢复、权限检查

**免费额度：** 每月 2,500 个活跃订阅用户内完全免费，足够 MVP 阶段使用。

### 1.2 本轮将构建的功能

完成本轮后，应用将具备：

| 功能 | 说明 |
|------|------|
| **Paywall 付费墙** | 一个独立页面，展示月订阅/年订阅/终身三种套餐，支持购买和恢复购买 |
| **权益检查** | `isPro` 标志位，可用于任意页面判断用户是否已订阅 |
| **EntitlementGate** | 包装组件，对未订阅用户自动引导到 Paywall |
| **设置页入口** | 设置页增加"升级 Pro"入口，已订阅用户显示订阅信息 |
| **首页展示** | 首页功能卡片新增 RevenueCat 条目 |
| **优雅降级** | 未配置 API Key 时静默关闭内购，不崩溃 |

### 1.3 产品设计

本轮预设三款产品，对应同一个 `pro` 权益（Entitlement）：

| 产品 | RevenueCat ID | 类型 | 建议定价 |
|------|---------------|------|---------|
| 月订阅 | `monthly_pro` | 自动续费订阅 | ¥18/月 或 $2.99/月 |
| 年订阅 | `annual_pro` | 自动续费订阅 | ¥98/年 或 $14.99/年（省 58%）|
| 终身授权 | `lifetime_pro` | 一次性购买 | ¥198 或 $29.99 |

> 你可以根据自己的产品调整定价和产品数量。ID 名称可以自定义，只要 App Store / Google Play / RevenueCat 三处保持一致即可。

### 1.4 开始前需要准备什么

- **Apple Developer 账号**（$99/年），用于在 App Store Connect 创建内购产品
- **RevenueCat 账号**（免费注册）
- 应用的 Bundle ID（例如：`com.onern.starter`），已在第七轮 Supabase 配置时确定

---

## 2. 技术实施规划

> 本节为开发者阅读，了解实现方案后可直接跳到第 3 节开始操作。

### 2.1 方案选型

| 决策点 | 选择 | 原因 |
|--------|------|------|
| SDK 版本 | `react-native-purchases@^9.x` | 最新版，与 Expo 55 兼容 |
| Paywall UI | 自定义本地 UI | 完全控制样式，与项目主题系统对齐 |
| 远程 Paywall | 暂不接入 | 省去额外 SDK，MVP 阶段不需要 A/B 测试 |
| 状态管理 | TanStack Query | 与项目现有架构对齐，缓存 + 刷新逻辑完善 |
| 权益检查 | `useEntitlement` Hook | 统一入口，组件层不直接调 SDK |
| 付费墙触发 | 设置页 + 功能门控 | 不打扰用户，拒绝弹窗轰炸 |
| SDK 缺省行为 | `REVENUECAT_ENABLED` 开关 | 未填 API Key 时安静关闭，不崩溃 |
| Supabase 同步 | 本轮暂不做 | RC 是权益唯一来源，简化架构 |
| Expo 插件 | 不需要 | RC SDK 是纯 JS 配置，无需 Config Plugin |

### 2.2 新增目录结构

```
src/features/subscription/
├── model/
│   └── subscription-store.ts       # Zustand：记录最后展示 Paywall 的时间戳
├── lib/
│   ├── usePurchaseInit.ts          # SDK 初始化 + 用户登录/登出同步
│   ├── useEntitlement.ts           # isPro + customerInfo（TanStack Query）
│   ├── useOfferings.ts             # 产品列表（TanStack Query）
│   ├── usePurchase.ts              # 购买 mutation
│   ├── useRestorePurchases.ts      # 恢复购买 mutation
│   └── paywallGuard.ts             # 冷却时间判断（7 天内不重复弹）
├── ui/
│   ├── PaywallScreen.tsx           # 付费墙主页面（Modal 展示）
│   ├── ProductCard.tsx             # 单个产品卡片
│   └── EntitlementGate.tsx         # 权益门控包装组件
└── index.ts                        # 公共导出

src/providers/
└── PurchaseProvider.tsx            # SDK 初始化 + AuthProvider 用户同步
```

### 2.3 核心实现模式

**SDK 初始化（`PurchaseProvider`）**

```typescript
// 监听 AuthProvider 的 user 变化
useEffect(() => {
  if (!REVENUECAT_ENABLED) return;
  if (user?.id) {
    Purchases.logIn(user.id);           // 关联 RevenueCat 用户
  } else {
    Purchases.logOut().catch(() => {}); // 登出时解绑
  }
}, [user?.id]);
```

> **为什么在 Provider 层初始化？** 与 NotificationProvider 保持同一模式，确保 SDK 在任何页面使用 Hook 前已就绪。

**权益检查（`useEntitlement`）**

```typescript
const { data: customerInfo } = useQuery({
  queryKey: ['entitlements', user?.id],
  queryFn: () => Purchases.getCustomerInfo(),
  enabled: REVENUECAT_ENABLED && !!user?.id,
  staleTime: 1000 * 60,     // 1 分钟缓存
  gcTime: 0,                // 退出时清除（避免跨用户污染）
});

const isPro = !!customerInfo?.entitlements.active['pro']?.isActive;
```

**功能门控（`EntitlementGate`）**

```tsx
<EntitlementGate>
  <PremiumFeatureScreen />
</EntitlementGate>
// → 未订阅用户自动跳转 Paywall，已订阅正常渲染子组件
```

### 2.4 实施阶段

| 阶段 | 内容 | 前置条件 |
|------|------|---------|
| **Phase 1** | 安装 SDK + 初始化 + `isPro` Hook | API Key 已填入 `.env` |
| **Phase 2** | `useOfferings` + `PaywallScreen` + `ProductCard` | Phase 1 完成 |
| **Phase 3** | 购买 + 恢复购买 mutation | Phase 2 完成，沙盒账号就绪 |
| **Phase 4** | `EntitlementGate` + 设置页集成 | Phase 3 完成 |
| **Phase 5** | 翻译 + 首页卡片 + Maestro 测试 | Phase 4 完成 |

---

## 3. 注册 RevenueCat 账号

### 3.1 创建账号

1. 打开 [app.revenuecat.com](https://app.revenuecat.com)
2. 点击 **Get started for free**
3. 用邮箱注册，或通过 GitHub / Google 快捷登录
4. 完成邮箱验证

### 3.2 创建项目

登录后你会看到 RevenueCat 控制台：

1. 点击右上角 **+ New project**（新建项目）
2. **Project name**（项目名称）：填写你的应用名，例如 `OneRN`
3. 点击 **Create project**

### 3.3 添加 iOS 应用

进入项目后，左侧菜单点击 **Apps**（应用），然后：

1. 点击 **+ Add app**
2. 选择 **App Store**（苹果应用商店）
3. 填写以下信息：
   - **App name**：你的应用名，例如 `OneRN iOS`
   - **Bundle ID**：你的 iOS Bundle ID，例如 `com.onern.starter`
     > 到哪里找 Bundle ID？打开 `app.config.ts`，找 `ios.bundleIdentifier` 字段
4. 点击 **Save**（保存）

> 此时不需要填写 In-App Purchase Key，第 4 节会引导你创建。

---

## 4. App Store Connect 配置 iOS 产品

> **注意：** 这一步需要在 Apple 开发者后台操作，是整个流程中最复杂的部分，但只需配置一次。

### 4.1 登录 App Store Connect

1. 打开 [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. 用 Apple Developer 账号登录

### 4.2 进入应用的内购配置

1. 点击顶部菜单 **My Apps**（我的应用）
2. 找到你的应用，点击进入
3. 在左侧菜单选择 **Monetization（收益化）→ In-App Purchases（应用内购买）**

> **如果还没有创建应用？** 点击左上角 **+** 新建应用，填写应用基本信息后再进行此步骤。

### 4.3 创建月订阅产品

**第一步：新建内购产品**

1. 点击右上角 **+** 按钮
2. 选择类型 **Auto-Renewable Subscription（自动续费订阅）**
3. 填写基本信息：
   - **Reference Name（参考名称）**：`Pro Monthly`（仅供内部辨识，用户不可见）
   - **Product ID（产品 ID）**：`com.onern.starter.monthly_pro`
     > 格式建议：`{BundleID}.{产品名}`，一旦创建不可修改
4. 点击 **Create**

**第二步：配置订阅群组**

首次创建订阅时，Apple 会要求你创建"订阅群组"：

1. 点击 **Create new subscription group（创建新订阅群组）**
2. **Subscription Group Reference Name**：填写 `Pro`
3. 点击 **Create**

> 同一个订阅群组内的产品视为互斥，用户同一时间只能订阅其中一个。月订阅和年订阅应放在同一群组。

**第三步：填写产品详情**

进入刚创建的产品页：

1. 滚动到 **Subscription Durations（订阅时长）**，选择 **1 Month**（1 个月）
2. 点击 **Add Subscription Price（添加订阅价格）**：
   - 选择你的基础定价地区，例如 **China（中国大陆）**
   - 选择价格，例如 **¥18 / 月**
   - Apple 会自动同步其他地区的价格（可手动调整）
   - 点击 **Next → Confirm**
3. 滚动到 **Localizations（本地化）**，点击 **+** 添加语言：
   - 选择 **Chinese（Simplified）中文（简体）**
   - **Subscription Display Name（显示名称）**：`Pro 月度订阅`
   - **Description（描述）**：`解锁所有高级功能，按月付费`
   - 点击 **Save**
4. 重复添加 **English** 本地化：
   - **Display Name**：`Pro Monthly`
   - **Description**：`Unlock all premium features, billed monthly`
5. 点击右上角 **Save**

### 4.4 创建年订阅产品

回到 In-App Purchases 列表，点击 **+** 再次新建：

1. 类型仍选 **Auto-Renewable Subscription**
2. **Reference Name**：`Pro Annual`
3. **Product ID**：`com.onern.starter.annual_pro`
4. **Subscription Group**：选择刚才创建的 `Pro` 群组（不要新建）
5. 点击 **Create**
6. 按上方步骤，设置时长为 **1 Year**，价格为 **¥98/年**，填写本地化名称
7. 点击 **Save**

### 4.5 创建终身授权产品

1. 点击 **+**，这次类型选 **Non-Consumable（非消耗型）**
   > 非消耗型 = 一次性购买，永久拥有，不会过期
2. **Reference Name**：`Pro Lifetime`
3. **Product ID**：`com.onern.starter.lifetime_pro`
4. 点击 **Create**
5. 设置价格为 **¥198**，填写本地化名称
6. 点击 **Save**

### 4.6 等待产品状态变为 Ready to Submit

新创建的内购产品状态为 **Missing Metadata（缺少元数据）** 或 **Waiting for Review（等待审核）**。

只要状态不是 **Rejected（已拒绝）**，RevenueCat 都可以读取到产品信息。正式上架 App Store 时产品会随 App 一起审核。

---

## 5. RevenueCat 配置权益与套餐

完成 App Store 配置后，回到 RevenueCat 控制台，把三款产品关联起来。

### 5.1 配置 App Store Connect API

RevenueCat 需要访问 App Store Connect 才能读取产品和验证收据。

**在 App Store Connect 生成 API Key：**

1. 打开 [appstoreconnect.apple.com/access/api](https://appstoreconnect.apple.com/access/api)
2. 点击 **Keys（密钥）** 标签
3. 点击 **+** 新建密钥：
   - **Name（名称）**：`RevenueCat`
   - **Access（权限）**：选择 **App Manager（应用程序管理）**
4. 点击 **Generate**
5. 点击 **Download API Key** 下载 `.p8` 文件 ⚠️ **只能下载一次，请妥善保存**
6. 记录以下信息：
   - **Key ID**（格式：`XXXXXXXXXX`，10 位字母+数字）
   - **Issuer ID**（格式：`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`，UUID 格式）

**在 RevenueCat 填入密钥：**

1. 进入 RevenueCat 控制台 → 左侧 **Apps**
2. 点击你的 iOS 应用
3. 找到 **App Store Connect API Key** 部分，点击 **Connect（连接）**
4. 填写：
   - **Issuer ID**：粘贴刚记录的 Issuer ID
   - **Key ID**：粘贴 Key ID
   - **Private Key**：粘贴 `.p8` 文件的完整内容（用文本编辑器打开复制）
5. 点击 **Save**

### 5.2 创建权益（Entitlement）

权益（Entitlement）是 RevenueCat 的核心概念：它代表用户"应该能访问什么功能"，与具体产品解耦。

1. 左侧菜单点击 **Entitlements（权益）**
2. 点击 **+ New（新建）**
3. **Identifier（标识符）**：填写 `pro`（代码中用这个 ID 检查是否订阅）
4. **Description（说明）**：`解锁所有高级功能`
5. 点击 **Add**

### 5.3 创建产品并关联权益

1. 左侧菜单点击 **Products（产品）**
2. 点击 **+ New（新建）**，创建第一个产品：
   - **Product Identifier**：`com.onern.starter.monthly_pro`（与 App Store 完全一致）
   - **App**：选择你的 iOS 应用
   - 点击 **Add**
3. 重复以上步骤，添加：
   - `com.onern.starter.annual_pro`
   - `com.onern.starter.lifetime_pro`
4. 创建完成后，点击 **Entitlements（权益）→ pro**，点击 **Attach**（附加产品）：
   - 将三个产品全部附加到 `pro` 权益
   - 点击 **Save**

### 5.4 创建套餐（Offering）

套餐（Offering）决定在 Paywall 里展示哪些产品，以及以什么顺序展示。

1. 左侧菜单点击 **Offerings（套餐）**
2. 点击 **+ New（新建）**：
   - **Identifier**：`default`（必须用这个名字，代码里默认读取 `default`）
   - **Description**：`默认套餐`
   - 点击 **Add**
3. 进入刚创建的 `default` 套餐，点击 **+ Add package（添加包）**：

   **添加月订阅包：**
   - **Identifier**：选择 `$rc_monthly`（RevenueCat 内置标识符，推荐使用）
   - **Product**：选择 `com.onern.starter.monthly_pro`（iOS 产品）
   - 点击 **Add**

   **添加年订阅包：**
   - **Identifier**：选择 `$rc_annual`
   - **Product**：选择 `com.onern.starter.annual_pro`
   - 点击 **Add**

   **添加终身授权包：**
   - **Identifier**：选择 `$rc_lifetime`
   - **Product**：选择 `com.onern.starter.lifetime_pro`
   - 点击 **Add**

4. 点击 **Save**

---

## 6. 获取 API Key，填入项目

### 6.1 获取 RevenueCat API Key

1. 进入 RevenueCat 控制台 → 左侧 **Apps**
2. 点击你的 iOS 应用
3. 找到 **API keys** 部分
4. 复制 **Public SDK key**（格式：`appl_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`）

> RevenueCat 区分"Public SDK key"（客户端用）和"Secret key"（服务端用），这里复制 **Public** 那个。

### 6.2 填入 .env 文件

用文本编辑器打开项目根目录的 `.env` 文件，填入以下内容：

```
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=appl_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

> Android API Key 格式以 `goog_` 开头，第 7 节会介绍如何获取。暂不配置 Android 时，留空即可，内购会自动关闭（不崩溃）。

---

## 7. （可选）Google Play 配置 Android 产品

> 如果目前只需要 iOS 内购，可以跳过本节，待需要时再配置。

### 7.1 在 Google Play Console 创建产品

1. 打开 [play.google.com/console](https://play.google.com/console)
2. 选择你的应用 → 左侧菜单 **Monetize（收益化）→ Subscriptions（订阅）**
3. 点击 **Create subscription（创建订阅）**
4. 创建三个产品（与 iOS 相同的 Product ID）：
   - `monthly_pro`
   - `annual_pro`
5. 对于终身授权，进入 **In-app products（应用内商品）→ Managed products** 创建：
   - `lifetime_pro`

> **注意：** Google Play 的 Product ID 不需要带 Bundle ID 前缀，直接用 `monthly_pro` 即可（RevenueCat 会自动处理）。

### 7.2 在 RevenueCat 添加 Android 应用

1. 回到 RevenueCat → **Apps → + Add app**
2. 选择 **Google Play**
3. 填写 **Package name（包名）**：与 iOS Bundle ID 相同，例如 `com.onern.starter`
4. 配置 **Google Play Service Credentials**（参考 RevenueCat 官方文档的 Google Play 配置向导）
5. 复制 Android 的 Public SDK key（格式：`goog_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`）

### 7.3 填入 .env

```
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=goog_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 8. 重新构建应用

配置好 `.env` 后，需要重新构建原生包才能生效。

### 8.1 安装 SDK（开发者操作）

> 此步骤由开发者在代码层面完成，非技术用户只需确认以下命令已执行。

```bash
cd one-rn-starter2
npm install react-native-purchases
```

> **注意：** `react-native-purchases` 包含原生代码，不需要额外的 Expo Config Plugin，但需要重新构建 dev build。

### 8.2 重新构建

**iOS（Mac 上执行）：**

```bash
npx expo run:ios
```

**Android：**

```bash
npx expo run:android
```

构建完成后，应用会自动打开到模拟器。

---

## 9. 沙盒测试

内购必须使用"沙盒账号"测试，真实账号无法完成测试流程（会产生真实费用）。

### 9.1 创建 iOS 沙盒测试账号

1. 打开 [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. 顶部菜单点击 **Users and Access（用户与访问权限）**
3. 左侧点击 **Sandbox Testers（沙盒测试员）**
4. 点击 **+** 新建测试员：
   - **First Name / Last Name**：随便填
   - **Email**：填一个你能收到邮件的地址（格式：`onern+sandbox@gmail.com` 可以用 Gmail 的 + 技巧创建多个测试账号）
   - **Password**：设置一个密码（至少 8 位，含大小写+数字）
   - **Country / Region**：选择中国大陆
5. 点击 **Invite**，然后到邮箱点击验证链接激活账号

### 9.2 在真机上用沙盒账号测试

1. 确保使用的是**真实 iPhone**（模拟器无法完成内购流程）
2. 打开设备 **Settings（设置）→ App Store**
3. 滚动到底部，找到 **Sandbox Account（沙盒账户）**
4. 点击 **Sign In（登录）**，输入沙盒测试员的邮箱和密码

> **重要：** 沙盒账号只能在 Sandbox Account 入口登录，不是在普通的 Apple ID 登录页。用沙盒账号购买时，会显示 **\[Environment: Sandbox\]** 水印，确认沙盒模式后完成购买。

### 9.3 触发沙盒购买

1. 打开应用，登录你的普通账号
2. 进入 **设置页 → 升级 Pro** 或触发任意带 EntitlementGate 的功能
3. Paywall 页面应弹出，展示三款产品
4. 点击任意产品，弹出 Apple 购买确认弹窗（显示 Sandbox 水印）
5. 点击 **Buy（购买）**，输入沙盒账号密码确认
6. 购买成功后，`isPro` 应立即变为 `true`，Paywall 关闭，权益解锁

### 9.4 在 RevenueCat 后台验证

1. 进入 RevenueCat 控制台 → 左侧 **Customers（用户）**
2. 搜索你的用户 ID（Supabase userId）
3. 应能看到该用户的购买记录和激活的 `pro` 权益

### 9.5 沙盒订阅的特殊行为

| 真实订阅 | 沙盒订阅 |
|---------|---------|
| 月订阅 = 30 天 | 月订阅 ≈ **5 分钟** |
| 年订阅 = 365 天 | 年订阅 ≈ **30 分钟** |
| 自动续费 3 次后停止 | 无此限制 |

沙盒环境下订阅续费非常快，方便测试过期和续费逻辑。

---

## 10. 常见问题排查

### 产品无法显示在 Paywall 中

**可能原因：**
- `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS` 未正确填写或未重新构建
- App Store Connect 产品状态为 **Missing Metadata**（缺少本地化描述）
- RevenueCat 中产品 ID 与 App Store 的 Product ID 拼写不一致
- RevenueCat Offering 中的包未保存

**排查步骤：**
1. 检查 `.env` 中的 API Key 是否以 `appl_` 开头
2. 确认已重新运行 `npx expo run:ios`（修改 `.env` 后必须重建）
3. 在 RevenueCat 后台 → **Offerings** → 点击 `default`，确认三个 Package 都已显示
4. 对比 App Store Connect 和 RevenueCat 中的产品 ID，确保完全一致

---

### 购买时提示"产品无效"

**可能原因：**
- 沙盒账号未正确登录（在设备 Settings → App Store → Sandbox Account 登录）
- 使用模拟器测试（内购必须在真机上测试）
- App 的 Bundle ID 与 App Store Connect 中的不一致

---

### 购买成功但 `isPro` 没有更新

**可能原因：**
- TanStack Query 缓存未刷新

**解决方法：**
1. `usePurchase` mutation 的 `onSuccess` 回调中应调用 `queryClient.invalidateQueries({ queryKey: ['entitlements'] })`
2. 若仍不更新，可在 Paywall 页面关闭时强制 refetch

---

### "恢复购买"后没有恢复权益

**可能原因：**
- 沙盒账号与购买时的账号不同
- 真机未登录同一 Apple ID

**排查：**
1. 确认设备 Settings → App Store → Sandbox Account 使用的是购买时的沙盒账号
2. 在 RevenueCat 后台 → Customers 确认购买记录存在

---

### Android 内购无法正常工作

**注意事项：**
- Google Play 内购测试需要将 APK/AAB 上传到至少 **Internal Testing（内部测试）** 轨道
- 测试账号需要在 Google Play Console → **Setup → License testing** 中加入白名单
- 本地 `debug` 包无法触发 Google Play 内购弹窗

---

## 附录：本轮新增文件速查

| 文件 | 作用 |
|------|------|
| `src/features/subscription/model/subscription-store.ts` | Paywall 展示时间戳（防止频繁弹出） |
| `src/features/subscription/lib/usePurchaseInit.ts` | RevenueCat SDK 初始化 + 用户同步 |
| `src/features/subscription/lib/useEntitlement.ts` | `isPro` 权益检查 Hook |
| `src/features/subscription/lib/useOfferings.ts` | 读取套餐产品列表 |
| `src/features/subscription/lib/usePurchase.ts` | 购买 mutation |
| `src/features/subscription/lib/useRestorePurchases.ts` | 恢复购买 mutation |
| `src/features/subscription/lib/paywallGuard.ts` | 7 天冷却时间判断 |
| `src/features/subscription/ui/PaywallScreen.tsx` | 付费墙页面（Modal） |
| `src/features/subscription/ui/ProductCard.tsx` | 单个产品卡片组件 |
| `src/features/subscription/ui/EntitlementGate.tsx` | 权益门控包装组件 |
| `src/providers/PurchaseProvider.tsx` | Provider：SDK 初始化 + 用户登录同步 |
| `src/app/paywall.tsx` | Paywall 路由入口（`/paywall`） |

**环境变量：**

| 变量名 | 说明 |
|--------|------|
| `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS` | RevenueCat iOS Public SDK Key（`appl_` 开头）|
| `EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID` | RevenueCat Android Public SDK Key（`goog_` 开头，可选）|
