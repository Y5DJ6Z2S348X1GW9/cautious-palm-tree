/**
 * Outlook邮箱注册助手 - 自动化功能模块
 * 提供自动填充、操作自动化和智能交互功能
 */

const AutomationManager = {
    
    // 自动化配置
    config: {
        enableAutoFill: true,
        enableSmartTyping: true,
        enableFormValidation: true,
        enableProgressTracking: true,
        typingSpeed: {
            min: 80,
            max: 150
        },
        actionDelay: {
            min: 200,
            max: 800
        }
    },

    // 数据模板
    templates: {
        personal: {
            firstNames: ['Alex', 'Sam', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Blake'],
            lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'],
            emailPrefixes: ['user', 'mail', 'info', 'contact', 'hello', 'test', 'demo', 'new', 'my', 'web']
        },
        geographic: {
            countries: {
                'US': { name: 'United States', phone: '+1', timezone: 'America/New_York' },
                'CA': { name: 'Canada', phone: '+1', timezone: 'America/Toronto' },
                'GB': { name: 'United Kingdom', phone: '+44', timezone: 'Europe/London' },
                'AU': { name: 'Australia', phone: '+61', timezone: 'Australia/Sydney' },
                'SG': { name: 'Singapore', phone: '+65', timezone: 'Asia/Singapore' }
            }
        }
    },

    // 当前自动化任务
    currentTask: null,
    isRunning: false,

    /**
     * 初始化自动化管理器
     */
    init() {
        this.loadConfig();
        this.setupEventListeners();
        this.initializeTemplates();
        console.log('自动化管理器已初始化');
    },

    /**
     * 加载配置
     */
    loadConfig() {
        const savedConfig = Utils.getStorage('automationConfig', {});
        this.config = { ...this.config, ...savedConfig };
    },

    /**
     * 保存配置
     */
    saveConfig() {
        Utils.setStorage('automationConfig', this.config);
    },

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听表单变化
        document.addEventListener('input', (e) => {
            if (e.target.matches('.form-input, .form-select')) {
                this.handleFormInput(e.target);
            }
        });

        // 监听焦点事件
        document.addEventListener('focus', (e) => {
            if (e.target.matches('.form-input, .form-select')) {
                this.handleFieldFocus(e.target);
            }
        }, true);

        // 监听失焦事件
        document.addEventListener('blur', (e) => {
            if (e.target.matches('.form-input, .form-select')) {
                this.handleFieldBlur(e.target);
            }
        }, true);
    },

    /**
     * 初始化模板数据
     */
    initializeTemplates() {
        // 可以从外部API加载更多模板数据
        this.loadExternalTemplates();
    },

    /**
     * 加载外部模板（可选）
     */
    async loadExternalTemplates() {
        try {
            // 这里可以从API加载更多数据
            // const response = await fetch('/api/templates');
            // const externalTemplates = await response.json();
            // this.templates = { ...this.templates, ...externalTemplates };
            
            // 目前使用本地模板
            console.log('使用本地模板数据');
        } catch (error) {
            console.warn('加载外部模板失败，使用本地模板:', error);
        }
    },

    /**
     * 智能自动填充表单
     * @param {object} options - 填充选项
     * @returns {Promise<boolean>} 是否成功
     */
    async autoFillForm(options = {}) {
        if (this.isRunning) {
            console.warn('自动化任务正在运行中');
            return false;
        }

        this.isRunning = true;
        this.currentTask = 'autoFill';

        try {
            console.log('开始智能自动填充...');
            
            // 创建填充计划
            const fillPlan = this.createFillPlan(options);
            
            // 执行填充
            await this.executeFillPlan(fillPlan);
            
            console.log('自动填充完成');
            return true;

        } catch (error) {
            console.error('自动填充失败:', error);
            return false;
        } finally {
            this.isRunning = false;
            this.currentTask = null;
        }
    },

    /**
     * 创建填充计划
     * @param {object} options - 选项
     * @returns {Array} 填充计划
     */
    createFillPlan(options) {
        const plan = [];
        const formData = this.generateFormData(options);

        // 定义填充顺序（模拟人类填写习惯）
        const fillOrder = [
            'first-name',
            'last-name',
            'desired-email',
            'password',
            'country',
            'birth-year',
            'birth-month',
            'birth-day',
            'phone'
        ];

        fillOrder.forEach((fieldId, index) => {
            const element = document.getElementById(fieldId);
            if (element && formData[fieldId]) {
                plan.push({
                    element,
                    value: formData[fieldId],
                    delay: this.calculateDelay(index),
                    fieldType: this.getFieldType(element),
                    priority: index
                });
            }
        });

        return plan;
    },

    /**
     * 执行填充计划
     * @param {Array} plan - 填充计划
     */
    async executeFillPlan(plan) {
        for (const action of plan) {
            try {
                // 等待延迟
                await Utils.delay(action.delay);
                
                // 滚动到元素
                this.scrollToElement(action.element);
                
                // 等待元素可见
                await this.waitForElement(action.element);
                
                // 执行填充
                await this.fillField(action.element, action.value, action.fieldType);
                
                // 触发相关事件
                this.triggerFieldEvents(action.element);
                
                // 添加视觉反馈
                this.addVisualFeedback(action.element);
                
            } catch (error) {
                console.error(`填充字段 ${action.element.id} 失败:`, error);
            }
        }
    },

    /**
     * 生成表单数据
     * @param {object} options - 选项
     * @returns {object} 表单数据
     */
    generateFormData(options = {}) {
        const data = {};
        
        // 生成姓名
        const name = this.generateName(options.nameType || 'en');
        data['first-name'] = name.firstName;
        data['last-name'] = name.lastName;
        
        // 生成邮箱
        data['desired-email'] = this.generateEmail(options.emailPrefix);
        
        // 生成密码
        data['password'] = this.generatePassword(options.passwordLength || 12);
        
        // 生成生日
        const birth = this.generateBirthDate(options.ageRange);
        data['birth-year'] = birth.year;
        data['birth-month'] = birth.month;
        data['birth-day'] = birth.day;
        
        // 选择国家
        data['country'] = this.selectCountry(options.preferredCountry);
        
        // 生成手机号（可选）
        if (options.includePhone !== false) {
            const phone = this.generatePhoneNumber(data['country']);
            data['phone-country'] = phone.countryCode;
            data['phone'] = phone.number;
        }
        
        return data;
    },

    /**
     * 生成姓名
     * @param {string} type - 姓名类型
     * @returns {object} 姓名对象
     */
    generateName(type = 'en') {
        if (type === 'random') {
            type = Math.random() > 0.5 ? 'en' : 'cn';
        }
        
        return Utils.generateRandomName(type);
    },

    /**
     * 生成邮箱名
     * @param {string} prefix - 前缀
     * @returns {string} 邮箱名
     */
    generateEmail(prefix) {
        if (prefix) {
            return `${prefix}${Math.floor(Math.random() * 10000)}`;
        }
        
        const prefixes = this.templates.personal.emailPrefixes;
        const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const randomSuffix = Math.floor(Math.random() * 10000);
        
        return `${randomPrefix}${randomSuffix}`;
    },

    /**
     * 生成密码
     * @param {number} length - 密码长度
     * @returns {string} 密码
     */
    generatePassword(length = 12) {
        return Utils.generateStrongPassword(length);
    },

    /**
     * 生成生日
     * @param {object} ageRange - 年龄范围
     * @returns {object} 生日对象
     */
    generateBirthDate(ageRange = { min: 18, max: 65 }) {
        return Utils.generateRandomBirth(ageRange.min, ageRange.max);
    },

    /**
     * 选择国家
     * @param {string} preferred - 首选国家
     * @returns {string} 国家代码
     */
    selectCountry(preferred) {
        if (preferred && this.templates.geographic.countries[preferred]) {
            return preferred;
        }
        
        // 基于成功率权重选择
        const weightedCountries = [
            { code: 'US', weight: 30 },
            { code: 'CA', weight: 20 },
            { code: 'GB', weight: 20 },
            { code: 'AU', weight: 15 },
            { code: 'SG', weight: 15 }
        ];
        
        const totalWeight = weightedCountries.reduce((sum, country) => sum + country.weight, 0);
        const random = Math.random() * totalWeight;
        
        let currentWeight = 0;
        for (const country of weightedCountries) {
            currentWeight += country.weight;
            if (random <= currentWeight) {
                return country.code;
            }
        }
        
        return 'US'; // 默认值
    },

    /**
     * 生成手机号
     * @param {string} countryCode - 国家代码
     * @returns {object} 手机号对象
     */
    generatePhoneNumber(countryCode) {
        const country = this.templates.geographic.countries[countryCode];
        if (!country) {
            return { countryCode: '+1', number: '' };
        }
        
        let number = '';
        switch (countryCode) {
            case 'US':
            case 'CA':
                // 10位数字
                number = Math.floor(Math.random() * 9000000000) + 1000000000;
                break;
            case 'GB':
                // 10位数字（去除国家码）
                number = '7' + Math.floor(Math.random() * 900000000 + 100000000);
                break;
            case 'AU':
                // 9位数字
                number = '4' + Math.floor(Math.random() * 100000000 + 10000000);
                break;
            case 'SG':
                // 8位数字
                number = '9' + Math.floor(Math.random() * 10000000 + 1000000);
                break;
            default:
                number = Math.floor(Math.random() * 1000000000);
        }
        
        return {
            countryCode: country.phone,
            number: number.toString()
        };
    },

    /**
     * 计算延迟时间
     * @param {number} index - 字段索引
     * @returns {number} 延迟毫秒数
     */
    calculateDelay(index) {
        const baseDelay = 500;
        const randomDelay = Math.random() * 1000;
        const indexDelay = index * 200;
        
        return baseDelay + randomDelay + indexDelay;
    },

    /**
     * 获取字段类型
     * @param {HTMLElement} element - 元素
     * @returns {string} 字段类型
     */
    getFieldType(element) {
        if (element.tagName === 'SELECT') {
            return 'select';
        }
        
        const type = element.type || 'text';
        return type;
    },

    /**
     * 滚动到元素
     * @param {HTMLElement} element - 元素
     */
    scrollToElement(element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        });
    },

    /**
     * 等待元素可见
     * @param {HTMLElement} element - 元素
     * @returns {Promise<void>} Promise
     */
    async waitForElement(element) {
        return new Promise((resolve) => {
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    observer.disconnect();
                    resolve();
                }
            });
            
            observer.observe(element);
            
            // 超时处理
            setTimeout(() => {
                observer.disconnect();
                resolve();
            }, 5000);
        });
    },

    /**
     * 填充字段
     * @param {HTMLElement} element - 元素
     * @param {string} value - 值
     * @param {string} fieldType - 字段类型
     */
    async fillField(element, value, fieldType) {
        // 聚焦元素
        element.focus();
        await Utils.delay(100);
        
        if (fieldType === 'select') {
            // 选择框
            element.value = value;
            element.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
            // 文本输入框
            if (this.config.enableSmartTyping) {
                await this.simulateTyping(element, value);
            } else {
                element.value = value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
        
        await Utils.delay(100);
    },

    /**
     * 模拟打字
     * @param {HTMLElement} element - 元素
     * @param {string} text - 文本
     */
    async simulateTyping(element, text) {
        element.value = '';
        
        for (let i = 0; i < text.length; i++) {
            element.value += text[i];
            element.dispatchEvent(new Event('input', { bubbles: true }));
            
            // 随机延迟，模拟人类打字
            const delay = Math.random() * 
                (this.config.typingSpeed.max - this.config.typingSpeed.min) + 
                this.config.typingSpeed.min;
            
            await Utils.delay(delay);
        }
    },

    /**
     * 触发字段事件
     * @param {HTMLElement} element - 元素
     */
    triggerFieldEvents(element) {
        // 触发常见的表单事件
        const events = ['input', 'change', 'blur'];
        
        events.forEach(eventType => {
            element.dispatchEvent(new Event(eventType, { bubbles: true }));
        });
    },

    /**
     * 添加视觉反馈
     * @param {HTMLElement} element - 元素
     */
    addVisualFeedback(element) {
        // 添加临时的视觉效果
        element.classList.add('auto-filled');
        
        setTimeout(() => {
            element.classList.remove('auto-filled');
        }, 1000);
    },

    /**
     * 处理表单输入
     * @param {HTMLElement} element - 元素
     */
    handleFormInput(element) {
        // 自动完成和智能建议
        if (this.config.enableAutoComplete) {
            this.provideAutoComplete(element);
        }
        
        // 实时验证
        if (this.config.enableFormValidation) {
            this.validateFieldRealTime(element);
        }
    },

    /**
     * 处理字段聚焦
     * @param {HTMLElement} element - 元素
     */
    handleFieldFocus(element) {
        // 显示字段帮助信息
        this.showFieldHelp(element);
        
        // 记录用户交互
        this.recordUserInteraction('focus', element.id);
    },

    /**
     * 处理字段失焦
     * @param {HTMLElement} element - 元素
     */
    handleFieldBlur(element) {
        // 隐藏帮助信息
        this.hideFieldHelp(element);
        
        // 执行字段验证
        this.validateField(element);
        
        // 记录用户交互
        this.recordUserInteraction('blur', element.id);
    },

    /**
     * 提供自动完成
     * @param {HTMLElement} element - 元素
     */
    provideAutoComplete(element) {
        const fieldId = element.id;
        const value = element.value.toLowerCase();
        
        // 根据字段类型提供建议
        let suggestions = [];
        
        switch (fieldId) {
            case 'first-name':
                suggestions = this.templates.personal.firstNames
                    .filter(name => name.toLowerCase().startsWith(value));
                break;
            case 'last-name':
                suggestions = this.templates.personal.lastNames
                    .filter(name => name.toLowerCase().startsWith(value));
                break;
            case 'desired-email':
                if (value.length > 2) {
                    suggestions = this.generateEmailSuggestions(value);
                }
                break;
        }
        
        if (suggestions.length > 0) {
            this.showAutoCompleteSuggestions(element, suggestions);
        }
    },

    /**
     * 生成邮箱建议
     * @param {string} prefix - 前缀
     * @returns {Array} 建议列表
     */
    generateEmailSuggestions(prefix) {
        const suggestions = [];
        const suffixes = ['123', '2024', '01', 'new', 'my'];
        
        suffixes.forEach(suffix => {
            suggestions.push(`${prefix}${suffix}`);
        });
        
        return suggestions.slice(0, 5); // 最多5个建议
    },

    /**
     * 显示自动完成建议
     * @param {HTMLElement} element - 元素
     * @param {Array} suggestions - 建议列表
     */
    showAutoCompleteSuggestions(element, suggestions) {
        // 移除现有建议
        this.hideAutoCompleteSuggestions();
        
        // 创建建议容器
        const container = document.createElement('div');
        container.className = 'autocomplete-suggestions';
        container.id = 'autocomplete-suggestions';
        
        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.textContent = suggestion;
            item.addEventListener('click', () => {
                element.value = suggestion;
                element.dispatchEvent(new Event('input', { bubbles: true }));
                this.hideAutoCompleteSuggestions();
            });
            container.appendChild(item);
        });
        
        // 定位建议容器
        const rect = element.getBoundingClientRect();
        container.style.position = 'absolute';
        container.style.top = `${rect.bottom + window.scrollY}px`;
        container.style.left = `${rect.left + window.scrollX}px`;
        container.style.width = `${rect.width}px`;
        container.style.zIndex = '1000';
        
        document.body.appendChild(container);
        
        // 点击其他地方隐藏建议
        setTimeout(() => {
            document.addEventListener('click', this.hideAutoCompleteSuggestions, { once: true });
        }, 100);
    },

    /**
     * 隐藏自动完成建议
     */
    hideAutoCompleteSuggestions() {
        const container = document.getElementById('autocomplete-suggestions');
        if (container) {
            container.remove();
        }
    },

    /**
     * 实时验证字段
     * @param {HTMLElement} element - 元素
     */
    validateFieldRealTime(element) {
        const fieldId = element.id;
        const value = element.value;
        
        // 移除之前的验证状态
        element.classList.remove('valid', 'invalid');
        
        let isValid = true;
        let message = '';
        
        switch (fieldId) {
            case 'desired-email':
                isValid = value.length >= 3 && /^[a-zA-Z0-9_-]+$/.test(value);
                message = isValid ? '邮箱名可用' : '邮箱名格式不正确';
                break;
            case 'password':
                const strength = Utils.checkPasswordStrength(value);
                isValid = strength.level !== 'weak';
                message = `密码强度: ${strength.level}`;
                break;
            case 'first-name':
            case 'last-name':
                isValid = value.length >= 1 && /^[a-zA-Z\u4e00-\u9fa5]+$/.test(value);
                message = isValid ? '姓名格式正确' : '请输入有效姓名';
                break;
        }
        
        // 应用验证样式
        element.classList.add(isValid ? 'valid' : 'invalid');
        
        // 显示验证消息
        this.showValidationMessage(element, message, isValid);
    },

    /**
     * 验证字段
     * @param {HTMLElement} element - 元素
     */
    validateField(element) {
        // 执行完整的字段验证
        if (window.UIManager && typeof window.UIManager.validateField === 'function') {
            window.UIManager.validateField(element, true);
        }
    },

    /**
     * 显示验证消息
     * @param {HTMLElement} element - 元素
     * @param {string} message - 消息
     * @param {boolean} isValid - 是否有效
     */
    showValidationMessage(element, message, isValid) {
        // 移除现有消息
        const existingMessage = element.parentNode.querySelector('.validation-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        if (message) {
            const messageElement = document.createElement('div');
            messageElement.className = `validation-message ${isValid ? 'valid' : 'invalid'}`;
            messageElement.textContent = message;
            element.parentNode.appendChild(messageElement);
            
            // 自动隐藏消息
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.remove();
                }
            }, 3000);
        }
    },

    /**
     * 显示字段帮助
     * @param {HTMLElement} element - 元素
     */
    showFieldHelp(element) {
        const fieldId = element.id;
        const helpTexts = {
            'desired-email': '输入期望的邮箱名，3-20个字符，只能包含字母、数字、下划线和连字符',
            'password': '密码长度8-128位，建议包含大小写字母、数字和特殊字符',
            'first-name': '输入您的名字',
            'last-name': '输入您的姓氏',
            'phone': '输入手机号码，用于账户安全验证'
        };
        
        const helpText = helpTexts[fieldId];
        if (helpText) {
            this.showTooltip(element, helpText);
        }
    },

    /**
     * 隐藏字段帮助
     * @param {HTMLElement} element - 元素
     */
    hideFieldHelp(element) {
        this.hideTooltip();
    },

    /**
     * 显示工具提示
     * @param {HTMLElement} element - 元素
     * @param {string} text - 文本
     */
    showTooltip(element, text) {
        // 移除现有提示
        this.hideTooltip();
        
        const tooltip = document.createElement('div');
        tooltip.className = 'field-tooltip';
        tooltip.id = 'field-tooltip';
        tooltip.textContent = text;
        
        // 定位提示
        const rect = element.getBoundingClientRect();
        tooltip.style.position = 'absolute';
        tooltip.style.top = `${rect.top + window.scrollY - 40}px`;
        tooltip.style.left = `${rect.left + window.scrollX}px`;
        tooltip.style.zIndex = '1001';
        
        document.body.appendChild(tooltip);
    },

    /**
     * 隐藏工具提示
     */
    hideTooltip() {
        const tooltip = document.getElementById('field-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    },

    /**
     * 记录用户交互
     * @param {string} action - 动作
     * @param {string} fieldId - 字段ID
     */
    recordUserInteraction(action, fieldId) {
        const interaction = {
            action,
            fieldId,
            timestamp: Date.now()
        };
        
        // 记录到本地存储
        const interactions = Utils.getStorage('userInteractions', []);
        interactions.push(interaction);
        
        // 保留最近100条记录
        if (interactions.length > 100) {
            interactions.splice(0, interactions.length - 100);
        }
        
        Utils.setStorage('userInteractions', interactions);
    },

    /**
     * 分析用户行为
     * @returns {object} 行为分析结果
     */
    analyzeUserBehavior() {
        const interactions = Utils.getStorage('userInteractions', []);
        
        const analysis = {
            totalInteractions: interactions.length,
            mostUsedFields: {},
            averageInteractionTime: 0,
            commonPatterns: []
        };
        
        // 统计字段使用频率
        interactions.forEach(interaction => {
            if (!analysis.mostUsedFields[interaction.fieldId]) {
                analysis.mostUsedFields[interaction.fieldId] = 0;
            }
            analysis.mostUsedFields[interaction.fieldId]++;
        });
        
        return analysis;
    },

    /**
     * 智能表单建议
     * @returns {object} 建议内容
     */
    getSmartSuggestions() {
        const behavior = this.analyzeUserBehavior();
        const suggestions = [];
        
        // 基于使用习惯提供建议
        if (behavior.totalInteractions > 10) {
            suggestions.push({
                type: 'efficiency',
                message: '建议使用自动填充功能提高效率',
                action: 'autoFill'
            });
        }
        
        return suggestions;
    },

    /**
     * 批量操作
     * @param {Array} operations - 操作列表
     * @returns {Promise<Array>} 操作结果
     */
    async batchOperations(operations) {
        const results = [];
        
        for (const operation of operations) {
            try {
                const result = await this.executeOperation(operation);
                results.push({ success: true, result });
            } catch (error) {
                results.push({ success: false, error: error.message });
            }
        }
        
        return results;
    },

    /**
     * 执行单个操作
     * @param {object} operation - 操作
     * @returns {Promise<any>} 操作结果
     */
    async executeOperation(operation) {
        const { type, target, params } = operation;
        
        switch (type) {
            case 'fill':
                return await this.fillField(target, params.value, params.fieldType);
            case 'click':
                target.click();
                return { clicked: true };
            case 'wait':
                await Utils.delay(params.duration);
                return { waited: params.duration };
            default:
                throw new Error(`未知操作类型: ${type}`);
        }
    },

    /**
     * 导出自动化报告
     * @returns {object} 报告数据
     */
    exportReport() {
        const report = {
            config: this.config,
            interactions: Utils.getStorage('userInteractions', []),
            behavior: this.analyzeUserBehavior(),
            suggestions: this.getSmartSuggestions(),
            timestamp: new Date().toISOString()
        };
        
        return report;
    },

    /**
     * 重置自动化数据
     */
    resetData() {
        Utils.removeStorage('userInteractions');
        Utils.removeStorage('automationConfig');
        this.config = {
            enableAutoFill: true,
            enableSmartTyping: true,
            enableFormValidation: true,
            enableProgressTracking: true,
            typingSpeed: { min: 80, max: 150 },
            actionDelay: { min: 200, max: 800 }
        };
        console.log('自动化数据已重置');
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    AutomationManager.init();
});

// 导出自动化管理器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutomationManager;
} else {
    window.AutomationManager = AutomationManager;
}
