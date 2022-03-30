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