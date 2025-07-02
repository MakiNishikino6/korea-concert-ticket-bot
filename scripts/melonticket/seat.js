async function sleep(t) {
    return await new Promise(resolve => setTimeout(resolve, t));
}

function theFrame() {
    if (window._theFrameInstance == null) {
      window._theFrameInstance = document.getElementById('oneStopFrame').contentWindow;
    }
  
    return window._theFrameInstance;
}

function getConcertId() {
    return document.getElementById("prodId").value;
}

function openEverySection() {
    let frame = theFrame();
    let section = frame.document.getElementsByClassName("seat_name");
    console.log(section);
    for (let i = 0; i < section.length; i++) {
        section[i].parentElement.click();
    }
}

function clickOnArea(area) {
    let frame = theFrame();
    let section = frame.document.getElementsByClassName("area_tit");
    for (let i = 0; i < section.length; i++) {
        let reg = new RegExp(area + "\$","g");
        if (section[i].innerHTML.match(reg)) {
            section[i].parentElement.click();
            return;
        }
    }
}

// 添加播放音频函数
function playAudio() {
    try {
        // 方法1: 使用系统通知音效 (推荐)
        playSystemNotification();
        
        // 方法2: 如果需要自定义音频，尝试创建音频上下文
        // playCustomAudio();
    } catch (error) {
        console.log('音频播放失败:', error);
    }
}

// 系统通知音效（推荐方法）
function playSystemNotification() {
    try {
        // 使用Web Audio API创建简单的提示音
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // 设置音频参数（清脆的提示音）
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        
        console.log('系统提示音播放成功');
    } catch (error) {
        console.log('系统提示音播放失败:', error);
        // 备用方案：使用浏览器原生提示音
        try {
            // 某些浏览器支持的系统提示音
            new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyBzPLFdSEFKHzH8N2QQAoUXrTpz6JbDg1MpuDyvmwhBSyBzPLFdSEFKHzH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyBzPLFdSEFKHzH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyBzPLFdSEFKHzH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyBzPLFdSEFKHzH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyBzPLFdSEFKHzH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyBzPLFdSEFKHzH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyBzPLFdSEFKHzH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyBzPLFdSEFKHzH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyBzPLFdSEFKHzH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyBzPLFdSEFKHzH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyBzPLFdSEFKHzH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyBzPLFdSEFKHzH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyBzPLFdSEFKHzH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyBzPLFdSEFKHzH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyBzPLFd").play();
        } catch (e) {
            console.log('备用提示音也失败了:', e);
        }
    }
}

// 自定义音频播放（如果需要特定音频文件）
function playCustomAudio() {
    try {
        // 使用chrome.runtime.getURL获取扩展内文件的正确URL
        const audioUrl = chrome.runtime.getURL('assets/apple.mp3');
        const audio = new Audio(audioUrl);
        audio.volume = 0.5;
        
        // 尝试播放，如果失败则不影响主流程
        audio.play().then(() => {
            console.log('自定义音频播放成功');
        }).catch(error => {
            console.log('自定义音频播放失败:', error);
        });
    } catch (error) {
        console.log('自定义音频加载失败:', error);
    }
}

async function findSeat() {
    let frame = theFrame();
    let canvas = frame.document.getElementById("ez_canvas");
    let seat = canvas.getElementsByTagName("rect");
    console.log(seat);
    await sleep(750);
    for (let i = 0; i < seat.length; i++) {
        let fillColor = seat[i].getAttribute("fill");
    
        // Check if fill color is different from #DDDDDD or none
        if (fillColor !== "#DDDDDD" && fillColor !== "none") {
            console.log("Rect with different fill color found:", seat[i]);
            var clickEvent = new Event('click', { bubbles: true });

            seat[i].dispatchEvent(clickEvent);
            frame.document.getElementById("nextTicketSelection").click();
            
            return true;
        }
    }
    return false;
}

async function checkCaptchaFinish() {
    if (document.getElementById("certification").style.display != "none") {
        await sleep(1000);
        checkCaptchaFinish();
        return;
    }
    let frame = theFrame();
    await sleep(500);
    frame.document.getElementById("nextTicketSelection").click();

    playAudio();
    
    return;
}

async function reload() {
    let frame = theFrame();
    frame.document.getElementById("btnReloadSchedule").click();
    await sleep(750);
}

async function searchSeat(data) {
    for (sec of data.section) {
        openEverySection();
        clickOnArea(sec);
        if (await findSeat()) {
            checkCaptchaFinish();
            return;
        }
    }
    reload();
    await searchSeat(data);
}

async function waitFirstLoad() {
    let concertId = getConcertId();
    let data = await get_stored_value(concertId);
    await sleep(1000);
    searchSeat(data);
}


waitFirstLoad();