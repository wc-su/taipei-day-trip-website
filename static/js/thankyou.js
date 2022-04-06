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
const attractionImg = document.querySelector(".attraction-img");
const attractionName = document.querySelector(".attraction-name");
const attractionAddress = document.querySelector(".attraction-address");
const tripDate = document.querySelector(".trip-date");
const tripTime = document.querySelector(".trip-time");
const contactName = document.querySelector(".contact-name");
const contactEmail = document.querySelector(".contact-email");
const contactPhone = document.querySelector(".contact-phone");

function renderOrder() {
    if(order) {
        shoppingBagContainer.classList.add("shopping-bag--success");
        shoppingBagContainer.classList.remove("shopping-bag--error");
        // 訂單編號
        orderNumber.textContent = order.number;
        // 行程資訊
        attractionImg.src = order.trip.attraction.image;
        attractionName.textContent = order.trip.attraction.name;
        attractionAddress.children[0].textContent = order.trip.attraction.address;
        // 行程日期、時間
        const date = new Date(order.trip.date);
        tripDate.children[0].textContent = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDay().toString().padStart(2, '0')}`;
        if(order.trip.time == "morning") {
            tripTime.children[0].textContent = "早上 9 點到下午 2 點";
        } else {
            tripTime.children[0].textContent = "下午 2 點到晚上 8 點";
        }
        // 訂購者聯絡資訊
        contactName.children[0].textContent = order.contact.name;
        contactEmail.children[0].textContent = order.contact.email;
        contactPhone.children[0].textContent = order.contact.phone;
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