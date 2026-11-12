import { defineStore } from 'pinia'
import useUserStore from './user'
import useEquityStore from './equity'
import useNotifyStore from './notify'
import { currentUserProfile } from '@/mock/users'
import { INVITE_REWARD_LIKES, codeOf, seedInviteRecords } from '@/mock/invite'

const STORAGE_KEY = 'invite_v1'

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
        console.warn('[invite] 本地缓存失败', e)
    }
}

/**
 * 3.8 拉新裂变
 * 核心规则：好友通过我的链接加入并完成实名认证后，双方各得 5 次永久心动次数；无现金奖励。
 * 由于纯前端 mock 只有单账号视角，两个方向分别建模：
 *   - records      我邀请的人（好友实名 → 我 +5）
 *   - invitedBy    我被谁邀请（我实名 → 我 +5，邀请人同步 +5）
 */
export default defineStore('invite', {
    state: () => ({
        seeded: false,
        // 我的专属邀请码
        code: '',
        // 我是被谁的邀请码带来的
        invitedBy: '',
        // 我作为被邀请人，奖励是否已发放
        inviteeRewarded: false,
        // 我的邀请人是否已同步获得奖励（mock 记录）
        inviterRewarded: false,
        // 我邀请的好友
        records: [],
        // 分享次数（仅用于页面展示，不做任何奖励）
        shareCount: 0
    }),

    getters: {
        hasInviter: (state) => !!state.invitedBy,

        inviteCount: (state) => state.records.length,

        // 已完成实名（奖励已发放）
        successCount: (state) => state.records.filter(item => !!item.realnameAt).length,

        // 已加入但还没实名（奖励待发放）
        pendingCount: (state) => state.records.filter(item => !item.realnameAt).length,

        // 我通过邀请累计获得的永久心动次数
        rewardLikes: (state) =>
            state.records.filter(item => !!item.realnameAt).length * INVITE_REWARD_LIKES,

        // 待发放的奖励次数（好友实名后到账）
        pendingLikes: (state) =>
            state.records.filter(item => !item.realnameAt).length * INVITE_REWARD_LIKES,

        rewardText: (state) => {
            const total = state.records.length
            const done = state.records.filter(item => !!item.realnameAt).length
            if (!total) return '还没有好友通过你的邀请加入'
            return `已邀请 ${total} 位好友，其中 ${done} 位完成实名`
        },

        // 邀请记录（新的在前）
        recordList: (state) =>
            [...state.records].sort((a, b) => b.joinedAt - a.joinedAt)
    },

    actions: {
        // ===== 初始化 / 持久化 =====
        restore() {
            const cache = readCache()
            if (cache && cache.seeded) {
                this.code = cache.code || ''
                this.invitedBy = cache.invitedBy || ''
                this.inviteeRewarded = !!cache.inviteeRewarded
                this.inviterRewarded = !!cache.inviterRewarded
                this.records = cache.records || []
                this.shareCount = cache.shareCount || 0
                this.seeded = true
            } else {
                this.resetSeed()
            }
            this.ensureCode()
        },

        resetSeed() {
            this.invitedBy = ''
            this.inviteeRewarded = false
            this.inviterRewarded = false
            this.records = seedInviteRecords()
            this.shareCount = 0
            this.seeded = true
            this.code = codeOf(currentUserProfile.id)
            this.persist()
        },

        persist() {
            writeCache({
                seeded: this.seeded,
                code: this.code,
                invitedBy: this.invitedBy,
                inviteeRewarded: this.inviteeRewarded,
                inviterRewarded: this.inviterRewarded,
                records: this.records,
                shareCount: this.shareCount
            })
        },

        // 邀请码懒生成（老缓存没有 code 时补齐）
        ensureCode() {
            if (!this.code) {
                this.code = codeOf(currentUserProfile.id)
                this.persist()
            }
            return this.code
        },

        // ===== 落地：绑定邀请人 =====
        /**
         * 游客从分享链接进入时写入邀请关系
         * 自己点自己的链接、重复绑定、已有邀请人时不覆盖
         */
        bindInviter(code) {
            const value = String(code || '').trim().toUpperCase()
            if (!value) return { ok: false, reason: 'empty' }
            this.ensureCode()
            if (value === this.code) return { ok: false, reason: 'self' }
            if (this.invitedBy) return { ok: false, reason: 'exists' }
            this.invitedBy = value
            this.persist()
            return { ok: true, code: value }
        },

        logShare() {
            this.shareCount += 1
            this.persist()
            return this.shareCount
        },

        // ===== 我被邀请：我完成实名后双方各得奖励 =====
        settleInviteeReward() {
            const user = useUserStore()
            if (user.level !== 'certified') return { ok: false, reason: 'not_certified' }
            if (!this.invitedBy) return { ok: false, reason: 'no_inviter' }
            if (this.inviteeRewarded) return { ok: false, reason: 'already' }

            this.inviteeRewarded = true
            // 邀请人同步获得（真实场景由服务端下发，这里只记状态）
            this.inviterRewarded = true
            this.persist()

            const equity = useEquityStore()
            equity.addPermanentLikes(INVITE_REWARD_LIKES, '受邀好友实名奖励')
            useNotifyStore().pushInviteReward('好友', INVITE_REWARD_LIKES, false)
            return { ok: true, likes: INVITE_REWARD_LIKES }
        },

        // ===== 我邀请的好友完成实名：我获得奖励 =====
        settleFriend(recordId) {
            const record = this.records.find(item => item.id === recordId)
            if (!record) return { ok: false, reason: 'not_found' }
            if (record.realnameAt) return { ok: false, reason: 'already' }

            record.realnameAt = Date.now()
            record.rewarded = true
            this.persist()

            const equity = useEquityStore()
            equity.addPermanentLikes(INVITE_REWARD_LIKES, '邀请好友实名奖励')
            useNotifyStore().pushInviteReward(record.name, INVITE_REWARD_LIKES, true)
            return { ok: true, likes: INVITE_REWARD_LIKES, name: record.name }
        },

        // ===== 调试：模拟好友加入 / 好友实名 =====
        simulateFriendJoin(name = '新好友') {
            const suffix = String(this.records.length + 1).padStart(2, '0')
            const record = {
                id: `inv_sim_${Date.now()}`,
                name: `${name}${suffix}`,
                avatar: '',
                joinedAt: Date.now(),
                realnameAt: 0,
                rewarded: false
            }
            this.records.unshift(record)
            this.persist()
            useNotifyStore().pushInviteJoined(record.name)
            return record
        },

        // 取最近一位还没实名的好友，模拟其完成实名
        simulateFriendRealname() {
            const target = [...this.records]
                .filter(item => !item.realnameAt)
                .sort((a, b) => b.joinedAt - a.joinedAt)[0]
            if (!target) return { ok: false, reason: 'no_pending' }
            return this.settleFriend(target.id)
        },

        resetAll() {
            this.resetSeed()
            this.ensureCode()
        }
    }
})
