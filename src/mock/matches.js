/**
 * 双向匹配 / 微信交换 关系种子数据
 * 来源：《MVP阶段功能规划V6.docx》3.4 双向匹配、微信交换全流程
 * 说明：仅用于前端 mock 演示；接入后端时本文件由接口替代
 */

import { users, currentUserProfile } from './users'

// ===== 标签交集计算 =====
/**
 * 计算双方共同标签，返回 { city, personality, hobby, weekend, life }
 * 城市按「同区优先、同城次之」返回，用于 3.4.3 接收方申请卡片顶部高亮文案
 */
export function commonTags(self = currentUserProfile, target = null) {
    if (!target) return { city: '', personality: [], hobby: [], weekend: [], life: [], all: [] }

    const inter = (a = [], b = []) => a.filter(tag => b.includes(tag))
    const sameDistrict = self.district && self.district === target.district
    const sameCity = self.ipLocation && self.ipLocation === target.ipLocation

    const personality = inter(self.personalityTags, target.personalityTags)
    const hobby = inter(self.hobbyTags, target.hobbyTags)
    const weekend = inter(self.weekendTags, target.weekendTags)
    const life = inter(self.lifeTags, target.lifeTags)

    let city = ''
    if (sameDistrict) city = `都住在【${target.district}】`
    else if (sameCity) city = `都在【${target.ipLocation}】`

    const all = [...(city ? ['同城'] : []), ...personality.slice(0, 2), ...hobby.slice(0, 2)]

    return { city, personality, hobby, weekend, life, all }
}

/**
 * 匹配成功页展示的「共同匹配标签」：同城 + 性格 + 爱好，最多 4 个
 */
export function matchSuccessTags(target, self = currentUserProfile) {
    const tags = commonTags(self, target)
    const list = []
    if (tags.city) list.push('同城')
    tags.personality.slice(0, 2).forEach(tag => list.push(tag))
    tags.hobby.slice(0, 2).forEach(tag => list.push(tag))
    return list.slice(0, 4)
}

/**
 * 3.4.3 接收方申请卡片顶部高亮文案
 * 取双方标签交集，无交集则返回空字符串（该行隐藏）
 */
export function buildFatePoint(target, self = currentUserProfile) {
    const tags = commonTags(self, target)
    const parts = []
    if (tags.city) parts.push(tags.city)
    const hobby = tags.hobby[0] || tags.weekend[0]
    if (hobby) parts.push(`都喜欢【${hobby}】`)
    if (!parts.length && tags.personality[0]) parts.push(`都挺【${tags.personality[0]}】`)
    return parts.length ? `你们的缘分契合点：${parts.join('・')}` : ''
}

// ===== 相对时间工具（mock 用，避免与真实时间耦合过深）=====
const DAY = 24 * 60 * 60 * 1000
const now = () => Date.now()

/**
 * 预置关系：id 与 users.js 中一致
 * - 1 林小鹿：已双向匹配，可申请交换微信
 * - 6 夏知意：最近一次匹配
 * - 3 吴晴天：主动向我发起了微信申请，待我处理
 * - 11 叶南乔：我已发出申请且已交换成功（历史记录）
 */
export const seedMatches = () => [
    {
        userId: 1,
        matchedAt: now() - 2 * DAY,
        wechatStatus: 'none'
    },
    {
        userId: 11,
        matchedAt: now() - 9 * DAY,
        wechatStatus: 'agreed'
    },
    {
        userId: 3,
        matchedAt: now() - 3 * DAY,
        wechatStatus: 'none'
    },
    {
        userId: 6,
        matchedAt: now() - 1 * DAY,
        wechatStatus: 'none'
    }
]

export const seedApplications = () => [
    // 吴晴天 → 我：待我处理
    {
        id: 'app_seed_in_1',
        fromUserId: 3,
        toUserId: currentUserProfile.id,
        direction: 'in',
        status: 'pending',
        message: '你好，看了你的资料觉得很投缘',
        createdAt: now() - 6 * 60 * 60 * 1000,
        expiresAt: now() - 6 * 60 * 60 * 1000 + 3 * DAY,
        handledAt: 0
    },
    // 我 → 叶南乔：历史已同意，展示微信号
    {
        id: 'app_seed_out_1',
        fromUserId: currentUserProfile.id,
        toUserId: 11,
        direction: 'out',
        status: 'agreed',
        message: '我们挺像的，想认识一下',
        createdAt: now() - 4 * DAY,
        expiresAt: now() - 1 * DAY,
        handledAt: now() - 4 * DAY + 2 * 60 * 60 * 1000
    }
]

// 双方微信号（mock）：真实场景由用户隐私设置填写，日志不记录
export const mockWechatMap = {
    1: 'linxiaolu_0921',
    3: 'wuqingtian_88',
    6: 'guqinghe_0306',
    11: 'yenanqiao_1120'
}

export const myMockWechat = 'guxingzhou_98'

export default {
    commonTags,
    matchSuccessTags,
    buildFatePoint,
    seedMatches,
    seedApplications,
    mockWechatMap,
    myMockWechat,
    users
}
