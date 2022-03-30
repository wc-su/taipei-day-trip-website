import { fetchAPI, formatDate } from "./tool.js"
import { renderUserWrap, resetUserContainer, initCommon, user } from "./common.js"

// * -------------- *
// |     model      |
// * -------------- *
// 景點資訊，
let attraction = null;

async function getAttraction() {
    await fetchAPI(`${window.location.pathname}`, "GET")
    .then(result => {
        // API 回傳失敗
        if(result.error) {
            return;
        }
        // 取得景點資訊
        attraction = result.data;
    });
}

async function addbookingToDB() {
    // 呼叫 api，將預定行程寫入資料庫
    return await fetchAPI("/booking", "POST",
        { "content-type": "application/json" },
        {
            "attractionId": attraction.id,
            "date": tourDate.value,
            "time": tourRadioArea.querySelector("input[type='radio']:checked").value,
            "price": tourPrice.textContent
        }
    );
}

// * -------------- *
// |      view      |
// * -------------- *
let autoSlider = true; // 圖片自動播放註記，預設是 true
const imageContainer = document.querySelector(".img-container");
const images = document.querySelector(".attraction-imgs");
const prevBtn = document.querySelector(".img__btn--prev");
const nextBtn = document.querySelector(".img__btn--next");
const circles = document.querySelector(".img__circles");
const tourRadioArea = document.querySelector(".tour__radio-container");
const message = document.querySelector(".tour__message");

function renderInit() {
    window.document.title = `${attraction.name} - 台北一日遊`

    const attractionName = document.querySelector(".attraction-name");
    attractionName.textContent = attraction.name;
    const attractionCategory_Mrt = document.querySelector(".attraction-category-mrt");
    attractionCategory_Mrt.textContent = `${attraction.category} at ${attraction.mrt}`;

    const attractionDescription = document.querySelector(".attraction-description");
    attractionDescription.textContent = attraction.description;
    const attractionAddress = document.querySelector(".attraction-address");
    attractionAddress.textContent = attraction.address;
    const attractionTransport = document.querySelector(".attraction-transport");
    attractionTransport.textContent = attraction.transport;

    // 固定圖片區域高度
    const tourContainer = document.querySelector(".tour-container");
    imageContainer.style.height = `${tourContainer.offsetHeight}px`;

    // 圖片資訊
    for(let i = 0; i < attraction.images.length; i++) {
        // 新增圖片
        const img = document.createElement("img");
        img.src = attraction.images[i];
        img.setAttribute("data-index", i)
        img.classList.add("attraction-img");
        images.appendChild(img);

        // 新增圖片圓點
        const circle = document.createElement("a");
        circle.setAttribute("data-index", i)
        circle.classList.add("img__circle");
        circles.appendChild(circle);
    }

    // 超過 1 筆資料，讓按鈕 active
    if(attraction.images.length > 1) {
        nextBtn.classList.add("img__btn--active");
        prevBtn.classList.add("img__btn--active");
    } else {
        // 取消圖片自動輪播
        clearInterval(intervalID);
    }

    // 設定預定日期：明日到近六個月
    const today = new Date();
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const afterSixMonth = new Date(tomorrow.getFullYear(), tomorrow.getMonth() + 6, tomorrow.getDate());
    tourDate.setAttribute("min", formatDate(tomorrow));
    tourDate.setAttribute("max", formatDate(afterSixMonth));

    // 畫面重新調整
    renderIndex(0);
}

function renderIndex(index) {
    // 關閉自動翻頁
    autoSlider = false;

    // 調整圖片圓點
    const circleActive = document.querySelector(".img__circle--active");
    if(circleActive) {
        circleActive.classList.remove("img__circle--active");
    }
    circles.children[index].classList.add("img__circle--active");

    // 調整圖片
    const imgActive = document.querySelector(".attraction-img--active");
    if(imgActive) {
        imgActive.classList.remove("attraction-img--active");
    }
    images.children[index].classList.add("attraction-img--active");

    // 調整左右按鈕
    // 檢核是否有下一張圖片，更新按鈕 index
    if(attraction.images[index + 1]) {
        nextBtn.setAttribute("data-index", index + 1);
    } else {
        nextBtn.setAttribute("data-index", 0);
    }
    // 檢核是否有上一張圖片，更新按鈕 index
    if(attraction.images[index - 1]) {
        prevBtn.setAttribute("data-index", index - 1);
    } else {
        prevBtn.setAttribute("data-index", attraction.images.length - 1);
    }
}

function renderBooking(result) {
    if(result.ok) {
        // 資料庫新增/修改成功，載入 booking 畫面
        window.location.assign("/booking");
        return;
    } else {
        message.classList.add("tour__message--visible");
        message.textContent = result.message;
    }
}

// * -------------- *
// |   controller   |
// * -------------- *
let isDown = false;
let startX = 0;
const tourSubmit = document.querySelector(".tour__submit");
const tourPrice = document.querySelector(".tour__price > span");
const tourDate = document.querySelector(".tour__date");


async function init() {
    await initCommon();
    await getAttraction();
    // 載入畫面
    renderInit();
    
    // 若是由 submit(未登入)跳回，直接執行 submit 預定行程
    const localData = localStorage.getItem("data-position");
    localStorage.removeItem("data-position");
    if(localData) {
        const loginPosition = JSON.parse(localData);
        if(loginPosition && loginPosition.position == "attraction") {
            tourDate.value = loginPosition.value;
            tourSubmit.click();
        }
    }
}

async function addBooking() {
    const result = await addbookingToDB();
    renderBooking(result);
}

window.addEventListener("DOMContentLoaded", () => {
    init();
});

// 每 5 秒檢核使用者是否有翻頁，使用者有手動翻頁，auto 註記會改為 false 
// 若註記為 false，則不自動翻頁但將 auto 註記開啟；若註記為 true，則進行自動翻頁
const intervalID = window.setInterval(() => {
    if(autoSlider) {
        nextBtn.click();
    }
    autoSlider = true;
}, 5000);
// 上一張圖片 按鈕事件
prevBtn.addEventListener("click", (e) => {
    if(e.target.classList.contains("img__btn--active")) {
        // 取得要更改的 index
        const index = parseInt(e.target.getAttribute("data-index"));
        renderIndex(index);
    }
});
// 下一張圖片 按鈕事件
nextBtn.addEventListener("click", (e) => {
    if(e.target.classList.contains("img__btn--active")) {
        // 取得要更改的 index
        const index = parseInt(e.target.getAttribute("data-index"));
        renderIndex(index);
    }
});
// 圖片圓點 按鈕事件
circles.addEventListener("click", (e) => {
    if(e.target.nodeName == "A") {
        // 取得要更改的 index
        const index = parseInt(e.target.getAttribute("data-index"));
        renderIndex(index);
    }
});
// 時間選擇 按鈕事件
tourRadioArea.addEventListener("click", (e) => {
    if(e.target.nodeName == "INPUT") {
        if(e.target.value == "morning") {
            tourPrice.textContent = "2000";
        } else {
            tourPrice.textContent = "2500";
        }
    }
});
tourSubmit.addEventListener("click", (e) => {
    // 取消 submit 預設事件
    e.preventDefault();
    // 需登入才能預定行程
    if(user == null) {
        localStorage.setItem("data-position", JSON.stringify({
            "position": "attraction",
            "value": tourDate.value
        }));
        renderUserWrap("login");
        resetUserContainer("login");
        return;
    }
    // 檢核是否有輸入日期
    if(tourDate.value) {
        tourDate.classList.remove("tour__date--error");
    } else {
        tourDate.classList.add("tour__date--error");
        message.classList.add("tour__message--visible");
        message.textContent = "請選擇日期";
        return;
    }
    // 呼叫 api，將預定行程寫入資料庫
    addBooking();
});


// 景點圖片 滑鼠/手勢 事件
images.addEventListener("mousedown", dragStart);
images.addEventListener("touchstart", dragStart);
images.addEventListener("mousemove", dragMove);
images.addEventListener("touchmove", dragMove);
images.addEventListener("mouseleave", dragInit);
images.addEventListener("mouseup", dragEnd);
images.addEventListener("touchend", dragEnd);

function dragInit() {
    isDown = false;
    images.classList.remove("attraction-imgs--active");
    startX = 0;
}
function dragStart(event) {
    isDown = true;
    images.classList.add("attraction-imgs--active");
    startX = event.pageX;
}
function dragMove(event) {
    if(event.type == "mousemove") {
        event.preventDefault();
    }
    if(!isDown) { return; }
}
function dragEnd(event) {
    if(!isDown) { return; }
    let endX = event.pageX;
    if(endX > startX && (endX - startX >= 50)) { // 上一張
        prevBtn.click();
    } else if(endX < startX && (startX - endX >= 50)) { // 下一張
        nextBtn.click();
    }
    dragInit();
}