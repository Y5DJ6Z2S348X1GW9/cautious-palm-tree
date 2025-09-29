/**
 * UI控制器模块
 * 协调所有UI交互和业务逻辑
 */

const UIController = {
    
    // 控制器状态
    state: {
        initialized: false,
        currentOperation: null,
        formData: {}
    },

    /**
     * 初始化UI控制器
     */
    init() {
        if (this.state.initialized) {
            console.warn('UI控制器已初始化');
            return;
        }

        this.bindEvents();
        this.initializeFormElements();
        this.state.initialized = true;
        
        console.log('✅ UI控制器初始化完成');
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        // 智能填充按钮
        const autoFillBtn = document.getElementById('auto-fill-btn');
        if (autoFillBtn) {
            autoFillBtn.addEventListener('click', () => this.handleAutoFill());
        }

        // 注册按钮
        const registerBtn = document.getElementById('register-btn');
        const registrationForm = document.getElementById('registration-form');
        
        if (registrationForm) {
            registrationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegistration();
            });
        }

        // 密码生成按钮
        const generatePasswordBtn = document.getElementById('generate-password');
        if (generatePasswordBtn) {
            generatePasswordBtn.addEventListener('click', () => this.generatePassword());
        }

        // 邮箱生成按钮
        const generateEmailBtn = document.getElementById('generate-email');
        if (generateEmailBtn) {
            generateEmailBtn.addEventListener('click', () => this.generateEmail());
        }

        // 密码显示/隐藏
        const showPasswordBtn = document.getElementById('show-password');
        if (showPasswordBtn) {
            showPasswordBtn.addEventListener('click', () => this.togglePasswordVisibility());
        }

        // 表单字段变化监听
        this.bindFormFieldEvents();

        console.log('✅ 事件绑定完成');
    },

    /**
     * 绑定表单字段事件
     */
    bindFormFieldEvents() {
        // 监听所有表单字段
        const formFields = document.querySelectorAll('.form-input, .form-select');
        
        formFields.forEach(field => {
            // 输入事件
            field.addEventListener('input', (e) => {
                this.handleFieldInput(e.target);
            });

            // 失焦事件
            field.addEventListener('blur', (e) => {
                this.handleFieldBlur(e.target);
            });

            // 聚焦事件
            field.addEventListener('focus', (e) => {
                this.handleFieldFocus(e.target);
            });
        });

        // 密码强度检测
        const passwordField = document.getElementById('password');
        if (passwordField) {
            passwordField.addEventListener('input', () => {
                this.updatePasswordStrength();
            });
        }

        // 生日月份变化
        const birthMonthField = document.getElementById('birth-month');
        if (birthMonthField) {
            birthMonthField.addEventListener('change', () => {
                this.updateBirthDays();
            });
        }
    },

    /**
     * 初始化表单元素
     */
    initializeFormElements() {
        // 初始化年份选项
        this.initializeBirthYears();
        
        // 设置默认值
        this.setDefaultValues();
        
        console.log('✅ 表单元素初始化完成');
    },

    /**
     * 初始化出生年份选项
     */
    initializeBirthYears() {
        const birthYearSelect = document.getElementById('birth-year');
        if (!birthYearSelect) return;

        const currentYear = new Date().getFullYear();
        
        // 清空现有选项
        birthYearSelect.innerHTML = '<option value="">选择年份</option>';
        
        // 添加年份选项（18-80岁）
        for (let year = currentYear - 18; year >= currentYear - 80; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            birthYearSelect.appendChild(option);
        }
    },

    /**
     * 设置默认值
     */
    setDefaultValues() {
        // 可以在这里设置一些默认值
        const countrySelect = document.getElementById('country');
        if (countrySelect && !countrySelect.value) {
            // 可以根据用户位置设置默认国家
            // countrySelect.value = 'US';
        }
    },

    /**
     * 处理智能填充
     */
    async handleAutoFill() {
        try {
            this.state.currentOperation = 'autoFill';
            
            // 禁用按钮
            this.setButtonState('auto-fill-btn', true, '正在填充...');
            
            // 执行填充
            if (window.FormFiller) {
                await window.FormFiller.performAutoFill();
            } else {
                throw new Error('表单填充模块未找到');
            }
            
        } catch (error) {
            console.error('智能填充失败:', error);
            this.showNotification('error', '填充失败', error.message);
        } finally {
            this.setButtonState('auto-fill-btn', false, '智能填充');
            this.state.currentOperation = null;
        }
    },

    /**
     * 处理注册
     */
    async handleRegistration() {
        try {
            this.state.currentOperation = 'registration';
            
            // 获取表单数据
            const formData = this.getFormData();
            this.state.formData = formData;
            
            // 验证表单
            if (!this.validateForm(formData)) {
                return;
            }
            
            // 禁用按钮
            this.setButtonState('register-btn', true, '注册中...');
            
            // 显示结果卡片
            this.showResultCard();
            
            // 执行注册
            let result;
            if (window.OutlookRegister) {
                result = await window.OutlookRegister.performRegistration(formData);
            } else {
                throw new Error('注册模块未找到');
            }
            
            // 显示成功结果
            this.showRegistrationSuccess(result);
            
        } catch (error) {
            console.error('注册失败:', error);
            this.showRegistrationError(error.message);
        } finally {
            this.setButtonState('register-btn', false, '开始注册');
            this.state.currentOperation = null;
        }
    },

    /**
     * 获取表单数据
     */
    getFormData() {
        const formData = {};
        
        // 获取所有表单字段的值
        const fields = [
            'desired-email',
            'password',
            'first-name', 
            'last-name',
            'birth-month',
            'birth-day',
            'birth-year',
            'country'
        ];

        fields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                formData[fieldId] = element.value.trim();
            }
        });

        // 获取策略选择
        const strategyRadio = document.querySelector('input[name="strategy"]:checked');
        if (strategyRadio) {
            formData.strategy = strategyRadio.value;
        }

        // 获取高级选项
        const advancedOptions = [
            'auto-retry',
            'use-proxy',
            'randomize-data',
            'delay-requests'
        ];

        advancedOptions.forEach(optionId => {
            const element = document.getElementById(optionId);
            if (element) {
                formData[optionId] = element.checked;
            }
        });

        return formData;
    },

    /**
     * 验证表单
     */
    validateForm(formData) {
        const requiredFields = [
            'desired-email',
            'password',
            'first-name',
            'last-name',
            'birth-month',
            'birth-day', 
            'birth-year',
            'country'
        ];

        const missingFields = [];
        
        requiredFields.forEach(fieldId => {
            if (!formData[fieldId]) {
                missingFields.push(this.getFieldDisplayName(fieldId));
                
                // 高亮错误字段
                const element = document.getElementById(fieldId);
                if (element) {
                    element.classList.add('error');
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });

        if (missingFields.length > 0) {
            this.showNotification('error', '表单验证失败', `请填写以下必填字段: ${missingFields.join(', ')}`);
            return false;
        }

        return true;
    },

    /**
     * 字段输入处理
     */
    handleFieldInput(field) {
        // 移除错误状态
        field.classList.remove('error');
        
        // 实时验证
        this.validateFieldRealtime(field);
    },

    /**
     * 字段失焦处理
     */
    handleFieldBlur(field) {
        this.validateFieldRealtime(field);
    },

    /**
     * 字段聚焦处理
     */
    handleFieldFocus(field) {
        // 移除错误状态
        field.classList.remove('error');
    },

    /**
     * 实时验证字段
     */
    validateFieldRealtime(field) {
        const fieldId = field.id;
        const value = field.value.trim();
        
        switch (fieldId) {
            case 'desired-email':
                this.validateEmailField(field, value);
                break;
            case 'password':
                this.validatePasswordField(field, value);
                break;
            case 'first-name':
            case 'last-name':
                this.validateNameField(field, value);
                break;
        }
    },

    /**
     * 验证邮箱字段
     */
    validateEmailField(field, value) {
        if (value.length === 0) return;
        
        const isValid = /^[a-zA-Z0-9._-]{3,64}$/.test(value);
        field.classList.toggle('valid', isValid);
        field.classList.toggle('invalid', !isValid);
    },

    /**
     * 验证密码字段
     */
    validatePasswordField(field, value) {
        if (value.length === 0) return;
        
        const isValid = value.length >= 8;
        field.classList.toggle('valid', isValid);
        field.classList.toggle('invalid', !isValid);
    },

    /**
     * 验证姓名字段
     */
    validateNameField(field, value) {
        if (value.length === 0) return;
        
        const isValid = /^[a-zA-Z\u4e00-\u9fa5]{1,50}$/.test(value);
        field.classList.toggle('valid', isValid);
        field.classList.toggle('invalid', !isValid);
    },

    /**
     * 更新密码强度
     */
    updatePasswordStrength() {
        const passwordField = document.getElementById('password');
        const strengthIndicator = document.getElementById('strength-indicator');
        const strengthText = document.getElementById('strength-text');
        
        if (!passwordField || !strengthIndicator || !strengthText) return;
        
        const password = passwordField.value;
        const strength = this.calculatePasswordStrength(password);
        
        // 更新指示器
        strengthIndicator.className = 'strength-indicator';
        if (password.length > 0) {
            strengthIndicator.classList.add(strength.level);
        }
        
        // 更新文本
        const levelTexts = {
            weak: '弱',
            fair: '一般', 
            good: '良好',
            strong: '强'
        };
        
        strengthText.textContent = password.length > 0 ? 
            `密码强度: ${levelTexts[strength.level]}` : '请输入密码';
    },

    /**
     * 计算密码强度
     */
    calculatePasswordStrength(password) {
        if (!password) return { level: 'weak', score: 0 };
        
        let score = 0;
        
        // 长度
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        
        // 字符类型
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^a-zA-Z0-9]/.test(password)) score += 1;
        
        // 确定等级
        let level;
        if (score <= 2) level = 'weak';
        else if (score <= 3) level = 'fair';
        else if (score <= 4) level = 'good';
        else level = 'strong';
        
        return { level, score };
    },

    /**
     * 更新生日日期
     */
    updateBirthDays() {
        const birthMonth = document.getElementById('birth-month');
        const birthDay = document.getElementById('birth-day');
        const birthYear = document.getElementById('birth-year');
        
        if (!birthMonth || !birthDay || !birthYear) return;
        
        const month = parseInt(birthMonth.value);
        const year = parseInt(birthYear.value) || new Date().getFullYear();
        
        // 清空日期选项
        birthDay.innerHTML = '<option value="">选择日期</option>';
        
        if (month) {
            const daysInMonth = new Date(year, month, 0).getDate();
            for (let day = 1; day <= daysInMonth; day++) {
                const option = document.createElement('option');
                option.value = day.toString().padStart(2, '0');
                option.textContent = day;
                birthDay.appendChild(option);
            }
        }
    },

    /**
     * 生成密码
     */
    generatePassword() {
        if (window.FormFiller) {
            const password = window.FormFiller.generateStrongPassword();
            const passwordField = document.getElementById('password');
            
            if (passwordField) {
                passwordField.value = password;
                passwordField.type = 'text'; // 临时显示
                
                this.updatePasswordStrength();
                this.showNotification('success', '密码已生成', '建议复制保存，3秒后自动隐藏');
                
                // 3秒后隐藏
                setTimeout(() => {
                    passwordField.type = 'password';
                }, 3000);
            }
        }
    },

    /**
     * 生成邮箱
     */
    generateEmail() {
        if (window.FormFiller) {
            const formData = window.FormFiller.generateFormData();
            const emailField = document.getElementById('desired-email');
            
            if (emailField) {
                emailField.value = formData['desired-email'];
                this.validateEmailField(emailField, formData['desired-email']);
                this.showNotification('success', '邮箱名已生成', `新邮箱名: ${formData['desired-email']}@outlook.com`);
            }
        }
    },

    /**
     * 切换密码可见性
     */
    togglePasswordVisibility() {
        const passwordField = document.getElementById('password');
        const showPasswordBtn = document.getElementById('show-password');
        
        if (!passwordField || !showPasswordBtn) return;
        
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            showPasswordBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            passwordField.type = 'password';
            showPasswordBtn.innerHTML = '<i class="fas fa-eye"></i>';
        }
    },

    /**
     * 设置按钮状态
     */
    setButtonState(buttonId, loading, text) {
        const button = document.getElementById(buttonId);
        if (!button) return;
        
        if (loading) {
            button.disabled = true;
            button.classList.add('loading');
            if (text) {
                button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
            }
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            if (text) {
                const originalIcon = buttonId === 'auto-fill-btn' ? 'fas fa-magic' : 'fas fa-user-plus';
                button.innerHTML = `<i class="${originalIcon}"></i> ${text}`;
            }
        }
    },

    /**
     * 显示结果卡片
     */
    showResultCard() {
        const resultCard = document.getElementById('result-card');
        if (resultCard) {
            resultCard.style.display = 'block';
            resultCard.scrollIntoView({ behavior: 'smooth' });
        }
    },

    /**
     * 显示注册成功
     */
    showRegistrationSuccess(result) {
        const resultContent = document.getElementById('result-content');
        if (!resultContent) return;
        
        resultContent.innerHTML = `
            <div class="result-success">
                <div class="success-checkmark"></div>
                <h3>🎉 注册成功！</h3>
                <p>您的Outlook邮箱已成功创建</p>
                <div class="result-email">${result.email}</div>
                <p><strong>密码:</strong> ${result.password}</p>
                ${result.needsVerification ? '<p class="verification-notice">📧 请检查邮箱并点击验证链接完成激活</p>' : ''}
                <div class="result-actions">
                    <button class="btn btn-primary" onclick="UIController.copyCredentials('${result.email}', '${result.password}')">
                        <i class="fas fa-copy"></i> 复制账号信息
                    </button>
                    <button class="btn btn-secondary" onclick="window.open('https://outlook.live.com', '_blank')">
                        <i class="fas fa-external-link-alt"></i> 登录邮箱
                    </button>
                </div>
            </div>
        `;
        
        this.showNotification('success', '注册成功！', `邮箱: ${result.email}`);
    },

    /**
     * 显示注册失败
     */
    showRegistrationError(errorMessage) {
        const resultContent = document.getElementById('result-content');
        if (!resultContent) return;
        
        resultContent.innerHTML = `
            <div class="result-error text-center">
                <div class="error-cross"></div>
                <h3 style="color: var(--danger-color); margin: var(--spacing-md) 0;">注册失败</h3>
                <p style="color: var(--text-secondary);">${errorMessage}</p>
                <div class="result-actions">
                    <button class="btn btn-primary" onclick="UIController.retryRegistration()">
                        <i class="fas fa-redo"></i> 重新尝试
                    </button>
                    <button class="btn btn-secondary" onclick="UIController.hideResultCard()">
                        <i class="fas fa-times"></i> 关闭
                    </button>
                </div>
            </div>
        `;
        
        this.showNotification('error', '注册失败', errorMessage);
    },

    /**
     * 复制账号信息
     */
    async copyCredentials(email, password) {
        const text = `邮箱: ${email}\n密码: ${password}`;
        
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                this.showNotification('success', '复制成功', '账号信息已复制到剪贴板');
            } else {
                // 兼容方案
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showNotification('success', '复制成功', '账号信息已复制到剪贴板');
            }
        } catch (error) {
            this.showNotification('error', '复制失败', '请手动复制账号信息');
        }
    },

    /**
     * 重试注册
     */
    async retryRegistration() {
        if (this.state.formData) {
            await this.handleRegistration();
        }
    },

    /**
     * 隐藏结果卡片
     */
    hideResultCard() {
        const resultCard = document.getElementById('result-card');
        if (resultCard) {
            resultCard.style.display = 'none';
        }
    },

    /**
     * 获取字段显示名称
     */
    getFieldDisplayName(fieldId) {
        const displayNames = {
            'desired-email': '邮箱名',
            'password': '密码',
            'first-name': '名字',
            'last-name': '姓氏',
            'birth-month': '出生月份',
            'birth-day': '出生日期', 
            'birth-year': '出生年份',
            'country': '国家/地区'
        };
        return displayNames[fieldId] || fieldId;
    },

    /**
     * 显示通知
     */
    showNotification(type, title, message) {
        if (window.UIManager) {
            window.UIManager.showNotification(type, title, message);
        }
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIController;
} else {
    window.UIController = UIController;
}
