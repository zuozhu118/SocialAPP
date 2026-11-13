/**
 * 3.7 风控、举报、账号合规 mock
 * 说明：举报 7 类、审核时效（AI 初审 5 分钟 / 普通 24h / 女性骚扰 12h）、
 * 梯度处罚（下架 → 禁发 7 天 → 限匹配 → 永久封禁）、申诉与账号注销规则都在这里定义。
 */

const MIN = 60 * 1000
const HOUR = 60 * MIN
const DAY = 24 * HOUR
const now = Date.now()

// ===== 审核时效（3.7 硬性要求）=====
export const AUDIT_SLA = {
 ai: 5 * MIN, // AI 初审 5 分钟
 normal: 24 * HOUR, // 普通举报 24 小时
 female: 12 * HOUR // 女性骚扰举报 12 小时
}

/**
 * 7 类举报原因
 * category: fake（虚假认证）/ harassment（恶意骚扰）/ fraud（诱导转账）/ porn（色情导流）/ ad（广告营销）
 * priority: female 表示女性用户举报时自动置顶、走 12h 时效
 */
export const REPORT_REASONS = [
 { value: 'fake_realname', icon: '', title: '虚假实名', desc: '冒用他人身份、证件造假', category: 'fake' },
 { value: 'fake_education', icon: '', title: '虚假学历', desc: '学历认证材料造假', category: 'fake' },
 { value: 'fake_work', icon: '', title: '虚假工作', desc: '工作认证材料造假', category: 'fake' },
 { value: 'harassment', icon: '', title: '恶意骚扰', desc: '言语骚扰、人身攻击、纠缠', category: 'harassment', priority: 'female' },
 { value: 'fraud', icon: '', title: '诱导转账', desc: '以投资、借款等名义索取钱财', category: 'fraud', priority: 'female' },
 { value: 'porn', icon: '', title: '色情导流', desc: '发布色情低俗内容或站外导流', category: 'porn', priority: 'female' },
 { value: 'ad', icon: '', title: '广告营销', desc: '批量广告、微商引流、刷屏', category: 'ad' }
]

export const reasonOf = (value) => REPORT_REASONS.find(item => item.value === value) || null

/**
 * 梯度处罚
 * level 越大越重，运营按举报严重度选择
 */
export const PENALTIES = [
 { value: 'remove', label: '下架内容', desc: '删除违规动态 / 评论', level: 1 },
 { value: 'ban_post', label: '禁发 7 天', desc: '7 天内不可发布动态与评论', level: 2 },
 { value: 'limit_match', label: '限制匹配', desc: '暂停推荐与心动能力 7 天', level: 3 },
 { value: 'ban', label: '永久封禁', desc: '实名信息永久拉黑，不可再注册', level: 4 }
]

export const penaltyOf = (value) => PENALTIES.find(item => item.value === value) || null

// 举报状态
export const REPORT_STATUS = {
 ai: 'AI 初审中',
 pending: '人工审核中',
 done: '已处理',
 rejected: '未通过'
}

/**
 * 历史举报记录（用于「我的举报」页初始数据）
 * priority = female 的记录在列表置顶展示，并标「女性专属通道」
 */
export const seedReports = () => [
 {
 id: 'rep_1',
 targetId: 9,
 targetName: '沈星野',
 reason: 'harassment',
 reasonLabel: '恶意骚扰',
 category: 'harassment',
 desc: '多次在评论区发送骚扰言论',
 images: [],
 createdAt: now - 30 * HOUR,
 status: 'done',
 priority: 'female',
 deadlineAt: now - 18 * HOUR,
 result: 'punished',
 penalty: 'ban_post',
 handledAt: now - 26 * HOUR,
 appeal: null
 },
 {
 id: 'rep_2',
 targetId: 12,
 targetName: '白露微',
 reason: 'ad',
 reasonLabel: '广告营销',
 category: 'ad',
 desc: '主页简介含微商引流信息',
 images: [],
 createdAt: now - 6 * HOUR,
 status: 'pending',
 priority: 'normal',
 deadlineAt: now + 18 * HOUR,
 result: '',
 penalty: '',
 handledAt: 0,
 appeal: null
 }
]

// 申诉理由候选
export const APPEAL_REASONS = [
 '举报内容与事实不符',
 '已与对方私下和解',
 '处罚过重，申请复核',
 '证据材料不完整，可补充'
]

// ===== 账号注销（3.7）=====
export const DEACTIVATION_RULES = [
 '提交后账号立即冻结，个人资料全部脱敏（昵称、头像、动态、相册）',
 '手机号即时释放，可用于重新注册新账号',
 '实名信息留存 180 天后自动销毁，期间仅用于风控与司法配合',
 '同一身份证 180 天内不可再次实名，防止反复注册骚扰他人',
 '被永久封禁的账号不支持注销后重新注册'
]

// 注销共情文案（复用第 8 章标准文案，禁止负面表达）
export const deactivationCopy = {
 title: '确定要离开吗',
 content: '注销后你的资料将被安全清除，缘分虽短，感谢相遇。确定要离开吗？',
 confirmText: '确认注销',
 cancelText: '再想想'
}

// ===== 反作弊（3.7）=====
/**
 * 风控事件：命中后扣减风控分，低于阈值自动降权（不向女性用户推荐）
 */
export const RISK_EVENTS = {
 high_frequency_like: { score: -20, label: '24 小时内批量心动' },
 cross_ip: { score: -15, label: '频繁跨 IP 登录' },
 blank_profile: { score: -25, label: '空白资料高频申请' },
 keyword_funnel: { score: -30, label: '导流关键词命中' },
 device_multi_account: { score: -40, label: '同设备多账号' }
}

// 风控分低于该值即进入降权状态
export const RISK_THRESHOLD = 60

export const RISK_BASE = 100
