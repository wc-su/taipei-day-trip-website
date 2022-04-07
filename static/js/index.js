import { initCommon } from "./common.js";
import { fetchAPI } from "./tool.js";

// * -------------- *
// |     model      |
// * -------------- *
let attractionsData = null;

// 取得旅遊景點資訊
async function getAttractions(url) {
    attractionsData = await fetchAPI(url, { method: "GET" });
}

// * -------------- *
// |      view      |
// * -------------- *
// 旅遊景點
const attractions = document.querySelector(".attractions");
const attractions_observer = document.querySelector(".attractions__observer");

function renderAttractions() {
    let msg = null;
    
    // 檢核 API 回傳
    if(attractionsData.error) {
        // 回傳失敗，帶出回傳訊息
        msg = attractionsData.message;
    } else if(attractionsData.data.length == 0) {
        // 無資料
        msg = "查無旅遊景點資訊";
    }

    // 顯示在畫面上
    if(msg != null) {
        // 顯示訊息
        const attractionMsg = document.createElement("p");
        attractionMsg.classList.add("attraction-msg");
        attractionMsg.textContent = msg;
        attractions.appendChild(attractionMsg);
        attractions.classList.add("attractions--nodata");
    } else {
        attractionsData.data.forEach(attraction => {
            // 新增旅遊景點區塊
            const attractionWrap = document.createElement("li");
            attractionWrap.classList.add("attraction-wrap");
            attractionWrap.setAttribute("data-id", attraction.id);
            // 旅遊景點圖片
            const attractionImgWrap = document.createElement("div");
            attractionImgWrap.classList.add("attraction-img-wrap");
            const attractionImg = document.createElement("img");
            attractionImg.src = attraction.images[0];
            attractionImg.classList.add("attraction-img");
            attractionImgWrap.appendChild(attractionImg);
            // 旅遊景點名稱
            const attractionTitle = document.createElement("div");
            attractionTitle.textContent = attraction.name;
            attractionTitle.classList.add("attraction-title");
            // 旅遊景點捷運站
            const attractionMrt = document.createElement("div");
            attractionMrt.textContent = attraction.mrt;
            attractionMrt.classList.add("attraction-mrt");
            // 旅遊景點捷分類
            const attractionCategory = document.createElement("div");
            attractionCategory.textContent = attraction.category;
            attractionCategory.classList.add("attraction-category");
            // 將新增內容加入區塊中
            attractionWrap.appendChild(attractionImgWrap);
            attractionWrap.appendChild(attractionTitle);
            attractionWrap.appendChild(attractionMrt);
            attractionWrap.appendChild(attractionCategory);
            // 景點區塊加入畫面
            attractions.appendChild(attractionWrap);
        });
        attractions.classList.remove("attractions--nodata");
        if(attractionsData.nextPage === null) {
            msg = "notHasNext";
        }
        // 更新下一頁頁數
        nextPage = attractionsData.nextPage;
    }
    
    if(msg != null) {
        // 觀察物件不顯示在畫面並將動畫取消，不再觀察
        attractions_observer.style.display = "none";
        attractions_observer.classList.remove("attractions__observer--animation");
        observer.unobserve(attractions_observer);
    }
}

// * -------------- *
// |   controller   |
// * -------------- *
let nextPage = 0; // 下一頁頁數，預設是 0，表示未載入資訊
let dataLoading = false; // 資料是否正在讀取，預設為 false
let hasSearchText = false; // 是否有輸入關鍵字，預設為 false
let typeChinese = false; // 是否正在輸入中文，預設為 false

// 搜尋事件
const searchText = document.querySelector(".search-container__text");
const searchBtn = document.querySelector(".search-container__btn");

// 條件達成做什麼：符合設定條件下，目標進入或離開 viewport 時觸發此 callback 函式
const observerCallback = ([entry]) => {
    if (entry && entry.isIntersecting) {
        checkInput(nextPage);
    }
};
// 建立一個 intersection observer，帶入相關設定資訊
// 觸發條件都使用預設，不帶入觸發條件(第二個參數)
const observer = new IntersectionObserver(observerCallback);

async function checkInput() {
    // 資料載入中或無下一頁，不做任何處理
    if(dataLoading || nextPage == null) {
        return;
    }

    // 讀取註記設為 true
    dataLoading = true;
    let url = `/attractions?page=${nextPage}`;
    // 帶入輸入關鍵字搜尋
    if(hasSearchText && searchText.value.trim() != "") {
        url += `&keyword=${searchText.value.trim()}`;
    }
    await getAttractions(url);
    renderAttractions();
    // 資料讀取結束
    dataLoading = false; 
}



// 頁面初始
window.addEventListener("DOMContentLoaded", () => {
    initCommon();
});
window.addEventListener("load", () => {
    // 設定觀察對象：告訴 observer 要觀察哪個目標元素
    observer.observe(attractions_observer);
});
// 關鍵字搜尋事件
searchBtn.addEventListener("click", (e) => {
    // 初始化
    nextPage = 0;
    dataLoading = false;
    attractions.innerHTML = "";
    // 將觀察物件顯示在畫面上，增加動畫效果
    attractions_observer.style.display = "block";
    attractions_observer.classList.add("attractions__observer--animation");
    // 設定
    hasSearchText = true;
    observer.observe(attractions_observer);
});
// 查詢功能優化
searchText.addEventListener("keyup", (e) => {
    if (!typeChinese && e.keyCode === 13) {
        searchBtn.click();
    }
});
searchText.addEventListener("keydown", (e) => {
    // 開始輸入中文
    if (!typeChinese && e.keyCode === 229) {
        typeChinese = true;
    }
    // 結束輸入中文
    if (typeChinese && e.keyCode === 13) {
        typeChinese = false;
    }
});
// 景點列表 事件
attractions.addEventListener("click", (e) => {
    const target = e.target;
    if(target.nodeName != "UL") {
        const targetParent = target.parentElement;
        if(target.nodeName == "P" && targetParent.classList.contains("attractions--nodata")) {
            // 無景點資料，不做處理
            return;
        }
        let id = targetParent.getAttribute("data-id");
        if(target.nodeName == "IMG") {
            id = targetParent.parentElement.getAttribute("data-id");
        }
        window.location.assign(`attraction/${id}`);
        return;
    }
});