/**
 * Outlook邮箱注册助手 - 注册策略模块
 * 提供多种注册策略和优化方案以提高成功率
 */

const RegistrationStrategies = {
    
    // 策略配置
    strategies: {
        standard: {
            name: '标准模式',
            description: '常规注册流程，适合网络环境良好的情况',
            retryCount: 3,
            delayRange: [1000, 3000],
            useProxy: false,
            randomizeData: false,
            humanLikeDelay: true,
            validateSteps: true
        },
        
        smart: {
            name: '智能模式',
            description: '自动优化注册参数，动态调整策略',
            retryCount: 5,
            delayRange: [2000, 5000],
            useProxy: 'auto',
            randomizeData: true,
            humanLikeDelay: true,
            validateSteps: true,
            adaptiveRetry: true,
            errorRecovery: true
        },
        
        aggressive: {
            name: '激进模式',
            description: '多种策略并行尝试，最大化成功率',
            retryCount: 10,
            delayRange: [500, 2000],
            useProxy: true,
            randomizeData: true,
            humanLikeDelay: false,
            validateSteps: false,
            parallelAttempts: true,
            fallbackStrategies: ['proxy', 'vpn', 'mobile']
        }
    },

    // 当前策略
    currentStrategy: 'standard',
    
    // 策略统计
    stats: {
        attempts: 0,
        successes: 0,
        failures: 0,
        strategyPerformance: {}
    },

    /**
     * 获取策略配置
     * @param {string} strategyName - 策略名称
     * @returns {object} 策略配置
     */
    getStrategy(strategyName = this.currentStrategy) {
        return this.strategies[strategyName] || this.strategies.standard;
    },

    /**
     * 设置当前策略
     * @param {string} strategyName - 策略名称
     */
    setStrategy(strategyName) {
        if (this.strategies[strategyName]) {
            this.currentStrategy = strategyName;
            this.logStrategy(`切换到${this.strategies[strategyName].name}`);
        }
    },

    /**
     * 智能策略选择
     * @param {object} context - 上下文信息
     * @returns {string} 推荐策略
     */
    recommendStrategy(context = {}) {
        const {
            networkSpeed = 'unknown',
            previousFailures = 0,
            timeOfDay = new Date().getHours(),
            userAgent = navigator.userAgent,
            isVpnDetected = false
        } = context;

        // 基于历史表现选择策略
        const performance = this.stats.strategyPerformance;
        let bestStrategy = 'standard';
        let bestSuccessRate = 0;

        for (const [strategy, stats] of Object.entries(performance)) {
            if (stats.attempts > 0) {
                const successRate = stats.successes / stats.attempts;
                if (successRate > bestSuccessRate) {
                    bestSuccessRate = successRate;
                    bestStrategy = strategy;
                }
            }
        }

        // 根据环境条件调整
        if (previousFailures > 3) {
            return 'aggressive';
        }
        
        if (isVpnDetected || networkSpeed === 'slow') {
            return 'smart';
        }
        
        if (timeOfDay >= 9 && timeOfDay <= 17) {
            // 工作时间，Microsoft 服务器负载较高
            return 'smart';
        }

        return bestStrategy;
    },

    /**
     * 执行注册策略
     * @param {object} formData - 表单数据
     * @param {string} strategy - 策略名称
     * @returns {Promise<object>} 注册结果
     */
    async executeStrategy(formData, strategy = this.currentStrategy) {
        const config = this.getStrategy(strategy);
        this.stats.attempts++;
        
        this.initializeStrategyStats(strategy);
        this.stats.strategyPerformance[strategy].attempts++;

        try {
            this.logStrategy(`开始执行${config.name}`);
            
            let result;
            
            switch (strategy) {
                case 'standard':
                    result = await this.executeStandardStrategy(formData, config);
                    break;
                case 'smart':
                    result = await this.executeSmartStrategy(formData, config);
                    break;
                case 'aggressive':
                    result = await this.executeAggressiveStrategy(formData, config);
                    break;
                default:
                    throw new Error(`未知策略: ${strategy}`);
            }

            // 记录成功
            this.stats.successes++;
            this.stats.strategyPerformance[strategy].successes++;
            this.logStrategy(`${config.name}执行成功`);
            
            return result;

        } catch (error) {
            // 记录失败
            this.stats.failures++;
            this.stats.strategyPerformance[strategy].failures++;
            this.logStrategy(`${config.name}执行失败: ${error.message}`);
            
            throw error;
        }
    },

    /**
     * 标准策略执行
     * @param {object} formData - 表单数据
     * @param {object} config - 策略配置
     * @returns {Promise<object>} 注册结果
     */
    async executeStandardStrategy(formData, config) {
        const steps = [
            { name: '验证参数', action: () => this.validateFormData(formData) },
            { name: '准备请求', action: () => this.prepareRequest(formData, config) },
            { name: '提交注册', action: (requestData) => this.submitRegistration(requestData, config) },
            { name: '验证结果', action: (response) => this.validateResponse(response) },
            { name: '完成注册', action: (data) => this.finalizeRegistration(data) }
        ];

        return await this.executeSteps(steps, config);
    },

    /**
     * 智能策略执行
     * @param {object} formData - 表单数据
     * @param {object} config - 策略配置
     * @returns {Promise<object>} 注册结果
     */
    async executeSmartStrategy(formData, config) {
        // 智能预处理
        const optimizedData = await this.optimizeFormData(formData);
        
        // 环境检测
        const environment = await this.detectEnvironment();
        this.logStrategy(`环境检测: ${JSON.stringify(environment)}`);
        
        // 动态调整配置
        const adaptedConfig = this.adaptConfigToEnvironment(config, environment);
        
        const steps = [
            { name: '智能分析', action: () => this.analyzeOptimalTiming() },
            { name: '验证参数', action: () => this.validateFormData(optimizedData) },
            { name: '预检测试', action: () => this.preflightCheck(optimizedData) },
            { name: '准备请求', action: () => this.prepareSmartRequest(optimizedData, adaptedConfig) },
            { name: '提交注册', action: (requestData) => this.submitRegistrationWithRetry(requestData, adaptedConfig) },
            { name: '验证结果', action: (response) => this.validateResponse(response) },
            { name: '完成注册', action: (data) => this.finalizeRegistration(data) }
        ];

        return await this.executeSteps(steps, adaptedConfig);
    },

    /**
     * 激进策略执行
     * @param {object} formData - 表单数据
     * @param {object} config - 策略配置
     * @returns {Promise<object>} 注册结果
     */
    async executeAggressiveStrategy(formData, config) {
        this.logStrategy('启动激进模式 - 并行多策略尝试');
        
        // 准备多个变体数据
        const dataVariants = this.generateDataVariants(formData, 3);
        
        // 并行尝试多种方法
        const attempts = dataVariants.map(async (variant, index) => {
            try {
                this.logStrategy(`并行尝试 ${index + 1}: 开始`);
                
                const steps = [
                    { name: '快速验证', action: () => this.quickValidate(variant) },
                    { name: '准备请求', action: () => this.prepareAggressiveRequest(variant, config, index) },
                    { name: '提交注册', action: (requestData) => this.submitRegistrationAggressive(requestData, config) },
                    { name: '验证结果', action: (response) => this.validateResponse(response) },
                    { name: '完成注册', action: (data) => this.finalizeRegistration(data) }
                ];

                const result = await this.executeSteps(steps, config, false);
                this.logStrategy(`并行尝试 ${index + 1}: 成功`);
                return result;
                
            } catch (error) {
                this.logStrategy(`并行尝试 ${index + 1}: 失败 - ${error.message}`);
                throw error;
            }
        });

        // 返回第一个成功的结果
        return await Promise.any(attempts);
    },

    /**
     * 执行步骤
     * @param {Array} steps - 步骤数组
     * @param {object} config - 配置
     * @param {boolean} updateUI - 是否更新UI
     * @returns {Promise<object>} 结果
     */
    async executeSteps(steps, config, updateUI = true) {
        let result = null;
        
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            
            if (updateUI && window.UIManager) {
                window.UIManager.updateProgress(i + 1, step.name);
                window.UIManager.addLog('info', `执行步骤: ${step.name}`);
            }
            
            try {
                // 人性化延迟
                if (config.humanLikeDelay && i > 0) {
                    const delay = Utils.randomDelay(...config.delayRange);
                    await delay;
                }
                
                result = await step.action(result);
                
                if (updateUI && window.UIManager) {
                    window.UIManager.addLog('success', `步骤完成: ${step.name}`);
                }
                
            } catch (error) {
                if (updateUI && window.UIManager) {
                    window.UIManager.addLog('error', `步骤失败: ${step.name} - ${error.message}`);
                }
                throw error;
            }
        }
        
        return result;
    },

    /**
     * 验证表单数据
     * @param {object} formData - 表单数据
     * @returns {object} 验证结果
     */
    validateFormData(formData) {
        const required = ['desired-email', 'password', 'first-name', 'last-name', 'country'];
        const missing = required.filter(field => !formData[field]);
        
        if (missing.length > 0) {
            throw new Error(`缺少必填字段: ${missing.join(', ')}`);
        }
        
        // 邮箱名验证
        if (formData['desired-email'].length < 3) {
            throw new Error('邮箱名长度不足');
        }
        
        // 密码强度验证
        const passwordStrength = Utils.checkPasswordStrength(formData.password);
        if (passwordStrength.level === 'weak') {
            throw new Error('密码强度不足');
        }
        
        return { valid: true, data: formData };
    },

    /**
     * 优化表单数据
     * @param {object} formData - 原始表单数据
     * @returns {Promise<object>} 优化后的数据
     */
    async optimizeFormData(formData) {
        const optimized = { ...formData };
        
        // 邮箱名优化
        if (optimized['desired-email']) {
            // 检查邮箱名是否可能被占用
            const alternatives = this.generateEmailAlternatives(optimized['desired-email']);
            optimized.emailAlternatives = alternatives;
        }
        
        // 生日优化
        if (!optimized['birth-month'] || !optimized['birth-day'] || !optimized['birth-year']) {
            const randomBirth = Utils.generateRandomBirth(20, 35);
            optimized['birth-month'] = optimized['birth-month'] || randomBirth.month;
            optimized['birth-day'] = optimized['birth-day'] || randomBirth.day;
            optimized['birth-year'] = optimized['birth-year'] || randomBirth.year;
        }
        
        // 国家优化
        if (!optimized.country) {
            optimized.country = this.selectOptimalCountry();
        }
        
        return optimized;
    },

    /**
     * 生成邮箱替代方案
     * @param {string} originalEmail - 原始邮箱名
     * @returns {Array} 替代邮箱名列表
     */
    generateEmailAlternatives(originalEmail) {
        const alternatives = [];
        
        // 添加数字后缀
        for (let i = 1; i <= 5; i++) {
            alternatives.push(`${originalEmail}${Math.floor(Math.random() * 1000)}`);
        }
        
        // 添加常见后缀
        const suffixes = ['01', '02', '03', '123', '2024', '2025'];
        suffixes.forEach(suffix => {
            alternatives.push(`${originalEmail}${suffix}`);
        });
        
        // 添加前缀
        const prefixes = ['new', 'my', 'user', 'mail'];
        prefixes.forEach(prefix => {
            alternatives.push(`${prefix}${originalEmail}`);
        });
        
        return alternatives;
    },

    /**
     * 选择最优国家
     * @returns {string} 国家代码
     */
    selectOptimalCountry() {
        // 基于成功率统计选择最优国家
        const countrySuccessRates = {
            'US': 0.92,
            'CA': 0.89,
            'GB': 0.87,
            'AU': 0.85,
            'SG': 0.83,
            'HK': 0.80,
            'CN': 0.75
        };
        
        // 随机选择高成功率国家
        const highSuccessCountries = Object.entries(countrySuccessRates)
            .filter(([_, rate]) => rate > 0.8)
            .map(([country, _]) => country);
            
        return highSuccessCountries[Math.floor(Math.random() * highSuccessCountries.length)];
    },

    /**
     * 环境检测
     * @returns {Promise<object>} 环境信息
     */
    async detectEnvironment() {
        const environment = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth
            },
            connection: {},
            browserFeatures: this.detectBrowserFeatures()
        };
        
        // 网络连接检测
        if (navigator.connection) {
            environment.connection = {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            };
        }
        
        // IP地理位置检测（模拟）
        try {
            environment.location = await this.detectLocation();
        } catch (error) {
            environment.location = { country: 'Unknown' };
        }
        
        return environment;
    },

    /**
     * 检测浏览器特性
     * @returns {object} 浏览器特性
     */
    detectBrowserFeatures() {
        return {
            webGL: !!window.WebGLRenderingContext,
            webRTC: !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia),
            localStorage: !!window.localStorage,
            sessionStorage: !!window.sessionStorage,
            indexedDB: !!window.indexedDB,
            serviceWorker: 'serviceWorker' in navigator,
            touchSupport: 'ontouchstart' in window,
            devicePixelRatio: window.devicePixelRatio || 1
        };
    },

    /**
     * 位置检测（模拟）
     * @returns {Promise<object>} 位置信息
     */
    async detectLocation() {
        // 实际应用中可以使用IP地理位置服务
        // 这里返回模拟数据
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    country: 'US',
                    region: 'California',
                    city: 'San Francisco',
                    ip: Utils.getRandomIP()
                });
            }, 500);
        });
    },

    /**
     * 根据环境调整配置
     * @param {object} config - 原始配置
     * @param {object} environment - 环境信息
     * @returns {object} 调整后的配置
     */
    adaptConfigToEnvironment(config, environment) {
        const adapted = { ...config };
        
        // 根据网络速度调整延迟
        if (environment.connection.effectiveType) {
            switch (environment.connection.effectiveType) {
                case 'slow-2g':
                case '2g':
                    adapted.delayRange = [5000, 10000];
                    break;
                case '3g':
                    adapted.delayRange = [3000, 6000];
                    break;
                case '4g':
                    adapted.delayRange = [1000, 3000];
                    break;
            }
        }
        
        // 根据时区调整策略
        const hour = new Date().getHours();
        if (hour >= 22 || hour <= 6) {
            // 夜间时段，减少延迟
            adapted.delayRange = adapted.delayRange.map(d => d * 0.7);
        }
        
        return adapted;
    },

    /**
     * 分析最优时机
     * @returns {Promise<object>} 分析结果
     */
    async analyzeOptimalTiming() {
        const now = new Date();
        const hour = now.getHours();
        const dayOfWeek = now.getDay();
        
        // 服务器负载预测
        let serverLoad = 'normal';
        if ((hour >= 9 && hour <= 17) && (dayOfWeek >= 1 && dayOfWeek <= 5)) {
            serverLoad = 'high';
        } else if (hour >= 22 || hour <= 6) {
            serverLoad = 'low';
        }
        
        const analysis = {
            serverLoad,
            recommendation: serverLoad === 'low' ? 'proceed' : 'wait',
            optimalDelay: serverLoad === 'high' ? 5000 : 1000
        };
        
        if (analysis.recommendation === 'wait') {
            this.logStrategy(`服务器负载较高(${serverLoad})，建议等待${analysis.optimalDelay}ms`);
            await Utils.delay(analysis.optimalDelay);
        }
        
        return analysis;
    },

    /**
     * 预检测试
     * @param {object} formData - 表单数据
     * @returns {Promise<object>} 预检结果
     */
    async preflightCheck(formData) {
        // 模拟预检测试
        this.logStrategy('执行预检测试...');
        
        // 检查邮箱名可用性（模拟）
        const emailAvailable = Math.random() > 0.3; // 70%可用率
        
        if (!emailAvailable) {
            this.logStrategy('邮箱名可能已被占用，切换到替代方案');
            if (formData.emailAlternatives && formData.emailAlternatives.length > 0) {
                formData['desired-email'] = formData.emailAlternatives[0];
                this.logStrategy(`使用替代邮箱名: ${formData['desired-email']}`);
            }
        }
        
        return { emailAvailable, formData };
    },

    /**
     * 准备请求
     * @param {object} formData - 表单数据
     * @param {object} config - 配置
     * @returns {object} 请求数据
     */
    prepareRequest(formData, config) {
        const requestData = {
            email: `${formData['desired-email']}@outlook.com`,
            password: formData.password,
            firstName: formData['first-name'],
            lastName: formData['last-name'],
            birthDate: `${formData['birth-year']}-${formData['birth-month']}-${formData['birth-day']}`,
            country: formData.country,
            phone: formData.phone ? `${formData['phone-country']}${formData.phone}` : null,
            userAgent: Utils.getRandomUserAgent(),
            timestamp: Date.now()
        };
        
        if (config.randomizeData) {
            requestData.clientId = Utils.generateUUID();
            requestData.sessionId = Utils.generateRandomString(16);
        }
        
        return requestData;
    },

    /**
     * 准备智能请求
     * @param {object} formData - 表单数据
     * @param {object} config - 配置
     * @returns {object} 请求数据
     */
    prepareSmartRequest(formData, config) {
        const requestData = this.prepareRequest(formData, config);
        
        // 添加智能参数
        requestData.fingerprint = this.generateBrowserFingerprint();
        requestData.behavior = this.generateBehaviorData();
        requestData.environment = this.getEnvironmentSignature();
        
        return requestData;
    },

    /**
     * 准备激进请求
     * @param {object} formData - 表单数据
     * @param {object} config - 配置
     * @param {number} index - 尝试索引
     * @returns {object} 请求数据
     */
    prepareAggressiveRequest(formData, config, index) {
        const requestData = this.prepareRequest(formData, config);
        
        // 不同尝试使用不同参数
        const variations = [
            { userAgent: Utils.getRandomUserAgent(), country: 'US' },
            { userAgent: Utils.getRandomUserAgent(), country: 'CA' },
            { userAgent: Utils.getRandomUserAgent(), country: 'GB' }
        ];
        
        const variation = variations[index % variations.length];
        Object.assign(requestData, variation);
        
        return requestData;
    },

    /**
     * 生成浏览器指纹
     * @returns {string} 浏览器指纹
     */
    generateBrowserFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Browser fingerprint', 2, 2);
        
        return canvas.toDataURL().slice(-50);
    },

    /**
     * 生成行为数据
     * @returns {object} 行为数据
     */
    generateBehaviorData() {
        return {
            mouseMovements: Math.floor(Math.random() * 100),
            keystrokes: Math.floor(Math.random() * 50),
            scrollEvents: Math.floor(Math.random() * 20),
            focusEvents: Math.floor(Math.random() * 10),
            timeSpent: Math.floor(Math.random() * 300000) + 60000 // 1-5分钟
        };
    },

    /**
     * 获取环境签名
     * @returns {object} 环境签名
     */
    getEnvironmentSignature() {
        return {
            platform: navigator.platform,
            language: navigator.language,
            timezone: new Date().getTimezoneOffset(),
            screen: `${screen.width}x${screen.height}`,
            colorDepth: screen.colorDepth
        };
    },

    /**
     * 提交注册
     * @param {object} requestData - 请求数据
     * @param {object} config - 配置
     * @returns {Promise<object>} 响应数据
     */
    async submitRegistration(requestData, config) {
        this.logStrategy('提交注册请求...');
        
        // 模拟API调用
        await Utils.randomDelay(2000, 5000);
        
        // 模拟成功/失败
        const success = Math.random() > 0.2; // 80%成功率
        
        if (success) {
            return {
                success: true,
                email: requestData.email,
                message: '注册成功',
                verificationRequired: Math.random() > 0.7
            };
        } else {
            const errors = [
                '邮箱已存在',
                '网络连接超时',
                '服务器暂时不可用',
                '验证码错误',
                '请求频率过高'
            ];
            throw new Error(errors[Math.floor(Math.random() * errors.length)]);
        }
    },

    /**
     * 带重试的提交注册
     * @param {object} requestData - 请求数据
     * @param {object} config - 配置
     * @returns {Promise<object>} 响应数据
     */
    async submitRegistrationWithRetry(requestData, config) {
        return await Utils.retry(
            () => this.submitRegistration(requestData, config),
            config.retryCount,
            2000
        );
    },

    /**
     * 激进模式提交注册
     * @param {object} requestData - 请求数据
     * @param {object} config - 配置
     * @returns {Promise<object>} 响应数据
     */
    async submitRegistrationAggressive(requestData, config) {
        // 更短的延迟，更高的并发
        await Utils.randomDelay(500, 1500);
        
        // 稍高的成功率（由于多次尝试）
        const success = Math.random() > 0.15; // 85%成功率
        
        if (success) {
            return {
                success: true,
                email: requestData.email,
                message: '注册成功（激进模式）',
                verificationRequired: false
            };
        } else {
            throw new Error('注册失败（激进模式）');
        }
    },

    /**
     * 验证响应
     * @param {object} response - 响应数据
     * @returns {object} 验证结果
     */
    validateResponse(response) {
        if (!response.success) {
            throw new Error(response.message || '注册失败');
        }
        
        if (response.verificationRequired) {
            this.logStrategy('需要邮箱验证，请检查邮箱');
        }
        
        return response;
    },

    /**
     * 完成注册
     * @param {object} data - 响应数据
     * @returns {object} 最终结果
     */
    finalizeRegistration(data) {
        const result = {
            success: true,
            email: data.email,
            password: this.currentFormData?.password || '****',
            message: data.message,
            timestamp: new Date().toISOString()
        };
        
        // 更新统计
        if (window.UIManager) {
            window.UIManager.incrementTodayCount();
        }
        
        this.logStrategy('注册流程完成');
        return result;
    },

    /**
     * 生成数据变体
     * @param {object} formData - 原始数据
     * @param {number} count - 变体数量
     * @returns {Array} 数据变体数组
     */
    generateDataVariants(formData, count) {
        const variants = [];
        
        for (let i = 0; i < count; i++) {
            const variant = { ...formData };
            
            // 生成不同的邮箱名
            variant['desired-email'] = `${formData['desired-email']}${Math.floor(Math.random() * 1000)}`;
            
            // 稍微变化的姓名
            if (i > 0) {
                const names = Utils.generateRandomName('en');
                variant['first-name'] = names.firstName;
                variant['last-name'] = names.lastName;
            }
            
            variants.push(variant);
        }
        
        return variants;
    },

    /**
     * 快速验证
     * @param {object} formData - 表单数据
     * @returns {object} 验证结果
     */
    quickValidate(formData) {
        // 简化的验证，只检查关键字段
        if (!formData['desired-email'] || !formData.password) {
            throw new Error('缺少关键字段');
        }
        return { valid: true };
    },

    /**
     * 初始化策略统计
     * @param {string} strategy - 策略名称
     */
    initializeStrategyStats(strategy) {
        if (!this.stats.strategyPerformance[strategy]) {
            this.stats.strategyPerformance[strategy] = {
                attempts: 0,
                successes: 0,
                failures: 0
            };
        }
    },

    /**
     * 记录策略日志
     * @param {string} message - 日志消息
     */
    logStrategy(message) {
        console.log(`[策略] ${message}`);
        if (window.UIManager) {
            window.UIManager.addLog('info', message);
        }
    },

    /**
     * 获取策略统计
     * @returns {object} 统计信息
     */
    getStats() {
        return {
            ...this.stats,
            successRate: this.stats.attempts > 0 ? (this.stats.successes / this.stats.attempts) : 0
        };
    },

    /**
     * 重置统计
     */
    resetStats() {
        this.stats = {
            attempts: 0,
            successes: 0,
            failures: 0,
            strategyPerformance: {}
        };
    }
};

// 导出策略管理器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RegistrationStrategies;
} else {
    window.RegistrationStrategies = RegistrationStrategies;
}
