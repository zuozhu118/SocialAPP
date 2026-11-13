import { defineStore } from 'pinia'
import { findUserById, currentUserProfile } from '@/mock/users'
import { CURRENT_CITY } from '@/mock/dynamics'
import { seedMyHearts, seedHeartsMe, seedFollowers, seedTodayViews } from '@/mock/social'
import { todayStr } from '@/mock/index'
import { footprintCopy } from '@/mock/copy'
import useNotifyStore from './notify'

const STORAGE_KEY = 'social_v1'
// 种子结构版本：v8 起关注 / 心动 / 关注我的拆成三组数据，
// mutual 集合与匹配记录一一对应，旧缓存结构不再兼容，读到旧版本直接重建种子
const SEED_VERSION = 2

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
        console.warn('[social] 本地缓存失败', e)
    }
}

// 今日 0 点时间戳（今日来访每日 0 点重置）
const startOfToday = () => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d.getTime()
}

// 是否同城异性（3.9 口径：仅统计同城异性）
const isSameCityOpposite = (user) => {
    if (!user) return false
    return (user.ipLocation || '') === CURRENT_CITY && user.gender !== currentUserProfile.gender
}

/**
 * 个人中心社交关系（v8：关注与心动彻底分开）
 * - hearts     我发出的心动（稀缺动作，扣每日额度）
 * - heartsMe   心动我的（含未实名暂存心动）
 * - followers  关注我的（0 成本弱关系，与心动无关）
 * - todayViews 今日浏览过我主页的人（仅计数，不与「关注」混用）
 *
 * 注意：我「关注」了谁存在 user store 的 follows 里，不在这里，
 * 因为关注是用户自己的收藏夹，与社交关系（谁对我做了什么）是两类数据。
 */
export default defineStore('social', {
    state: () => ({
        seeded: false,
        city: CURRENT_CITY,
        hearts: [],
        heartsMe: [],
        followers: [],
        todayViews: [],
        // 今日来访所属日期，跨天自动清零
        footprintDay: todayStr(),
        // 今日已手动关闭今日来访提示（可关闭，不重复打扰）
        footprintClosed: false
    }),

    getters: {
        // 关系记录补全为用户资料卡，缺失用户直接丢弃
        userCard: (state) => (userId) => {
            const user = findUserById(userId)
            if (!user) return null
            return {
                id: user.id,
                name: user.name,
                gender: user.gender,
                age: user.age,
                avatar: user.avatar,
                district: user.district,
                occupation: user.occupation,
                auth: user.auth || { realName: false, education: false, work: false },
                bio: user.bio,
                city: user.ipLocation,
                sameCity: (user.ipLocation || '') === state.city
            }
        },

        // 是否已双向心动：双方都必须心动，交换微信的唯一前置条件
        // 口径：我发出的心动记录里 mutual = true（对方也心动了我）
        isMutual: (state) => (userId) => {
            const id = Number(userId)
            return state.hearts.some(item => Number(item.userId) === id && !!item.mutual)
        },

        // 我发出的心动
        myHeartsList() {
            return this.hearts
                .map(item => {
                    const card = this.userCard(item.userId)
                    return card ? { ...card, heartAt: item.heartAt, mutual: !!item.mutual } : null
                })
                .filter(Boolean)
                .sort((a, b) => b.heartAt - a.heartAt)
        },

        // 心动我的
        heartsMeList() {
            return this.heartsMe
                .map(item => {
                    const card = this.userCard(item.userId)
                    return card
                        ? { ...card, heartAt: item.heartAt, mutual: !!item.mutual, stored: !!item.stored }
                        : null
                })
                .filter(Boolean)
                .sort((a, b) => b.heartAt - a.heartAt)
        },

        // 关注我的（弱关系，0 成本）
        followerList() {
            return this.followers
                .map(item => {
                    const card = this.userCard(item.userId)
                    return card ? { ...card, followAt: item.followAt } : null
                })
                .filter(Boolean)
                .sort((a, b) => b.followAt - a.followAt)
        },

        myHeartCount() {
            return this.myHeartsList.length
        },

        heartsMeCount() {
            return this.heartsMeList.length
        },

        followerCount() {
            return this.followerList.length
        },

        // 心动我的里面还没回应的（个人中心做「去回应」引导）
        unmetHeartCount(state) {
            return state.heartsMe.filter(item => !item.mutual).length
        },

        // 我发出的心动里已经双向匹配的
        mutualCount(state) {
            return state.hearts.filter(item => item.mutual).length
        },

        // ===== 3.9 今日来访 =====
        // 口径 = 今日真实主页浏览 ∪ 今日未实名暂存心动
        footprintUserIds(state) {
            const ids = new Set((state.todayViews || []).map(Number))
            const start = startOfToday()
            state.heartsMe
                .filter(item => item.stored && item.heartAt >= start)
                .forEach(item => ids.add(Number(item.userId)))
            return [...ids]
        },

        todayFootprintCount() {
            return this.footprintUserIds.filter(id => isSameCityOpposite(findUserById(id))).length
        },

        hasFootprint() {
            return this.todayFootprintCount > 0
        },

        // 今日已关闭则不再展示
        footprintVisible(state) {
            if (state.footprintDay !== todayStr()) return true
            return !state.footprintClosed
        },

        // 统一取自 mock/copy.js，禁止页面自定义
        footprintText() {
            return footprintCopy(this.todayFootprintCount)
        }
    },

    actions: {
        restore() {
            const cache = readCache()
            if (cache && cache.seeded && cache.seedVersion === SEED_VERSION) {
                // 兼容更早缓存键：hearts/myLikes、heartsMe/likesMe 同一份数据
                this.hearts = cache.hearts || cache.myLikes || []
                this.heartsMe = cache.heartsMe || cache.likesMe || []
                this.followers = cache.followers || seedFollowers()
                this.todayViews = cache.todayViews || []
                this.footprintDay = cache.footprintDay || todayStr()
                this.footprintClosed = !!cache.footprintClosed
                this.seeded = true
            } else {
                this.resetSeed()
            }
            this.ensureToday()
        },

        resetSeed() {
            this.hearts = seedMyHearts()
            this.heartsMe = seedHeartsMe()
            this.followers = seedFollowers()
            this.todayViews = seedTodayViews()
            this.footprintDay = todayStr()
            this.footprintClosed = false
            this.seeded = true
            this.persist()
        },

        // 今日来访每日 0 点重置
        ensureToday() {
            const today = todayStr()
            if (this.footprintDay === today) return false
            this.footprintDay = today
            this.footprintClosed = false
            this.todayViews = []
            // 暂存心动保留，但只计入当天产生的部分
            this.persist()
            return true
        },

        persist() {
            writeCache({
                seeded: this.seeded,
                seedVersion: SEED_VERSION,
                city: this.city,
                hearts: this.hearts,
                heartsMe: this.heartsMe,
                followers: this.followers,
                todayViews: this.todayViews,
                footprintDay: this.footprintDay,
                footprintClosed: this.footprintClosed
            })
        },

        // ===== 关系写入 =====
        // 浏览过我的主页（真实主页浏览口径）
        markViewed(userId) {
            const id = Number(userId)
            if (!id || this.todayViews.includes(id)) return false
            this.todayViews.push(id)
            this.persist()
            return true
        },

        // 我发出心动（调用方必须先扣额度成功，这里只管关系落库）
        addHeart(userId) {
            const id = Number(userId)
            if (!id) return false
            if (this.hearts.some(item => Number(item.userId) === id)) return false
            this.hearts.unshift({ userId: id, heartAt: Date.now(), mutual: false })
            this.persist()
            return true
        },

        removeHeart(userId) {
            const id = Number(userId)
            this.hearts = this.hearts.filter(item => Number(item.userId) !== id)
            this.persist()
        },

        hasHeart(userId) {
            const id = Number(userId)
            return this.hearts.some(item => Number(item.userId) === id)
        },

        // 双向心动达成
        setMutual(userId) {
            const id = Number(userId)
            this.hearts.forEach(item => {
                if (Number(item.userId) === id) item.mutual = true
            })
            this.heartsMe.forEach(item => {
                if (Number(item.userId) === id) item.mutual = true
            })
            this.persist()
        },

        // 调试：模拟一位用户关注了我（与心动无关）
        addFollower(userId) {
            const id = Number(userId)
            if (!findUserById(id)) return { ok: false, reason: 'no_user' }
            if (this.followers.some(item => Number(item.userId) === id)) {
                return { ok: false, reason: 'exists' }
            }
            this.followers.unshift({ userId: id, followAt: Date.now() })
            this.persist()
            return { ok: true, userId: id }
        },

        // 手动关闭今日来访提示
        closeFootprint() {
            this.footprintClosed = true
            this.footprintDay = todayStr()
            this.persist()
        },

        // 调试：模拟今日有一位同城异性看过我
        simulateFootprint() {
            this.footprintDay = todayStr()
            this.footprintClosed = false
            const candidates = [1, 5, 13, 14]
            const next = candidates.find(id => !this.todayViews.includes(id))
            if (next) {
                this.todayViews.push(next)
                this.persist()
                return true
            }
            return false
        },

        // 调试：模拟有同城异性对我心动（3.8 收到心动通知的真实来源）
        simulateHeartMe(userId = 11) {
            const id = Number(userId)
            if (!findUserById(id)) return { ok: false, reason: 'no_user' }
            if (this.heartsMe.some(item => Number(item.userId) === id)) {
                return { ok: false, reason: 'exists' }
            }
            this.heartsMe.unshift({ userId: id, heartAt: Date.now(), mutual: false, stored: false })
            this.persist()
            useNotifyStore().pushLikeMe(id)
            return { ok: true, userId: id }
        },

        // 兼容旧调用名
        addLike(userId) {
            return this.addHeart(userId)
        },
        removeLike(userId) {
            this.removeHeart(userId)
        },
        simulateLikeMe(userId = 11) {
            return this.simulateHeartMe(userId)
        },

        resetAll() {
            this.hearts = seedMyHearts()
            this.heartsMe = seedHeartsMe()
            this.followers = seedFollowers()
            this.todayViews = seedTodayViews()
            this.footprintDay = todayStr()
            this.footprintClosed = false
            this.seeded = true
            this.persist()
        }
    }
})
