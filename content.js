chrome.runtime.onMessage.addListener((message) => {
    console.log("我在content.js已接受到消息")

    if (message.action === "upStreamList") {
        console.log("在contentjs", message.data)
        const body = document.querySelector("body")
        const toast = document.createElement("div")

        if (body) {
            toast.id = "upstream-toast"
            toast.innerHTML = `up主直播间关注列表：${message.data}`
            body.appendChild(toast)

            setTimeout(() => {
                toast.style.top = "0"
            }, 100)

            setTimeout(() => {
                toast.style.top = "-50px"
                setTimeout(() => toast.remove(), 500)
            }, 3000)
        }
    }
})