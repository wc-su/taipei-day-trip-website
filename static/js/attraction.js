let attraction = null; // 景點資訊，
let autoSlider = true; // 圖片自動播放註記，預設是 true
let overCircles = false; // 判斷圖片圓點是否超出外容器，預設是 false
const imageContainer = document.querySelector(".img-container");
const images = document.querySelector(".attraction-imgs");
const prevBtn = document.querySelector(".img__btn--prev");
const nextBtn = document.querySelector(".img__btn--next");
const circles = document.querySelector(".img__circles");
const radio = document.querySelector(".tour__radio-container");
const tourSubmit = document.querySelector(".tour__submit");

let url = `/api/${window.location.pathname}`;
fetch(url)
.then((response) => {
    return response.json();
}).then((data) => {
    // API 回傳失敗
    if(data.error) {
        return;
    }
    // 取得景點資訊
    attraction = data.data;
    // 載入畫面
    renderInit();
});

// let test = 0;
// const intervalXX = window.setInterval(() => {
//     test++;
//     console.log(test);
// }, 1000);

// 每 5 秒檢核使用者是否有翻頁，使用者有手動翻頁，auto 註記會改為 false 
// 若註記為 false，則不自動翻頁但將 auto 註記開啟；若註記為 true，則進行自動翻頁
const intervalID = window.setInterval(() => {
    if(autoSlider) {
        nextBtn.click();
        // test = 0;
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
radio.addEventListener("click", (e) => {
    if(e.target.nodeName == "INPUT") {
        const price = document.querySelector(".tour__price");
        if(e.target.value == "1") {
            price.textContent = "新台幣 2000 元";
        } else {
            price.textContent = "新台幣 2500 元";
        }
    }
});
tourSubmit.addEventListener("click", (e) => {
    // 先取消 submit 事件
    e.preventDefault();
});
// 視窗更動尺寸 事件
window.addEventListener("resize", renderCircles);

// 視窗更動尺寸，重新計算圖片圓點在畫面上的位置
function renderCircles() {
    overCircles = false;

    const imagesLen = attraction.images.length;
    const circlesWidth = 12 * imagesLen + 12 * (imagesLen - 1) + 20;

    if(circlesWidth > imageContainer.offsetWidth) {
        // 若圓點 width 超過外容器，將註記改為 true，並調整圖片圓點為向左靠齊
        circles.classList.add("img__circles--start");
        overCircles = true;
    } else {
        // 若圓點 width 未超過外容器，套用預設設定(置中擺放)，移除其他設定
        circles.classList.remove("img__circles--start");
    }
    circles.classList.remove("img__circles--end");

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

    // 判斷圖片圓點 width 是否超出外容器
    if(overCircles) {
        if(index < attraction.images.length / 2) {
            // index 在 1/2 前，調整靠左對齊
            if(!circles.classList.contains("img__circles--start")) {
                circles.classList.remove("img__circles--end");
                circles.classList.add("img__circles--start");
            }
        } else {
            // index 在 1/2 之後，調整靠右對齊
            if(!circles.classList.contains("img__circles--end")) {
                circles.classList.remove("img__circles--start");
                circles.classList.add("img__circles--end");
            }
        }
    }
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

function renderInit() {
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

    // 計算圖片圓點在畫面上的位置
    renderCircles();
}