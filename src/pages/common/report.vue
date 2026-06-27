<template>
  <view class="report-page">
    <!-- 导航栏 -->
    <view class="report-navbar">
      <text class="report-navbar__back" @click="handleBack">‹</text>
      <text class="report-navbar__title">举报</text>
      <view class="report-navbar__right"></view>
    </view>

    <!-- 举报内容 -->
    <view class="report-content">
      <text class="report-content__title">请选择举报原因</text>
      <text class="report-content__desc">我们会优先处理您的举报</text>

      <view 
        v-for="(item, index) in reportReasons" 
        :key="index"
        class="report-option"
        :class="{ 'report-option--active': selected === index }"
        @click="selected = index"
      >
        <text class="report-option__icon">{{ item.icon }}</text>
        <view class="report-option__body">
          <text class="report-option__title">{{ item.title }}</text>
          <text class="report-option__desc">{{ item.desc }}</text>
        </view>
        <view class="report-option__check">
          {{ selected === index ? '✓' : '' }}
        </view>
      </view>

      <!-- 补充说明 -->
      <view class="report-extra">
        <textarea 
          class="report-extra__input" 
          placeholder="请补充详细说明（选填）"
          v-model="description"
          maxlength="200"
        />
        <text class="report-extra__count">{{ description.length }}/200</text>
      </view>

      <!-- 提交按钮 -->
      <button class="report-content__btn" @click="submitReport" :disabled="selected === null">
        提交举报
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const selected = ref(null)
const description = ref('')

const reportReasons = [
  {
    icon: '🎭',
    title: '虚假身份',
    desc: '伪造身份信息、学历、工作等'
  },
  {
    icon: '💬',
    title: '恶意骚扰',
    desc: '言语骚扰、人身攻击等'
  },
  {
    icon: '💰',
    title: '诱导转账',
    desc: '以各种理由要求转账、投资'
  },
  {
    icon: '🔞',
    title: '色情低俗',
    desc: '发布色情、低俗内容'
  },
  {
    icon: '📢',
    title: '广告导流',
    desc: '批量发布广告、导流信息'
  }
]

const handleBack = () => {
  uni.navigateBack()
}

const submitReport = () => {
  if (selected.value === null) {
    uni.showToast({
      title: '请选择举报原因',
      icon: 'none'
    })
    return
  }
  
  uni.showModal({
    title: '提交举报',
    content: '确认提交举报？平台会尽快处理',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({
          title: '举报已提交',
          icon: 'success'
        })
        setTimeout(() => {
          uni.navigateBack()
        }, 500)
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.report-page {
  min-height: 100vh;
  background-color: #FAFAFA;
}

.report-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background-color: #FFFFFF;
  border-bottom: 1px solid #E5E5E5;
}

.report-navbar__back {
  font-size: 28px;
  color: #333333;
  cursor: pointer;
}

.report-navbar__title {
  font-size: 18px;
  font-weight: 500;
  color: #333333;
}

.report-navbar__right {
  width: 30px;
}

.report-content {
  padding: 20px 24px;
}

.report-content__title {
  font-size: 18px;
  font-weight: 500;
  color: #333333;
  display: block;
}

.report-content__desc {
  font-size: 14px;
  color: #666666;
  display: block;
  margin-top: 4px;
}

.report-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background-color: #FFFFFF;
  border-radius: 12px;
  margin-top: 12px;
  border: 2px solid transparent;
  cursor: pointer;
}

.report-option--active {
  border-color: #A8B89A;
  background-color: #F2F5EF;
}

.report-option__icon {
  font-size: 24px;
}

.report-option__body {
  flex: 1;
}

.report-option__title {
  font-size: 15px;
  font-weight: 500;
  color: #333333;
  display: block;
}

.report-option__desc {
  font-size: 13px;
  color: #666666;
  display: block;
}

.report-option__check {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #A8B89A;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.report-extra {
  margin-top: 16px;
  position: relative;
}

.report-extra__input {
  width: 100%;
  height: 120px;
  padding: 12px 14px;
  background-color: #FFFFFF;
  border-radius: 12px;
  font-size: 14px;
  color: #333333;
  border: 1px solid #E5E5E5;
  resize: none;
}

.report-extra__input:focus {
  border-color: #A8B89A;
}

.report-extra__count {
  position: absolute;
  bottom: 12px;
  right: 14px;
  font-size: 12px;
  color: #999999;
}

.report-content__btn {
  width: 100%;
  height: 48px;
  background-color: #A8B89A;
  color: #FFFFFF;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  margin-top: 24px;
}

.report-content__btn:disabled {
  background-color: #E5E5E5;
  color: #999999;
}
</style>