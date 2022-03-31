export async function fetchAPI(url, methods="GET", headers={}, body=null, getAuthToken=false) {
    if(body) {
        body = JSON.stringify(body);
    }
    // console.log("fetch url:", url, methods);
    const response = await fetch(
        `/api${url}`,
        {
            method: methods,
            headers: headers,
            body: body
        }
    );
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
                    if(hasLoading && contentLength > 0) {
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

const loadingLimit = 80;
let groupSize = 0;
let intervalId = null;
let hasLoading = false;

export function setLoading(size=1) {
    hasLoading = true;
    groupSize = size;
    // 若無 loading 進度條，則新增
    let loading = document.querySelector(".loading-banner")
    if(loading == null) {
        loading = document.createElement("div");
        loading.classList.add("loading-banner");
        loading.classList.remove("loading-banner--stop");
        document.body.appendChild(loading);
    }
    // width 設定為 0%
    loading.style.width = "0%";

    // set timer 去調整進度條 width
    intervalId = window.setInterval(() => {
        const width = setloadingWidth();
    }, 50);
    return intervalId;
}
function setloadingWidth(addWidthPercent=0) {
    const loading = document.querySelector(".loading-banner");
    // 取得進度條 width
    const width = loading.style.width.split("%");
    // 若加上預計增加的 addWidthPercent 小於 width，保持現在 width
    if(width[0] + addWidthPercent * (loadingLimit / groupSize) < width[0]++) {
        width[0]++;
    } else {
        width[0] += addWidthPercent * (loadingLimit / groupSize);
    }
    loading.style.width = width[0] + "%";
    // 若進度條長度超過 limit，則 clear timer
    if(width[0] >= loadingLimit) {
        window.clearInterval(intervalId);
    }
}
export function stopLoading() {
    // clear timer
    window.clearInterval(intervalId);
    // 讓進度條 width 到 100%
    const loading = document.querySelector(".loading-banner");
    loading.classList.add("loading-banner--stop");
    loading.style.width = "100%";
}