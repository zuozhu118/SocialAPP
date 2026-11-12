/**
 * 匹配筛选标签（免费）
 * 来源：《MVP阶段功能规划V6.docx》3.3.1 —— 年龄、城市、身高、交友需求、学历、行业、兴趣、生活标签
 * 说明：全部为免费筛选项，不涉及付费高级筛选
 */

export const filterGroups = [
    {
        key: 'age',
        title: '年龄',
        multiple: false,
        options: [
            { label: '不限', value: 'all' },
            { label: '18-22', value: '18-22' },
            { label: '23-27', value: '23-27' },
            { label: '28-32', value: '28-32' },
            { label: '33+', value: '33+' }
        ]
    },
    {
        key: 'city',
        title: '城市',
        multiple: false,
        options: [
            { label: '不限', value: 'all' },
            { label: '北京', value: '北京' },
            { label: '上海', value: '上海' },
            { label: '深圳', value: '深圳' },
            { label: '广州', value: '广州' },
            { label: '杭州', value: '杭州' },
            { label: '成都', value: '成都' },
            { label: '武汉', value: '武汉' },
            { label: '天津', value: '天津' }
        ]
    },
    {
        key: 'height',
        title: '身高',
        multiple: false,
        options: [
            { label: '不限', value: 'all' },
            { label: '150-160', value: '150-160' },
            { label: '160-170', value: '160-170' },
            { label: '170-180', value: '170-180' },
            { label: '180+', value: '180+' }
        ]
    },
    {
        key: 'purpose',
        title: '交友需求',
        multiple: false,
        options: [
            { label: '不限', value: 'all' },
            { label: '认真恋爱', value: '认真恋爱' },
            { label: '奔结婚', value: '奔结婚' },
            { label: '先做朋友', value: '先做朋友' },
            { label: '顺其自然', value: '顺其自然' }
        ]
    },
    {
        key: 'education',
        title: '学历',
        multiple: false,
        options: [
            { label: '不限', value: 'all' },
            { label: '大专', value: '大专' },
            { label: '本科', value: '本科' },
            { label: '硕士', value: '硕士' },
            { label: '博士', value: '博士' }
        ]
    },
    {
        key: 'industry',
        title: '行业',
        multiple: false,
        options: [
            { label: '不限', value: 'all' },
            { label: '互联网', value: '互联网' },
            { label: '金融', value: '金融' },
            { label: '教育', value: '教育' },
            { label: '医疗', value: '医疗' },
            { label: '设计', value: '设计' },
            { label: '公务员', value: '公务员' },
            { label: '自由职业', value: '自由职业' }
        ]
    },
    {
        key: 'interest',
        title: '兴趣',
        multiple: true,
        options: [
            { label: '不限', value: 'all' },
            { label: '旅行', value: '旅行' },
            { label: '摄影', value: '摄影' },
            { label: '健身', value: '健身' },
            { label: '阅读', value: '阅读' },
            { label: '音乐', value: '音乐' },
            { label: '美食', value: '美食' },
            { label: '烘焙', value: '烘焙' },
            { label: '宠物', value: '宠物' }
        ]
    },
    {
        key: 'lifeTag',
        title: '生活标签',
        multiple: true,
        options: [
            { label: '不限', value: 'all' },
            { label: '不吸烟', value: '不吸烟' },
            { label: '不喝酒', value: '不喝酒' },
            { label: '有车', value: '有车' },
            { label: '有房', value: '有房' },
            { label: '养宠物', value: '养宠物' },
            { label: '早睡早起', value: '早睡早起' }
        ]
    }
]

// 默认筛选状态
export const defaultFilters = filterGroups.reduce((acc, group) => {
    acc[group.key] = group.multiple ? [] : 'all'
    return acc
}, {})

// 顶部快捷筛选标签
export const quickFilters = [
    { label: '全部', value: 'all' },
    { label: '同城', value: 'city' },
    { label: '本科+', value: 'education' },
    { label: '认证用户', value: 'auth' },
    { label: '近期活跃', value: 'active' }
]

/**
 * 判断用户是否命中筛选条件（纯前端过滤，后端实现时逻辑一致即可）
 */
export function matchUserByFilters(user, filters = {}) {
    const inRange = (value, range) => {
        if (!range || range === 'all') return true
        const num = Number(value) || 0
        if (range.endsWith('+')) return num >= Number(range.replace('+', ''))
        const [min, max] = range.split('-').map(Number)
        return num >= min && num <= max
    }

    if (!inRange(user.age, filters.age)) return false
    if (filters.city && filters.city !== 'all' && !`${user.ipLocation}${user.district}`.includes(filters.city)) return false
    if (!inRange(user.height, filters.height)) return false
    if (filters.education && filters.education !== 'all' && user.education && !user.education.includes(filters.education)) return false
    if (filters.interest?.length) {
        const has = filters.interest.some(tag => (user.hobbyTags || []).includes(tag))
        if (!has) return false
    }
    if (filters.lifeTag?.length) {
        const has = filters.lifeTag.some(tag => (user.lifeTags || []).includes(tag))
        if (!has) return false
    }
    return true
}

export default { filterGroups, defaultFilters, quickFilters, matchUserByFilters }
