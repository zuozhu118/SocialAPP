/**
 * 个人中心社交关系 mock
 * 说明：
 * - 我喜欢的 / 喜欢我的：对应 3.3 心动关系，未实名用户只能「收藏心动」
 * - 今日关注：对应 3.9 缘分足迹，口径 = 当日真实主页浏览 + 未实名暂存心动，禁止虚标
 * 接入后端时只需把本文件替换为接口返回，store 与页面无需改动。
 */

const MIN = 60 * 1000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

const now = Date.now()

/**
 * 我发出的心动（我喜欢的）
 * mutual = 对方也心动了我 → 已双向匹配
 */
export const seedMyLikes = () => [
    { userId: 1, likedAt: now - 2 * HOUR, mutual: true },
    { userId: 5, likedAt: now - 1 * DAY, mutual: false },
    { userId: 13, likedAt: now - 3 * DAY, mutual: false },
    { userId: 3, likedAt: now - 5 * DAY, mutual: false },
    { userId: 7, likedAt: now - 9 * DAY, mutual: true },
    { userId: 10, likedAt: now - 12 * DAY, mutual: false }
]

/**
 * 喜欢我的
 * stored = true 表示对方未实名，心动只能暂存（不推送通知，但计入缘分足迹）
 */
export const seedLikesMe = () => [
    { userId: 2, likedAt: now - 40 * MIN, mutual: false, stored: true },
    { userId: 14, likedAt: now - 3 * HOUR, mutual: false, stored: true },
    { userId: 9, likedAt: now - 1 * DAY, mutual: false, stored: false },
    { userId: 4, likedAt: now - 2 * DAY, mutual: false, stored: true },
    { userId: 12, likedAt: now - 6 * DAY, mutual: true, stored: false }
]

/**
 * 今日真实主页浏览过我的人（仅用于「今日关注」计数，不向用户泄露任何访客信息）
 */
export const seedTodayViews = () => [1, 5, 13, 2]

/**
 * 缘分足迹兜底文案（数字为 0 时展示，避免「今日有 0 位」的负面观感）
 */
export const footprintEmptyText = '今天暂时还没有同城 TA 路过，发条动态让更多人看到你'
