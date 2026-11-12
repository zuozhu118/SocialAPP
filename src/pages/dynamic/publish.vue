<template>
    <view class="publish-page">
        <CustomNavbar title="发布动态" :show-back="true" @back="handleBack" />

        <!-- 实名提示 -->
        <view class="publish-notice">
            <text class="publish-notice__icon icon icon-shield"></text>
            <text class="publish-notice__text">仅实名用户可发布 · 动态将展示给同城用户</text>
        </view>

        <!-- 文字内容 -->
        <view class="publish-content">
            <textarea class="publish-content__input"
                      placeholder="分享你的生活...（至少 10 个字）"
                      v-model="content"
                      maxlength="500"
                      @input="onContentInput" />
            <text class="publish-content__count">{{ content.length }}/500</text>
        </view>
        <text v-if="contentError" class="publish-error publish-error--content">{{ contentError }}</text>

        <!-- 图片上传 -->
        <view class="publish-images">
            <view class="publish-images__head">
                <text class="publish-images__title">添加图片</text>
                <text class="publish-images__tip">1-9 张，第一张为封面</text>
            </view>
            <view class="publish-images__list">
                <view v-for="(img, index) in images"
                      :key="index"
                      class="publish-images__item">
                    <image class="publish-images__img" :src="img" mode="aspectFill" />
                    <view v-if="index === 0" class="publish-images__cover">封面</view>
                    <view class="publish-images__delete" @click.stop="removeImage(index)">✕</view>
                </view>
                <view v-if="images.length < 9"
                      class="publish-images__add"
                      @click="chooseImage">
                    <text class="publish-images__add-icon">+</text>
                    <text class="publish-images__add-text">添加图片</text>
                </view>
            </view>
        </view>
        <text v-if="imageError" class="publish-error publish-error--image">{{ imageError }}</text>

        <!-- 位置标签（可选） -->
        <view class="publish-location">
            <view class="publish-location__left">
                <text class="publish-location__label">
                    <text class="icon icon-location" /> 位置标签
                </text>
                <text class="publish-location__hint">选填，同城位置可获得更多曝光</text>
            </view>
            <view class="publish-location__select" @click="openLocationSheet">
                <text :class="location ? 'publish-location__selected' : 'publish-location__placeholder'">
                    {{ location || '不显示' }}
                </text>
                <text class="publish-location__arrow">›</text>
            </view>
        </view>

        <!-- 发布规则 -->
        <view class="publish-rules">
            <text class="publish-rules__item">· 请勿发布联系方式（微信 / 手机号 / 二维码），需要交换微信请通过心动匹配</text>
            <text class="publish-rules__item">· 请勿发布广告、诱导转账等违规内容，违者将被限制发布</text>
        </view>

        <!-- 底部唯一主行动按钮 -->
        <view class="publish-footer">
            <button class="publish-submit"
                    :class="{ 'publish-submit--disabled': !canSubmit }"
                    @click="handlePublish">
                发布动态
            </button>
        </view>

        <!-- 位置选择弹层 -->
        <view v-if="locationSheet" class="publish-sheet-mask" @click="closeLocationSheet">
            <view class="publish-sheet" @click.stop>
                <view class="publish-sheet__head">
                    <text class="publish-sheet__title">选择位置</text>
                    <text class="publish-sheet__close icon icon-close" @click="closeLocationSheet"></text>
                </view>
                <scroll-view class="publish-sheet__body" scroll-y>
                    <view class="publish-sheet__item"
                          :class="{ 'publish-sheet__item--active': !location }"
                          @click="selectLocation('')">
                        <text>不显示位置</text>
                        <text v-if="!location" class="publish-sheet__check icon icon-check"></text>
                    </view>
                    <view v-for="item in locationOptions"
                          :key="item"
                          class="publish-sheet__item"
                          :class="{ 'publish-sheet__item--active': location === item }"
                          @click="selectLocation(item)">
                        <text>{{ item }}</text>
                        <text v-if="location === item" class="publish-sheet__check icon icon-check"></text>
                    </view>
                </scroll-view>
            </view>
        </view>

        <!-- 权限引导弹窗 -->
        <PermissionModal :visible="showPermission"
                         :mode="permissionPayload.mode"
                         :title="permissionPayload.title"
                         :content="permissionPayload.content"
                         :confirm-text="permissionPayload.confirmText"
                         @confirm="handlePermissionConfirm"
                         @close="showPermission = false" />
    </view>
</template>

<script setup>
    import { ref, computed } from 'vue'
    import { onLoad } from '@dcloudio/uni-app'
    import CustomNavbar from '@/components/common/CustomNavbar.vue'
    import PermissionModal from '@/components/common/PermissionModal.vue'
    import { useSquareStore } from '@/store/index'
    import { usePermission } from '@/composables/usePermission'
    import { detectContact } from '@/store/match'
    import { locationOptions } from '@/mock/dynamics'
    import { businessCopy } from '@/mock/copy'

    const MIN_LEN = 10
    const MAX_IMAGES = 9

    const square = useSquareStore()
    const { guard } = usePermission()

    const content = ref('')
    const images = ref([])
    const location = ref('')
    const contentError = ref('')
    const imageError = ref('')
    // 记录产生当前错误时的正文，用于「内容真的变了才清除错误」，
    // 避免输入框失焦触发的 input 事件把刚弹出的校验提示冲掉
    const erroredContent = ref('')
    const locationSheet = ref(false)

    // 权限弹窗
    const showPermission = ref(false)
    const permissionPayload = ref({ mode: 'register', title: '', content: '', confirmText: '' })

    const openPermission = (payload) => {
        permissionPayload.value = { ...payload }
        showPermission.value = true
    }

    const handlePermissionConfirm = () => {
        const mode = permissionPayload.value.mode
        showPermission.value = false
        uni.navigateTo({
            url: mode === 'register' ? '/pages/auth/login' : '/pages/auth/realname'
        })
    }

    const canSubmit = computed(() =>
        content.value.trim().length >= MIN_LEN && images.value.length > 0
    )

    onLoad(() => {
        // 进入即校验发布权限（仅实名可发布）
        const { allowed, modal } = guard('publishDynamic')
        if (!allowed) {
            openPermission(modal)
        }
    })

    const handleBack = () => {
        if (content.value || images.value.length > 0) {
            uni.showModal({
                title: '提示',
                content: '确定要退出吗？内容将不会被保存',
                success: (res) => {
                    if (res.confirm) uni.navigateBack()
                }
            })
        } else {
            uni.navigateBack()
        }
    }

    const onContentInput = () => {
        // 仅在正文真正被修改时才清除错误提示
        if (contentError.value && content.value.trim() !== erroredContent.value) {
            contentError.value = ''
        }
    }

    const chooseImage = () => {
        const remain = MAX_IMAGES - images.value.length
        uni.chooseImage({
            count: remain,
            sizeType: ['compressed'],
            success: (res) => {
                images.value.push(...res.tempFilePaths.slice(0, remain))
                imageError.value = ''
            }
        })
    }

    const removeImage = (index) => {
        images.value.splice(index, 1)
    }

    const openLocationSheet = () => {
        locationSheet.value = true
    }

    const closeLocationSheet = () => {
        locationSheet.value = false
    }

    const selectLocation = (value) => {
        location.value = value
        locationSheet.value = false
    }

    const validate = () => {
        const text = content.value.trim()
        contentError.value = ''
        imageError.value = ''
        // 记住当前正文，失焦触发的 input 事件不会误清错误提示
        erroredContent.value = text

        if (!text) {
            contentError.value = '说点什么再发布吧'
            return false
        }
        if (text.length < MIN_LEN) {
            contentError.value = `内容至少 ${MIN_LEN} 个字，让大家更了解你`
            return false
        }
        // 全域导流拦截：正文不允许出现联系方式
        if (detectContact(text)) {
            contentError.value = businessCopy.contactInGreeting
            return false
        }
        if (!images.value.length) {
            imageError.value = '请至少添加 1 张图片'
            return false
        }
        return true
    }

    const handlePublish = () => {
        const { allowed, modal } = guard('publishDynamic')
        if (!allowed) {
            openPermission(modal)
            return
        }
        if (!validate()) return

        uni.showLoading({ title: '发布中...' })
        setTimeout(() => {
            const item = square.publish({
                content: content.value,
                images: images.value,
                location: location.value
            })
            uni.hideLoading()
            uni.showToast({ title: '发布成功！', icon: 'success' })
            setTimeout(() => {
                uni.navigateBack({
                    complete: () => {
                        // 返回后刷新广场列表（新动态排在同城首位）
                    }
                })
            }, 600)
            return item
        }, 700)
    }
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';

    .publish-page {
        min-height: 100vh;
        background-color: $bg-page;
        padding-bottom: 96px;
    }

    // 底部唯一主行动按钮
    .publish-footer {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        padding: $spacing-sm $page-padding-x calc(#{$spacing-sm} + env(safe-area-inset-bottom));
        background-color: rgba(255, 255, 255, 0.96);
        border-top: 1px solid $border-light;
        box-shadow: $shadow-popup;
        z-index: $z-index-dropdown;
    }

    .publish-submit {
        width: 100%;
        height: $btn-height;
        line-height: $btn-height;
        font-size: $font-size-btn;
        font-weight: $font-weight-medium;
        color: #FFFFFF;
        background: $primary-gradient;
        border-radius: $radius-btn;
        box-shadow: $shadow-btn;
        border: none;

        &::after {
            border: none;
        }

        &--disabled {
            background: $disabled-bg;
            color: $text-helper;
            box-shadow: none;
        }

        &:active {
            transform: scale(0.99);
        }
    }

    // 实名提示
    .publish-notice {
        display: flex;
        align-items: center;
        gap: 6px;
        margin: $spacing-md $page-padding-x 0;
        padding: 8px 12px;
        background-color: $primary-light-bg;
        border-radius: $radius-xs;

        &__icon {
            font-size: 13px;
            color: $primary-dark;
        }

        &__text {
            flex: 1;
            font-size: 11px;
            color: $primary-dark;
            line-height: 1.5;
        }
    }

    .publish-content {
        background-color: $bg-card;
        margin: $spacing-sm $page-padding-x;
        border-radius: $radius-card;
        padding: $spacing-md;
        position: relative;
        box-shadow: $shadow-card;
    }

    .publish-content__input {
        width: 100%;
        min-height: 120px;
        font-size: $font-size-md;
        color: $text-primary;
        line-height: 1.8;
        resize: none;
    }

    .publish-content__count {
        position: absolute;
        bottom: $spacing-sm;
        right: $spacing-md;
        font-size: $font-size-xs;
        color: $text-helper;
    }

    .publish-error {
        display: block;
        margin: -4px $page-padding-x 0;
        font-size: 11px;
        color: $color-danger;
        line-height: 1.5;
    }

    .publish-images {
        background-color: $bg-card;
        margin: $spacing-sm $page-padding-x;
        border-radius: $radius-card;
        padding: $spacing-md;
        box-shadow: $shadow-card;
    }

    .publish-images__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: $spacing-sm;
    }

    .publish-images__title {
        font-size: $font-size-sm;
        color: $text-secondary;
    }

    .publish-images__tip {
        font-size: 10px;
        color: $text-helper;
    }

    .publish-images__list {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: $spacing-xs;
    }

    .publish-images__item {
        position: relative;
        padding-bottom: 100%;
        border-radius: $radius-xs;
        overflow: hidden;
    }

    .publish-images__img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .publish-images__cover {
        position: absolute;
        left: 4px;
        bottom: 4px;
        padding: 1px 6px;
        font-size: 9px;
        color: #FFFFFF;
        background-color: rgba(0, 0, 0, 0.45);
        border-radius: 6px;
    }

    .publish-images__delete {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 24px;
        height: 24px;
        background-color: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        color: #FFFFFF;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        cursor: pointer;
    }

    .publish-images__add {
        padding-bottom: 100%;
        border: 2px dashed $border-light;
        border-radius: $radius-xs;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: border-color $duration-fast ease;

        &:active {
            opacity: 0.7;
        }
    }

    .publish-images__add-icon {
        font-size: 32px;
        color: $text-helper;
    }

    .publish-images__add-text {
        font-size: $font-size-xs;
        color: $text-helper;
        margin-top: $spacing-xs;
    }

    .publish-location {
        background-color: $bg-card;
        margin: $spacing-sm $page-padding-x;
        border-radius: $radius-card;
        padding: $spacing-md;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        box-shadow: $shadow-card;
    }

    .publish-location__left {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
    }

    .publish-location__label {
        font-size: $font-size-sm;
        color: $text-secondary;

        .icon {
            font-size: 14px;
        }
    }

    .publish-location__hint {
        font-size: 10px;
        color: $text-helper;
    }

    .publish-location__select {
        display: flex;
        align-items: center;
        gap: $spacing-xs;
        flex-shrink: 0;
        cursor: pointer;

        &:active {
            opacity: 0.6;
        }
    }

    .publish-location__placeholder {
        font-size: $font-size-sm;
        color: $text-helper;
    }

    .publish-location__selected {
        font-size: $font-size-sm;
        color: $primary-dark;
    }

    .publish-location__arrow {
        font-size: 16px;
        color: $text-helper;
    }

    .publish-rules {
        margin: $spacing-md $page-padding-x 0;
        display: flex;
        flex-direction: column;
        gap: 6px;

        &__item {
            font-size: 10px;
            color: $text-helper;
            line-height: 1.6;
        }
    }

    // ----- 位置选择弹层 -----
    .publish-sheet-mask {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: flex-end;
        z-index: $z-index-modal;
    }

    .publish-sheet {
        width: 100%;
        max-height: 60vh;
        background-color: $bg-card;
        border-radius: $radius-card $radius-card 0 0;
        padding: $spacing-md $page-padding-x $spacing-lg;
        display: flex;
        flex-direction: column;
        box-shadow: $shadow-popup;

        &__head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: $spacing-sm;
        }

        &__title {
            font-size: $font-size-md;
            font-weight: $font-weight-medium;
            color: $text-primary;
        }

        &__close {
            font-size: 14px;
            color: $text-helper;
            padding: 4px;
        }

        &__body {
            max-height: 40vh;
        }

        &__item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 0;
            font-size: $font-size-sm;
            color: $text-primary;
            border-bottom: 1px solid $border-light;

            &:last-child {
                border-bottom: none;
            }

            &--active {
                color: $primary-dark;
                font-weight: $font-weight-medium;
            }
        }

        &__check {
            font-size: 13px;
            color: $primary-dark;
        }
    }
</style>
