

import { http } from '@/utils/request'

/**
 * 微信一键登录（获取手机号）
 * @param {Object} params
 * @param {string} params.code - wx.login 获取的 code
 * @param {string} params.encryptedData - getPhoneNumber 返回的 encryptedData
 * @param {string} params.iv - getPhoneNumber 返回的 iv
 */
export const wechatLogin = (params) => {
    return http.post('/Auth/wechat-login', {
        code: params.code,
        encryptedData: params.encryptedData,
        iv: params.iv
    }, {
        showLoading: true,
        loadingText: '登录中...'
    })
}

/**
 * 获取认证状态
 */
export const getAuthStatus = () => {
    return http.get('/Auth/auth-status', {}, {
        showLoading: false
    })
}

/**
 * 实名认证
 * @param {Object} params
 */
export const realNameAuth = (params) => {
    return http.post('/Auth/realname', params, {
        showLoading: true,
        loadingText: '认证中...'
    })
}

/**
 * 退出登录
 */
export const logout = () => {
    return http.post('/Auth/logout', {}, {
        showLoading: false
    })
}