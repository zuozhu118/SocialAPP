<template>
    <view class="app">
        <slot />
    </view>
</template>

<script>
    import { useUserStore, useEquityStore, useMatchStore, useSquareStore, useSocialStore } from '@/store/index'

    export default {
        onLaunch() {
            // 恢复本地登录态与额度数据（纯前端 mock，无后端依赖）
            try {
                const userStore = useUserStore()
                const equityStore = useEquityStore()
                const matchStore = useMatchStore()
                const squareStore = useSquareStore()
                const socialStore = useSocialStore()
                userStore.restore()
                equityStore.init(userStore.gender)
                matchStore.restore()
                squareStore.restore()
                socialStore.restore()
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
