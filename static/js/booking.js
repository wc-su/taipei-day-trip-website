import { fetchAPI, setLoading, stopLoading } from "./tool.js"
import { initCommon, user } from "./common.js"

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
        // 資料庫刪除成功，重新載入 booking 畫面
        window.location.reload();
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
}

async function deleteBooking() {
    setLoading(80, 1);
    const result = await deleteBookingInfo();
    renderDeleteBooking(result);
    stopLoading();
}

// event
window.addEventListener("DOMContentLoaded", () => {
    initBooking();
});
deleteBookingBtn.addEventListener("click", (e) => {
    deleteBooking();
});






// 訂單送出 -> 先取消預設事件
submitOrder.addEventListener("click", (e) => {
    // 取消預設事件
    e.preventDefault();
});

// 信用卡資訊 -> 未完成
const creditCardNumber = document.querySelector("#credit-card__number");
const creditCardExpir = document.querySelector("#credit-card__expir");
const creditCardCVV = document.querySelector("#credit-card__cvv");

creditCardNumber.addEventListener("keydown", () => limitInput(window.event, 16));
creditCardNumber.addEventListener("keyup", () => formatInput(window.event, 16, " ", 4));
creditCardNumber.addEventListener("paste", () => {
    // console.log("paste");
});
creditCardExpir.addEventListener("keydown", () => limitInput(window.event, 4));
creditCardExpir.addEventListener("keyup", () => formatInput(window.event, 4, " / ", 2));

creditCardCVV.addEventListener("keydown", () => limitInput(window.event, 3));
creditCardCVV.addEventListener("keyup", () => formatInput(window.event, 3, "", 3));

function limitInput(e, length) {
    switch (e.keyCode) { // allows navigating thru input
        case 20: // caplocks
        case 17: // control
        case 18: // option
        case 16: // shift
        case 37: // arrow keys
        case 38:
        case 39:
        case 40:
        case  9: // tab (let blur handle tab)
        // case 91: // command
            console.log("1.keydown: skip1 -> ", e.currentTarget.value, e.keyCode);
            return;
        case 46: // delete
        case  8: // backspace
            console.log("1.keydown: skip2 -> ", e.currentTarget.value, e.keyCode);
            return;
    }
    if(e.keyCode >= 48 && e.keyCode <= 57) { // number
    } else {
        console.log("1.keydown: skip3 -> ", e.currentTarget.value, e.keyCode);
        e.preventDefault();
        return;
    }
    console.log("1.keydown:", e.currentTarget.value, e.keyCode);
    // console.log("limitInput", e.keyCode, e);
    // 將非數字的替換成空白
    const numbersOnly = e.currentTarget.value.replace(/\D/g, '');
    if(numbersOnly.length == length) {
        console.log("  -> this", e.currentTarget.value, e.keyCode);
        e.preventDefault();
        return;
    }
    console.log("  -> ", numbersOnly.length, length);

    // if (
    //     [8, 9, 13, 37, 38, 39, 40].includes(e.keyCode) ||
    //     (e.keyCode >= 48 && e.keyCode <= 58) ||
    //     (e.keyCode >= 96 && e.keyCode <= 105) ||
    //     ((e.ctrlKey === true || e.metaKey === true) &&
    //         (e.keyCode === 65 || e.keyCode === 67 || e.keyCode === 86))
    // ) {
    //     /* Allow it */
    //     const parent = e.currentTarget.parentElement;
    //     const numbersOnly = e.currentTarget.value.replace(/\D/g, '');
    //     console.log(parent, numbersOnly);
    //     showValidationBorder(parent, numbersOnly, length);
    // } else {
    //     /* No valid keyCodes */
    //     e.preventDefault();
    //     return false;
    // }
    // return true;
}
function formatInput(e, length, separator, groupSize, onPaste=false) {
    switch (e.keyCode) { // allows navigating thru input
        case 20: // caplocks
        case 17: // control
        case 18: // option
        case 16: // shift
        case 37: // arrow keys
        case 38:
        case 39:
        case 40:
        case  9: // tab (let blur handle tab)
        // case 91: // command
            console.log("2.keyup: skip1 -> ", e.currentTarget.value, e.keyCode);
            return;
        case 46: // delete
        case  8: // backspace
            console.log("2.keyup: skip2 -> ", e.currentTarget.value, e.keyCode);
            setTargetValue(e.currentTarget, separator, length, groupSize);
            return;
    }
    if(e.keyCode >= 48 && e.keyCode <= 57) { // number
    } else {
        console.log("2.keyup: skip3 -> ", e.currentTarget.value, e.keyCode);
        // e.preventDefault();
        return;
    }
    console.log("2.keyup:", e.currentTarget.value, e.keyCode);
    // if(e.currentTarget.value.length > length + separator.length) {
    //     e.currentTarget.value = e.currentTarget.value.substring(0, length + separator.length);
    //     console.log("  -> return:", e.currentTarget.value);
    //     e.preventDefault();
    //     return;
    // }
    // // console.log("formatInput", e.keyCode, e);

    if(e.currentTarget.value.length >= length + separator.length) {
        console.log("  -> return:", e.currentTarget.value, e.currentTarget.value.length, length, separator.length);
        setTargetValue(e.currentTarget, separator, length, groupSize);
        // e.preventDefault();
        return;
    }
    
    setTargetValue(e.currentTarget, separator, length, groupSize);

    // const e = event;
    // /* Current input value */
    // const val = e.currentTarget.value;
    // let numbersOnly = val.replace(/\D/g, '');
    // if (e.keyCode === 8) {
    //     /* If backspace, check credit card type */
    //     if (length === 16 && numbersOnly.length > 0) {
    //         c(numbersOnly);
    //     }
    // }
    // const parent = e.currentTarget.parentElement;
    // /* Allowed: Numbers from keyboard or number pad, or onpaste event */
    // if ((e.keyCode >= 48 && e.keyCode <= 58) || (e.keyCode >= 96 && e.keyCode <= 105) || onPaste) {
    //     /* Max formatted length includes separators x3 (with 1 space on each side) */
    //     const lengthFormatted = length + 3 * (length / groupSize - 1);
    //     /* Remove non-digits from input */
    //     if (onPaste) {
    //         /* Remove non-digits from clipboard data */
    //         numbersOnly = e.clipboardData.getData('text').replace(/\D/g, '');
    //     }

    //     /* If there is no separator, length will equal groupSize */
    //     if (numbersOnly.length > groupSize && length !== groupSize) {
    //         /* Add hyphens and truncate to max formatted length */
    //         const re = new RegExp(`(.{${groupSize}})`, 'g');
    //         const replace = `$1 ${separator} `;
    //         e.currentTarget.value = numbersOnly.replace(re, replace).substring(0, lengthFormatted);
    //     } else {
    //         /* Truncate to max formatted length */
    //         e.currentTarget.value = numbersOnly.substring(0, lengthFormatted);
    //     }

    //     /* Check credit card type */
    //     if (length === 16 && numbersOnly.length > 0) {
    //         setCardType(numbersOnly);
    //     }

    //     showValidationBorder(parent, numbersOnly, length);

    //     /* If paste, prevent the event from triggering another paste */
    //     e.preventDefault();
    //     return false;
    // }
    // return true;
}

function showValidationBorder(parent, numbersOnly, length) {
    if (numbersOnly.length === length) {
        parent.classList.add('has-success');
        parent.classList.remove('has-error');
    } else {
        parent.classList.remove('has-success');
        parent.classList.add('has-error');
    }
}

function setTargetValue(target, separator, length, groupSize) {
    const numbersOnly = target.value.replace(/\D/g, '');

    let posStart = target.selectionStart;
    console.log("  -> pos1:", posStart);

    const part = separator.length + groupSize;
    const remainder = parseInt(posStart % part);
    if(remainder == 0) {
        posStart += 1;
        console.log("  -> pos2:", posStart);
    } else if (remainder > groupSize) {
        posStart += (part - remainder + 1);
        console.log("  -> pos2:", posStart);
    }

    let i = 0;
    const unit = length / groupSize;
    let targetValue = "";
    while(i < numbersOnly.length && i < length) {
        if(i > 0 && i % unit == 0) {
            targetValue += separator;
        }
        targetValue += numbersOnly.substring(i, unit + i);
        i += unit;
    }
    target.value = targetValue;
    target.setSelectionRange(posStart, posStart);
}