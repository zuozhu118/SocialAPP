import { defineStore } from 'pinia'
import { findUserById, currentUserProfile } from '@/mock/users'
import { CURRENT_CITY } from '@/mock/dynamics'
import { seedMyLikes, seedLikesMe, seedTodayViews } from '@/mock/social'
import { todayStr } from '@/mock/index'
import useNotifyStore from './notify'

const STORAGE_KEY = 'social_v1'

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

// 今日 0 点时间戳（缘分足迹每日 0 点重置）
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
 * 个人中心社交关系
 * - myLikes  我发出心动的对象
 * - likesMe  喜欢我的对象（含未实名暂存心动）
 * - todayViews 今日浏览过我主页的对象（仅计数）
 */
export default defineStore('social', {
    state: () => ({
        seeded: false,
        city: CURRENT_CITY,
        myLikes: [],
        likesMe: [],
        todayViews: [],
        // 缘分足迹所属日期，跨天自动清零
        footprintDay: todayStr(),
        // 今日已手动关闭缘分足迹提示（可关闭，不重复打扰）
        footprintClosed: false
    }),

    getters: {
        // 关系记录补全为用户资料，缺失用户直接丢弃
        detailOf: (state) => (record) => {
            const user = findUserById(record.userId)
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
                sameCity: (user.ipLocation || '') === state.city,
                likedAt: record.likedAt,
                mutual: !!record.mutual,
                stored: !!record.stored
            }
        },

        myLikeList(state) {
            return state.myLikes
                .map(item => this.detailOf(item))
                .filter(Boolean)
                .sort((a, b) => b.likedAt - a.likedAt)
        },

        likesMeList(state) {
            return state.likesMe
                .map(item => this.detailOf(item))
                .filter(Boolean)
                .sort((a, b) => b.likedAt - a.likedAt)
        },

        myLikeCount() {
            return this.myLikeList.length
        },

        likesMeCount() {
            return this.likesMeList.length
        },

        // 喜欢我的里面还没回应的（个人中心做「去回应」引导）
        unmetLikeCount(state) {
            return state.likesMe.filter(item => !item.mutual).length
        },

        // 我喜欢的里面已经双向匹配的
        mutualCount(state) {
            return state.myLikes.filter(item => item.mutual).length
        },

        // ===== 3.9 缘分足迹 =====
        // 口径 = 今日真实主页浏览 ∪ 今日未实名暂存心动
        footprintUserIds(state) {
            const ids = new Set((state.todayViews || []).map(Number))
            const start = startOfToday()
            state.likesMe
                .filter(item => item.stored && item.likedAt >= start)
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

        footprintText() {
            return `今日有 ${this.todayFootprintCount} 位同城异性关注了你`
        }
    },

    actions: {
        restore() {
            const cache = readCache()
            if (cache && cache.seeded) {
                this.myLikes = cache.myLikes || []
                this.likesMe = cache.likesMe || []
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
            this.myLikes = seedMyLikes()
            this.likesMe = seedLikesMe()
            this.todayViews = seedTodayViews()
            this.footprintDay = todayStr()
            this.footprintClosed = false
            this.seeded = true
            this.persist()
        },

        // 缘分足迹每日 0 点重置
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
                city: this.city,
                myLikes: this.myLikes,
                likesMe: this.likesMe,
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

        // 我发出心动
        addLike(userId) {
            const id = Number(userId)
            if (!id) return false
            if (this.myLikes.some(item => Number(item.userId) === id)) return false
            this.myLikes.unshift({ userId: id, likedAt: Date.now(), mutual: false })
            this.persist()
            return true
        },

        removeLike(userId) {
            const id = Number(userId)
            this.myLikes = this.myLikes.filter(item => Number(item.userId) !== id)
            this.persist()
        },

        // 双向匹配达成
        setMutual(userId) {
            const id = Number(userId)
            this.myLikes.forEach(item => {
                if (Number(item.userId) === id) item.mutual = true
            })
            this.likesMe.forEach(item => {
                if (Number(item.userId) === id) item.mutual = true
            })
            this.persist()
        },

        // 手动关闭今日缘分足迹提示
        closeFootprint() {
            this.footprintClosed = true
            this.footprintDay = todayStr()
            this.persist()
        },

        // 调试：模拟今日有一位同城异性关注了我
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
        simulateLikeMe(userId = 11) {
            const id = Number(userId)
            if (!findUserById(id)) return { ok: false, reason: 'no_user' }
            if (this.likesMe.some(item => Number(item.userId) === id)) {
                return { ok: false, reason: 'exists' }
            }
            this.likesMe.unshift({ userId: id, likedAt: Date.now(), mutual: false, stored: false })
            this.persist()
            useNotifyStore().pushLikeMe(id)
            return { ok: true, userId: id }
        },

        resetAll() {
            this.myLikes = seedMyLikes()
            this.likesMe = seedLikesMe()
            this.todayViews = seedTodayViews()
            this.footprintDay = todayStr()
            this.footprintClosed = false
            this.seeded = true
            this.persist()
        }
    }
})
