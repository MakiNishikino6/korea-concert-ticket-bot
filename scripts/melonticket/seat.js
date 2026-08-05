async function sleep(t) {
    return await new Promise(resolve => setTimeout(resolve, t));
}

const { parseSectionInput, parseSectionTarget } = globalThis.SectionTargetUtils;
const { selectTarget, trySeatTargets } = globalThis.MelonSeatSelection;

function theFrame() {
    if (window._theFrameInstance == null) {
      window._theFrameInstance = document.getElementById('oneStopFrame').contentWindow;
    }
  
    return window._theFrameInstance;
}

function getConcertId() {
    return document.getElementById("prodId").value;
}

// 添加播放音频函数
function playAudio() {
    try {
        // 方法1: 使用系统通知音效 (推荐)
        // playSystemNotification();
        
        // 方法2: 如果需要自定义音频，尝试创建音频上下文
        playCustomAudio();
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
        audio.volume = 1;
        
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
    await sleep(750);
    let frame = theFrame();
    let canvas = frame.document.getElementById("ez_canvas");
    if (!canvas) {
        return false;
    }

    let seat = canvas.getElementsByTagName("rect");
    const nextButton = frame.document.getElementById("nextTicketSelection");
    if (!nextButton) {
        return false;
    }

    console.log(seat);
    for (let i = 0; i < seat.length; i++) {
        let fillColor = seat[i].getAttribute("fill");
    
        // Check if fill color is different from #DDDDDD or none
        if (fillColor !== "#DDDDDD" && fillColor !== "none") {
            console.log("Rect with different fill color found:", seat[i]);
            var clickEvent = new Event('click', { bubbles: true });

            seat[i].dispatchEvent(clickEvent);
            nextButton.click();
            
            return true;
        }
    }
    return false;
}

async function checkCaptchaFinish() {
    while (true) {
        const certification = document.getElementById("certification");
        if (!certification || certification.style.display == "none") {
            break;
        }
        await sleep(1000);
    }

    let frame = theFrame();
    await sleep(500);
    frame.document.getElementById("nextTicketSelection")?.click();
}

async function reload() {
    let frame = theFrame();
    const reloadButton = frame.document.getElementById("btnReloadSchedule");
    if (!reloadButton) {
        await sleep(1000);
        return false;
    }

    reloadButton.click();
    await sleep(750);
    return true;
}

async function searchSeat(data) {
    const targets = parseSectionInput(data?.section)
        .map(parseSectionTarget)
        .filter(Boolean);

    if (targets.length === 0) {
        console.error("No valid Melon seat targets configured");
        return false;
    }

    while (true) {
        const matchedTarget = await trySeatTargets(
            targets,
            async target => {
                const selected = await selectTarget(theFrame().document, target);
                if (!selected) {
                    console.warn("Melon seat target not found", target);
                }
                return selected;
            },
            findSeat,
        );

        if (matchedTarget) {
            await checkCaptchaFinish();
            return true;
        }

        await reload();
    }
}

async function fillInfoAndProceed() {
    try {
        let frame = theFrame();
        console.log("click next payment");
        frame.document.getElementById("nextPayment").click();
        await sleep(1000);
        frame = theFrame();
        let concertId = getConcertId();
        sessionStorage.setItem('concertId', concertId);
        await autoFillPhoneNumber(concertId);
        frame.document.getElementById("payMethodCode001").click();
        await sleep(1000);
        frame = theFrame();
        let cardSelect = frame.document.getElementById("cardCode");
        cardSelect.value = "FOREIGN_CHINABANK";
        cardSelect.dispatchEvent(new Event('change', { bubbles: true }));
        frame.document.getElementById("chkAgreeAll").click();
        // await sleep(1000);
        // frame.document.getElementById("btnFinalPayment").click();
        // await sleep(17000);
        // frame = theFrame();
        // frame.document.getElementById("all").click();
        // frame.document.getElementById("cardCode20").click();
        // await sleep(1000);
        // frame.document.getElementById("CardBtn").click();
        // await sleep(3000);
        // frame = theFrame();
        // frame.document.getElementById("UnionPayBtn").click();
    } catch (error) {
        console.error(error);
    }
}

async function waitFirstLoad() {
    let concertId = getConcertId();
    let data = await get_stored_value(concertId);
    await sleep(1000);
    const seatFound = await searchSeat(data);
    if (!seatFound) {
        return;
    }

    playAudio();
    await sleep(5000);
    await fillInfoAndProceed();
}

waitFirstLoad();
