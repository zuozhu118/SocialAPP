import { defineStore } from 'pinia'
import { findUserById, currentUserProfile } from '@/mock/users'
import useNotifyStore from './notify'
import usePrivacyStore from './privacy'
import useSocialStore from './social'
import {
    seedMatches,
    seedApplications,
    mockWechatMap,
    myMockWechat,
    matchSuccessTags,
    buildFatePoint
} from '@/mock/matches'

const STORAGE_KEY = 'match_state_v1'

// ===== 硬性规则（见文档 3.4）=====
// 产品决策：不提供任何站内聊天，也不做「一来一回招呼」，匹配成功后直接走微信申请
// 3.4.3 微信申请：有效期 3 天；同一用户对同一对象 7 天内仅可发起 1 次
export const APPLY_VALID_DAYS = 3
export const APPLY_COOLDOWN = 7 * 24 * 60 * 60 * 1000
// 申请留言上限（选填，非聊天）
export const MESSAGE_MAX_LEN = 20
const DAY = 24 * 60 * 60 * 1000

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
        console.warn('[match] 本地缓存失败', e)
    }
}

/**
 * 3.4.4 全域导流拦截：手机号 / 微信号 / QQ / 链接 / 二维码文字
 * 命中即拦截，前端直接给出标准文案，不做任何落库
 */
const CONTACT_PATTERNS = [
    /1[3-9]\d{9}/,                       // 手机号
    /\d{5,}/,                            // 连续 5 位以上数字（QQ / 长串号码）
    /(微信|威信|薇信|vx|VX|wx|WX|weixin|wechat)\s*(号|是|为)?\s*[:：]?\s*[A-Za-z0-9_-]{3,}/, // 微信号
    /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/, // 邮箱
    /(https?:\/\/|www\.)/i,              // 链接
    /(qq|QQ)\s*(号|是|为)?\s*[:：]?\s*\d+/, // QQ
    /加我|私聊我|扫码|二维码/             // 导流话术
]

export const detectContact = (text = '') => {
    const value = String(text || '')
    return CONTACT_PATTERNS.some(re => re.test(value))
}

// 剩余时间人性化文案
export const formatRemain = (ms = 0) => {
    if (ms <= 0) return '已过期'
    const hours = Math.floor(ms / (60 * 60 * 1000))
    if (hours >= 24) return `剩 ${Math.floor(hours / 24)} 天`
    if (hours >= 1) return `剩 ${hours} 小时`
    return `剩 ${Math.max(1, Math.floor(ms / (60 * 1000)))} 分钟`
}

/**
 * 双向匹配 / 微信交换 状态（不提供任何站内聊天）
 * - matches：已双向匹配关系，含微信交换状态
 * - applications：微信交换申请（direction: in / out）
 * - 所有时间统一存时间戳，渲染层再做文案
 */
export default defineStore('match', {
    state: () => ({
        // 我的微信号（3.4.3 用户在隐私设置自愿填写，可随时修改）
        myWechat: myMockWechat,
        matches: [],
        applications: [],
        // 已进入过匹配成功页的关系，避免重复弹全屏动效
        successShown: [],
        seeded: false
    }),

    getters: {
        // 我发出的申请
        sentApplications: (state) =>
            state.applications
                .filter(item => item.direction === 'out')
                .sort((a, b) => b.createdAt - a.createdAt),

        // 收到的申请
        receivedApplications: (state) =>
            state.applications
                .filter(item => item.direction === 'in')
                .sort((a, b) => b.createdAt - a.createdAt),

        sentPendingCount() {
            return this.sentApplications.filter(item => item.status === 'pending').length
        },

        receivedPendingCount() {
            return this.receivedApplications.filter(item => item.status === 'pending').length
        },

        // 已成功交换微信的关系
        wechatExchanged: (state) => state.matches.filter(item => item.wechatStatus === 'agreed'),

        matchedCount: (state) => state.matches.length
    },

    actions: {
        // ---------- 初始化 ----------
        restore() {
            const cache = readCache()
            if (cache && cache.seeded) {
                this.myWechat = cache.myWechat || myMockWechat
                this.matches = cache.matches || []
                this.applications = cache.applications || []
                this.successShown = cache.successShown || []
                this.seeded = true
            } else {
                this.matches = seedMatches()
                this.applications = seedApplications()
                this.seeded = true
            }
            this.expireCheck()
        },

        persist() {
            writeCache({
                seeded: this.seeded,
                myWechat: this.myWechat,
                matches: this.matches,
                applications: this.applications,
                successShown: this.successShown
            })
        },

        // 3.4.3 3 天未处理自动过期（每次进入相关页面时校验）
        expireCheck() {
            let changed = false
            const now = Date.now()
            this.applications.forEach(item => {
                if (item.status === 'pending' && item.expiresAt < now) {
                    item.status = 'expired'
                    changed = true
                }
            })
            if (changed) this.persist()
            return changed
        },

        // 3.6 隐私开关：微信申请 24 小时未处理自动拒绝（接收方保护，女性默认开启）
        // @param {number} hours 可选，调试或后台下发；默认读隐私设置
        autoRejectCheck(hours) {
            const limit = Number.isFinite(hours) ? Number(hours) : usePrivacyStore().effectiveAutoRejectHours
            if (!limit) return 0
            const now = Date.now()
            const span = limit * 60 * 60 * 1000
            let changed = 0
            this.applications.forEach(item => {
                if (item.status !== 'pending') return
                if (now - item.createdAt < span) return
                item.status = 'auto_rejected'
                item.handledAt = now
                changed++
                const otherId = item.direction === 'in' ? item.fromUserId : item.toUserId
                const match = this.getMatch(otherId)
                if (match && match.wechatStatus === 'pending') match.wechatStatus = 'none'
                // 只有「我发出的申请被对方自动拒绝」才需要通知我
                if (item.direction === 'out') useNotifyStore().pushAutoRejected(otherId)
            })
            if (changed) this.persist()
            return changed
        },

        // ---------- 匹配关系 ----------
        isMatched(userId) {
            return this.matches.some(item => Number(item.userId) === Number(userId))
        },

        getMatch(userId) {
            return this.matches.find(item => Number(item.userId) === Number(userId)) || null
        },

        /**
         * 建立双向匹配（用户心动且对方也心动）
         * 返回匹配记录，供成功动效页使用
         */
        createMatch(userId, options = {}) {
            const id = Number(userId)
            const exist = this.getMatch(id)
            if (exist) return exist
            const target = findUserById(id)
            const record = {
                userId: id,
                matchedAt: Date.now(),
                wechatStatus: 'none',
                commonTags: target ? matchSuccessTags(target, currentUserProfile) : []
            }
            this.matches.unshift(record)
            this.persist()
            // 3.8 匹配成功服务通知（游客不推，未实名降级为实名引导，由 notify store 判定）
            if (options.notify !== false) useNotifyStore().pushMatchSuccess(id)
            return record
        },

        markSuccessShown(userId) {
            const id = Number(userId)
            if (!this.successShown.includes(id)) this.successShown.push(id)
            this.persist()
        },

        // ---------- 微信交换（3.4.3）----------
        /**
         * 是否可发起申请：7 天内对同一对象仅可发起 1 次
         * 返回 { ok, reason, remain }
         */
        canApplyWechat(userId) {
            const id = Number(userId)
            // 双保险：匹配记录 + 双向心动都必须成立，交换微信的唯一前提
            if (!this.isMatched(id)) return { ok: false, reason: 'not_matched' }
            if (!useSocialStore().isMutual(id)) return { ok: false, reason: 'not_mutual' }
            const exist = this.getMatch(id)
            if (exist.wechatStatus === 'agreed') return { ok: false, reason: 'agreed' }

            // 3.6 隐私设置：对方关闭申请 / 仅双认证 / 年龄差拦截 / 黑名单
            const target = findUserById(id)
            const policy = usePrivacyStore().checkApply(target)
            if (!policy.ok) return { ok: false, reason: policy.reason, message: policy.message }

            const now = Date.now()
            const record = this.applications.find(item => Number(item.toUserId) === id && item.direction === 'out')
            if (record) {
                if (record.status === 'pending' && record.expiresAt > now) {
                    return { ok: false, reason: 'pending', remain: record.expiresAt - now, applicationId: record.id }
                }
                if (now - record.createdAt < APPLY_COOLDOWN) {
                    return { ok: false, reason: 'cooldown', remain: record.createdAt + APPLY_COOLDOWN - now }
                }
            }
            return { ok: true }
        },

        /**
         * 发起微信申请：写入 3 天有效期
         * 注意：调用前必须已完成反诈弹窗「已知晓」确认
         */
        applyWechat(userId, message = '') {
            const check = this.canApplyWechat(userId)
            if (!check.ok) return check
            const id = Number(userId)
            const now = Date.now()
            const record = {
                id: `app_${now}_${id}`,
                fromUserId: currentUserProfile.id,
                toUserId: id,
                direction: 'out',
                status: 'pending',
                message: String(message || '').trim(),
                createdAt: now,
                expiresAt: now + APPLY_VALID_DAYS * DAY,
                handledAt: 0
            }
            this.applications.unshift(record)
            const match = this.getMatch(id)
            if (match) match.wechatStatus = 'pending'
            this.persist()
            return { ok: true, application: record }
        },

        getApplication(id) {
            return this.applications.find(item => item.id === id) || null
        },

        // 我收到的待处理申请（按对象）
        getIncomingApplication(userId) {
            return this.applications.find(
                item => item.direction === 'in' && Number(item.fromUserId) === Number(userId) && item.status === 'pending'
            ) || null
        },

        agreeApplication(applicationId) {
            const record = this.getApplication(applicationId)
            if (!record || record.status !== 'pending') return { ok: false, reason: 'invalid' }
            record.status = 'agreed'
            record.handledAt = Date.now()
            const otherId = record.direction === 'in' ? record.fromUserId : record.toUserId
            let match = this.getMatch(otherId)
            if (!match) match = this.createMatch(otherId, { notify: false })
            match.wechatStatus = 'agreed'
            this.persist()
            return { ok: true }
        },

        rejectApplication(applicationId) {
            const record = this.getApplication(applicationId)
            if (!record || record.status !== 'pending') return { ok: false, reason: 'invalid' }
            record.status = 'rejected'
            record.handledAt = Date.now()
            const otherId = record.direction === 'in' ? record.fromUserId : record.toUserId
            const match = this.getMatch(otherId)
            if (match && match.wechatStatus === 'pending') match.wechatStatus = 'none'
            this.persist()
            return { ok: true }
        },

        // 对方微信号（仅同意后可见，日志不记录）
        getWechatOf(userId) {
            const record = this.getMatch(userId)
            if (!record || record.wechatStatus !== 'agreed') return ''
            return mockWechatMap[Number(userId)] || ''
        },

        setMyWechat(value) {
            this.myWechat = String(value || '').trim()
            this.persist()
        },

        // 3.4.3 缘分契合点（接收方申请卡片顶部高亮）
        getFatePoint(userId) {
            const target = findUserById(userId)
            return target ? buildFatePoint(target, currentUserProfile) : ''
        },

        // 申请有效期剩余
        applicationRemain(applicationId) {
            const record = this.getApplication(applicationId)
            if (!record) return 0
            return Math.max(0, record.expiresAt - Date.now())
        },

        // 该对象最近一条申请（用于状态展示）
        getLatestApplication(userId) {
            const id = Number(userId)
            const list = this.applications
                .filter(item => Number(item.toUserId) === id || Number(item.fromUserId) === id)
                .sort((a, b) => b.createdAt - a.createdAt)
            return list[0] || null
        },

        resetAll() {
            this.myWechat = myMockWechat
            this.matches = seedMatches()
            this.applications = seedApplications()
            this.successShown = []
            this.seeded = true
            this.persist()
        }
    }
})
