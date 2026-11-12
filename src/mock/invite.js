/**
 * 3.8 拉新裂变 mock
 * 产品决策：
 * - 只做「邀请好友 → 好友实名 → 双方各得永久心动次数」，不做任何现金奖励
 * - 分享落地页固定为游客页（pages/common/landing），由游客页承接注册 / 实名
 */

const MIN = 60 * 1000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

const now = Date.now()

// 好友完成实名后，邀请人与被邀请人各得多少次永久心动
export const INVITE_REWARD_LIKES = 5

/**
 * 邀请码生成规则（真实场景由服务端分配，这里用用户 id 稳定映射，便于验证）
 */
export const codeOf = (userId) => {
    const num = Number(userId) || 0
    return `FY${String(num).padStart(5, '0').slice(-5)}`
}

/**
 * 我邀请过的人
 * realnameAt 有值 = 已完成实名（奖励已发放），0 = 待实名（奖励待发放）
 */
export const seedInviteRecords = () => [
    {
        id: 'inv_1',
        name: '周予安',
        avatar: '',
        joinedAt: now - 2 * DAY,
        realnameAt: now - 1 * DAY,
        rewarded: true
    },
    {
        id: 'inv_2',
        name: '林知夏',
        avatar: '',
        joinedAt: now - 6 * HOUR,
        realnameAt: 0,
        rewarded: false
    },
    {
        id: 'inv_3',
        name: '苏茉',
        avatar: '',
        joinedAt: now - 40 * MIN,
        realnameAt: 0,
        rewarded: false
    }
]

// 邀请规则说明（页面直接渲染，禁止出现现金 / 返现字眼）
export const inviteRules = [
    `把专属链接分享给微信好友或朋友圈，好友通过链接注册即可`,
    `好友完成实名认证后，你和好友各得 ${INVITE_REWARD_LIKES} 次永久心动次数`,
    '永久心动次数不受每日额度限制，用完当日额度后自动消耗',
    '平台不做任何现金奖励，也不鼓励为奖励而批量拉新',
    '好友需为真实同城用户，异常邀请将不计入奖励'
]

// 分享文案（微信好友 / 朋友圈）
export const inviteShareCopy = (name = '一位同城用户') => ({
    title: `${name} 邀请你加入，一起遇见同城的 TA`,
    timelineTitle: `${name} 在等你，同城真实交友`
})
