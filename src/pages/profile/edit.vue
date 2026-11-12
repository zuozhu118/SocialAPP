<template>
    <view class="edit-page">
        <!-- 顶部导航栏 -->
        <view class="edit-navbar">
            <text class="edit-navbar__back icon icon-arrow-left" @click="goBack"></text>
            <text class="edit-navbar__title">编辑资料</text>
            <text class="edit-navbar__save" @click="handleSave">保存</text>
        </view>

        <!-- ===== 头像设置 ===== -->
        <view class="avatar-section">
            <view class="avatar-section__wrap" @click="changeAvatar">
                <image class="avatar-section__img" :src="form.avatar" mode="aspectFill" />
                <view class="avatar-section__mask">
                    <text>更换头像</text>
                </view>
            </view>
        </view>

        <!-- ===== 匹配页头图（主页主图） ===== -->
        <view class="edit-card">
            <view class="edit-card__title">
                首页主图
                <text class="edit-card__tip">建议上传宽高比 16:9 的图片</text>
            </view>
            <view class="main-image-wrap" @click="changeMainImage">
                <image v-if="form.mainImage" class="main-image__img" :src="form.mainImage" mode="aspectFill" />
                <!-- 已有图片时的编辑浮层，引导用户点击更换 -->
                <view v-if="form.mainImage" class="main-image__edit-mask">
                    <text>点击更换图片</text>
                </view>
                <view v-else class="main-image__placeholder">
                    <text class="main-image__placeholder-title">点击上传本人照片</text>
                    <text class="main-image__placeholder-desc">建议上传清晰正脸照，比例 16:9 效果最佳</text>
                </view>
            </view>
            <text class="form-tip form-tip--warn">请上传本人真实、清晰的图片，非本人照片将无法通过审核</text>
        </view>

        <!-- ===== 我的相册（支持拖拽排序） ===== -->
        <view class="edit-card">
            <view class="edit-card__title">
                我的相册
                <text class="edit-card__tip">长按拖动可调整顺序，最多9张</text>
            </view>
            <view class="album-grid">
                <view v-for="(img, idx) in form.album"
                      :key="idx"
                      class="album-grid__item"
                      :class="{ 'is-dragging': dragIndex === idx }"
                      draggable="true"
                      @dragstart="handleDragStart(idx)"
                      @dragover.prevent="handleDragOver"
                      @drop="handleDrop(idx)">
                    <image class="album-grid__img" :src="img" mode="aspectFill" @click="previewAlbum(idx)" />
                    <text class="album-grid__del icon icon-close" @click.stop="deleteAlbumImg(idx)"></text>
                </view>
                <view v-if="form.album.length < 9"
                      class="album-grid__item album-grid__add"
                      @click="addAlbumImg">
                    <text class="icon icon-plus"></text>
                    <text>添加</text>
                </view>
            </view>
        </view>

        <!-- ===== 基础资料 ===== -->
        <view class="edit-card">
            <view class="edit-card__title">基础资料</view>
            <!-- 昵称 -->
            <view class="form-item">
                <text class="form-item__label">昵称</text>
                <input class="form-item__input"
                       v-model="form.nickname"
                       placeholder="请输入昵称"
                       placeholder-class="form-placeholder" />
            </view>
            <!-- 性别 -->
            <view class="form-item" @click="selectGender">
                <text class="form-item__label">性别</text>
                <view class="form-item__value">
                    <text>{{ form.gender === 'female' ? '女' : '男' }}</text>
                    <text class="icon icon-arrow-right form-item__arrow"></text>
                </view>
            </view>
            <!-- 生日 -->
            <view class="form-item">
                <text class="form-item__label">生日</text>
                <picker mode="date" :value="form.birthday" @change="onBirthdayChange">
                    <view class="form-item__value">
                        <text>{{ form.birthday || '请选择生日' }}</text>
                        <text class="icon icon-arrow-right form-item__arrow"></text>
                    </view>
                </picker>
            </view>
            <!-- 身高 -->
            <view class="form-item">
                <text class="form-item__label">身高</text>
                <view class="form-item__input-wrap">
                    <input class="form-item__input form-item__input--right"
                           type="number"
                           v-model="form.height"
                           placeholder="请输入身高"
                           placeholder-class="form-placeholder" />
                    <text class="form-item__unit">cm</text>
                </view>
            </view>
            <!-- 体重 -->
            <view class="form-item">
                <text class="form-item__label">体重</text>
                <view class="form-item__input-wrap">
                    <input class="form-item__input form-item__input--right"
                           type="number"
                           v-model="form.weight"
                           placeholder="请输入体重"
                           placeholder-class="form-placeholder" />
                    <text class="form-item__unit">kg</text>
                </view>
            </view>
            <!-- 学历 -->
            <view class="form-item" @click="selectEducation">
                <text class="form-item__label">学历</text>
                <view class="form-item__value">
                    <text>{{ form.education || '请选择学历' }}</text>
                    <text class="icon icon-arrow-right form-item__arrow"></text>
                </view>
            </view>
            <!-- 职业 -->
            <view class="form-item">
                <text class="form-item__label">职业</text>
                <input class="form-item__input form-item__input--right"
                       v-model="form.career"
                       placeholder="请输入职业"
                       placeholder-class="form-placeholder" />
            </view>
            <!-- ===== 所在城市（自动定位 + 手动修改） ===== -->
            <view class="form-item form-item--city">
                <text class="form-item__label">所在城市</text>
                <view class="form-item__city-wrap">
                    <view class="form-item__city-status" :class="locationStatusClass" @click="handleLocation">
                        <text class="icon" :class="locationStatusIcon"></text>
                        <text>{{ locationStatusText }}</text>
                    </view>
                    <view class="form-item__city-value" @click="selectCity">
                        <text>{{ form.city || '点击选择' }}</text>
                        <text class="icon icon-arrow-right form-item__arrow"></text>
                    </view>
                </view>
            </view>
            <!-- 籍贯 -->
            <view class="form-item" @click="selectHometown">
                <text class="form-item__label">籍贯</text>
                <view class="form-item__value">
                    <text>{{ form.hometown || '请选择籍贯' }}</text>
                    <text class="icon icon-arrow-right form-item__arrow"></text>
                </view>
            </view>
            <!-- 婚姻状况 -->
            <view class="form-item" @click="selectMarital">
                <text class="form-item__label">婚姻状况</text>
                <view class="form-item__value">
                    <text>{{ form.maritalStatus || '请选择' }}</text>
                    <text class="icon icon-arrow-right form-item__arrow"></text>
                </view>
            </view>
            <!-- 年收入 -->
            <view class="form-item" @click="selectIncome">
                <text class="form-item__label">年收入</text>
                <view class="form-item__value">
                    <text>{{ form.income || '请选择年收入' }}</text>
                    <text class="icon icon-arrow-right form-item__arrow"></text>
                </view>
            </view>
            <!-- 房产情况 -->
            <view class="form-item" @click="selectHouse">
                <text class="form-item__label">房产情况</text>
                <view class="form-item__value">
                    <text>{{ form.house || '请选择' }}</text>
                    <text class="icon icon-arrow-right form-item__arrow"></text>
                </view>
            </view>
            <!-- 房贷情况 -->
            <view class="form-item" @click="selectHouseLoan">
                <text class="form-item__label">房贷情况</text>
                <view class="form-item__value">
                    <text>{{ form.houseLoan || '请选择' }}</text>
                    <text class="icon icon-arrow-right form-item__arrow"></text>
                </view>
            </view>
            <!-- 车辆情况 -->
            <view class="form-item" @click="selectCar">
                <text class="form-item__label">车辆情况</text>
                <view class="form-item__value">
                    <text>{{ form.car || '请选择' }}</text>
                    <text class="icon icon-arrow-right form-item__arrow"></text>
                </view>
            </view>
            <!-- 车贷情况 -->
            <view class="form-item form-item--last" @click="selectCarLoan">
                <text class="form-item__label">车贷情况</text>
                <view class="form-item__value">
                    <text>{{ form.carLoan || '请选择' }}</text>
                    <text class="icon icon-arrow-right form-item__arrow"></text>
                </view>
            </view>
        </view>

        <!-- ===== 微信号（联系方式） ===== -->
        <view class="edit-card">
            <view class="edit-card__title">联系方式</view>
            <view class="form-item form-item--column">
                <text class="form-item__label">微信号</text>
                <input class="form-item__input form-item__input--full"
                       v-model="form.wechat"
                       placeholder="请填写微信号，方便对方联系你"
                       placeholder-class="form-placeholder" />
                <text class="form-tip form-tip--warn">
                   请勿使用电话号码作为微信号，注意保护个人隐私与财产安全
                </text>
            </view>
        </view>

        <!-- ===== 个人简介 ===== -->
        <view class="edit-card">
            <view class="edit-card__title">个人简介</view>
            <textarea class="bio-textarea"
                      v-model="form.bio"
                      placeholder="介绍一下自己，让大家更了解你吧～"
                      placeholder-class="form-placeholder"
                      maxlength="200"
                      auto-height />
            <view class="bio-count">{{ form.bio.length }}/200</view>
        </view>

        <!-- ===== 兴趣爱好 ===== -->
        <view class="edit-card">
            <view class="edit-card__title">兴趣爱好</view>
            <view class="tag-group">
                <text v-for="tag in hobbyOptions"
                      :key="tag"
                      class="edit-tag"
                      :class="{ 'edit-tag--active': form.hobbyTags.includes(tag) }"
                      @click="toggleHobbyTag(tag)">
                    {{ tag }}
                </text>
            </view>
        </view>

        <!-- ===== 性格特质 ===== -->
        <view class="edit-card">
            <view class="edit-card__title">性格特质</view>
            <view class="tag-group">
                <text v-for="tag in personalityOptions"
                      :key="tag"
                      class="edit-tag"
                      :class="{ 'edit-tag--active': form.personalityTags.includes(tag) }"
                      @click="togglePersonalityTag(tag)">
                    {{ tag }}
                </text>
            </view>
        </view>

        <!-- ===== 周末日常 ===== -->
        <view class="edit-card">
            <view class="edit-card__title">周末日常</view>
            <view class="tag-group">
                <text v-for="tag in weekendOptions"
                      :key="tag"
                      class="edit-tag"
                      :class="{ 'edit-tag--active': form.weekendTags.includes(tag) }"
                      @click="toggleWeekendTag(tag)">
                    {{ tag }}
                </text>
            </view>
        </view>

        <!-- ===== 人生剧本 ===== -->
        <view class="edit-card test-card" @click="handleScriptAction">
            <view class="test-card__header">
                <view class="test-card__title-wrap">
                    <text class="test-card__title">人生剧本</text>
                </view>
                <view class="test-card__link">
                    <text>去测试</text>
                    <text class="icon icon-arrow-right"></text>
                </view>
            </view>
            <!-- 未测试 -->
            <view v-if="!script.hasTested" class="test-card__empty">
                <text class="test-card__empty-title">发现你的人生剧本</text>
                <text class="test-card__empty-desc">10 道精选题目· 约 3 分钟</text>
            </view>
            <!-- 已测试 -->
            <view v-else class="test-card__result">
                <view class="test-card__result-badge" :class="'badge--' + script.result.type">
                    <text class="icon" :class="script.result.icon"></text>
                    <text>{{ script.result.name }}</text>
                </view>
                <text class="test-card__result-desc">{{ script.result.desc }}</text>
                <view class="test-card__cooldown" v-if="script.cooldownRemain > 0">
                    <text class="icon icon-clock"></text>
                    <text>{{ script.cooldownRemain }} 天后可重测</text>
                </view>
                <view class="test-card__cooldown test-card__cooldown--ready" v-else>
                    <text class="icon icon-refresh"></text>
                    <text>可重新测试</text>
                </view>
            </view>
        </view>

        <!-- ===== 三观态度 ===== -->
        <view class="edit-card test-card" @click="handleValuesAction">
            <view class="test-card__header">
                <view class="test-card__title-wrap">
                    <text class="test-card__title">三观态度</text>
                </view>
                <view class="test-card__link">
                    <text>去测试</text>
                    <text class="icon icon-arrow-right"></text>
                </view>
            </view>
            <!-- 未测试 -->
            <view v-if="!values.hasTested" class="test-card__empty">
                <text class="test-card__empty-title">探索你的三观态度</text>
                <text class="test-card__empty-desc">12 道情境题· 约 4 分钟</text>
            </view>
            <!-- 已测试 -->
            <view v-else class="test-card__result">
                <view class="test-card__result-items">
                    <view class="result-item">
                        <text class="result-item__label">恋爱观</text>
                        <text class="result-item__value">{{ values.result.love }}</text>
                    </view>
                    <view class="result-item">
                        <text class="result-item__label">消费观</text>
                        <text class="result-item__value">{{ values.result.consume }}</text>
                    </view>
                    <view class="result-item">
                        <text class="result-item__label">生活观</text>
                        <text class="result-item__value">{{ values.result.life }}</text>
                    </view>
                </view>
                <view class="test-card__cooldown" v-if="values.cooldownRemain > 0">
                    <text class="icon icon-clock"></text>
                    <text>{{ values.cooldownRemain }} 天后可重测</text>
                </view>
                <view class="test-card__cooldown test-card__cooldown--ready" v-else>
                    <text class="icon icon-refresh"></text>
                    <text>可重新测试</text>
                </view>
            </view>
        </view>

        <!-- ===== 期待的另一半 ===== -->
        <view class="edit-card">
            <view class="edit-card__title">期待的另一半</view>
            <view class="expect-form">
                <!-- 年龄范围 -->
                <view class="expect-form__item">
                    <text class="expect-form__label">年龄范围</text>
                    <view class="expect-form__range">
                        <input class="expect-form__input" type="number" v-model="form.expect.ageMin" placeholder="最小" />
                        <text class="expect-form__line">-</text>
                        <input class="expect-form__input" type="number" v-model="form.expect.ageMax" placeholder="最大" />
                        <text class="expect-form__unit">岁</text>
                    </view>
                </view>
                <!-- 身高范围 -->
                <view class="expect-form__item">
                    <text class="expect-form__label">身高范围</text>
                    <view class="expect-form__range">
                        <input class="expect-form__input" type="number" v-model="form.expect.heightMin" placeholder="最小" />
                        <text class="expect-form__line">-</text>
                        <input class="expect-form__input" type="number" v-model="form.expect.heightMax" placeholder="最大" />
                        <text class="expect-form__unit">cm</text>
                    </view>
                </view>
                <!-- 最低学历 -->
                <view class="expect-form__item" @click="selectExpectEducation">
                    <text class="expect-form__label">最低学历</text>
                    <view class="form-item__value">
                        <text>{{ form.expect.education || '请选择' }}</text>
                        <text class="icon icon-arrow-right form-item__arrow"></text>
                    </view>
                </view>
                <!-- 城市偏好 -->
                <view class="expect-form__item" @click="selectExpectCity">
                    <text class="expect-form__label">城市偏好</text>
                    <view class="form-item__value">
                        <text>{{ form.expect.city }}</text>
                        <text class="icon icon-arrow-right form-item__arrow"></text>
                    </view>
                </view>
                <!-- 家乡要求 -->
                <view class="expect-form__item" @click="selectExpectHometown">
                    <text class="expect-form__label">家乡要求</text>
                    <view class="form-item__value">
                        <text>{{ form.expect.hometown }}</text>
                        <text class="icon icon-arrow-right form-item__arrow"></text>
                    </view>
                </view>
                <!-- 婚姻状态（多选） -->
                <view class="expect-form__item expect-form__item--multi" @click="showMaritalPicker = true">
                    <text class="expect-form__label">婚姻状态</text>
                    <view class="form-item__value form-item__value--multi">
                        <text>{{ getExpectMaritalDisplay() || '请选择（可多选）' }}</text>
                        <text class="icon icon-arrow-right form-item__arrow"></text>
                    </view>
                </view>
                <view v-if="form.expect.marital.length > 0" class="expect-form__tags">
                    <text v-for="item in form.expect.marital" :key="item" class="expect-tag" @click="removeExpectMarital(item)">
                        {{ item }} <text class="icon icon-close"></text>
                    </text>
                </view>
                <!-- 年收入 -->
                <view class="expect-form__item" @click="selectExpectIncome">
                    <text class="expect-form__label">年收入</text>
                    <view class="form-item__value">
                        <text>{{ form.expect.income }}</text>
                        <text class="icon icon-arrow-right form-item__arrow"></text>
                    </view>
                </view>
                <!-- 房产情况 -->
                <view class="expect-form__item" @click="selectExpectHouse">
                    <text class="expect-form__label">房产情况</text>
                    <view class="form-item__value">
                        <text>{{ form.expect.house }}</text>
                        <text class="icon icon-arrow-right form-item__arrow"></text>
                    </view>
                </view>
                <!-- 吸烟情况 -->
                <view class="expect-form__item" @click="selectExpectSmoke">
                    <text class="expect-form__label">吸烟情况</text>
                    <view class="form-item__value">
                        <text>{{ form.expect.smoke }}</text>
                        <text class="icon icon-arrow-right form-item__arrow"></text>
                    </view>
                </view>
                <!-- 喝酒情况 -->
                <view class="expect-form__item" @click="selectExpectDrink">
                    <text class="expect-form__label">喝酒情况</text>
                    <view class="form-item__value">
                        <text>{{ form.expect.drink }}</text>
                        <text class="icon icon-arrow-right form-item__arrow"></text>
                    </view>
                </view>
                <!-- 家庭情况（多选） -->
                <view class="expect-form__item expect-form__item--multi" @click="showFamilyPicker = true">
                    <text class="expect-form__label">家庭情况</text>
                    <view class="form-item__value form-item__value--multi">
                        <text>{{ getExpectFamilyDisplay() || '请选择（可多选）' }}</text>
                        <text class="icon icon-arrow-right form-item__arrow"></text>
                    </view>
                </view>
                <view v-if="form.expect.family.length > 0" class="expect-form__tags">
                    <text v-for="item in form.expect.family" :key="item" class="expect-tag" @click="removeExpectFamily(item)">
                        {{ item }} <text class="icon icon-close"></text>
                    </text>
                </view>
            </view>
        </view>

        <!-- ===== 底部占位 ===== -->
        <view class="edit-bottom-placeholder"></view>

        <!-- ===== 婚姻状态多选弹窗 ===== -->
        <view v-if="showMaritalPicker" class="picker-overlay" @click="showMaritalPicker = false">
            <view class="picker-panel" @click.stop>
                <view class="picker-panel__header">
                    <text class="picker-panel__title">婚姻状态（可多选）</text>
                    <text class="picker-panel__confirm" @click="showMaritalPicker = false">确定</text>
                </view>
                <scroll-view class="picker-panel__body" scroll-y>
                    <view v-for="item in maritalOptions" :key="item"
                          class="picker-option"
                          :class="{ 'picker-option--active': form.expect.marital.includes(item) }"
                          @click="toggleExpectMarital(item)">
                        <view class="picker-option__check"></view>
                        <text class="picker-option__label">{{ item }}</text>
                    </view>
                </scroll-view>
            </view>
        </view>

        <!-- ===== 家庭情况多选弹窗 ===== -->
        <view v-if="showFamilyPicker" class="picker-overlay" @click="showFamilyPicker = false">
            <view class="picker-panel" @click.stop>
                <view class="picker-panel__header">
                    <text class="picker-panel__title">家庭情况（可多选）</text>
                    <text class="picker-panel__confirm" @click="showFamilyPicker = false">确定</text>
                </view>
                <scroll-view class="picker-panel__body" scroll-y>
                    <view v-for="item in familyOptions" :key="item"
                          class="picker-option"
                          :class="{ 'picker-option--active': form.expect.family.includes(item) }"
                          @click="toggleExpectFamily(item)">
                        <view class="picker-option__check"></view>
                        <text class="picker-option__label">{{ item }}</text>
                    </view>
                </scroll-view>
            </view>
        </view>
    </view>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue'
    import { useUserStore } from '@/store/index'

    // ===== Store（第 6 章：改城市 24h 生效）=====
    const userStore = useUserStore()

    // ===== 拖拽状态 =====
    const dragIndex = ref(null)

    // ===== 弹窗状态 =====
    const showMaritalPicker = ref(false)
    const showFamilyPicker = ref(false)

    // ===== 选项数据 =====
    const maritalOptions = ['未婚', '离异', '离异未育', '离异带儿子', '离异带女儿', '离异多孩', '丧偶']
    const familyOptions = [
        '独生子女',
        '有姐姐',
        '有妹妹',
        '有哥哥',
        '有弟弟',
        '有姐妹（均可）',
        '有兄弟（均可）',
        '不能有弟弟',
        '不能有哥哥',
        '不能有姐妹',
        '不能有兄弟',
        '无特殊要求',
        '兄弟姐妹关系融洽',
        '独立家庭无负担',
        '家庭和睦'
    ]
    const hobbyOptions = ['瑜伽', '跑步', '健身', '游泳', '阅读', '电影', '音乐', '摄影', '旅行', '咖啡探店', '美食', '桌游', '剧本杀', '手工', '绘画']
    const personalityOptions = ['独立', '理性', '自律', '乐观', '慢热', '外向', '内向', '温柔', '果断', '目标感强', '情绪稳定', '浪漫', '务实']
    const weekendOptions = ['宅家追剧', '户外徒步', '探店美食', '运动健身', '看书学习', '社交聚会', '打扫做饭', '逛展看剧', '打游戏', '睡懒觉']

    // ===== 表单数据 =====
    const form = ref({
        avatar: 'https://picsum.photos/200/200?random=30',
        mainImage: 'https://picsum.photos/800/450?random=102',
        nickname: '小鹿同学',
        gender: 'female',
        birthday: '1999-06-15',
        height: 165,
        weight: 50,
        education: '本科',
        career: '互联网运营',
        city: '北京',
        hometown: '河北石家庄',
        maritalStatus: '未婚',
        income: '10-20W',
        wechat: '',
        house: '无房',
        houseLoan: '无贷款',
        car: '无车',
        carLoan: '无贷款',
        album: [
            'https://picsum.photos/400/400?random=31',
            'https://picsum.photos/400/400?random=32',
            'https://picsum.photos/400/400?random=33'
        ],
        bio: '理性与浪漫各一半，喜欢有质感的生活。周末喜欢瑜伽和探店，希望遇到同频的人。',
        hobbyTags: ['瑜伽', '阅读', '咖啡探店', '音乐'],
        personalityTags: ['独立', '理性', '自律'],
        weekendTags: ['探店美食', '宅家追剧', '看书学习'],
        // 人生剧本
        script: {
            hasTested: false,
            testedAt: '2026-06-20',
            cooldownRemain: 12,
            result: {
                type: 'career',
                icon: 'icon-rocket',
                name: '事业进阶型',
                desc: '处于事业上升期，看重个人成长与职业发展，希望另一半能并肩同行，彼此支持共同变好。'
            }
        },
        // 三观态度
        values: {
            hasTested: false,
            testedAt: '2026-06-18',
            cooldownRemain: 8,
            result: {
                love: '势均力敌，彼此欣赏',
                consume: '注重品质，理性消费',
                life: '工作生活平衡，保持成长'
            }
        },
        expect: {
            ageMin: 24,
            ageMax: 32,
            heightMin: 175,
            heightMax: 190,
            education: '本科',
            city: '同城优先',
            hometown: '不限',
            marital: ['未婚'],
            income: '10-20W以上',
            house: '不限',
            smoke: '不吸烟',
            drink: '偶尔可接受',
            family: ['无特殊要求']
        }
    })

    // ===== 计算属性：人生剧本状态 =====
    const script = computed(() => form.value.script)

    // ===== 计算属性：三观态度状态 =====
    const values = computed(() => form.value.values)

    // ===== 所在城市定位状态 =====
    const locationStatusClass = ref('location--idle')
    const locationStatusIcon = ref('icon-location')
    const locationStatusText = ref('获取定位')

    // 获取定位
    const handleLocation = () => {
        if (locationStatusClass.value === 'location--loading') return
        locationStatusClass.value = 'location--loading'
        locationStatusIcon.value = 'icon-location'
        locationStatusText.value = '定位中...'
        // 模拟定位请求
        setTimeout(() => {
            // 模拟定位成功
            const mockCity = '北京'
            form.value.city = mockCity
            locationStatusClass.value = 'location--success'
            locationStatusIcon.value = 'icon-check-circle'
            locationStatusText.value = '已定位'
            uni.showToast({ title: '定位成功', icon: 'success' })
        }, 1200)
    }

    // ===== 辅助方法 =====
    const getExpectMaritalDisplay = () => {
        return form.value.expect.marital.join('、')
    }
    const getExpectFamilyDisplay = () => {
        return form.value.expect.family.join('、')
    }

    // ===== 导航 =====
    const goBack = () => {
        uni.navigateBack()
    }

    // ===== 头像（3.2：上传后进入 AI 人脸审核，网图 / 明星照会被驳回） =====
    const changeAvatar = () => {
        uni.chooseImage({
            count: 1,
            success: (res) => {
                form.value.avatar = res.tempFilePaths[0]
                uni.showToast({ title: '头像已提交 AI 人脸检测，审核通过后生效', icon: 'none', duration: 2200 })
            }
        })
    }

    // ===== 主图 =====
    const changeMainImage = () => {
        uni.chooseImage({
            count: 1,
            success: (res) => {
                form.value.mainImage = res.tempFilePaths[0]
            }
        })
    }

    // ===== 相册拖拽排序 =====
    const handleDragStart = (index) => {
        dragIndex.value = index
    }
    const handleDragOver = (e) => {
        e.preventDefault()
    }
    const handleDrop = (targetIndex) => {
        if (dragIndex.value === null || dragIndex.value === targetIndex) return
        const list = [...form.value.album]
        const [movedItem] = list.splice(dragIndex.value, 1)
        list.splice(targetIndex, 0, movedItem)
        form.value.album = list
        dragIndex.value = null
    }
    const addAlbumImg = () => {
        const remain = 9 - form.value.album.length
        uni.chooseImage({
            count: remain,
            success: (res) => {
                form.value.album.push(...res.tempFilePaths)
            }
        })
    }
    const deleteAlbumImg = (idx) => {
        uni.showModal({
            title: '提示',
            content: '确认删除这张照片吗？',
            success: (res) => {
                if (res.confirm) {
                    form.value.album.splice(idx, 1)
                }
            }
        })
    }
    const previewAlbum = (idx) => {
        uni.previewImage({
            urls: form.value.album,
            current: idx
        })
    }

    // ===== 基础资料选择器 =====
    const selectGender = () => {
        uni.showActionSheet({
            itemList: ['男', '女'],
            success: (res) => {
                form.value.gender = res.tapIndex === 0 ? 'male' : 'female'
            }
        })
    }
    const onBirthdayChange = (e) => {
        form.value.birthday = e.detail.value
    }
    const selectEducation = () => {
        const options = ['高中及以下', '大专', '本科', '研究生', '博士及以上']
        uni.showActionSheet({
            itemList: options,
            success: (res) => {
                form.value.education = options[res.tapIndex]
            }
        })
    }
    // 所在城市（手动选择）
    const selectCity = () => {
        const cities = ['北京', '上海', '深圳', '广州', '杭州', '成都', '武汉', '南京', '西安', '重庆', '长沙', '郑州', '东莞', '青岛', '沈阳', '其他']
        uni.showActionSheet({
            itemList: cities,
            success: (res) => {
                form.value.city = cities[res.tapIndex]
                // 手动选择后更新定位状态
                locationStatusClass.value = 'location--success'
                locationStatusIcon.value = 'icon-check-circle'
                locationStatusText.value = '已定位'
            }
        })
    }
    const selectHometown = () => {
        uni.showToast({ title: '调起籍贯选择器', icon: 'none' })
    }
    const selectMarital = () => {
        const options = ['未婚', '离异', '离异未育', '离异带儿子', '离异带女儿', '离异多孩', '丧偶']
        uni.showActionSheet({
            itemList: options,
            success: (res) => {
                form.value.maritalStatus = options[res.tapIndex]
            }
        })
    }
    const selectIncome = () => {
        const options = ['5W以下', '5-10W', '10-20W', '20-30W', '30-50W', '50W以上']
        uni.showActionSheet({
            itemList: options,
            success: (res) => {
                form.value.income = options[res.tapIndex]
            }
        })
    }
    const selectHouse = () => {
        const options = ['无房', '有房（本地）', '有房（外地）', '多套房']
        uni.showActionSheet({
            itemList: options,
            success: (res) => {
                form.value.house = options[res.tapIndex]
            }
        })
    }
    const selectHouseLoan = () => {
        const options = ['无贷款', '有贷款', '已还清']
        uni.showActionSheet({
            itemList: options,
            success: (res) => {
                form.value.houseLoan = options[res.tapIndex]
            }
        })
    }
    const selectCar = () => {
        const options = ['无车', '有车（经济型）', '有车（中档）', '有车（豪华）']
        uni.showActionSheet({
            itemList: options,
            success: (res) => {
                form.value.car = options[res.tapIndex]
            }
        })
    }
    const selectCarLoan = () => {
        const options = ['无贷款', '有贷款', '已还清']
        uni.showActionSheet({
            itemList: options,
            success: (res) => {
                form.value.carLoan = options[res.tapIndex]
            }
        })
    }

    // ===== 标签切换 =====
    const toggleHobbyTag = (tag) => {
        const idx = form.value.hobbyTags.indexOf(tag)
        idx > -1 ? form.value.hobbyTags.splice(idx, 1) : form.value.hobbyTags.push(tag)
    }
    const togglePersonalityTag = (tag) => {
        const idx = form.value.personalityTags.indexOf(tag)
        idx > -1 ? form.value.personalityTags.splice(idx, 1) : form.value.personalityTags.push(tag)
    }
    const toggleWeekendTag = (tag) => {
        const idx = form.value.weekendTags.indexOf(tag)
        idx > -1 ? form.value.weekendTags.splice(idx, 1) : form.value.weekendTags.push(tag)
    }

    // ===== 人生剧本 =====
    const handleScriptAction = () => {
        uni.navigateTo({
            url: '/pages/test/script?from=edit'
        })
    }

    // ===== 三观态度 =====
    const handleValuesAction = () => {
        uni.navigateTo({
            url: '/pages/test/values?from=edit'
        })
    }

    // ===== 期待的另一半 =====
    const selectExpectEducation = () => {
        const options = ['不限', '大专', '本科', '研究生', '博士及以上']
        uni.showActionSheet({
            itemList: options,
            success: (res) => {
                form.value.expect.education = options[res.tapIndex]
            }
        })
    }
    const selectExpectCity = () => {
        const options = ['都可以', '同城优先', '仅限同城']
        uni.showActionSheet({
            itemList: options,
            success: (res) => {
                form.value.expect.city = options[res.tapIndex]
            }
        })
    }
    const selectExpectHometown = () => {
        const options = ['都可以', '同乡优先', '仅限同乡']
        uni.showActionSheet({
            itemList: options,
            success: (res) => {
                form.value.expect.hometown = options[res.tapIndex]
            }
        })
    }
    const toggleExpectMarital = (item) => {
        const idx = form.value.expect.marital.indexOf(item)
        idx > -1 ? form.value.expect.marital.splice(idx, 1) : form.value.expect.marital.push(item)
    }
    const removeExpectMarital = (item) => {
        const idx = form.value.expect.marital.indexOf(item)
        if (idx > -1) form.value.expect.marital.splice(idx, 1)
    }
    const selectExpectIncome = () => {
        const options = ['不限', '10W以上', '20W以上', '30W以上', '50W以上']
        uni.showActionSheet({
            itemList: options,
            success: (res) => {
                form.value.expect.income = options[res.tapIndex]
            }
        })
    }
    const selectExpectHouse = () => {
        const options = ['不限', '有房优先', '必须有房', '无房也可']
        uni.showActionSheet({
            itemList: options,
            success: (res) => {
                form.value.expect.house = options[res.tapIndex]
            }
        })
    }
    const selectExpectSmoke = () => {
        const options = ['不限', '不吸烟', '偶尔可接受', '介意但可商量']
        uni.showActionSheet({
            itemList: options,
            success: (res) => {
                form.value.expect.smoke = options[res.tapIndex]
            }
        })
    }
    const selectExpectDrink = () => {
        const options = ['不限', '不喝酒', '偶尔可接受', '介意但可商量']
        uni.showActionSheet({
            itemList: options,
            success: (res) => {
                form.value.expect.drink = options[res.tapIndex]
            }
        })
    }
    const toggleExpectFamily = (item) => {
        const idx = form.value.expect.family.indexOf(item)
        idx > -1 ? form.value.expect.family.splice(idx, 1) : form.value.expect.family.push(item)
    }
    const removeExpectFamily = (item) => {
        const idx = form.value.expect.family.indexOf(item)
        if (idx > -1) form.value.expect.family.splice(idx, 1)
    }

    // ===== 保存 =====
    const handleSave = () => {
        // 第 6 章闭环：常住城市手动修改后 24 小时生效（生效前仍按旧城市推荐）
        const targetCity = form.value.city
        let cityResult = null
        if (targetCity) {
            cityResult = userStore.changeCity(targetCity)
        }
        const cityChanged = cityResult && cityResult.changed
        uni.showLoading({ title: '保存中...' })
        setTimeout(() => {
            uni.hideLoading()
            if (cityChanged) {
                uni.showToast({
                    title: `已保存，城市改为 ${cityResult.to}，24 小时后生效`,
                    icon: 'none',
                    duration: 2200
                })
            } else {
                uni.showToast({ title: '保存成功', icon: 'success' })
            }
            setTimeout(() => {
                uni.navigateBack()
            }, cityChanged ? 1800 : 800)
        }, 800)
    }

    onMounted(() => {
        // 城市字段与账号生效城市对齐（改城市 24h 生效）
        const effective = userStore.matchCity
        if (effective) form.value.city = effective
    })
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';
    @import '@/styles/mixins.scss';

    .edit-page {
        min-height: 100vh;
        background-color: $bg-page;
    }

    // ----- 顶部导航栏：玻璃态效果，与匹配页统一 -----
    .edit-navbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px $page-padding-x;
        background-color: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-bottom: 1px solid rgba($border-light, 0.5);
        position: sticky;
        top: 0;
        z-index: 100;
    }

    .edit-navbar__back {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        color: $text-primary;
        cursor: pointer;

        &:active {
            opacity: 0.7;
        }
    }

    .edit-navbar__title {
        font-size: 17px;
        font-weight: $font-weight-medium;
        color: $text-primary;
        letter-spacing: 0.5px;
    }

    .edit-navbar__save {
        font-size: 15px;
        color: $primary-color;
        font-weight: $font-weight-medium;
        cursor: pointer;

        &:active {
            opacity: 0.7;
        }
    }

    // ----- 头像区域：增加阴影提升质感 -----
    .avatar-section {
        background-color: $bg-card;
        padding: $spacing-xl 0 $spacing-xl;
        margin-bottom: 12px;
        display: flex;
        justify-content: center;
    }

    .avatar-section__wrap {
        position: relative;
        width: 96px;
        height: 96px;
        cursor: pointer;
        border-radius: 50%;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
        transition: transform 0.2s ease;

        &:active {
            transform: scale(0.96);
        }
    }

    .avatar-section__img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: $bg-page;
        display: block;
    }

    .avatar-section__mask {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 32px;
        border-bottom-left-radius: 50%;
        border-bottom-right-radius: 50%;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1px;
        font-size: 10px;
        color: #FFFFFF;

        .icon {
            font-size: 13px;
        }
    }

    // ----- 通用卡片：柔和阴影 + 大圆角 -----
    .edit-card {
        background-color: $bg-card;
        margin: 0 $page-padding-x 12px;
        border-radius: 16px;
        padding: $spacing-md $spacing-md;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
        transition: box-shadow 0.2s ease;
    }

    .edit-card__title {
        font-size: $font-size-md;
        font-weight: $font-weight-medium;
        color: $text-primary;
        margin-bottom: $spacing-sm;
        display: flex;
        align-items: center;
        justify-content: space-between;
        letter-spacing: 0.3px;
    }

    .edit-card__tip {
        font-size: 11px;
        color: $text-helper;
        font-weight: normal;
        letter-spacing: 0;
    }

    // ----- 主图区域：16:9比例 + 编辑浮层引导 -----
    .main-image-wrap {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 9;
        border-radius: 12px;
        overflow: hidden;
        background-color: $bg-page;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        transition: transform 0.2s ease;

        &:active {
            transform: scale(0.98);
        }
    }

    .main-image__img {
        width: 100%;
        height: 100%;
        display: block;
    }
    // 已有图片时的编辑浮层
    .main-image__edit-mask {
        position: absolute;
        right: 10px;
        bottom: 10px;
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 5px 12px;
        background-color: rgba(0, 0, 0, 0.6);
        color: #FFFFFF;
        font-size: 11px;
        border-radius: 16px;
        backdrop-filter: blur(4px);

        .icon {
            font-size: 12px;
        }
    }

    .main-image__placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: linear-gradient(135deg, #f8f9fa 0%, #eef1f5 100%);

        .icon {
            font-size: 36px;
            color: $text-helper;
            opacity: 0.7;
        }

        &-title {
            font-size: 14px;
            color: $text-secondary;
            font-weight: $font-weight-medium;
        }

        &-desc {
            font-size: 11px;
            color: $text-helper;
        }
    }

    // ----- 表单提示 -----
    .form-tip {
        display: block;
        font-size: 11px;
        color: $text-helper;
        margin-top: 10px;
        line-height: 1.5;

        &--warn {
            color: #F56C6C;
            background-color: rgba(245, 108, 108, 0.06);
            padding: 8px 10px;
            border-radius: 8px;
            margin-top: 10px;
        }
    }

    // ----- 相册网格：宽松间距 + 精致阴影 -----
    .album-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
    }

    .album-grid__item {
        position: relative;
        aspect-ratio: 1;
        border-radius: 8px;
        overflow: hidden;
        background-color: $bg-page;
        transition: all 0.2s ease;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);

        &.is-dragging {
            opacity: 0.5;
            transform: scale(1.05);
        }

        &:active {
            transform: scale(0.96);
        }
    }

    .album-grid__img {
        width: 100%;
        height: 100%;
        display: block;
        cursor: grab;

        &:active {
            cursor: grabbing;
        }
    }

    .album-grid__del {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.6);
        color: #FFFFFF;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        backdrop-filter: blur(4px);
        transition: background-color 0.2s;

        &:active {
            background-color: rgba(0, 0, 0, 0.8);
        }
    }

    .album-grid__add {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        border: 1px dashed $border-light;
        color: $text-helper;
        font-size: 11px;
        cursor: pointer;
        background-color: $bg-page;

        .icon {
            font-size: 24px;
        }

        &:active {
            background-color: $border-light;
        }
    }

    // ----- 表单项：宽松间距 + 细分割线 -----
    .form-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 0;
        border-bottom: 1px solid rgba($border-light, 0.6);

        &--last {
            border-bottom: none;
            padding-bottom: 0;
        }

        &--column {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
        }

        &--city {
            padding: 12px 0;
        }
    }

    .form-item__label {
        font-size: $font-size-sm;
        color: $text-primary;
        flex-shrink: 0;
        width: 80px;
        font-weight: 400;
    }

    .form-item__input {
        flex: 1;
        text-align: right;
        font-size: $font-size-sm;
        color: $text-primary;
        background: transparent;

        &--right {
            padding-right: 0;
        }

        &--full {
            text-align: left;
            width: 100%;
            padding: 12px 14px;
            background-color: $bg-page;
            border-radius: 10px;
            box-sizing: border-box;
        }
    }

    .form-item__input-wrap {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .form-item__unit {
        font-size: $font-size-sm;
        color: $text-helper;
        flex-shrink: 0;
    }

    .form-item__value {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 4px;
        font-size: $font-size-sm;
        color: $text-secondary;

        &--multi {
            flex: 1;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    .form-item__arrow {
        font-size: 12px;
        color: $text-helper;
        flex-shrink: 0;
    }

    // ----- 所在城市定位组件 -----
    .form-item__city-wrap {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 10px;
    }

    .form-item__city-status {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        padding: 4px 12px;
        border-radius: 14px;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
        flex-shrink: 0;
        font-weight: $font-weight-medium;

        .icon {
            font-size: 13px;
        }

        &:active {
            transform: scale(0.95);
        }

        &.location--idle {
            color: $primary-color;
            background: $primary-light-bg;

            .icon {
                color: $primary-color;
            }
        }

        &.location--loading {
            color: #FFB74D;
            background: rgba(255, 183, 77, 0.12);
            animation: pulse 1.2s ease-in-out infinite;

            .icon {
                color: #FFB74D;
            }
        }

        &.location--success {
            color: #2ED573;
            background: rgba(46, 213, 115, 0.1);

            .icon {
                color: #2ED573;
            }
        }
    }

    .form-item__city-value {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: $font-size-sm;
        color: $text-primary;
        cursor: pointer;
        padding: 4px 0;

        &:active {
            opacity: 0.6;
        }

        .icon {
            font-size: 12px;
            color: $text-helper;
        }
    }

    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }

        50% {
            opacity: 0.5;
        }
    }

    .form-placeholder {
        color: $text-helper;
    }

    // ----- 个人简介 -----
    .bio-textarea {
        width: 100%;
        min-height: 80px;
        font-size: $font-size-sm;
        color: $text-primary;
        line-height: 1.6;
        background-color: $bg-page;
        border-radius: 10px;
        padding: 12px;
        box-sizing: border-box;
        border: none;
        resize: none;
    }

    .bio-count {
        text-align: right;
        font-size: 11px;
        color: $text-helper;
        margin-top: 8px;
    }

    // ----- 标签组：圆润胶囊样式 -----
    .tag-group {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }

    .edit-tag {
        padding: 7px 16px;
        font-size: 12px;
        color: $text-secondary;
        background-color: $bg-page;
        border: 1px solid transparent;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.2s ease;

        &:active {
            transform: scale(0.96);
        }

        &--active {
            color: $primary-color;
            background-color: $primary-light-bg;
            border-color: $primary-color;
            font-weight: $font-weight-medium;
        }
    }

    // ----- 测试卡片：渐变背景 + 精致边框，与匹配页风格统一 -----
    .test-card {
        cursor: pointer;
        transition: all 0.2s ease;
        border: 1px solid rgba($primary-color, 0.1);

        &:active {
            transform: scale(0.99);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        &__header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
        }

        &__title-wrap {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        &__title {
            font-size: $font-size-md;
            font-weight: $font-weight-medium;
            color: $text-primary;
        }

        &__link {
            display: flex;
            align-items: center;
            gap: 2px;
            font-size: 13px;
            color: $primary-color;
            font-weight: $font-weight-medium;

            .icon {
                font-size: 13px;
            }
        }
        // 未测试状态
        &__empty {
            padding: 8px 0 4px;

            &-title {
                font-size: $font-size-sm;
                font-weight: $font-weight-medium;
                color: $text-primary;
                margin-bottom: 4px;
            }

            &-desc {
                display: block;
                font-size: 12px;
                color: $text-helper;
                text-align: right;
            }
        }
        // 已测试状态
        &__result {
            padding: 6px 0 4px;

            &-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 5px 16px 5px 14px;
                border-radius: 20px;
                font-size: 13px;
                font-weight: $font-weight-medium;
                margin-bottom: 8px;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);

                .icon {
                    font-size: 14px;
                }

                &.badge--career {
                    color: #1976D2;
                    background: rgba(25, 118, 210, 0.1);
                }

                &.badge--stable {
                    color: #2E7D32;
                    background: rgba(46, 125, 50, 0.1);
                }

                &.badge--romantic {
                    color: #C62828;
                    background: rgba(198, 40, 40, 0.08);
                }

                &.badge--free {
                    color: #6A1B9A;
                    background: rgba(106, 27, 154, 0.08);
                }
            }

            &-desc {
                font-size: 13px;
                color: $text-secondary;
                line-height: 1.6;
                display: block;
                margin-bottom: 10px;
            }

            &-items {
                display: flex;
                flex-direction: column;
                gap: 6px;
                margin-bottom: 10px;
                padding: 12px 14px;
                background: rgba(255, 255, 255, 0.7);
                border-radius: 10px;
            }
        }

        &__cooldown {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: $text-helper;
            padding-top: 10px;
            border-top: 1px solid rgba($border-light, 0.5);

            .icon {
                font-size: 13px;
            }

            &--ready {
                color: #2ED573;

                .icon {
                    color: #2ED573;
                }
            }
        }
    }

    .result-item {
        display: flex;
        gap: 12px;
        font-size: 13px;

        &:not(:last-child) {
            padding-bottom: 6px;
            border-bottom: 1px solid rgba($border-light, 0.5);
        }

        &__label {
            width: 48px;
            flex-shrink: 0;
            color: $text-helper;
        }

        &__value {
            flex: 1;
            color: $text-secondary;
        }
    }

    // ----- 期待的另一半 -----
    .expect-form {
        display: flex;
        flex-direction: column;

        &__item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 0;
            border-bottom: 1px solid rgba($border-light, 0.6);

            &:last-child {
                border-bottom: none;
                padding-bottom: 0;
            }

            &--multi {
                cursor: pointer;

                &:active {
                    opacity: 0.7;
                }
            }
        }

        &__label {
            font-size: $font-size-sm;
            color: $text-primary;
            width: 80px;
            flex-shrink: 0;
        }

        &__range {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        &__input {
            width: 52px;
            text-align: center;
            font-size: $font-size-sm;
            color: $text-primary;
            background-color: $bg-page;
            border-radius: 8px;
            border: none;
        }

        &__line {
            color: $text-helper;
            font-size: 12px;
        }

        &__unit {
            font-size: 12px;
            color: $text-helper;
            margin-left: 2px;
        }

        &__tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            padding: 8px 0 4px 80px;
        }
    }

    .expect-tag {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 5px 12px 5px 14px;
        font-size: 12px;
        color: $text-secondary;
        background-color: $bg-page;
        border: 1px solid transparent;
        border-radius: 16px;
        transition: all 0.2s ease;

        .icon {
            font-size: 10px;
            color: $text-helper;
            cursor: pointer;

            &:active {
                opacity: 0.6;
            }
        }

        &:active {
            transform: scale(0.96);
        }
    }

    // ----- 多选弹窗：毛玻璃背景 + 圆形选择框 -----
    .picker-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.4);
        z-index: $z-index-modal;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        animation: fadeIn $duration-fast ease;
        backdrop-filter: blur(2px);
    }

    .picker-panel {
        background-color: $bg-card;
        border-radius: 20px 20px 0 0;
        width: 100%;
        max-height: 65vh;
        animation: slideUp $duration-base ease;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);

        &__header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: $spacing-md $spacing-lg;
            border-bottom: 1px solid rgba($border-light, 0.5);
        }

        &__title {
            font-size: $font-size-md;
            font-weight: $font-weight-medium;
            color: $text-primary;
        }

        &__confirm {
            font-size: $font-size-sm;
            color: $primary-color;
            font-weight: $font-weight-medium;
            cursor: pointer;

            &:active {
                opacity: 0.6;
            }
        }

        &__body {
            padding: $spacing-sm $spacing-lg;
            max-height: 55vh;
        }
    }

    .picker-option {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 0;
        border-bottom: 1px solid rgba($border-light, 0.5);
        cursor: pointer;
        transition: background-color 0.2s ease;

        &:last-child {
            border-bottom: none;
        }

        &:active {
            background-color: $bg-page;
        }

        &--active {
            .picker-option__check {
                background-color: $primary-color;
                border-color: $primary-color;

                &::after {
                    content: '✓';
                    color: #FFFFFF;
                    font-size: 12px;
                }
            }

            .picker-option__label {
                color: $primary-color;
                font-weight: $font-weight-medium;
            }
        }
    }

    .picker-option__check {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 1.5px solid $border-light;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: all 0.2s ease;
    }

    .picker-option__label {
        font-size: $font-size-sm;
        color: $text-primary;
        flex: 1;
        transition: color 0.2s ease;
    }

    // ----- 动画 -----
    @keyframes fadeIn {
        from {
            opacity: 0;
        }

        to {
            opacity: 1;
        }
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }

        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    // 底部占位
    .edit-bottom-placeholder {
        height: 10px;
    }
</style>