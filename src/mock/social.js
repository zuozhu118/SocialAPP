/**
 * 个人中心社交关系 mock（v8）
 * 说明：
 * - hearts  我发出的心动：稀缺动作，扣每日额度
 * - heartsMe 心动我的：含未实名用户暂存心动
 * - followers 关注我的：0 成本弱关系
 * - todayViews 今日来访：当日真实主页浏览口径，禁止虚标
 * 硬性约束：双向心动（mutual）集合必须与 seedMatches 的 { 1, 3, 6, 11 } 一一对应，
 * 交换微信入口依赖 social.isMutual(id) + match.canApplyWechat 双保险。
 * 接入后端时只需把本文件替换为接口返回，store 与页面无需改动。
 */

const MIN = 60 * 1000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

const now = Date.now()

/**
 * 我发出的心动
 * mutual = 对方也心动了我 → 已双向匹配（可与 TA 交换微信）
 */
export const seedMyHearts = () => [
    { userId: 1, heartAt: now - 2 * HOUR, mutual: true },
    { userId: 6, heartAt: now - 20 * HOUR, mutual: true },
    { userId: 11, heartAt: now - 2 * DAY, mutual: true },
    { userId: 3, heartAt: now - 3 * DAY, mutual: true },
    { userId: 5, heartAt: now - 1 * DAY, mutual: false },
    { userId: 13, heartAt: now - 4 * DAY, mutual: false },
    { userId: 7, heartAt: now - 9 * DAY, mutual: false },
    { userId: 10, heartAt: now - 12 * DAY, mutual: false }
]

/**
 * 心动我的
 * stored = true 表示对方未实名，心动只能暂存（不推送通知，但计入缘分足迹）
 */
export const seedHeartsMe = () => [
    { userId: 3, heartAt: now - 40 * MIN, mutual: true, stored: false },
    { userId: 14, heartAt: now - 3 * HOUR, mutual: false, stored: true },
    { userId: 2, heartAt: now - 1 * DAY, mutual: false, stored: false },
    { userId: 9, heartAt: now - 2 * DAY, mutual: false, stored: true },
    { userId: 4, heartAt: now - 4 * DAY, mutual: false, stored: false },
    { userId: 12, heartAt: now - 6 * DAY, mutual: false, stored: false }
]

/**
 * 关注我的（弱关系，与心动无关）
 */
export const seedFollowers = () => [
    { userId: 14, followAt: now - 30 * MIN },
    { userId: 5, followAt: now - 5 * HOUR },
    { userId: 2, followAt: now - 1 * DAY },
    { userId: 9, followAt: now - 3 * DAY },
    { userId: 7, followAt: now - 8 * DAY }
]

/**
 * 今日真实主页浏览过我的人（仅用于「今日来访」计数，不向用户泄露任何访客信息）
 */
export const seedTodayViews = () => [1, 5, 13, 2]

/**
 * 缘分足迹兜底文案（数字为 0 时展示，避免「今日有 0 位」的负面观感）
 */
export const footprintEmptyText = '今天暂时还没有同城 TA 路过，发条动态让更多人看到你'

// 兼容旧调用名（旧版「喜欢」口径）
export const seedMyLikes = seedMyHearts
export const seedLikesMe = seedHeartsMe
