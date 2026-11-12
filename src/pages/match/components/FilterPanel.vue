<template>
    <view v-if="visible" class="filter-panel-overlay" @click="handleClose">
        <view class="filter-panel" @click.stop>
            <view class="filter-panel__header">
                <view class="filter-panel__head-left">
                    <text class="filter-panel__title">筛选条件</text>
                    <text class="filter-panel__sub">全部免费 · 随时可改</text>
                </view>
                <text class="filter-panel__reset" @click="resetFilter">重置</text>
            </view>

            <scroll-view class="filter-panel__body" scroll-y show-scrollbar="false">
                <view v-for="group in filterGroups" :key="group.key" class="filter-section">
                    <view class="filter-section__title-row">
                        <text class="filter-section__title">{{ group.title }}</text>
                        <text v-if="group.multiple" class="filter-section__hint">可多选</text>
                    </view>
                    <view class="filter-section__options">
                        <view v-for="option in group.options"
                              :key="option.value"
                              class="filter-section__option"
                              :class="{ 'filter-section__option--active': isActive(group, option.value) }"
                              @click="toggleOption(group, option.value)">
                            {{ option.label }}
                        </view>
                    </view>
                </view>
            </scroll-view>

            <view class="filter-panel__footer">
                <button class="filter-panel__btn filter-panel__btn--cancel" @click="handleClose">
                    取消
                </button>
                <button class="filter-panel__btn filter-panel__btn--apply" @click="handleApply">
                    查看匹配（{{ activeCount }} 个条件）
                </button>
            </view>
        </view>
    </view>
</template>

<script setup>
    import { ref, computed, watch } from 'vue'
    import { filterGroups, defaultFilters } from '@/mock/filters'

    const props = defineProps({
        visible: { type: Boolean, default: false },
        modelValue: { type: Object, default: () => ({}) }
    })

    const emit = defineEmits(['update:visible', 'apply'])

    const local = ref({ ...defaultFilters })

    // 每次打开面板时同步外部条件
    watch(() => props.visible, (visible) => {
        if (visible) {
            local.value = { ...defaultFilters, ...(props.modelValue || {}) }
        }
    })

    const activeCount = computed(() => {
        return filterGroups.reduce((count, group) => {
            const value = local.value[group.key]
            if (group.multiple) return count + (value?.length ? 1 : 0)
            return count + (value && value !== 'all' ? 1 : 0)
        }, 0)
    })

    const isActive = (group, value) => {
        if (group.multiple) {
            if (value === 'all') return !(local.value[group.key] || []).length
            return (local.value[group.key] || []).includes(value)
        }
        return local.value[group.key] === value
    }

    const toggleOption = (group, value) => {
        if (value === 'all') {
            local.value[group.key] = group.multiple ? [] : 'all'
            return
        }
        if (group.multiple) {
            const list = [...(local.value[group.key] || [])]
            const index = list.indexOf(value)
            if (index > -1) {
                list.splice(index, 1)
            } else {
                list.push(value)
            }
            local.value[group.key] = list
            return
        }
        local.value[group.key] = local.value[group.key] === value ? 'all' : value
    }

    const handleClose = () => emit('update:visible', false)

    const resetFilter = () => {
        local.value = { ...defaultFilters }
    }

    const handleApply = () => {
        emit('apply', JSON.parse(JSON.stringify(local.value)))
        emit('update:visible', false)
    }
</script>

<style lang="scss" scoped>
    .filter-panel-overlay {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: rgba(0, 0, 0, 0.3);
        z-index: $z-index-modal;
        display: flex;
        align-items: flex-end;
        animation: filterFade $duration-fast ease;
    }

    .filter-panel {
        background-color: $bg-card;
        border-radius: $radius-card $radius-card 0 0;
        width: 100%;
        max-height: 82vh;
        display: flex;
        flex-direction: column;
        animation: filterSlide $duration-base ease;

        &__header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: $spacing-md $spacing-lg;
            border-bottom: 1px solid $border-light;
        }

        &__head-left {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        &__title {
            font-size: $font-size-md;
            font-weight: $font-weight-medium;
            color: $text-primary;
        }

        &__sub {
            font-size: 10px;
            color: $text-helper;
        }

        &__reset {
            font-size: $font-size-sm;
            color: $text-helper;

            &:active {
                opacity: 0.6;
            }
        }

        &__body {
            padding: $spacing-md $spacing-lg;
            max-height: 58vh;
            flex: 1;
        }

        &__footer {
            display: flex;
            gap: $spacing-sm;
            padding: $spacing-md $spacing-lg $spacing-lg;
            border-top: 1px solid $border-light;
        }

        &__btn {
            flex: 1;
            height: 44px;
            border-radius: $radius-btn;
            font-size: $font-size-sm;
            font-weight: $font-weight-medium;
            border: none;

            &:active {
                transform: scale(0.98);
            }

            &--cancel {
                flex: 0 0 30%;
                background-color: $bg-page;
                color: $text-secondary;
            }

            &--apply {
                background: $primary-gradient;
                color: #FFFFFF;
                box-shadow: $shadow-btn;
            }
        }
    }

    .filter-section {
        margin-bottom: $spacing-lg;

        &:last-child {
            margin-bottom: 0;
        }

        &__title-row {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: $spacing-sm;
        }

        &__title {
            font-size: $font-size-sm;
            font-weight: $font-weight-medium;
            color: $text-primary;
        }

        &__hint {
            font-size: 10px;
            color: $text-helper;
        }

        &__options {
            display: flex;
            flex-wrap: wrap;
            gap: $spacing-xs;
        }

        &__option {
            padding: 6px 16px;
            font-size: $font-size-xs;
            color: $text-secondary;
            background-color: $bg-page;
            border-radius: 16px;
            border: 1px solid transparent;
            transition: all $duration-fast ease;

            &--active {
                color: $primary-color;
                background-color: $primary-light-bg;
                border-color: $primary-color;
                font-weight: $font-weight-medium;
            }

            &:active {
                transform: scale(0.95);
            }
        }
    }

    @keyframes filterFade {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes filterSlide {
        from {
            opacity: 0;
            transform: translateY(24px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
