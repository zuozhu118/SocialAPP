import { defineStore } from 'pinia'

export default defineStore('auth', {
  state: () => ({
    // 实名认证状态
    realNameAuth: {
      status: 'idle', // idle | pending | success | failed
      step: 1, // 1: 上传身份证 2: 人脸识别 3: 完成
      error: null
    },
    // 学历认证
    educationAuth: {
      status: 'idle',
      image: null,
      error: null
    },
    // 工作认证
    workAuth: {
      status: 'idle',
      image: null,
      error: null
    },
    // 认证记录
    history: []
  }),
  
  getters: {
    // 是否实名认证中
    isAuthing: (state) => state.realNameAuth.status === 'pending',
    // 是否已实名
    isRealNameVerified: (state) => state.realNameAuth.status === 'success',
    // 是否已完成学历认证
    isEducationVerified: (state) => state.educationAuth.status === 'success',
    // 是否已完成工作认证
    isWorkVerified: (state) => state.workAuth.status === 'success'
  },
  
  actions: {
    // 开始实名认证
    startRealNameAuth() {
      this.realNameAuth.status = 'pending'
      this.realNameAuth.step = 1
      this.realNameAuth.error = null
    },
    // 实名认证成功
    realNameAuthSuccess() {
      this.realNameAuth.status = 'success'
      this.realNameAuth.step = 3
    },
    // 实名认证失败
    realNameAuthFailed(error) {
      this.realNameAuth.status = 'failed'
      this.realNameAuth.error = error
    },
    // 重置实名认证
    resetRealNameAuth() {
      this.realNameAuth.status = 'idle'
      this.realNameAuth.step = 1
      this.realNameAuth.error = null
    },
    // 学历认证成功
    educationAuthSuccess() {
      this.educationAuth.status = 'success'
    },
    // 学历认证失败
    educationAuthFailed(error) {
      this.educationAuth.status = 'failed'
      this.educationAuth.error = error
    },
    // 工作认证成功
    workAuthSuccess() {
      this.workAuth.status = 'success'
    },
    // 工作认证失败
    workAuthFailed(error) {
      this.workAuth.status = 'failed'
      this.workAuth.error = error
    }
  }
})