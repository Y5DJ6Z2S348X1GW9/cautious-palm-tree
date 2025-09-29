/**
 * Outlook邮箱注册助手 - 核心注册功能模块
 * 负责Outlook邮箱注册的主要逻辑和API交互
 */

const OutlookRegistration = {
    
    // 注册配置
    config: {
        baseUrl: 'https://signup.live.com',
        apiEndpoints: {
            checkAvailability: '/API/CheckAvailableSigninNames',
            createAccount: '/API/CreateAccount',
            verify: '/API/VerifyIdentity'
        },
        userAgents: [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ],
        maxRetries: 5,
        retryDelay: 2000,
        timeout: 30000
    },

    // 状态管理
    state: {
        currentSession: null,
        registrationInProgress: false,
        lastAttempt: null,
        failureCount: 0,
        successCount: 0
    },

    // 代理设置
    proxyConfig: {
        enabled: false,
        servers: [],
        currentProxy: null,
        rotation: true
    },

    /**
     * 初始化注册模块
     */
    init() {
        this.loadConfiguration();
        this.setupProxySupport();
        this.initializeSession();
        console.log('Outlook注册模块已初始化');
    },

    /**
     * 加载配置
     */
    loadConfiguration() {
        const savedConfig = Utils.getStorage('outlookConfig', {});
        this.config = { ...this.config, ...savedConfig };
    },

    /**
     * 保存配置
     */
    saveConfiguration() {
        Utils.setStorage('outlookConfig', this.config);
    },

    /**
     * 设置代理支持
     */
    setupProxySupport() {
        // 检测是否需要使用代理
        this.detectProxyNeed();
    },

    /**
     * 检测代理需求
     */
    async detectProxyNeed() {
        try {
            // 测试直接连接
            const response = await this.testConnection();
            if (!response.success) {
                this.logRegistration('direct_connection_failed', '直接连接失败，建议使用代理');
                this.proxyConfig.enabled = true;
            }
        } catch (error) {
            console.warn('代理检测失败:', error);
        }
    },

    /**
     * 测试连接
     * @returns {Promise<object>} 测试结果
     */
    async testConnection() {
        return new Promise((resolve) => {
            // 模拟连接测试
            setTimeout(() => {
                const success = Math.random() > 0.2; // 80%成功率
                resolve({ success, latency: Math.random() * 1000 + 100 });
            }, 1000);
        });
    },

    /**
     * 初始化会话
     */
    initializeSession() {
        this.state.currentSession = {
            id: Utils.generateUUID(),
            startTime: Date.now(),
            userAgent: this.getRandomUserAgent(),
            fingerprint: this.generateFingerprint()
        };
    },

    /**
     * 获取随机User-Agent
     * @returns {string} User-Agent字符串
     */
    getRandomUserAgent() {
        return this.config.userAgents[Math.floor(Math.random() * this.config.userAgents.length)];
    },

    /**
     * 生成浏览器指纹
     * @returns {object} 指纹对象
     */
    generateFingerprint() {
        return {
            screen: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack,
            hardwareConcurrency: navigator.hardwareConcurrency || 4,
            deviceMemory: navigator.deviceMemory || 4,
            webgl: this.getWebGLInfo()
        };
    },

    /**
     * 获取WebGL信息
     * @returns {string} WebGL信息
     */
    getWebGLInfo() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown';
            }
            return 'Not supported';
        } catch (error) {
            return 'Error';
        }
    },

    /**
     * 主要注册方法
     * @param {object} formData - 表单数据
     * @returns {Promise<object>} 注册结果
     */
    async register(formData) {
        if (this.state.registrationInProgress) {
            throw new Error('注册正在进行中，请勿重复提交');
        }

        this.state.registrationInProgress = true;
        this.state.lastAttempt = Date.now();

        try {
            this.logRegistration('start', '开始注册流程');

            // 获取注册策略
            const strategy = this.getRegistrationStrategy(formData);
            this.logRegistration('strategy', `使用策略: ${strategy}`);

            // 执行注册
            const result = await this.executeRegistration(formData, strategy);

            // 记录成功
            this.state.successCount++;
            this.logRegistration('success', '注册成功完成');

            return result;

        } catch (error) {
            // 记录失败
            this.state.failureCount++;
            this.logRegistration('error', `注册失败: ${error.message}`);
            throw error;

        } finally {
            this.state.registrationInProgress = false;
        }
    },

    /**
     * 获取注册策略
     * @param {object} formData - 表单数据
     * @returns {string} 策略名称
     */
    getRegistrationStrategy(formData) {
        // 从表单数据中获取策略，或使用智能推荐
        if (formData.strategy) {
            return formData.strategy;
        }

        // 使用策略模块的智能推荐
        if (window.RegistrationStrategies) {
            const context = {
                previousFailures: this.state.failureCount,
                timeOfDay: new Date().getHours(),
                isVpnDetected: this.proxyConfig.enabled
            };
            return window.RegistrationStrategies.recommendStrategy(context);
        }

        return 'standard';
    },

    /**
     * 执行注册流程
     * @param {object} formData - 表单数据
     * @param {string} strategy - 策略名称
     * @returns {Promise<object>} 注册结果
     */
    async executeRegistration(formData, strategy) {
        // 使用策略模块执行注册
        if (window.RegistrationStrategies) {
            // 设置当前表单数据供策略模块使用
            window.RegistrationStrategies.currentFormData = formData;
            return await window.RegistrationStrategies.executeStrategy(formData, strategy);
        }

        // 如果策略模块不可用，使用内置的简单注册流程
        return await this.executeSimpleRegistration(formData);
    },

    /**
     * 执行简单注册流程
     * @param {object} formData - 表单数据
     * @returns {Promise<object>} 注册结果
     */
    async executeSimpleRegistration(formData) {
        // 步骤1: 检查邮箱可用性
        this.updateProgress(1, '检查邮箱可用性...');
        const emailCheck = await this.checkEmailAvailability(formData['desired-email']);
        
        if (!emailCheck.available) {
            throw new Error('邮箱名已被占用');
        }

        // 步骤2: 准备注册数据
        this.updateProgress(2, '准备注册数据...');
        const registrationData = await this.prepareRegistrationData(formData);

        // 步骤3: 提交注册请求
        this.updateProgress(3, '提交注册请求...');
        const registrationResult = await this.submitRegistrationRequest(registrationData);

        // 步骤4: 处理注册响应
        this.updateProgress(4, '处理注册响应...');
        const processedResult = await this.processRegistrationResponse(registrationResult);

        // 步骤5: 完成注册
        this.updateProgress(5, '完成注册...');
        return await this.finalizeRegistration(processedResult, formData);
    },

    /**
     * 检查邮箱可用性
     * @param {string} emailName - 邮箱名
     * @returns {Promise<object>} 检查结果
     */
    async checkEmailAvailability(emailName) {
        this.logRegistration('check_email', `检查邮箱可用性: ${emailName}`);

        try {
            // 模拟API调用
            await Utils.randomDelay(1000, 3000);

            // 模拟检查结果
            const available = Math.random() > 0.3; // 70%可用率
            
            if (available) {
                this.logRegistration('check_email_success', `邮箱可用: ${emailName}@outlook.com`);
            } else {
                this.logRegistration('check_email_fail', `邮箱已被占用: ${emailName}`);
            }

            return {
                available,
                email: `${emailName}@outlook.com`,
                alternatives: available ? [] : this.generateEmailAlternatives(emailName)
            };

        } catch (error) {
            this.logRegistration('check_email_error', `检查邮箱时出错: ${error.message}`);
            throw new Error('无法检查邮箱可用性');
        }
    },

    /**
     * 生成邮箱替代方案
     * @param {string} originalName - 原始邮箱名
     * @returns {Array} 替代方案列表
     */
    generateEmailAlternatives(originalName) {
        const alternatives = [];
        
        // 添加数字后缀
        for (let i = 1; i <= 3; i++) {
            alternatives.push(`${originalName}${Math.floor(Math.random() * 1000)}`);
        }
        
        // 添加年份
        const year = new Date().getFullYear();
        alternatives.push(`${originalName}${year}`);
        
        // 添加常见后缀
        const suffixes = ['new', 'my', '01', '02'];
        suffixes.forEach(suffix => {
            alternatives.push(`${originalName}${suffix}`);
        });

        return alternatives.slice(0, 5);
    },

    /**
     * 准备注册数据
     * @param {object} formData - 表单数据
     * @returns {Promise<object>} 注册数据
     */
    async prepareRegistrationData(formData) {
        this.logRegistration('prepare_data', '准备注册数据');

        const registrationData = {
            // 基本信息
            emailName: formData['desired-email'],
            password: formData.password,
            firstName: formData['first-name'],
            lastName: formData['last-name'],
            
            // 生日信息
            birthDate: {
                year: parseInt(formData['birth-year']),
                month: parseInt(formData['birth-month']),
                day: parseInt(formData['birth-day'])
            },
            
            // 地理信息
            country: formData.country,
            
            // 可选信息
            phoneNumber: formData.phone ? {
                countryCode: formData['phone-country'],
                number: formData.phone
            } : null,
            
            // 技术信息
            userAgent: this.state.currentSession.userAgent,
            fingerprint: this.state.currentSession.fingerprint,
            sessionId: this.state.currentSession.id,
            
            // 时间戳
            timestamp: Date.now(),
            
            // 安全信息
            captchaToken: await this.generateCaptchaToken(),
            flowToken: await this.generateFlowToken()
        };

        // 高级选项处理
        if (formData['randomize-data']) {
            registrationData = this.randomizeRegistrationData(registrationData);
        }

        return registrationData;
    },

    /**
     * 生成验证码令牌
     * @returns {Promise<string>} 验证码令牌
     */
    async generateCaptchaToken() {
        // 模拟验证码生成
        await Utils.delay(500);
        return Utils.generateRandomString(32);
    },

    /**
     * 生成流程令牌
     * @returns {Promise<string>} 流程令牌
     */
    async generateFlowToken() {
        // 模拟流程令牌生成
        await Utils.delay(300);
        return Utils.generateUUID();
    },

    /**
     * 随机化注册数据
     * @param {object} data - 原始数据
     * @returns {object} 随机化后的数据
     */
    randomizeRegistrationData(data) {
        const randomized = { ...data };
        
        // 随机化用户代理
        randomized.userAgent = this.getRandomUserAgent();
        
        // 随机化时间戳（添加随机延迟）
        randomized.timestamp += Math.floor(Math.random() * 10000);
        
        // 随机化指纹信息
        randomized.fingerprint = {
            ...randomized.fingerprint,
            hardwareConcurrency: Math.floor(Math.random() * 8) + 2,
            deviceMemory: [2, 4, 8, 16][Math.floor(Math.random() * 4)]
        };

        return randomized;
    },

    /**
     * 提交注册请求
     * @param {object} registrationData - 注册数据
     * @returns {Promise<object>} 注册响应
     */
    async submitRegistrationRequest(registrationData) {
        this.logRegistration('submit_request', '提交注册请求');

        try {
            // 准备请求参数
            const requestOptions = this.prepareRequestOptions(registrationData);
            
            // 模拟网络延迟
            await Utils.randomDelay(2000, 8000);
            
            // 模拟注册API调用
            const response = await this.simulateRegistrationAPI(registrationData, requestOptions);
            
            this.logRegistration('submit_success', '注册请求提交成功');
            return response;

        } catch (error) {
            this.logRegistration('submit_error', `注册请求失败: ${error.message}`);
            
            // 重试逻辑
            if (this.shouldRetry(error)) {
                this.logRegistration('retry', '准备重试...');
                await Utils.delay(this.config.retryDelay);
                return this.submitRegistrationRequest(registrationData);
            }
            
            throw error;
        }
    },

    /**
     * 准备请求选项
     * @param {object} data - 注册数据
     * @returns {object} 请求选项
     */
    prepareRequestOptions(data) {
        const headers = {
            'User-Agent': data.userAgent,
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Content-Type': 'application/json',
            'Origin': 'https://signup.live.com',
            'Referer': 'https://signup.live.com/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'X-Requested-With': 'XMLHttpRequest',
            'X-Session-Id': data.sessionId,
            'X-Flow-Token': data.flowToken
        };

        return {
            method: 'POST',
            headers,
            body: JSON.stringify(this.formatRequestBody(data)),
            timeout: this.config.timeout,
            credentials: 'include'
        };
    },

    /**
     * 格式化请求体
     * @param {object} data - 注册数据
     * @returns {object} 格式化后的请求体
     */
    formatRequestBody(data) {
        return {
            SignInName: data.emailName,
            Password: data.password,
            FirstName: data.firstName,
            LastName: data.lastName,
            BirthDate: `${data.birthDate.year}-${data.birthDate.month.toString().padStart(2, '0')}-${data.birthDate.day.toString().padStart(2, '0')}`,
            Country: data.country,
            PhoneNumber: data.phoneNumber ? `${data.phoneNumber.countryCode}${data.phoneNumber.number}` : '',
            CaptchaToken: data.captchaToken,
            RequestTimeStamp: data.timestamp,
            FlowToken: data.flowToken,
            Fingerprint: JSON.stringify(data.fingerprint)
        };
    },

    /**
     * 模拟注册API
     * @param {object} data - 注册数据
     * @param {object} options - 请求选项
     * @returns {Promise<object>} API响应
     */
    async simulateRegistrationAPI(data, options) {
        // 模拟不同的响应情况
        const scenarios = [
            { probability: 0.75, type: 'success' },
            { probability: 0.10, type: 'email_taken' },
            { probability: 0.05, type: 'captcha_required' },
            { probability: 0.05, type: 'rate_limit' },
            { probability: 0.03, type: 'server_error' },
            { probability: 0.02, type: 'network_error' }
        ];

        const random = Math.random();
        let cumulative = 0;
        let scenario = scenarios[0];

        for (const s of scenarios) {
            cumulative += s.probability;
            if (random <= cumulative) {
                scenario = s;
                break;
            }
        }

        // 根据场景返回不同响应
        switch (scenario.type) {
            case 'success':
                return {
                    success: true,
                    email: `${data.emailName}@outlook.com`,
                    userId: Utils.generateUUID(),
                    verificationRequired: Math.random() > 0.8,
                    message: 'Account created successfully'
                };

            case 'email_taken':
                throw new Error('邮箱地址已被占用');

            case 'captcha_required':
                throw new Error('需要完成验证码验证');

            case 'rate_limit':
                throw new Error('请求频率过高，请稍后重试');

            case 'server_error':
                throw new Error('服务器暂时不可用');

            case 'network_error':
                throw new Error('网络连接失败');

            default:
                throw new Error('未知错误');
        }
    },

    /**
     * 判断是否应该重试
     * @param {Error} error - 错误对象
     * @returns {boolean} 是否重试
     */
    shouldRetry(error) {
        const retryableErrors = [
            '网络连接失败',
            '服务器暂时不可用',
            '请求超时'
        ];

        return retryableErrors.some(msg => error.message.includes(msg)) && 
               this.state.failureCount < this.config.maxRetries;
    },

    /**
     * 处理注册响应
     * @param {object} response - 注册响应
     * @returns {Promise<object>} 处理后的结果
     */
    async processRegistrationResponse(response) {
        this.logRegistration('process_response', '处理注册响应');

        if (!response.success) {
            throw new Error(response.message || '注册失败');
        }

        const result = {
            success: true,
            email: response.email,
            userId: response.userId,
            verificationRequired: response.verificationRequired,
            createdAt: new Date().toISOString()
        };

        // 如果需要验证
        if (response.verificationRequired) {
            this.logRegistration('verification_required', '需要邮箱验证');
            result.verificationInstructions = '请检查您的邮箱并点击验证链接';
        }

        return result;
    },

    /**
     * 完成注册
     * @param {object} result - 处理后的结果
     * @param {object} originalFormData - 原始表单数据
     * @returns {Promise<object>} 最终结果
     */
    async finalizeRegistration(result, originalFormData) {
        this.logRegistration('finalize', '完成注册流程');

        const finalResult = {
            success: true,
            email: result.email,
            password: originalFormData.password,
            userId: result.userId,
            createdAt: result.createdAt,
            verificationRequired: result.verificationRequired,
            sessionInfo: {
                id: this.state.currentSession.id,
                duration: Date.now() - this.state.currentSession.startTime
            }
        };

        // 保存注册记录
        this.saveRegistrationRecord(finalResult);

        // 清理会话
        this.cleanupSession();

        // 显示结果
        if (window.UIManager) {
            window.UIManager.showRegistrationResult(true, finalResult);
        }

        return finalResult;
    },

    /**
     * 保存注册记录
     * @param {object} result - 注册结果
     */
    saveRegistrationRecord(result) {
        const records = Utils.getStorage('registrationRecords', []);
        
        records.push({
            email: result.email,
            createdAt: result.createdAt,
            userId: result.userId,
            sessionId: result.sessionInfo.id
        });

        // 保留最近50条记录
        if (records.length > 50) {
            records.splice(0, records.length - 50);
        }

        Utils.setStorage('registrationRecords', records);
    },

    /**
     * 清理会话
     */
    cleanupSession() {
        this.state.currentSession = null;
        this.initializeSession();
    },

    /**
     * 更新进度
     * @param {number} step - 当前步骤
     * @param {string} message - 进度消息
     */
    updateProgress(step, message) {
        if (window.UIManager) {
            window.UIManager.updateProgress(step, message);
        }
    },

    /**
     * 记录注册日志
     * @param {string} type - 日志类型
     * @param {string} message - 日志消息
     */
    logRegistration(type, message) {
        const logEntry = {
            type,
            message,
            timestamp: new Date().toISOString(),
            sessionId: this.state.currentSession?.id
        };

        console.log(`[注册] ${message}`);

        // 添加到UI日志
        if (window.UIManager) {
            const logType = type.includes('error') ? 'error' : 
                           type.includes('success') ? 'success' : 'info';
            window.UIManager.addLog(logType, message);
        }

        // 保存到本地日志
        this.saveToLocalLog(logEntry);
    },

    /**
     * 保存到本地日志
     * @param {object} logEntry - 日志条目
     */
    saveToLocalLog(logEntry) {
        const logs = Utils.getStorage('registrationLogs', []);
        logs.push(logEntry);

        // 保留最近200条日志
        if (logs.length > 200) {
            logs.splice(0, logs.length - 200);
        }

        Utils.setStorage('registrationLogs', logs);
    },

    /**
     * 获取注册统计
     * @returns {object} 统计信息
     */
    getRegistrationStats() {
        const records = Utils.getStorage('registrationRecords', []);
        const logs = Utils.getStorage('registrationLogs', []);
        
        return {
            totalRegistrations: records.length,
            successfulRegistrations: this.state.successCount,
            failedAttempts: this.state.failureCount,
            successRate: this.state.successCount + this.state.failureCount > 0 ? 
                (this.state.successCount / (this.state.successCount + this.state.failureCount)) * 100 : 0,
            lastRegistration: records.length > 0 ? records[records.length - 1] : null,
            recentActivity: logs.slice(-10)
        };
    },

    /**
     * 导出注册数据
     * @returns {object} 导出数据
     */
    exportRegistrationData() {
        return {
            records: Utils.getStorage('registrationRecords', []),
            logs: Utils.getStorage('registrationLogs', []),
            stats: this.getRegistrationStats(),
            config: this.config,
            timestamp: new Date().toISOString()
        };
    },

    /**
     * 重置注册数据
     */
    resetRegistrationData() {
        Utils.removeStorage('registrationRecords');
        Utils.removeStorage('registrationLogs');
        this.state.successCount = 0;
        this.state.failureCount = 0;
        console.log('注册数据已重置');
    },

    /**
     * 检查服务状态
     * @returns {Promise<object>} 服务状态
     */
    async checkServiceStatus() {
        try {
            const response = await this.testConnection();
            return {
                available: response.success,
                latency: response.latency,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                available: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    OutlookRegistration.init();
});

// 导出注册模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OutlookRegistration;
} else {
    window.OutlookRegistration = OutlookRegistration;
}
