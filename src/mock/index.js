/**
 * mock 统一出口
 * 说明：所有页面的假数据都从这里取，接入后端时只替换本目录下的实现，页面无需改动
 */

export { users, findUserById, currentUserProfile } from './users'
export {
    dynamics,
    findDynamicById,
    formatRelativeTime,
    locationOptions,
    CURRENT_CITY,
    SAME_CITY_MIN
} from './dynamics'
export { businessCopy, emptyCopy, getTimeSlotTitle, matchSuccessTexts, wechatSafetyCopy, antiFraudTips, actionLabels, footprintCopy } from './copy'
export { filterGroups, defaultFilters, quickFilters, matchUserByFilters } from './filters'
export {
    commonTags,
    matchSuccessTags,
    buildFatePoint,
    seedMatches,
    seedApplications,
    mockWechatMap,
    myMockWechat
} from './matches'
export { seedMyHearts, seedHeartsMe, seedFollowers, seedTodayViews, footprintEmptyText } from './social'

/**
 * 模拟网络延迟，方便验证骨架屏 / loading 态
 */
export const mockDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 从数组中随机取一项
 */
export const randomPick = (list = []) => list[Math.floor(Math.random() * list.length)]

/**
 * 生成当日日期字符串（用于额度 0 点重置判断）
 */
export const todayStr = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
