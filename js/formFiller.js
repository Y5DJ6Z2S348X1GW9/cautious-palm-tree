/**
 * 表单智能填充模块
 * 专门负责表单字段的自动填充功能
 */

const FormFiller = {
    
    // 填充状态
    state: {
        isRunning: false,
        currentField: null,
        progress: 0,
        totalFields: 0
    },

    // 数据模板
    templates: {
        names: {
            firstNames: ['Alex', 'Sam', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Blake', 'Chris', 'Jamie', 'Robin', 'Ryan', 'Cameron'],
            lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson']
        },
        countries: ['US', 'CA', 'GB', 'AU', 'SG'],
        emailPrefixes: ['user', 'mail', 'test', 'demo', 'new', 'my', 'cool', 'smart', 'super', 'pro']
    },

    /**
     * 执行智能填充
     */
    async performAutoFill() {
        if (this.state.isRunning) {
            console.warn('填充正在进行中');
            return;
        }

        try {
            this.state.isRunning = true;
            this.showProgress('开始智能填充...');
            
            // 生成数据
            const formData = this.generateFormData();
            console.log('生成的表单数据:', formData);
            
            // 按顺序填充
            await this.fillFieldsSequentially(formData);
            
            this.showProgress('填充完成！');
            this.showNotification('success', '智能填充成功', '所有字段已自动填写完成');
            
        } catch (error) {
            console.error('智能填充失败:', error);
            this.showNotification('error', '填充失败', error.message);
        } finally {
            this.state.isRunning = false;
        }
    },

    /**
     * 生成表单数据
     */
    generateFormData() {
        // 优先使用安全注册模块生成数据
        if (window.SecureRegistration) {
            console.log('🔒 使用安全注册模块生成数据');
            return window.SecureRegistration.generateSecureFormData();
        }
        
        // 降级到原有方法
        console.log('⚠️ 使用基础方法生成数据');
        return this.generateBasicFormData();
    },

    /**
     * 生成基础表单数据（降级方案）
     */
    generateBasicFormData() {
        // 生成姓名
        const firstName = this.getRandomItem(this.templates.names.firstNames);
        const lastName = this.getRandomItem(this.templates.names.lastNames);
        
        // 生成邮箱
        const emailPrefix = this.getRandomItem(this.templates.emailPrefixes);
        const emailSuffix = Math.floor(Math.random() * 9999);
        const email = `${emailPrefix}${emailSuffix}`;
        
        // 生成密码
        const password = this.generateStrongPassword();
        
        // 生成生日
        const birth = this.generateBirthDate();
        
        // 选择国家
        const country = this.getRandomItem(this.templates.countries);
        
        return {
            'first-name': firstName,
            'last-name': lastName,
            'desired-email': email,
            'password': password,
            'birth-year': birth.year,
            'birth-month': birth.month,
            'birth-day': birth.day,
            'country': country
        };
    },

    /**
     * 按顺序填充字段
     */
    async fillFieldsSequentially(formData) {
        // 定义填充顺序
        const fillOrder = [
            'first-name',
            'last-name', 
            'desired-email',
            'password',
            'birth-year',     // 先填年份
            'birth-month',    // 再填月份
            'birth-day',      // 最后填日期
            'country'
        ];

        this.state.totalFields = fillOrder.length;
        
        for (let i = 0; i < fillOrder.length; i++) {
            const fieldId = fillOrder[i];
            const value = formData[fieldId];
            
            if (!value) continue;
            
            this.state.currentField = fieldId;
            this.state.progress = ((i + 1) / this.state.totalFields) * 100;
            
            this.showProgress(`填充字段: ${this.getFieldDisplayName(fieldId)}`);
            
            await this.fillSingleField(fieldId, value);
            await this.delay(300); // 人性化延迟
        }
        
        // 填充完成后保护表单数据
        if (window.FormProtector) {
            window.FormProtector.saveAllValues();
            console.log('✅ 已保护填充的表单数据');
        }
    },

    /**
     * 填充单个字段
     */
    async fillSingleField(fieldId, value) {
        const element = document.getElementById(fieldId);
        if (!element) {
            console.warn(`字段 ${fieldId} 不存在`);
            return;
        }

        // 聚焦字段
        element.focus();
        await this.delay(100);

        // 添加填充样式
        element.classList.add('filling');

        try {
            if (element.tagName === 'SELECT') {
                // 处理下拉框
                await this.fillSelectField(element, value);
            } else {
                // 处理输入框
                await this.fillInputField(element, value);
            }

            // 触发事件
            this.triggerFieldEvents(element);
            
            // 添加成功样式
            element.classList.add('auto-filled');
            
            // 特殊处理：月份变化后更新日期选项
            if (fieldId === 'birth-month') {
                await this.delay(200);
                this.updateBirthDays();
            }
            
        } catch (error) {
            console.error(`填充字段 ${fieldId} 失败:`, error);
        } finally {
            element.classList.remove('filling');
            
            // 移除样式
            setTimeout(() => {
                element.classList.remove('auto-filled');
            }, 1000);
        }
    },

    /**
     * 填充下拉框
     */
    async fillSelectField(element, value) {
        // 确保选项存在
        const option = Array.from(element.options).find(opt => opt.value === value);
        if (!option) {
            console.warn(`选项 ${value} 在 ${element.id} 中不存在`);
            return;
        }

        // 动画效果
        element.style.transform = 'scale(1.02)';
        await this.delay(150);
        
        element.value = value;
        element.style.transform = 'scale(1)';
    },

    /**
     * 填充输入框
     */
    async fillInputField(element, value) {
        // 清空现有内容
        element.value = '';
        
        // 逐字符输入（模拟打字）
        for (let i = 0; i < value.length; i++) {
            element.value += value[i];
            this.triggerInputEvent(element);
            await this.delay(50 + Math.random() * 50); // 随机延迟
        }
    },

    /**
     * 更新生日日期选项
     */
    updateBirthDays() {
        const birthMonth = document.getElementById('birth-month');
        const birthDay = document.getElementById('birth-day');
        const birthYear = document.getElementById('birth-year');
        
        if (!birthMonth || !birthDay || !birthYear) return;
        
        const month = parseInt(birthMonth.value);
        const year = parseInt(birthYear.value) || new Date().getFullYear();
        
        if (!month) return;
        
        // 清空并重新生成日期选项
        birthDay.innerHTML = '<option value="">选择日期</option>';
        
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const option = document.createElement('option');
            option.value = day.toString().padStart(2, '0');
            option.textContent = day;
            birthDay.appendChild(option);
        }
        
        console.log(`已更新日期选项，${month}月有${daysInMonth}天`);
    },

    /**
     * 生成生日
     */
    generateBirthDate() {
        const currentYear = new Date().getFullYear();
        const birthYear = currentYear - Math.floor(Math.random() * 30) - 20; // 20-50岁
        const birthMonth = Math.floor(Math.random() * 12) + 1;
        const birthDay = Math.floor(Math.random() * 28) + 1; // 确保在所有月份都有效
        
        return {
            year: birthYear.toString(),
            month: birthMonth.toString().padStart(2, '0'),
            day: birthDay.toString().padStart(2, '0')
        };
    },

    /**
     * 生成强密码
     */
    generateStrongPassword() {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*';
        
        let password = '';
        // 确保每种字符都有
        password += this.getRandomChar(lowercase);
        password += this.getRandomChar(uppercase);
        password += this.getRandomChar(numbers);
        password += this.getRandomChar(symbols);
        
        // 填充剩余长度
        const allChars = lowercase + uppercase + numbers + symbols;
        for (let i = password.length; i < 12; i++) {
            password += this.getRandomChar(allChars);
        }
        
        // 打乱字符顺序
        return password.split('').sort(() => Math.random() - 0.5).join('');
    },

    /**
     * 获取随机字符
     */
    getRandomChar(str) {
        return str.charAt(Math.floor(Math.random() * str.length));
    },

    /**
     * 获取随机项目
     */
    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    /**
     * 获取字段显示名称
     */
    getFieldDisplayName(fieldId) {
        const displayNames = {
            'first-name': '名字',
            'last-name': '姓氏',
            'desired-email': '邮箱名',
            'password': '密码',
            'birth-year': '出生年份',
            'birth-month': '出生月份',
            'birth-day': '出生日期',
            'country': '国家/地区'
        };
        return displayNames[fieldId] || fieldId;
    },

    /**
     * 触发字段事件
     */
    triggerFieldEvents(element) {
        const events = ['input', 'change', 'blur'];
        events.forEach(eventType => {
            element.dispatchEvent(new Event(eventType, { bubbles: true }));
        });
    },

    /**
     * 触发输入事件
     */
    triggerInputEvent(element) {
        element.dispatchEvent(new Event('input', { bubbles: true }));
    },

    /**
     * 延迟函数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * 显示进度
     */
    showProgress(message) {
        if (window.UIManager) {
            window.UIManager.addLog('info', message);
        }
        console.log(`[表单填充] ${message}`);
    },

    /**
     * 显示通知
     */
    showNotification(type, title, message) {
        if (window.UIManager) {
            window.UIManager.showNotification(type, title, message);
        }
    },

    /**
     * 验证所有字段是否已填充
     */
    validateAllFieldsFilled() {
        const requiredFields = [
            'first-name',
            'last-name', 
            'desired-email',
            'password',
            'birth-year',
            'birth-month',
            'birth-day',
            'country'
        ];

        const missingFields = [];
        
        for (const fieldId of requiredFields) {
            const element = document.getElementById(fieldId);
            if (!element || !element.value.trim()) {
                missingFields.push(this.getFieldDisplayName(fieldId));
            }
        }

        if (missingFields.length > 0) {
            this.showNotification('warning', '填充不完整', `以下字段未填充: ${missingFields.join(', ')}`);
            return false;
        }

        return true;
    },

    /**
     * 手动触发单个字段填充
     */
    async fillSpecificField(fieldId) {
        const formData = this.generateFormData();
        if (formData[fieldId]) {
            await this.fillSingleField(fieldId, formData[fieldId]);
        }
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormFiller;
} else {
    window.FormFiller = FormFiller;
}
