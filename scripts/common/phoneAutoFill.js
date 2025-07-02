/* 
** Description: 手机号自动填充工具
** Author: AI Assistant
*/

/* 
** Description: 从存储中获取用户手机号并自动填充
** Parameters: [concertId] {string}: 演唱会ID，用于获取用户数据
** Return: {Promise<boolean>}: 是否成功填充
*/
async function autoFillPhoneNumber(concertId) {
    try {
        let frame = theFrame();
        // 从存储中获取演唱会数据
        let concertData = await get_stored_value(concertId);
        
        if (!concertData || !concertData.phone) {
            console.log('📱 未找到手机号数据');
            return false;
        }
        
        // 查找可能的手机号输入框
        const phoneSelectors = [
            '#phone',
            '#tel',
            'input[name="phone"]',
            'input[name="tel"]',
            'input[type="tel"]',
            'input[name="mobile"]',
            'input[name="cellphone"]',
            '.phone-input',
            '.tel-input'
        ];
        
        let phoneInput = null;
        
        // 尝试找到手机号输入框
        for (let selector of phoneSelectors) {
            phoneInput = frame.document.querySelector(selector);
            if (phoneInput) {
                console.log('📱 找到手机号输入框:', selector);
                break;
            }
        }
        
        if (!phoneInput) {
            console.log('📱 未找到手机号输入框');
            return false;
        }
        
        // 填充手机号
        phoneInput.value = concertData.phone;
        
        // 触发相关事件
        phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
        phoneInput.dispatchEvent(new Event('change', { bubbles: true }));
        
        console.log('✅ 成功自动填充手机号:', concertData.phone);
        return true;
        
    } catch (error) {
        console.error('❌ 自动填充手机号失败:', error);
        return false;
    }
}
