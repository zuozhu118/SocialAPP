/**
 * 权限门禁组合式函数
 * 统一处理"游客 / 注册未实名 / 已实名"三级权限下的功能拦截，
 * 页面只需要判断返回值，不需要各自写 if 逻辑。
 */

import { computed } from 'vue'
import { useUserStore } from '@/store/index'
import { businessCopy } from '@/mock/copy'

/**
 * 功能-权限要求矩阵
 *   guest      需要注册
 *   registered 需要实名
 *   certified  放行
 */
export const ACTION_RULES = {
    // 浏览动态（第 6 条及以后）
    browseDynamic: { guest: 'register' },
    // 点赞动态：游客不可，未实名可
    likeDynamic: { guest: 'register' },
    // 评论动态：未实名不可
    commentDynamic: { guest: 'register', registered: 'realname' },
    // 发布动态：仅实名
    publishDynamic: { guest: 'register', registered: 'realname' },
    // 心动（喜欢）：未实名只能收藏
    likeUser: { guest: 'register', registered: 'realname' },
    // 申请交换微信：仅实名且双向心动
    applyWechat: { guest: 'register', registered: 'realname' },
    // 收藏心动：登录即可
    favoriteUser: { guest: 'register' },
    // 查看他人主页完整资料
    viewProfile: { guest: 'register' }
}

export function usePermission() {
    const userStore = useUserStore()

    const level = computed(() => userStore.level)
    const isGuest = computed(() => level.value === 'guest')
    const isRegistered = computed(() => level.value === 'registered')
    const isCertified = computed(() => level.value === 'certified')

    /**
     * 判断某个操作当前是否放行
     * @returns {{ allowed: boolean, need: 'register'|'realname'|null }}
     */
    const check = (action) => {
        const rule = ACTION_RULES[action] || {}
        const need = rule[level.value] || null
        return { allowed: !need, need }
    }

    /**
     * 校验并返回拦截弹窗需要的信息，页面直接拿去驱动 PermissionModal
     * @returns {{ allowed: boolean, modal: null | { mode: string, title: string, content: string, confirmText: string } }}
     */
    const guard = (action) => {
        const { allowed, need } = check(action)
        if (allowed) return { allowed: true, modal: null }

        if (need === 'register') {
            return {
                allowed: false,
                modal: {
                    mode: 'register',
                    title: '注册后即可解锁',
                    content: businessCopy.registerGuide,
                    confirmText: '一键授权手机号注册'
                }
            }
        }

        return {
            allowed: false,
            modal: {
                mode: 'realname',
                title: '完成实名认证',
                content: businessCopy.realNameGuide,
                confirmText: '去实名认证'
            }
        }
    }

    return {
        userStore,
        level,
        isGuest,
        isRegistered,
        isCertified,
        check,
        guard
    }
}

export default usePermission
