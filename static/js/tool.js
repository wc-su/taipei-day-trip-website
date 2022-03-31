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
                    // console.log(`Downloaded ${loadedLength} of ${contentLength} (${(loadedLength / contentLength * 100).toFixed(2)}%)`);
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
    const loading = document.createElement("div");
    loading.classList.add("loading-banner");
    loading.style.width = "0%";
    document.body.appendChild(loading);

    intervalId = window.setInterval(() => {
        const width = setloadingWidth();
    }, 50);
    return intervalId;
}
function setloadingWidth(addWidthPercent=0) {
    const loading = document.querySelector(".loading-banner");
    const width = loading.style.width.split("%");

    if(width[0] + addWidthPercent * (loadingLimit / groupSize) < width[0]++) {
        width[0]++;
    } else {
        width[0] += addWidthPercent * (loadingLimit / groupSize);
    }
    loading.style.width = width[0] + "%";

    if(width[0] >= loadingLimit) {
        window.clearInterval(intervalId);
    }
}
export function stopLoading() {
    window.clearInterval(intervalId);
    const loading = document.querySelector(".loading-banner");
    loading.classList.add("loading-banner--stop");
    loading.style.width = "100%";
}