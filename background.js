async function getCookies() {
    return new Promise((resolve, reject) => {
        chrome.cookies.getAll({ domain: ".bilibili.com" }, (cookies) => {
            if (cookies.length === 0) {
                console.log("null")
                resolve("")
            } else {
                const resList = cookies.map((item) => `${item.name}=${item.value}`);
                resolve(resList.join("; "))
            }
        });
    });
}

async function getUpStream() {
    chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
        console.log(tabs[0].url)
        if (tabs.length > 0) {
            const url = tabs[0].url
            console.log(url)

            if (url.includes("bilibili.com")) {
                const cookies = await getCookies();
                if (cookies === "") {
                    return
                }
                const res = await fetch("https://api.live.bilibili.com/xlive/web-ucenter/user/following", {
                    method: "GET",
                    headers: {
                        'Referer': "https://www.bilibili.com/",
                        'Cookie': cookies,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
                    },
                })

                const resJson = await res.json()
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    chrome.tabs.sendMessage(tabs[0].id, { action: "upStreamList", data: resJson })
                })
            }
        }
    })
}

// 创建定时任务，每 5 到 7 分钟执行一次
function setRandomAlarm() {
    const delayInMinutes = Math.floor(Math.random() * 3 + 5); // 5-8 分钟随机
    console.log(`设置定时任务：${delayInMinutes} 分钟后执行`);
    
    chrome.alarms.create("myPeriodicTask", {
        delayInMinutes: delayInMinutes, 
        periodInMinutes: delayInMinutes // 设置下一次的随机时间
    });
}

// 监听定时器触发
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "myPeriodicTask") {
        console.log("定时任务执行！");
        getUpStream();
    }
});




// 插件启动时，设置定时任务
chrome.runtime.onInstalled.addListener(() => {
    setRandomAlarm();
});

// 插件激活时，重新设置任务（防止 Service Worker 停止）
chrome.runtime.onStartup.addListener(() => {
    setRandomAlarm();
});