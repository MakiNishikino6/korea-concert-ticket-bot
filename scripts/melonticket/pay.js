console.log('🏦 银联支付页面脚本已加载');

// 常见的银行卡号输入框选择器
const CARD_SELECTORS = [
    '#cardNo',
    '#card_no',
    '#cardNumber',
    '#card_number',
    'input[name="cardNo"]',
    'input[name="card_no"]',
    'input[name="cardNumber"]',
    'input[name="card_number"]',
    'input[placeholder*="卡号"]',
    'input[placeholder*="Card"]',
    'input[placeholder*="card"]',
    'input[type="text"][maxlength="19"]', // 银行卡号通常19位
    'input[type="text"][maxlength="16"]'  // 有些16位
];

/* 
** Description: 等待元素出现
** Parameters: [selector] {string}: 元素选择器
**             [timeout] {number}: 超时时间(毫秒)
** Return: {Promise<Element|null>}: 找到的元素或null
*/
async function waitForElement(selector, timeout = 10000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
        const element = document.querySelector(selector);
        if (element) {
            console.log(`✅ 找到元素: ${selector}`);
            return element;
        }
        await sleep(200);
    }
    
    console.log(`❌ 等待元素超时: ${selector}`);
    return null;
}

/* 
** Description: 模拟真实用户输入
** Parameters: [element] {HTMLElement}: 输入框元素
**             [value] {string}: 要输入的值
**             [delay] {number}: 每个字符间的延迟
** Return: {Promise<boolean>}: 是否成功输入
*/
async function simulateUserInput(element, value, delay = 100) {
    try {
        // 聚焦元素
        element.focus();
        
        // 清空现有内容
        element.value = '';
        element.dispatchEvent(new Event('input', { bubbles: true }));
        
        // 逐字符输入
        for (let i = 0; i < value.length; i++) {
            element.value += value[i];
            
            // 触发输入事件
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('keyup', { bubbles: true }));
            
            // 等待
            await sleep(delay);
        }
        
        // 完成输入
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new Event('blur', { bubbles: true }));
        
        console.log('✅ 成功模拟输入银行卡号');
        return true;
        
    } catch (error) {
        console.error('❌ 模拟输入失败:', error);
        return false;
    }
}

/* 
** Description: 从各种途径获取concert ID
** Return: {string|null}: concert ID或null
*/
function getConcertIdFromStorage() {
    try {
        // 尝试从sessionStorage获取
        let concertId = sessionStorage.getItem('concertId') || sessionStorage.getItem('concert_id');
        if (concertId) {
            console.log('🎫 从sessionStorage获取到concert ID:', concertId);
            return concertId;
        }
        
        // 尝试从localStorage获取
        concertId = localStorage.getItem('concertId') || localStorage.getItem('concert_id');
        if (concertId) {
            console.log('🎫 从localStorage获取到concert ID:', concertId);
            return concertId;
        }
        
        // 尝试从URL获取
        const urlParams = new URLSearchParams(window.location.search);
        concertId = urlParams.get('concertId') || urlParams.get('concert_id');
        if (concertId) {
            console.log('🎫 从URL获取到concert ID:', concertId);
            return concertId;
        }
        
        console.log('⚠️ 未找到concert ID');
        return null;
        
    } catch (error) {
        console.error('❌ 获取concert ID失败:', error);
        return null;
    }
}

/* 
** Description: 自动填充银行卡号
** Return: {Promise<boolean>}: 是否成功填充
*/
async function autoFillCardNumber() {
    try {
        console.log('💳 开始自动填充银行卡号...');
        
        // 获取concert ID
        let concertId = getConcertIdFromStorage();
        
        if (!concertId) {
            console.log('❌ 无法获取concert ID，无法填充银行卡号');
            return false;
        }
        
        // 从存储获取演唱会数据
        const concertData = await get_stored_value(concertId);
        
        if (!concertData || !concertData['card-number']) {
            console.log('❌ 未找到保存的银行卡号数据');
            return false;
        }
        
        const cardNumber = concertData['card-number'];
        console.log('💳 找到保存的银行卡号');
        
        // 尝试找到银行卡号输入框
        let cardInput = null;
        
        for (const selector of CARD_SELECTORS) {
            cardInput = await waitForElement(selector, 2000);
            if (cardInput) {
                console.log(`💳 找到银行卡号输入框: ${selector}`);
                break;
            }
        }
        
        if (!cardInput) {
            console.log('❌ 未找到银行卡号输入框');
            return false;
        }
        
        // 模拟用户输入
        const success = await simulateUserInput(cardInput, cardNumber, 80);
        
        if (success) {
            console.log('✅ 银行卡号自动填充成功');
            return true;
        } else {
            console.log('❌ 银行卡号自动填充失败');
            return false;
        }
        
    } catch (error) {
        console.error('❌ 自动填充银行卡号出错:', error);
        return false;
    }
}

/* 
** Description: 等待页面加载完成后执行
*/
async function waitForPageLoad() {
    // 等待DOM加载完成
    if (document.readyState === 'loading') {
        await new Promise(resolve => {
            document.addEventListener('DOMContentLoaded', resolve);
        });
    }
    
    // 额外等待，确保动态内容加载完成
    await sleep(1000);
}

/* 
** Description: 主函数
*/
async function main() {
    try {
        console.log('🚀 银联支付页面脚本开始执行...');
        
        // 等待页面加载
        await waitForPageLoad();
        
        // 等待一段时间让页面完全渲染
        await sleep(1500);
        
        // 自动填充银行卡号
        await autoFillCardNumber();
        
        console.log('✅ 银联支付页面处理完成');
        
    } catch (error) {
        console.error('❌ 银联支付页面脚本执行失败:', error);
    }
}

// 页面加载时自动执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}

// 也监听window load事件，作为备用
window.addEventListener('load', () => {
    setTimeout(main, 500);
});