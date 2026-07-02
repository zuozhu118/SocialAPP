<template>
    <view class="publish-page">
        <CustomNavbar title="发布动态" :show-back="true" @back="handleBack">
            <template #right>
                <text class="publish-navbar__publish" @click="handlePublish">发布</text>
            </template>
        </CustomNavbar>

        <view class="publish-content">
            <textarea class="publish-content__input"
                      placeholder="分享你的生活...（至少10个字）"
                      v-model="content"
                      maxlength="500" />
            <text class="publish-content__count">{{ content.length }}/500</text>
        </view>

        <!-- 图片上传 -->
        <view class="publish-images">
            <text class="publish-images__title">添加图片（最多9张）</text>
            <view class="publish-images__list">
                <view v-for="(img, index) in images"
                      :key="index"
                      class="publish-images__item">
                    <image class="publish-images__img" :src="img" mode="aspectFill" />
                    <view class="publish-images__delete" @click="removeImage(index)">✕</view>
                </view>
                <view v-if="images.length < 9"
                      class="publish-images__add"
                      @click="chooseImage">
                    <text class="publish-images__add-icon">+</text>
                    <text class="publish-images__add-text">添加图片</text>
                </view>
            </view>
        </view>

        <!-- 位置标签 -->
        <view class="publish-location">
            <text class="publish-location__label">
                <text class="icon icon-location" /> 位置标签
            </text>
            <view class="publish-location__select" @click="chooseLocation">
                <text :class="location ? 'publish-location__selected' : 'publish-location__placeholder'">
                    {{ location || '添加位置，获得更多曝光' }}
                </text>
                <text class="publish-location__arrow">›</text>
            </view>
        </view>

        <!-- 隐私设置 -->
        <view class="publish-privacy">
            <text class="publish-privacy__label">🔒 谁可以看</text>
            <view class="publish-privacy__options">
                <view v-for="(item, index) in privacyOptions"
                      :key="index"
                      class="publish-privacy__option"
                      :class="{ 'publish-privacy__option--active': privacy === index }"
                      @click="privacy = index">
                    <text class="publish-privacy__icon">{{ item.icon }}</text>
                    <text class="publish-privacy__text">{{ item.label }}</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
    import { ref } from 'vue'
    import CustomNavbar from '@/components/common/CustomNavbar.vue'

    const content = ref('')
    const images = ref([])
    const location = ref('')
    const privacy = ref(0)

    const privacyOptions = [
        { icon: '🌍', label: '全部可见' },
        { icon: '👥', label: '仅匹配好友' },
        { icon: '🔒', label: '仅自己可见' }
    ]

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

    const chooseImage = () => {
        const remain = 9 - images.value.length
        uni.chooseImage({
            count: remain,
            success: (res) => {
                images.value.push(...res.tempFilePaths)
            }
        })
    }

    const removeImage = (index) => {
        images.value.splice(index, 1)
    }

    const chooseLocation = () => {
        uni.chooseLocation({
            success: (res) => {
                location.value = res.name || res.address
            }
        })
    }

    const handlePublish = () => {
        if (content.value.length < 10) {
            uni.showToast({ title: '内容至少10个字', icon: 'none' })
            return
        }
        if (images.value.length === 0) {
            uni.showToast({ title: '请至少添加1张图片', icon: 'none' })
            return
        }
        uni.showLoading({ title: '发布中...' })
        setTimeout(() => {
            uni.hideLoading()
            uni.showToast({ title: '发布成功！', icon: 'success' })
            setTimeout(() => uni.navigateBack(), 500)
        }, 1500)
    }
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';

    .publish-page {
        min-height: 100vh;
        background-color: $bg-page;
        padding-bottom: $spacing-lg;
    }

    .publish-navbar__publish {
        font-size: $font-size-md;
        font-weight: $font-weight-medium;
        color: $primary-color;
        cursor: pointer;

        &:active {
            opacity: 0.6;
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

    .publish-images {
        background-color: $bg-card;
        margin: $spacing-sm $page-padding-x;
        border-radius: $radius-card;
        padding: $spacing-md;
        box-shadow: $shadow-card;
    }

    .publish-images__title {
        font-size: $font-size-sm;
        color: $text-secondary;
        display: block;
        margin-bottom: $spacing-sm;
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
        box-shadow: $shadow-card;
    }

    .publish-location__label {
        font-size: $font-size-sm;
        color: $text-secondary;

        .icon {
            font-size: 14px;
        }
    }

    .publish-location__select {
        display: flex;
        align-items: center;
        gap: $spacing-xs;
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
        color: $text-primary;
    }

    .publish-location__arrow {
        font-size: 16px;
        color: $text-helper;
    }

    .publish-privacy {
        background-color: $bg-card;
        margin: $spacing-sm $page-padding-x;
        border-radius: $radius-card;
        padding: $spacing-md;
        box-shadow: $shadow-card;
    }

    .publish-privacy__label {
        font-size: $font-size-sm;
        color: $text-secondary;
        display: block;
        margin-bottom: $spacing-sm;
    }

    .publish-privacy__options {
        display: flex;
        gap: $spacing-sm;
    }

    .publish-privacy__option {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: $spacing-sm;
        background-color: $bg-page;
        border-radius: $radius-sm;
        border: 2px solid transparent;
        cursor: pointer;
        transition: all $duration-fast ease;

        &:active {
            transform: scale(0.95);
        }
    }

    .publish-privacy__option--active {
        border-color: $primary-color;
        background-color: $primary-light-bg;
    }

    .publish-privacy__icon {
        font-size: 18px;
    }

    .publish-privacy__text {
        font-size: $font-size-xs;
        color: $text-secondary;
        margin-top: $spacing-xs;
    }
</style>