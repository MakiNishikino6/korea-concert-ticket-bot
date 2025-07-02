import { get_stored_value, store_value, delete_value } from "../module/storage.js";

// 返回按钮点击事件
window.onclick = function(event) {
    const target = event.target;
    if (target.classList.contains("close")) {
        window.history.back();
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', async function() {
    // 获取要编辑的数据
    const editingData = await get_stored_value("editingConcertItem");
    
    if (!editingData || !editingData.data) {
        console.error("没有找到要编辑的演唱会信息");
        window.history.back();
        return;
    }

    // 预填充表单数据
    await fillFormWithData(editingData.data);

    // 处理表单提交
    const form = document.querySelector('form');
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        await handleFormSubmit(form, editingData);
    });
});

// 预填充表单数据
async function fillFormWithData(data) {
    // 等待includeHTML加载完成
    await new Promise(resolve => {
        const checkForm = () => {
            const nameInput = document.getElementById('concert-name');
            if (nameInput) {
                resolve();
            } else {
                setTimeout(checkForm, 100);
            }
        };
        checkForm();
    });

    // 填充各个字段
    document.getElementById('concert-name').value = data['concert-name'] || '';
    document.getElementById('concert-id').value = data['concert-id'] || '';
    document.getElementById('phone').value = data.phone || '';
    document.getElementById('ticket').value = data.ticket || '1';
    document.getElementById('date').value = data.date || '';
    document.getElementById('time').value = data.time || '';
    
    // 处理section数组
    if (Array.isArray(data.section)) {
        document.getElementById('section').value = data.section.join(', ');
    } else {
        document.getElementById('section').value = data.section || '';
    }
}

// 处理表单提交
async function handleFormSubmit(form, editingData) {
    const submitButton = form.getElementsByTagName("button")[0];
    submitButton.disabled = true;
    submitButton.textContent = "更新中...";

    try {
        // 收集表单数据
        let updatedData = {};
        const formData = new FormData(form);
        
        for (const [key, value] of formData.entries()) {
            updatedData[key] = value;
        }
        
        // 处理section数据
        updatedData["section"] = updatedData["section"].split(",").map(s => s.trim());
        updatedData["platform"] = submitButton.id;

        // 获取当前的autoBooking数组
        let autoBooking = await get_stored_value("autoBooking") || [];
        
        // 如果concert-id发生了变化，需要删除旧的存储
        const oldConcertId = editingData.data['concert-id'];
        const newConcertId = updatedData['concert-id'];
        
        if (oldConcertId !== newConcertId) {
            delete_value(oldConcertId);
        }
        
        // 更新数组中的数据
        autoBooking[editingData.index] = updatedData;
        
        // 存储更新后的数据
        store_value("autoBooking", autoBooking);
        store_value(newConcertId, updatedData);
        
        // 清理临时存储
        delete_value("editingConcertItem");
        
        // 返回主页
        window.location.href = "../mainPage/index.html";
        
    } catch (error) {
        console.error("更新演唱会信息失败:", error);
        alert("更新失败，请重试");
        
        submitButton.disabled = false;
        submitButton.textContent = "更新信息";
    }
} 