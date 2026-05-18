# 推送通知配置指南

> 本指南手把手教你为 OneRN Starter 配置基于 OneSignal 的推送通知。不需要编程知识，按步骤操作即可。

---

## 目录

1. [概述](#1-概述)
2. [注册 OneSignal 账号](#2-注册-onesignal-账号)
3. [在 OneSignal 中创建应用](#3-在-onesignal-中创建应用)
4. [配置 iOS 推送（APNs）](#4-配置-ios-推送apns)
5. [获取 OneSignal App ID](#5-获取-onesignal-app-id)
6. [将 App ID 填入项目](#6-将-app-id-填入项目)
7. [Supabase 设备表配置](#7-supabase-设备表配置)
8. [重新构建应用](#8-重新构建应用)
9. [发送测试推送](#9-发送测试推送)
10. [常见问题排查](#10-常见问题排查)

---

## 1. 概述

我们的推送通知系统由两个服务协同工作：

- **OneSignal** — 免费的推送通知服务，负责将消息投递到用户设备。它管理设备令牌、消息投递、数据分析和用户分群。
- **Expo Notifications** — 负责设备端的本地通知（提醒）、权限请求和前台通知展示。

**开始之前，你需要准备：**

- 一个 [Apple Developer 账号](https://developer.apple.com)（用于 iOS 推送，年费 $99）
- 一部 iPhone 真机（推送通知在模拟器上不工作）

> Android 推送（Firebase Cloud Messaging）的配置将在后续补充，本文档先聚焦 iOS。

---

## 2. 注册 OneSignal 账号

### 第一步：打开注册页面

1. 在浏览器中打开 [onesignal.com](https://onesignal.com)
2. 点击页面右上角的 **Sign Up Free**（免费注册）按钮

### 第二步：选择注册方式

你可以使用以下任一方式注册：
- **Google 账号** — 点击 "Continue with Google"，最快捷
- **GitHub 账号** — 点击 "Continue with GitHub"
- **邮箱注册** — 输入邮箱和密码，然后去邮箱点击验证链接

### 第三步：完成注册

注册成功后，你会进入 OneSignal 的控制台（Dashboard）。这就是你管理推送通知的地方。

> OneSignal 的免费计划包含无限推送消息和最多 10,000 个订阅用户，对于大多数应用来说完全够用。

---

## 3. 在 OneSignal 中创建应用

### 第一步：新建应用

1. 在 OneSignal 控制台首页，点击 **New App/Website** 按钮
2. 在弹出的对话框中，输入你的应用名称，例如 `OneRN Starter`

### 第二步：选择平台

1. 在平台选择页面，选择 **Apple iOS (APNs)**
2. 点击 **Next: Configure Your Platform**（下一步：配置平台）

> 先不要急着填写配置信息，我们需要先去 Apple Developer 那边获取推送密钥。跳到下一节继续。

---

## 4. 配置 iOS 推送（APNs）

iOS 推送通知需要一个 **APNs 认证密钥**（.p8 文件），这个密钥从 Apple Developer 控制台获取。这是一次性操作，一个密钥可以用于你所有的 iOS 应用。

### 4.1 登录 Apple Developer 控制台

1. 在浏览器中打开 [developer.apple.com](https://developer.apple.com)
2. 点击右上角的 **Account**（账户）
3. 使用你的 Apple ID 登录
4. 如果开启了双重认证，按提示完成验证

### 4.2 找到你的 Team ID

登录后我们先记下 Team ID，后面会用到：

1. 登录后你会看到开发者账户的主页
2. 点击左侧边栏的 **Membership details**（成员详情），或在页面上找到 **Membership** 区域
3. 找到 **Team ID** 字段 — 这是一个 **10 位字母数字组合**，例如 `AB12CD34EF`
4. **把这个 Team ID 记下来**（复制到备忘录或临时文件中）

### 4.3 进入"证书、标识符和描述文件"

1. 在开发者账户页面，点击左侧边栏的 **Certificates, Identifiers & Profiles**（证书、标识符和描述文件）
2. 你会进入一个新页面，左侧有多个菜单项

### 4.4 创建 APNs 密钥

1. 在左侧边栏中，点击 **Keys**（密钥）
2. 你会看到密钥列表页面（可能是空的）
3. 点击页面左上角的 **+** 按钮（或 "Create a key" 按钮）来创建新密钥

### 4.5 配置密钥

1. 在 **Key Name**（密钥名称）栏中输入一个名字，例如：`Push Notifications Key`
2. 在下方的复选框列表中，找到并勾选 **Apple Push Notifications service (APNs)**
   - 只需要勾选这一个选项，其他选项保持不勾选
3. 点击右上角的 **Continue**（继续）按钮

### 4.6 配置 APNs 环境

点击 Continue 后，页面会要求你进一步配置 APNs：

1. 点击 APNs 那一行右侧的 **Configure**（配置）按钮
2. 弹出的面板中，选择这个密钥适用的环境：
   - **Sandbox** — 对应 Xcode 直接安装 / `expo run:ios` 的开发版本
   - **Sandbox & Production** — 同时支持开发和 TestFlight / App Store 生产版本（**推荐选这个**）
3. 选好后点击 **Done**（完成），面板关闭
4. 确认 APNs 行显示为勾选状态，然后点击右上角的 **Continue**（继续）

### 4.7 确认并注册密钥

1. 系统会显示配置摘要，确认 **APNs** 已列出
2. 点击右上角的 **Register**（注册）按钮

### 4.8 下载密钥文件（非常重要！）

注册成功后，你会看到密钥的详情页面：

1. 页面上会显示你的 **Key ID** — 这是一个 **10 位字符串**，例如 `ABC1234DEF`
2. **把这个 Key ID 记下来**（复制到备忘录中）
3. 点击 **Download**（下载）按钮
4. 浏览器会下载一个文件，文件名类似 `AuthKey_ABC1234DEF.p8`
5. **把这个 .p8 文件保存到安全的地方**

> **特别提醒：这个 .p8 文件只能下载一次！** 如果你不小心丢失了，就需要删除这个密钥并重新创建一个新的。建议下载后立即备份到云盘或密码管理器中。

### 4.9 确认你已经记下了这三个信息

在继续之前，确认你手上有以下三样东西：

| 信息 | 示例 | 在哪里找到的 |
|------|------|------------|
| **Team ID** | `AB12CD34EF` | 步骤 4.2 — Membership details 页面 |
| **Key ID** | `ABC1234DEF` | 步骤 4.8 — 下载页面显示的 Key ID |
| **.p8 密钥文件** | `AuthKey_ABC1234DEF.p8` | 步骤 4.8 — 点击 Download 下载的文件 |

如果缺少任何一个，请回到对应步骤获取。

### 4.10 在 OneSignal 中上传密钥

现在回到 OneSignal 控制台，把刚才获取的信息填进去：

1. 打开 OneSignal 控制台（如果你关闭了页面，请重新登录 [onesignal.com](https://onesignal.com)）
2. 进入你的应用 > **Settings**（设置） > **Platforms**（平台） > **Apple iOS**
3. 如果是首次配置，你应该还在创建应用的流程中；如果不是，点击 Apple iOS 旁边的 **Configure**（配置）按钮

### 4.11 填写 APNs 配置（在 OneSignal 中）

在配置页面中：

1. **选择认证方式**：选择 **.p8 Authentication Token (Recommended)**
   - 不要选 .p12 Certificate，那是旧的方式
2. **上传 .p8 文件**：
   - 点击 "Upload" 或拖拽区域
   - 选择你在步骤 4.8 下载的 `.p8` 文件
   - 上传成功后会显示文件名
3. **Key ID**：
   - 输入你在步骤 4.8 记下的 Key ID
   - 例如 `ABC1234DEF`
4. **Team ID**：
   - 输入你在步骤 4.2 记下的 Team ID
   - 例如 `AB12CD34EF`
5. **Bundle ID**：
   - 输入你的应用 Bundle ID
   - 开发环境填：`com.onern.starter.dev`
   - 生产环境填：`com.onern.starter`
   - 如果不确定，先填开发环境的
6. 点击 **Save & Continue**（保存并继续）

### 4.12 验证配置成功

保存后，OneSignal 会验证你的配置。如果一切正确：
- 你会看到 Apple iOS 平台显示为绿色的 **Configured**（已配置）状态
- 如果显示错误，请检查 Key ID、Team ID 和 Bundle ID 是否填写正确

> 恭喜！iOS 推送配置完成。步骤 4.6 中选择了 **Sandbox & Production**，这个 .p8 密钥可以同时用于开发和生产环境，不需要分别配置。

---

## 5. 获取 OneSignal App ID

1. 在 OneSignal 控制台中，进入你的应用
2. 点击左侧边栏的 **Settings**（设置）
3. 点击 **Keys & IDs**（密钥和 ID）
4. 找到 **OneSignal App ID** — 它是一个类似这样的字符串：

```
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

5. 点击旁边的复制按钮，或手动选中并复制这个 ID

> 这是你唯一需要放到项目代码中的值。APNs 密钥和 FCM 密钥都保存在 OneSignal 控制台中，不需要放到代码里。

---

## 6. 将 App ID 填入项目

### 第一步：找到 .env 文件

在项目根目录下找到 `.env` 文件。如果没有这个文件，按以下步骤创建：

1. 找到项目根目录下的 `.env.example` 文件
2. 复制一份，重命名为 `.env`
3. 打开 `.env` 文件进行编辑

### 第二步：添加 OneSignal App ID

在 `.env` 文件中，找到以下这行（或者添加这行）：

```
EXPO_PUBLIC_ONESIGNAL_APP_ID=your-onesignal-app-id-here
```

把 `your-onesignal-app-id-here` 替换成你在第 5 步复制的 App ID。

**示例：**
```
EXPO_PUBLIC_ONESIGNAL_APP_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### 第三步：保存文件

保存 `.env` 文件。

> 注意：`.env` 文件包含敏感信息，不应该提交到 Git 仓库。项目的 `.gitignore` 已经配置为忽略 `.env` 文件。

---

## 7. Supabase 设备表配置

应用会将每台已注册的设备信息存储在 Supabase 数据库中，让用户可以在"设备管理"页面查看所有设备并对每台设备单独控制推送开关。

**你需要有一个已配置好的 Supabase 项目**（见项目根目录的 `.env` 中的 `EXPO_PUBLIC_SUPABASE_URL`）。

### 7.1 打开 Supabase SQL 编辑器

1. 登录 [supabase.com](https://supabase.com)，进入你的项目
2. 点击左侧边栏的 **SQL Editor**（SQL 编辑器）
3. 点击 **New query**（新建查询）

### 7.2 创建设备表

将以下 SQL 复制粘贴到编辑器中，然后点击 **Run**（执行）：

```sql
-- 设备注册表：记录每台已安装应用的设备信息
CREATE TABLE IF NOT EXISTS public.notification_devices (
  id TEXT PRIMARY KEY,                        -- 设备唯一 ID（客户端生成，持久化）
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  device_name TEXT,                           -- 设备名称，例如 "张三的 iPhone"
  app_version TEXT,                           -- 应用版本号
  onesignal_player_id TEXT,                   -- OneSignal Player ID（用于定向推送）
  is_current_device BOOLEAN NOT NULL DEFAULT false,
  is_push_enabled BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 索引：加速按用户查询
CREATE INDEX IF NOT EXISTS idx_notification_devices_user_id
  ON public.notification_devices(user_id);

CREATE INDEX IF NOT EXISTS idx_notification_devices_user_status
  ON public.notification_devices(user_id, status);

-- 唯一约束：同一用户不能重复注册同一个 OneSignal Player ID
CREATE UNIQUE INDEX IF NOT EXISTS uq_notification_devices_player_id
  ON public.notification_devices(user_id, onesignal_player_id)
  WHERE onesignal_player_id IS NOT NULL AND status = 'active';

-- 行级安全（RLS）：用户只能读写自己的设备记录
ALTER TABLE public.notification_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own notification devices"
  ON public.notification_devices FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
```

执行成功后，页面会显示 **Success. No rows returned**。

### 7.3 验证表已创建

1. 点击左侧边栏的 **Table Editor**（表编辑器）
2. 你应该能看到 `notification_devices` 表出现在列表中
3. 点击进入，确认所有列都已正确创建

### 7.4 设备表工作原理

配置完成后，设备表会自动运转：

| 时机 | 发生的事情 |
|------|-----------|
| 用户首次登录 | 自动在表中创建一条当前设备的记录 |
| 用户每次启动应用 | 更新 `last_seen_at`（最近活跃时间） |
| 用户关闭某设备推送 | `is_push_enabled` 更新为 `false` |
| 用户移除某设备 | `status` 更新为 `deleted`（软删除，保留记录） |
| 用户在新设备登录 | 新设备自动注册，旧设备保留 |

用户可以在应用的 **设置 → 设备管理** 页面查看所有设备并管理推送权限。

---

## 8. 重新构建应用

添加 OneSignal App ID 后，需要重新构建原生应用，因为推送通知需要修改原生代码。

### 第一步：清理并重新生成原生项目

打开终端（Terminal），进入项目文件夹，运行：

```bash
npx expo prebuild --clean
```

这个命令会重新生成 `ios/` 和 `android/` 目录，并把 OneSignal 的原生配置自动写入。

### 第二步：在真机上运行

```bash
# 连接 iPhone 真机，然后运行：
npx expo run:ios --device
```

终端会显示可用的设备列表，选择你的 iPhone。

> **重要提示：** 推送通知在 iOS 模拟器上不工作！你必须使用一部 **iPhone 真机** 来测试。

> 首次构建后，后续运行只需要 `npx expo run:ios` 即可，不需要每次都 prebuild。只有修改了原生配置（比如新增插件）才需要重新 prebuild。

---

## 9. 发送测试推送

### 第一步：确保设备已注册

1. 在真机上打开应用
2. 应用会弹出推送通知权限弹窗，点击 **允许**（Allow）
3. 进入设置页面，确认通知总开关是开启状态

### 第二步：在 OneSignal 控制台发送测试消息

1. 打开 OneSignal 控制台（[onesignal.com](https://onesignal.com)）
2. 进入你的应用
3. 点击左侧的 **Messages**（消息） > **Push**（推送）
4. 点击 **New Push**（新建推送）

### 第三步：编辑推送内容

1. **Audience**（受众）：选择 **Send to Subscribed Users**（发送给已订阅的用户）
2. **Title**（标题）：输入 `来自 OneRN 的问候！`
3. **Message**（消息内容）：输入 `推送通知已经配置成功！`

### 第四步（可选）：添加深链接数据

如果你想让用户点击通知后跳转到应用内的特定页面：

1. 向下滚动找到 **Additional Data**（附加数据）区域
2. 点击 **Add Data**
3. 输入：
   - Key（键）：`url`
   - Value（值）：`/(tabs)/explore`

这样用户点击通知后，应用会自动跳转到"探索"标签页。

### 第五步：发送

1. 点击 **Review and Send**（审核并发送）
2. 确认内容无误后，点击 **Send Message**（发送消息）
3. 几秒钟内，你的 iPhone 上应该就能收到这条推送通知

### 验证成功的标志

- 设备收到推送通知（锁屏状态会看到通知横幅）
- 如果应用在前台运行，顶部会出现通知条
- 如果添加了 `url` 数据，点击通知后会跳转到对应页面

---

## 10. 常见问题排查

### OneSignal 控制台看不到我的设备

- 确认你在应用弹出权限弹窗时点了"允许"
- 检查 `.env` 文件中 `EXPO_PUBLIC_ONESIGNAL_APP_ID` 是否填写正确
- 确认你在添加 App ID 后执行了 `npx expo prebuild --clean` 并重新安装了应用
- 查看终端日志，搜索 `[Notification]` 关键字确认初始化是否成功

### iOS 推送收不到

**检查 .p8 密钥：**
- 确认上传到 OneSignal 的是正确的 `.p8` 文件
- 确认 Key ID 和 Team ID 填写正确（注意不要搞混）
- 确认 Bundle ID 与应用的 Bundle ID 一致

**检查设备：**
- 必须在真机上测试，模拟器不支持推送
- 打开 iPhone 的 **设置** > 找到你的应用 > **通知** > 确认通知已开启

**检查环境：**
- 开发构建使用 `development` 环境
- TestFlight / App Store 使用 `production` 环境
- 在 `app.config.ts` 中确认 onesignal-expo-plugin 的 mode 设置正确

### 点击"允许通知"后提示权限被拒绝

iOS 系统只会弹出一次权限请求弹窗。如果你之前点了"不允许"：

1. 打开 iPhone 的 **设置**
2. 向下滚动找到你的应用（OneRN）
3. 点击进入
4. 点击 **通知**
5. 打开 **允许通知** 开关

之后回到应用，重新打开通知设置中的开关。

### 开发环境可以收到推送，但生产环境收不到

1. 在 OneSignal 控制台 > Settings > Platforms > Apple iOS
2. 确认你的 .p8 配置是正确的（.p8 密钥同时支持开发和生产环境）
3. 确认 Bundle ID 填写的是生产环境的 ID（`com.onern.starter`）
4. 检查 `app.config.ts` 中 `onesignal-expo-plugin` 的 `mode` 在生产环境为 `'production'`

### 应用启动时崩溃

- 如果没有配置 `EXPO_PUBLIC_ONESIGNAL_APP_ID`，应用不会崩溃，推送功能会静默禁用
- 如果配置了错误的 App ID，检查终端日志中的错误信息
- 尝试 `npx expo prebuild --clean` 后重新构建

---

## 快速参考表

| 信息 | 在哪里获取 |
|------|-----------|
| OneSignal App ID | OneSignal 控制台 > Settings > Keys & IDs |
| APNs 密钥文件（.p8） | Apple Developer 控制台 > Certificates, Identifiers & Profiles > Keys |
| APNs Key ID | Apple Developer 控制台 > Keys（下载页面显示的 10 位字符串） |
| Apple Team ID | Apple Developer 控制台 > Membership details |
| Bundle ID (iOS) | `app.config.ts` 文件中的 `ios.bundleIdentifier` |

---

## 配置完成后的功能

完成以上配置后，应用将自动具备以下功能：

1. **自动注册设备** — 应用启动时自动向 OneSignal 注册设备
2. **用户身份同步** — 用户登录后自动将用户 ID 同步到 OneSignal，支持定向推送
3. **前台通知展示** — 应用在前台时收到推送，顶部会显示通知横幅
4. **通知点击跳转** — 点击包含 `url` 数据的通知，自动跳转到对应页面
5. **精细控制** — 设置页中可独立控制系统通知、营销通知和每日提醒

你可以通过以下方式发送推送：
- **OneSignal 控制台** — 手动测试和营销活动
- **OneSignal REST API** — 从你的服务器发送自动化/事务性通知
- **OneSignal 用户分群** — 基于标签（Tags）向特定用户群发送
