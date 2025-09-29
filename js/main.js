/**
 * Outlook邮箱注册助手 - 主应用文件
 * 负责应用初始化、模块协调和核心控制逻辑
 */

const OutlookHelper = {
    
    // 应用版本和信息
    version: '1.0.0',
    name: 'Outlook邮箱注册助手',
    author: 'AI Assistant',
    
    // 应用状态
    state: {
        initialized: false,
        loadingComplete: false,
        modules: {
            utils: false,
            ui: false,
            strategies: false,
            automation: false,
            registration: false
        },
        errors: [],
        performance: {
            startTime: Date.now(),
            initTime: null,
            loadTime: null
        }
    },

    // 应用配置
    config: {
        debug: false,
        enableAnalytics: false,
        autoSave: true,
        theme: 'auto',
        notifications: true,
        updateCheck: true
    },

    // 错误处理
    errorHandler: {
        errors: [],
        maxErrors: 50,
        
        handle(error, context = '') {
            const errorInfo = {
                message: error.message || error,
                stack: error.stack || 'No stack trace',
                context,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            };
            
            this.errors.push(errorInfo);
            
            // 限制错误数量
            if (this.errors.length > this.maxErrors) {
                this.errors.shift();
            }
            
            // 控制台输出
            console.error(`[${context || 'App'}]`, error);
            
            // 显示用户友好的错误消息
            if (window.UIManager) {
                const userMessage = this.getUserFriendlyMessage(error);
                window.UIManager.showNotification('error', '发生错误', userMessage);
            }
            
            // 保存错误日志
            Utils.setStorage('errorLogs', this.errors);
        },
        
        getUserFriendlyMessage(error) {
            const errorMap = {
                'Network error': '网络连接错误，请检查网络设置',
                'Timeout': '请求超时，请稍后重试',
                'Permission denied': '权限不足，请检查浏览器设置',
                'Invalid data': '数据格式错误，请检查输入',
                'Service unavailable': '服务暂时不可用，请稍后重试'
            };
            
            for (const [key, message] of Object.entries(errorMap)) {
                if (error.message && error.message.includes(key)) {
                    return message;
                }
            }
            
            return '发生未知错误，请刷新页面重试';
        }
    },

    /**
     * 应用初始化
     */
    async init() {
        try {
            console.log(`%c${this.name} v${this.version}`, 'color: #0078d4; font-size: 16px; font-weight: bold;');
            console.log('正在初始化应用...');
            
            // 显示加载屏幕
            this.showLoadingScreen();
            
            // 检查浏览器兼容性
            this.checkBrowserCompatibility();
            
            // 加载配置
            this.loadConfiguration();
            
            // 设置全局错误处理
            this.setupGlobalErrorHandling();
            
            // 初始化模块
            await this.initializeModules();
            
            // 设置事件监听
            this.setupEventListeners();
            
            // 应用优化
            this.applyOptimizations();
            
            // 完成初始化
            this.completeInitialization();
            
        } catch (error) {
            this.errorHandler.handle(error, 'Initialization');
            this.showFatalError('应用初始化失败，请刷新页面重试');
        }
    },

    /**
     * 显示加载屏幕
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    },

    /**
     * 隐藏加载屏幕
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const mainContainer = document.getElementById('main-container');
        
        if (loadingScreen && mainContainer) {
            // 延迟一点时间让用户看到加载完成
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                mainContainer.classList.add('loaded');
            }, 500);
        }
    },

    /**
     * 检查浏览器兼容性
     */
    checkBrowserCompatibility() {
        const requirements = {
            localStorage: !!window.localStorage,
            sessionStorage: !!window.sessionStorage,
            fetch: !!window.fetch,
            promise: !!window.Promise,
            es6: (() => {
                try {
                    new Function('(a = 0) => a');
                    return true;
                } catch (e) {
                    return false;
                }
            })()
        };

        const failed = Object.entries(requirements)
            .filter(([key, supported]) => !supported)
            .map(([key]) => key);

        if (failed.length > 0) {
            const message = `您的浏览器不支持以下功能: ${failed.join(', ')}。请使用现代浏览器访问。`;
            this.showFatalError(message);
            throw new Error(`Browser compatibility check failed: ${failed.join(', ')}`);
        }

        console.log('✓ 浏览器兼容性检查通过');
    },

    /**
     * 加载配置
     */
    loadConfiguration() {
        try {
            // 从本地存储加载配置
            const savedConfig = Utils.getStorage('appConfig', {});
            this.config = { ...this.config, ...savedConfig };
            
            // 应用主题
            if (this.config.theme === 'auto') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                this.config.theme = prefersDark ? 'dark' : 'light';
            }
            
            console.log('✓ 配置加载完成');
        } catch (error) {
            console.warn('配置加载失败，使用默认配置:', error);
        }
    },

    /**
     * 保存配置
     */
    saveConfiguration() {
        try {
            Utils.setStorage('appConfig', this.config);
        } catch (error) {
            console.warn('配置保存失败:', error);
        }
    },

    /**
     * 设置全局错误处理
     */
    setupGlobalErrorHandling() {
        // 捕获未处理的错误
        window.addEventListener('error', (event) => {
            this.errorHandler.handle(event.error || event.message, 'Global Error');
        });

        // 捕获未处理的Promise拒绝
        window.addEventListener('unhandledrejection', (event) => {
            this.errorHandler.handle(event.reason, 'Unhandled Promise Rejection');
            event.preventDefault();
        });

        console.log('✓ 全局错误处理已设置');
    },

    /**
     * 初始化模块
     */
    async initializeModules() {
        const modules = [
            { name: 'utils', check: () => window.Utils, required: true },
            { name: 'formFiller', check: () => window.FormFiller, required: true },
            { name: 'outlookRegister', check: () => window.OutlookRegister, required: true },
            { name: 'uiController', check: () => window.UIController, required: true },
            { name: 'ui', check: () => window.UIManager, required: false },
            { name: 'strategies', check: () => window.RegistrationStrategies, required: false },
            { name: 'automation', check: () => window.AutomationManager, required: false },
            { name: 'outlookCore', check: () => window.OutlookCore, required: false },
            { name: 'registration', check: () => window.OutlookRegistration, required: false }
        ];

        for (const module of modules) {
            try {
                if (module.check()) {
                    this.state.modules[module.name] = true;
                    console.log(`✓ 模块 ${module.name} 已加载`);
                } else if (module.required) {
                    throw new Error(`必需模块 ${module.name} 未找到`);
                }
            } catch (error) {
                this.state.modules[module.name] = false;
                if (module.required) {
                    throw error;
                } else {
                    console.warn(`可选模块 ${module.name} 加载失败:`, error);
                }
            }
        }

        // 检查关键模块
        const criticalModules = Object.entries(this.state.modules)
            .filter(([name, loaded]) => !loaded);

        if (criticalModules.length > 0) {
            throw new Error(`关键模块加载失败: ${criticalModules.map(([name]) => name).join(', ')}`);
        }

        console.log('✓ 所有模块初始化完成');
    },

    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onPageHidden();
            } else {
                this.onPageVisible();
            }
        });

        // 窗口大小变化
        window.addEventListener('resize', Utils.debounce(() => {
            this.onWindowResize();
        }, 250));

        // 在线状态变化
        window.addEventListener('online', () => {
            this.onOnlineStatusChange(true);
        });

        window.addEventListener('offline', () => {
            this.onOnlineStatusChange(false);
        });

        // 页面卸载前
        window.addEventListener('beforeunload', (e) => {
            this.onBeforeUnload(e);
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeyboardShortcuts(e);
        });

        console.log('✓ 事件监听器已设置');
    },

    /**
     * 应用优化
     */
    applyOptimizations() {
        // 预加载关键资源
        this.preloadCriticalResources();
        
        // 优化性能
        this.optimizePerformance();
        
        // 设置服务工作者（如果支持）
        this.setupServiceWorker();
        
        console.log('✓ 优化应用完成');
    },

    /**
     * 预加载关键资源
     */
    preloadCriticalResources() {
        // 预加载字体
        const fontLinks = [
            'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
        ];

        fontLinks.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = href;
            document.head.appendChild(link);
        });
    },

    /**
     * 优化性能
     */
    optimizePerformance() {
        // 图像懒加载
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }

        // 启用CSS GPU加速
        document.documentElement.style.transform = 'translateZ(0)';
    },

    /**
     * 设置服务工作者
     */
    setupServiceWorker() {
        if ('serviceWorker' in navigator && this.config.enableCaching) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker 注册成功:', registration);
                })
                .catch(error => {
                    console.warn('Service Worker 注册失败:', error);
                });
        }
    },

    /**
     * 完成初始化
     */
    completeInitialization() {
        this.state.initialized = true;
        this.state.performance.initTime = Date.now() - this.state.performance.startTime;
        
        // 初始化UI控制器
        if (window.UIController) {
            window.UIController.init();
        }
        
        // 隐藏加载屏幕
        this.hideLoadingScreen();
        
        // 显示欢迎消息
        this.showWelcomeMessage();
        
        // 检查更新
        if (this.config.updateCheck) {
            this.checkForUpdates();
        }
        
        // 性能报告
        this.reportPerformance();
        
        console.log(`✓ 应用初始化完成，耗时 ${this.state.performance.initTime}ms`);
    },

    /**
     * 显示欢迎消息
     */
    showWelcomeMessage() {
        const isFirstVisit = !Utils.getStorage('hasVisited', false);
        
        if (isFirstVisit) {
            Utils.setStorage('hasVisited', true);
            
            if (window.UIManager) {
                setTimeout(() => {
                    window.UIManager.showNotification(
                        'info',
                        '欢迎使用Outlook注册助手',
                        '这是一个智能的邮箱注册工具，支持多种策略来提高注册成功率。点击"智能填充"按钮可以快速填写表单。',
                        8000
                    );
                }, 1000);
            }
        }
    },

    /**
     * 检查更新
     */
    async checkForUpdates() {
        try {
            // 这里可以实现真实的更新检查逻辑
            // const updateInfo = await fetch('/api/version').then(r => r.json());
            // if (updateInfo.version > this.version) {
            //     this.showUpdateNotification(updateInfo);
            // }
        } catch (error) {
            console.warn('更新检查失败:', error);
        }
    },

    /**
     * 性能报告
     */
    reportPerformance() {
        if (this.config.debug) {
            const performance = window.performance;
            const timing = performance.timing;
            
            const metrics = {
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                loadComplete: timing.loadEventEnd - timing.navigationStart,
                initTime: this.state.performance.initTime,
                memoryUsage: performance.memory ? {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
                } : null
            };
            
            console.table(metrics);
        }
    },

    /**
     * 页面隐藏时的处理
     */
    onPageHidden() {
        // 保存当前状态
        if (this.config.autoSave) {
            this.saveApplicationState();
        }
    },

    /**
     * 页面可见时的处理
     */
    onPageVisible() {
        // 检查连接状态
        if (window.UIManager) {
            window.UIManager.updateConnectionStatus();
        }
    },

    /**
     * 窗口大小变化处理
     */
    onWindowResize() {
        // 更新响应式组件
        this.updateResponsiveComponents();
    },

    /**
     * 在线状态变化处理
     * @param {boolean} isOnline - 是否在线
     */
    onOnlineStatusChange(isOnline) {
        if (window.UIManager) {
            window.UIManager.updateConnectionStatus();
            
            if (isOnline) {
                window.UIManager.showNotification('success', '网络已连接', '您现在可以正常使用所有功能');
            } else {
                window.UIManager.showNotification('warning', '网络已断开', '请检查网络连接');
            }
        }
    },

    /**
     * 页面卸载前处理
     * @param {Event} e - 事件对象
     */
    onBeforeUnload(e) {
        // 如果有正在进行的注册，警告用户
        if (window.OutlookRegistration && window.OutlookRegistration.state.registrationInProgress) {
            e.preventDefault();
            e.returnValue = '注册正在进行中，确定要离开吗？';
            return e.returnValue;
        }
        
        // 保存应用状态
        this.saveApplicationState();
    },

    /**
     * 处理全局键盘快捷键
     * @param {KeyboardEvent} e - 键盘事件
     */
    handleGlobalKeyboardShortcuts(e) {
        // Ctrl/Cmd + Shift + D: 切换调试模式
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            this.toggleDebugMode();
        }
        
        // Ctrl/Cmd + Shift + R: 重置应用
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
            e.preventDefault();
            this.resetApplication();
        }
        
        // F12: 显示调试信息
        if (e.key === 'F12' && this.config.debug) {
            e.preventDefault();
            this.showDebugInfo();
        }
    },

    /**
     * 切换调试模式
     */
    toggleDebugMode() {
        this.config.debug = !this.config.debug;
        this.saveConfiguration();
        
        if (window.UIManager) {
            window.UIManager.showNotification(
                'info',
                `调试模式已${this.config.debug ? '开启' : '关闭'}`,
                this.config.debug ? '现在可以查看详细的调试信息' : '调试信息已隐藏'
            );
        }
        
        console.log(`调试模式: ${this.config.debug ? 'ON' : 'OFF'}`);
    },

    /**
     * 重置应用
     */
    resetApplication() {
        if (confirm('确定要重置应用吗？这将清除所有数据。')) {
            try {
                // 清除所有存储
                localStorage.clear();
                sessionStorage.clear();
                
                // 重新加载页面
                window.location.reload();
            } catch (error) {
                this.errorHandler.handle(error, 'Reset Application');
            }
        }
    },

    /**
     * 显示调试信息
     */
    showDebugInfo() {
        const debugInfo = {
            version: this.version,
            state: this.state,
            config: this.config,
            performance: this.state.performance,
            modules: this.state.modules,
            errors: this.errorHandler.errors.slice(-5),
            browser: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine
            },
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth,
                pixelDepth: screen.pixelDepth
            }
        };
        
        console.group('🐛 调试信息');
        console.table(debugInfo);
        console.groupEnd();
        
        // 复制到剪贴板
        if (navigator.clipboard) {
            navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2))
                .then(() => {
                    if (window.UIManager) {
                        window.UIManager.showNotification('success', '调试信息已复制', '可以粘贴到开发者工具或报告中');
                    }
                })
                .catch(console.error);
        }
    },

    /**
     * 保存应用状态
     */
    saveApplicationState() {
        try {
            const state = {
                timestamp: Date.now(),
                config: this.config,
                performance: this.state.performance,
                errors: this.errorHandler.errors
            };
            
            Utils.setStorage('appState', state);
        } catch (error) {
            console.warn('保存应用状态失败:', error);
        }
    },

    /**
     * 恢复应用状态
     */
    restoreApplicationState() {
        try {
            const state = Utils.getStorage('appState', null);
            if (state && Date.now() - state.timestamp < 24 * 60 * 60 * 1000) { // 24小时内有效
                this.config = { ...this.config, ...state.config };
                this.errorHandler.errors = state.errors || [];
            }
        } catch (error) {
            console.warn('恢复应用状态失败:', error);
        }
    },

    /**
     * 更新响应式组件
     */
    updateResponsiveComponents() {
        // 这里可以添加响应式组件的更新逻辑
        const width = window.innerWidth;
        const isMobile = width < 768;
        
        document.documentElement.classList.toggle('mobile-view', isMobile);
        document.documentElement.classList.toggle('desktop-view', !isMobile);
    },

    /**
     * 显示致命错误
     * @param {string} message - 错误消息
     */
    showFatalError(message) {
        const errorHtml = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #ff6b6b;
                color: white;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                font-family: Arial, sans-serif;
            ">
                <h1>😵 应用错误</h1>
                <p style="text-align: center; max-width: 600px; margin: 20px;">${message}</p>
                <button onclick="window.location.reload()" style="
                    background: white;
                    color: #ff6b6b;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                ">刷新页面</button>
            </div>
        `;
        
        document.body.innerHTML = errorHtml;
    },

    /**
     * 获取应用信息
     * @returns {object} 应用信息
     */
    getAppInfo() {
        return {
            name: this.name,
            version: this.version,
            author: this.author,
            initialized: this.state.initialized,
            modules: this.state.modules,
            performance: this.state.performance
        };
    }
};

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    OutlookHelper.init();
});

// 导出主应用对象
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OutlookHelper;
} else {
    window.OutlookHelper = OutlookHelper;
}
