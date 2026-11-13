import { defineStore } from 'pinia'
import { currentUserProfile } from '@/mock/users'
import useEquityStore from './equity'
import useNotifyStore from './notify'

const STORAGE_KEY = 'user_state_v2'

// 单项认证奖励（3.2：学历/工作认证各 +5 次永久心动）
export const CERT_REWARD_LIKES = 5

// 安全读写本地存储（H5 / 小程序 / 编译期都能跑）
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
        console.warn('[user] 本地缓存失败', e)
    }
}

/**
 * 用户状态
 * 三级权限由 isLogin + authStatus.realName 推导，避免多处状态不一致：
 *   guest      游客（未登录）
 *   registered 注册未实名
 *   certified  已实名
 */
export default defineStore('user', {
    state: () => ({
        // 用户基本信息
        userInfo: null,
        // 是否已登录
        isLogin: false,
        // 认证状态
        authStatus: {
            realName: false,
            education: false,
            work: false
        },
        // 认证详情（状态、时间、驳回原因）
        verifications: {
            realName: null,
            education: null,
            work: null
        },
        // 用户资料
        profile: {
            gender: '',
            age: '',
            city: '',
            height: '',
            emotionNeed: '',
            bio: '',
            hobbies: [],
            tags: [],
            photos: []
        },
        // 我的关注（弱关系收藏夹：不限次数、不占额度、可随时取消）
        // 说明：v8 起「喜欢 / 收藏心动」统一改名为「关注」，与稀缺的「心动」彻底分开
        follows: [],
        // 认证奖励是否已发放（学历 / 工作，防重复发放）
        certRewarded: {
            education: false,
            work: false
        },
        // 第 6 章闭环：改城市 24h 生效（from 旧城市 / to 新城市 / at 申请时间戳）
        cityChange: { from: '', to: '', at: 0 }
    }),

    getters: {
        // 当前权限层级
        level: (state) => {
            if (!state.isLogin) return 'guest'
            return state.authStatus.realName ? 'certified' : 'registered'
        },
        userLevel() {
            return this.level
        },
        isGuest() {
            return this.level === 'guest'
        },
        isRegistered() {
            return this.level === 'registered'
        },
        isCertified() {
            return this.level === 'certified'
        },
        isRealNameAuth: (state) => state.authStatus.realName,
        // 认证数量
        authCount: (state) => {
            let count = 0
            if (state.authStatus.realName) count++
            if (state.authStatus.education) count++
            if (state.authStatus.work) count++
            return count
        },
        // 是否双认证（学历 + 工作），优质推荐门槛之一
        isDoubleVerified: (state) => state.authStatus.education && state.authStatus.work,
        // 学历 / 工作认证状态：idle | pending | success | failed
        certificationOf: (state) => (type) => {
            if (state.authStatus[type]) return 'success'
            const record = state.verifications[type]
            return record?.status || 'idle'
        },
        // 用户显示名称
        displayName: (state) => {
            if (!state.userInfo) return '游客'
            return state.userInfo.nickname || state.userInfo.name || '用户'
        },
        gender: (state) => state.profile.gender || 'male',
        // ===== 第 6 章闭环：仅手动填写常住城市，不取实时 GPS；改城市 24h 生效 =====
        // 同城匹配 / 推荐一律使用「生效城市」：切换未满 24 小时仍按旧城市计算
        matchCity: (state) => {
            const change = state.cityChange
            const pending = change && change.at &&
                (Date.now() - change.at) < 24 * 60 * 60 * 1000
            if (pending && change.from) return change.from
            return state.profile.city || ''
        },
        // 城市切换剩余生效小时数（0 = 已生效 / 无切换）
        cityChangeRemainHours() {
            const change = this.cityChange
            if (!change || !change.at) return 0
            const remain = change.at + 24 * 60 * 60 * 1000 - Date.now()
            return remain > 0 ? Math.ceil(remain / (60 * 60 * 1000)) : 0
        },
        // 是否存在待生效的城市切换
        cityPending() {
            const change = this.cityChange
            if (!change || !change.at || !this.cityChangeRemainHours) return null
            return { from: change.from, to: change.to, hours: this.cityChangeRemainHours }
        },
        // 我关注了多少人（关注不限次数，所以这里只做展示，不做任何拦截）
        followCount: (state) => state.follows.length,
        // 资料完整度（0-100）
        profileCompleteness: (state) => {
            const p = state.profile
            const checks = [
                !!state.userInfo?.avatar,
                !!state.userInfo?.name,
                !!p.gender,
                !!p.age,
                !!p.city,
                !!p.height,
                !!p.bio,
                !!p.emotionNeed,
                (p.tags || []).length >= 3,
                (p.hobbies || []).length >= 3,
                (p.photos || []).length >= 3,
                state.authStatus.realName
            ]
            const filled = checks.filter(Boolean).length
            return Math.round((filled / checks.length) * 100)
        }
    },

    actions: {
        // ===== 初始化 / 持久化 =====
        restore() {
            const cache = readCache()
            if (!cache) return
            this.userInfo = cache.userInfo || null
            this.isLogin = !!cache.isLogin
            this.authStatus = { ...this.authStatus, ...(cache.authStatus || {}) }
            this.verifications = { ...this.verifications, ...(cache.verifications || {}) }
            this.profile = { ...this.profile, ...(cache.profile || {}) }
            // 兼容旧缓存：v7 及以前叫 favorites（收藏心动），v8 起统一为 follows（关注）
            this.follows = cache.follows || cache.favorites || []
            this.certRewarded = { education: false, work: false, ...(cache.certRewarded || {}) }
            this.cityChange = cache.cityChange || { from: '', to: '', at: 0 }
        },

        persist() {
            writeCache({
                userInfo: this.userInfo,
                isLogin: this.isLogin,
                authStatus: this.authStatus,
                verifications: this.verifications,
                profile: this.profile,
                follows: this.follows,
                certRewarded: this.certRewarded,
                cityChange: this.cityChange
            })
        },

        // ===== 登录（mock）=====
        loginMock(level = 'registered') {
            this.isLogin = true
            this.userInfo = {
                id: currentUserProfile.id,
                name: currentUserProfile.name,
                nickname: currentUserProfile.name,
                avatar: currentUserProfile.avatar,
                phone: '138****8888',
                createTime: '2026-11-11'
            }
            this.profile = {
                gender: currentUserProfile.gender,
                age: currentUserProfile.age,
                city: currentUserProfile.district,
                height: currentUserProfile.height,
                emotionNeed: '认真恋爱',
                bio: currentUserProfile.bio,
                hobbies: currentUserProfile.hobbyTags,
                tags: currentUserProfile.personalityTags,
                photos: currentUserProfile.album
            }
            if (level === 'certified') {
                this.authStatus.realName = true
                this.verifications.realName = { status: 'success', time: '2026-11-11 10:00' }
            }
            this.persist()
        },

        // ===== 兼容旧接口 =====
        setUserInfo(info) {
            this.userInfo = info
            this.isLogin = true
            this.persist()
        },
        setAuthStatus(type, status) {
            if (!(type in this.authStatus)) return
            this.authStatus[type] = status
            this.persist()
        },
        updateProfile(data) {
            this.profile = { ...this.profile, ...data }
            this.persist()
        },

        // ===== 第 6 章闭环：改城市 24h 生效 =====
        /**
         * 手动修改常住城市（不取实时 GPS）。新城市 24 小时后才参与同城匹配/推荐。
         * @param {string} to 目标城市（可带「市」后缀）
         * @param {number} nowTs 调试可传自定义时间戳
         * @returns {{ ok: boolean, changed?: boolean, from?: string, to?: string }}
         */
        changeCity(to, nowTs = Date.now()) {
            const target = String(to || '').trim().replace('市', '')
            if (!target) return { ok: false, reason: 'empty' }
            const current = String(this.matchCity || '').replace('市', '')
            if (target === current) return { ok: true, changed: false }
            this.cityChange = { from: current, to: target, at: nowTs }
            this.profile.city = target
            this.persist()
            return { ok: true, changed: true, from: current, to: target }
        },

        // 调试：把切换时间拨快 24 小时，模拟「已到生效时间」
        advanceCityChange(nowTs = Date.now()) {
            if (!this.cityChange.at) return false
            this.cityChange = { ...this.cityChange, at: nowTs - 24 * 60 * 60 * 1000 - 1 }
            this.persist()
            return true
        },

        // ===== 3.2 资质认证（学历 / 工作，人工审核 mock） =====
        // 提交认证：仅实名用户可发起，凭证必填
        submitCertification(type, payload = {}) {
            if (type !== 'education' && type !== 'work') return { ok: false, reason: 'type' }
            if (!this.isLogin) return { ok: false, reason: 'login' }
            if (!this.authStatus.realName) return { ok: false, reason: 'realname' }
            if (!payload.credential) return { ok: false, reason: 'credential' }
            this.verifications[type] = {
                status: 'pending',
                method: payload.method || '',
                credential: payload.credential,
                company: payload.company || '',
                position: payload.position || '',
                submittedAt: Date.now(),
                handledAt: 0,
                reason: ''
            }
            this.persist()
            return { ok: true }
        },

        // 运营审核通过：点亮标识 + 首次发放 5 次永久心动
        approveCertification(type) {
            if (type !== 'education' && type !== 'work') return { ok: false }
            const record = this.verifications[type] || {}
            this.verifications[type] = {
                ...record,
                status: 'success',
                handledAt: Date.now(),
                reason: ''
            }
            this.authStatus[type] = true
            let rewarded = 0
            if (!this.certRewarded[type]) {
                const equity = useEquityStore()
                equity.addPermanentLikes(CERT_REWARD_LIKES, type === 'education' ? '学历认证' : '工作认证')
                this.certRewarded[type] = true
                rewarded = CERT_REWARD_LIKES
            }
            this.persist()
            // 3.8 认证通过服务通知
            useNotifyStore().pushCertPass(type)
            return { ok: true, rewarded }
        },

        // 运营审核驳回：保留原因供展示与申诉
        rejectCertification(type, reason = '凭证不清晰或信息不一致') {
            if (type !== 'education' && type !== 'work') return { ok: false }
            const record = this.verifications[type] || {}
            this.verifications[type] = {
                ...record,
                status: 'failed',
                handledAt: Date.now(),
                reason
            }
            this.authStatus[type] = false
            this.persist()
            return { ok: true }
        },

        // 人工申诉：回到待审核（MVP 仅做状态流转）
        appealCertification(type) {
            const record = this.verifications[type]
            if (!record || record.status !== 'failed') return { ok: false }
            this.verifications[type] = { ...record, status: 'pending', reason: '', submittedAt: Date.now() }
            this.persist()
            return { ok: true }
        },

        // 调试：清空学历 / 工作认证
        resetCertifications() {
            this.authStatus.education = false
            this.authStatus.work = false
            this.verifications.education = null
            this.verifications.work = null
            this.certRewarded = { education: false, work: false }
            this.persist()
        },
        // 旧接口：直接设置层级，内部转换为底层状态
        setUserLevel(level) {
            this.switchLevel(level)
        },

        // ===== 调试用：一键切换三级权限 =====
        switchLevel(level) {
            if (level === 'guest') {
                this.logout()
                return
            }
            if (!this.isLogin) this.loginMock('registered')
            this.authStatus.realName = level === 'certified'
            this.verifications.realName = level === 'certified'
                ? { status: 'success', time: '2026-11-11 10:00' }
                : null
            this.persist()
        },

        // ===== 关注（0 成本、不限次数、不占额度）=====
        // 关注 = 把合眼缘的 TA 放进收藏夹，等心动额度刷新后再表达心动
        follow(user) {
            if (!user || !user.id) return { ok: false, reason: 'invalid' }
            const id = Number(user.id)
            if (this.follows.some(item => Number(item.id) === id)) {
                return { ok: false, reason: 'exists' }
            }
            this.follows.unshift({
                id,
                name: user.name,
                age: user.age,
                avatar: user.avatar,
                district: user.district,
                occupation: user.occupation,
                time: Date.now()
            })
            this.persist()
            return { ok: true }
        },

        unfollow(userId) {
            const id = Number(userId)
            const before = this.follows.length
            this.follows = this.follows.filter(item => Number(item.id) !== id)
            this.persist()
            return { ok: this.follows.length < before }
        },

        isFollowing(userId) {
            return this.follows.some(item => Number(item.id) === Number(userId))
        },

        // 关注 / 取消关注（一个入口，页面不必各自写 if）
        toggleFollow(user) {
            if (!user || !user.id) return { ok: false, reason: 'invalid' }
            if (this.isFollowing(user.id)) {
                this.unfollow(user.id)
                return { ok: true, following: false }
            }
            const res = this.follow(user)
            return { ok: res.ok, following: res.ok }
        },

        // ===== 兼容旧调用名（等价于关注）=====
        addFavorite(user) {
            return this.follow(user).ok
        },
        removeFavorite(userId) {
            this.unfollow(userId)
        },
        isFavorited(userId) {
            return this.isFollowing(userId)
        },

        // ===== 登出 =====
        logout() {
            this.userInfo = null
            this.isLogin = false
            this.authStatus = { realName: false, education: false, work: false }
            this.verifications = { realName: null, education: null, work: null }
            this.profile = {
                gender: '',
                age: '',
                city: '',
                height: '',
                emotionNeed: '',
                bio: '',
                hobbies: [],
                tags: [],
                photos: []
            }
            this.follows = []
            this.certRewarded = { education: false, work: false }
            this.cityChange = { from: '', to: '', at: 0 }
            this.persist()
        }
    }
})
