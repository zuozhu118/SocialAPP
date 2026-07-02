<template>
  <view v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <view class="modal" :class="[`modal--${size}`]" @click.stop>
      <!-- 关闭按钮 -->
      <view v-if="showClose" class="modal__close" @click="handleClose">
        <text>✕</text>
      </view>
      
      <!-- 图标 -->
      <view v-if="icon" class="modal__icon">
        <text>{{ icon }}</text>
      </view>
      
      <!-- 标题 -->
      <text v-if="title" class="modal__title">{{ title }}</text>
      
      <!-- 内容 -->
      <view class="modal__content">
        <slot>
          <text class="modal__content-text">{{ content }}</text>
        </slot>
      </view>
      
      <!-- 操作按钮 -->
      <view class="modal__actions" :class="{ 'modal__actions--single': !showCancel }">
        <button 
          v-if="showCancel" 
          class="modal__btn modal__btn--cancel"
          @click="handleCancel"
        >
          {{ cancelText }}
        </button>
        <button 
          class="modal__btn modal__btn--confirm"
          :class="{ 'modal__btn--danger': confirmType === 'danger' }"
          @click="handleConfirm"
          :disabled="confirmLoading"
        >
          {{ confirmLoading ? '...' : confirmText }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  showCancel: {
    type: Boolean,
    default: true
  },
  showClose: {
    type: Boolean,
    default: false
  },
  confirmType: {
    type: String,
    default: 'primary' // primary | danger
  },
  size: {
    type: String,
    default: 'medium' // small | medium | large
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

const confirmLoading = ref(false)

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    handleClose()
  }
}

const handleClose = () => {
  emit('close')
}

const handleConfirm = async () => {
  confirmLoading.value = true
  try {
    await emit('confirm')
  } finally {
    confirmLoading.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: $z-index-modal;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn $duration-fast ease;
  padding: $spacing-lg;
}

.modal {
  background-color: $bg-card;
  border-radius: $radius-card;
  padding: $spacing-xl $spacing-lg $spacing-lg;
  max-width: 400px;
  width: 100%;
  box-shadow: $shadow-modal;
  position: relative;
  animation: slideUp $duration-base ease;
  
  &--small {
    max-width: 320px;
  }
  
  &--large {
    max-width: 460px;
  }
  
  &__close {
    position: absolute;
    top: $spacing-md;
    right: $spacing-md;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: $text-helper;
    cursor: pointer;
    
    &:active {
      background-color: $bg-page;
    }
  }
  
  &__icon {
    text-align: center;
    font-size: 48px;
    margin-bottom: $spacing-md;
  }
  
  &__title {
    display: block;
    font-size: $font-size-lg;
    font-weight: $font-weight-medium;
    color: $text-primary;
    text-align: center;
    margin-bottom: $spacing-sm;
  }
  
  &__content {
    text-align: center;
    margin-bottom: $spacing-lg;
  }
  
  &__content-text {
    font-size: $font-size-sm;
    color: $text-secondary;
    line-height: 1.8;
  }
  
  &__actions {
    display: flex;
    gap: $spacing-sm;
    
    &--single {
      .modal__btn--confirm {
        flex: 1;
      }
    }
  }
  
  &__btn {
    flex: 1;
    height: 44px;
    border-radius: $radius-btn;
    font-size: $font-size-btn;
    font-weight: $font-weight-medium;
    border: none;
    transition: all $duration-fast ease;
    
    &:active {
      transform: scale(0.98);
    }
    
    &--cancel {
      background-color: $bg-page;
      color: $text-secondary;
      
      &:active {
        background-color: $border-light;
      }
    }
    
    &--confirm {
      background-color: $primary-color;
      color: #FFFFFF;
      
      &:active:not(:disabled) {
        opacity: 0.8;
      }
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
    
    &--danger {
      background-color: $color-warning;
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>