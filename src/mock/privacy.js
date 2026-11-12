/**
 * 3.6 / 3.7 隐私设置 mock
 * 说明：所有开关都有真实业务后果（拦截微信申请 / 过滤动态评论 / 隐藏资料字段），
 * 接入后端时只需替换本文件默认值，store 与页面无需改动。
 */

const DAY = 24 * 60 * 60 * 1000
const now = Date.now()

// 动态可见范围
export const DYNAMIC_SCOPES = [
    { value: 'all', label: '全部可见', desc: '所有人可以查看你的动态', icon: '🌍' },
    { value: 'matched', label: '仅双向匹配', desc: '只有双向心动的人可以查看', icon: '👥' },
    { value: 'self', label: '仅自己可见', desc: '只有你自己可以查看', icon: '🔒' }
]

// 微信申请「年龄差」拦截档位
export const AGE_GAP_OPTIONS = [
    { value: 0, label: '不限制', desc: '任何人都可以申请' },
    { value: 3, label: '±3 岁', desc: '年龄差超过 3 岁自动拦截' },
    { value: 5, label: '±5 岁', desc: '年龄差超过 5 岁自动拦截' },
    { value: 8, label: '±8 岁', desc: '年龄差超过 8 岁自动拦截' }
]

// 可对外隐藏的资料字段
export const HIDE_FIELDS = [
    { value: 'height', label: '身高' },
    { value: 'occupation', label: '职业' },
    { value: 'district', label: '所在区域' },
    { value: 'album', label: '生活相册' }
]

// 微信申请被拦截的统一原因文案
export const APPLY_BLOCK_COPY = {
    closed: '对方关闭了微信申请通道，可以先通过动态互动建立连接',
    blocked: '你们之间存在屏蔽关系，无法发起微信申请',
    need_double: '对方仅接受双认证用户（学历 + 工作）的申请',
    age_gap: '年龄差超出了对方的接受范围，缘分也许在别处',
    not_matched: '还没有形成双向心动，暂不能申请交换微信'
}

export const defaultPrivacy = () => ({
    // 动态隐私
    dynamicScope: 'all',
    // 联系方式
    allowWechatApply: true,
    // 3.6 微信申请 24h 未处理自动拒绝（保护女性用户）
    autoRejectEnabled: true,
    autoRejectHours: 24,
    // 仅双认证用户可申请
    onlyDoubleVerified: false,
    // 年龄差拦截（0 = 不限制）
    ageGap: 0,
    // 其他
    showInRecommend: true,
    hideFields: []
})

// 初始黑名单（拉黑无通知、双向屏蔽）
export const seedBlacklist = () => [
    {
        id: 4,
        name: '郑小暖',
        avatar: 'https://picsum.photos/200/200?random=4',
        district: '朝阳区',
        reason: '恶意骚扰',
        blockedAt: now - 3 * DAY
    },
    {
        id: 8,
        name: '温以宁',
        avatar: 'https://picsum.photos/200/200?random=8',
        district: '海淀区',
        reason: '广告导流',
        blockedAt: now - 6 * DAY
    }
]

// 解除拉黑提示：需重新双向心动才能交换微信
export const unblockCopy = '解除拉黑后，你们需要重新双向心动才能再次申请交换微信'

/**
 * 对方（接收方）的隐私策略
 * 真实场景由后端随用户资料下发，这里按性别给出保守默认值：
 * 女性用户默认开启年龄差拦截，部分用户仅接受双认证用户申请
 */
const ONLY_DOUBLE_IDS = [8, 11]

export const mockTargetPolicy = (user) => {
    if (!user) return null
    if (user.gender === 'female') {
        return {
            allowWechatApply: true,
            onlyDoubleVerified: ONLY_DOUBLE_IDS.includes(Number(user.id)),
            ageGap: 5
        }
    }
    return { allowWechatApply: true, onlyDoubleVerified: false, ageGap: 0 }
}
