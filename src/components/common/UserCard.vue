<template>
  <view class="user-card" :class="{ 'user-card--clickable': clickable }" @click="handleClick">
    <image 
      class="user-card__avatar" 
      :src="avatar" 
      mode="aspectFill"
      :style="{ width: avatarSize + 'px', height: avatarSize + 'px' }"
    />
    <view class="user-card__info">
      <view class="user-card__name-row">
        <text class="user-card__name">{{ name }}</text>
        <text v-if="age" class="user-card__age">{{ age }}岁</text>
      </view>
      <view class="user-card__badges">
        <AuthBadge 
          v-if="auth.realName" 
          type="realname" 
          :size="badgeSize"
          :double="auth.realName && auth.education"
        />
        <AuthBadge 
          v-if="auth.education" 
          type="education" 
          :size="badgeSize"
          :double="auth.education && auth.work"
        />
        <AuthBadge 
          v-if="auth.work" 
          type="work" 
          :size="badgeSize"
        />
        <text v-if="sub" class="user-card__sub">{{ sub }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import AuthBadge from './AuthBadge.vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    default: null
  },
  sub: {
    type: String,
    default: ''
  },
  auth: {
    type: Object,
    default: () => ({
      realName: false,
      education: false,
      work: false
    })
  },
  avatarSize: {
    type: Number,
    default: 44
  },
  badgeSize: {
    type: Number,
    default: 18
  },
  clickable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<style lang="scss" scoped>
.user-card {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  
  &--clickable {
    cursor: pointer;
    
    &:active {
      opacity: 0.7;
    }
  }
  
  &__avatar {
    border-radius: 50%;
    flex-shrink: 0;
    background-color: $bg-page;
    border: 1px solid $border-light;
  }
  
  &__info {
    flex: 1;
    min-width: 0;
  }
  
  &__name-row {
    display: flex;
    align-items: baseline;
    gap: $spacing-xs;
  }
  
  &__name {
    font-size: $font-size-md;
    font-weight: $font-weight-medium;
    color: $text-primary;
  }
  
  &__age {
    font-size: $font-size-sm;
    color: $text-secondary;
    font-weight: $font-weight-light;
  }
  
  &__badges {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    margin-top: 2px;
    flex-wrap: wrap;
  }
  
  &__sub {
    font-size: $font-size-xs;
    color: $text-helper;
    margin-left: $spacing-xs;
  }
}
</style>