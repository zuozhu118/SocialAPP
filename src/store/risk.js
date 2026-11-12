import { defineStore } from 'pinia'
import useUserStore from './user'
import useNotifyStore from './notify'
import useMatchStore from './match'
import useSquareStore from './square'
import useSocialStore from './social'
import {
    AUDIT_SLA,
    REPORT_REASONS,
    REPORT_STATUS,
    PENALTIES,
    reasonOf,
    penaltyOf,
    RISK_THRESHOLD,
    RISK_BASE,
    RISK_EVENTS,
    seedReports
} from '@/mock/risk'

const STORAGE_KEY = 'risk_v1'
const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

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
        console.warn('[risk] 本地缓存失败', e)
    }
}

// 按举报类型给出默认梯度处罚
const defaultPenaltyOf = (report) => {
    if (report.category === 'fraud' || report.category === 'porn') return 'ban'
    if (report.category === 'harassment') return 'ban_post'
    return 'remove'
}

/**
 * 3.7 风控、举报、账号合规
 * - 7 类举报，AI 初审 5 分钟 → 人工审核（普通 24h / 女性骚扰 12h 置顶）
 * - 梯度处罚：下架 → 禁发 7 天 → 限制匹配 → 永久封禁
 * - 账号注销：资料脱敏、手机号即时释放、实名留存 180 天、身份证 180 天不可再实名
 * - 反作弊：风控分低于阈值自动降权，降权账号不向女性用户推送
 */
export default defineStore('risk', {
    state: () => ({
        seeded: false,
        // 我提交的举报
        reports: [],
        // 我的账号处罚（运营下发）
        penalties: { code: '', level: 0, until: 0, reason: '' },
        // 风控分（100 为满分，低于 60 降权）
        riskScore: RISK_BASE,
        riskEvents: [],
        // 注销状态
        deactivation: {
            status: 'none',      // none | done
            requestedAt: 0,
            effectiveAt: 0,
            phoneReleasedAt: 0,
            realnamePurgeAt: 0,
            idLockUntil: 0
        }
    }),

    getters: {
        reportCount: (state) => state.reports.length,

        pendingReports: (state) => state.reports.filter(item => item.status !== 'done').length,

        doneReports: (state) => state.reports.filter(item => item.status === 'done').length,

        // 女性骚扰 / 诱导转账 / 色情类举报置顶，其余按时间倒序
        sortedReports: (state) => {
            const weight = (item) => (item.priority === 'female' ? 1 : 0)
            return [...state.reports].sort((a, b) => {
                if (weight(a) !== weight(b)) return weight(b) - weight(a)
                return b.createdAt - a.createdAt
            })
        },

        // 账号处罚状态
        penaltyActive: (state) => {
            if (!state.penalties.code) return false
            if (state.penalties.code === 'ban') return true
            return state.penalties.until > Date.now()
        },

        accountStatus() {
            if (!this.penaltyActive) return 'normal'
            return this.penalties.code === 'ban' ? 'banned' : 'restricted'
        },

        penaltyLabel() {
            const hit = penaltyOf(this.penalties.code)
            return hit ? hit.label : ''
        },

        // 反作弊：风控分低于阈值即降权（不向女性用户推荐）
        deprioritized: (state) => state.riskScore < RISK_THRESHOLD,

        riskLabel: (state) => {
            if (state.riskScore >= 90) return '账号状态良好'
            if (state.riskScore >= RISK_THRESHOLD) return '存在轻微异常行为'
            return '账号已降权，暂不向女性用户推荐'
        },

        // 注销相关
        deactivated: (state) => state.deactivation.status === 'done',

        idLockRemainDays: (state) => {
            if (!state.deactivation.idLockUntil) return 0
            const diff = state.deactivation.idLockUntil - Date.now()
            return diff > 0 ? Math.ceil(diff / DAY) : 0
        },

        // 举报时效剩余（毫秒）
        reportRemain: (state) => (id) => {
            const record = state.reports.find(item => item.id === id)
            if (!record || record.status === 'done') return 0
            return Math.max(0, record.deadlineAt - Date.now())
        }
    },

    actions: {
        // ===== 初始化 / 持久化 =====
        restore() {
            const cache = readCache()
            if (cache && cache.seeded) {
                this.reports = cache.reports || []
                this.penalties = cache.penalties || { code: '', level: 0, until: 0, reason: '' }
                this.riskScore = Number.isFinite(cache.riskScore) ? cache.riskScore : RISK_BASE
                this.riskEvents = cache.riskEvents || []
                this.deactivation = cache.deactivation || this.deactivation
                this.seeded = true
            } else {
                this.resetAll()
            }
            this.advanceReports()
        },

        persist() {
            writeCache({
                seeded: this.seeded,
                reports: this.reports,
                penalties: this.penalties,
                riskScore: this.riskScore,
                riskEvents: this.riskEvents,
                deactivation: this.deactivation
            })
        },

        resetAll() {
            this.reports = seedReports()
            this.penalties = { code: '', level: 0, until: 0, reason: '' }
            this.riskScore = RISK_BASE
            this.riskEvents = []
            this.deactivation = {
                status: 'none',
                requestedAt: 0,
                effectiveAt: 0,
                phoneReleasedAt: 0,
                realnamePurgeAt: 0,
                idLockUntil: 0
            }
            this.seeded = true
            this.persist()
        },

        // ===== 3.7 举报 =====
        /**
         * 提交举报
         * @param {{ targetId:number, targetName:string, reason:string, desc?:string, images?:array }} payload
         */
        submitReport(payload = {}) {
            const reason = reasonOf(payload.reason)
            if (!reason) return { ok: false, reason: 'invalid_reason' }

            const user = useUserStore()
            // 3.6 女性用户举报骚扰 / 诈骗 / 色情 → 专属通道，12h 时效并置顶
            const isFemaleChannel = reason.priority === 'female' && user.gender === 'female'
            const now = Date.now()
            const sla = isFemaleChannel ? AUDIT_SLA.female : AUDIT_SLA.normal

            const record = {
                id: `rep_${now}`,
                targetId: Number(payload.targetId) || 0,
                targetName: payload.targetName || '该用户',
                reason: reason.value,
                reasonLabel: reason.title,
                category: reason.category,
                desc: String(payload.desc || '').trim(),
                images: payload.images || [],
                createdAt: now,
                status: 'ai',
                priority: isFemaleChannel ? 'female' : 'normal',
                deadlineAt: now + sla,
                result: '',
                penalty: '',
                handledAt: 0,
                appeal: null
            }
            this.reports.unshift(record)
            this.persist()

            useNotifyStore().pushReportReceived(record)
            return { ok: true, report: record, sla }
        },

        /**
         * 时效推进：AI 初审 5 分钟 → 人工审核；超过 SLA 自动出结果（mock）
         * @param {number} nowTs 调试可传未来时间戳
         */
        advanceReports(nowTs = Date.now()) {
            let changed = false
            this.reports.forEach(record => {
                if (record.status === 'ai' && nowTs - record.createdAt >= AUDIT_SLA.ai) {
                    record.status = 'pending'
                    changed = true
                }
                if (record.status === 'pending' && nowTs >= record.deadlineAt) {
                    record.status = 'done'
                    record.result = 'punished'
                    record.penalty = defaultPenaltyOf(record)
                    record.handledAt = record.deadlineAt
                    changed = true
                    useNotifyStore().pushReportResult(record)
                }
            })
            if (changed) this.persist()
            return changed
        },

        // 运营处理（调试页 / 后台调用）
        handleReport(id, { penalty = '', result = 'punished' } = {}) {
            const record = this.reports.find(item => item.id === id)
            if (!record) return { ok: false, reason: 'not_found' }
            if (record.status === 'done') return { ok: false, reason: 'already' }
            record.status = 'done'
            record.result = result
            record.penalty = result === 'punished' ? (penalty || defaultPenaltyOf(record)) : ''
            record.handledAt = Date.now()
            this.persist()
            useNotifyStore().pushReportResult(record)
            return { ok: true, report: record }
        },

        // 对处理结果发起申诉
        appealReport(id, text) {
            const record = this.reports.find(item => item.id === id)
            if (!record || record.status !== 'done') return { ok: false, reason: 'invalid' }
            if (record.appeal) return { ok: false, reason: 'exists' }
            record.appeal = { text: String(text || '').trim(), at: Date.now(), status: 'pending' }
            this.persist()
            return { ok: true }
        },

        // ===== 3.7 反作弊：风控分 =====
        applyRiskEvent(type) {
            const event = RISK_EVENTS[type]
            if (!event) return { ok: false, reason: 'invalid' }
            const before = this.riskScore
            this.riskScore = Math.max(0, this.riskScore + event.score)
            this.riskEvents.unshift({ type, label: event.label, score: event.score, at: Date.now() })
            this.persist()
            return {
                ok: true,
                score: this.riskScore,
                before,
                deprioritized: this.riskScore < RISK_THRESHOLD,
                label: event.label
            }
        },

        // ===== 3.7 账号注销 =====
        /**
         * 注销：资料脱敏 + 手机号即时释放 + 实名信息留存 180 天 + 身份证 180 天锁定
         */
        applyDeactivation() {
            const now = Date.now()
            this.deactivation = {
                status: 'done',
                requestedAt: now,
                effectiveAt: now,
                phoneReleasedAt: now,
                realnamePurgeAt: now + 180 * DAY,
                idLockUntil: now + 180 * DAY
            }
            this.persist()

            // 资料脱敏：清空本地用户信息与社交资产
            try {
                useUserStore().logout()
                useMatchStore().resetAll()
                useSquareStore().init()
                useSocialStore().resetAll()
            } catch (e) {
                console.warn('[risk] 注销清理失败', e)
            }
            return this.deactivation
        },

        // 重新注册前置校验：身份证是否仍在 180 天锁定期
        canRealnameWithId() {
            const remain = this.idLockRemainDays
            if (remain > 0) {
                return {
                    ok: false,
                    remain,
                    message: `该身份证 180 天内不可再次实名，还需等待 ${remain} 天`
                }
            }
            return { ok: true, remain: 0, message: '' }
        },

        // 调试：恢复账号
        reviveAccount() {
            this.penalties = { code: '', level: 0, until: 0, reason: '' }
            this.riskScore = RISK_BASE
            this.riskEvents = []
            this.persist()
            return { ok: true }
        }
    }
})
