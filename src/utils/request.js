
// ===== 环境配置 =====
const ENV = {
    development: {
        baseURL: '/api'  // 开发环境使用代理，/api 会被代理到后端
    },
    production: {
        baseURL: 'https://your-api-domain.com/api'  // 生产环境直接请求
    }
}

// 获取当前环境
const getEnv = () => {
    // 开发工具中为 development，真机为 production
    if (process.env.NODE_ENV === 'development') {
        return 'development'
    }
    return 'production'
}

// ===== 配置 =====
const CONFIG = {
    baseURL: ENV[getEnv()].baseURL,
    timeout: 30000,
    header: {
        'Content-Type': 'application/json'
    }
}

// ===== 请求拦截器 =====
const requestInterceptor = (config) => {
    // 自动携带 Token
    try {
        const token = uni.getStorageSync('token')
        if (token) {
            config.header = {
                ...config.header,
                'Authorization': `Bearer ${token}`
            }
        }
    } catch (e) {
        console.warn('获取 Token 失败:', e)
    }

    // 添加时间戳防止缓存（GET 请求）
    if (config.method === 'GET' && !config.noCache) {
        const timestamp = Date.now()
        config.url += (config.url.includes('?') ? '&' : '?') + `_t=${timestamp}`
    }

    return config
}

// ===== 响应拦截器 =====
const responseInterceptor = (response) => {
    const { statusCode, data } = response

    // HTTP 状态码检查
    if (statusCode !== 200) {
        return Promise.reject({
            code: statusCode,
            msg: `网络请求异常 (${statusCode})`
        })
    }

    // 业务状态码检查（后端返回格式为 { code: 0, data: ..., msg: ... }）
    if (data.code !== undefined && data.code !== 0) {
        // Token 过期处理
        if (data.code === 401 || data.code === 10001) {
            // 清除登录信息并跳转到登录页
            try {
                uni.removeStorageSync('token')
                uni.removeStorageSync('userInfo')
                uni.removeStorageSync('equity')
            } catch (e) {
                console.warn('清除存储失败:', e)
            }

            // 跳转到登录页（如果当前不在登录页）
            const pages = getCurrentPages()
            const currentPage = pages[pages.length - 1]
            if (currentPage && !currentPage.route.includes('auth/login')) {
                uni.showToast({
                    title: '登录已过期，请重新登录',
                    icon: 'none',
                    duration: 2000
                })
                setTimeout(() => {
                    uni.navigateTo({
                        url: '/pages/auth/login'
                    })
                }, 1500)
            }

            return Promise.reject({
                code: data.code,
                msg: data.msg || '登录已过期'
            })
        }

        // 其他业务错误
        return Promise.reject({
            code: data.code,
            msg: data.msg || '请求失败'
        })
    }

    // 成功返回 data
    return data.data !== undefined ? data.data : data
}

// ===== 全局错误处理 =====
const handleError = (error) => {
    console.error('请求错误:', error)

    // 网络错误
    if (!error.msg) {
        return {
            code: -1,
            msg: '网络连接失败，请检查网络后重试'
        }
    }

    return error
}

// ===== 核心请求方法 =====
const request = (options) => {
    return new Promise((resolve, reject) => {
        // 拼接完整 URL
        let url = options.url
        // 如果 url 不是以 http 开头，则拼接 baseURL
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            // 确保 URL 以 / 开头
            url = CONFIG.baseURL + (url.startsWith('/') ? url : '/' + url)
        }

        // 合并配置
        const config = {
            url: url,
            method: options.method || 'GET',
            timeout: options.timeout || CONFIG.timeout,
            header: {
                ...CONFIG.header,
                ...options.header
            },
            data: options.data || {}
        }

        // 请求拦截
        const interceptedConfig = requestInterceptor(config)

        // 显示加载提示
        if (options.showLoading) {
            uni.showLoading({
                title: options.loadingText || '加载中...',
                mask: true
            })
        }

        // 发起请求
        uni.request({
            ...interceptedConfig,
            success: (res) => {
                // 隐藏加载
                if (options.showLoading) {
                    uni.hideLoading()
                }

                // 响应拦截
                responseInterceptor(res)
                    .then((data) => {
                        resolve(data)
                    })
                    .catch((err) => {
                        const error = handleError(err)
                        reject(error)
                    })
            },
            fail: (err) => {
                // 隐藏加载
                if (options.showLoading) {
                    uni.hideLoading()
                }

                const error = handleError({
                    msg: '网络连接失败，请检查网络后重试'
                })
                reject(error)
            }
        })
    })
}

// ===== 便捷方法 =====
export const http = {
    /**
     * GET 请求
     */
    get(url, params = {}, options = {}) {
        let fullUrl = url
        if (params && Object.keys(params).length > 0) {
            const query = Object.keys(params)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
                .join('&')
            fullUrl += (url.includes('?') ? '&' : '?') + query
        }
        return request({
            ...options,
            url: fullUrl,
            method: 'GET'
        })
    },

    /**
     * POST 请求
     */
    post(url, data = {}, options = {}) {
        return request({
            ...options,
            url,
            method: 'POST',
            data
        })
    },

    /**
     * PUT 请求
     */
    put(url, data = {}, options = {}) {
        return request({
            ...options,
            url,
            method: 'PUT',
            data
        })
    },

    /**
     * DELETE 请求
     */
    delete(url, params = {}, options = {}) {
        let fullUrl = url
        if (params && Object.keys(params).length > 0) {
            const query = Object.keys(params)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
                .join('&')
            fullUrl += (url.includes('?') ? '&' : '?') + query
        }
        return request({
            ...options,
            url: fullUrl,
            method: 'DELETE'
        })
    },

    /**
     * 文件上传
     */
    upload(url, filePath, name = 'file', formData = {}) {
        return new Promise((resolve, reject) => {
            const token = uni.getStorageSync('token') || ''

            // 拼接完整 URL
            let fullUrl = url
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                fullUrl = CONFIG.baseURL + (url.startsWith('/') ? url : '/' + url)
            }

            uni.uploadFile({
                url: fullUrl,
                filePath,
                name,
                formData,
                header: {
                    'Authorization': `Bearer ${token}`
                },
                success: (res) => {
                    try {
                        const data = JSON.parse(res.data)
                        if (data.code === 0) {
                            resolve(data.data || data)
                        } else {
                            reject({
                                code: data.code,
                                msg: data.msg || '上传失败'
                            })
                        }
                    } catch (e) {
                        resolve(res.data)
                    }
                },
                fail: (err) => {
                    reject({
                        code: -1,
                        msg: '上传失败，请检查网络'
                    })
                }
            })
        })
    }
}

// ===== 导出默认 =====
export default http