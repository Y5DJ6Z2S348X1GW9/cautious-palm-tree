/**
 * Outlook邮箱注册助手 - 工具函数模块
 * 提供通用的工具函数和辅助方法
 */

// 工具函数命名空间
const Utils = {
    
    /**
     * 生成随机字符串
     * @param {number} length - 字符串长度
     * @param {string} charset - 字符集
     * @returns {string} 随机字符串
     */
    generateRandomString(length = 8, charset = 'abcdefghijklmnopqrstuvwxyz0123456789') {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return result;
    },

    /**
     * 生成随机邮箱名
     * @param {string} prefix - 前缀
     * @returns {string} 邮箱名
     */
    generateRandomEmail(prefix = '') {
        const adjectives = ['cool', 'smart', 'happy', 'bright', 'swift', 'lucky', 'super', 'mega', 'ultra', 'pro'];
        const nouns = ['user', 'player', 'master', 'hero', 'star', 'ninja', 'wizard', 'champion', 'legend', 'ace'];
        const numbers = Math.floor(Math.random() * 9999);
        
        if (prefix) {
            return `${prefix}${numbers}`;
        }
        
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        return `${adjective}${noun}${numbers}`;
    },

    /**
     * 生成强密码
     * @param {number} length - 密码长度
     * @returns {string} 强密码
     */
    generateStrongPassword(length = 12) {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        let password = '';
        // 确保每种字符都至少有一个
        password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
        password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
        password += numbers.charAt(Math.floor(Math.random() * numbers.length));
        password += symbols.charAt(Math.floor(Math.random() * symbols.length));
        
        // 填充剩余长度
        const allChars = lowercase + uppercase + numbers + symbols;
        for (let i = password.length; i < length; i++) {
            password += allChars.charAt(Math.floor(Math.random() * allChars.length));
        }
        
        // 打乱密码字符顺序
        return password.split('').sort(() => Math.random() - 0.5).join('');
    },

    /**
     * 检查密码强度
     * @param {string} password - 密码
     * @returns {object} 密码强度信息
     */
    checkPasswordStrength(password) {
        const result = {
            score: 0,
            level: 'weak',
            feedback: []
        };

        if (!password) {
            result.feedback.push('请输入密码');
            return result;
        }

        // 长度检查
        if (password.length >= 8) result.score += 1;
        else result.feedback.push('密码长度至少8位');

        if (password.length >= 12) result.score += 1;

        // 字符类型检查
        if (/[a-z]/.test(password)) result.score += 1;
        else result.feedback.push('需要包含小写字母');

        if (/[A-Z]/.test(password)) result.score += 1;
        else result.feedback.push('需要包含大写字母');

        if (/[0-9]/.test(password)) result.score += 1;
        else result.feedback.push('需要包含数字');

        if (/[^a-zA-Z0-9]/.test(password)) result.score += 1;
        else result.feedback.push('需要包含特殊字符');

        // 计算强度等级
        if (result.score <= 2) {
            result.level = 'weak';
        } else if (result.score <= 4) {
            result.level = 'fair';
        } else if (result.score <= 5) {
            result.level = 'good';
        } else {
            result.level = 'strong';
        }

        return result;
    },

    /**
     * 生成随机姓名
     * @param {string} type - 姓名类型 ('en' | 'cn')
     * @returns {object} 姓名对象
     */
    generateRandomName(type = 'en') {
        if (type === 'cn') {
            const surnames = ['李', '王', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴'];
            const names = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军'];
            
            return {
                firstName: names[Math.floor(Math.random() * names.length)],
                lastName: surnames[Math.floor(Math.random() * surnames.length)]
            };
        } else {
            const firstNames = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen'];
            const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
            
            return {
                firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
                lastName: lastNames[Math.floor(Math.random() * lastNames.length)]
            };
        }
    },

    /**
     * 生成随机生日
     * @param {number} minAge - 最小年龄
     * @param {number} maxAge - 最大年龄
     * @returns {object} 生日对象
     */
    generateRandomBirth(minAge = 18, maxAge = 65) {
        const currentYear = new Date().getFullYear();
        const birthYear = currentYear - Math.floor(Math.random() * (maxAge - minAge + 1)) - minAge;
        const birthMonth = Math.floor(Math.random() * 12) + 1;
        const daysInMonth = new Date(birthYear, birthMonth, 0).getDate();
        const birthDay = Math.floor(Math.random() * daysInMonth) + 1;
        
        return {
            year: birthYear.toString(),
            month: birthMonth.toString().padStart(2, '0'),
            day: birthDay.toString().padStart(2, '0')
        };
    },

    /**
     * 延迟执行
     * @param {number} ms - 延迟毫秒数
     * @returns {Promise} Promise对象
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * 随机延迟
     * @param {number} min - 最小延迟毫秒数
     * @param {number} max - 最大延迟毫秒数
     * @returns {Promise} Promise对象
     */
    randomDelay(min = 500, max = 2000) {
        const ms = Math.floor(Math.random() * (max - min + 1)) + min;
        return this.delay(ms);
    },

    /**
     * 防抖函数
     * @param {Function} func - 要防抖的函数
     * @param {number} wait - 等待时间
     * @param {boolean} immediate - 是否立即执行
     * @returns {Function} 防抖后的函数
     */
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    },

    /**
     * 节流函数
     * @param {Function} func - 要节流的函数
     * @param {number} limit - 节流时间间隔
     * @returns {Function} 节流后的函数
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * 深拷贝对象
     * @param {any} obj - 要拷贝的对象
     * @returns {any} 拷贝后的对象
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    },

    /**
     * 格式化日期
     * @param {Date} date - 日期对象
     * @param {string} format - 格式字符串
     * @returns {string} 格式化后的日期字符串
     */
    formatDate(date = new Date(), format = 'YYYY-MM-DD HH:mm:ss') {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    },

    /**
     * 获取当前时间字符串
     * @returns {string} 时间字符串
     */
    getCurrentTime() {
        return this.formatDate(new Date(), 'HH:mm:ss');
    },

    /**
     * 验证邮箱格式
     * @param {string} email - 邮箱地址
     * @returns {boolean} 是否有效
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * 验证基本文本格式
     * @param {string} text - 文本
     * @param {number} minLength - 最小长度
     * @param {number} maxLength - 最大长度
     * @returns {boolean} 是否有效
     */
    validateText(text, minLength = 1, maxLength = 100) {
        if (!text || typeof text !== 'string') return false;
        const length = text.trim().length;
        return length >= minLength && length <= maxLength;
    },

    /**
     * 存储到本地存储
     * @param {string} key - 键名
     * @param {any} value - 值
     */
    setStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn('存储失败:', error);
        }
    },

    /**
     * 从本地存储获取
     * @param {string} key - 键名
     * @param {any} defaultValue - 默认值
     * @returns {any} 存储的值
     */
    getStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('读取存储失败:', error);
            return defaultValue;
        }
    },

    /**
     * 删除本地存储
     * @param {string} key - 键名
     */
    removeStorage(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn('删除存储失败:', error);
        }
    },

    /**
     * 获取随机User-Agent
     * @returns {string} User-Agent字符串
     */
    getRandomUserAgent() {
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/120.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
        ];
        
        return userAgents[Math.floor(Math.random() * userAgents.length)];
    },

    /**
     * 获取随机IP地址
     * @returns {string} IP地址
     */
    getRandomIP() {
        return Array.from({length: 4}, () => Math.floor(Math.random() * 256)).join('.');
    },

    /**
     * 模拟人类输入延迟
     * @param {HTMLElement} element - 输入元素
     * @param {string} text - 要输入的文本
     * @param {number} speed - 输入速度(每个字符的延迟ms)
     */
    async simulateTyping(element, text, speed = 100) {
        element.value = '';
        element.focus();
        
        for (let i = 0; i < text.length; i++) {
            element.value += text[i];
            element.dispatchEvent(new Event('input', { bubbles: true }));
            await this.delay(speed + Math.random() * 50);
        }
        
        element.dispatchEvent(new Event('change', { bubbles: true }));
    },

    /**
     * 生成UUID
     * @returns {string} UUID字符串
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    /**
     * 检测浏览器类型
     * @returns {string} 浏览器类型
     */
    getBrowserType() {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Other';
    },

    /**
     * 检测操作系统
     * @returns {string} 操作系统类型
     */
    getOS() {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Windows')) return 'Windows';
        if (userAgent.includes('Mac')) return 'macOS';
        if (userAgent.includes('Linux')) return 'Linux';
        if (userAgent.includes('Android')) return 'Android';
        if (userAgent.includes('iOS')) return 'iOS';
        return 'Other';
    },

    /**
     * 错误处理包装器
     * @param {Function} fn - 要包装的函数
     * @param {string} context - 错误上下文
     * @returns {Function} 包装后的函数
     */
    errorHandler(fn, context = '') {
        return async function(...args) {
            try {
                return await fn.apply(this, args);
            } catch (error) {
                console.error(`错误在 ${context}:`, error);
                throw error;
            }
        };
    },

    /**
     * 重试机制
     * @param {Function} fn - 要重试的函数
     * @param {number} maxRetries - 最大重试次数
     * @param {number} delay - 重试延迟
     * @returns {Promise} 执行结果
     */
    async retry(fn, maxRetries = 3, delay = 1000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                if (i === maxRetries - 1) throw error;
                console.warn(`重试 ${i + 1}/${maxRetries}:`, error.message);
                await this.delay(delay * (i + 1));
            }
        }
    },

    /**
     * 检查网络连接状态
     * @returns {boolean} 是否在线
     */
    isOnline() {
        return navigator.onLine;
    },

    /**
     * 复制文本到剪贴板
     * @param {string} text - 要复制的文本
     * @returns {Promise<boolean>} 是否成功
     */
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // 兼容旧浏览器
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            }
        } catch (error) {
            console.error('复制失败:', error);
            return false;
        }
    }
};

// 导出工具函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
} else {
    window.Utils = Utils;
}
