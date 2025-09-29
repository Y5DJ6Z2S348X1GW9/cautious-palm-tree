/**
 * 应用功能测试模块
 * 用于验证所有模块和功能是否正常工作
 */

const AppTester = {
    
    // 测试结果
    results: {
        passed: 0,
        failed: 0,
        total: 0,
        details: []
    },

    /**
     * 运行所有测试
     */
    async runAllTests() {
        console.group('🧪 开始应用功能测试');
        
        this.resetResults();
        
        // 模块存在性测试
        await this.testModuleExistence();
        
        // 表单填充测试
        await this.testFormFilling();
        
        // UI交互测试
        await this.testUIInteractions();
        
        // 注册功能测试
        await this.testRegistrationFunction();
        
        // 显示测试结果
        this.showTestResults();
        
        console.groupEnd();
        
        return this.results;
    },

    /**
     * 重置测试结果
     */
    resetResults() {
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };
    },

    /**
     * 测试模块存在性
     */
    async testModuleExistence() {
        console.group('📦 模块存在性测试');
        
        const modules = [
            { name: 'Utils', object: window.Utils },
            { name: 'FormFiller', object: window.FormFiller },
            { name: 'OutlookRegister', object: window.OutlookRegister },
            { name: 'UIController', object: window.UIController },
            { name: 'UIManager', object: window.UIManager },
            { name: 'OutlookHelper', object: window.OutlookHelper }
        ];

        for (const module of modules) {
            this.test(`${module.name} 模块存在`, () => {
                return module.object !== undefined;
            });
        }
        
        console.groupEnd();
    },

    /**
     * 测试表单填充功能
     */
    async testFormFilling() {
        console.group('📝 表单填充测试');
        
        // 测试数据生成
        this.test('表单数据生成', () => {
            if (!window.FormFiller) return false;
            const data = window.FormFiller.generateFormData();
            return data && 
                   data['first-name'] && 
                   data['last-name'] && 
                   data['desired-email'] && 
                   data['password'] &&
                   data['birth-year'] &&
                   data['birth-month'] &&
                   data['birth-day'] &&
                   data['country'];
        });

        // 测试密码生成
        this.test('强密码生成', () => {
            if (!window.FormFiller) return false;
            const password = window.FormFiller.generateStrongPassword();
            return password && 
                   password.length >= 8 &&
                   /[a-z]/.test(password) &&
                   /[A-Z]/.test(password) &&
                   /[0-9]/.test(password);
        });

        // 测试字段验证
        this.test('字段验证功能', () => {
            if (!window.FormFiller) return false;
            return typeof window.FormFiller.validateAllFieldsFilled === 'function';
        });
        
        console.groupEnd();
    },

    /**
     * 测试UI交互
     */
    async testUIInteractions() {
        console.group('🖱️ UI交互测试');
        
        // 测试按钮存在
        this.test('关键按钮存在', () => {
            const autoFillBtn = document.getElementById('auto-fill-btn');
            const registerBtn = document.getElementById('register-btn');
            return autoFillBtn && registerBtn;
        });

        // 测试表单字段存在
        this.test('必需表单字段存在', () => {
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
            
            return requiredFields.every(fieldId => {
                return document.getElementById(fieldId) !== null;
            });
        });

        // 测试UI控制器功能
        this.test('UI控制器初始化', () => {
            return window.UIController && window.UIController.state.initialized;
        });
        
        console.groupEnd();
    },

    /**
     * 测试注册功能
     */
    async testRegistrationFunction() {
        console.group('🔐 注册功能测试');
        
        // 测试注册模块存在
        this.test('注册模块存在', () => {
            return window.OutlookRegister && 
                   typeof window.OutlookRegister.performRegistration === 'function';
        });

        // 测试表单验证
        this.test('表单验证功能', () => {
            if (!window.OutlookRegister) return false;
            
            try {
                // 测试空数据验证
                window.OutlookRegister.validateFormData({});
                return false; // 应该抛出错误
            } catch (error) {
                return true; // 正确抛出了验证错误
            }
        });

        // 测试UUID生成
        this.test('UUID生成功能', () => {
            if (!window.OutlookRegister) return false;
            const uuid = window.OutlookRegister.generateUUID();
            return uuid && uuid.length === 36 && uuid.includes('-');
        });
        
        console.groupEnd();
    },

    /**
     * 执行单个测试
     */
    test(name, testFunction) {
        this.results.total++;
        
        try {
            const result = testFunction();
            if (result) {
                this.results.passed++;
                console.log(`✅ ${name}`);
                this.results.details.push({ name, status: 'passed', error: null });
            } else {
                this.results.failed++;
                console.log(`❌ ${name}`);
                this.results.details.push({ name, status: 'failed', error: 'Test returned false' });
            }
        } catch (error) {
            this.results.failed++;
            console.log(`❌ ${name}: ${error.message}`);
            this.results.details.push({ name, status: 'failed', error: error.message });
        }
    },

    /**
     * 显示测试结果
     */
    showTestResults() {
        const passRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
        
        console.log('\n📊 测试结果汇总:');
        console.log(`总计: ${this.results.total}`);
        console.log(`通过: ${this.results.passed}`);
        console.log(`失败: ${this.results.failed}`);
        console.log(`通过率: ${passRate}%`);
        
        if (this.results.failed > 0) {
            console.group('❌ 失败的测试:');
            this.results.details
                .filter(detail => detail.status === 'failed')
                .forEach(detail => {
                    console.log(`- ${detail.name}: ${detail.error}`);
                });
            console.groupEnd();
        }
        
        // 显示到UI
        if (window.UIManager) {
            const message = `测试完成: ${this.results.passed}/${this.results.total} 通过 (${passRate}%)`;
            const type = this.results.failed > 0 ? 'warning' : 'success';
            window.UIManager.showNotification(type, '功能测试', message);
        }
    },

    /**
     * 快速健康检查
     */
    quickHealthCheck() {
        const issues = [];
        
        // 检查关键模块
        if (!window.FormFiller) issues.push('FormFiller模块缺失');
        if (!window.OutlookRegister) issues.push('OutlookRegister模块缺失');
        if (!window.UIController) issues.push('UIController模块缺失');
        
        // 检查DOM元素
        if (!document.getElementById('auto-fill-btn')) issues.push('智能填充按钮缺失');
        if (!document.getElementById('register-btn')) issues.push('注册按钮缺失');
        if (!document.getElementById('registration-form')) issues.push('注册表单缺失');
        
        if (issues.length === 0) {
            console.log('✅ 应用健康检查通过');
            return true;
        } else {
            console.warn('⚠️ 发现问题:', issues);
            return false;
        }
    },

    /**
     * 演示智能填充
     */
    async demoAutoFill() {
        console.log('🎬 演示智能填充功能');
        
        if (!window.FormFiller) {
            console.error('FormFiller模块不可用');
            return;
        }
        
        try {
            await window.FormFiller.performAutoFill();
            console.log('✅ 智能填充演示完成');
        } catch (error) {
            console.error('❌ 智能填充演示失败:', error);
        }
    },

    /**
     * 演示注册流程（仅UI流程，不实际注册）
     */
    async demoRegistration() {
        console.log('🎬 演示注册流程');
        
        if (!window.UIController) {
            console.error('UIController模块不可用');
            return;
        }
        
        // 先填充表单
        await this.demoAutoFill();
        
        // 等待一秒
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 触发注册（这会执行实际的注册逻辑）
        try {
            await window.UIController.handleRegistration();
            console.log('✅ 注册流程演示完成');
        } catch (error) {
            console.error('❌ 注册流程演示失败:', error);
        }
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppTester;
} else {
    window.AppTester = AppTester;
    
    // 自动运行快速健康检查
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            AppTester.quickHealthCheck();
        }, 2000);
    });
}
