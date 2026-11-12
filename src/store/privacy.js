import { defineStore } from 'pinia'
import { currentUserProfile, findUserById } from '@/mock/users'
import { defaultPrivacy, seedBlacklist, APPLY_BLOCK_COPY, AGE_GAP_OPTIONS, HIDE_FIELDS, mockTargetPolicy } from '@/mock/privacy'

const STORAGE_KEY = 'privacy_v1'

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
        console.warn('[privacy] 本地缓存失败', e)
    }
}

/**
 * 3.6 / 3.7 隐私设置
 * 每个开关都有真实业务后果：
 * - 允许他人申请微信 / 仅双认证可申请 / 年龄差拦截 → 拦截微信申请
 * - 24h 未处理自动拒绝 → 接收方保护（女性用户默认开启）
 * - 黑名单 → 双向屏蔽，无通知，动态评论与匹配流同时过滤
 */
export default defineStore('privacy', {
    state: () => ({
        seeded: false,
        ...defaultPrivacy(),
        // 黑名单：{ id, name, avatar, district, reason, blockedAt }
        blacklist: []
    }),

    getters: {
        blacklistCount: (state) => state.blacklist.length,

        blacklistIds: (state) => state.blacklist.map(item => Number(item.id)),

        // 黑名单按时间倒序（新的在前）
        blacklistList: (state) => [...state.blacklist].sort((a, b) => b.blockedAt - a.blockedAt),

        isBlocked: (state) => (userId) =>
            state.blacklist.some(item => Number(item.id) === Number(userId)),

        ageGapLabel: (state) => {
            const hit = AGE_GAP_OPTIONS.find(item => item.value === state.ageGap)
            return hit ? hit.label : '不限制'
        },

        hiddenFieldLabels: (state) =>
            HIDE_FIELDS.filter(item => state.hideFields.includes(item.value)).map(item => item.label),

        hiddenFieldText() {
            return this.hiddenFieldLabels.length ? this.hiddenFieldLabels.join('、') : '未隐藏任何资料'
        },

        // 我收到的申请是否需要 24h 自动拒绝（0 表示不自动拒绝）
        // 注意：getter 不能与 state 键同名（autoRejectHours），否则赋值会打到只读 getter 上
        effectiveAutoRejectHours: (state) => (state.autoRejectEnabled ? state.autoRejectHours : 0),

        /**
         * 我能否向某位用户发起微信申请（读对方的隐私策略 + 我的黑名单）
         * @returns {{ ok: boolean, reason: string, message: string }}
         */
        checkApply: (state) => (targetUser) => {
            if (!targetUser) return { ok: false, reason: 'not_found', message: '用户不存在' }
            const id = Number(targetUser.id)
            if (state.blacklist.some(item => Number(item.id) === id)) {
                return { ok: false, reason: 'blocked', message: APPLY_BLOCK_COPY.blocked }
            }
            const policy = mockTargetPolicy(targetUser)
            if (!policy.allowWechatApply) {
                return { ok: false, reason: 'closed', message: APPLY_BLOCK_COPY.closed }
            }
            if (policy.onlyDoubleVerified) {
                const auth = targetUser.auth || {}
                if (!(auth.education && auth.work)) {
                    return { ok: false, reason: 'need_double', message: APPLY_BLOCK_COPY.need_double }
                }
            }
            if (policy.ageGap > 0 && targetUser.age) {
                const myAge = Number(currentUserProfile.age) || 0
                if (myAge && Math.abs(Number(targetUser.age) - myAge) > policy.ageGap) {
                    return { ok: false, reason: 'age_gap', message: APPLY_BLOCK_COPY.age_gap }
                }
            }
            return { ok: true, reason: '', message: '' }
        },

        /**
         * 我能否接收某人的微信申请（读我自己的隐私开关）
         */
        canReceiveApply: (state) => (applicantUser) => {
            if (!applicantUser) return { ok: false, reason: 'not_found', message: '用户不存在' }
            const id = Number(applicantUser.id)
            if (state.blacklist.some(item => Number(item.id) === id)) {
                return { ok: false, reason: 'blocked', message: APPLY_BLOCK_COPY.blocked }
            }
            if (!state.allowWechatApply) {
                return { ok: false, reason: 'closed', message: '你已关闭微信申请通道' }
            }
            if (state.onlyDoubleVerified) {
                const auth = applicantUser.auth || {}
                if (!(auth.education && auth.work)) {
                    return { ok: false, reason: 'need_double', message: '你仅接受双认证用户的申请' }
                }
            }
            if (state.ageGap > 0 && applicantUser.age) {
                const myAge = Number(currentUserProfile.age) || 0
                if (myAge && Math.abs(Number(applicantUser.age) - myAge) > state.ageGap) {
                    return { ok: false, reason: 'age_gap', message: '对方年龄差超出你设置的范围' }
                }
            }
            return { ok: true, reason: '', message: '' }
        }
    },

    actions: {
        restore() {
            const cache = readCache()
            if (cache && cache.seeded) {
                Object.assign(this, { ...defaultPrivacy(), ...cache })
                this.blacklist = cache.blacklist || []
                this.seeded = true
            } else {
                this.resetAll()
            }
        },

        persist() {
            writeCache({
                seeded: this.seeded,
                dynamicScope: this.dynamicScope,
                allowWechatApply: this.allowWechatApply,
                autoRejectEnabled: this.autoRejectEnabled,
                autoRejectHours: this.autoRejectHours,
                onlyDoubleVerified: this.onlyDoubleVerified,
                ageGap: this.ageGap,
                showInRecommend: this.showInRecommend,
                hideFields: this.hideFields,
                blacklist: this.blacklist
            })
        },

        resetAll() {
            Object.assign(this, defaultPrivacy())
            this.blacklist = seedBlacklist()
            this.seeded = true
            this.persist()
        },

        // ===== 开关 =====
        toggle(key) {
            if (!(key in defaultPrivacy())) return false
            this[key] = !this[key]
            this.persist()
            return this[key]
        },

        setScope(scope) {
            this.dynamicScope = scope
            this.persist()
        },

        setAgeGap(value) {
            this.ageGap = Number(value) || 0
            this.persist()
        },

        setAutoRejectHours(hours) {
            this.autoRejectHours = Number(hours) || 24
            this.persist()
        },

        toggleHideField(field) {
            const index = this.hideFields.indexOf(field)
            if (index >= 0) this.hideFields.splice(index, 1)
            else this.hideFields.push(field)
            this.persist()
            return this.hideFields.includes(field)
        },

        // ===== 黑名单（双向屏蔽、无通知）=====
        blockUser(user, reason = '主动屏蔽') {
            const id = Number(user?.id || user)
            if (!id) return { ok: false, reason: 'invalid' }
            if (this.isBlocked(id)) return { ok: false, reason: 'exists' }
            const target = findUserById(id)
            this.blacklist.unshift({
                id,
                name: target?.name || user?.name || '用户',
                avatar: target?.avatar || user?.avatar || '',
                district: target?.district || user?.district || '',
                reason,
                blockedAt: Date.now()
            })
            this.persist()
            return { ok: true }
        },

        unblockUser(userId) {
            const id = Number(userId)
            const before = this.blacklist.length
            this.blacklist = this.blacklist.filter(item => Number(item.id) !== id)
            if (this.blacklist.length === before) return { ok: false, reason: 'not_found' }
            this.persist()
            // 解除拉黑后需重新双向心动才能交换微信：清理匹配关系中的微信状态
            return { ok: true }
        }
    }
})
