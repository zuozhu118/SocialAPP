/**
 * 全平台统一标准文案库
 * 来源：《MVP阶段功能规划V6.docx》第 8 章，全页面强制复用，禁止自定义负面文字
 */

// ===== 8.1 业务操作标准文案 =====
export const businessCopy = {
 realNameFailed: '认证暂未通过，可能是光线或证件清晰度问题，请调整后重试，或联系人工复核',
 avatarRejected: '首图需要是本人正面清晰照片哦，这样才能让缘分更真实～',
 browseQuotaExhausted: '今日缘分已尽，明天将为你刷新全新的同城异性 ',
 likeQuotaExhausted: '今日心动已用完，明天继续遇见对的人 ',
 applyNoResponse: '对方暂未回应，缘分值得耐心等待，继续发现下一位吧',
 applyExpired: '缘分暂未回应，继续寻找下一位吧',
 contactInGreeting: '这句话可能包含联系方式，为了大家的安全，请通过官方通道交换微信哦',
 accountRestricted: '账号因违反社区规范被限制使用，如有疑问可通过申诉通道复核',
 logoutConfirm: '注销后你的资料将被安全清除，缘分虽短，感谢相遇。确定要离开吗？',
 realNameGuide: '完成实名认证，即可开启异性精准匹配，已有上万同城用户加入',
 registerGuide: '一键授权手机号，0.5 秒完成注册，解锁完整真实资料',
 dynamicNeedEdit: '这条动态需要调整一下内容，修改后可重新发布哦',
 blocked: '缘分需要双向奔赴，去发现更多同城的 TA 吧',
 lowCompleteness: (percent) => `你的资料完成度 ${percent}%，补充介绍，能大幅提升匹配概率`,
 duplicateRealName: '一个身份证仅能认证一个账号，如需帮助请联系客服',
    guestLimit: '注册后即可查看完整资料，已有大量同城用户完成实名',
    weakNetwork: '网络有点慢，正在努力加载中...',
    systemError: '出了点小状况，请稍后再试，我们一直在优化',

    // ===== 关注 / 心动 两套动作的引导与结果文案（V8 语义分离）=====
    // 关注：不占额度、可无限次、可随时取消，作用是把合眼缘的先存起来
    followGuide: '关注不占用心动额度，可以先把合眼缘的 TA 存起来，等心动额度刷新后再表达',
    followSuccess: '已关注，随时可以回来看看 TA',
    unfollowSuccess: '已取消关注，还能再次关注 TA',
    // 心动：稀缺资源，每日有额度，双方心动才能交换微信
    heartGuide: '心动每日有额度，双方都心动后才能申请交换微信',
    heartSent: '心动已送达，等 TA 也心动就能交换微信',
    // 心动规则一句话（首页常驻提示，让新用户一眼看懂与探探类产品的差异）
    heartRule: '双方互相心动后，可以直接交换微信',
    // 心动额度用完：主按钮变灰，只说明天，不给死路（关注按钮仍可用）
    heartTomorrow: '明日再来',
    // 额度耗尽时的出路引导（禁止只给「明天再来」这种死路）
    heartExhaustedGuide: '今日心动已用完，先关注 TA，明天额度刷新后回来表达心动',
    heartFollowedFallback: '已关注 TA，明日心动额度刷新后可以直接发送心动'
}

// ===== 8.2 空状态专用文案 =====
export const emptyCopy = {
    squareEmpty: '首批真实用户正在赶来，先看看大家的故事吧',
    matchEmpty: '你的缘分还在路上，完善资料能让 TA 更快找到你',
    likeEmpty: '你还没被更多人看到，发布一条动态，提升曝光',
    // 广场「赞过」tab 为空（我点赞过的动态，注意：动态点赞 ≠ 关注人）
    likeFeedEmpty: '还没有你赞过的动态，去推荐里遇见更多同城故事吧',
    // greetingEmpty：原「招呼对话为空」文案，产品已取消站内聊天，暂不使用
    greetingEmpty: '缘分还在酝酿中，主动去发现同城的 TA 吧',

    // ===== 关注 / 心动 两套关系列表的空态（V8）=====
    // 我关注的：关注是无限量收藏夹，空态给出「去匹配页收人」的出路
    followEmpty: '还没有关注的 TA，去匹配页把合眼缘的先收起来吧',
    // 关注我的：被关注不需要成本，空态引导提升曝光
    followerEmpty: '还没有人关注你，完善资料能让更多同城 TA 找到你',
    // 我发出的心动：额度还在时给出「还能心动」的正向提示
    heartEmpty: '还没有发出心动，今日额度还在，去遇见对的人吧',
    // 心动我的：心动是稀缺动作，收不到时引导提升资料质量
    heartsMeEmpty: '还没有收到心动，发条动态让更多人看到你'
}

// ===== 关注 / 心动 名词与状态标签（全站统一，避免同义词漂移）=====
// 关注 = 收藏夹式的弱关系（无限、可取消）；心动 = 稀缺的强表达（有额度、双方心跳才配对）
export const actionLabels = {
    follow: '关注',
    followed: '已关注',
    unfollow: '取消关注',
    heart: '心动',
    // 已发出、等对方回应的状态（个人主页 / 匹配页主按钮终态前态）
    hearted: '已心动 · 待回应',
    heartsMe: '心动我的',
    myHearts: '我的心动',
    myFollows: '我的关注',
    followers: '关注我的'
}

// ===== 3.9 缘分足迹（浏览口径，不是「关注」关系，禁止混用）=====
export const footprintCopy = (count) =>
    count > 0
        ? `今天有 ${count} 位同城异性看过你的主页`
        : '今天暂时还没有同城 TA 路过，发条动态让更多人看到你'

// ===== 3.5.2 动态广场时段自动切换标题 =====
const timeSlotTitles = [
 { start: 6, end: 11, title: '早安，新的一天从遇见缘分开始' },
 { start: 11, end: 14, title: '午休时间，看看同城有谁在等你' },
 { start: 14, end: 18, title: '下午好，今日缘分正在刷新中' },
 { start: 18, end: 20, title: '下班了，今晚的缘分已为你准备好' },
 { start: 20, end: 23, title: '今晚遇见同频同城异性' },
 { start: 23, end: 24, title: '夜深了，缘分也需要休息，明天见 ' },
 { start: 0, end: 1, title: '夜深了，缘分也需要休息，明天见 ' },
 { start: 1, end: 6, title: '凌晨时段，缘分正在沉睡，早点休息吧' }
]

export function getTimeSlotTitle(date = new Date()) {
 const hour = date.getHours()
 const hit = timeSlotTitles.find(item => hour >= item.start && hour < item.end)
 return hit ? hit.title : timeSlotTitles[0].title
}

// ===== 3.4.1 匹配成功随机正向文案 =====
export const matchSuccessTexts = [
 '你们在同一座城市，也在同一频率上',
 '缘分刚刚好，先从一句你好开始吧',
 '双向心动的概率很低，恭喜你们遇上了'
]

// ===== 3.4.3 交换微信页安全兜底文案 =====
export const wechatSafetyCopy = '遭遇骚扰、欺诈，可随时回平台举报，我们优先处理'

// ===== 3.7.4 三重反诈告知 =====
export const antiFraudTips = {
 register: '平台不会以任何名义索要转账、投资、保证金，请勿向陌生人付款',
 apply: '对方微信号仅用于线下沟通，请勿转账、代付、投资，谨防诈骗',
 success: '微信已交换成功，涉及金钱往来请立即停止并举报，平台会优先处理'
}

export default {
    businessCopy,
    emptyCopy,
    actionLabels,
    footprintCopy,
    getTimeSlotTitle,
    matchSuccessTexts,
    wechatSafetyCopy,
    antiFraudTips
}
