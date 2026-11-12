<template>
    <view class="app">
        <slot />
    </view>
</template>

<script>
    import {
        useUserStore,
        useEquityStore,
        useMatchStore,
        useSquareStore,
        useSocialStore,
        useNotifyStore,
        useInviteStore,
        usePrivacyStore,
        useRiskStore
    } from '@/store/index'
    import { businessCopy } from '@/mock/copy'

    export default {
        onLaunch(options = {}) {
            // 恢复本地登录态与额度数据（纯前端 mock，无后端依赖）
            try {
                const userStore = useUserStore()
                const equityStore = useEquityStore()
                const matchStore = useMatchStore()
                const squareStore = useSquareStore()
                const socialStore = useSocialStore()
                const notifyStore = useNotifyStore()
                const inviteStore = useInviteStore()
                userStore.restore()
                equityStore.init(userStore.gender)
                matchStore.restore()
                squareStore.restore()
                socialStore.restore()
                notifyStore.restore()
                inviteStore.restore()
                // 3.6 / 3.7 隐私与风控
                usePrivacyStore().restore()
                useRiskStore().restore()

                // 第 8 章：弱网 / 系统异常统一文案（全页面禁止自定义指责类文字）
                try {
                    uni.offNetworkStatusChange && uni.offNetworkStatusChange()
                    uni.onNetworkStatusChange((res) => {
                        if (!res.isConnected) {
                            uni.showToast({ title: '网络似乎断开了，请检查网络设置', icon: 'none' })
                        } else if (res.networkType && res.networkType !== 'wifi' && res.networkType !== 'unknown') {
                            uni.showToast({ title: businessCopy.weakNetwork, icon: 'none' })
                        }
                    })
                    uni.onError && uni.onError((err) => {
                        console.warn('[App] 全局异常', err)
                        uni.showToast({ title: businessCopy.systemError, icon: 'none' })
                    })
                } catch (e) {
                    console.warn('[App] 全局监听注册失败', e)
                }

                // 3.8 冷启动直接从分享链接进入时，先绑定邀请关系
                const query = options.query || {}
                if (query.invite) inviteStore.bindInviter(query.invite)
            } catch (e) {
                console.warn('[App] 状态恢复失败', e)
            }
        },
        onShow() {
            // 跨天时自动重置每日额度；顺带校验 3 天申请有效期
            try {
                useEquityStore().ensureToday()
                useMatchStore().expireCheck()
                useSocialStore().ensureToday()
                // 3.8 服务通知：额度提醒（男 9 点 / 20 点，女性禁止）+ tabBar 小红点
                const notifyStore = useNotifyStore()
                notifyStore.ensureQuotaReminder()
                notifyStore.syncBadge()
                // 3.8 裂变：我从邀请链接进入并已实名时，结算双方奖励（幂等）
                useInviteStore().settleInviteeReward()
                // 3.6 隐私：微信申请 24h 未处理自动拒绝（女性默认开启）
                useMatchStore().autoRejectCheck()
                // 3.7 举报：AI 初审 5 分钟 → 人工审核 → 到期出结果
                useRiskStore().advanceReports()
            } catch (e) {
                console.warn('[App] 额度刷新失败', e)
            }
        },
        onHide() {

        }
    }
</script>

<style lang="scss">
    .app {
        min-height: 100vh;
        background-color: $bg-page;
    }
</style>
