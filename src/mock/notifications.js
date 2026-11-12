/**
 * 3.8 服务通知 mock
 * 说明：
 * - 通知按「类型」注册元信息（图标 / 底色 / 所属 tab），页面不再硬编码每条记录的样式
 * - 触发场景：收到心动、匹配成功、收到微信申请、申请结果、点赞、评论、认证通过、优质动态、额度提醒、邀请奖励
 * - 接入后端时只需把 seedNotifications 换成接口返回，store 与页面无需改动
 */

const MIN = 60 * 1000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

const now = Date.now()

/**
 * 通知类型元信息（新增场景在这里加一行即可）
 * type: interact 互动 | system 系统
 */
export const NOTIFY_META = {
    // ===== 互动类 =====
    like_me: { type: 'interact', icon: '❤️', bgColor: '#FFE8EC', label: '收到心动' },
    match_success: { type: 'interact', icon: '💕', bgColor: '#FFE8EC', label: '匹配成功' },
    apply_receive: { type: 'interact', icon: '💬', bgColor: '#E8F4FD', label: '收到微信申请' },
    apply_agreed: { type: 'interact', icon: '✅', bgColor: '#E8F5E9', label: '申请已通过' },
    apply_rejected: { type: 'interact', icon: '❌', bgColor: '#FFEBEE', label: '申请已拒绝' },
    like_dynamic: { type: 'interact', icon: '👍', bgColor: '#F3E5F5', label: '收到点赞' },
    comment_dynamic: { type: 'interact', icon: '💬', bgColor: '#FFF3E0', label: '收到评论' },
    // ===== 系统类 =====
    realname_guide: { type: 'system', icon: '🔒', bgColor: '#FFF8E1', label: '实名引导' },
    quota_remind: { type: 'system', icon: '⏰', bgColor: '#FFF8E1', label: '额度提醒' },
    cert_pass: { type: 'system', icon: '🎖️', bgColor: '#E8F5E9', label: '认证通过' },
    quality: { type: 'system', icon: '✨', bgColor: '#E3F2FD', label: '优质动态' },
    invite_joined: { type: 'system', icon: '🤝', bgColor: '#E8F4FD', label: '邀请好友加入' },
    invite_reward: { type: 'system', icon: '🎁', bgColor: '#F3E5F5', label: '邀请奖励' },
    report_received: { type: 'system', icon: '🛡️', bgColor: '#EEF2FB', label: '举报已受理' },
    report_result: { type: 'system', icon: '🕊️', bgColor: '#E8F5E9', label: '举报处理结果' },
    anti_fraud: { type: 'system', icon: '📢', bgColor: '#FFF8E1', label: '反诈提醒' }
}

export const notifyMetaOf = (kind) =>
    NOTIFY_META[kind] || { type: 'system', icon: '🔔', bgColor: '#F5F5F5', label: '通知' }

/**
 * 男 9 点 / 20 点额度提醒（3.8 硬性规则：女性禁止推送）
 * 值为该档位「才开始允许推送」的整点，超过该整点后当日仍可补推一次
 */
export const QUOTA_REMIND_HOURS = [9, 20]

/**
 * 通知时间文案（比动态更克制：只到「昨天 / N天前」）
 */
export const formatNotifyTime = (ts) => {
    const diff = Date.now() - Number(ts || 0)
    if (diff < MIN) return '刚刚'
    if (diff < HOUR) return `${Math.floor(diff / MIN)}分钟前`
    if (diff < DAY) return `${Math.floor(diff / HOUR)}小时前`
    if (diff < 2 * DAY) return '昨天'
    if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}天前`
    return `${Math.floor(diff / (7 * DAY))}周前`
}

/**
 * 初始通知列表（含已读 / 未读混合，便于验证小红点与分类未读数）
 */
export const seedNotifications = () => [
    {
        id: 101,
        kind: 'like_me',
        title: '有人喜欢了你',
        desc: '陈橘子 对你表达了喜欢，回应一下就能开启双向缘分',
        createdAt: now - 8 * MIN,
        read: false,
        actionText: '查看',
        actionType: 'view_like_list',
        targetId: 2,
        targetName: '陈橘子'
    },
    {
        id: 102,
        kind: 'match_success',
        title: '匹配成功',
        desc: '你和 林小鹿 双向喜欢，现在可以申请交换微信了',
        createdAt: now - 26 * MIN,
        read: false,
        actionText: '去申请',
        actionType: 'apply_wechat',
        targetId: 1,
        targetName: '林小鹿'
    },
    {
        id: 103,
        kind: 'apply_receive',
        title: '收到微信申请',
        desc: '吴晴天 申请与你交换微信，是否同意？',
        createdAt: now - 2 * HOUR,
        read: false,
        actionText: '去处理',
        actionType: 'handle_apply',
        targetId: 3,
        targetName: '吴晴天'
    },
    {
        id: 104,
        kind: 'like_dynamic',
        title: '收到点赞',
        desc: '沈星野 赞了你的动态',
        createdAt: now - 5 * HOUR,
        read: false,
        actionText: '查看动态',
        actionType: 'view_dynamic',
        targetId: 1
    },
    {
        id: 105,
        kind: 'comment_dynamic',
        title: '收到评论',
        desc: '江小满 评论了你的动态：这张照片拍得真有感觉',
        createdAt: now - 9 * HOUR,
        read: true,
        actionText: '回复',
        actionType: 'reply_comment',
        targetId: 1
    },
    {
        id: 106,
        kind: 'apply_agreed',
        title: '微信申请已通过',
        desc: '苏念安 同意了你的申请，微信号已互相展示',
        createdAt: now - 1 * DAY,
        read: true,
        actionText: '查看结果',
        actionType: 'apply_result_agreed',
        targetId: 5,
        targetName: '苏念安'
    },
    {
        id: 107,
        kind: 'cert_pass',
        title: '认证通过',
        desc: '你的实名认证已审核通过，个人主页已展示实名标识',
        createdAt: now - 2 * DAY,
        read: true,
        actionText: '查看主页',
        actionType: 'view_profile',
        targetId: 0
    },
    {
        id: 108,
        kind: 'quality',
        title: '动态被标记为优质',
        desc: '你发布的动态被评选为优质内容，曝光已加权',
        createdAt: now - 3 * DAY,
        read: true,
        actionText: '查看动态',
        actionType: 'view_dynamic',
        targetId: 1
    },
    {
        id: 109,
        kind: 'anti_fraud',
        title: '反诈提醒',
        desc: '平台提醒：请勿向任何人透露验证码、转账汇款，谨防杀猪盘诈骗',
        createdAt: now - 4 * DAY,
        read: true,
        actionText: '查看详情',
        actionType: 'view_antifraud',
        targetId: null
    },
    {
        id: 110,
        kind: 'apply_rejected',
        title: '微信申请已拒绝',
        desc: '温言 暂未回应你的微信申请，缘分值得耐心等待',
        createdAt: now - 6 * DAY,
        read: true,
        actionText: '查看结果',
        actionType: 'apply_result_rejected',
        targetId: 14,
        targetName: '温言'
    }
]

// 通知分类 tab（计数由 store 动态计算）
export const NOTIFY_TABS = [
    { label: '全部', value: 'all' },
    { label: '互动', value: 'interact' },
    { label: '系统', value: 'system' }
]

export default {
    NOTIFY_META,
    NOTIFY_TABS,
    QUOTA_REMIND_HOURS,
    notifyMetaOf,
    formatNotifyTime,
    seedNotifications
}
