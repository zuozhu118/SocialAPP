/**
 * 同城图文动态广场（纯前端 mock）
 *
 * 设计要点（对应《MVP阶段功能规划V6》3.5 / 第 6 章）：
 * - 每条动态自带 createdAt（时间戳），广场排序由 store 计算「同城加权 + 时间衰减」，
 *   不用静态 time 字符串，避免页面放置很久后时间失真。
 * - city 取作者档案里的常住城市（手动填写，不取实时 GPS）。
 * - pinned = 运营后台置顶；isQuality = 运营标记优质（额外获得加权曝光）。
 * - commentList 携带 userId，供「被拉黑用户评论前端过滤」使用。
 */

import { users, findUserById } from './users'

// 当前登录用户的常住城市（mock 档案写死为北京，后续由后端下发）
export const CURRENT_CITY = '北京市'

// 冷启动兜底阈值：同城动态少于该数量时，补充跨城优质内容
export const SAME_CITY_MIN = 5

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR
const NOW = Date.now()

const authorOf = (userId) => {
    const u = findUserById(userId) || {}
    return {
        userId: u.id,
        userName: u.name,
        userAvatar: u.avatar,
        userAge: u.age,
        gender: u.gender,
        occupation: u.occupation,
        district: u.district,
        city: u.ipLocation || CURRENT_CITY,
        auth: u.auth || { realName: true, education: false, work: false }
    }
}

let commentSeed = 1
const comment = (userId, text, minutesAgo) => {
    const u = findUserById(userId) || {}
    return {
        id: `c_${commentSeed++}`,
        userId: u.id,
        name: u.name,
        avatar: u.avatar,
        text,
        createdAt: NOW - minutesAgo * 60 * 1000
    }
}

const build = (data) => {
    const author = authorOf(data.userId)
    const commentList = data.commentList || []
    return {
        id: data.id,
        ...author,
        content: data.content,
        images: data.images,
        location: data.location || '',
        createdAt: data.createdAt,
        likes: data.likes || 0,
        isQuality: !!data.isQuality,
        pinned: !!data.pinned,
        mine: false,
        commentList
    }
}

export const dynamics = [
    // ================= 同城（北京市） =================
    build({
        id: 1,
        userId: 13,
        content: '这周六小店做手冲体验，来喝一杯我新调的豆子吧，就在胡同口第二家 ☕',
        images: ['https://picsum.photos/600/400?random=40'],
        location: '北京·东城·南锣鼓巷',
        createdAt: NOW - 40 * 60 * 1000,
        likes: 36,
        pinned: true, // 运营置顶
        isQuality: true,
        commentList: [
            comment(1, '听着就很香，周六见！', 20),
            comment(5, '可以带朋友一起吗？', 12)
        ]
    }),
    build({
        id: 2,
        userId: 1,
        content: '今天的阳光真好，在咖啡馆看了一下午的书 📖 有小伙伴推荐好看的书吗？',
        images: ['https://picsum.photos/600/400?random=20'],
        location: '北京·朝阳·三里屯',
        createdAt: NOW - 2 * HOUR,
        likes: 23,
        isQuality: true,
        commentList: [
            comment(2, '好美呀！这是哪家咖啡馆？', 80),
            comment(9, '推荐《百年孤独》，最近刚重读完', 45)
        ]
    }),
    build({
        id: 3,
        userId: 14,
        content: '美术馆新展看了一下午，光影那几件装置值得反复看 🎨',
        images: [
            'https://picsum.photos/600/400?random=41',
            'https://picsum.photos/600/400?random=42'
        ],
        location: '北京·西城·美术馆后街',
        createdAt: NOW - 3 * HOUR,
        likes: 41,
        isQuality: true,
        commentList: [comment(3, '构图好舒服，是哪位艺术家的？', 100)]
    }),
    build({
        id: 4,
        userId: 5,
        content: '实验室的周末，终于把拖了三周的实验做完了，晚上去爬山庆祝一下 ⛰️',
        images: ['https://picsum.photos/600/400?random=27'],
        location: '北京·海淀·香山',
        createdAt: NOW - 5 * HOUR,
        likes: 52,
        isQuality: true,
        commentList: [
            comment(7, '科研人的浪漫哈哈', 200),
            comment(12, '香山这个季节人少，去得正好', 160)
        ]
    }),
    build({
        id: 5,
        userId: 13,
        content: '今天骑车从东城一路到后海，风很舒服，路上遇到三个卖糖葫芦的 🚲',
        images: ['https://picsum.photos/600/400?random=43'],
        location: '北京·西城·后海',
        createdAt: NOW - 26 * HOUR,
        likes: 29,
        commentList: [comment(1, '后海傍晚最好看', 900)]
    }),
    build({
        id: 6,
        userId: 1,
        content: '周末探店第三家，意外发现了很好吃的可颂，下次带朋友一起来 🥐',
        images: ['https://picsum.photos/600/400?random=44'],
        location: '北京·朝阳·国贸',
        createdAt: NOW - 30 * HOUR,
        likes: 33
    }),
    build({
        id: 7,
        userId: 14,
        content: '晚上画速写，画到十二点才发现没吃饭，设计师的快乐和痛苦都一样 🖌️',
        images: ['https://picsum.photos/600/400?random=45'],
        location: '北京·西城',
        createdAt: NOW - 50 * HOUR,
        likes: 27
    }),

    // ================= 跨城（冷启动兜底 + 相邻城市） =================
    build({
        id: 8,
        userId: 2,
        content: '周末的瑜伽课，身心都得到了放松 🧘‍♀️ 有没有一起练瑜伽的小伙伴？',
        images: [
            'https://picsum.photos/600/400?random=21',
            'https://picsum.photos/600/400?random=22'
        ],
        location: '上海·静安',
        createdAt: NOW - 4 * HOUR,
        likes: 45,
        isQuality: true,
        commentList: [comment(11, '这家馆老师很专业', 120)]
    }),
    build({
        id: 9,
        userId: 3,
        content: '第一次尝试做甜品，虽然卖相一般但味道不错 😋 生活需要一点甜~',
        images: ['https://picsum.photos/600/400?random=23'],
        location: '杭州·西湖',
        createdAt: NOW - 8 * HOUR,
        likes: 67,
        isQuality: true
    }),
    build({
        id: 10,
        userId: 4,
        content: '最近迷上了水彩画，虽然还是新手但画得很开心 🎨 有同好交流一下吗？',
        images: [
            'https://picsum.photos/600/400?random=24',
            'https://picsum.photos/600/400?random=25',
            'https://picsum.photos/600/400?random=26'
        ],
        location: '成都·锦里',
        createdAt: NOW - 20 * HOUR,
        likes: 34
    }),
    build({
        id: 11,
        userId: 6,
        content: '看完话剧出来已经十一点了，广州的夜晚还是热的，但心情很好 🎭',
        images: ['https://picsum.photos/600/400?random=28'],
        location: '广州·天河',
        createdAt: NOW - 28 * HOUR,
        likes: 41
    }),
    build({
        id: 12,
        userId: 11,
        content: '周末去海边冲浪，被浪拍了一整天，但是很快乐 🏄‍♀️',
        images: ['https://picsum.photos/600/400?random=34'],
        location: '深圳·大鹏',
        createdAt: NOW - 40 * HOUR,
        likes: 88,
        isQuality: true
    }),
    build({
        id: 13,
        userId: 12,
        content: '带学生做活动的一天，嗓子哑了但很充实，晚上给自己泡了杯茶 🍵',
        images: ['https://picsum.photos/600/400?random=35'],
        location: '天津·南开',
        createdAt: NOW - 46 * HOUR,
        likes: 31,
        isQuality: true
    })
]

export const findDynamicById = (id) => dynamics.find(item => item.id === Number(id)) || null

/**
 * 相对时间文案：刚刚 / N 分钟前 / N 小时前 / 昨天 / N 天前
 */
export const formatRelativeTime = (ts) => {
    const diff = Date.now() - Number(ts || 0)
    if (diff < 60 * 1000) return '刚刚'
    if (diff < HOUR) return `${Math.floor(diff / (60 * 1000))}分钟前`
    if (diff < DAY) return `${Math.floor(diff / HOUR)}小时前`
    if (diff < 2 * DAY) return '昨天'
    if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}天前`
    return `${Math.floor(diff / (7 * DAY))}周前`
}

/**
 * 同城热门地点（发布页位置标签候选，不调 GPS，只让用户手动选）
 */
export const locationOptions = [
    '北京·朝阳·三里屯',
    '北京·朝阳·国贸',
    '北京·海淀·五道口',
    '北京·东城·南锣鼓巷',
    '北京·西城·后海',
    '北京·朝阳·朝阳大悦城'
]

export { users }
export default dynamics
