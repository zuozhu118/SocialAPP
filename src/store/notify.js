import { defineStore } from 'pinia'
import useUserStore from './user'
import useEquityStore from './equity'
import { findUserById, todayStr } from '@/mock/index'
import {
    NOTIFY_TABS,
    QUOTA_REMIND_HOURS,
    notifyMetaOf,
    formatNotifyTime,
    seedNotifications
} from '@/mock/notifications'

const STORAGE_KEY = 'notify_v1'
// 通知列表上限，避免本地存储膨胀
const MAX_LIST = 60
// pages/notifications/index 在 tabBar 中的下标（匹配 0 / 广场 1 / 通知 2 / 我的 3）
const NOTIFY_TAB_INDEX = 2

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
        console.warn('[notify] 本地缓存失败', e)
    }
}

/**
 * 3.8 服务通知
 * 硬性规则：
 * 1. 游客不推送任何匹配类通知（不展示具体是谁心动 / 谁申请）
 * 2. 注册未实名时，匹配类通知统一降级为「实名引导」，不泄露对方身份
 * 3. 额度提醒只推男性，9 点 / 20 点各一次，女性禁止
 * 4. 页内只有小红点与角标，不做任何强制弹窗
 */
export default defineStore('notify', {
    state: () => ({
        seeded: false,
        // 通知记录（newest first）
        list: [],
        // 当日已推送的额度提醒档位：{ '2026-11-11': [9] }
        quotaPushed: {},
        // 自增 id 游标（seed 用 101-110，运行时从 200 起）
        seq: 200
    }),

    getters: {
        // 装饰后的完整列表（时间文案 / 图标 / 分类）
        all: (state) =>
            state.list.map(item => {
                const meta = notifyMetaOf(item.kind)
                return {
                    ...item,
                    type: meta.type,
                    icon: meta.icon,
                    bgColor: meta.bgColor,
                    kindLabel: meta.label,
                    time: formatNotifyTime(item.createdAt)
                }
            }),

        unreadCount: (state) => state.list.filter(item => !item.read).length,

        interactUnread: (state) =>
            state.list.filter(item => !item.read && notifyMetaOf(item.kind).type === 'interact').length,

        systemUnread: (state) =>
            state.list.filter(item => !item.read && notifyMetaOf(item.kind).type === 'system').length,

        hasUnread() {
            return this.unreadCount > 0
        },

        // 分类 tab（含未读数）
        tabs() {
            return NOTIFY_TABS.map(tab => {
                let count = 0
                if (tab.value === 'all') count = this.unreadCount
                else if (tab.value === 'interact') count = this.interactUnread
                else count = this.systemUnread
                return { ...tab, count }
            })
        },

        // 指定分类的列表
        listOf() {
            return (tab = 'all') =>
                tab === 'all' ? this.all : this.all.filter(item => item.type === tab)
        },

        totalCount: (state) => state.list.length,

        // 今日是否已推过额度提醒（调试 / 验证用）
        quotaPushedToday: (state) => state.quotaPushed[todayStr()] || []
    },

    actions: {
        // ===== 初始化 / 持久化 =====
        restore() {
            const cache = readCache()
            if (cache && cache.seeded) {
                this.list = cache.list || []
                this.quotaPushed = cache.quotaPushed || {}
                this.seq = cache.seq || 200
                this.seeded = true
            } else {
                this.resetSeed()
            }
        },

        resetSeed() {
            this.list = seedNotifications()
            this.quotaPushed = {}
            this.seq = 200
            this.seeded = true
            this.persist()
        },

        persist() {
            writeCache({
                seeded: this.seeded,
                list: this.list,
                quotaPushed: this.quotaPushed,
                seq: this.seq
            })
        },

        // ===== 写入 =====
        /**
         * 底层写入：所有场景最终都走这里
         */
        push(payload = {}) {
            const { kind = '', title = '', desc = '', actionText = '', actionType = '', targetId = null, targetName = '' } = payload
            this.seq += 1
            const record = {
                id: this.seq,
                kind,
                title,
                desc,
                createdAt: Date.now(),
                read: false,
                actionText,
                actionType,
                targetId,
                targetName
            }
            this.list.unshift(record)
            if (this.list.length > MAX_LIST) this.list.length = MAX_LIST
            this.persist()
            this.syncBadge()
            return record
        },

        /**
         * 收到心动：游客不推；未实名降级为实名引导
         */
        pushLikeMe(userId) {
            const user = useUserStore()
            if (user.level === 'guest') return null
            const target = findUserById(userId)
            const name = target?.name || '有人'
            if (user.level === 'registered') {
                return this.push({
                    kind: 'realname_guide',
                    title: '有人喜欢了你',
                    desc: '完成实名认证后即可查看是谁对你心动，并回应这份喜欢',
                    actionText: '去实名',
                    actionType: 'realname_guide'
                })
            }
            return this.push({
                kind: 'like_me',
                title: '有人喜欢了你',
                desc: `${name} 对你表达了喜欢`,
                actionText: '查看',
                actionType: 'view_like_list',
                targetId: Number(userId),
                targetName: name
            })
        },

        /**
         * 匹配成功：游客不推；未实名降级为实名引导
         */
        pushMatchSuccess(userId) {
            const user = useUserStore()
            if (user.level === 'guest') return null
            const target = findUserById(userId)
            const name = target?.name || 'TA'
            if (user.level === 'registered') {
                return this.push({
                    kind: 'realname_guide',
                    title: '你与一位同城用户双向心动',
                    desc: '完成实名认证后即可查看对方并申请交换微信',
                    actionText: '去实名',
                    actionType: 'realname_guide'
                })
            }
            return this.push({
                kind: 'match_success',
                title: '匹配成功',
                desc: `你和 ${name} 双向喜欢，现在可以申请交换微信了`,
                actionText: '去申请',
                actionType: 'apply_wechat',
                targetId: Number(userId),
                targetName: name
            })
        },

        /**
         * 收到微信申请：仅实名用户可见对方身份
         */
        pushApplyReceive(userId) {
            const user = useUserStore()
            if (user.level === 'guest') return null
            const target = findUserById(userId)
            const name = target?.name || 'TA'
            if (user.level === 'registered') {
                return this.push({
                    kind: 'realname_guide',
                    title: '有人想与你交换微信',
                    desc: '完成实名认证后即可处理微信申请',
                    actionText: '去实名',
                    actionType: 'realname_guide'
                })
            }
            return this.push({
                kind: 'apply_receive',
                title: '收到微信申请',
                desc: `${name} 申请与你交换微信，是否同意？`,
                actionText: '去处理',
                actionType: 'handle_apply',
                targetId: Number(userId),
                targetName: name
            })
        },

        /**
         * 申请处理结果（对方同意 / 拒绝）
         */
        pushApplyResult(userId, agreed = true) {
            const user = useUserStore()
            if (user.level === 'guest') return null
            const target = findUserById(userId)
            const name = target?.name || 'TA'
            return this.push({
                kind: agreed ? 'apply_agreed' : 'apply_rejected',
                title: agreed ? '微信申请已通过' : '微信申请已拒绝',
                desc: agreed
                    ? `${name} 同意了你的申请，微信号已互相展示`
                    : `${name} 暂未回应你的微信申请，缘分值得耐心等待`,
                actionText: agreed ? '查看结果' : '查看结果',
                actionType: agreed ? 'apply_result_agreed' : 'apply_result_rejected',
                targetId: Number(userId),
                targetName: name
            })
        },

        /**
         * 3.6 微信申请 24h 未处理自动拒绝
         */
        pushAutoRejected(userId) {
            const user = useUserStore()
            if (user.level === 'guest') return null
            const target = findUserById(userId)
            const name = target?.name || 'TA'
            return this.push({
                kind: 'apply_rejected',
                title: '申请已自动关闭',
                desc: `${name} 24 小时内未处理你的微信申请，已自动关闭，缘分值得耐心等待`,
                actionText: '查看结果',
                actionType: 'apply_result_rejected',
                targetId: Number(userId),
                targetName: name
            })
        },

        /**
         * 动态互动：kind = like_dynamic | comment_dynamic
         * 3.6 女性用户通知差异化：只推匹配成功 / 收到申请等正向消息，
         * 点赞、评论只在页内显示小红点，不做推送打扰
         */
        pushDynamicInteract(kind, { name = '有人', dynamicId = null, text = '' } = {}) {
            const user = useUserStore()
            if (user.level === 'guest') return null
            if (user.gender === 'female') return null
            const isComment = kind === 'comment_dynamic'
            return this.push({
                kind: isComment ? 'comment_dynamic' : 'like_dynamic',
                title: isComment ? '收到评论' : '收到点赞',
                desc: isComment ? `${name} 评论了你的动态：${text}` : `${name} 赞了你的动态`,
                actionText: isComment ? '回复' : '查看动态',
                actionType: isComment ? 'reply_comment' : 'view_dynamic',
                targetId: dynamicId
            })
        },

        /**
         * 资质认证通过（学历 / 工作）
         */
        pushCertPass(type) {
            const label = type === 'work' ? '工作认证' : '学历认证'
            return this.push({
                kind: 'cert_pass',
                title: '认证通过',
                desc: `你的${label}已审核通过，个人主页已展示对应标识`,
                actionText: '查看主页',
                actionType: 'view_profile',
                targetId: 0
            })
        },

        /**
         * 动态被标记为优质
         */
        pushQuality(dynamicId) {
            return this.push({
                kind: 'quality',
                title: '动态被标记为优质',
                desc: '你发布的动态被评选为优质内容，曝光已加权',
                actionText: '查看动态',
                actionType: 'view_dynamic',
                targetId: dynamicId
            })
        },

        /**
         * 邀请裂变：好友加入 / 好友实名奖励到账
         */
        pushInviteJoined(name) {
            return this.push({
                kind: 'invite_joined',
                title: '好友已接受邀请',
                desc: `${name} 通过你的邀请加入，完成实名后双方各得永久心动次数`,
                actionText: '查看邀请',
                actionType: 'view_invite'
            })
        },

        pushInviteReward(name, likes, asInviter = true) {
            return this.push({
                kind: 'invite_reward',
                title: asInviter ? '邀请奖励已到账' : '受邀奖励已到账',
                desc: asInviter
                    ? `${name} 已完成实名认证，你获得 ${likes} 次永久心动`
                    : `你通过好友邀请完成实名，双方各得 ${likes} 次永久心动`,
                actionText: '查看权益',
                actionType: 'view_equity'
            })
        },

        // ===== 3.7 举报通知 =====
        // 举报受理：告知 AI 初审时效与人工审核时效
        pushReportReceived(report) {
            const female = report.priority === 'female'
            const sla = female ? '12 小时' : '24 小时'
            return this.push({
                kind: 'report_received',
                title: '举报已受理',
                desc: `你反馈的「${report.reasonLabel}」已进入 AI 初审（5 分钟内完成），人工审核将在 ${sla}内出结果${
                    female ? '，已为你开启女性专属加速通道' : ''
                }`,
                actionText: '查看进度',
                actionType: 'view_reports'
            })
        },

        // 举报处理结果：女性用户推专属感谢通知（3.6）
        pushReportResult(report) {
            const user = useUserStore()
            const female = user.gender === 'female'
            const punished = report.result === 'punished'
            return this.push({
                kind: 'report_result',
                title: female ? '感谢你守护社区' : '举报已处理',
                desc: punished
                    ? female
                        ? `你反馈的「${report.reasonLabel}」已核实并处罚，因为有你的反馈，这里的女孩更安全了`
                        : `你反馈的「${report.reasonLabel}」已核实，平台已对违规账号作出处罚`
                    : `你反馈的「${report.reasonLabel}」经复核暂未发现违规，我们会持续关注`,
                actionText: '查看进度',
                actionType: 'view_reports'
            })
        },

        // ===== 3.8 额度提醒（男 9 点 / 20 点，女性禁止）=====
        /**
         * @param {number} hourOverride 仅调试用，指定「当前小时」
         * @returns {{ pushed: boolean, reason?: string, slot?: number }}
         */
        ensureQuotaReminder(hourOverride) {
            const user = useUserStore()
            // 硬性规则：女性禁止推送额度提醒
            if (user.gender !== 'male') return { pushed: false, reason: 'female_forbidden' }
            // 额度本身是实名权益，未实名不推
            if (user.level !== 'certified') return { pushed: false, reason: 'not_certified' }

            const hour = Number.isFinite(hourOverride) ? Number(hourOverride) : new Date().getHours()
            const slot = [...QUOTA_REMIND_HOURS].filter(h => hour >= h).pop()
            if (!slot) return { pushed: false, reason: 'before_slot' }

            const day = todayStr()
            const pushedSlots = this.quotaPushed[day] || []
            if (pushedSlots.includes(slot)) return { pushed: false, reason: 'already', slot }

            const equity = useEquityStore()
            // 额度已经用完就没什么可提醒的了
            if (equity.remainBrowse <= 0 && equity.remainLike <= 0) {
                return { pushed: false, reason: 'no_quota', slot }
            }

            this.push({
                kind: 'quota_remind',
                title: slot >= 20 ? '晚间额度提醒' : '早间额度提醒',
                desc: `你今日还有 ${equity.remainBrowse} 次浏览、${equity.remainLike} 次心动未使用，24 点后自动清零`,
                actionText: '去使用',
                actionType: 'view_equity'
            })
            // 只保留当天记录，避免跨天累积
            this.quotaPushed = { [day]: [...pushedSlots, slot] }
            this.persist()
            return { pushed: true, slot }
        },

        // ===== 已读 / 清空 =====
        markRead(id) {
            const record = this.list.find(item => item.id === Number(id))
            if (!record || record.read) return false
            record.read = true
            this.persist()
            this.syncBadge()
            return true
        },

        markAllRead(tab = 'all') {
            let changed = 0
            this.list.forEach(item => {
                if (item.read) return
                if (tab !== 'all' && notifyMetaOf(item.kind).type !== tab) return
                item.read = true
                changed++
            })
            if (changed) {
                this.persist()
                this.syncBadge()
            }
            return changed
        },

        clearAll(tab = 'all') {
            if (tab === 'all') {
                this.list = []
            } else {
                this.list = this.list.filter(item => notifyMetaOf(item.kind).type !== tab)
            }
            this.persist()
            this.syncBadge()
            return this.list.length
        },

        // ===== tabBar 小红点 =====
        // 页内只有小红点与角标，不做任何强制弹窗
        syncBadge() {
            const count = this.unreadCount
            const text = count > 99 ? '99+' : String(count)
            // 显式传入 success / fail，避免 uni 返回 Promise 后产生未捕获的 rejection
            const noop = () => {}
            try {
                if (count > 0) {
                    uni.setTabBarBadge({ index: NOTIFY_TAB_INDEX, text, success: noop, fail: noop })
                } else {
                    uni.removeTabBarBadge({ index: NOTIFY_TAB_INDEX, success: noop, fail: noop })
                }
            } catch (e) {
                // 非 tabBar 页面调用会失败，忽略即可
            }
            return count
        },

        // ===== 调试 =====
        resetAll() {
            this.resetSeed()
            this.syncBadge()
        }
    }
})
