import { defineStore } from 'pinia'

export default defineStore('user', {
  state: () => ({
    // 用户基本信息
    userInfo: null,
    // 是否已登录
    isLogin: false,
    // 用户层级: guest | registered | certified
    userLevel: 'guest',
    // 认证状态
    authStatus: {
      realName: false,
      education: false,
      work: false
    },
    // 用户资料
    profile: {
      gender: '',
      age: '',
      city: '',
      height: '',
      emotionNeed: '',
      hobbies: [],
      tags: []
    }
  }),
  
  getters: {
    // 是否已实名
    isRealNameAuth: (state) => state.authStatus.realName,
    // 认证数量
    authCount: (state) => {
      let count = 0
      if (state.authStatus.realName) count++
      if (state.authStatus.education) count++
      if (state.authStatus.work) count++
      return count
    },
    // 用户显示名称
    displayName: (state) => {
      if (!state.userInfo) return '游客'
      return state.userInfo.nickname || '用户'
    }
  },
  
  actions: {
    // 设置用户信息
    setUserInfo(info) {
      this.userInfo = info
      this.isLogin = true
    },
    // 设置用户层级
    setUserLevel(level) {
      this.userLevel = level
    },
    // 设置认证状态
    setAuthStatus(type, status) {
      if (type === 'realName') this.authStatus.realName = status
      if (type === 'education') this.authStatus.education = status
      if (type === 'work') this.authStatus.work = status
    },
    // 更新资料
    updateProfile(data) {
      this.profile = { ...this.profile, ...data }
    },
    // 登出
    logout() {
      this.userInfo = null
      this.isLogin = false
      this.userLevel = 'guest'
      this.authStatus = {
        realName: false,
        education: false,
        work: false
      }
    }
  }
})