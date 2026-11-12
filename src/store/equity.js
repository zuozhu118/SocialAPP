import { defineStore } from 'pinia'
import { todayStr } from '@/mock/index'

const STORAGE_KEY = 'equity_v2'

// 每日基础额度（硬性规则，见文档 3.3.2）
export const DAILY_BROWSE_TOTAL = 10
export const DAILY_LIKE_MALE = 3
export const DAILY_LIKE_FEMALE = 5
// 浏览额度耗尽后，资料完整度达标可获得的次日奖励
export const COMPLETENESS_BONUS = 3
export const COMPLETENESS_THRESHOLD = 80
// 优质惊喜推荐：每周最多触发次数
export const QUALITY_WEEKLY_LIMIT = 2

const readCache = () => {
    try {
        return uni.getStorageSync(STORAGE_KEY) || null
    } catch (e) {
        return null
    }
}

const writeCache = (data) => {
    try {
        uni.setStorageSync(STORAGE_KEY, data)
    } catch (e) {
        console.warn('[equity] 本地缓存失败', e)
    }
}

// 生成指定日期的 yyyy-m-d（额度按自然周统计优质推荐触发次数）
const dateStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// 周一为一周起点
const weekKey = () => {
    const d = new Date()
    const offset = (d.getDay() + 6) % 7
    const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - offset)
    return dateStr(monday)
}

const now = () => {
    const d = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

let recordSeed = 1

/**
 * 权益 / 额度状态
 * - 浏览额度：所有实名用户每日 10 次，0 点重置
 * - 心动额度：男性 3 次/日、女性 5 次/日，0 点重置
 * - 消耗优先级：先扣当日额度，当日耗尽后自动扣永久心动次数
 */
export default defineStore('equity', {
    state: () => ({
        day: todayStr(),
        // 浏览
        browseUsed: 0,
        browseBonus: 0,        // 次日加赠浏览额度
        pendingBonus: 0,       // 待生效的加赠（0 点后计入 browseBonus）
        // 心动
        likeUsed: 0,
        likeTotal: DAILY_LIKE_MALE,
        // 永久资产
        permanentLikes: 0,
        exposureCards: 1,
        // 权益记录时间轴
        records: [],
        // 是否已领取过"完善资料加赠"
        bonusClaimedDay: '',
        // 优质惊喜推荐：本周已触发次数（硬性规则：每周最多 2 次）
        qualityWeek: weekKey(),
        qualityCount: 0
    }),

    getters: {
        browseTotal: (state) => DAILY_BROWSE_TOTAL + state.browseBonus,
        remainBrowse: (state) => Math.max(0, DAILY_BROWSE_TOTAL + state.browseBonus - state.browseUsed),
        remainLike: (state) => Math.max(0, state.likeTotal - state.likeUsed),
        // 总可用心动次数（当日 + 永久）
        totalLikeAvailable: (state) => Math.max(0, state.likeTotal - state.likeUsed) + state.permanentLikes,
        hasBrowseQuota: (state) => (DAILY_BROWSE_TOTAL + state.browseBonus - state.browseUsed) > 0,
        hasLikeQuota() {
            return this.totalLikeAvailable > 0
        },
        // 顶部双进度条文案
        quotaText() {
            return `今日剩余浏览：${this.remainBrowse}/${this.browseTotal} ｜ 今日剩余心动：${this.remainLike}/${this.likeTotal}`
        },
        // 本周剩余优质推荐次数
        qualityRemaining: (state) => {
            if (state.qualityWeek !== weekKey()) return QUALITY_WEEKLY_LIMIT
            return Math.max(0, QUALITY_WEEKLY_LIMIT - state.qualityCount)
        },
        // 权益中心资产区
        assets() {
            return {
                browse: { remain: this.remainBrowse, total: this.browseTotal },
                like: { remain: this.remainLike, total: this.likeTotal },
                permanentLikes: this.permanentLikes,
                exposureCards: this.exposureCards
            }
        }
    },

    actions: {
        // ===== 初始化 =====
        init(gender = 'male') {
            const cache = readCache()
            if (cache) {
                Object.assign(this, cache)
            }
            this.likeTotal = gender === 'female' ? DAILY_LIKE_FEMALE : DAILY_LIKE_MALE
            this.ensureToday()
            this.persist()
        },

        // ===== 跨天重置 =====
        ensureToday() {
            const today = todayStr()
            if (this.day === today) return false
            this.day = today
            this.browseUsed = 0
            this.likeUsed = 0
            this.browseBonus = this.pendingBonus
            this.pendingBonus = 0
            this.bonusClaimedDay = ''
            this.persist()
            return true
        },

        // ===== 记录 =====
        addRecord({ type = 'consume', scene = '', title = '', amount = 1 }) {
            this.records.unshift({
                id: recordSeed++,
                type,
                scene,
                title,
                amount,
                time: now()
            })
            // 记录最多保留 50 条，避免本地存储膨胀
            if (this.records.length > 50) this.records.length = 50
            this.persist()
        },

        // ===== 浏览额度 =====
        consumeBrowse(n = 1) {
            this.ensureToday()
            if (this.remainBrowse <= 0) {
                return { ok: false, reason: 'browse' }
            }
            this.browseUsed += n
            this.addRecord({ type: 'consume', scene: 'browse', title: '浏览匹配卡片', amount: n })
            return { ok: true, remain: this.remainBrowse }
        },

        // ===== 心动额度（先当日，后永久）=====
        consumeLike(n = 1) {
            this.ensureToday()
            if (this.remainLike > 0) {
                this.likeUsed += n
                this.addRecord({ type: 'consume', scene: 'like', title: '发送心动（每日额度）', amount: n })
                return { ok: true, source: 'daily', remain: this.remainLike }
            }
            if (this.permanentLikes >= n) {
                this.permanentLikes -= n
                this.addRecord({ type: 'consume', scene: 'like', title: '发送心动（永久次数）', amount: n })
                return { ok: true, source: 'permanent', remain: this.permanentLikes }
            }
            return { ok: false, reason: 'like' }
        },

        // ===== 永久心动次数 =====
        addPermanentLikes(n = 5, source = '实名认证') {
            this.permanentLikes += n
            this.addRecord({ type: 'gain', scene: 'permanent', title: source, amount: n })
            return this.permanentLikes
        },

        // ===== 同城曝光卡 =====
        addExposureCards(n = 1, source = '运营发放') {
            this.exposureCards += n
            this.addRecord({ type: 'gain', scene: 'exposure', title: source, amount: n })
        },
        useExposureCard() {
            if (this.exposureCards <= 0) return { ok: false }
            this.exposureCards -= 1
            this.addRecord({ type: 'consume', scene: 'exposure', title: '使用同城曝光卡', amount: 1 })
            return { ok: true, remain: this.exposureCards }
        },

        // ===== 额度耗尽激励：资料完整度达标，次日 +3 浏览 =====
        canClaimCompletenessBonus(completeness = 0) {
            return completeness >= COMPLETENESS_THRESHOLD && this.bonusClaimedDay !== todayStr()
        },
        claimCompletenessBonus(completeness = 0) {
            if (!this.canClaimCompletenessBonus(completeness)) return false
            this.pendingBonus += COMPLETENESS_BONUS
            this.bonusClaimedDay = todayStr()
            this.addRecord({ type: 'gain', scene: 'browse', title: '完善资料奖励（次日生效）', amount: COMPLETENESS_BONUS })
            return true
        },

        // ===== 优质惊喜推荐（每周限 2 次）=====
        canTriggerQuality() {
            if (this.qualityWeek !== weekKey()) {
                this.qualityWeek = weekKey()
                this.qualityCount = 0
                this.persist()
            }
            return this.qualityCount < QUALITY_WEEKLY_LIMIT
        },
        markQualityUsed() {
            if (this.qualityWeek !== weekKey()) {
                this.qualityWeek = weekKey()
                this.qualityCount = 0
            }
            this.qualityCount += 1
            this.addRecord({ type: 'gain', scene: 'quality', title: '触发优质惊喜推荐', amount: 1 })
            return this.qualityCount
        },

        // ===== 调试：重置额度 =====
        resetAll() {
            this.day = todayStr()
            this.browseUsed = 0
            this.browseBonus = 0
            this.pendingBonus = 0
            this.likeUsed = 0
            this.permanentLikes = 0
            this.exposureCards = 1
            this.records = []
            this.bonusClaimedDay = ''
            this.qualityWeek = weekKey()
            this.qualityCount = 0
            this.persist()
        },

        persist() {
            writeCache({
                day: this.day,
                browseUsed: this.browseUsed,
                browseBonus: this.browseBonus,
                pendingBonus: this.pendingBonus,
                likeUsed: this.likeUsed,
                likeTotal: this.likeTotal,
                permanentLikes: this.permanentLikes,
                exposureCards: this.exposureCards,
                records: this.records,
                bonusClaimedDay: this.bonusClaimedDay,
                qualityWeek: this.qualityWeek,
                qualityCount: this.qualityCount
            })
        }
    }
})
