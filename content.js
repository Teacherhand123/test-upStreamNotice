console.log(typeof chrome !== "undefined" && typeof chrome.runtime !== "undefined");

chrome.runtime.onMessage.addListener((message) => {
    console.log("我在content.js已接受到消息")

    if (message.action === "upStreamList") {
        console.log("在contentjs", message.data)
        
        const streamArray = new Array(0)
        for (const data of message.data.data.list) {
            if (data.live_status === 1) { // 处于直播状态
                streamArray.push({
                    "face": data.face,
                    "title": data.title,
                    "uname": data.uname,
                    "roomid": data.roomid
                })
            }
        }

        console.log(streamArray)

        const html = document.querySelector("html")
        const toast = document.createElement("div")

        if (html) {
            console.log("正在加载显示div")
            toast.id = "upstream-toast"
            // toast.style.width = window.innerWidth
            toast.style.backgroundColor = "black"
            toast.style.width = "10%"
            toast.style.border = "solid 1px #0c59a6"

            for (const elem of streamArray) {
                const child = document.createElement("div")
                child.style.marginBottom = "10px"
                const aHref = document.createElement("a")
                aHref.href = `https://live.bilibili.com/${elem.roomid}`
                aHref.target = "_blank"
                const img = document.createElement("img")
                img.style.height = "50px"
                img.style.width = "50px"
                img.src = elem.face
                img.style.borderRadius = "50%"
                const name = document.createElement("div")
                name.innerText = elem.uname
                name.style.fontSize = "15px"
                name.style.color = "#ed0780"
                name.style.fontWeight = "700"
                const title = document.createElement("div")
                title.innerText = elem.title
                title.style.fontSize = "15px"

                aHref.appendChild(img)
                child.appendChild(aHref)
                child.appendChild(title)
                child.appendChild(name)
                toast.appendChild(child)
            }

            html.appendChild(toast)

            setTimeout(() => {
                toast.style.top = "100px"
                toast.style.zIndex = 100
            }, 100)

            setTimeout(() => {
                toast.style.top = "-50px"
                setTimeout(() => toast.remove(), 500)
            }, 16000)
        }
    }
})