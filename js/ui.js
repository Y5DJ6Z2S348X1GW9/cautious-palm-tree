/**
 * Outlook邮箱注册助手 - UI交互逻辑模块
 * 负责界面交互、状态管理和用户体验优化
 */

const UIManager = {
    // 状态管理
    state: {
        currentStep: 1,
        maxSteps: 5,
        isRegistering: false,
        notifications: [],
        settings: {
            theme: 'light',
            autoSave: true,
            showTips: true
        }
    },

    // 初始化UI
    init() {
        this.bindEvents();
        this.loadSettings();
        this.initializeComponents();
        this.updateConnectionStatus();
        this.setupTheme();
    },

    // 绑定事件
    bindEvents() {
        // 主题切换
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // 设置面板
        const settingsBtn = document.getElementById('settings-btn');
        const settingsPanel = document.getElementById('settings-panel');
        const closeSettings = document.getElementById('close-settings');
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.openSettings());
        }
        if (closeSettings) {
            closeSettings.addEventListener('click', () => this.closeSettings());
        }

        // 点击设置面板外部关闭
        if (settingsPanel) {
            settingsPanel.addEventListener('click', (e) => {
                if (e.target === settingsPanel) {
                    this.closeSettings();
                }
            });
        }

        // 表单相关事件
        this.bindFormEvents();
        
        // 高级选项切换
        const advancedToggle = document.getElementById('advanced-toggle');
        if (advancedToggle) {
            advancedToggle.addEventListener('click', () => this.toggleAdvancedOptions());
        }

        // 日志清除
        const clearLog = document.getElementById('clear-log');
        if (clearLog) {
            clearLog.addEventListener('click', () => this.clearLog());
        }

        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // 在线状态监听
        window.addEventListener('online', () => this.updateConnectionStatus());
        window.addEventListener('offline', () => this.updateConnectionStatus());
    },

    // 绑定表单事件
    bindFormEvents() {
        // 邮箱生成
        const generateEmail = document.getElementById('generate-email');
        if (generateEmail) {
            generateEmail.addEventListener('click', () => this.generateRandomEmail());
        }

        // 密码生成和显示
        const generatePassword = document.getElementById('generate-password');
        const showPassword = document.getElementById('show-password');
        
        if (generatePassword) {
            generatePassword.addEventListener('click', () => this.generateRandomPassword());
        }
        if (showPassword) {
            showPassword.addEventListener('click', () => this.togglePasswordVisibility());
        }

        // 密码强度检测
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', Utils.debounce(() => {
                this.updatePasswordStrength();
            }, 300));
        }

        // 生日选择联动
        const birthMonth = document.getElementById('birth-month');
        const birthDay = document.getElementById('birth-day');
        const birthYear = document.getElementById('birth-year');
        
        if (birthMonth) {
            birthMonth.addEventListener('change', () => this.updateBirthDays());
        }

        // 初始化生日年份选项
        this.initializeBirthYears();

        // 自动填充按钮
        const autoFillBtn = document.getElementById('auto-fill-btn');
        if (autoFillBtn) {
            autoFillBtn.addEventListener('click', () => this.autoFillForm());
        }

        // 注册按钮
        const registerBtn = document.getElementById('register-btn');
        const registrationForm = document.getElementById('registration-form');
        
        if (registrationForm) {
            registrationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.startRegistration();
            });
        }

        // 实时验证
        this.setupRealTimeValidation();
    },

    // 设置实时验证
    setupRealTimeValidation() {
        const inputs = document.querySelectorAll('.form-input, .form-select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', Utils.debounce(() => {
                this.validateField(input, false);
            }, 500));
        });
    },

    // 验证字段
    validateField(field, showError = true) {
        const fieldName = field.id;
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // 移除之前的错误状态
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.form-error');
        if (existingError) {
            existingError.remove();
        }

        // 验证逻辑
        switch (fieldName) {
            case 'desired-email':
                if (value && value.length < 3) {
                    isValid = false;
                    errorMessage = '邮箱名至少需要3个字符';
                }
                break;
            
            case 'password':
                const strength = Utils.checkPasswordStrength(value);
                if (value && strength.level === 'weak') {
                    isValid = false;
                    errorMessage = '密码强度太弱';
                }
                break;
            
            case 'first-name':
            case 'last-name':
                if (value && value.length < 1) {
                    isValid = false;
                    errorMessage = '请输入有效的姓名';
                }
                break;
            
            case 'phone':
                const phoneCountry = document.getElementById('phone-country')?.value;
                if (value && !Utils.validatePhone(value, phoneCountry)) {
                    isValid = false;
                    errorMessage = '请输入有效的手机号码';
                }
                break;
        }

        // 显示错误
        if (!isValid && showError) {
            field.classList.add('error');
            const errorElement = document.createElement('div');
            errorElement.className = 'form-error';
            errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i>${errorMessage}`;
            field.parentNode.appendChild(errorElement);
        }

        return isValid;
    },

    // 生成随机邮箱
    generateRandomEmail() {
        const emailInput = document.getElementById('desired-email');
        const currentValue = emailInput.value.trim();
        const prefix = currentValue || '';
        const newEmail = Utils.generateRandomEmail(prefix);
        
        emailInput.value = newEmail;
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        this.showNotification('success', '已生成随机邮箱名', `新邮箱名: ${newEmail}@outlook.com`);
    },

    // 生成随机密码
    generateRandomPassword() {
        const passwordInput = document.getElementById('password');
        const newPassword = Utils.generateStrongPassword(12);
        
        passwordInput.value = newPassword;
        passwordInput.type = 'text'; // 临时显示密码
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        // 3秒后隐藏密码
        setTimeout(() => {
            if (passwordInput.type === 'text') {
                passwordInput.type = 'password';
                this.updatePasswordToggleIcon();
            }
        }, 3000);
        
        this.showNotification('success', '已生成强密码', '建议复制保存，3秒后自动隐藏');
    },

    // 切换密码可见性
    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const showPasswordBtn = document.getElementById('show-password');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            showPasswordBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            passwordInput.type = 'password';
            showPasswordBtn.innerHTML = '<i class="fas fa-eye"></i>';
        }
    },

    // 更新密码显示切换图标
    updatePasswordToggleIcon() {
        const passwordInput = document.getElementById('password');
        const showPasswordBtn = document.getElementById('show-password');
        
        if (passwordInput.type === 'password') {
            showPasswordBtn.innerHTML = '<i class="fas fa-eye"></i>';
        } else {
            showPasswordBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
        }
    },

    // 更新密码强度
    updatePasswordStrength() {
        const passwordInput = document.getElementById('password');
        const strengthIndicator = document.getElementById('strength-indicator');
        const strengthText = document.getElementById('strength-text');
        
        if (!passwordInput || !strengthIndicator || !strengthText) return;
        
        const password = passwordInput.value;
        const strength = Utils.checkPasswordStrength(password);
        
        // 移除所有强度类
        strengthIndicator.className = 'strength-indicator';
        
        if (password) {
            strengthIndicator.classList.add(strength.level);
            
            const levelTexts = {
                weak: '弱',
                fair: '一般',
                good: '良好',
                strong: '强'
            };
            
            strengthText.textContent = `密码强度: ${levelTexts[strength.level]}`;
            
            if (strength.feedback.length > 0) {
                strengthText.textContent += ` (${strength.feedback[0]})`;
            }
        } else {
            strengthText.textContent = '请输入密码';
        }
    },

    // 初始化生日年份
    initializeBirthYears() {
        const birthYear = document.getElementById('birth-year');
        if (!birthYear) return;
        
        const currentYear = new Date().getFullYear();
        for (let year = currentYear - 18; year >= currentYear - 80; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            birthYear.appendChild(option);
        }
    },

    // 更新生日日期选项
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

    // 自动填充表单
    async autoFillForm() {
        this.showNotification('info', '正在自动填充表单...', '请稍候');
        
        try {
            // 生成随机数据
            const randomName = Utils.generateRandomName('en');
            const randomBirth = Utils.generateRandomBirth(18, 35);
            const randomEmail = Utils.generateRandomEmail();
            const randomPassword = Utils.generateStrongPassword(12);
            
            // 填充数据
            const fields = {
                'desired-email': randomEmail,
                'password': randomPassword,
                'first-name': randomName.firstName,
                'last-name': randomName.lastName,
                'birth-month': randomBirth.month,
                'birth-year': randomBirth.year,
                'country': 'US'
            };
            
            // 模拟人类输入
            for (const [fieldId, value] of Object.entries(fields)) {
                const field = document.getElementById(fieldId);
                if (field) {
                    await Utils.simulateTyping(field, value, 80);
                    await Utils.randomDelay(200, 500);
                }
            }
            
            // 更新生日日期
            this.updateBirthDays();
            
            // 设置生日日期
            await Utils.delay(200);
            const birthDayField = document.getElementById('birth-day');
            if (birthDayField) {
                birthDayField.value = randomBirth.day;
                birthDayField.dispatchEvent(new Event('change', { bubbles: true }));
            }
            
            this.showNotification('success', '表单填充完成', '已自动生成所有必要信息');
            
        } catch (error) {
            console.error('自动填充失败:', error);
            this.showNotification('error', '自动填充失败', '请手动填写表单');
        }
    },

    // 切换高级选项
    toggleAdvancedOptions() {
        const toggle = document.getElementById('advanced-toggle');
        const options = document.getElementById('advanced-options');
        
        if (!toggle || !options) return;
        
        const isExpanded = options.classList.contains('expanded');
        
        if (isExpanded) {
            options.classList.remove('expanded');
            toggle.classList.remove('expanded');
        } else {
            options.classList.add('expanded');
            toggle.classList.add('expanded');
        }
    },

    // 开始注册
    async startRegistration() {
        if (this.state.isRegistering) {
            this.showNotification('warning', '注册正在进行中', '请勿重复提交');
            return;
        }
        
        // 表单验证
        if (!this.validateForm()) {
            this.showNotification('error', '表单验证失败', '请检查并修正错误信息');
            return;
        }
        
        this.state.isRegistering = true;
        this.updateRegisterButton(true);
        this.resetProgress();
        
        try {
            // 显示结果卡片
            this.showResultCard();
            
            // 开始注册流程
            const formData = this.getFormData();
            
            // 这里会调用注册模块
            if (window.OutlookRegistration) {
                await window.OutlookRegistration.register(formData);
            } else {
                throw new Error('注册模块未加载');
            }
            
        } catch (error) {
            console.error('注册失败:', error);
            this.showNotification('error', '注册失败', error.message || '未知错误');
            this.showRegistrationResult(false, error.message);
        } finally {
            this.state.isRegistering = false;
            this.updateRegisterButton(false);
        }
    },

    // 验证表单
    validateForm() {
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
        
        let isValid = true;
        const errors = [];
        
        for (const fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                isValid = false;
                errors.push(`${fieldId} 为必填项`);
                
                if (field) {
                    field.classList.add('error');
                    field.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                // 验证具体字段
                if (!this.validateField(field, true)) {
                    isValid = false;
                }
            }
        }
        
        if (!isValid) {
            console.warn('表单验证失败:', errors);
        }
        
        return isValid;
    },

    // 获取表单数据
    getFormData() {
        const formData = {};
        const inputs = document.querySelectorAll('#registration-form input, #registration-form select');
        
        inputs.forEach(input => {
            if (input.type === 'radio') {
                if (input.checked) {
                    formData[input.name] = input.value;
                }
            } else if (input.type === 'checkbox') {
                formData[input.id] = input.checked;
            } else {
                formData[input.id] = input.value;
            }
        });
        
        return formData;
    },

    // 更新注册按钮状态
    updateRegisterButton(isLoading) {
        const registerBtn = document.getElementById('register-btn');
        if (!registerBtn) return;
        
        if (isLoading) {
            registerBtn.classList.add('loading');
            registerBtn.disabled = true;
        } else {
            registerBtn.classList.remove('loading');
            registerBtn.disabled = false;
        }
    },

    // 更新进度
    updateProgress(step, text = '') {
        this.state.currentStep = step;
        
        // 更新进度条
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            const percentage = (step / this.state.maxSteps) * 100;
            progressFill.style.width = `${percentage}%`;
        }
        
        // 更新步骤状态
        const steps = document.querySelectorAll('.step');
        steps.forEach((stepEl, index) => {
            const stepNumber = index + 1;
            stepEl.classList.remove('active', 'completed');
            
            if (stepNumber < step) {
                stepEl.classList.add('completed');
            } else if (stepNumber === step) {
                stepEl.classList.add('active');
            }
        });
        
        // 更新进度文本
        const progressText = document.getElementById('progress-text');
        if (progressText) {
            progressText.textContent = text || this.getDefaultProgressText(step);
        }
    },

    // 获取默认进度文本
    getDefaultProgressText(step) {
        const texts = {
            1: '正在验证注册参数...',
            2: '正在连接Microsoft服务器...',
            3: '正在提交注册信息...',
            4: '正在验证邮箱地址...',
            5: '注册完成!'
        };
        return texts[step] || '处理中...';
    },

    // 重置进度
    resetProgress() {
        this.updateProgress(1, '准备开始注册...');
    },

    // 完成进度
    completeProgress() {
        this.updateProgress(this.state.maxSteps, '注册成功完成!');
    },

    // 显示结果卡片
    showResultCard() {
        const resultCard = document.getElementById('result-card');
        if (resultCard) {
            resultCard.style.display = 'block';
            resultCard.scrollIntoView({ behavior: 'smooth' });
        }
    },

    // 隐藏结果卡片
    hideResultCard() {
        const resultCard = document.getElementById('result-card');
        if (resultCard) {
            resultCard.style.display = 'none';
        }
    },

    // 显示注册结果
    showRegistrationResult(success, data) {
        const resultContent = document.getElementById('result-content');
        if (!resultContent) return;
        
        if (success) {
            resultContent.innerHTML = `
                <div class="result-success">
                    <div class="success-checkmark"></div>
                    <h3>注册成功！</h3>
                    <p>您的Outlook邮箱已成功创建</p>
                    <div class="result-email">${data.email}</div>
                    <p><strong>密码:</strong> ${data.password}</p>
                    <div class="result-actions">
                        <button class="btn btn-primary" onclick="UIManager.copyCredentials('${data.email}', '${data.password}')">
                            <i class="fas fa-copy"></i> 复制账号信息
                        </button>
                        <button class="btn btn-secondary" onclick="window.open('https://outlook.live.com', '_blank')">
                            <i class="fas fa-external-link-alt"></i> 登录邮箱
                        </button>
                    </div>
                </div>
            `;
            
            this.showNotification('success', '注册成功！', `邮箱: ${data.email}`);
            this.completeProgress();
        } else {
            resultContent.innerHTML = `
                <div class="result-error text-center">
                    <div class="error-cross"></div>
                    <h3 style="color: var(--danger-color); margin: var(--spacing-md) 0;">注册失败</h3>
                    <p style="color: var(--text-secondary);">${data || '未知错误，请重试'}</p>
                    <div class="result-actions">
                        <button class="btn btn-primary" onclick="UIManager.retryRegistration()">
                            <i class="fas fa-redo"></i> 重新尝试
                        </button>
                        <button class="btn btn-secondary" onclick="UIManager.hideResultCard()">
                            <i class="fas fa-times"></i> 关闭
                        </button>
                    </div>
                </div>
            `;
        }
    },

    // 复制账号信息
    async copyCredentials(email, password) {
        const text = `邮箱: ${email}\n密码: ${password}`;
        const success = await Utils.copyToClipboard(text);
        
        if (success) {
            this.showNotification('success', '复制成功', '账号信息已复制到剪贴板');
        } else {
            this.showNotification('error', '复制失败', '请手动复制账号信息');
        }
    },

    // 重试注册
    retryRegistration() {
        this.hideResultCard();
        this.startRegistration();
    },

    // 添加日志
    addLog(type, message) {
        const logContainer = document.getElementById('log-container');
        if (!logContainer) return;
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        
        const time = Utils.getCurrentTime();
        logEntry.innerHTML = `
            <span class="log-time">${time}</span>
            <span class="log-message">${message}</span>
        `;
        
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
        
        // 限制日志数量
        const entries = logContainer.querySelectorAll('.log-entry');
        if (entries.length > 100) {
            entries[0].remove();
        }
    },

    // 清空日志
    clearLog() {
        const logContainer = document.getElementById('log-container');
        if (logContainer) {
            logContainer.innerHTML = `
                <div class="log-entry info">
                    <span class="log-time">${Utils.getCurrentTime()}</span>
                    <span class="log-message">日志已清空</span>
                </div>
            `;
        }
    },

    // 显示通知
    showNotification(type, title, message = '', duration = 5000) {
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="${icons[type] || icons.info}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                ${message ? `<div class="notification-message">${message}</div>` : ''}
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // 关闭按钮事件
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.removeNotification(notification);
        });
        
        container.appendChild(notification);
        
        // 自动关闭
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
        }
        
        // 添加到状态
        this.state.notifications.push({
            id: Date.now(),
            type,
            title,
            message,
            element: notification
        });
    },

    // 移除通知
    removeNotification(notification) {
        if (notification && notification.parentNode) {
            notification.style.animation = 'notification-appear 0.3s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    },

    // 更新连接状态
    updateConnectionStatus() {
        const statusElement = document.getElementById('connection-status');
        if (!statusElement) return;
        
        const isOnline = Utils.isOnline();
        statusElement.textContent = isOnline ? '在线' : '离线';
        statusElement.className = `status-value ${isOnline ? 'online' : 'offline'}`;
        
        if (!isOnline) {
            this.showNotification('warning', '网络连接断开', '请检查网络连接');
        }
    },

    // 切换主题
    toggleTheme() {
        const currentTheme = this.state.settings.theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        this.setTheme(newTheme);
    },

    // 设置主题
    setTheme(theme) {
        this.state.settings.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
        
        this.saveSettings();
    },

    // 设置主题系统
    setupTheme() {
        // 检测系统主题偏好
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = this.state.settings.theme;
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');
        
        this.setTheme(theme);
        
        // 监听系统主题变化
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!this.state.settings.theme) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    },

    // 打开设置
    openSettings() {
        const settingsPanel = document.getElementById('settings-panel');
        if (settingsPanel) {
            settingsPanel.classList.add('open');
            this.renderSettings();
        }
    },

    // 关闭设置
    closeSettings() {
        const settingsPanel = document.getElementById('settings-panel');
        if (settingsPanel) {
            settingsPanel.classList.remove('open');
        }
    },

    // 渲染设置界面
    renderSettings() {
        const settingsBody = document.querySelector('.settings-body');
        if (!settingsBody) return;
        
        settingsBody.innerHTML = `
            <div class="form-group">
                <label class="form-label">主题设置</label>
                <div class="strategy-options">
                    <label class="radio-option">
                        <input type="radio" name="theme" value="light" ${this.state.settings.theme === 'light' ? 'checked' : ''}>
                        <span class="radio-custom"></span>
                        <span class="radio-label">浅色主题</span>
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="theme" value="dark" ${this.state.settings.theme === 'dark' ? 'checked' : ''}>
                        <span class="radio-custom"></span>
                        <span class="radio-label">深色主题</span>
                    </label>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">功能设置</label>
                <label class="checkbox-option">
                    <input type="checkbox" id="auto-save-setting" ${this.state.settings.autoSave ? 'checked' : ''}>
                    <span class="checkbox-custom"></span>
                    <span class="checkbox-label">自动保存表单数据</span>
                </label>
                <label class="checkbox-option">
                    <input type="checkbox" id="show-tips-setting" ${this.state.settings.showTips ? 'checked' : ''}>
                    <span class="checkbox-custom"></span>
                    <span class="checkbox-label">显示使用技巧</span>
                </label>
            </div>
            
            <div class="form-group">
                <label class="form-label">数据管理</label>
                <button class="btn btn-secondary w-100 mb-2" onclick="UIManager.exportData()">
                    <i class="fas fa-download"></i> 导出设置数据
                </button>
                <button class="btn btn-secondary w-100 mb-2" onclick="UIManager.importData()">
                    <i class="fas fa-upload"></i> 导入设置数据
                </button>
                <button class="btn btn-danger w-100" onclick="UIManager.resetData()">
                    <i class="fas fa-trash"></i> 重置所有数据
                </button>
            </div>
        `;
        
        // 绑定设置事件
        this.bindSettingsEvents();
    },

    // 绑定设置事件
    bindSettingsEvents() {
        // 主题切换
        const themeRadios = document.querySelectorAll('input[name="theme"]');
        themeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.setTheme(e.target.value);
            });
        });
        
        // 功能设置
        const autoSave = document.getElementById('auto-save-setting');
        const showTips = document.getElementById('show-tips-setting');
        
        if (autoSave) {
            autoSave.addEventListener('change', (e) => {
                this.state.settings.autoSave = e.target.checked;
                this.saveSettings();
            });
        }
        
        if (showTips) {
            showTips.addEventListener('change', (e) => {
                this.state.settings.showTips = e.target.checked;
                this.saveSettings();
                this.toggleTipsDisplay();
            });
        }
    },

    // 切换技巧显示
    toggleTipsDisplay() {
        const tipsContainer = document.querySelector('.tips-container');
        if (tipsContainer) {
            tipsContainer.style.display = this.state.settings.showTips ? 'block' : 'none';
        }
    },

    // 处理键盘快捷键
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Enter: 开始注册
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            this.startRegistration();
        }
        
        // Ctrl/Cmd + R: 随机填充
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            this.autoFillForm();
        }
        
        // ESC: 关闭设置面板
        if (e.key === 'Escape') {
            this.closeSettings();
        }
        
        // F1: 显示帮助
        if (e.key === 'F1') {
            e.preventDefault();
            this.showHelp();
        }
    },

    // 显示帮助
    showHelp() {
        this.showNotification('info', '快捷键帮助', 
            'Ctrl+Enter: 开始注册<br>Ctrl+R: 随机填充<br>ESC: 关闭面板<br>F1: 显示帮助'
        );
    },

    // 初始化组件
    initializeComponents() {
        // 更新统计信息
        this.updateStatistics();
        
        // 启动定时更新
        setInterval(() => {
            this.updateStatistics();
        }, 30000); // 每30秒更新一次
        
        // 初始化日志
        this.addLog('info', '系统已准备就绪，等待用户操作...');
    },

    // 更新统计信息
    updateStatistics() {
        // 模拟成功率计算
        const successRate = Math.floor(Math.random() * 20) + 80; // 80-99%
        const todayCount = Utils.getStorage('todayRegistrationCount', 0);
        
        const successRateElement = document.getElementById('success-rate');
        const todayCountElement = document.getElementById('today-count');
        
        if (successRateElement) {
            successRateElement.textContent = `${successRate}%`;
        }
        
        if (todayCountElement) {
            todayCountElement.textContent = todayCount;
        }
    },

    // 增加今日注册计数
    incrementTodayCount() {
        const count = Utils.getStorage('todayRegistrationCount', 0) + 1;
        Utils.setStorage('todayRegistrationCount', count);
        this.updateStatistics();
    },

    // 保存设置
    saveSettings() {
        Utils.setStorage('appSettings', this.state.settings);
    },

    // 加载设置
    loadSettings() {
        const savedSettings = Utils.getStorage('appSettings', {});
        this.state.settings = { ...this.state.settings, ...savedSettings };
    },

    // 导出数据
    exportData() {
        const data = {
            settings: this.state.settings,
            statistics: {
                todayCount: Utils.getStorage('todayRegistrationCount', 0)
            },
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `outlook-helper-data-${Utils.formatDate(new Date(), 'YYYY-MM-DD')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('success', '数据导出成功', '设置数据已保存到文件');
    },

    // 导入数据
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.settings) {
                        this.state.settings = { ...this.state.settings, ...data.settings };
                        this.saveSettings();
                        this.setupTheme();
                        this.showNotification('success', '数据导入成功', '设置已更新');
                    }
                } catch (error) {
                    this.showNotification('error', '数据导入失败', '文件格式错误');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    },

    // 重置数据
    resetData() {
        if (confirm('确定要重置所有数据吗？此操作不可撤销。')) {
            localStorage.clear();
            this.state.settings = {
                theme: 'light',
                autoSave: true,
                showTips: true
            };
            this.setupTheme();
            this.showNotification('success', '数据重置成功', '所有设置已恢复默认值');
            setTimeout(() => {
                location.reload();
            }, 2000);
        }
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    UIManager.init();
});

// 导出UI管理器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
} else {
    window.UIManager = UIManager;
}
