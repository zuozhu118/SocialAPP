/**
 * 同城匹配用户池（纯前端 mock）
 * 说明：字段结构与 pages/match/index.vue 的既有卡片结构保持一致，
 * 后续接入后端时，只需把本文件替换为接口返回即可。
 */

const album = (seed) =>
 Array.from({ length: 6 }, (_, i) => `https://picsum.photos/400/400?random=${seed + i}`)

const avatar = (seed) => `https://picsum.photos/800/1000?random=${seed}`

const defaults = {
 hasCompletedTest: true,
 maritalStatus: '未婚',
 weight: 50,
 constellation: '温柔座',
 auth: { realName: true, education: false, work: false },
 showMedals: [],
 lifeScript: { name: '烟火安居型', desc: '', tags: [] },
 values: { love: '', consume: '', life: '' }
}

const user = (data) => ({
 ...defaults,
 ...data,
 auth: { ...defaults.auth, ...(data.auth || {}) },
 lifeScript: { ...defaults.lifeScript, ...(data.lifeScript || {}) },
 values: { ...defaults.values, ...(data.values || {}) }
})

export const users = [
 user({
 id: 1,
 name: '林小鹿',
 gender: 'female',
 age: 24,
 birthYear: '00',
 height: 165,
 weight: 48,
 constellation: '巨蟹座',
 education: '本科',
 career: '互联网产品经理',
 occupation: '教师',
 avatar: avatar(101),
 district: '朝阳区',
 hometown: '天津',
 income: '15-20W',
 ipLocation: '北京市',
 bio: '慢热型，希望遇到能一起吃很多饭、聊很多天的人',
 matchSlogan: '都爱周末探店的你们，大概率能吃到一起、聊到一块',
 weekendTags: ['探店觅食', '逛展看剧', '居家观影'],
 hobbyTags: ['摄影', '旅行', '咖啡', '阅读'],
 personalityTags: ['慢热', '温柔', '细节控', '共情力强'],
 lifeTags: ['无车', '一房', '不吸烟', '不喝酒'],
 expectTags: ['22-30岁', '未婚', '175cm+', '本科及以上', '情绪稳定', '三观正', '同城'],
 showMedals: [
 { name: '双一流守护者', icon: 'icon-medal-gold', type: 'gold' },
 { name: '大厂搬砖人', icon: 'icon-briefcase', type: 'blue' }
 ],
 lifeScript: {
 name: '烟火安居型',
 desc: '追求稳定的生活节奏，看重家庭与日常的幸福感，倾向于在熟悉的城市定居发展，一步步经营自己的小日子。',
 tags: ['定居发展', '安稳踏实', '家庭优先', '细水长流']
 },
 values: {
 love: '认真奔结婚，不接受快餐式恋爱，希望感情是双向奔赴慢慢升温',
 consume: '适度消费，注重性价比，不盲目攀比，愿意为爱好和体验买单',
 life: '追求安稳的小幸福，工作之余享受生活，不卷也不躺平'
 },
 auth: { realName: true, education: true, work: false },
 album: album(11)
 }),
 user({
 id: 2,
 name: '陈橘子',
 gender: 'female',
 age: 26,
 birthYear: '98',
 height: 168,
 constellation: '双子座',
 education: '研究生',
 career: '金融分析师',
 occupation: '财务',
 avatar: avatar(102),
 district: '浦东新区',
 hometown: '杭州',
 income: '20-30W',
 ipLocation: '上海市',
 bio: '理性与浪漫各一半，喜欢有质感的生活',
 matchSlogan: '一个规划行程一个负责惊喜，你们的相处节奏会很合拍',
 weekendTags: ['健身运动', '咖啡探店', '城市漫步'],
 hobbyTags: ['瑜伽', '阅读', '音乐', '理财', '跑步', '烹饪'],
 personalityTags: ['独立', '理性', '自律', '目标感强', '幽默'],
 lifeTags: ['无车', '无房', '不吸烟', '偶尔喝酒'],
 expectTags: ['24-32岁', '未婚', '175cm+', '本科及以上', '上进自律', '情绪稳定'],
 showMedals: [
 { name: '学术钻研人', icon: 'icon-graduation', type: 'purple' },
 { name: '职场精英', icon: 'icon-briefcase', type: 'blue' }
 ],
 lifeScript: {
 name: '事业进阶型',
 desc: '处于事业上升期，看重个人成长与职业发展，希望另一半能并肩同行，彼此支持共同变好。',
 tags: ['事业上升', '共同成长', '独立自律', '眼界开阔']
 },
 values: {
 love: '势均力敌的爱情，彼此欣赏互相扶持，不依附不将就',
 consume: '看重品质不看数量，愿意为体验和自我提升投资',
 life: '工作时全力以赴，生活时尽情享受，保持成长节奏'
 },
 auth: { realName: true, education: true, work: true },
 album: album(21)
 }),
 user({
 id: 3,
 name: '吴晴天',
 gender: 'female',
 age: 25,
 birthYear: '99',
 height: 162,
 constellation: '天秤座',
 education: '本科',
 career: '视觉设计师',
 occupation: '设计师',
 avatar: avatar(103),
 district: '西湖区',
 hometown: '绍兴',
 income: '12-18W',
 ipLocation: '杭州市',
 bio: '喜欢海边和日落，也喜欢把生活过成小确幸',
 matchSlogan: '都爱用镜头记录生活的你们，会很有共同话题',
 weekendTags: ['看展', '拍照', '骑行'],
 hobbyTags: ['水彩', '摄影', '手作', '旅行'],
 personalityTags: ['细腻', '浪漫', '安静', '有耐心'],
 lifeTags: ['无车', '租房', '不吸烟', '不喝酒'],
 expectTags: ['24-30岁', '未婚', '170cm+', '有趣', '情绪稳定', '同城'],
 showMedals: [{ name: '生活美学家', icon: 'icon-medal-gold', type: 'gold' }],
 lifeScript: {
 name: '浪漫生活型',
 desc: '相信生活需要仪式感，会为一束花、一场日落停下脚步，也希望另一半愿意一起感受。',
 tags: ['仪式感', '审美在线', '热爱生活', '温柔以待']
 },
 values: {
 love: '喜欢就从一而终，希望被认真对待，也愿意认真对待对方',
 consume: '愿意为美和体验花钱，但不为虚荣买单',
 life: '工作是为了更好地生活，保持热爱和好奇心'
 },
 auth: { realName: true, education: true, work: true },
 album: album(31)
 }),
 user({
 id: 4,
 name: '郑小暖',
 gender: 'female',
 age: 23,
 birthYear: '01',
 height: 158,
 constellation: '双鱼座',
 education: '本科',
 career: '插画师',
 occupation: '自由职业',
 avatar: avatar(104),
 district: '锦江区',
 hometown: '成都',
 income: '10-15W',
 ipLocation: '成都市',
 bio: '最近迷上了水彩画，虽然还是新手但画得很开心',
 matchSlogan: '同城的你们，周末可以一起去逛美术馆',
 weekendTags: ['画画', '逛市集', '撸猫'],
 hobbyTags: ['水彩', '烘焙', '猫', '民谣'],
 personalityTags: ['软萌', '真诚', '小太阳', '慢热'],
 lifeTags: ['无车', '租房', '不吸烟', '不喝酒'],
 expectTags: ['22-28岁', '未婚', '170cm+', '温柔', '有稳定工作'],
 lifeScript: {
 name: '自由生长型',
 desc: '更在意内心的满足感，愿意用喜欢的方式工作与生活，希望遇到懂得欣赏的人。',
 tags: ['自由职业', '内心丰富', '松弛感', '热爱创作']
 },
 values: {
 love: '相信一见钟情，也相信日久生情，想认真谈一场',
 consume: '够用就好，把钱花在喜欢的事情上',
 life: '简单、自在、有自己的小世界'
 },
 album: album(41)
 }),
 user({
 id: 5,
 name: '苏念安',
 gender: 'female',
 age: 27,
 birthYear: '97',
 height: 170,
 constellation: '摩羯座',
 education: '硕士',
 career: '医药研发',
 occupation: '研究员',
 avatar: avatar(105),
 district: '海淀区',
 hometown: '济南',
 income: '25-35W',
 ipLocation: '北京市',
 bio: '实验室里待久了，更想认真经营生活',
 matchSlogan: '都重视长期关系的你们，会聊得很深',
 weekendTags: ['爬山', '读书', '看纪录片'],
 hobbyTags: ['徒步', '历史', '烘焙', '古典乐', '摄影'],
 personalityTags: ['稳重', '理性', '专注', '有规划', '踏实'],
 lifeTags: ['有车', '一房', '不吸烟', '不喝酒'],
 expectTags: ['26-34岁', '未婚', '178cm+', '硕士及以上', '有责任心'],
 showMedals: [
 { name: '学术钻研人', icon: 'icon-graduation', type: 'purple' },
 { name: '自律生活家', icon: 'icon-medal-gold', type: 'gold' }
 ],
 lifeScript: {
 name: '长期主义型',
 desc: '做事有规划，感情也一样，希望用几年时间把一段关系经营成生活。',
 tags: ['长期主义', '目标清晰', '稳定可靠', '深度交流']
 },
 values: {
 love: '不求轰轰烈烈，但求踏实长久、彼此成就',
 consume: '理性消费，重视健康和自我提升',
 life: '规律、健康、有节奏'
 },
 auth: { realName: true, education: true, work: true },
 album: album(51)
 }),
 user({
 id: 6,
 name: '夏知意',
 gender: 'female',
 age: 24,
 birthYear: '00',
 height: 163,
 constellation: '白羊座',
 education: '本科',
 career: '新媒体运营',
 occupation: '运营',
 avatar: avatar(106),
 district: '天河区',
 hometown: '长沙',
 income: '12-18W',
 ipLocation: '广州市',
 bio: '爱笑爱闹，周末不是在看展就是在去看展的路上',
 matchSlogan: '都爱热闹的你们，周末不会无聊',
 weekendTags: ['看展', 'livehouse', '桌游'],
 hobbyTags: ['话剧', '音乐节', '美食', '旅行'],
 personalityTags: ['外向', '幽默', '行动派', '情绪稳定'],
 lifeTags: ['无车', '租房', '不吸烟', '偶尔喝酒'],
 expectTags: ['23-30岁', '未婚', '172cm+', '会聊天', '有生活'],
 lifeScript: {
 name: '热烈体验型',
 desc: '喜欢把生活排得满满当当，愿意尝试新鲜事物，希望另一半能一起出发。',
 tags: ['热爱新鲜', '行动力强', '社交能量', '一起出发']
 },
 values: {
 love: '喜欢就主动，真诚永远是必杀技',
 consume: '为体验和快乐买单，攒钱也要旅行',
 life: '热烈、丰富、不留遗憾'
 },
 album: album(61)
 }),
 user({
 id: 7,
 name: '顾清和',
 gender: 'female',
 age: 28,
 birthYear: '96',
 height: 166,
 constellation: '处女座',
 education: '本科',
 career: '律师助理',
 occupation: '法务',
 avatar: avatar(107),
 district: '福田区',
 hometown: '南昌',
 income: '18-25W',
 ipLocation: '深圳市',
 bio: '做事认真，也希望被认真对待',
 matchSlogan: '都看重边界感的你们，相处会很舒服',
 weekendTags: ['普拉提', '咖啡', '整理房间'],
 hobbyTags: ['健身', '烹饪', '阅读', '旅行'],
 personalityTags: ['清醒', '有条理', '温和坚定', '独立'],
 lifeTags: ['无车', '一房', '不吸烟', '不喝酒'],
 expectTags: ['27-35岁', '未婚', '175cm+', '有规划', '尊重边界'],
 lifeScript: {
 name: '清醒独立型',
 desc: '清楚自己要什么，也尊重对方的节奏，希望关系里彼此都有空间。',
 tags: ['边界感', '清醒独立', '生活规律', '互相尊重']
 },
 values: {
 love: '舒服的关系比心动的瞬间更重要',
 consume: '有预算、有规划，不冲动消费',
 life: '自律给我自由'
 },
 auth: { realName: true, education: true, work: false },
 album: album(71)
 }),
 user({
 id: 8,
 name: '温以宁',
 gender: 'female',
 age: 25,
 birthYear: '99',
 height: 160,
 constellation: '金牛座',
 education: '本科',
 career: '幼儿园老师',
 occupation: '教师',
 avatar: avatar(108),
 district: '武侯区',
 hometown: '成都',
 income: '8-12W',
 ipLocation: '成都市',
 bio: '喜欢小朋友，也喜欢把自己照顾好',
 matchSlogan: '都向往安稳生活的你们，会很合拍',
 weekendTags: ['做饭', '公园散步', '看剧'],
 hobbyTags: ['烘焙', '养花', '手账', '宠物'],
 personalityTags: ['温柔', '耐心', '顾家', '亲和'],
 lifeTags: ['无车', '与父母同住', '不吸烟', '不喝酒'],
 expectTags: ['24-30岁', '未婚', '170cm+', '顾家', '稳定'],
 lifeScript: {
 name: '烟火安居型',
 desc: '喜欢厨房的烟火气，把日子过得踏实温暖，期待一份可以结婚的感情。',
 tags: ['顾家', '温暖', '踏实', '向往婚姻']
 },
 values: {
 love: '想找一个可以一起回家吃饭的人',
 consume: '会过日子，但不亏待自己',
 life: '简单、温暖、有烟火气'
 },
 album: album(81)
 }),
 user({
 id: 9,
 name: '沈星野',
 gender: 'female',
 age: 29,
 birthYear: '95',
 height: 172,
 constellation: '射手座',
 education: '硕士',
 career: '建筑设计师',
 occupation: '设计师',
 avatar: avatar(109),
 district: '杨浦区',
 hometown: '宁波',
 income: '25-35W',
 ipLocation: '上海市',
 bio: '画图之外，喜欢到处走走看看',
 matchSlogan: '都爱旅行的你们，可以一起规划下一站',
 weekendTags: ['城市漫游', '建筑考察', '露营'],
 hobbyTags: ['旅行', '摄影', '露营', '咖啡', '电影'],
 personalityTags: ['爽朗', '有主见', '审美在线', '自由'],
 lifeTags: ['有车', '租房', '不吸烟', '偶尔喝酒'],
 expectTags: ['28-36岁', '未婚', '178cm+', '有审美', '独立'],
 showMedals: [{ name: '审美在逃者', icon: 'icon-medal-gold', type: 'gold' }],
 lifeScript: {
 name: '自由生长型',
 desc: '不喜欢被定义，愿意为热爱的城市与风景反复出发，希望另一半也有自己的世界。',
 tags: ['自由', '有主见', '审美在线', '彼此独立']
 },
 values: {
 love: '最好的关系是两个完整的人同行',
 consume: '愿意为设计、旅行、体验付费',
 life: '保持好奇，一直在路上'
 },
 auth: { realName: true, education: true, work: true },
 album: album(91)
 }),
 user({
 id: 10,
 name: '许一诺',
 gender: 'female',
 age: 22,
 birthYear: '02',
 height: 156,
 constellation: '水瓶座',
 education: '本科在读',
 career: '大四在读',
 occupation: '学生',
 avatar: avatar(110),
 district: '洪山区',
 hometown: '武汉',
 income: '暂无',
 ipLocation: '武汉市',
 bio: '刚结束考研，想认真认识一个人',
 matchSlogan: '都在人生新阶段的你们，可以互相打气',
 weekendTags: ['图书馆', '奶茶', '电影'],
 hobbyTags: ['手账', '动漫', '跑步', '唱歌'],
 personalityTags: ['清澈', '直率', '有活力', '好学'],
 lifeTags: ['无车', '住宿舍', '不吸烟', '不喝酒'],
 expectTags: ['22-28岁', '未婚', '170cm+', '上进', '真诚'],
 lifeScript: {
 name: '成长进阶型',
 desc: '正站在人生的岔路口，希望遇到一个能一起变得更好的人。',
 tags: ['成长中', '真诚直率', '有冲劲', '一起变好']
 },
 values: {
 love: '想谈一场干净、真诚的恋爱',
 consume: '学生党预算有限，但会为对方花心思',
 life: '努力学习，也努力生活'
 },
 auth: { realName: true, education: false, work: false },
 album: album(111)
 }),
 user({
 id: 11,
 name: '叶南乔',
 gender: 'female',
 age: 27,
 birthYear: '97',
 height: 167,
 constellation: '天蝎座',
 education: '本科',
 career: '品牌策划',
 occupation: '策划',
 avatar: avatar(112),
 district: '南山区',
 hometown: '福州',
 income: '20-28W',
 ipLocation: '深圳市',
 bio: '工作里理性，生活里很感性',
 matchSlogan: '都注重沟通的你们，吵架也能好好说话',
 weekendTags: ['冲浪', '看海', '小酒馆'],
 hobbyTags: ['潜水', '写作', '电影', '旅行'],
 personalityTags: ['洞察力强', '重感情', '有韧性', '幽默'],
 lifeTags: ['无车', '租房', '不吸烟', '偶尔喝酒'],
 expectTags: ['26-34岁', '未婚', '175cm+', '会沟通', '稳定'],
 lifeScript: {
 name: '深度连接型',
 desc: '在意关系的质量，愿意花时间理解对方，也期待被理解。',
 tags: ['深度沟通', '重感情', '情绪成熟', '彼此理解']
 },
 values: {
 love: '想要能聊到深夜、也能一起沉默的人',
 consume: '该省省该花花，为情绪价值买单',
 life: '一半理性，一半浪漫'
 },
 auth: { realName: true, education: true, work: false },
 album: album(121)
 }),
 user({
 id: 12,
 name: '白露微',
 gender: 'female',
 age: 30,
 birthYear: '94',
 height: 164,
 constellation: '狮子座',
 education: '硕士',
 career: '高校辅导员',
 occupation: '教师',
 avatar: avatar(113),
 district: '南开区',
 hometown: '天津',
 income: '15-20W',
 ipLocation: '天津市',
 bio: '带学生的人，自己也需要被照顾',
 matchSlogan: '都想认真成家的你们，方向一致',
 weekendTags: ['瑜伽', '插花', '看展'],
 hobbyTags: ['瑜伽', '书法', '园艺', '旅行'],
 personalityTags: ['大气', '有分寸', '温暖', '成熟'],
 lifeTags: ['有车', '一房', '不吸烟', '不喝酒'],
 expectTags: ['29-38岁', '未婚', '175cm+', '成熟稳重', '有担当'],
 lifeScript: {
 name: '沉静经营型',
 desc: '过了追求刺激的年纪，更想要稳定、体面、彼此扶持的关系。',
 tags: ['成熟稳重', '认真成家', '相互扶持', '生活品质']
 },
 values: {
 love: '成年人的爱情，是理解、是承担、是并肩',
 consume: '注重品质与长期价值',
 life: '把生活经营得体面而松弛'
 },
 auth: { realName: true, education: true, work: true },
 album: album(131)
 }),
 // ===== 同城（北京）补充用户：用于动态广场冷启动内容 =====
 user({
 id: 13,
 name: '江小满',
 gender: 'female',
 age: 26,
 birthYear: '00',
 height: 166,
 constellation: '处女座',
 education: '本科',
 career: '独立咖啡店主理人',
 occupation: '餐饮',
 avatar: avatar(114),
 district: '东城区',
 hometown: '北京',
 income: '15-25W',
 ipLocation: '北京市',
 bio: '开了家小店，一半时间在煮咖啡，一半时间在等一个常来的人',
 matchSlogan: '都在认真生活的你们，会懂彼此的节奏',
 weekendTags: ['手冲咖啡', '看展', '骑车逛胡同'],
 hobbyTags: ['咖啡', '骑行', '旅行', '摄影'],
 personalityTags: ['爽朗', '有烟火气', '行动派'],
 lifeTags: ['有车', '租房', '不吸烟', '偶尔喝酒'],
 expectTags: ['25-32岁', '未婚', '170cm+', '同城', '有生活热情'],
 lifeScript: {
 name: '烟火安居型',
 desc: '喜欢把日子过得有滋味，店、猫、咖啡和周末的阳光就足够了。',
 tags: ['小店日常', '烟火气', '热情生活']
 },
 values: {
 love: '把彼此放进日常，比说很多情话重要',
 consume: '该省省该花花，为体验买单',
 life: '忙碌但有节奏，周末必须出门'
 },
 auth: { realName: true, education: false, work: true },
 album: album(141)
 }),
 user({
 id: 14,
 name: '温言',
 gender: 'female',
 age: 25,
 birthYear: '01',
 height: 163,
 constellation: '天秤座',
 education: '本科',
 career: 'UI 设计师',
 occupation: '设计师',
 avatar: avatar(115),
 district: '西城区',
 hometown: '北京',
 income: '20-30W',
 ipLocation: '北京市',
 bio: '白天画界面，晚上画速写，周末大概率在美术馆',
 matchSlogan: '都在意审美与细节的你们，会聊得来',
 weekendTags: ['逛美术馆', '城市漫步', '手冲咖啡'],
 hobbyTags: ['画画', '摄影', '电影', '看展'],
 personalityTags: ['安静', '细腻', '有想法'],
 lifeTags: ['无车', '一房', '不吸烟', '不喝酒'],
 expectTags: ['25-32岁', '未婚', '175cm+', '同城', '聊得来'],
 lifeScript: {
 name: '自由生长型',
 desc: '把热爱做成工作的一部分，也把生活过成作品。',
 tags: ['审美在线', '自由生长', '慢热']
 },
 values: {
 love: '能一起沉默也不尴尬，才是舒服的关系',
 consume: '愿意为设计感付费',
 life: '工作认真，生活松弛'
 },
 auth: { realName: true, education: true, work: true },
 album: album(151)
 })
]

// 便捷查找
export const findUserById = (id) => users.find(u => u.id === Number(id)) || null

// 当前登录用户的默认资料（mock）
export const currentUserProfile = {
 id: 10000,
 name: '顾行舟',
 gender: 'male',
 age: 28,
 birthYear: '98',
 height: 178,
 weight: 70,
 constellation: '天秤座',
 education: '本科',
 career: '后端工程师',
 occupation: '工程师',
 avatar: 'https://picsum.photos/800/1000?random=900',
 district: '朝阳区',
 hometown: '北京',
 income: '25-35W',
 ipLocation: '北京市',
 bio: '喜欢跑步和做饭，希望遇到一个可以一起吃晚饭的人',
 weekendTags: ['跑步', '做饭', '电影'],
 hobbyTags: ['跑步', '烹饪', '摄影'],
 personalityTags: ['踏实', '幽默', '有耐心'],
 lifeTags: ['有车', '租房', '不吸烟', '偶尔喝酒'],
 auth: { realName: true, education: false, work: false },
 album: album(900)
}

export default users
