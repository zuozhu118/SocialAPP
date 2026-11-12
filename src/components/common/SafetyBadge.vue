<template>
    <!-- 第 2 章硬性标准：全页面统一「实名核验・反诈保障」安全徽章 -->
    <view class="safety-badge" :class="{ 'safety-badge--inline': inline }">
        <text class="safety-badge__icon">🛡️</text>
        <text class="safety-badge__text">实名核验 · 反诈保障</text>
    </view>
</template>

<script setup>
    defineProps({
        // inline：行内紧凑样式（嵌入导航栏下方时使用）
        inline: {
            type: Boolean,
            default: false
        }
    })
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';

    .safety-badge {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 3px 0;

        &--inline {
            padding: 0;
        }

        &__icon {
            font-size: 10px;
            line-height: 1;
        }

        &__text {
            font-size: 9px;
            line-height: 1.4;
            color: $primary-dark;
            letter-spacing: 0.5px;
        }
    }
</style>
