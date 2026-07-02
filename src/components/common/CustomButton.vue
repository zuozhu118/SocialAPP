<template>
    <button class="custom-btn"
            :class="[
      `custom-btn--${type}`,
      { 'custom-btn--block': block },
      { 'custom-btn--disabled': disabled },
      { 'custom-btn--loading': loading }
    ]"
            :disabled="disabled || loading"
            @click="handleClick">
        <text v-if="loading" class="custom-btn__loading">⋯</text>
        <slot v-else />
    </button>
</template>

<script setup>
    const props = defineProps({
        // 按钮类型: primary | secondary | solid | danger
        type: {
            type: String,
            default: 'primary'
        },
        // 是否块级按钮（宽度100%）
        block: {
            type: Boolean,
            default: false
        },
        // 是否禁用
        disabled: {
            type: Boolean,
            default: false
        },
        // 是否加载中
        loading: {
            type: Boolean,
            default: false
        }
    })

    const emit = defineEmits(['click'])

    const handleClick = (e) => {
        if (props.disabled || props.loading) return
        emit('click', e)
    }
</script>

<style lang="scss" scoped>
    .custom-btn {
        @include button-base;
        font-size: $font-size-btn;

        &--primary {
            @include button-primary;
        }

        &--solid {
            @include button-solid;
        }

        &--secondary {
            @include button-secondary;
        }

        &--danger {
            @include button-base;
            background-color: $bg-card;
            border-color: $color-warning;
            color: $color-warning;

            &:active:not(:disabled) {
                opacity: 0.7;
            }

            &:disabled {
                background-color: $disabled-bg;
                border-color: $border-light;
                color: $text-helper;
            }
        }

        &--block {
            width: 100%;
        }

        &--disabled {
            cursor: not-allowed;
            transform: none !important;
        }

        &--loading {
            cursor: not-allowed;
            opacity: 0.7;
        }

        &__loading {
            animation: loading-dots 1.2s ease-in-out infinite;
        }
    }

    @keyframes loading-dots {
        0%, 80%, 100% {
            opacity: 0.3;
        }

        40% {
            opacity: 1;
        }
    }
</style>