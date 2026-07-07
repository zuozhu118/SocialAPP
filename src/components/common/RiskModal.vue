
<template>
    <view class="risk-modal" v-if="visible" @click="handleMaskClick">
        <view class="risk-modal__content" @click.stop>
            <!-- 顶部 -->
            <view class="risk-modal__header">
                <view class="risk-modal__icon-wrap">
                    <text class="risk-modal__icon">⚠️</text>
                </view>
                <text class="risk-modal__title">安全风险提示</text>
            </view>

            <!-- 风险内容 -->
            <view class="risk-modal__body">
                <view class="risk-modal__rule" v-for="(rule, idx) in riskRules" :key="idx">
                    <text class="risk-modal__rule-dot">•</text>
                    <text class="risk-modal__rule-text">{{ rule }}</text>
                </view>
            </view>

            <!-- 底部按钮 -->
            <view class="risk-modal__footer">
                <button class="risk-modal__btn risk-modal__btn--cancel" @click="handleCancel">
                    取消
                </button>
                <button class="risk-modal__btn risk-modal__btn--confirm" @click="handleConfirm">
                    已知晓，继续申请
                </button>
            </view>
        </view>
    </view>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

const riskRules = [
    '平台仅提供联系方式交换渠道，微信聊天、线下见面均脱离平台监管',
    '请勿向对方转账、投资、刷单，谨防杀猪盘诈骗',
    '如遇骚扰或诈骗，请立即举报并报警'
]

const handleMaskClick = () => {
    // 点击遮罩不关闭，强制用户做出选择
}

const handleConfirm = () => {
    emit('confirm')
    emit('update:visible', false)
}

const handleCancel = () => {
    emit('cancel')
    emit('update:visible', false)
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.risk-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;

    &__content {
        width: 85%;
        max-width: 340px;
        background-color: #FFFFFF;
        border-radius: 20px;
        padding: 24px 20px 20px;
        animation: modalIn 0.3s ease;
    }

    @keyframes modalIn {
        from {
            transform: scale(0.92);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }

    &__header {
        text-align: center;
        margin-bottom: 16px;
    }

    &__icon-wrap {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: linear-gradient(135deg, #FFF3E0, #FFE0B2);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 8px;
    }

    &__icon {
        font-size: 26px;
    }

    &__title {
        font-size: 17px;
        font-weight: 600;
        color: #E65100;
        display: block;
    }

    &__body {
        background-color: #FFF8F0;
        border-radius: 12px;
        padding: 14px 16px;
        margin-bottom: 20px;
        border-left: 3px solid #FF9800;
    }

    &__rule {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        margin-bottom: 4px;

        &:last-child {
            margin-bottom: 0;
        }
    }

    &__rule-dot {
        color: #FF9800;
        font-size: 14px;
        flex-shrink: 0;
        line-height: 1.6;
    }

    &__rule-text {
        font-size: 13px;
        color: #5D4037;
        line-height: 1.6;
    }

    &__footer {
        display: flex;
        gap: 12px;
    }

    &__btn {
        flex: 1;
        padding: 12px 0;
        border-radius: 24px;
        font-size: 15px;
        font-weight: 500;
        border: none;
        text-align: center;
        line-height: 1.4;

        &--cancel {
            background-color: #F5F5F5;
            color: $text-secondary;
        }

        &--confirm {
            background: linear-gradient(90deg, #FF6B35, #FF4500);
            color: #FFFFFF;
            box-shadow: 0 4px 12px rgba(255, 69, 0, 0.3);
        }

        &:active {
            opacity: 0.85;
        }
    }
}
</style>