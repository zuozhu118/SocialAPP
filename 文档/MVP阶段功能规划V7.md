# 真实交友 App · MVP 功能规划文档 V7

> **文档性质**：现状实现版（Implementation-Accurate），由已完成代码反向校准。
> **独立完整**：本文档自包含，不依赖 V6 或任何历史讨论，可单独交付给任何人 / 任何 AI 阅读。
> **适用场景**：页面优化、UI 走查、功能测试、后端接口开发、交接新人。
> **统计口径**：截至本文档生成时，前端代码已实现 **34 个页面**、**11 个 Pinia store**、**11 个 mock 模块**，累计 **387 项自动化断言全部通过**，构建零报错。

---

## 目录

| 章 | 标题 | 你会得到什么 |
|---|---|---|
| 0 | 如何使用本文档 | 阅读路线、术语表 |
| 1 | 产品定位与核心策略 | 产品是什么、三条策略、**不做什么** |
| 2 | 技术架构与工程约定 | 技术栈、目录、Pinia 规范、**mock 替换点**、已知技术坑 |
| 3 | 权限体系与页面地图 | 三级权限推导、**功能×权限矩阵**、34 个页面清单 |
| 4 | 全局设计规范 | 视觉变量、弹窗规范、安全徽章、**统一文案库全文** |
| 5 | 功能模块详述 | M2–M9 八个模块的**硬规则 + 交互 + 边界** |
| 6 | 数据契约总表 | 9 类数据结构 + **后端接口清单** |
| 7 | 核心状态机 | 微信申请 / 认证 / 举报 / 账号 / 城市 五个状态机 |
| 8 | 调试与测试 | 调试面板、本地运行、造数据方法、回归清单 |
| 9 | 范围外、占位与遗留 | 明确不做、占位页、10 条技术债、后续路线 |
| 附录 | A 新会话提示词 · B 文件索引 · C 常量速查 | 直接可复制的接手工具 |

---

## 第 0 章 如何使用本文档

### 0.1 如果你是新接手这个项目的 AI / 开发者

按以下顺序读，就能在不看代码的情况下理解全局：

| 步骤 | 阅读章节 | 你会得到 |
|---|---|---|
| 1 | 第 1 章 | 产品是什么、不做什么、核心策略是什么 |
| 2 | 第 2 章 | 技术栈、目录结构、状态管理规范、**后端要替换的唯一入口** |
| 3 | 第 3 章 | 三级权限怎么推导、34 个页面分别是什么、谁能进 |
| 4 | 第 4 章 | 视觉与文案的统一规范（改 UI 必读） |
| 5 | 第 5 章 | 每个功能模块的业务规则（精确到可写单测的程度） |
| 6 | 第 6 章 | 数据结构契约与建议的后端接口清单 |
| 7 | 第 7 章 | 五个核心状态机的流转图 |
| 8 | 第 8 章 | 怎么跑起来、怎么造数据、怎么验证 |
| 9 | 第 9 章 | 哪些明确没做、哪些是占位、哪些是技术债 |

**如果你只做一件事**：读 **第 2.5 节（mock 层契约）** + **第 6 章（数据契约）**，就能开始写后端接口。

### 0.2 阅读约定

- 本文所有"规则"均为**代码已实现的规则**，不是设想。凡是"未实现 / 占位 / 范围外"会明确标注。
- 所有时间类规则统一用 **毫秒时间戳** 存储，渲染层再转文案。
- 所有「必须」「禁止」为硬性约束，改动前需要确认是否有下游依赖。
- `✅ 已实现` / `⚠️ 占位` / `❌ 未实现` 三种标记贯穿全文。

### 0.3 术语表

| 术语 | 含义 |
|---|---|
| 游客 / guest | 未登录用户 |
| 注册未实名 / registered | 已授权手机号登录，但未完成实名认证 |
| 已实名 / certified | 完成实名认证，是唯一能使用核心功能的层级 |
| 心动 | 对某位用户表达喜欢（每日有额度，可消耗永久次数） |
| 双向匹配 | A 对 B 心动 且 B 对 A 心动，形成的匹配关系 |
| 微信交换申请 | 双向匹配后，一方申请获取对方微信号，对方需同意 |
| 永久心动次数 | 不受每日额度限制的资产型次数，用完当日额度后自动消耗 |
| 冷启动兜底 | 同城动态不足 5 条时，自动补入跨城优质内容 |
| 降权 | 风控分低于阈值后，账号不再被推荐给女性用户 |
| 生效城市 | 用户手动填写的常住城市；切换后有 24 小时冷却期，冷却期内仍按旧城市计算 |

---

## 第 1 章 产品定位与核心策略

### 1.1 一句话定位

**面向 22–35 岁城市单身人群的「真实可信 + 克制稀缺」型同城异性交友产品**。

不追求"多聊快聊"，而是用**认证门槛、每日额度、无站内聊天**三重设计，把用户从"广撒网"逼向"认真看一个人"。

### 1.2 目标用户与典型场景

| 维度 | 描述 |
|---|---|
| 年龄 | 22–35 岁 |
| 地域 | 一、二线城市，以同城区县为主要活动半径 |
| 动机 | 认真恋爱 / 奔结婚为主，排斥快餐式社交 |
| 痛点 | ① 照骗与虚假资料泛滥 ② 骚扰与诈骗频发 ③ 匹配太多反而无感 |
| 使用节奏 | 每天 2–3 次短时打开（通勤、午休、睡前），单次 3–8 分钟 |

**典型路径**：打开 → 匹配页刷 3–5 张卡片 → 对 1 张心动 → 等对方心动形成双向 → 申请交换微信 → 转到微信继续。

### 1.3 三条核心策略（所有功能都为这三条服务）

#### 策略一：真实可信（Trust）

- 三级权限阶梯：**游客 → 注册 → 已实名**，越往内解锁越多。
- 实名认证是核心功能的**唯一入口**（心动、评论、发动态、交换微信都要求已实名）。
- 学历 / 工作认证为**加分项**，点亮徽章可获得永久心动奖励，并成为"仅接受双认证"的筛选条件。
- 平台不做任何"匿名社交"，所有展示资料都带认证标识。

#### 策略二：克制稀缺（Scarcity）

- **每日浏览额度 10 次**（所有实名用户一致），0 点重置。
- **每日心动额度：男性 3 次 / 女性 5 次**（女性更高，降低女性被骚扰成本）。
- 当日额度耗尽后，才允许消耗**永久心动次数**。
- **没有任何站内聊天**——不提供消息、不提供招呼、不提供"一来一回"。想继续只能交换微信。
- 微信申请有 **3 天有效期**、**7 天冷却期**（同一对象）、**24 小时未处理自动拒绝**（接收方保护）。

#### 策略三：安全兜底（Safety）

- 全站 **反诈三重告知**（注册时 / 申请时 / 交换成功时）。
- 全页统一 **安全徽章**「🛡️ 实名核验 · 反诈保障」。
- **7 类举报** + **分级审核时效**（AI 初审 5 分钟 / 普通 24h / 女性骚扰类 12h 并置顶）。
- **梯度处罚**：下架内容 → 禁发 7 天 → 限制匹配 → 永久封禁。
- **发言全域导流拦截**：手机号、微信号、QQ、邮箱、链接、二维码话术，命中即拦截，不落库。
- **黑名单**双向屏蔽、无通知。
- **女性保护优先**：女性骚扰类举报 12h 时效 + 列表置顶；微信申请默认 24h 自动拒绝；女性用户不接收动态互动推送。

### 1.4 明确的产品边界（不做什么）

以下为**产品级决策**，不是"还没做"，而是**不该做**：

| 不做 | 原因 |
|---|---|
| 站内聊天 / 私信 / 招呼对话 | 与"克制、真实、快速转微信"的策略冲突；也避免平台承担内容审核重责 |
| 一键搭讪 / 群发心动 | 破坏稀缺性，且是骚扰源头 |
| 刷脸/颜值打分推荐 | 与"真实契合"定位冲突，且易引发投诉 |
| 匿名/马甲账号 | 与实名策略冲突 |
| 现金奖励拉新 | 合规风险 + 吸引薅羊毛用户，只奖励永久心动次数 |
| 付费会员 / 增值付费 | MVP 阶段不做任何付费功能 |
| 直播 / 短视频 / 语音房 | 超出 MVP 范围 |

---

## 第 2 章 技术架构与工程约定

### 2.1 技术栈

| 层 | 选型 | 说明 |
|---|---|---|
| 框架 | **uni-app 3.0**（`@dcloudio/uni-app` 3.0.0-5000720260410001） | 一套代码编译 H5 + 微信小程序 |
| 视图 | **Vue 3.4**（Composition API + `<script setup>`） | 全部页面使用 setup 语法 |
| 构建 | **Vite 5.2.8** | `npm run dev:h5` / `npm run build:h5` |
| 状态 | **Pinia 2.1.7** | Options 风格（`state` / `getters` / `actions`） |
| 样式 | **Sass 1.101** | 设计变量集中在 `src/styles/variables.scss` |
| 目标平台 | **H5**（主）、**mp-weixin**（副） | appid: `wx9acf0f24029c401d` |
| 应用名 | 真实交友（manifest `name`） | `versionName: 1.0.0` |

**当前状态**：无后端、无网络请求、无登录 SDK。所有数据来自本地 mock + 本地存储。

### 2.2 目录结构

```
SocialAPP/
├── src/
│   ├── pages.json              # 34 个页面 + 4 个 tabBar（唯一路由注册点）
│   ├── manifest.json           # 应用配置（H5 / 小程序 appid）
│   ├── App.vue                 # 全局启动：store 恢复、网络监听、全局错误、onShow 巡检
│   ├── main.js                 # createSSRApp + Pinia 挂载
│   ├── uni.scss                 # 全局 Sass 入口（@import styles/*）
│   │
│   ├── pages/                  # 34 个页面
│   │   ├── match/index.vue     # tab1 匹配
│   │   ├── square/index.vue    # tab2 广场
│   │   ├── notifications/index.vue  # tab3 通知
│   │   ├── profile/index.vue   # tab4 我的
│   │   ├── auth/               # login / realname / education / work
│   │   ├── dynamic/            # detail / publish
│   │   ├── common/             # antiFraud / report / landing / myReports / feedback
│   │   ├── profile/            # settings / privacy / equity / blacklist / account / edit / myProfile
│   │   ├── user/               # profile / medalDetail / medalWall / likeList / visitorList / favoriteList
│   │   ├── match/              # apply / myApply
│   │   ├── invite/index.vue    # 邀请好友
│   │   └── test/               # debug / script / values
│   │
│   ├── store/                  # 11 个 Pinia store（见 2.4）
│   ├── mock/                   # 11 个 mock 模块（见 2.5）★ 后端唯一替换点
│   ├── components/
│   │   ├── common/             # 14 个公共组件
│   │   └── match/              # MatchSuccessOverlay.vue（匹配成功全屏动效）
│   ├── composables/
│   │   └── usePermission.js    # 三级权限门禁（见 3.1）
│   ├── styles/                 # variables / mixins / common / icons / reset / index
│   └── static/                 # 图片、tabbar 图标
│
├── dist/                       # 构建产物（build:h5 → dist/build/h5）
└── package.json
```

### 2.3 状态管理规范（Pinia）

#### 2.3.1 store 清单与职责

| store | 持久化键 | 职责 | 关键常量 |
|---|---|---|---|
| `user` | `user_state_v2` | 登录态、三级权限、资料、收藏、认证记录、城市切换 | `CERT_REWARD_LIKES = 5` |
| `equity` | `equity_v2` | 浏览/心动额度、永久次数、曝光卡、权益流水 | `DAILY_BROWSE_TOTAL=10`、`DAILY_LIKE_MALE=3`、`DAILY_LIKE_FEMALE=5`、`COMPLETENESS_BONUS=3`、`COMPLETENESS_THRESHOLD=80`、`QUALITY_WEEKLY_LIMIT=2` |
| `match` | `match_state_v1` | 双向匹配关系、微信交换申请、微信号 | `APPLY_VALID_DAYS=3`、`APPLY_COOLDOWN=7天`、`MESSAGE_MAX_LEN=20` |
| `square` | `square_v1` | 动态列表、点赞、评论、跨城兜底、拉黑过滤 | `QUALITY_REWARD_LIKES=3` |
| `social` | `social_v1` | 缘分足迹（今日来访）、我喜欢/喜欢我列表 | — |
| `notify` | `notify_v1` | 通知列表、未读数、tabBar 角标、额度提醒去重 | `QUOTA_REMIND_HOURS=[9,20]` |
| `invite` | `invite_v1` | 邀请码、邀请记录、双向奖励结算 | `INVITE_REWARD_LIKES=5` |
| `privacy` | `privacy_v1` | 隐私开关、黑名单、申请拦截判定 | — |
| `risk` | `risk_v1` | 举报记录、处罚状态、风控分、注销进度 | `RISK_BASE=100`、`RISK_THRESHOLD=60` |
| `app` | 无 | ⚠️ 早期占位，当前无页面引用 | — |
| `auth` | 无 | ⚠️ 早期占位，已被 `user.authStatus` 取代 | — |

> **注意**：`app.js` 与 `auth.js` 是仓库初期的遗留 store，**当前无任何页面引用**（仅 `store/index.js` 做了统一导出）。新代码不要使用。若清理，可连同 `store/index.js` 中的两条 export 一起删除。

#### 2.3.2 必须遵守的 5 条 Pinia 约定

1. **getter 不能与 state 键同名**
   违反会抛 `TypeError: 'set' on proxy: trap returned falsish for property 'xxx'`，且会导致整个 store 的 `Object.assign` 持久化失败。
   *真实案例*：`privacy` store 初版 getter 名为 `autoRejectHours` 与 state 同名，导致隐私设置完全无法保存。现已改名为 `effectiveAutoRejectHours`。

2. **getter 内部调其它 getter 用 `this`，需要传参的 getter 返回函数**
   ```js
   // ✅ 正确
   hasLikeQuota() { return this.totalLikeAvailable > 0 },
   isBlocked: (state) => (userId) => state.blacklist.some(i => Number(i.id) === Number(userId))
   ```

3. **跨 store 调用 action 是合法的**，但**模块顶层 import 会形成循环依赖**
   - 安全做法：模块顶层 import 会被 Vite 处理，但**在 action 内部调用**才执行。
   - 目前所有跨 store 调用都在 action / getter 内部，如 `match.createMatch` 内调 `useNotifyStore().pushMatchSuccess()`。

4. **每个 store 自己管持久化**：`restore()` 读、`persist()` 写、`resetAll()` 重置。没有任何全局持久化插件。

5. **持久化数据结构固定为**
   ```json
   { "type": "object", "data": { ...store 字段... } }
   ```
   这是 uni-app `setStorageSync` 的包装格式。**写测试种子时必须遵守**，否则 `getStorageSync` 解析失败。

#### 2.3.3 本地存储键全景

| 键名 | 写入方 | 顶层字段 |
|---|---|---|
| `user_state_v2` | `store/user.js` | `userInfo, isLogin, authStatus, verifications, profile, favorites, certRewarded, cityChange` |
| `equity_v2` | `store/equity.js` | `day, browseUsed, browseBonus, pendingBonus, likeUsed, likeTotal, permanentLikes, exposureCards, records, bonusClaimedDay, qualityWeek, qualityCount` |
| `match_state_v1` | `store/match.js` | `seeded, myWechat, matches, applications, successShown` |
| `square_v1` | `store/square.js` | `seeded, city, dynamics, likedIds, blockedUserIds, firstOpenDay, comfortClosed` |
| `social_v1` | `store/social.js` | `seeded, city, myLikes, likesMe, todayViews, footprintDay, footprintClosed` |
| `notify_v1` | `store/notify.js` | `seeded, list, quotaPushed, seq` |
| `invite_v1` | `store/invite.js` | `seeded, code, invitedBy, inviteeRewarded, inviterRewarded, records, shareCount` |
| `privacy_v1` | `store/privacy.js` | `seeded, dynamicScope, allowWechatApply, autoRejectEnabled, autoRejectHours, onlyDoubleVerified, ageGap, showInRecommend, hideFields, blacklist` |
| `risk_v1` | `store/risk.js` | `seeded, reports, penalties, riskScore, riskEvents, deactivation` |

### 2.4 启动流程（App.vue）

理解这一段，就理解了"为什么刷新后数据还在"。

```
onLaunch
 ├─ useUserStore().restore()
 ├─ useEquityStore().init(userStore.gender)
 ├─ useMatchStore().restore()        → 内部 expireCheck()
 ├─ useSquareStore().restore()
 ├─ useSocialStore().restore()
 ├─ useNotifyStore().restore()
 ├─ useInviteStore().restore()
 ├─ usePrivacyStore().restore()
 ├─ useRiskStore().restore()
 ├─ uni.onNetworkStatusChange(...)   → 断网时 toast「网络有点慢，正在努力加载中...」
 └─ uni.onError(...)                 → 全局异常兜底 toast「出了点小状况，请稍后再试...」

onShow
 ├─ useMatchStore().autoRejectCheck()   → 微信申请 24h 超时巡检
 └─ useRiskStore().advanceReports()      → 举报审核时效推进
```

> **测试关键**：`onShow` 的两次巡检是"时间相关规则"能自然生效的原因。写端到端测试时，进入页面后要先触发一次 onShow（`goto` 即可）。

### 2.5 mock 层契约与后端替换点 ★★★

#### 2.5.1 设计原则

> **`src/mock/` 是前后端分离的唯一接缝。接入真实后端时，只改这一层，页面与 store 一行不动。**

具体做法：
- store **只** `import ... from '@/mock/xxx'`，从不直接写死数据。
- 页面 **只** 从 store 读，或从 `@/mock/copy`、`@/mock/filters` 读纯常量。
- `src/mock/index.js` 是统一再导出层。

#### 2.5.2 11 个 mock 模块与导出清单

| 文件 | 导出 | 用途 | 后端替换方式 |
|---|---|---|---|
| `users.js` | `users`（14 位种子用户）、`findUserById(id)`、`currentUserProfile`、`default users` | 用户池 + 当前登录用户 | `GET /users/recommend`、`GET /users/:id`、`GET /me` |
| `dynamics.js` | `dynamics`、`findDynamicById(id)`、`formatRelativeTime(ts)`、`locationOptions`、`CURRENT_CITY='北京市'`、`SAME_CITY_MIN=5` | 动态列表与相对时间 | `GET /dynamics`、`GET /dynamics/:id` |
| `copy.js` | `businessCopy`(18 条)、`emptyCopy`(5 条)、`getTimeSlotTitle(date)`、`matchSuccessTexts`(3 条)、`wechatSafetyCopy`、`antiFraudTips`(3 条) | **全站文案库**，前端常量，后端不下发 | 保持前端常量（如需运营可配置再改接口） |
| `filters.js` | `filterGroups`(7 组)、`defaultFilters`、`quickFilters`、`matchUserByFilters(user, filters)` | 匹配筛选项与筛选逻辑 | 筛选逻辑上移到后端，前端只传参 |
| `matches.js` | `commonTags()`、`matchSuccessTags()`、`buildFatePoint()`、`seedMatches()`、`seedApplications()`、`mockWechatMap`、`myMockWechat` | 匹配关系与申请种子 | `GET /matches`、`GET /applications` |
| `notifications.js` | `NOTIFY_META`(16 种)、`notifyMetaOf(kind)`、`QUOTA_REMIND_HOURS`、`formatNotifyTime(ts)`、`seedNotifications()`、`NOTIFY_TABS` | 通知类型元数据与种子 | `GET /notifications` |
| `social.js` | `seedMyLikes()`、`seedLikesMe()`、`seedTodayViews()`、`footprintEmptyText` | 缘分足迹种子 | `GET /social/footprint`、`GET /social/likes` |
| `invite.js` | `INVITE_REWARD_LIKES=5`、`codeOf(userId)`、`seedInviteRecords()`、`inviteRules`(5 条)、`inviteShareCopy(name)` | 邀请码生成与规则文案 | `GET /invite`、`POST /invite/bind` |
| `privacy.js` | `DYNAMIC_SCOPES`、`AGE_GAP_OPTIONS`、`HIDE_FIELDS`、`APPLY_BLOCK_COPY`、`defaultPrivacy()`、`seedBlacklist()`、`unblockCopy`、`mockTargetPolicy(user)` | 隐私选项元数据 + **对方隐私策略** | `GET /users/:id/privacy-policy` |
| `risk.js` | `AUDIT_SLA`、`REPORT_REASONS`(7 类)、`reasonOf()`、`PENALTIES`(4 级)、`penaltyOf()`、`REPORT_STATUS`、`seedReports()`、`APPEAL_REASONS`(4 条)、`DEACTIVATION_RULES`(5 条)、`deactivationCopy`、`RISK_EVENTS`(5 类)、`RISK_THRESHOLD=60`、`RISK_BASE=100` | 风控全量规则 | `POST /reports`、`GET /reports`、`POST /reports/:id/appeal` |
| `index.js` | 上述再导出 + `mockDelay(ms)`、`randomPick(list)`、`todayStr()` | 统一出口 + 工具函数 | 保留 |

#### 2.5.3 后端接入的三个必做动作

1. **给每个 store 的 `restore()` 换成异步拉取**
   现在 `restore()` 是同步读本地缓存。改法：加一个 `fetch()` action，`onLaunch` 时先 `fetch()` 再 `persist()` 缓存；`restore()` 保留作为离线兜底。
2. **`mockTargetPolicy(user)` 改为接口字段**
   当前"对方的隐私策略"是按性别硬编码（女性默认 `ageGap:5`，id 8/11 仅双认证）。后端应在用户资料里下发 `privacyPolicy: { allowWechatApply, onlyDoubleVerified, ageGap }`。
3. **时间类规则改为服务端裁决**
   3 天过期、7 天冷却、24h 自动拒绝、24h 城市生效——前端已有完整实现可直接复用，但**必须由服务端二次校验**，前端只是体验层。

### 2.6 编码约定与已知技术坑

以下每一条都是踩过的坑，新代码必须规避。

| # | 坑 | 正确做法 |
|---|---|---|
| 1 | `uni.setTabBarBadge` / `removeTabBarBadge` / `showActionSheet` / `showModal` **不传回调会返回 Promise** | 必须传 `{ success: () => {}, fail: () => {} }`，否则取消操作会产生未处理的 Promise 拒绝，在 H5 里表现为 `pageerror` |
| 2 | uni-app H5 把 `<button disabled>` 渲染成 `<uni-button disabled="true">` | DOM 断言用 `el.hasAttribute('disabled')`，不能用 `el.disabled` |
| 3 | 小程序不支持 `inset: 0` | 写 `top:0; right:0; bottom:0; left:0` |
| 4 | `CustomModal` 不支持 `v-model:visible` | 用 `:visible="x"` + `@confirm` / `@close` |
| 5 | Sass 里主色变量是 `$primary-color`，**没有** `$primary` | 引用前先看 `styles/variables.scss` |
| 6 | 条件编译语法 | `<!-- #ifdef MP-WEIXIN -->` / `<!-- #endif -->`；JS 中 `// #ifdef H5` |
| 7 | 本地 dev server 走系统代理会 502 | `curl --noproxy "*" http://[::1]:3300/`（vite 只绑 IPv6） |
| 8 | 长时任务（dev server）会被 shell 杀掉 | 必须用后台任务启动，不能管道到 `head` |
| 9 | `page.evaluate()` 里拿不到 Node 作用域变量 | 作为参数传入：`page.evaluate((now) => {...}, NOW)` |
| 10 | 上一个页面残留的 store 定时器会把种子覆写 | 造种子用「`about:blank` → `goto` → 写 localStorage → `reload` → 校验 → 不符重试 ≤4 次」 |

### 2.7 设计系统变量（改 UI 必读）

```scss
// 主色
$primary-color: #A8B89A;   // 鼠尾草绿 —— 主色（tabBar 选中色同此值）
$primary-dark:  #8AA07B;   // 深鼠尾草绿 —— 进阶认证
$primary-light-bg: #F2F5EF;
$primary-gradient: linear-gradient(135deg, #A8B89A, #8AA07B);

// 中性
$bg-page: #FAFAFA;  $bg-card: #FFFFFF;
$text-primary: #333;  $text-secondary: #666;  $text-helper: #999;
$border-light: #E5E5E5;  $disabled-bg: #F0F0F0;

// 功能色
$color-success: #8AA07B;   $color-warning: #BF8B8B;   $color-danger: #E06060;

// 字号 / 间距 / 圆角
$font-size-xl:20  $font-size-lg:18  $font-size-md:16  $font-size-sm:14  $font-size-xs:12  $font-size-btn:15
8px 栅格：4 / 8 / 16 / 24
$radius-card: 20px  $radius-btn: 16px  $radius-sm: 12px  $radius-xs: 8px
$btn-height: 44px   $page-padding-x: 12px
```

> **配色含义**：鼠尾草绿（低饱和绿）是主色，刻意避开交友产品常用的粉红/玫红，用来传递"克制、可信、不轻浮"。**不要随意引入高饱和红/粉**，会直接破坏产品气质。

---

## 第 3 章 权限体系与页面地图

### 3.1 三级权限的定义与推导

权限层级**不是独立字段**，而是由 `isLogin` 与 `authStatus.realName` **实时推导**，避免多处状态不一致。

```js
// store/user.js
level: (state) => {
    if (!state.isLogin) return 'guest'
    return state.authStatus.realName ? 'certified' : 'registered'
}
```

| 层级 | 内部值 | 判定条件 | 称呼 |
|---|---|---|---|
| 0 | `guest` | `isLogin === false` | 游客 |
| 1 | `registered` | `isLogin === true` 且 `authStatus.realName === false` | 注册未实名 |
| 2 | `certified` | `isLogin === true` 且 `authStatus.realName === true` | 已实名 |

### 3.2 功能 × 权限矩阵（`composables/usePermission.js` 为唯一事实来源）

`ACTION_RULES` 定义每个操作在各层级下的**拦截要求**：`guest: 'register'` 表示游客需先注册；`registered: 'realname'` 表示注册用户需先实名；未列出的层级直接放行。

| 操作 action | 游客 | 注册未实名 | 已实名 | 说明 |
|---|---|---|---|---|
| `browseDynamic` 浏览动态（第 6 条起） | 需注册 | ✅ | ✅ | 游客只能看前 5 条，第 5 条后渐隐 + 解锁卡 |
| `likeDynamic` 点赞动态 | 需注册 | ✅ | ✅ | — |
| `commentDynamic` 评论动态 | 需注册 | 需实名 | ✅ | — |
| `publishDynamic` 发布动态 | 需注册 | 需实名 | ✅ | 广场右下角悬浮按钮，未实名态为 `is-disabled` |
| `likeUser` 心动 | 需注册 | 需实名 | ✅ | 未实名只能"收藏心动"（沉没成本机制） |
| `applyWechat` 申请交换微信 | 需注册 | 需实名 | ✅ | 还需双向匹配 + 通过对方隐私策略 |
| `favoriteUser` 收藏心动 | 需注册 | ✅ | ✅ | — |
| `viewProfile` 查看他人完整资料 | 需注册 | ✅ | ✅ | 游客看到模糊 + 引导遮罩 |

**拦截弹窗**：`guard(action)` 返回 `{ allowed, modal }`，页面直接喂给 `PermissionModal`：

- `need === 'register'` → 标题「注册后即可解锁」/ 内容 `businessCopy.registerGuide` / 按钮「一键授权手机号注册」
- `need === 'realname'` → 标题「完成实名认证」/ 内容 `businessCopy.realNameGuide` / 按钮「去实名认证」

### 3.3 tabBar 与 34 个页面清单

**tabBar**（4 项，选中色 `#A8B89A`，未选中 `#999999`，白底）

| # | 路径 | 文案 | 图标 |
|---|---|---|---|
| 1 | `pages/match/index` | 匹配 | `static/tabbar/match(.png/-active.png)` |
| 2 | `pages/square/index` | 广场 | `static/tabbar/square(.png/-active.png)` |
| 3 | `pages/notifications/index` | 通知 | `static/tabbar/notify(.png/-active.png)` |
| 4 | `pages/profile/index` | 我的 | `static/tabbar/profile(.png/-active.png)` |

**全部页面**（按功能域分组）

#### A. 主流程（4 个 tab 页）

| 路径 | 标题 | 文件 | 说明 |
|---|---|---|---|
| `pages/match/index` | 匹配 | `pages/match/index.vue` | 卡片滑卡 + 双进度条 + 筛选 + 匹配降权/城市提示条 |
| `pages/square/index` | 广场 | `pages/square/index.vue` | 推荐/喜欢 双 tab + 时段标题 + 发布悬浮按钮 |
| `pages/notifications/index` | 通知 | `pages/notifications/index.vue` | 全部/互动/系统 三 tab + 未读角标 |
| `pages/profile/index` | 我的 | `pages/profile/index.vue` | 资料卡 + 资产 + 安全状态 + 功能入口矩阵 |

#### B. 认证与登录（4 个）

| 路径 | 标题 | 说明 |
|---|---|---|
| `pages/auth/login` | 登录 | 一键授权手机号（mock） |
| `pages/auth/realname` | 实名认证 | 身份证 + 人脸（mock 提交即成功/失败） |
| `pages/auth/education` | 学历认证 | 学历凭证上传，人工审核 |
| `pages/auth/work` | 工作认证 | 工作凭证 + 公司/职位 |

#### C. 动态（2 个）

| 路径 | 标题 | 说明 |
|---|---|---|
| `pages/dynamic/detail` | 动态详情 | 图集、点赞、评论、举报入口、作者卡片 |
| `pages/dynamic/publish` | 发布动态 | 文案 + 最多 9 图 + 位置；导流词拦截 |

#### D. 匹配与微信交换（2 个）

| 路径 | 标题 | 说明 |
|---|---|---|
| `pages/match/apply` | 交换联系方式 | 反诈确认 → 20 字留言 → 提交 |
| `pages/match/myApply` | 我的申请 | 我发出的 / 我收到的，倒计时、同意/拒绝 |

#### E. 个人中心与设置（7 个）

| 路径 | 标题 | 说明 |
|---|---|---|
| `pages/profile/edit` | 编辑资料 | 头像/身高/城市/情感需求/标签/相册；城市改动走 24h 冷却 |
| `pages/profile/equity` | 权益中心 | 资产四宫格 + 额度流水 + 优质推荐剩余 |
| `pages/profile/privacy` | 隐私设置 | 动态范围/微信申请/年龄差/隐藏字段 + 安全合规入口 |
| `pages/profile/settings` | 设置 | 隐私、黑名单、我的举报、账号与安全、意见反馈、注销 |
| `pages/profile/blacklist` | 黑名单管理 | 列表 + 解除二次确认 |
| `pages/profile/account` | 账号与安全 | 账号信息、安全状态、风控记录、处罚卡、注销 |
| `pages/profile/myProfile` | 个人主页 | 我的对外展示页（预览用） |

#### F. 他人主页与关系列表（5 个）

| 路径 | 标题 | 说明 |
|---|---|---|
| `pages/user/profile` | Ta的主页 | 完整资料、人生剧本、三观、相册、心动按钮 |
| `pages/user/likeList` | 喜欢列表 | 喜欢我的 / 我喜欢的（`social` store） |
| `pages/user/visitorList` | 最近来访 | 缘分足迹（同城异性，每日 0 点重置） |
| `pages/user/favoriteList` | 我的收藏 | 收藏的心动对象（未实名时按钮变「去实名」） |
| `pages/user/medalWall` + `pages/user/medalDetail` | 我的勋章 / 勋章详情 | 认证徽章墙（2 个页面） |

#### G. 安全合规（4 个）

| 路径 | 标题 | 说明 |
|---|---|---|
| `pages/common/report` | 举报 | 7 类原因 + 证据截图 + 承诺 + 二次确认 |
| `pages/common/myReports` | 我的举报 | 概览 + 女性通道横幅 + 报告卡 + 申诉 |
| `pages/common/antiFraud` | 反诈专区 | 反诈知识 + 三重告知 + 举报直达 |
| `pages/common/feedback` | 意见反馈 | 意见提交（mock） |

#### H. 裂变与落地（2 个）

| 路径 | 标题 | 说明 |
|---|---|---|
| `pages/invite/index` | 邀请好友 | 邀请码、复制链接、邀请记录、奖励说明 |
| `pages/common/landing` | 邀请你加入 | 邀请落地页（按 `userStore.level` 出不同文案） |

#### I. 开发调试（3 个，**上线前必须移除路由**）

| 路径 | 标题 | 说明 |
|---|---|---|
| `pages/test/debug` | 开发者调试 | 11 张调试卡，见 8.1 |
| `pages/test/script` | 人生剧本测试 | ⚠️ 早期占位页 |
| `pages/test/values` | 三观态度测试 | ⚠️ 早期占位页 |

### 3.4 核心导航关系

```
tab1 匹配
 ├─→ 用户卡片 → pages/user/profile（Ta的主页）
 │                ├─→ 心动（消耗额度）
 │                └─→ 收藏心动
 ├─→ 双向匹配成功 → MatchSuccessOverlay → pages/match/apply（申请微信）
 ├─→ 我的申请 → pages/match/myApply（同意/拒绝）
 └─→ 筛选面板（7 组筛选条件）

tab2 广场
 ├─→ 动态卡片 → pages/dynamic/detail
 │                ├─→ 作者 → pages/user/profile
 │                └─→ 举报 → pages/common/report → redirect pages/common/myReports
 └─→ 发布 → pages/dynamic/publish

tab3 通知
 └─→ 按 kind 路由：匹配/申请/认证/举报/邀请/额度提醒

tab4 我的
 ├─→ 编辑资料、权益中心、我的收藏、勋章墙、最近来访
 └─→ 设置
      ├─→ 隐私设置 ──→ 黑名单管理
      ├─→ 账号与安全（注销）
      ├─→ 我的举报
      ├─→ 意见反馈
      └─→ 反诈专区
```

---

## 第 4 章 全局设计规范

### 4.1 视觉规范要点

| 项 | 规范 |
|---|---|
| 页面背景 | `#FAFAFA`（米白）；卡片 `#FFFFFF` |
| 卡片 | 圆角 20px，阴影 `0 2px 8px rgba(0,0,0,.04)`，内边距 16px |
| 主按钮 | 高 44px，圆角 16px，主色渐变，文字 15px/500 |
| 次要按钮 | 白底 + `#E5E5E5` 描边 + `#333` 文字 |
| 禁用态 | `$disabled-bg: #F0F0F0` + `$text-helper` |
| 头像 | 大 100 / 中 80 / 小 44 / 极小 32，圆形 |
| 页面横向内边距 | 12px |
| 字号阶梯 | 20 标题 / 18 大标题 / 16 小标题 / 14 正文 / 12 辅助 |
| 认证徽章 | `AuthBadge.vue`，已实名/学历/工作 三态 |

### 4.2 弹窗统一规范（`CustomModal`）

**所有需要用户二次确认的操作必须走 `CustomModal`**，禁止用 `uni.showModal` 原始样式。统一文案由 `businessCopy` 提供。

| 场景 | 标题 | 内容 | 确认 | 取消 |
|---|---|---|---|---|
| 注销账号 | 确定要离开吗 | "注销后你的资料将被安全清除，缘分虽短，感谢相遇。确定要离开吗？" | 确认注销 | 再想想 |
| 解除拉黑 | 解除拉黑 | "解除拉黑后，你们需要重新双向心动才能再次申请交换微信" | 确认解除 | 取消 |
| 提交举报 | 确认举报 | 7 类原因对应承诺 | 确认提交 | 取消 |
| 额度耗尽 | 今日缘分已尽 | `businessCopy.browseQuotaExhausted` | 明天再来 | 去广场看看 |
| 权限拦截 | 注册后即可解锁 / 完成实名认证 | 见 3.2 | 一键注册 / 去实名 | 稍后 |
| 反诈告知 | 安全提示 | `antiFraudTips.apply` | 我已了解，继续 | 取消 |

**实现约束**（重要）：
- `CustomModal` 使用 `:visible` + `@confirm` / `@close`，**不是** `v-model:visible`。
- 涉及 `uni.showActionSheet` 的地方（如举报申诉），**必须**传 `fail: () => {}`。

### 4.3 加载 / 空态 / 骨架

| 组件 | 用途 |
|---|---|
| `SkeletonCard.vue` | 列表首屏骨架屏 |
| `LoadingSpinner.vue` | 局部加载（加载更多、提交中） |
| `EmptyState.vue` | 空态，**必须**使用 `emptyCopy` 中的文案，禁止自定义 |

**空态文案强制约定**：所有空态必须"有出路"——告诉用户下一步做什么，禁止出现"暂无数据"这类负面短句。

### 4.4 安全徽章 `SafetyBadge`

| 项 | 规范 |
|---|---|
| 组件 | `components/common/SafetyBadge.vue` |
| 默认文案 | `🛡️ 实名核验 · 反诈保障` |
| 变体 | 默认整行条 / `inline` 紧凑态（用于 tab 页顶部） |
| 接入方式 | `CustomNavbar` 的 `safetyBadge` prop 默认 `true`，导航栏下方自动渲染；tab 页用 `<SafetyBadge inline />` |
| 覆盖页面 | 匹配、广场、通知、我的 4 个 tab 页 + 所有二级页 |

### 4.5 反诈三重告知（`antiFraudTips`）

| 时机 | 文案 |
|---|---|
| 注册时 | 平台不会以任何名义索要转账、投资、保证金，请勿向陌生人付款 |
| 申请微信时 | 对方微信号仅用于线下沟通，请勿转账、代付、投资，谨防诈骗 |
| 交换成功后 | 微信已交换成功，涉及金钱往来请立即停止并举报，平台会优先处理 |

### 4.6 统一文案库（`src/mock/copy.js`，全文）

> **硬性要求**：全站页面强制复用，**禁止**在页面内自定义负面文字。新增文案需先加到本文件。

#### 4.6.1 `businessCopy` 业务操作标准文案（18 条）

```js
realNameFailed:        '认证暂未通过，可能是光线或证件清晰度问题，请调整后重试，或联系人工复核'
avatarRejected:        '首图需要是本人正面清晰照片哦，这样才能让缘分更真实～'
browseQuotaExhausted:  '今日缘分已尽，明天将为你刷新全新的同城异性 🌙'
likeQuotaExhausted:    '今日心动已用完，明天继续遇见对的人 💕'
applyNoResponse:       '对方暂未回应，缘分值得耐心等待，继续发现下一位吧'
applyExpired:          '缘分暂未回应，继续寻找下一位吧'
contactInGreeting:     '这句话可能包含联系方式，为了大家的安全，请通过官方通道交换微信哦'
accountRestricted:     '账号因违反社区规范被限制使用，如有疑问可通过申诉通道复核'
logoutConfirm:         '注销后你的资料将被安全清除，缘分虽短，感谢相遇。确定要离开吗？'
realNameGuide:         '完成实名认证，即可开启异性精准匹配，已有上万同城用户加入'
registerGuide:         '一键授权手机号，0.5 秒完成注册，解锁完整真实资料'
dynamicNeedEdit:       '这条动态需要调整一下内容，修改后可重新发布哦'
blocked:               '缘分需要双向奔赴，去发现更多同城的 TA 吧'
lowCompleteness:       (percent) => `你的资料完成度 ${percent}%，补充介绍，能大幅提升匹配概率`
duplicateRealName:     '一个身份证仅能认证一个账号，如需帮助请联系客服'
guestLimit:            '注册后即可查看完整资料，已有大量同城用户完成实名'
weakNetwork:           '网络有点慢，正在努力加载中...'
systemError:           '出了点小状况，请稍后再试，我们一直在优化'
```

> 共 18 个键，其中 `lowCompleteness` 为函数型（需传百分比）。

#### 4.6.2 `emptyCopy` 空状态文案（5 条）

```js
squareEmpty:    '首批真实用户正在赶来，先看看大家的故事吧'
matchEmpty:     '你的缘分还在路上，完善资料能让 TA 更快找到你'
likeEmpty:      '你还没被更多人看到，发布一条动态，提升曝光'
likeFeedEmpty:  '还没有你心动的动态，去推荐里遇见更多同城故事吧'
greetingEmpty:  '缘分还在酝酿中，主动去发现同城的 TA 吧'   // 原"招呼对话为空"，站内聊天已取消，暂未使用
```

#### 4.6.3 `getTimeSlotTitle()` 广场时段标题（8 档覆盖 0–24 点）

| 时段 | 标题 |
|---|---|
| 06:00–11:00 | 早安，新的一天从遇见缘分开始 |
| 11:00–14:00 | 午休时间，看看同城有谁在等你 |
| 14:00–18:00 | 下午好，今日缘分正在刷新中 |
| 18:00–20:00 | 下班了，今晚的缘分已为你准备好 |
| 20:00–23:00 | 今晚遇见同频同城异性 |
| 23:00–24:00 / 00:00–01:00 | 夜深了，缘分也需要休息，明天见 🌙 |
| 01:00–06:00 | 凌晨时段，缘分正在沉睡，早点休息吧 |

> 实现细节：`timeSlotTitles` 数组用 `start <= hour < end` 匹配，23–24 与 0–1 是两条独立记录，为的是避免跨零点边界 bug。

#### 4.6.4 匹配成功随机文案（3 条，随机取一条）

```
你们在同一座城市，也在同一频率上
缘分刚刚好，先从一句你好开始吧
双向心动的概率很低，恭喜你们遇上了
```

#### 4.6.5 交换微信页安全兜底文案

```
wechatSafetyCopy: '遭遇骚扰、欺诈，可随时回平台举报，我们优先处理'
```

---

## 第 5 章 功能模块详述

本章按已交付的 8 个开发模块（M2–M9）组织。每个模块给出：**目标 → 硬规则 → 页面交互 → 数据契约 → 边界与异常**。

> M1（阶段 0）为工程脚手架：uni-app 初始化、设计系统、14 个公共组件、三级权限门禁、mock 层骨架。已在第 2、3、4 章覆盖，不单列。

---

### 5.1 M2 · 异性匹配与额度体系

#### 5.1.1 目标

用"每日有限额度"强制用户认真看人，而不是无脑右滑。这是产品"克制稀缺"策略的核心载体。

#### 5.1.2 硬规则（可直接写单测）

| # | 规则 | 实现位置 |
|---|---|---|
| R1 | 浏览额度：`DAILY_BROWSE_TOTAL = 10` 次/日，**0 点重置** | `store/equity.js` |
| R2 | 心动额度：男性 `3` 次/日、女性 `5` 次/日，**0 点重置** | `DAILY_LIKE_MALE/FEMALE` |
| R3 | 消耗优先级：**先扣当日额度，当日耗尽后自动扣永久心动次数** | `consumeLike()` |
| R4 | 每次划卡（心动 / 跳过）消耗 **1 次浏览额度**；**优质推荐卡不占额度** | `advance()` 中 `if (!isQualityCard)` |
| R5 | 浏览额度耗尽 → 全屏空态 + `businessCopy.browseQuotaExhausted` | `match/index.vue` |
| R6 | 资料完整度 ≥ **80%** 可领取 **次日 +3 浏览**，每日仅可领 1 次 | `COMPLETENESS_THRESHOLD/BONUS` |
| R7 | 加赠额度是 **pendingBonus**，次日 0 点才计入 `browseBonus` | `ensureToday()` |
| R8 | 优质惊喜推荐：**每周最多 2 次**（周一为周起点） | `QUALITY_WEEKLY_LIMIT` |
| R9 | 匹配池默认是 **全部异性用户**（不限城市）；只有开启「同城」快捷筛选才按生效城市过滤 | `filteredPool` 中 `quick === 'city'` 分支 |
| R10 | 已拉黑用户 **不进入匹配池** | `privacy.isBlocked` 过滤 |
| R11 | 心动必须 **二次确认**，弹窗展示剩余心动次数（防误触） | `showLikeConfirm` |
| R12 | 未实名用户点心动 → **双选项弹窗**：【收藏心动】/【先去实名认证】 | `handleLike()` |
| R13 | 心动后 **30% 概率**模拟"对方也心动"→ 建双向匹配 + 全屏动效 | `confirmLike()` |
| R14 | 优质惊喜推荐触发门槛：**双方均已双认证（学历+工作）且标签交集 ≥ 3** | `isQualityEligible` |

> R13 的 30% 是纯前端 mock 概率，**接入后端后必须删除**，改为服务端返回 `isMutual: true`。

#### 5.1.3 匹配页交互

**页面从上到下的区块顺序**

| 顺序 | 区块 | 内容 | 显示条件 |
|---|---|---|---|
| 1 | 安全徽章 | `<SafetyBadge inline />` | 常驻 |
| 2 | 双进度条（`QuotaBar`） | `今日剩余浏览 7/10 ｜ 今日剩余心动 2/3` | 常驻 |
| 3 | 降权横幅 | `账号已降权，暂不向女性用户推荐 · 查看原因` | `risk.deprioritized` |
| 4 | 城市待生效条 | `城市已改为上海，24 小时后生效 · 期间仍按北京匹配` | `userStore.cityPending` |
| 5 | 已匹配状态条 | 最近一次双向匹配 + 微信进度副标题（见下表） | 存在匹配关系且未手动关闭 |
| 6 | 用户大图卡 | 头像/相册、昵称 · 年龄 · 身高 · 区县、认证徽章、契合点 slogan、标签组、优质推荐标识 | 有卡片 |
| 7 | 操作区 | 左「✕ 跳过」/ 右「♡ 心动」 | 有卡片 |
| 8 | 底部入口 | 筛选、人生剧本、三观契合 | 常驻 |
| 9 | 空态 | 额度耗尽空态 或 筛选无结果空态 | 无卡片 |

**关键交互**

| 操作 | 结果 |
|---|---|
| 点「跳过」 | 扣 1 浏览额度 → 下一张 |
| 点「心动」 | 权限校验 → 额度校验 → 二次确认弹窗 → 扣额度 → 30% 建匹配 |
| 点卡片 | 进 `pages/user/profile`（游客弹注册引导） |
| 点筛选 | 展开快捷筛选 + 7 组面板筛选（`mock/filters.js`） |
| 点人生剧本 / 三观 | 双方都完成测试才可查看，否则显示 `完成测试查看匹配` / `对方暂未完成测试` |
| 点优质推荐卡继续划 | **不扣浏览额度**，卡片带「✨ 优质推荐」标识 |

**空态的两种形态**

| 场景 | 标题 | 描述 | 按钮 |
|---|---|---|---|
| 浏览额度耗尽 / 今日卡片看完 | 今日缘分已尽 | `businessCopy.browseQuotaExhausted` | 「领取明日 +3 次浏览」（达标时）/「完善资料」；+「去广场逛逛」 |
| 筛选后无匹配 | 你的缘分还在路上 | `emptyCopy.matchEmpty` | 「调整筛选条件」+「完善资料」 |

**降权横幅**（`risk.deprioritized === true`）
```
账号已降权，暂不向女性用户推荐 · 查看原因
```

**已匹配状态条**（有匹配关系时顶部常驻，可点开回顾）

| 匹配状态 | 副标题 |
|---|---|
| `wechatStatus = 'none'` | 你们互相心动了，点击申请交换微信 |
| `wechatStatus = 'pending'` | 微信申请已发出，等待对方确认 |
| `wechatStatus = 'agreed'` | 微信号已互换，点击回顾 |

**城市待生效提示条**（`userStore.cityPending`）
```
城市已改为上海，24 小时后生效 · 期间仍按北京匹配
```

#### 5.1.4 筛选条件

匹配页有两层筛选：**快捷筛选（5 个 chip）+ 面板筛选（7 组）**，两层条件同时生效（AND）。

**快捷筛选（`quickFilters`，单选 chip）**

| chip | value | 过滤逻辑 |
|---|---|---|
| 全部 | `all` | 不过滤 |
| 同城 | `city` | 用户 `ipLocation` 或 `district` 包含生效城市 |
| 本科+ | `education` | 学历包含「本科 / 硕士 / 研究生」 |
| 认证用户 | `auth` | 学历认证或工作认证至少一项点亮 |
| 近期活跃 | `active` | 预留，当前不参与过滤 |

**面板筛选（`filterGroups`，7 组）**

| 组 | key | 选项 |
|---|---|---|
| 年龄 | `age` | 不限 / 18-22 / 23-27 / 28-32 / 33+ |
| 城市 | `city` | 不限 / 北京 / 上海 / 深圳 / 广州 / 杭州 / 成都 / 武汉 / 天津 |
| 身高 | `height` | 不限 / 150-160 / 160-170 / 170-180 / 180+ |
| 目的 | `purpose` | 不限 / 认真恋爱 / 奔结婚 / 先做朋友 / 顺其自然 |
| 学历 | `education` | 不限 / 大专 / 本科 / 硕士 / 博士 |
| 行业 | `industry` | 不限 / 互联网 / 金融 / 教育 / 医疗 / 设计 / 公务员 / 自由职业 |
| 兴趣 | `interest` | 不限 / 旅行 / …（多选） |

筛选逻辑由 `matchUserByFilters(user, filters)` 提供，所有条件为 **AND**，`'all'` 表示不限。

#### 5.1.5 资料完整度算法（0–100）

12 个检查项，每项等权（`Math.round(filled/12*100)`）：

1. 有头像
2. 有昵称
3. 填了性别
4. 填了年龄
5. 填了城市
6. 填了身高
7. 填了个人简介 `bio`
8. 填了情感需求 `emotionNeed`
9. 标签 ≥ 3 个
10. 爱好 ≥ 3 个
11. 相册 ≥ 3 张
12. 已完成实名认证

---

### 5.2 M3 · 双向匹配与微信交换全流程

#### 5.2.1 目标

**不提供任何站内聊天**。匹配成功后唯一延续路径是交换微信，把关系迁移到用户自己的社交工具里。这既是产品策略，也大幅降低平台内容审核成本。

#### 5.2.2 硬规则

| # | 规则 | 实现 |
|---|---|---|
| R1 | 双向匹配 = A 心动 B **且** B 心动 A | `match.createMatch(userId)` |
| R2 | 匹配成功弹 **全屏动效**，同一条关系只弹一次 | `successShown[]` + `MatchSuccessOverlay` |
| R3 | 成功动效展示：双方头像、3 条随机正向文案之一、共同标签（最多 3 个） | `matchSuccessTexts` / `matchSuccessTags` |
| R4 | **无站内聊天**：不提供消息页、不提供招呼、不提供"一来一回" | 全局 |
| R5 | 微信申请有效期 **3 天**，到期自动 `expired` | `APPLY_VALID_DAYS` + `expireCheck()` |
| R6 | 同一用户对同一对象 **7 天内仅可发起 1 次** | `APPLY_COOLDOWN` |
| R7 | 申请留言 **上限 20 字**，选填 | `MESSAGE_MAX_LEN` |
| R8 | 申请前 **必须** 弹反诈告知并确认「我已了解」 | `antiFraudTips.apply` |
| R9 | 申请留言命中导流特征 → **直接拦截，不落库** | `detectContact()` |
| R10 | 对方同意后才可见微信号 | `getWechatOf()` |
| R11 | 接收方 **24h 未处理自动拒绝**（可在隐私设置关闭） | `autoRejectCheck()` |
| R12 | 申请卡片顶部高亮「缘分契合点」 | `buildFatePoint()` |
| R13 | 发起申请前需通过 **对方隐私策略**（开关/双认证/年龄差/黑名单） | `privacy.checkApply(target)` |

#### 5.2.3 导流拦截规则（`CONTACT_PATTERNS`）

以下任一命中即拦截：

| 类型 | 正则特征 |
|---|---|
| 手机号 | `1[3-9]` 开头 11 位 |
| 长数字串 | 连续 5 位以上数字（QQ / 长号） |
| 微信号 | `微信/威信/薇信/vx/VX/wx/WX/weixin/wechat` + 可选引导词 + 3 位以上字母数字下划线 |
| 邮箱 | 标准邮箱格式 |
| 链接 | `http://` `https://` `www.` |
| QQ | `qq/QQ` + 可选引导词 + 数字 |
| 导流话术 | `加我` `私聊我` `扫码` `二维码` |

命中后：
- 在**发布动态**中 → 拦截并提示 `businessCopy.dynamicNeedEdit`
- 在**微信申请留言**中 → 拦截并提示 `businessCopy.contactInGreeting`

#### 5.2.4 微信交换页（`pages/match/apply`）交互

**页面区块顺序**

| 顺序 | 区块 | 内容 |
|---|---|---|
| 1 | 安全兜底条 | `wechatSafetyCopy`：遭遇骚扰、欺诈，可随时回平台举报，我们优先处理 |
| 2 | 缘分契合点 | `matchStore.getFatePoint(userId)`，如「都爱周末探店的你们，大概率能吃到一起、聊到一块」 |
| 3 | 留言输入 | 选填，右下角实时显示「还可输入 N 字」，上限 20 |
| 4 | 发送按钮 | 主按钮「发送申请」 |
| 5 | 底部反诈提示 | `antiFraudTips.apply`：对方微信号仅用于线下沟通，请勿转账、代付、投资，谨防诈骗 |

**点击「发送申请」的完整链路**

```
点击
 └─ canApplyWechat(userId)
     ├─ 未匹配        → 拦截「还没有形成双向心动」
     ├─ 已交换        → 拦截「已交换微信」
     ├─ 黑名单        → 拦截「你们之间存在屏蔽关系」
     ├─ 对方关闭申请   → 拦截「对方关闭了微信申请通道…」
     ├─ 仅双认证      → 拦截「对方仅接受双认证用户…」
     ├─ 年龄差超限    → 拦截「年龄差超出了对方的接受范围…」
     ├─ 已有 pending  → 展示倒计时
     └─ 冷却期内      → 展示剩余天数
 └─ 反诈弹窗「我已了解，继续」
 └─ detectContact(留言) 命中 → 拦截
 └─ applyWechat() → 写入 applications，wechatStatus='pending'
 └─ 通知对方 pushApplyReceive
```

#### 5.2.5 我的申请（`pages/match/myApply`）

两个分段：**我收到的 / 我发出的**

| 方向 | 卡片内容 | 操作 |
|---|---|---|
| 我收到的 (in) | 申请人头像/昵称/年龄/区域 + 留言 + 契合点 + 剩余时效 | `同意交换` / `婉拒` |
| 我发出的 (out) | 对方头像/昵称 + 留言 + 剩余时效 + 状态 pill | 不可操作（等对方） |

**状态 pill 文案**

| status | 文案 | 颜色 |
|---|---|---|
| `pending` | 等待对方回应（剩 N 小时） | 主色 |
| `agreed` | 已交换微信 | 成功色 |
| `rejected` | 对方暂未回应 | 辅助灰 |
| `expired` | 已过期 | 辅助灰 |
| `auto_rejected` | 超时未处理，已自动关闭 | 辅助灰 |

**同意后**：卡片直接展示对方微信号 + 「复制」按钮 + 反诈提示 `antiFraudTips.success`。

---

### 5.3 M4 · 同城图文动态广场

#### 5.3.1 目标

在主流程之外提供**低成本表达**的场所。动态是"展示真实生活"的载体，也是匹配池的补充来源。

#### 5.3.2 硬规则

| # | 规则 |
|---|---|
| R1 | 两个 tab：**推荐** / **喜欢**（我喜欢过的动态） |
| R2 | 顶部标题按时段自动切换（8 档，见 4.6.3） |
| R3 | 推荐流排序：**同城优先 → 跨城优质兜底 → 其余跨城** |
| R4 | 冷启动兜底：同城动态 **< 5 条** 时，自动补入跨城 `isQuality` 内容 | 
| R5 | 单条动态排序权重：`pinned`（置顶） > `isQuality`（优质加权） > `createdAt`（时间新鲜度） |
| R6 | 跨城内容带「跨城」徽标 + `pickedFallback` 标记 |
| R7 | 游客只能看 **前 5 条**，第 5 条后渐隐 + 解锁卡 |
| R8 | 点赞：注册即可；**评论：需实名**；**发布：需实名** |
| R9 | 评论字数上限 **60 字** |
| R10 | 发布图片上限 **9 张** |
| R11 | 发布文案命中导流特征 → 拦截 |
| R12 | 运营标记为优质动态 → 一次性发放 **3 次永久心动**（`QUALITY_REWARD_LIKES`） |
| R13 | 评论列表 **过滤已被拉黑的用户** |
| R14 | 连续 **≥ 4 天** 无匹配 → 广场顶部出安抚提示（可关闭） |

#### 5.3.3 页面结构

**广场页区块顺序**

| 顺序 | 区块 | 内容 |
|---|---|---|
| 1 | 安全徽章 | `<SafetyBadge inline />` |
| 2 | 时段标题 | `getTimeSlotTitle()`，如「早安，新的一天从遇见缘分开始」 |
| 3 | 分类 tab | 推荐 / 喜欢（我点赞过的） |
| 4 | 动态卡片流 | 每条含：置顶/跨城标识、作者头像·昵称·年龄·区县、认证徽章、正文、图片（单图或九宫格）、位置、`♡ 点赞数`、`💬 评论数`、相对时间 |
| 5 | 游客解锁卡 | 第 5 条之后的渐隐遮罩 +「注册后查看全部动态」 |
| 6 | 发布悬浮按钮 | 右下角「＋ 发布」，未实名态 `is-disabled` |
| 7 | 加载更多 | 触底加载中提示 |

#### 5.3.4 动态数据结构

```js
{
  id: Number,
  userId, userName, userAvatar, userAge, gender,
  occupation, district, city, auth: { realName, education, work },
  content: String,
  images: String[],          // 最多 9
  location: String,          // 如「北京·东城·南锣鼓巷」
  createdAt: Number,         // 时间戳
  likes: Number,
  isQuality: Boolean,        // 运营标记优质
  pinned: Boolean,           // 运营置顶
  mine: Boolean,
  commentList: [{ id, userId, name, avatar, text, createdAt }]
}
```

#### 5.3.5 相对时间文案（`formatRelativeTime`）

| 距今 | 文案 |
|---|---|
| < 1 分钟 | 刚刚 |
| < 1 小时 | N分钟前 |
| < 24 小时 | N小时前 |
| < 2 天 | 昨天 |
| < 7 天 | N天前 |
| ≥ 7 天 | N周前 |

> 通知的时间文案 `formatNotifyTime` 规则相同，是另一份独立实现（比动态"更克制"）。

---

### 5.4 M5 · 个人中心与权益中心

#### 5.4.1 个人中心（tab4）

**四段结构**

1. **资料卡**：头像、昵称、权限标签（游客/已实名/待实名）、资料完整度环形进度、编辑入口
2. **资产区**：今日浏览 `7/10`、今日心动 `2/3`、永久心动 `5`、同城曝光卡 `1`
3. **安全状态**（仅异常时显示）：已封禁 / 受限（处罚中）/ 已降权 / 已注销
4. **功能入口矩阵**：权益中心、我的收藏、我的勋章、最近来访、喜欢列表、我的举报、设置
5. **顶部** `<SafetyBadge />`

**权限提示文案**（`pages/profile/index.vue`）

| level | 标签 | 副标题 |
|---|---|---|
| guest | 游客 | `businessCopy.guestLimit` |
| registered | 待实名 | 完成实名认证后即可看见同城 TA |
| certified | 已实名 | — |

#### 5.4.2 权益中心（`pages/profile/equity`）

| 区块 | 内容 |
|---|---|
| 资产四宫格 | 今日浏览剩余 / 今日心动剩余 / 永久心动次数 / 同城曝光卡 |
| 额度规则说明 | 每日 0 点重置；男性 3 次女性 5 次；永久次数不受限 |
| 加赠入口 | 资料完整度 ≥80% 可领次日 +3 浏览（已领则显示"已领取"） |
| 优质推荐 | 本周剩余 `2/2` 次 |
| 权益流水 | `records[]`，倒序，**最多保留 50 条**；类型 `consume`/`gain`，场景 `browse`/`like`/`permanent`/`exposure`/`quality` |

#### 5.4.3 编辑资料（`pages/profile/edit`）

可编辑字段：头像、昵称、身高、**城市**、情感需求、个人简介、性格标签、兴趣爱好、生活相册。

**城市字段特殊处理**（M9 新增）：
- 保存时调 `userStore.changeCity(city)`
- 若与当前生效城市不同 → 提示「已保存，城市改为 X，24 小时后生效」
- 24 小时内匹配 / 广场仍按旧城市计算

#### 5.4.4 关系列表页

| 页面 | 数据源 | 说明 |
|---|---|---|
| 我的收藏（`user/favoriteList`） | `user.favorites` | 未实名时按钮显示「去实名」且卡片半透明 |
| 喜欢列表（`user/likeList`） | `social.myLikeList` / `social.likesMeList` | 双 tab；空态用 `emptyCopy.likeEmpty` |
| 最近来访（`user/visitorList`） | `social.footprintUserIds` | 口径 = 今日真实主页浏览 ∪ 今日未实名暂存心动；**仅统计同城异性**；**每日 0 点重置**；可手动关闭提示 |

**缘分足迹文案**
```
今天有 N 位同城异性关注了你        // social.footprintText
今天暂时还没有同城 TA 路过，发条动态让更多人看到你   // footprintEmptyText
```

#### 5.4.5 勋章墙（`user/medalWall` / `user/medalDetail`）

- 三档：`gold`（双一流守护者类）/ `blue`（大厂搬砖人类）/ 普通
- 数据来自用户 `showMedals[]`
- 详情页展示获得条件与说明

---

### 5.5 M6 · 学历 / 工作资质认证

#### 5.5.1 目标

在实名之上提供"加分项"认证，用**奖励驱动**而非**强制要求**，避免认证疲劳。

#### 5.5.2 硬规则

| # | 规则 |
|---|---|
| R1 | **仅已实名用户**可发起学历 / 工作认证 |
| R2 | 凭证文件 **必填**，未填不可提交 |
| R3 | 提交后状态 `pending`，进入人工审核（mock） |
| R4 | 审核通过 → `authStatus[type] = true` + **首次**发放 `5` 次永久心动 |
| R5 | 奖励**防重复发放**，由 `certRewarded` 记录 |
| R6 | 审核通过推送通知 `cert_pass`（"认证通过"） |
| R7 | 驳回 → 状态 `failed`，保留驳回原因，可**申诉**回到 `pending` |
| R8 | 双认证（学历 + 工作）点亮 → `isDoubleVerified = true`，成为"仅接受双认证"的筛选条件 |

#### 5.5.3 认证状态机

```
idle ──提交──> pending ──通过──> success（点亮徽章 + 首次奖励）
                  │
                  └──驳回──> failed ──申诉──> pending
```

状态取值：`idle | pending | success | failed`，读取入口 `userStore.certificationOf(type)`。

#### 5.5.4 认证数据契约

```js
verifications: {
  realName:  { status, time } | null,
  education: { status, method, credential, submittedAt, handledAt, reason } | null,
  work:      { status, method, credential, company, position, submittedAt, handledAt, reason } | null
}
```

| 字段 | 说明 |
|---|---|
| `method` | 认证方式（如 `学信网` / `工牌` / `在职证明`） |
| `credential` | 凭证文件（mock 为路径字符串） |
| `company` / `position` | 仅工作认证 |
| `reason` | 驳回原因，展示在页面上供用户修正 |

#### 5.5.5 页面交互

**学历认证（`pages/auth/education`）**
- 前置检查：未实名 → 展示引导 `businessCopy.realNameGuide` + 去实名按钮
- 认证方式选择：学信网在线验证 / 上传学历证书
- 凭证上传区
- 提交后：`pending` 态卡片（"已提交，预计 1 个工作日内完成审核"）
- `failed` 态：展示 `reason` + 申诉按钮
- `success` 态：绿色徽章 + "已获得 5 次永久心动"

**工作认证（`pages/auth/work`）**：同上，额外填公司名 + 职位。

---

### 5.6 M7 · 拉新裂变与消息通知

#### 5.6.1 通知系统

**16 种通知类型**（`mock/notifications.js` 的 `NOTIFY_META`）

| kind | 分类 | 图标 | 名称 |
|---|---|---|---|
| `like_me` | 互动 | ❤️ | 收到心动 |
| `match_success` | 互动 | 💕 | 匹配成功 |
| `apply_receive` | 互动 | 💬 | 收到微信申请 |
| `apply_agreed` | 互动 | ✅ | 申请已通过 |
| `apply_rejected` | 互动 | ❌ | 申请已拒绝 |
| `like_dynamic` | 互动 | 👍 | 收到点赞 |
| `comment_dynamic` | 互动 | 💬 | 收到评论 |
| `realname_guide` | 系统 | 🔒 | 实名引导 |
| `quota_remind` | 系统 | ⏰ | 额度提醒 |
| `cert_pass` | 系统 | 🎖️ | 认证通过 |
| `quality` | 系统 | ✨ | 优质动态 |
| `invite_joined` | 系统 | 🤝 | 邀请好友加入 |
| `invite_reward` | 系统 | 🎁 | 邀请奖励 |
| `report_received` | 系统 | 🛡️ | 举报已受理 |
| `report_result` | 系统 | 🕊️ | 举报处理结果 |
| `anti_fraud` | 系统 | 📢 | 反诈提醒 |

**硬规则**

| # | 规则 |
|---|---|
| R1 | 三个 tab：全部 / 互动 / 系统，各带未读数 |
| R2 | tabBar 角标 = 未读总数，**必须传回调**：`uni.setTabBarBadge({ index: 2, text, success, fail })` |
| R3 | 通知列表上限 **60 条**（`MAX_LIST`），超出丢弃最旧 |
| R4 | **额度提醒仅对「男性 + 已实名」推送**（女性硬性禁止）；档位 **9:00 / 20:00**，取当前时间已过的最近一档，每档每日最多 1 次；当日浏览与心动额度已全部用完则不推 |
| R5 | **女性用户不接收动态互动推送**（`pushDynamicInteract` 对女性直接 `return null`） |
| R6 | 游客不推匹配成功；注册未实名推的是「实名引导」而非「匹配成功」 |
| R7 | 女性用户收到举报处理结果时标题为「感谢你守护社区」 |
| R8 | 举报受理 / 处理结果均推送通知 |

> **R2 是必须遵守的技术约束**：`uni.setTabBarBadge` 与 `removeTabBarBadge` 在 H5 下未传回调会返回 Promise，取消/失败时产生未捕获拒绝，直接导致页面 `pageerror`。

**点击通知的路由表（`actionType`）**

| actionType | 跳转目标 |
|---|---|
| `view_profile` | `targetId` 有值 → `/pages/user/profile?userId=`；无值 → `/pages/profile/myProfile` |
| `view_dynamic` | `/pages/dynamic/detail?id={targetId}` |
| `view_like_list` | `/pages/user/likeList?type=receive` |
| `apply_wechat` | `/pages/match/apply?userId={targetId}` |
| `handle_apply` | `/pages/match/apply?userId={targetId}&type=handle` |
| `apply_result_agreed` | `/pages/match/apply?userId={targetId}&result=agreed` |
| `apply_result_rejected` | `/pages/match/apply?userId={targetId}&result=rejected` |
| `view_medal` | `/pages/user/medalWall` |
| `view_antifraud` | `/pages/common/antiFraud` |
| `reply_comment` | `/pages/dynamic/detail?id={targetId}&focus=comment` |
| `realname_guide` | `/pages/auth/realname` |
| `view_equity` | `/pages/profile/equity` |
| `view_invite` | `/pages/invite/index` |
| `view_reports` | `/pages/common/myReports` |
| 其它 / 空 | 仅标记已读，不跳转 |

**点击行为**：任何通知点击后**立即标记已读**（不管是否跳转成功）。

#### 5.6.2 邀请裂变

**硬规则**

| # | 规则 |
|---|---|
| R1 | 每位用户有唯一邀请码，格式 `FY` + 5 位 userId（`codeOf(10000)` → `FY10000`） |
| R2 | 好友通过邀请链接注册 → 生成邀请记录（`pending`） |
| R3 | 好友**完成实名认证** → 邀请人 + 好友 **各得 5 次永久心动** |
| R4 | 奖励**不重复发放**，由 `inviteeRewarded` / `inviterRewarded` 控制 |
| R5 | **不做任何现金奖励**，也不鼓励为奖励批量拉新 |
| R6 | 异常邀请（非同城、疑似批量）不计入奖励 |
| R7 | `shareCount` 仅用于页面展示，**不产生任何奖励** |

**邀请规则文案（`inviteRules`，页面直接渲染）**

```
1. 把专属链接分享给微信好友或朋友圈，好友通过链接注册即可
2. 好友完成实名认证后，你和好友各得 5 次永久心动次数
3. 永久心动次数不受每日额度限制，用完当日额度后自动消耗
4. 平台不做任何现金奖励，也不鼓励为奖励而批量拉新
5. 好友需为真实同城用户，异常邀请将不计入奖励
```

**分享文案（`inviteShareCopy(name)`）**

```
title:         `${name} 邀请你加入，一起遇见同城的 TA`
timelineTitle: `${name} 在等你，同城真实交友`
```

**邀请页数据**

| 字段 | 说明 |
|---|---|
| `code` | 我的专属邀请码 |
| `invitedBy` | 我是被谁的邀请码带来的 |
| `inviteeRewarded` | 我作为被邀请人奖励是否已发 |
| `inviterRewarded` | 我的邀请人是否已同步获得奖励 |
| `records[]` | `{ userId, name, avatar, joinedAt, realnameAt }` |
| `shareCount` | 分享次数（仅展示） |

counters：`inviteCount`（总邀请）/ `successCount`（已实名）/ `pendingCount`（待实名）/ `rewardLikes`（已得）/ `pendingLikes`（待得）

#### 5.6.3 邀请落地页（`pages/common/landing`）

按 `userStore.level` 渲染不同内容：

| level | 展示 |
|---|---|
| `guest` | 邀请人信息 + "一键授权手机号，0.5 秒完成注册" + `businessCopy.registerGuide` |
| `registered` | 邀请人信息 + "完成实名认证领取奖励" + `businessCopy.realNameGuide` |
| `certified` | "你已完成注册，进入 App" |

---

### 5.7 M8 · 隐私设置与风控合规

#### 5.7.1 隐私设置（`pages/profile/privacy`）

**四段结构**

| 区块 | 项 | 类型 | 默认值 | 真实业务后果 |
|---|---|---|---|---|
| 动态隐私 | 动态可见范围 | 三选一 | `all` | `all` 全部可见 / `matched` 仅双向匹配 / `self` 仅自己 |
| 微信申请 | 允许他人申请交换微信 | 开关 | `true` | 关闭后 `checkApply` 直接拦截 |
| 微信申请 | 仅接受双认证用户申请 | 开关 | `false` | 开启后非双认证用户被拦截 |
| 微信申请 | 年龄差限制 | 四选一 | `0` | `0`/`±3`/`±5`/`±8`，超出即拦截 |
| 微信申请 | 24h 未处理自动拒绝 | 开关 + 小时数 | **`true` / 24h** | **女性默认开启**，超时申请自动 `auto_rejected` |
| 其它隐私 | 在推荐流中展示我 | 开关 | `true` | 关闭后不进入推荐 |
| 其它隐私 | 隐藏资料字段 | 多选 | `[]` | 可选：身高 / 职业 / 所在区域 / 生活相册 |
| 安全与合规 | 黑名单管理 | 入口 | 2 人 | 见 5.7.2 |
| 安全与合规 | 我的举报 | 入口 | 处理中 N 条 | 见 5.7.3 |
| 安全与合规 | 账号与安全 | 入口 | — | 见 5.7.5 |

**「女性默认开启」tag**：`autoRejectEnabled` 项右侧显示标签，说明这是接收方保护机制。

#### 5.7.2 黑名单

| # | 规则 |
|---|---|
| R1 | 拉黑**无通知**，对方不会收到任何提示 |
| R2 | 双向屏蔽：对方看不到我，我也看不到对方 |
| R3 | 匹配池过滤（`filteredPool`） |
| R4 | 动态评论过滤（`social.commentsOf` 与 `square.commentsOf`） |
| R5 | 解除拉黑需 **二次确认**：`unblockCopy = '解除拉黑后，你们需要重新双向心动才能再次申请交换微信'` |
| R6 | 黑名单项：`{ id, name, avatar, district, reason, blockedAt }`，按时间倒序 |

**种子黑名单**：郑小暖（id 4，恶意骚扰）、温以宁（id 8，广告导流）

#### 5.7.3 举报系统

**7 类举报原因**（`REPORT_REASONS`）

| value | 图标 | 标题 | 分类 | 女性优先 |
|---|---|---|---|---|
| `fake_realname` | 🪪 | 虚假实名 | fake | — |
| `fake_education` | 🎓 | 虚假学历 | fake | — |
| `fake_work` | 🏢 | 虚假工作 | fake | — |
| `harassment` | 💬 | 恶意骚扰 | harassment | ✅ |
| `fraud` | 💰 | 诱导转账 | fraud | ✅ |
| `porn` | 🔞 | 色情导流 | porn | ✅ |
| `ad` | 📢 | 广告营销 | ad | — |

**审核时效（`AUDIT_SLA`）**

| 场景 | 时效 |
|---|---|
| AI 初审 | **5 分钟** |
| 普通举报 | **24 小时** |
| 女性用户举报骚扰/欺诈/色情类 | **12 小时** + 列表**置顶** + 「女性专属通道」横幅 |

**梯度处罚（`PENALTIES`）**

| value | 标签 | level | 说明 |
|---|---|---|---|
| `remove` | 下架内容 | 1 | 删除违规动态 / 评论 |
| `ban_post` | 禁发 7 天 | 2 | 7 天内不可发布动态与评论 |
| `limit_match` | 限制匹配 | 3 | 暂停推荐与心动能力 7 天 |
| `ban` | 永久封禁 | 4 | 实名信息永久拉黑，不可再注册 |

**默认处罚映射**（`defaultPenaltyOf`）
- `fraud` / `porn` → `ban`
- `harassment` → `ban_post`
- 其它 → `remove`

**举报状态（`REPORT_STATUS`）**

| status | 文案 |
|---|---|
| `ai` | AI 初审中 |
| `pending` | 人工审核中 |
| `done` | 已处理 |
| `rejected` | 未通过 |

**举报数据结构**

```js
{
  id: String,             // 'rep_1'
  targetId, targetName,
  reason: String,         // REPORT_REASONS.value
  reasonLabel: String,
  category: String,       // fake | harassment | fraud | porn | ad
  desc: String,           // 用户补充描述
  images: String[],       // 证据截图
  createdAt: Number,
  status: String,         // ai | pending | done | rejected
  priority: String,       // female | normal
  deadlineAt: Number,     // SLA 截止时间
  result: String,         // punished | rejected | ''
  penalty: String,        // PENALTIES.value
  handledAt: Number,
  appeal: { reason, at, status } | null
}
```

**举报页（`pages/common/report`）流程**

```
选原因（7 类，女性优先类带 12h 徽标）
 → 填描述 + 上传证据截图
 → 展示 4 条承诺（不泄露举报人 / 优先处理 / 有结果必告知 / 恶意举报同样受罚）
 → 二次确认弹窗
 → 提交 → redirect 到 pages/common/myReports
```

**我的举报（`pages/common/myReports`）**
- 概览三格：全部 / 处理中 / 已处理
- 女性通道横幅（女性用户且存在 `priority: 'female'` 记录时）
- 报告卡片：原因、描述、证据缩略图、状态 pill、剩余时效、处罚措施
- 已处理且 `result === 'punished'` → 展示「申诉」按钮（`APPEAL_REASONS` 4 条，走 `uni.showActionSheet`，**必须传 `fail: () => {}`**）

#### 5.7.4 反作弊与降权

| # | 规则 |
|---|---|
| R1 | 初始风控分 `RISK_BASE = 100` |
| R2 | 命中风控事件扣分，累积计算 |
| R3 | 风控分 **< 60** → 进入**降权**状态 |
| R4 | 降权账号**不再被推荐给女性用户** |
| R5 | 风控分 ≥ 90 → 显示「账号状态良好」 |

**风控事件（`RISK_EVENTS`）**

| key | 扣分 | 说明 |
|---|---|---|
| `high_frequency_like` | −20 | 24 小时内批量心动 |
| `cross_ip` | −15 | 频繁跨 IP 登录 |
| `blank_profile` | −25 | 空白资料高频申请 |
| `keyword_funnel` | −30 | 导流关键词命中 |
| `device_multi_account` | −40 | 同设备多账号 |

#### 5.7.5 账号与安全 / 注销（`pages/profile/account`）

**注销规则（`DEACTIVATION_RULES`，页面原文展示）**

```
1. 提交后账号立即冻结，个人资料全部脱敏（昵称、头像、动态、相册）
2. 手机号即时释放，可用于重新注册新账号
3. 实名信息留存 180 天后自动销毁，期间仅用于风控与司法配合
4. 同一身份证 180 天内不可再次实名，防止反复注册骚扰他人
5. 被永久封禁的账号不支持注销后重新注册
```

**注销流程**

```
点「注销账号」
 → 共情弹窗（deactivationCopy）
     title: 确定要离开吗
     content: 注销后你的资料将被安全清除，缘分虽短，感谢相遇。确定要离开吗？
     确认: 确认注销    取消: 再想想
 → applyDeactivation()
     status: 'done'
     effectiveAt: 立即
     phoneReleasedAt: 立即
     realnamePurgeAt: now + 180 天
     idLockUntil: now + 180 天
 → 页面切换为「已注销」状态：
     手机号已释放 · 可立即重新注册
     实名信息留存至 YYYY-MM-DD
     身份证 N 天后解锁
```

**重新注册拦截**：`canRealnameWithId()` 在 `idLockUntil` 未到期时拒绝，提示
```
businessCopy.duplicateRealName  // 一个身份证仅能认证一个账号，如需帮助请联系客服
```

**页面四段**：账号信息（手机号/注册时间/用户 ID）、安全状态、风控记录（风控分/降权标签）、处罚卡（处罚类型/到期时间/原因）。

---

### 5.8 M9 · 全局收口

M9 不新增业务功能，只解决"全局一致性"问题。

| # | 收口项 | 实现 |
|---|---|---|
| R1 | **城市 24h 生效** | `user.state.cityChange = { from, to, at }`；`matchCity` getter 在 24h 内返回 `from`；匹配页 / 广场统一消费 `matchCity` |
| R2 | **全页安全徽章** | `SafetyBadge.vue` + `CustomNavbar` 的 `safetyBadge` prop |
| R3 | **统一文案库** | 所有空态 / 错误 / 引导文案取自 `businessCopy` / `emptyCopy` |
| R4 | **弱网兜底** | `uni.onNetworkStatusChange` → toast `businessCopy.weakNetwork` |
| R5 | **异常兜底** | `uni.onError` → toast `businessCopy.systemError` |
| R6 | **广场同步城市** | 广场 `onShow` 调 `square.syncCity(userStore.matchCity)`，重算每条动态的 `crossCity` |
| R7 | **举报入口可见性** | 通知页新增 `view_reports` 路由；设置页展示处理中条数 |

**城市切换规则细节**

| # | 规则 |
|---|---|
| 1 | 城市**只能手动填写**，不取实时 GPS |
| 2 | 切换后有 **24 小时冷却**，冷却期内匹配 / 广场仍按**旧城市**计算 |
| 3 | `profile.city` 存的是**最新填写值**，`matchCity` 才是**生效值** |
| 4 | 冷却期内匹配页顶部显示提示条：`城市已改为 X，24 小时后生效 · 期间仍按 Y 匹配` |
| 5 | 与当前生效城市相同 → 返回 `{ ok: true, changed: false }`，不触发冷却 |
| 6 | 空值 → 返回 `{ ok: false, reason: 'empty' }` |
| 7 | 城市名尾部「市」字会被自动去除 |

**调试专用**：`userStore.advanceCityChange()` 把 `at` 拨到 24 小时前，用于测试"已生效"状态。

---

## 第 6 章 数据契约总表

> 本章是**后端接口开发的直接依据**。所有结构均来自现有 mock 与 store 的真实形状。

### 6.1 User（用户）

```js
{
  // ---- 基础 ----
  id: Number,                  // 种子用户 1–14；当前用户 10000
  name: String,                // 昵称
  gender: 'male' | 'female',
  age: Number,
  birthYear: String,           // '98'
  height: Number,              // cm
  weight: Number,              // kg
  constellation: String,       // '巨蟹座'
  education: String,           // '本科'
  career: String,              // '互联网产品经理'
  occupation: String,          // '教师'
  avatar: String,              // URL
  district: String,            // '朝阳区'
  city: String,                // '北京市'（生效城市）
  hometown: String,            // '天津'
  income: String,              // '15-20W'
  ipLocation: String,          // '北京市'

  // ---- 内容 ----
  bio: String,
  matchSlogan: String,         // 契合点文案
  weekendTags: String[],
  hobbyTags: String[],
  personalityTags: String[],
  lifeTags: String[],          // ['无车','一房','不吸烟','不喝酒']
  expectTags: String[],        // 择偶期待
  album: String[],             // 生活相册，6 张

  // ---- 认证 ----
  auth: { realName: Boolean, education: Boolean, work: Boolean },

  // ---- 展示 ----
  showMedals: [{ name, icon, type: 'gold'|'blue' }],
  maritalStatus: String,       // '未婚'
  hasCompletedTest: Boolean,   // 是否完成人生剧本三观测试

  // ---- 结构化资料 ----
  lifeScript: { name, desc, tags: String[] },   // 人生剧本
  values: { love, consume, life }               // 三观态度

  // ---- 后端需新增 ----
  privacyPolicy: { allowWechatApply, onlyDoubleVerified, ageGap }  // 见 6.7
}
```

**种子数据事实表**（写测试时直接用 —— 以下为当前代码的**真实数据**）

| id | 姓名 | 性别 | 年龄 | 身高 | 区县 | 城市 | 认证（实名/学历/工作） |
|---|---|---|---|---|---|---|---|
| 1 | 林小鹿 | 女 | 24 | 165 | 朝阳区 | **北京市** | ✅ / ✅ / — |
| 2 | 陈橘子 | 女 | 26 | 168 | 浦东新区 | 上海市 | ✅ / ✅ / ✅ |
| 3 | 吴晴天 | 女 | 25 | 162 | 西湖区 | 杭州市 | ✅ / ✅ / ✅ |
| 4 | 郑小暖 | 女 | 23 | 158 | 锦江区 | 成都市 | —（**种子黑名单**） |
| 5 | 苏念安 | 女 | 27 | 170 | 海淀区 | **北京市** | ✅ / ✅ / ✅ |
| 6 | 夏知意 | 女 | 24 | 163 | 天河区 | 广州市 | — |
| 7 | 顾清和 | 女 | 28 | 166 | 福田区 | 深圳市 | ✅ / ✅ / — |
| 8 | 温以宁 | 女 | 25 | 160 | 武侯区 | 成都市 | —（**种子黑名单 + 仅双认证**） |
| 9 | 沈星野 | 女 | 29 | 172 | 杨浦区 | 上海市 | ✅ / ✅ / ✅ |
| 10 | 许一诺 | 女 | 22 | 156 | 洪山区 | 武汉市 | ✅ / — / — |
| 11 | 叶南乔 | 女 | 27 | 167 | 南山区 | 深圳市 | ✅ / ✅ / —（**仅双认证**） |
| 12 | 白露微 | 女 | 30 | 164 | 南开区 | 天津市 | ✅ / ✅ / ✅ |
| 13 | 江小满 | 女 | 26 | 166 | 东城区 | **北京市** | ✅ / — / ✅ |
| 14 | 温言 | 女 | 25 | 163 | 西城区 | **北京市** | ✅ / ✅ / ✅ |
| **10000** | **顾行舟** | **男** | **28** | **178** | **朝阳区** | **北京市** | ✅ / — / — |

> **重要事实**：`mock/users.js` 中 **14 位种子用户全部为女性**，当前登录用户为男性。因此"性别切换"到女性视角时匹配池会为空（用于验证空态），这是**预期行为**，不是 bug。
> 北京同城用户只有 4 位：**1 / 5 / 13 / 14**（写"同城筛选"相关测试时以这 4 位为准）。
> 当前用户完整资料：178cm / 70kg / 天秤座 / 本科 / 后端工程师 / 北京 / 25-35W / 跑步·烹饪·摄影 / id 10000。

### 6.2 Match（双向匹配）

```js
{
  userId: Number,              // 对方 id
  matchedAt: Number,           // 匹配时间戳
  wechatStatus: 'none' | 'pending' | 'agreed',
  commonTags: String[]         // 共同标签，最多 3 个
}
```

### 6.3 Application（微信交换申请）

```js
{
  id: String,                  // 'app_{ts}_{userId}'
  fromUserId: Number,
  toUserId: Number,
  direction: 'in' | 'out',      // in = 我收到的，out = 我发出的
  status: 'pending' | 'agreed' | 'rejected' | 'expired' | 'auto_rejected',
  message: String,              // ≤20 字
  createdAt: Number,
  expiresAt: Number,            // createdAt + 3 天
  handledAt: Number             // 0 表示未处理
}
```

### 6.4 Notification（通知）

```js
{
  id: Number,                   // 种子 101–110，运行时从 200 起自增
  kind: String,                 // 16 种之一，见 5.6.1
  title: String,
  desc: String,
  createdAt: Number,
  read: Boolean,
  actionText: String,           // 按钮文案，如「去看看」「去实名」
  actionType: String,           // 点击行为，见 5.6.1 路由表
  targetId: Number | null,      // 关联用户 / 动态 id
  targetName: String            // 关联用户昵称（用于文案拼接）
}
```

### 6.5 Equity（权益）

```js
{
  day: 'YYYY-MM-DD',            // 额度所属日期
  browseUsed: Number,
  browseBonus: Number,          // 次日加赠浏览额度
  pendingBonus: Number,         // 待生效加赠
  likeUsed: Number,
  likeTotal: Number,            // 3（男）/ 5（女）
  permanentLikes: Number,
  exposureCards: Number,
  records: [{ id, type, scene, title, amount, time }],   // ≤50 条
  bonusClaimedDay: String,
  qualityWeek: 'YYYY-MM-DD',    // 本周周一日期
  qualityCount: Number
}
```

### 6.6 Privacy（隐私 + 黑名单）

```js
{
  dynamicScope: 'all' | 'matched' | 'self',
  allowWechatApply: Boolean,
  autoRejectEnabled: Boolean,
  autoRejectHours: Number,      // 默认 24
  onlyDoubleVerified: Boolean,
  ageGap: 0 | 3 | 5 | 8,
  showInRecommend: Boolean,
  hideFields: ('height'|'occupation'|'district'|'album')[],

  blacklist: [{
    id: Number, name: String, avatar: String,
    district: String, reason: String, blockedAt: Number
  }]
}
```

### 6.7 Report（举报）与 Penalty（处罚）

举报结构见 5.7.3。处罚：

```js
penalties: {
  code: '' | 'remove' | 'ban_post' | 'limit_match' | 'ban',
  level: 0–4,
  until: Number,      // 到期时间戳；ban 为永久
  reason: String
}
```

### 6.8 Invite（邀请）

```js
{
  code: String,
  invitedBy: String | null,
  inviteeRewarded: Boolean,
  inviterRewarded: Boolean,
  shareCount: Number,
  records: [{ userId, name, avatar, joinedAt, realnameAt }]
}
```

### 6.9 建议的后端接口清单

> 按现有 store action 一一对应，实施时可直接照此建路由。

#### 用户与认证

| 方法 | 路径 | 对应 action | 说明 |
|---|---|---|---|
| POST | `/auth/login` | `user.loginMock()` | 微信 code 换 token |
| GET | `/me` | `user.restore()` | 拉当前用户 |
| PATCH | `/me/profile` | `user.updateProfile()` | 改资料 |
| PUT | `/me/city` | `user.changeCity()` | 改城市（返回生效时间） |
| POST | `/me/realname` | — | 实名认证提交 |
| POST | `/me/certification/:type` | `user.submitCertification()` | type = education/work |
| POST | `/me/certification/:type/appeal` | `user.appealCertification()` | 申诉 |
| GET | `/users/recommend` | `mock/users.js` | 推荐池（支持筛选参数） |
| GET | `/users/:id` | `findUserById()` | 用户详情 |
| GET | `/users/:id/privacy-policy` | `mockTargetPolicy()` | **对方隐私策略** |

#### 额度与权益

| 方法 | 路径 | 对应 action |
|---|---|---|
| GET | `/me/equity` | `equity.init()` |
| POST | `/me/equity/browse/consume` | `equity.consumeBrowse()` |
| POST | `/me/equity/like/consume` | `equity.consumeLike()` |
| POST | `/me/equity/completeness-bonus` | `equity.claimCompletenessBonus()` |
| POST | `/me/equity/exposure-card/use` | `equity.useExposureCard()` |

#### 匹配与申请

| 方法 | 路径 | 对应 action |
|---|---|---|
| GET | `/matches` | `match.restore()` |
| POST | `/matches` | `match.createMatch()` |
| GET | `/applications` | `match.restore()` |
| POST | `/applications` | `match.applyWechat()` |
| POST | `/applications/:id/agree` | `match.agreeApplication()` |
| POST | `/applications/:id/reject` | `match.rejectApplication()` |
| GET | `/matches/check-apply/:userId` | `match.canApplyWechat()` |

#### 动态

| 方法 | 路径 | 对应 action |
|---|---|---|
| GET | `/dynamics?tab=recommend&city=` | `square.recommendFeed` |
| GET | `/dynamics?tab=like` | `square.likeFeed` |
| GET | `/dynamics/:id` | `square.detailOf()` |
| POST | `/dynamics` | `square.publish()` |
| DELETE | `/dynamics/:id` | `square.removeDynamic()` |
| POST | `/dynamics/:id/like` | `square.toggleLike()` |
| POST | `/dynamics/:id/comments` | `square.addComment()` |

#### 通知

| 方法 | 路径 | 对应 action |
|---|---|---|
| GET | `/notifications?tab=` | `notify.listOf()` |
| POST | `/notifications/:id/read` | `notify.markRead()` |
| POST | `/notifications/read-all` | `notify.markAllRead()` |
| GET | `/notifications/unread-count` | `notify.unreadCount` |

#### 隐私与风控

| 方法 | 路径 | 对应 action |
|---|---|---|
| GET | `/me/privacy` | `privacy.restore()` |
| PATCH | `/me/privacy` | `privacy.toggle/setScope/...` |
| GET | `/me/blacklist` | `privacy.blacklistList` |
| POST | `/me/blacklist` | `privacy.blockUser()` |
| DELETE | `/me/blacklist/:id` | `privacy.unblockUser()` |
| POST | `/reports` | `risk.submitReport()` |
| GET | `/reports` | `risk.sortedReports` |
| POST | `/reports/:id/appeal` | `risk.appealReport()` |
| GET | `/me/risk` | `risk.riskScore` |
| POST | `/me/deactivate` | `risk.applyDeactivation()` |

#### 邀请

| 方法 | 路径 | 对应 action |
|---|---|---|
| GET | `/invite` | `invite.restore()` |
| POST | `/invite/bind` | `invite.bindInviter()` |
| POST | `/invite/share` | `invite.logShare()` |

---

## 第 7 章 核心状态机

### 7.1 微信交换申请

**状态流转表**

| 当前状态 | 触发事件 | 下一状态 | 副作用 |
|---|---|---|---|
| （无申请） | `applyWechat()` 且通过全部校验 | `pending` | 写入 `applications`；`match.wechatStatus = 'pending'`；通知对方 |
| `pending` | 对方点「同意」 | `agreed` | `handledAt` 赋值；`wechatStatus = 'agreed'`；双方可见微信号 |
| `pending` | 对方点「婉拒」 | `rejected` | `handledAt` 赋值；`wechatStatus` 回退 `none` |
| `pending` | 超过 `expiresAt`（3 天） | `expired` | `expireCheck()` 在进入相关页面时触发；`wechatStatus` 回退 `none` |
| `pending` | 超过接收方自动拒绝时限（默认 24h） | `auto_rejected` | `autoRejectCheck()` 在 `onShow` 触发；通知发起方 `pushAutoRejected` |

**禁止流转（拦截，不报错只提示）**

| 场景 | 拦截原因 |
|---|---|
| 双方未形成双向匹配 | `not_matched` |
| `wechatStatus === 'agreed'` | `agreed`（永久不可再申请） |
| 已有 `pending` 且未过期 | `pending`（展示剩余倒计时） |
| 距上次申请 < 7 天 | `cooldown`（展示剩余天数） |

**状态与 `match.wechatStatus` 的联动**

| application.status | match.wechatStatus |
|---|---|
| 无申请 | `none` |
| `pending` | `pending` |
| `agreed` | `agreed` |
| `rejected` / `expired` / `auto_rejected` | 回退为 `none` |

**线性表达**

```
（无申请） --applyWechat--> pending
pending --对方同意--> agreed  [终态]
pending --对方拒绝--> rejected --7天冷却--> 可再次申请
pending --3天到期--> expired --7天冷却--> 可再次申请
pending --24h未处理--> auto_rejected --7天冷却--> 可再次申请
agreed --(不可逆)--> 永久不可再申请
```

### 7.2 资质认证（学历 / 工作）

**状态流转表**

| 当前状态 | 触发事件 | 下一状态 | 副作用 |
|---|---|---|---|
| `idle` | 提交认证（凭证必填） | `pending` | 记录 `method` / `credential` / `submittedAt` |
| `pending` | 运营审核通过 | `success` | `authStatus[type] = true`；首次发放 **+5 永久心动**；推送 `cert_pass` 通知 |
| `pending` | 运营驳回 | `failed` | 记录 `reason`，页面展示供用户修正 |
| `pending` | 超时未审 | `pending` | 保持不动（MVP 无超时逻辑，接后端后需加） |
| `failed` | 用户点「申诉」 | `pending` | 清空 `reason`，重置 `submittedAt` |

**线性表达**

```
idle --提交凭证--> pending --通过--> success  [终态：点亮徽章 + 首次 +5 永久心动]
pending --驳回--> failed --申诉--> pending
```

> 奖励只在**首次**通过时发放，由 `certRewarded[type]` 保证不重复。驳回后重新通过不会二次发放。

### 7.3 举报

**状态流转表**

| 当前状态 | 触发事件 | 下一状态 | 说明 |
|---|---|---|---|
| — | 用户提交举报 | `ai` | AI 初审中，SLA **5 分钟** |
| `ai` | AI 初审通过 | `pending` | 进入人工审核；SLA 普通 **24h** / 女性优先 **12h** |
| `ai` | AI 判定明显无效 | `rejected` | `result = 'rejected'` |
| `pending` | 人工核实成立 | `done` | `result = 'punished'`，下发梯度处罚，推送 `report_result` |
| `pending` | 人工判定不成立 | `rejected` | `result = 'rejected'` |
| `done` | 用户申诉 | `done` | 写入 `appeal = { reason, at, status }`，**不改变主状态** |

**线性表达**

```
提交 --→ ai（5min） --→ pending（24h / 女性 12h） --成立→ done（result=punished，下发处罚）
                                            --不成立→ rejected
done --申诉--> done（追加 appeal 记录，主状态不变）
```

> `deadlineAt` 由提交时按优先级计算：`priority === 'female'` 用 12h，否则 24h。列表按「女性优先置顶 + 时间倒序」排序。

### 7.4 账号状态

**三个正交的账号维度**

账号状态不是单一枚举，而是三个可同时存在的维度：

| 维度 | 取值 | 判定 | 影响 |
|---|---|---|---|
| 风控降权 | `deprioritized` / 正常 | `riskScore < 60` | 不再推荐给女性用户；匹配页顶部横幅 |
| 处罚 | `normal` / `restricted` / `banned` | `penalties.code` + `until > now` | 禁发 / 限匹配 / 永久封禁；个人中心安全状态外显 |
| 注销 | `active` / `done` | `deactivation.status` | 资料脱敏、手机号释放、实名留存 180 天 |

**处罚状态流转**

| 当前 | 触发 | 下一 | 说明 |
|---|---|---|---|
| `normal` | 运营下发处罚 | `restricted` | `ban_post` / `limit_match`，`until` 到期自动恢复 |
| `normal` / `restricted` | 运营下发永久封禁 | `banned` | `code = 'ban'`，不可恢复 |
| `restricted` | `until` 到期 | `normal` | `penaltyActive` 变 `false` |

**注销状态流转**

| 当前 | 触发 | 下一 | 副作用 |
|---|---|---|---|
| `active` | 提交注销 | `done` | 账号冻结、资料脱敏、**手机号即时释放**、`realnamePurgeAt = now+180天`、`idLockUntil = now+180天` |
| `done` | 180 天后 | `done` | 身份证锁定自动解除（由 `idLockRemainDays` 计算为 0） |
| `done` | 用户用同一身份证重新实名 | **被拦截** | `canRealnameWithId()` 返回 `false` → `businessCopy.duplicateRealName` |

**线性表达**

```
normal --风控分<60--> deprioritized --风控分回升--> normal
normal --下发禁发/限匹配--> restricted --到期--> normal
normal|restricted --永久封禁--> banned  [不可恢复，且不支持注销后重新注册]
active --提交注销--> done --手机号立即可用--> 可重新注册新账号
done --180天内用同一身份证实名--> 拦截（duplicateRealName）
done --180天后--> 身份证解锁
```

### 7.5 城市切换

**字段语义**

| 字段 | 含义 |
|---|---|
| `profile.city` | 用户**最新填写**的城市 |
| `cityChange.from` | 切换前的**生效城市** |
| `cityChange.to` | 目标城市 |
| `cityChange.at` | 切换申请时间戳 |
| `matchCity`（getter） | **生效城市**：`now - at < 24h` 时返回 `from`，否则返回 `profile.city` |
| `cityChangeRemainHours` | 剩余生效小时数，`0` 表示已生效或无切换 |
| `cityPending` | 存在待生效切换时返回 `{ from, to, hours }`，否则 `null` |

**流转表**

| 阶段 | 时长 | `profile.city` | `matchCity` | 页面表现 |
|---|---|---|---|---|
| 初始 | — | A | A | 正常 |
| 刚切换 | 0 → 24h | B | **A** | 匹配页顶部提示条；广场 `crossCity` 仍按 A 计算 |
| 已生效 | > 24h | B | **B** | 提示条消失；`square.syncCity(B)` 重算 `crossCity` |

**边界处理**

| 输入 | 返回 |
|---|---|
| 空字符串 | `{ ok: false, reason: 'empty' }` |
| 与当前生效城市相同 | `{ ok: true, changed: false }`（不触发冷却） |
| 带「市」后缀（如「上海市」） | 自动去除后缀后再比较与存储 |

**调试**：`userStore.advanceCityChange()` 把 `at` 拨到 24 小时前，立即进入「已生效」状态。

---

## 第 8 章 调试与测试

### 8.1 开发者调试面板（`pages/test/debug`）

**入口**：直接访问 `#/pages/test/debug`。**上线前必须从 `pages.json` 移除该路由。**

**12 张调试卡**

| # | 卡片 | 能力 |
|---|---|---|
| 1 | 当前身份 | 显示 level / 性别 / 认证状态 |
| 2 | 切换权限层级 | 游客 / 注册未实名 / 已实名 一键切换 |
| 3 | 切换性别 | 男 / 女视角（影响心动额度、通知推送、保护规则） |
| 4 | 额度状态 | 重置额度、发放 5 次永久心动 |
| 5 | 匹配与微信交换 | 与陈橘子双向匹配、补足卡片池、重置匹配数据 |
| 6 | 动态广场 | 补跨城内容、标记优质动态、模拟 4 天无匹配、屏蔽评论用户、重置动态 |
| 7 | 个人中心与权益 | 收藏全部、发放曝光卡 |
| 8 | 学历 / 工作认证 | 双认证点亮（+10 永久心动）、学历置为驳回、重置认证 |
| 9 | 通知与裂变 | 模拟心动/双向匹配/收到申请/收到点赞/收到评论、推额度提醒、全部已读、模拟好友加入/实名、重置通知 |
| 10 | 隐私与风控 | 拉黑用户、提交举报、拨快自动拒绝时间、推进审核、注入风控事件、下发禁发 7 天、恢复账号、重置 |
| 11 | 城市生效与全局文案 | 改为上海、拨快 24h、清除城市记录、弱网提示、异常提示、安抚文案预览 |
| 12 | 本地数据 | 清空全部本地缓存 / 恢复初始状态 |

### 8.2 本地运行

```bash
cd SocialAPP

# 开发（H5，默认 3300 端口）
npm run dev:h5           # 访问 http://[::1]:3300/

# 构建验证
npm run build:h5         # 产物在 dist/build/h5，成功标志 "DONE Build complete."

# 微信小程序
npm run dev:mp-weixin    # 用微信开发者工具打开 dist/dev/mp-weixin
```

**注意**：
- vite 只绑 IPv6 → 用 `http://[::1]:3300/`，不是 `localhost`
- 本地有代理时 curl 要加 `--noproxy "*"`
- dev server 必须以后台任务启动，不能管道到 `head`（会被 SIGPIPE 杀掉）

### 8.3 端到端验证方法

项目使用 `puppeteer-core` + 本地 Chrome 做 DOM 断言验证（脚本不入库，放在临时目录）。

**标准四步**

```
1. npx uni build -p h5                     → 产出 dist/build/h5
2. 静态服务器托管 dist/build/h5
3. Node 脚本：注入 localStorage 种子 → 打开页面 → DOM 断言 → 截图
4. 汇总 "通过 X/X，错误 0"
```

**造种子的正确姿势（关键）**

```js
// ❌ 错误：直接在当前页写 localStorage 再 reload，会被残留 store 定时器覆写
// ✅ 正确：about:blank → goto → 写入 → reload → 校验 → 不符重试 ≤4 次
async function seed(page, key, data) {
  for (let i = 0; i < 4; i++) {
    await page.goto('about:blank')
    await page.goto(BASE + '/#/pages/match/index')
    await page.evaluate((k, d) => {
      localStorage.setItem(k, JSON.stringify({ type: 'object', data: d }))
    }, key, data)
    await page.reload()
    const ok = await page.evaluate(() => /* 校验关键字段 */ true)
    if (ok) return
  }
}
```

**固定小时做时段测试**

```js
await page.evaluateOnNewDocument(() => {
  const real = Date.prototype.getHours
  Date.prototype.getHours = function () { return 21 }   // 固定为 21 点
})
```

### 8.4 各模块验证成绩（历史记录）

| 模块 | 断言数 | 结果 | 截图 |
|---|---|---|---|
| M2 异性匹配与额度 | 29 | ✅ 全通过 | — |
| M3 双向匹配与微信交换 | 37 | ✅ 全通过 | — |
| M4 同城动态广场 | 35 | ✅ 全通过 | — |
| M5 个人中心与权益 | 54 | ✅ 全通过 | — |
| M6 学历/工作认证 | 23 | ✅ 全通过 | — |
| M7 通知与裂变 | 79 | ✅ 全通过 | — |
| M8 隐私与风控 | 72 | ✅ 全通过 | 10 张 |
| M9 全局收口 | 25 | ✅ 全通过 | 8 张 |
| **合计** | **387** | **0 运行时错误** | — |

> 后续任何改动，建议至少回归：M2 额度、M3 申请状态机、M8 举报与自动拒绝、M9 城市切换四组，共约 70 项。

### 8.5 手工回归清单（10 分钟版）

| # | 步骤 | 期望 |
|---|---|---|
| 1 | 调试面板切「游客」→ 打开匹配页 | 卡片模糊 + 「注册后查看完整资料」遮罩 |
| 2 | 切「注册未实名」→ 点心动 | 弹双选项：【收藏心动】/【先去实名认证】 |
| 3 | 切「已实名」→ 连续划 10 张卡 | 第 10 张后出「今日缘分已尽…」空态 |
| 4 | 点「领取明日 +3」 | 资料完整度 ≥80% 时成功，否则提示门槛 |
| 5 | 心动一个对象直到触发匹配 | 全屏动效 + 3 条文案之一 + 共同标签 |
| 6 | 进「我的申请」→ 同意一条收到的申请 | 卡片变「已交换微信」+ 显示微信号 + 反诈提示 |
| 7 | 广场发布含「加我微信 abc123」的文案 | 拦截 + `dynamicNeedEdit` 文案 |
| 8 | 举报一条动态 → 选「恶意骚扰」 | 女性视角下带 12h 徽标，提交后跳「我的举报」 |
| 9 | 隐私设置关闭「允许他人申请微信」 | 他人视角下该用户不可申请，提示「对方关闭了微信申请通道…」 |
| 10 | 编辑资料把城市改为上海 | 提示「24 小时后生效」，匹配页出现城市待生效提示条 |

---

## 第 9 章 范围外、占位与遗留

### 9.1 明确不做（产品决策，非待办）

| 项 | 原因 |
|---|---|
| 运营后台（内容审核 / 用户管理 / 数据看板） | 属后台系统，不在 App 端范围 |
| 埋点上报与指标看板 | 需后端 + 数仓配合，MVP 不做 |
| 付费会员 / 增值服务 | 见 1.4 |
| 站内聊天 / 私信 | 见 1.4，产品级否决 |
| P1 功能与远期储备 | 见 1.4 |
| 真实定位 / GPS | 城市仅手动填写，避免精度与隐私成本 |

### 9.2 占位页（有页面、无完整逻辑）

| 页面 | 现状 | 处理建议 |
|---|---|---|
| `pages/test/script`（人生剧本测试） | ⚠️ 早期占位，无题库与结果页 | 要么补齐题库，要么从 `pages.json` 移除；匹配页已用 `hasCompletedTest` 兜住 |
| `pages/test/values`（三观态度测试） | ⚠️ 同上 | 同上 |
| `pages/user/medalWall` / `medalDetail` | ✅ 有数据渲染，但勋章获取规则未落地 | 接入后端后由服务端下发 `showMedals` |
| `pages/common/feedback` | ✅ 表单可填，提交仅 toast | 接后端 `/feedback` |
| `store/app.js` / `store/auth.js` | ⚠️ 遗留 store，**无页面引用** | 建议删除，连同 `store/index.js` 中两条 export |

### 9.3 已知技术债

| # | 问题 | 影响 | 建议 |
|---|---|---|---|
| 1 | `match.confirmLike()` 里用 `Math.random() < 0.3` 模拟对方心动 | 行为不确定，无法稳定测试 | 接入后端后删除，改为 `isMutual` 字段 |
| 2 | `mockTargetPolicy(user)` 按性别硬编码 | 不是真实用户策略 | 后端在用户资料下发 `privacyPolicy` |
| 3 | 时间类规则（3 天/7 天/24h/24h 城市）全在前端裁决 | 可被篡改本地存储绕过 | 前端保留体验层，服务端必须二次校验 |
| 4 | `dynamicScope`（动态可见范围）目前只存不改行为 | 设置项与实际可见性未打通 | 后端按 scope 过滤动态查询 |
| 5 | `showInRecommend`（推荐流展示）同上 | 开关无实际效果 | 后端在推荐接口过滤 |
| 6 | `hideFields`（隐藏资料字段）仅存值 | 他页未按此隐藏 | 后端在用户详情接口按策略脱敏 |
| 7 | `square.blockedUserIds` 与 `privacy.blacklist` 双份拉黑数据 | 可能不一致 | 统一以 `privacy.blacklist` 为准（现 `commentsOf` 已双读） |
| 8 | 全部数据在 localStorage | 换设备丢失、无多端同步 | 接后端 |
| 9 | `pages/test/*` 3 个调试路由暴露在生产包 | 安全风险 | 构建时排除或加环境判断 |
| 10 | 无 i18n（`vue-i18n` 已装但未用） | 仅中文 | 需要时再启用 |

### 9.4 建议的后续路线

| 阶段 | 内容 | 前置 |
|---|---|---|
| **P0 · 后端接入** | 按第 6.9 节建接口；store 的 `restore()` 改为 `fetch()`；`mock/` 保留为离线兜底 | 无 |
| **P0 · 清理** | 删除 `store/app.js`、`store/auth.js`、`test/*` 路由；统一拉黑数据源 | 后端接入完成 |
| **P1 · 体验优化** | 滑卡手势、图片懒加载、骨架屏细化、动效打磨 | P0 |
| **P1 · 安全加固** | 时间规则服务端化、设备指纹、异常登录检测 | P0 |
| **P2 · 运营后台** | 内容审核队列、用户管理、举报处理、优质内容标记 | P0 |
| **P2 · 数据埋点** | 关键漏斗（曝光→心动→匹配→申请→交换）上报 + 看板 | P2 后台 |

---

## 附录 A · 新会话开场提示词（可直接复制）

> 用于在**新的对话窗口**里让任意 AI 快速接手本项目，无需任何历史上下文。

```
我在做一个 uni-app（Vue 3 + Pinia + Vite）的同城异性交友 App，
代码在 D:\WorkBuddyFile\2026-11-11-16-32-36\SocialAPP，
完整的功能规划与实现契约在 D:\WorkBuddyFile\2026-11-11-16-32-36\MVP阶段功能规划V7.md。

请先完整读一遍这份 V7 文档，然后回答我的问题 / 执行我的需求。
关键约束（文档里都有，这里强调一下）：
1. 只做前端页面，不做后端接口，数据全部来自 src/mock/，用本地存储持久化。
2. 三级权限 guest / registered / certified，由 store/user.js 的 level getter 推导，
   门禁统一走 composables/usePermission.js，不要自己写 if。
3. 所有空态 / 错误 / 引导文案必须取自 src/mock/copy.js，禁止自定义负面文字。
4. 不提供任何站内聊天。
5. Pinia getter 不能与 state 键同名；uni.setTabBarBadge / showActionSheet / showModal
   必须传 { success, fail } 回调。
6. 改完必须能通过 npm run build:h5。

我的需求是：<在这里写你的需求>
```

## 附录 B · 文件索引（按关注点）

| 你想改… | 看这些文件 |
|---|---|
| 页面路由 / tabBar | `src/pages.json` |
| 权限规则 | `src/composables/usePermission.js` → `ACTION_RULES` |
| 额度数值 | `src/store/equity.js` 顶部常量 |
| 微信申请规则 | `src/store/match.js` 顶部常量 + `canApplyWechat` |
| 导流拦截词 | `src/store/match.js` → `CONTACT_PATTERNS` |
| 隐私选项 | `src/mock/privacy.js` |
| 举报类型 / 处罚 | `src/mock/risk.js` |
| 通知类型 | `src/mock/notifications.js` → `NOTIFY_META` |
| 任何文案 | `src/mock/copy.js` ★ |
| 全局色值 / 字号 | `src/styles/variables.scss` |
| 城市生效逻辑 | `src/store/user.js` → `matchCity` / `changeCity` / `advanceCityChange` |
| 造测试数据 | `src/mock/*.js` 的 `seed*()` 函数 |
| 调试入口 | `src/pages/test/debug.vue` |

## 附录 C · 关键常量速查

```js
// 额度
DAILY_BROWSE_TOTAL   = 10      // 每日浏览
DAILY_LIKE_MALE      = 3       // 男性每日心动
DAILY_LIKE_FEMALE    = 5       // 女性每日心动
COMPLETENESS_BONUS   = 3       // 资料完整度奖励浏览次数
COMPLETENESS_THRESHOLD = 80    // 奖励门槛（%）
QUALITY_WEEKLY_LIMIT = 2       // 优质推荐每周次数
QUALITY_REWARD_LIKES = 3       // 优质动态奖励永久心动

// 认证 / 邀请
CERT_REWARD_LIKES    = 5       // 单项认证奖励
INVITE_REWARD_LIKES  = 5       // 邀请双方各得

// 微信交换
APPLY_VALID_DAYS     = 3       // 申请有效期（天）
APPLY_COOLDOWN       = 7 天     // 同对象冷却期
MESSAGE_MAX_LEN      = 20      // 申请留言上限

// 风控
AUDIT_SLA.ai         = 5 分钟
AUDIT_SLA.normal     = 24 小时
AUDIT_SLA.female     = 12 小时
RISK_BASE            = 100
RISK_THRESHOLD       = 60      // 低于则降权

// 其它
SAME_CITY_MIN        = 5       // 同城动态冷启动阈值
MAX_LIST (notify)    = 60      // 通知列表上限
records (equity)     ≤ 50      // 权益流水上限
MAX_IMAGES (publish) = 9       // 发布图片上限
maxlength (comment)  = 60      // 评论字数上限
QUOTA_REMIND_HOURS   = [9, 20] // 额度提醒时间点（仅男性）
CITY_EFFECT_HOURS    = 24      // 城市切换生效延迟
DEACTIVATION_KEEP    = 180 天   // 实名信息留存 / 身份证锁定
```

---

**文档结束**

> 本文档由已完成代码反向校准生成，任何与代码冲突的地方**以代码为准**，并请回写本文档。
> 版本：V7 ｜ 覆盖范围：阶段 0 + M2–M9 ｜ 页面 34 个 ｜ Store 11 个 ｜ Mock 模块 11 个 ｜ 验证断言 387 项
