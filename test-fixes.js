/**
 * 修复验证测试脚本
 * 用于验证表单保护和安全注册等新功能
 */

// 测试配置
const TEST_CONFIG = {
    verbose: true,
    delay: 1000,
    maxRetries: 3
};

// 测试结果
const TestResults = {
    passed: 0,
    failed: 0,
    warnings: 0,
    tests: []
};

/**
 * 测试辅助函数
 */
function log(type, message) {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = {
        'pass': '✅',
        'fail': '❌', 
        'warn': '⚠️',
        'info': 'ℹ️'
    }[type] || 'ℹ️';
    
    console.log(`[${timestamp}] ${prefix} ${message}`);
    
    if (type === 'pass') TestResults.passed++;
    if (type === 'fail') TestResults.failed++;
    if (type === 'warn') TestResults.warnings++;
}

function assert(condition, message) {
    if (condition) {
        log('pass', message);
        return true;
    } else {
        log('fail', message);
        return false;
    }
}

/**
 * 测试1: 验证所有新模块是否正确加载
 */
function testModuleLoading() {
    log('info', '开始测试: 模块加载检查');
    
    const requiredModules = [
        { name: 'FormProtector', obj: window.FormProtector },
        { name: 'SecureRegistration', obj: window.SecureRegistration },
        { name: 'FormFiller', obj: window.FormFiller },
        { name: 'OutlookRegister', obj: window.OutlookRegister }
    ];
    
    let allPassed = true;
    
    requiredModules.forEach(module => {
        const passed = assert(
            module.obj && typeof module.obj === 'object',
            `模块 ${module.name} 已正确加载`
        );
        if (!passed) allPassed = false;
    });
    
    return allPassed;
}

/**
 * 测试2: 验证表单保护功能
 */
async function testFormProtection() {
    log('info', '开始测试: 表单保护功能');
    
    if (!window.FormProtector) {
        log('fail', 'FormProtector模块未加载');
        return false;
    }
    
    // 测试数据保存功能
    const testData = {
        'first-name': 'TestUser',
        'last-name': 'TestLast',
        'desired-email': 'testuser123',
        'country': 'US'
    };
    
    try {
        // 保存测试数据
        window.FormProtector.setSavedData(testData);
        const savedData = window.FormProtector.getSavedData();
        
        const dataMatches = JSON.stringify(savedData) === JSON.stringify(testData);
        assert(dataMatches, '表单数据保存和读取功能正常');
        
        // 测试是否有有效数据
        const hasValidData = window.FormProtector.hasValidSavedData();
        assert(hasValidData, '表单保护能够识别有效数据');
        
        return dataMatches && hasValidData;
        
    } catch (error) {
        log('fail', `表单保护测试失败: ${error.message}`);
        return false;
    }
}

/**
 * 测试3: 验证安全注册功能
 */
async function testSecureRegistration() {
    log('info', '开始测试: 安全注册功能');
    
    if (!window.SecureRegistration) {
        log('fail', 'SecureRegistration模块未加载');
        return false;
    }
    
    try {
        // 测试安全数据生成
        const secureData = window.SecureRegistration.generateSecureFormData();
        
        assert(
            secureData && typeof secureData === 'object',
            '安全数据生成功能正常'
        );
        
        assert(
            secureData['first-name'] && secureData['last-name'],
            '生成的数据包含必要的姓名字段'
        );
        
        assert(
            secureData['desired-email'] && secureData.password,
            '生成的数据包含邮箱和密码字段'
        );
        
        assert(
            secureData['birth-year'] && secureData['birth-month'] && secureData['birth-day'],
            '生成的数据包含完整的生日信息'
        );
        
        assert(
            secureData.country,
            '生成的数据包含国家信息'
        );
        
        // 测试数据安全性检查
        const securityCheck = window.SecureRegistration.checkDataSecurity(secureData);
        assert(
            securityCheck && typeof securityCheck === 'object',
            '数据安全性检查功能正常'
        );
        
        assert(
            typeof securityCheck.isSecure === 'boolean',
            '安全性检查返回有效的安全状态'
        );
        
        log('info', `生成的安全数据示例: ${JSON.stringify(secureData, null, 2)}`);
        log('info', `安全性检查结果: 安全=${securityCheck.isSecure}, 问题数=${securityCheck.issues?.length || 0}`);
        
        return true;
        
    } catch (error) {
        log('fail', `安全注册测试失败: ${error.message}`);
        return false;
    }
}

/**
 * 测试4: 验证表单填充功能的数据持久性
 */
async function testFormFillingPersistence() {
    log('info', '开始测试: 表单填充数据持久性');
    
    if (!window.FormFiller || !window.FormProtector) {
        log('fail', '所需模块未加载');
        return false;
    }
    
    try {
        // 模拟智能填充过程
        const generatedData = window.FormFiller.generateFormData();
        
        assert(
            generatedData && typeof generatedData === 'object',
            '表单数据生成功能正常'
        );
        
        // 模拟保护填充的数据
        window.FormProtector.setSavedData(generatedData);
        
        // 验证数据是否被正确保护
        const protectedData = window.FormProtector.getSavedData();
        const dataPreserved = JSON.stringify(protectedData) === JSON.stringify(generatedData);
        
        assert(dataPreserved, '填充的数据被正确保护');
        
        // 测试清空检测
        const isEmpty = window.FormProtector.checkFormCleared();
        log('info', `表单清空检测结果: ${isEmpty ? '检测到清空' : '数据完整'}`);
        
        return dataPreserved;
        
    } catch (error) {
        log('fail', `表单填充持久性测试失败: ${error.message}`);
        return false;
    }
}

/**
 * 测试5: 验证集成功能
 */
async function testIntegration() {
    log('info', '开始测试: 模块集成功能');
    
    try {
        // 测试FormFiller是否正确使用SecureRegistration
        if (window.FormFiller && window.SecureRegistration) {
            const fillerData = window.FormFiller.generateFormData();
            
            // 检查是否使用了安全注册的数据生成
            const hasSecurityInfo = fillerData._securityInfo && typeof fillerData._securityInfo === 'object';
            assert(hasSecurityInfo, 'FormFiller正确集成了SecureRegistration模块');
            
            if (hasSecurityInfo) {
                log('info', `安全信息包含: ${Object.keys(fillerData._securityInfo).join(', ')}`);
            }
        }
        
        // 测试OutlookRegister是否能使用安全注册
        if (window.OutlookRegister && window.SecureRegistration) {
            // 检查OutlookRegister是否有安全注册相关的方法
            const hasSecurityIntegration = typeof window.OutlookRegister.performRegistration === 'function';
            assert(hasSecurityIntegration, 'OutlookRegister保持注册功能接口');
        }
        
        return true;
        
    } catch (error) {
        log('fail', `集成测试失败: ${error.message}`);
        return false;
    }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
    log('info', '=== 开始运行修复验证测试 ===');
    log('info', `测试时间: ${new Date().toLocaleString()}`);
    
    const tests = [
        { name: '模块加载检查', fn: testModuleLoading },
        { name: '表单保护功能', fn: testFormProtection },
        { name: '安全注册功能', fn: testSecureRegistration },
        { name: '表单填充持久性', fn: testFormFillingPersistence },
        { name: '模块集成功能', fn: testIntegration }
    ];
    
    for (const test of tests) {
        log('info', `\n--- 运行测试: ${test.name} ---`);
        try {
            const result = await test.fn();
            TestResults.tests.push({
                name: test.name,
                passed: result,
                timestamp: new Date().toISOString()
            });
            
            if (result) {
                log('pass', `测试通过: ${test.name}`);
            } else {
                log('fail', `测试失败: ${test.name}`);
            }
            
        } catch (error) {
            log('fail', `测试异常: ${test.name} - ${error.message}`);
            TestResults.tests.push({
                name: test.name,
                passed: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
        
        // 测试间延迟
        if (TEST_CONFIG.delay > 0) {
            await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.delay));
        }
    }
    
    // 生成测试报告
    generateTestReport();
}

/**
 * 生成测试报告
 */
function generateTestReport() {
    log('info', '\n=== 测试报告 ===');
    log('info', `总测试数: ${TestResults.tests.length}`);
    log('info', `通过: ${TestResults.passed}`);
    log('info', `失败: ${TestResults.failed}`);
    log('info', `警告: ${TestResults.warnings}`);
    
    const successRate = TestResults.tests.length > 0 ? 
        (TestResults.passed / TestResults.tests.length * 100).toFixed(1) : 0;
    log('info', `成功率: ${successRate}%`);
    
    if (TestResults.failed === 0) {
        log('pass', '🎉 所有测试都通过了！修复功能正常工作！');
    } else {
        log('warn', '⚠️ 部分测试失败，需要检查相关功能');
    }
    
    // 详细的测试结果
    log('info', '\n--- 详细结果 ---');
    TestResults.tests.forEach(test => {
        const status = test.passed ? '✅' : '❌';
        const errorInfo = test.error ? ` (错误: ${test.error})` : '';
        log('info', `${status} ${test.name}${errorInfo}`);
    });
    
    log('info', '=== 测试完成 ===');
}

// 如果直接在浏览器中运行
if (typeof window !== 'undefined') {
    // 等待DOM加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(runAllTests, 2000); // 给模块加载一些时间
        });
    } else {
        setTimeout(runAllTests, 2000);
    }
    
    // 在控制台中提供手动测试函数
    window.TestFixes = {
        runAllTests,
        testModuleLoading,
        testFormProtection,
        testSecureRegistration,
        testFormFillingPersistence,
        testIntegration,
        results: TestResults
    };
    
    console.log('💡 测试函数已加载！你可以在控制台中运行:');
    console.log('   TestFixes.runAllTests() - 运行所有测试');
    console.log('   TestFixes.results - 查看测试结果');
}

// Node.js 环境支持
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAllTests,
        testModuleLoading,
        testFormProtection,
        testSecureRegistration,
        testFormFillingPersistence,
        testIntegration,
        TestResults
    };
}
