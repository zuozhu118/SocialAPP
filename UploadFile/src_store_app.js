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
            applyBalance: 10,      // 每日申请次数（对应后端 WechatApplyBalance）
            exposureCards: 0,      // 同城曝光卡
            totalApplyCount: 0,    // 总申请次数（累计）
            extraRights: []        // 额外权益列表
        }
    }),

    getters: {
        // 是否已读公告
        hasReadAnnouncement: (state) => state.announcements.length > 0,
        // 剩余申请次数
        remainingApplyCount: (state) => state.equity.applyBalance
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
        // 更新权益（从后端同步）
        updateEquity(data) {
            this.equity = {
                ...this.equity,
                ...data
            }
            // 同步存储到本地
            try {
                uni.setStorageSync('equity', this.equity)
            } catch (e) {
                console.warn('存储权益信息失败:', e)
            }
        },
        // 消耗申请次数
        consumeApplyCount() {
            if (this.equity.applyBalance > 0) {
                this.equity.applyBalance--
                // 同步更新本地存储
                try {
                    uni.setStorageSync('equity', this.equity)
                } catch (e) {
                    console.warn('存储权益信息失败:', e)
                }
                return true
            }
            return false
        },
        // 增加曝光卡
        addExposureCard(count = 1) {
            this.equity.exposureCards += count
            try {
                uni.setStorageSync('equity', this.equity)
            } catch (e) {
                console.warn('存储权益信息失败:', e)
            }
        },
        // 使用曝光卡
        useExposureCard() {
            if (this.equity.exposureCards > 0) {
                this.equity.exposureCards--
                try {
                    uni.setStorageSync('equity', this.equity)
                } catch (e) {
                    console.warn('存储权益信息失败:', e)
                }
                return true
            }
            return false
        },
        // 重置权益（每天零点重置）
        resetDailyEquity() {
            // 从后端获取最新权益
            // 这里只做本地重置，实际应该调用后端接口同步
            this.equity.applyBalance = 10
            try {
                uni.setStorageSync('equity', this.equity)
            } catch (e) {
                console.warn('存储权益信息失败:', e)
            }
        },
        // 初始化权益（从本地存储恢复）
        initEquity() {
            try {
                const saved = uni.getStorageSync('equity')
                if (saved) {
                    this.equity = { ...this.equity, ...saved }
                }
            } catch (e) {
                console.warn('读取权益信息失败:', e)
            }
        }
    }
})