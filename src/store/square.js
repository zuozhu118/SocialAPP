import { defineStore } from 'pinia'
import useEquityStore from './equity'
import {
    dynamics as seedDynamics,
    CURRENT_CITY,
    SAME_CITY_MIN,
    formatRelativeTime
} from '@/mock/dynamics'
import { currentUserProfile } from '@/mock/users'
import { todayStr } from '@/mock/index'

const STORAGE_KEY = 'square_v1'
const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

// 优质动态奖励：运营标记后一次性发放的永久心动次数
export const QUALITY_REWARD_LIKES = 3

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
        console.warn('[square] 本地缓存失败', e)
    }
}

const seedList = () =>
    seedDynamics.map(item => ({
        ...item,
        commentList: (item.commentList || []).map(c => ({ ...c }))
    }))

// 单个动态的排序权重：置顶 > 优质加权 > 时间新鲜度
const scoreOf = (item) => {
    const hours = (Date.now() - item.createdAt) / HOUR
    const freshness = Math.max(0, 72 - hours)
    return (item.pinned ? 1000 : 0) + (item.isQuality ? 60 : 0) + freshness
}

/**
 * 动态广场状态
 * - 排序：同城优先（置顶 > 优质 > 新鲜度）→ 跨城兜底
 * - 冷启动：同城动态不足 SAME_CITY_MIN 条时，补充跨城优质动态并标「跨城」
 * - 评论分层与拉黑过滤在页面 + 本 store 协作完成
 */
export default defineStore('square', {
    state: () => ({
        seeded: false,
        // 我的常住城市（手动填写，不取实时 GPS）
        city: CURRENT_CITY,
        dynamics: [],
        likedIds: [],
        // 拉黑用户：其评论在前端过滤（完整拉黑能力在 M8 隐私与风控）
        blockedUserIds: [],
        // 首次进入广场的日期，用于「连续 N 天无匹配」安抚提示
        firstOpenDay: todayStr(),
        // 用户已手动关闭安抚提示
        comfortClosed: false
    }),

    getters: {
        // 装饰后的完整列表（时间文案 / 是否跨城 / 是否已点赞）
        all: (state) =>
            state.dynamics.map(item => ({
                ...item,
                timeLabel: formatRelativeTime(item.createdAt),
                crossCity: item.city !== state.city,
                liked: state.likedIds.includes(item.id),
                commentCount: (item.commentList || []).length
            })),

        // 同城动态（已按权重排序）
        sameCityFeed() {
            return this.all
                .filter(item => !item.crossCity)
                .sort((a, b) => scoreOf(b) - scoreOf(a))
        },

        // 跨城动态（已按权重排序）
        crossCityFeed() {
            return this.all
                .filter(item => item.crossCity)
                .sort((a, b) => scoreOf(b) - scoreOf(a))
        },

        // 冷启动兜底：同城不足时需要补充的跨城优质条数
        fallbackCount() {
            return Math.max(0, SAME_CITY_MIN - this.sameCityFeed.length)
        },

        /**
         * 推荐流：同城优先 → 跨城优质兜底 → 其余跨城
         * 每条记录带 pickedFallback 标记，页面据此渲染「跨城」徽标与兜底提示
         */
        recommendFeed() {
            const same = this.sameCityFeed
            const cross = this.crossCityFeed
            const need = Math.max(0, SAME_CITY_MIN - same.length)
            const fallback = cross.filter(item => item.isQuality).slice(0, need)
            const fallbackIds = fallback.map(item => item.id)
            const rest = cross.filter(item => !fallbackIds.includes(item.id))

            return [
                ...same.map(item => ({ ...item, pickedFallback: false })),
                ...fallback.map(item => ({ ...item, pickedFallback: true })),
                ...rest.map(item => ({ ...item, pickedFallback: false }))
            ]
        },

        // 喜欢（我点赞过的动态）
        likeFeed: (state) =>
            state.dynamics
                .filter(item => state.likedIds.includes(item.id))
                .sort((a, b) => b.createdAt - a.createdAt)
                .map(item => ({
                    ...item,
                    timeLabel: formatRelativeTime(item.createdAt),
                    crossCity: item.city !== state.city,
                    liked: true,
                    commentCount: (item.commentList || []).length
                })),

        // 我发布的动态
        myDynamics: (state) =>
            state.dynamics.filter(item => item.userId === currentUserProfile.id),

        // 距离首次进入广场的天数（连续无匹配安抚提示用）
        idleDays: (state) => {
            if (!state.firstOpenDay) return 0
            const [y, m, d] = String(state.firstOpenDay).split('-').map(Number)
            const start = new Date(y, (m || 1) - 1, d || 1).getTime()
            const now = new Date()
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
            return Math.max(0, Math.round((today - start) / DAY))
        },

        qualityCount: (state) => state.dynamics.filter(item => item.isQuality).length,

        // 单条动态（含跨城、点赞、时间装饰）
        detailOf: (state) => (id) =>
            state.dynamics
                .filter(item => item.id === id)
                .map(item => ({
                    ...item,
                    timeLabel: formatRelativeTime(item.createdAt),
                    crossCity: item.city !== state.city,
                    liked: state.likedIds.includes(item.id),
                    commentCount: (item.commentList || []).length
                }))[0] || null,

        // 评论列表：过滤被拉黑用户 + 时间装饰
        commentsOf: (state) => (id) => {
            const item = state.dynamics.find(d => d.id === id)
            if (!item) return []
            return (item.commentList || [])
                .filter(c => !state.blockedUserIds.includes(c.userId))
                .map(c => ({ ...c, timeLabel: formatRelativeTime(c.createdAt) }))
        }
    },

    actions: {
        // ===== 初始化 =====
        restore() {
            const cache = readCache()
            if (cache && cache.seeded) {
                Object.assign(this, cache)
                this.ensureToday()
                return
            }
            this.init()
        },

        init() {
            this.dynamics = seedList()
            this.likedIds = []
            this.blockedUserIds = []
            this.firstOpenDay = todayStr()
            this.comfortClosed = false
            this.seeded = true
            this.persist()
        },

        // 首次进入广场时记录起始日期（用于连续无匹配安抚提示）
        touchFirstOpen() {
            if (!this.firstOpenDay) {
                this.firstOpenDay = todayStr()
                this.persist()
            }
        },

        ensureToday() {
            if (!this.firstOpenDay) {
                this.firstOpenDay = todayStr()
                this.persist()
            }
        },

        setCity(city) {
            if (!city || city === this.city) return
            this.city = city
            this.persist()
        },

        // ===== 点赞 =====
        toggleLike(id) {
            const item = this.dynamics.find(d => d.id === id)
            if (!item) return { ok: false }
            const index = this.likedIds.indexOf(id)
            if (index >= 0) {
                this.likedIds.splice(index, 1)
                item.likes = Math.max(0, item.likes - 1)
                this.persist()
                return { ok: true, liked: false, likes: item.likes }
            }
            this.likedIds.push(id)
            item.likes += 1
            this.persist()
            return { ok: true, liked: true, likes: item.likes }
        },

        // ===== 评论 =====
        addComment(dynamicId, text) {
            const item = this.dynamics.find(d => d.id === dynamicId)
            const content = String(text || '').trim()
            if (!item || !content) return { ok: false }
            const record = {
                id: `c_my_${Date.now()}`,
                userId: currentUserProfile.id,
                name: currentUserProfile.name,
                avatar: currentUserProfile.avatar,
                text: content,
                createdAt: Date.now()
            }
            item.commentList = [record, ...(item.commentList || [])]
            this.persist()
            return { ok: true, comment: record }
        },

        removeComment(dynamicId, commentId) {
            const item = this.dynamics.find(d => d.id === dynamicId)
            if (!item) return false
            item.commentList = (item.commentList || []).filter(c => c.id !== commentId)
            this.persist()
            return true
        },

        // ===== 发布 =====
        publish({ content, images = [], location = '' }) {
            const item = {
                id: `my_${Date.now()}`,
                userId: currentUserProfile.id,
                userName: currentUserProfile.name,
                userAvatar: currentUserProfile.avatar,
                userAge: currentUserProfile.age,
                gender: currentUserProfile.gender,
                occupation: currentUserProfile.occupation,
                district: currentUserProfile.district,
                city: this.city,
                auth: currentUserProfile.auth,
                content: String(content || '').trim(),
                images: [...images],
                location,
                createdAt: Date.now(),
                likes: 0,
                isQuality: false,
                pinned: false,
                mine: true,
                commentList: []
            }
            this.dynamics.unshift(item)
            this.persist()
            return item
        },

        removeDynamic(id) {
            const item = this.dynamics.find(d => d.id === id)
            if (!item || item.userId !== currentUserProfile.id) return false
            this.dynamics = this.dynamics.filter(d => d.id !== id)
            this.persist()
            return true
        },

        // ===== 运营：标记优质动态 =====
        // 效果：加权曝光（排序靠前）+ 作者获得 3 次永久心动
        markQuality(id) {
            const item = this.dynamics.find(d => d.id === id)
            if (!item) return { ok: false }
            if (item.isQuality) return { ok: true, already: true }
            item.isQuality = true
            this.persist()

            // 奖励只发给动态作者；本人被标记时可在权益中心看到记录
            let rewarded = 0
            if (item.userId === currentUserProfile.id) {
                const equity = useEquityStore()
                equity.addPermanentLikes(QUALITY_REWARD_LIKES, '优质动态奖励')
                rewarded = QUALITY_REWARD_LIKES
            }
            return { ok: true, rewarded }
        },

        // ===== 拉黑（评论前端过滤） =====
        toggleBlockUser(userId) {
            const id = Number(userId)
            const index = this.blockedUserIds.indexOf(id)
            if (index >= 0) {
                this.blockedUserIds.splice(index, 1)
                this.persist()
                return { blocked: false }
            }
            this.blockedUserIds.push(id)
            this.persist()
            return { blocked: true }
        },

        isBlocked(userId) {
            return this.blockedUserIds.includes(Number(userId))
        },

        // ===== 安抚提示 =====
        closeComfort() {
            this.comfortClosed = true
            this.persist()
        },

        // ===== 调试：重置 =====
        resetAll() {
            this.init()
        },

        persist() {
            writeCache({
                seeded: this.seeded,
                city: this.city,
                dynamics: this.dynamics,
                likedIds: this.likedIds,
                blockedUserIds: this.blockedUserIds,
                firstOpenDay: this.firstOpenDay,
                comfortClosed: this.comfortClosed
            })
        }
    }
})
