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
    const result = await response.json();
    return result
}

export function formatDate(date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}


export function setLoading() {
    const loading = document.createElement("div");
    loading.classList.add("loading-banner");
    document.body.appendChild(loading);

    let intervalId = window.setInterval(() => {
        const width = setloadingWidth(loading);
        if(width == 80) {
            window.clearInterval(intervalId);
        }
        loading.style.width = width + "%";
    }, 50);
    return intervalId;
}
function setloadingWidth(loading) {
    const width = loading.style.width.split("%");
    if(width[0] == "") {
        width[0] = 1;
    } else {
        width[0]++;
    }
    return width[0];
}
export function stopLoading(intervalId) {
    const loading = document.querySelector(".loading-banner");
    loading.classList.add("loading-banner--stop");
}