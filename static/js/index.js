// 目前頁數，預設是 0
let nowPage = 0;
// 下一頁頁數，預設是 0，表示未載入資訊
let nextPage = 0;

let dataLoading = false;
let hasSearchText = false;
const main = document.querySelector(".main");
const main__attractions = document.querySelector(".attractions");
const attractions_observer = document.querySelector(".attractions-observer");
const searchText = document.querySelector(".section__search-text");
const searchBtn = document.querySelector(".section__search-btn");

// 條件達成做什麼：符合設定條件下，目標進入或離開 viewport 時觸發此 callback 函式
const observerCallback = ([entry]) => {
    if (entry && entry.isIntersecting) {
        checkInput(nextPage);
    }
};

// 建立一個 intersection observer，帶入相關設定資訊
// 觸發條件都使用預設即可，所以不特別帶入(第二個參數)
let observer = new IntersectionObserver(observerCallback);


function checkInput() {
    // 待測試，決定需不需要留下 -> 註解先保留，margin 到 main 前要記得刪掉
    if(dataLoading) {
        // console.log("data load still");
        return;
    }
    if(nextPage != null) {    
        let url = `/api/attractions?page=${nextPage}`;
        // 使用 search botton，帶入輸入關鍵字搜尋
        if(hasSearchText && searchText.value.trim() != "") {
            url += `&keyword=${searchText.value.trim()}`;
        }
        dataLoading = true;
        // console.log("data load start");
        getAttractions(url);
    }
}

// 取得旅遊景點資訊，帶入參數：page
function getAttractions(url) {
    // console.log("fetch start");
    fetch(url)
    .then((response) => {
        return response.json()
    }).then((data) => {
        // 更新畫面
        renderAttractions(data.data);
        // 更新
        if(data.nextPage === null) {
            attractions_observer.style.display = "none";
            observer.unobserve(attractions_observer);
        } else {
            // 更新目前頁數
            nowPage = nextPage;
        }
        // 更新下一頁頁數
        nextPage = data.nextPage;
        // 資料讀取結束
        dataLoading = false;
        // console.log("fetch end, data load end");
    });
}

function renderAttractions(attractions) {
    attractions.forEach(attraction => {
        // 新增旅遊景點區塊
        const attractionWrap = document.createElement("li");
        attractionWrap.classList.add("attraction-wrap");
        // 旅遊景點圖片
        const attractionImg = document.createElement("img");
        // attractionImg.src = attraction.images[0];
        attractionImg.style.backgroundImage = `url(${attraction.images[0]}`;
        attractionImg.classList.add("attraction-img");
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
        attractionWrap.appendChild(attractionImg);
        attractionWrap.appendChild(attractionTitle);
        attractionWrap.appendChild(attractionMrt);
        attractionWrap.appendChild(attractionCategory);
        // 景點區塊加入畫面
        main__attractions.appendChild(attractionWrap);
    });
}

// 頁面初始
document.addEventListener("DOMContentLoaded", () => {
    // 設定觀察對象：告訴 observer 要觀察哪個目標元素
    observer.observe(attractions_observer);
});

// 關鍵字搜尋事件
searchBtn.addEventListener("click", (e) => {
    // 初始化變數、
    nowPage = 0;
    nextPage = 0;
    dataLoading = false;
    main__attractions.innerHTML = "";
    attractions_observer.style.display = "block";
    // 設定
    hasSearchText = true;
    observer.observe(attractions_observer);
});

