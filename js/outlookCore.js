/**
 * Outlook注册核心功能模块
 * 专注于真实的Outlook注册逻辑
 */

const OutlookCore = {
    
    // Microsoft注册相关的API端点
    endpoints: {
        signup: 'https://signup.live.com/signup',
        checkUsername: 'https://signup.live.com/API/CheckAvailableSigninNames',
        createAccount: 'https://signup.live.com/API/CreateAccount',
        validate: 'https://signup.live.com/API/ValidateSigninName'
    },

    // 注册所需的表单字段映射
    formFields: {
        'MemberName': 'desired-email',
        'Password': 'password', 
        'FirstName': 'first-name',
        'LastName': 'last-name',
        'BirthMonth': 'birth-month',
        'BirthDay': 'birth-day',
        'BirthYear': 'birth-year',
        'Country': 'country'
    },

    // 国家代码映射
    countryCodes: {
        'US': 'United States',
        'CN': 'China', 
        'HK': 'Hong Kong SAR',
        'TW': 'Taiwan',
        'SG': 'Singapore',
        'JP': 'Japan',
        'KR': 'Korea',
        'GB': 'United Kingdom',
        'CA': 'Canada',
        'AU': 'Australia'
    },

    // 会话管理
    session: {
        cookies: '',
        csrfToken: '',
        flowToken: '',
        correlationId: '',
        canary: ''
    },

    /**
     * 执行完整的注册流程
     */
    async performRegistration(formData) {
        try {
            console.log('🚀 开始Outlook注册流程');
            
            // 第1步：初始化会话
            await this.initializeSession();
            
            // 第2步：检查用户名可用性
            const usernameCheck = await this.checkUsernameAvailability(formData['desired-email']);
            if (!usernameCheck.available) {
                throw new Error(`邮箱名 "${formData['desired-email']}" 已被占用`);
            }
            
            // 第3步：准备注册数据
            const registrationPayload = this.prepareRegistrationPayload(formData);
            
            // 第4步：提交注册请求
            const result = await this.submitRegistration(registrationPayload);
            
            // 第5步：处理注册结果
            return this.processRegistrationResult(result, formData);
            
        } catch (error) {
            console.error('❌ 注册失败:', error);
            throw error;
        }
    },

    /**
     * 初始化注册会话
     */
    async initializeSession() {
        console.log('📡 初始化注册会话...');
        
        try {
            // 访问注册页面获取必要的token
            const response = await fetch('https://signup.live.com/signup', {
                method: 'GET',
                headers: {
                    'User-Agent': this.getRandomUserAgent(),
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                }
            });

            if (!response.ok) {
                throw new Error(`无法访问注册页面: ${response.status}`);
            }

            const html = await response.text();
            
            // 提取必要的token
            this.session.csrfToken = this.extractToken(html, 'csrf_token');
            this.session.flowToken = this.extractToken(html, 'flowToken');
            this.session.correlationId = this.extractToken(html, 'correlationId'); 
            this.session.canary = this.extractToken(html, 'canary');
            
            // 保存cookies
            const setCookieHeader = response.headers.get('Set-Cookie');
            if (setCookieHeader) {
                this.session.cookies = setCookieHeader;
            }

            console.log('✅ 会话初始化成功');
            
        } catch (error) {
            console.error('❌ 会话初始化失败:', error);
            throw new Error('无法初始化注册会话，请检查网络连接');
        }
    },

    /**
     * 检查用户名可用性
     */
    async checkUsernameAvailability(username) {
        console.log(`🔍 检查用户名可用性: ${username}`);
        
        try {
            const payload = {
                'signInNames': [username],
                'includeSuggestions': true,
                'uaid': this.session.correlationId || this.generateUUID(),
                'scid': '100118',
                'hpgid': '200650'
            };

            const response = await fetch('https://signup.live.com/API/CheckAvailableSigninNames', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': this.getRandomUserAgent(),
                    'X-Requested-With': 'XMLHttpRequest',
                    'Referer': 'https://signup.live.com/signup',
                    'Origin': 'https://signup.live.com',
                    'Cookie': this.session.cookies
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`用户名检查请求失败: ${response.status}`);
            }

            const result = await response.json();
            
            // 分析响应结果
            const isAvailable = result.isAvailable === true;
            
            if (isAvailable) {
                console.log('✅ 用户名可用');
                return { 
                    available: true, 
                    username: username,
                    suggestions: []
                };
            } else {
                console.log('❌ 用户名已被占用');
                return {
                    available: false,
                    username: username,
                    suggestions: result.suggestions || []
                };
            }
            
        } catch (error) {
            console.error('❌ 用户名检查失败:', error);
            // 如果检查失败，假设可用并继续
            return { available: true, username: username };
        }
    },

    /**
     * 准备注册数据载荷
     */
    prepareRegistrationPayload(formData) {
        console.log('📋 准备注册数据...');
        
        const payload = {
            // 基本信息
            'MemberName': formData['desired-email'],
            'Password': formData['password'],
            'FirstName': formData['first-name'],
            'LastName': formData['last-name'],
            
            // 生日信息
            'BirthMonth': formData['birth-month'],
            'BirthDay': formData['birth-day'], 
            'BirthYear': formData['birth-year'],
            
            // 地理信息
            'Country': formData['country'],
            
            // 技术参数
            'RequestTimeStamp': Date.now(),
            'FlowToken': this.session.flowToken,
            'canary': this.session.canary,
            'correlationId': this.session.correlationId,
            
            // 其他必需参数
            'iSignupAction': 'SignupSubmit',
            'uaid': this.session.correlationId || this.generateUUID(),
            'scid': '100118',
            'hpgid': '200650',
            'signup': true,
            'bfre': false,
            'lc': '1033',
            'lic': '1'
        };

        return payload;
    },

    /**
     * 提交注册请求
     */
    async submitRegistration(payload) {
        console.log('📤 提交注册请求...');
        
        try {
            const formData = new FormData();
            
            // 添加所有字段到FormData
            Object.keys(payload).forEach(key => {
                formData.append(key, payload[key]);
            });

            const response = await fetch('https://signup.live.com/API/CreateAccount', {
                method: 'POST',
                headers: {
                    'User-Agent': this.getRandomUserAgent(),
                    'Referer': 'https://signup.live.com/signup',
                    'Origin': 'https://signup.live.com',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Cookie': this.session.cookies
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`注册请求失败: ${response.status} ${response.statusText}`);
            }

            const result = await response.text();
            console.log('📥 收到注册响应');
            
            return result;
            
        } catch (error) {
            console.error('❌ 注册请求失败:', error);
            throw error;
        }
    },

    /**
     * 处理注册结果
     */
    processRegistrationResult(result, originalFormData) {
        console.log('🔍 分析注册结果...');
        
        try {
            // 检查是否包含成功指示器
            const successIndicators = [
                'congratulations',
                'success',
                'welcome',
                'verify',
                'created',
                'account has been created'
            ];

            const resultLower = result.toLowerCase();
            const isSuccess = successIndicators.some(indicator => 
                resultLower.includes(indicator)
            );

            if (isSuccess) {
                console.log('🎉 注册成功！');
                
                return {
                    success: true,
                    email: `${originalFormData['desired-email']}@outlook.com`,
                    password: originalFormData['password'],
                    message: '恭喜！您的Outlook账户注册成功',
                    needsVerification: resultLower.includes('verify'),
                    timestamp: new Date().toISOString()
                };
            } else {
                // 分析失败原因
                const errorMessage = this.parseErrorMessage(result);
                throw new Error(errorMessage);
            }
            
        } catch (error) {
            console.error('❌ 结果处理失败:', error);
            throw error;
        }
    },

    /**
     * 解析错误消息
     */
    parseErrorMessage(result) {
        const errorPatterns = {
            'username already exists': '用户名已存在',
            'invalid email': '邮箱格式无效', 
            'password too weak': '密码强度不足',
            'age requirement': '年龄不符合要求',
            'rate limit': '请求过于频繁，请稍后重试',
            'server error': '服务器错误，请稍后重试'
        };

        const resultLower = result.toLowerCase();
        
        for (const [pattern, message] of Object.entries(errorPatterns)) {
            if (resultLower.includes(pattern)) {
                return message;
            }
        }
        
        return '注册失败，请检查信息后重试';
    },

    /**
     * 从HTML中提取token
     */
    extractToken(html, tokenName) {
        const patterns = {
            'csrf_token': /name="csrf_token"\s+value="([^"]+)"/,
            'flowToken': /name="flowToken"\s+value="([^"]+)"/,
            'correlationId': /correlationId["']\s*:\s*["']([^"']+)["']/,
            'canary': /canary["']\s*:\s*["']([^"']+)["']/
        };

        const pattern = patterns[tokenName];
        if (!pattern) return '';

        const match = html.match(pattern);
        return match ? match[1] : '';
    },

    /**
     * 获取随机User-Agent
     */
    getRandomUserAgent() {
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/120.0'
        ];
        
        return userAgents[Math.floor(Math.random() * userAgents.length)];
    },

    /**
     * 生成UUID
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    /**
     * 验证注册数据完整性
     */
    validateRegistrationData(formData) {
        const required = ['desired-email', 'password', 'first-name', 'last-name', 
                         'birth-month', 'birth-day', 'birth-year', 'country'];
        
        for (const field of required) {
            if (!formData[field] || formData[field].trim() === '') {
                throw new Error(`必填字段 ${field} 不能为空`);
            }
        }
        
        // 验证邮箱名格式
        if (!/^[a-zA-Z0-9._-]{3,64}$/.test(formData['desired-email'])) {
            throw new Error('邮箱名格式不正确，只能包含字母、数字、点、下划线和连字符');
        }
        
        // 验证密码强度
        if (formData.password.length < 8) {
            throw new Error('密码长度至少8位');
        }
        
        // 验证年龄
        const birthYear = parseInt(formData['birth-year']);
        const currentYear = new Date().getFullYear();
        const age = currentYear - birthYear;
        
        if (age < 13 || age > 120) {
            throw new Error('年龄必须在13-120岁之间');
        }
        
        return true;
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OutlookCore;
} else {
    window.OutlookCore = OutlookCore;
}
