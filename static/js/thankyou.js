import { fetchAPI, setLoading, stopLoading } from "./tool.js";
import { initCommon, user } from "./common.js";

// * -------------- *
// |     model      |
// * -------------- *
let order = null;

async function getOrder() {
    // 取得訂單編號
    const windowSearch = window.location.search.split(/[?=]+/);
    const indexOfNumber = windowSearch.findIndex((element) => element == "number");
    // 取得訂單資訊
    const result = await fetchAPI(`/order/${windowSearch[indexOfNumber + 1]}`, { method: "GET" });
    // API 回傳失敗
    if(result.error) {
        return;
    }
    // 取得訂單資訊
    order = result.data;
}

// * -------------- *
// |      view      |
// * -------------- *
const shoppingBagContainer = document.querySelector(".shopping-bag__container");
const orderNumber = document.querySelector("#order-number");

function renderOrder() {
    if(order) {
        shoppingBagContainer.classList.add("shopping-bag--success");
        shoppingBagContainer.classList.remove("shopping-bag--error");
        // 訂單編號顯示在畫面上
        orderNumber.textContent = order.number;
    } else {
        shoppingBagContainer.classList.remove("shopping-bag--success");
        shoppingBagContainer.classList.add("shopping-bag--error");
    }
}

// * -------------- *
// |   controller   |
// * -------------- *
async function initThankyou() {
    setLoading(80, 2);

    await initCommon();
    if(!user) {
        stopLoading();
        // 使用者未登入，直接導向首頁
        window.location.assign("/");
        return;
    }

    await getOrder();
    renderOrder();

    stopLoading();
    document.querySelector(".main").classList.remove("beforeLoad");
}

window.addEventListener("load", (e) => {
    initThankyou();
});