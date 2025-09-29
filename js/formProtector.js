/**
 * 表单状态保护模块
 * 确保表单数据在任何操作过程中不会丢失
 */

const FormProtector = {
    
    // 保存的表单状态
    savedFormState: {},
    
    // 监控的字段
    protectedFields: [
        'first-name',
        'last-name', 
        'desired-email',
        'password',
        'birth-year',
        'birth-month',
        'birth-day',
        'country'
    ],

    /**
     * 初始化表单保护
     */
    init() {
        this.bindProtectionEvents();
        this.startAutoSave();
        console.log('✅ 表单保护模块已初始化');
    },

    /**
     * 绑定保护事件
     */
    bindProtectionEvents() {
        // 监听所有表单字段变化
        this.protectedFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                // 输入事件
                field.addEventListener('input', () => {
                    this.saveFieldValue(fieldId, field.value);
                });
                
                // 变化事件
                field.addEventListener('change', () => {
                    this.saveFieldValue(fieldId, field.value);
                });
                
                // 失焦事件
                field.addEventListener('blur', () => {
                    this.saveFieldValue(fieldId, field.value);
                });
            }
        });

        // 监听表单提交前
        const form = document.getElementById('registration-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                // 在提交前保存所有值
                this.saveAllValues();
            });
        }
    },

    /**
     * 保存单个字段值
     */
    saveFieldValue(fieldId, value) {
        this.savedFormState[fieldId] = value;
        console.log(`已保存字段 ${fieldId}: ${value}`);
    },

    /**
     * 保存所有表单值
     */
    saveAllValues() {
        this.protectedFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                this.savedFormState[fieldId] = field.value;
            }
        });
        
        console.log('已保存所有表单数据:', this.savedFormState);
    },

    /**
     * 恢复所有表单值
     */
    restoreAllValues() {
        let restoredCount = 0;
        
        this.protectedFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const savedValue = this.savedFormState[fieldId];
            
            if (field && savedValue && savedValue.trim() !== '') {
                field.value = savedValue;
                
                // 触发变化事件
                field.dispatchEvent(new Event('input', { bubbles: true }));
                field.dispatchEvent(new Event('change', { bubbles: true }));
                
                restoredCount++;
                console.log(`已恢复字段 ${fieldId}: ${savedValue}`);
            }
        });
        
        // 特殊处理：恢复月份后更新日期选项
        if (this.savedFormState['birth-month']) {
            setTimeout(() => {
                this.updateBirthDaysAndRestore();
            }, 100);
        }
        
        console.log(`✅ 已恢复 ${restoredCount} 个字段的值`);
        return restoredCount > 0;
    },

    /**
     * 更新生日日期选项并恢复日期值
     */
    updateBirthDaysAndRestore() {
        const birthMonth = document.getElementById('birth-month');
        const birthDay = document.getElementById('birth-day');
        const birthYear = document.getElementById('birth-year');
        
        if (!birthMonth || !birthDay || !birthYear) return;
        
        const month = parseInt(birthMonth.value);
        const year = parseInt(birthYear.value) || new Date().getFullYear();
        
        if (month) {
            // 清空并重新生成日期选项
            birthDay.innerHTML = '<option value="">选择日期</option>';
            
            const daysInMonth = new Date(year, month, 0).getDate();
            for (let day = 1; day <= daysInMonth; day++) {
                const option = document.createElement('option');
                option.value = day.toString().padStart(2, '0');
                option.textContent = day;
                birthDay.appendChild(option);
            }
            
            // 恢复保存的日期值
            const savedDay = this.savedFormState['birth-day'];
            if (savedDay && parseInt(savedDay) <= daysInMonth) {
                birthDay.value = savedDay;
                console.log(`已恢复生日日期: ${savedDay}`);
            }
        }
    },

    /**
     * 检查表单是否被意外清空
     */
    checkFormCleared() {
        let emptyCount = 0;
        let totalCount = 0;
        
        this.protectedFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                totalCount++;
                if (!field.value || field.value.trim() === '') {
                    emptyCount++;
                }
            }
        });
        
        const clearRate = emptyCount / totalCount;
        
        // 如果超过50%的字段为空，认为表单被清空了
        if (clearRate > 0.5 && this.hasValidSavedData()) {
            console.warn('⚠️ 检测到表单可能被意外清空，准备恢复...');
            return true;
        }
        
        return false;
    },

    /**
     * 检查是否有有效的保存数据
     */
    hasValidSavedData() {
        return Object.keys(this.savedFormState).length > 0 && 
               Object.values(this.savedFormState).some(value => value && value.trim() !== '');
    },

    /**
     * 自动保存功能
     */
    startAutoSave() {
        // 每5秒自动保存一次
        setInterval(() => {
            this.saveAllValues();
        }, 5000);
        
        // 每2秒检查一次是否被清空
        setInterval(() => {
            if (this.checkFormCleared()) {
                this.restoreAllValues();
                this.showNotification('info', '表单已恢复', '检测到表单数据丢失，已自动恢复');
            }
        }, 2000);
    },

    /**
     * 强制恢复表单（手动调用）
     */
    forceRestore() {
        const restored = this.restoreAllValues();
        if (restored) {
            this.showNotification('success', '表单恢复成功', '已恢复所有保存的表单数据');
        } else {
            this.showNotification('warning', '无数据可恢复', '没有找到可恢复的表单数据');
        }
        return restored;
    },

    /**
     * 清除保存的数据
     */
    clearSavedData() {
        this.savedFormState = {};
        console.log('已清除所有保存的表单数据');
    },

    /**
     * 获取保存的表单数据
     */
    getSavedData() {
        return { ...this.savedFormState };
    },

    /**
     * 设置表单数据
     */
    setSavedData(data) {
        this.savedFormState = { ...data };
        console.log('已设置表单数据:', this.savedFormState);
    },

    /**
     * 显示通知
     */
    showNotification(type, title, message) {
        if (window.UIManager) {
            window.UIManager.showNotification(type, title, message);
        }
        console.log(`[表单保护] ${type}: ${title} - ${message}`);
    },

    /**
     * 导出表单数据
     */
    exportFormData() {
        const data = {
            formData: this.savedFormState,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `form-backup-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('success', '表单数据已导出', '备份文件已保存');
    },

    /**
     * 导入表单数据
     */
    importFormData() {
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
                    if (data.formData) {
                        this.setSavedData(data.formData);
                        this.restoreAllValues();
                        this.showNotification('success', '表单数据已导入', '数据已恢复到表单中');
                    }
                } catch (error) {
                    this.showNotification('error', '导入失败', '文件格式错误');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormProtector;
} else {
    window.FormProtector = FormProtector;
}
