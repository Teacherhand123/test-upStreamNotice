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

const testCookie = "l=v; Hm_lvt_1fc3e30d1b8153b10b66443c78dcb9b1=1737024019; buvid4=17E6947B-B67F-303D-E32F-FB6C61906A4579832-022081819-OfYXh40jerG5MRDBvElKqw%3D%3D; buvid_fp_plain=undefined; is-2022-channel=1; header_theme_version=CLOSE; enable_web_push=DISABLE; DedeUserID=36722581; DedeUserID__ckMd5=0f872f959b0cf89d; FEED_LIVE_VERSION=V_WATCHLATER_PIP_WINDOW2; Hm_lvt_a69e400ba5d439df060bf330cd092c0d=1716812918; Hm_lvt_6ab26a3edfb92b96f655b43a89b9ca70=1716812918; Hm_lvt_989d491b1740e624d8db96aa8e9d44c0=1717486974; buvid3=B926399B-00C3-53D7-C9DD-BA5DAFC8817A75202infoc; b_nut=1725199576; _uuid=52B3EC103-9376-3B4B-CF8B-610BACF2B1D10A20472infoc; hit-dyn-v2=1; LIVE_BUVID=AUTO9417350443465587; rpdid=|(JY)Juk~Rl~0J'u~R|Ju~RJR; fingerprint=1fb69a86ebea4589b182f84cb128b6cb; buvid_fp=1fb69a86ebea4589b182f84cb128b6cb; enable_feed_channel=ENABLE; bili_ticket=eyJhbGciOiJIUzI1NiIsImtpZCI6InMwMyIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDE4NjIwOTcsImlhdCI6MTc0MTYwMjgzNywicGx0IjotMX0.gnktDJpX7qOSiNq2rPlBjLW6eT_l00VCpe0ZRSPmm4U; bili_ticket_expires=1741862037; SESSDATA=2c39d0c6%2C1757154899%2C895ec%2A32CjB8VEFhwAx1Aw2SsGuii7ZPZabAPCCRC0bYYiK_gLJgluXJ6LsV6gVwekg3rWTQZc8SVjczdXUxZ2JoMF9VdElZS3I2RDVXNmc3RWU1bmVlUWZzZnROMl9kdnFONHFKQXZSVFRLeGRBWjdkdWtGV2tZRGlyOFp3VGZfaGNQRFhtcVdDRVYyVktBIIEC; bili_jct=618921c3f6b48d741f54d3eae42e1bc6; sid=7v3u1pr0; CURRENT_FNVAL=4048; home_feed_column=5; browser_resolution=2048-1111; bp_t_offset_36722581=1043477749265596416; b_lsid=CFF16318_1958CD928FE; bmg_af_switch=1; bmg_src_def_domain=i1.hdslb.com; theme_style=light; GIFT_BLOCK_COOKIE=GIFT_BLOCK_COOKIE; PVID=3; bmg_af_switch=1; bmg_src_def_domain=i1.hdslb.com; theme_style=light; Hm_lvt_8a6e55dbd2870f0f5bc9194cddf32a02=1741157626,1741226222,1741248866,1741825097; Hm_lpvt_8a6e55dbd2870f0f5bc9194cddf32a02=1741825097; HMACCOUNT=E5C2230967F8658F"

async function getUpStream() {
    chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
        console.log("tabs:", tabs)
        if (tabs.length > 0) {
            const url = tabs[0].url
            console.log(url)

            if (url.includes("bilibili.com")) {
                const cookies = await getCookies();
                if (cookies === "") return

                console.log(cookies)
                const res = await fetch("https://api.live.bilibili.com/xlive/web-ucenter/user/following", {
                    method: "GET",
                    headers: {
                        'Referer': "https://www.bilibili.com/",
                        'Cookie': cookies,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
                    },
                })

                const resJson = await res.json()
                console.log(resJson)
                chrome.tabs.sendMessage(tabs[0].id, {action: "ping"}, async (response) => {
                    // 出现错误，content.js 没加载
                    await setTimeout(() => {
                        console.log("开始发送resJson")
                        chrome.tabs.sendMessage(tabs[0].id, { action: "upStreamList", data: resJson })
                    }, 500)
                })
            }
        }
    })
}

// 创建定时任务，每 5 到 7 分钟执行一次
function setRandomAlarm() {
    const delayInMinutes = Math.floor(Math.random() * 2) + 1; // 1-2 分钟随机
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

        // 重新设置定时任务，防止 Chrome 取消周期任务
        setRandomAlarm();
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

