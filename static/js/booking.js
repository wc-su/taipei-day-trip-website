import { fetchAPI, setLoading, stopLoading } from "./tool.js";
import { initCommon, user } from "./common.js";
import { onSubmit } from "./tappay.js";

// * -------------- *
// |     model      |
// * -------------- *
let bookingInfo = null;

function deleteBookingInfo() {
    return fetchAPI("/booking", { method: "DELETE" });
}
async function getBookingInfo() {
    bookingInfo = await fetchAPI("/booking", { method: "GET" });
}

function postOrders(bodyData) {
    return fetchAPI(
        "/orders",
        {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(bodyData)
        }
    );
}

// * -------------- *
// |      view      |
// * -------------- *
const main = document.querySelector(".main");
const userName = document.querySelector(".tour__title > span");
// 行程資訊
const tourImg = document.querySelector(".tour__img > img");
const tourName = document.querySelector(".tour__name > span");
const tourDate = document.querySelector(".tour__date > span");
const tourTime = document.querySelector(".tour__time > span");
const tourPrice = document.querySelector(".tour__price > span");
const tourAddress = document.querySelector(".tour__address > span");
const deleteBookingBtn = document.querySelector(".tour__icon-delete");
// 聯絡資訊
const connectName = document.querySelector("#connect__name");
const connectEmail = document.querySelector("#connect__email");
const connectPhone = document.querySelector("#connect__phone");
// 總計
const submiTotal = document.querySelector(".price-check__total");

function renderInit() {
    if(bookingInfo.data) {
        main.classList.remove("main--no-booking");
        let tourInfo = bookingInfo.data;
        // 行程資訊
        tourImg.src = tourInfo.attraction.image;
        tourName.textContent = tourInfo.attraction.name;
        const date = new Date(tourInfo.date);
        tourDate.textContent = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        if(tourInfo.time == "morning") {
            tourTime.textContent = "早上 9 點到下午 2 點";
        } else {
            tourTime.textContent = "下午 2 點到晚上 8 點";
        }
        tourPrice.textContent = `新台幣 ${tourInfo.price} 元`;
        tourAddress.textContent = tourInfo.attraction.address;
        // 聯絡資訊
        connectName.value = user.name;
        connectEmail.value = user.email;
        // 總計
        let total = tourInfo.price;
        submiTotal.textContent = total;
    } else {
        main.classList.add("main--no-booking");
    }
}
function renderUserLogin() {
    if(user) {
        // 使用者已登入，顯示使用者姓名於畫面
        userName.textContent = user.name;
    } else {
        // 使用者未登入，直接導向首頁
        window.location.assign("/");
        return;
    }
}
function renderDeleteBooking(result) {
    if(result.ok) {
        return;
    } else {
        const message = document.querySelector(".tour__message");
        message.classList.add("tour__message--visible");
        message.textContent = result.message;
    }
}

// * -------------- *
// |   controller   |
// * -------------- *
// 總計
const submitOrder = document.querySelector(".price-check__submit");

async function initBooking() {
    setLoading(80, 2);

    await initCommon();
    renderUserLogin();
    
    await getBookingInfo();
    renderInit();

    stopLoading();
    main.classList.remove("beforeLoad");
}
async function deleteBooking() {
    setLoading(80, 1);

    const result = await deleteBookingInfo();
    renderDeleteBooking(result);

    stopLoading();
}
async function getOrdersAndPay(getPrimeResult) {
    if(getPrimeResult.error) {
        // 顯示錯誤訊息
        return;
    }

    let tripInfo = bookingInfo.data;
    const date = new Date(tripInfo.date);
    const postOrdersResult = await postOrders({
        prime: getPrimeResult.prime,
        order: {
            price: parseInt(submiTotal.textContent),
            trip: {
                attraction: {
                    id: tripInfo.attraction.id,
                    name: tripInfo.attraction.name,
                    address: tripInfo.attraction.address,
                    image: tripInfo.attraction.image
                },
                date: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`,
                time: tripInfo.time
            }
        },
        contact: {
            name: connectName.value,
            email: connectEmail.value,
            phone: connectPhone.value
        }
    });
    // console.log(postOrdersResult);
    if(postOrdersResult.error) {
        // 顯示錯誤訊息
    } else {
        // 刪除預定行程
        await deleteBooking();
        window.location.assign(`/thankyou?number=${postOrdersResult.data.number}`);
        return;
    }
}


// event
window.addEventListener("DOMContentLoaded", () => {
    initBooking();
});
deleteBookingBtn.addEventListener("click", (e) => {
    deleteBooking();
    // 資料庫刪除成功，重新載入 booking 畫面
    window.location.reload();
});
// 訂單送出
submitOrder.addEventListener("click", (e) => {
    onSubmit(e, getOrdersAndPay);
});