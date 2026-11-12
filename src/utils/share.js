/**
 * 3.8 分享与邀请链接工具
 * 约定：
 * - 所有分享都落到游客页 pages/common/landing，由游客页承接注册 / 实名
 * - 链接统一携带 invite=<邀请码>，好友实名后双方各得永久心动次数
 * - 不做任何现金奖励
 */

import useInviteStore from '@/store/invite'

export const LANDING_PATH = '/pages/common/landing'

/**
 * 拼装分享查询参数
 * @param {{ target?: string, title?: string }} options
 */
export const buildShareQuery = (options = {}) => {
    const invite = useInviteStore()
    const code = invite.ensureCode()
    const parts = [`invite=${code}`]
    if (options.target) parts.push(`target=${encodeURIComponent(options.target)}`)
    if (options.title) parts.push(`title=${encodeURIComponent(options.title)}`)
    return parts.join('&')
}

// 小程序分享用的相对路径（不带域名）
export const buildSharePath = (options = {}) => `${LANDING_PATH}?${buildShareQuery(options)}`

// H5 可复制的完整链接
export const buildShareUrl = (options = {}) => {
    const path = buildSharePath(options)
    // #ifdef H5
    const base = `${window.location.origin}${window.location.pathname}`
    return `${base}#${path}`
    // #endif
    // #ifndef H5
    return path
    // #endif
}

/**
 * 复制分享链接（H5 与小程序都走 uni 剪贴板）
 * @returns {Promise<string>} 复制成功的链接
 */
export const copyShareLink = (options = {}) =>
    new Promise((resolve) => {
        const link = buildShareUrl(options)
        uni.setClipboardData({
            data: link,
            success: () => resolve(link),
            fail: () => resolve('')
        })
    })

export default {
    LANDING_PATH,
    buildShareQuery,
    buildSharePath,
    buildShareUrl,
    copyShareLink
}
