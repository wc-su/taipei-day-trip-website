export async function fetchAPI(url, options=null, getAuthToken=false) {
    // console.log("fetch url:", url, options);
    const response = await fetch(`/api${url}`, options);
    const contentLength = response.headers.get('content-length') || 0;
    let loadedLength = 0;
    const reader = response.body.getReader();
    const stream = new ReadableStream({
        start(controller) {
            function push() {
                reader.read().then(({ value, done }) => {
                    if (done) {
                        controller.close();
                        return;
                    }
                    controller.enqueue(value);
                    loadedLength += value.length;
                    // 若有取得總長，則依讀取進度設定進度條 width
                    if(loadingInfo && contentLength > 0) {
                        setloadingWidth(loadedLength / contentLength);
                    }
                    push();
                });
            };
            push();
        }
    });
    return new Response(stream).json();
}

export function formatDate(date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

let loadingInfo = null;

export function setLoading(widthLimit, groupSize=1) {
    // 若無 loading 進度條，則新增
    let loading = document.querySelector(".loading-banner");
    if(loading == null) {
        loading = document.createElement("div");
        loading.classList.add("loading-banner");
        document.body.appendChild(loading);
    } else {
        loading.classList.remove("loading-banner--stop");
    }
    // width 設定為 0%
    loading.style.width = "0%";
    
    // set timer 去調整進度條 width
    const intervalId = window.setInterval(() => {
        setloadingWidth();
    }, 50);

    loadingInfo = {
        id: intervalId,
        element: loading,
        groupSize: groupSize,
        widthLimit: widthLimit
    }
}
function setloadingWidth(addWidthPercent=0) {
    if(loadingInfo) {
        // 取得進度條 width
        const width = loadingInfo.element.style.width.split("%");
        // 若加上預計增加的 addWidthPercent 小於 width，保持現在 width
        const addWidth = addWidthPercent * (loadingInfo.widthLimit / loadingInfo.groupSize);
        if(width[0] + addWidth < width[0]++) {
            width[0]++;
        } else {
            width[0] += addWidth;
        }
        loadingInfo.element.style.width = width[0] + "%";
        // 若進度條長度超過 limit，則 clear timer
        if(width[0] >= loadingInfo.widthLimit) {
            window.clearInterval(loadingInfo.id);
        }
    }
}
export function stopLoading() {
    if(loadingInfo) {
        // clear timer
        window.clearInterval(loadingInfo.intervalId);
        // 讓進度條 width 到 100%
        loadingInfo.element.classList.add("loading-banner--stop");
        loadingInfo.element.style.width = "100%";
        loadingInfo = null;
    }
}