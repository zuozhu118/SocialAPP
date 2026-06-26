import { defineStore } from 'pinia'

export default defineStore('app', {
  state: () => ({
    // 系统信息
    systemInfo: null,
    // 是否加载中
    loading: false,
    // 当前定位城市
    currentCity: '',
    // 公告列表
    announcements: [],
    // 反诈协议是否已签署
    antiFraudAgreed: false,
    // 权益中心
    equity: {
      applyCount: 10, // 当日申请次数
      totalApplyCount: 0, // 总申请次数
      exposureCards: 0, // 同城曝光卡
      extraRights: [] // 额外权益列表
    }
  }),
  
  getters: {
    // 是否已读公告
    hasReadAnnouncement: (state) => state.announcements.length > 0,
    // 剩余申请次数
    remainingApplyCount: (state) => state.equity.applyCount
  },
  
  actions: {
    // 设置系统信息
    setSystemInfo(info) {
      this.systemInfo = info
    },
    // 设置加载状态
    setLoading(status) {
      this.loading = status
    },
    // 设置当前城市
    setCurrentCity(city) {
      this.currentCity = city
    },
    // 签署反诈协议
    agreeAntiFraud() {
      this.antiFraudAgreed = true
    },
    // 更新权益
    updateEquity(data) {
      this.equity = { ...this.equity, ...data }
    },
    // 消耗申请次数
    consumeApplyCount() {
      if (this.equity.applyCount > 0) {
        this.equity.applyCount--
        this.equity.totalApplyCount++
        return true
      }
      return false
    },
    // 增加曝光卡
    addExposureCard(count = 1) {
      this.equity.exposureCards += count
    },
    // 使用曝光卡
    useExposureCard() {
      if (this.equity.exposureCards > 0) {
        this.equity.exposureCards--
        return true
      }
      return false
    }
  }
})