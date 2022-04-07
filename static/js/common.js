import { regexEmail } from "./config.js";
import { fetchAPI } from "./tool.js";

// * -------------- *
// |     model      |
// * -------------- *
export let user = null;

async function getUserData() {
    const result = await fetchAPI("/user", { method: "GET" });
    if(result.data) {
        user = result.data;
    }
}
function userLogout() {
    return fetchAPI("/user", { method: "DELETE", headers: { "content-type": "application/json" }});
}
function patchUser() {
    return fetchAPI(
        "/user",
        {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                email: loginEmail.value,
                password: loginPassword.value
            })
        },
        false,
        true
    );
}
function postUser() {
    return fetchAPI(
        "/user",
        { 
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                name: signupName.value,
                email: signupEmail.value,
                password: signupPassword.value
            })
        }
    );
}

// * -------------- *
// |      view      |
// * -------------- *
const itemLogin = document.querySelector("#item-login");
const itemLogout = document.querySelector("#item-logout");

// 登入/註冊事件
const userWrap = document.querySelector(".user-wrap");

const userLogin = document.querySelector("#user-login");
const loginEmail = document.querySelector("#login-email");
const loginPassword = document.querySelector("#login-password");
const loginMessage = document.querySelector("#login-message");

const userSignup = document.querySelector("#user-signup");
const signupName = document.querySelector("#signup-name");
const signupEmail = document.querySelector("#signup-email");
const signupPassword = document.querySelector("#signup-password");
const signupMessage = document.querySelector("#signup-message");

function renderMenu() {
    if(user) {
        itemLogout.parentElement.classList.remove("menu__item--inactive");
    } else {
        itemLogin.parentElement.classList.remove("menu__item--inactive");
    }
    navMenu.classList.add("menu--visible");
}
function renderMessage(message, element, errFlag) {
    element.textContent = message;
    if(errFlag) {
        element.parentElement.classList.remove("user__err-message--valid");
        element.parentElement.classList.add("user__err-message--invalid");
    } else {
        element.parentElement.classList.add("user__err-message--valid");
        element.parentElement.classList.remove("user__err-message--invalid");
    }
}
function changePasswordVisible(target) {
    // 密碼輸入框 調整為顯碼
    if(target.nodeName == "IMG" && target.classList.contains("user__eye-close")) {
        const inputPassword = target.parentElement.querySelector("input[type='password']");
        inputPassword.type = "text";
        inputPassword.parentElement.classList.add("user__password--visible");
    }
    // 密碼輸入框 調整為隱碼
    if(target.nodeName == "IMG" && target.classList.contains("user__eye")) {
        const inputPassword = target.parentElement.querySelector("input[type='text']");
        inputPassword.type = "password";
        inputPassword.parentElement.classList.remove("user__password--visible");
    }
}
// UserWrap 要顯示畫面 (login / signup)
export function renderUserWrap(type="default") {
    loginPosition = JSON.parse(localStorage.getItem("data-position"));
    localStorage.removeItem("data-position");
    switch(type) {
        case "login":
            userWrap.classList.remove("user-wrap--inactive");
            userWrap.classList.add("user-wrap--active");
            userLogin.classList.add("user-container--active");
            userSignup.classList.remove("user-container--active");
            loginEmail.focus();
            break;
        case "signup":
            userWrap.classList.remove("user-wrap--inactive");
            userWrap.classList.add("user-wrap--active");
            userLogin.classList.remove("user-container--active");
            userSignup.classList.add("user-container--active");
            signupName.focus();
            break;
        default:
            userWrap.classList.add("user-wrap--inactive");
            userWrap.classList.remove("user-wrap--active");
            userLogin.classList.remove("user-container--active");
            userSignup.classList.remove("user-container--active");
            break;
    }
}
function renderInput(parent, checkResult) {
    const message = parent.querySelector(".user__input-message > span");
    message.textContent = checkResult;
    if(checkResult) {
        // input 加上效果
        parent.classList.add("user__verify-item--invalid");
        parent.classList.remove("user__verify-item--valid");
        // 訊息 加上效果
        message.textContent = checkResult;
        message.parentElement.classList.add("user__input-message--invalid");
        message.parentElement.classList.remove("user__input-message--valid");
    } else {
        // input 移除效果
        parent.classList.remove("user__verify-item--invalid");
        parent.classList.add("user__verify-item--valid");
        // 訊息 加上效果
        message.textContent = "驗證成功";
        message.parentElement.classList.remove("user__input-message--invalid");
        message.parentElement.classList.add("user__input-message--valid");
    }
}
export function resetUserContainer(resetArea) {
    const resetUserWrap = document.querySelector(`#user-${resetArea}`);
    const resetList = resetUserWrap.querySelectorAll("div.user__verify-item");
    for(const resetItem of resetList) {
        // 清除輸入框效果
        resetItem.classList.remove("user__verify-item--invalid");
        resetItem.classList.remove("user__verify-item--valid");
        // 清除 input value
        const input = resetItem.querySelector("input");
        input.value = "";
        // 密碼輸入框調整 type=password
        const inputPassword = resetItem.querySelector("input[name='password']");
        if(inputPassword) {
            inputPassword.type = "password";
            resetItem.classList.remove("user__password--visible");
        }
        // 移除訊息效果
        const messageArea = resetItem.querySelector(".user__input-message");
        messageArea.classList.remove("user__input-message--invalid");
        messageArea.classList.remove("user__input-message--valid");
    }
    // 清除提示訊息
    const validMsg = resetUserWrap.querySelector(".user__err-message--valid");
    if(validMsg) {
        validMsg.classList.remove("user__err-message--valid");
        validMsg.children[0].textContent = "";
    }
    const invalidMsg = resetUserWrap.querySelector(".user__err-message--invalid");
    if(invalidMsg) {
        invalidMsg.classList.remove("user__err-message--invalid");
        invalidMsg.children[0].textContent = "";
    }
}

// * -------------- *
// |   controller   |
// * -------------- *
let loginPosition = null;

const navMenu = document.querySelector(".menu");

// 頁面初始
export async function initCommon() {
    await getUserData();
    renderMenu();
}
function exitUserWrap(event) {
    const target = event.target;
    if((target.nodeName == "DIV" && target.classList.contains("user-wrap"))
    || (target.nodeName == "IMG" && target.classList.contains("user__close"))) {
        // 清除畫面資料
        resetUserContainer("login");
        resetUserContainer("signup");
        renderUserWrap();
    }
}
function isValid(checkArea) {
    let isValid = true;
    const checkList = document.querySelectorAll(`[data-verify=${checkArea}]`);
    for(const checkItem of checkList) {
        if(checkItem.classList.contains("user__verify-item--invalid")) {
            isValid = false;
            continue;
        }
        const input = checkItem.querySelector("input");
        // 驗證欄位
        const checkResult = checkData(input.name, input.value);
        // 顯示驗證訊息
        renderInput(checkItem, checkResult);
        if(checkResult) {
            isValid = false;
        }
    }
    return isValid;
}
function checkData(inputName, inputValue) {
    switch(inputName) {
        case "name":
            if(!inputValue) {
                return "姓名不可為空白";
            }
            break;
        case "email":
            if(!inputValue) {
                return  "電子信箱不可為空白";
            }
            if (!regexEmail.test(inputValue)) {
                return  "電子信箱格式錯誤";
            }
            break;
        case "password":
            if(!inputValue) {
                return  "密碼不可為空白";
            }
            if(inputValue.length < 6) {
                return "密碼長度需超過6位";
            }
            break;
        default:
            break;
    }
    // 驗證成功
    return "";
}
// loading effect
function setUserLoading(message) {
    // 視窗（外容器）
    const loadingWrap = document.createElement("div");
    loadingWrap.classList.add("user__loading-wrap");
    // 視窗（內容器）
    const loadingContainer = document.createElement("div");
    loadingContainer.classList.add("user__loading-container");
    // 文字訊息
    const loadingMessage = document.createElement("p");
    loadingMessage.classList.add("user__loading__message");
    loadingMessage.textContent = message;
    // loading 特效
    const loadingCircle = document.createElement("div");
    loadingCircle.classList.add("user__loading__circle");
    // 加入 內容器
    loadingContainer.appendChild(loadingMessage);
    loadingContainer.appendChild(loadingCircle);
    // 加入 外容器
    loadingWrap.appendChild(loadingContainer);
    // 加入 畫面
    document.body.appendChild(loadingWrap);
}
function stopUserLoading() {
    // 從畫面移除
    const loadingWrap = document.querySelector(".user__loading-wrap");
    document.body.removeChild(loadingWrap);
}

navMenu.addEventListener("click", (e) => {
    if(e.target.nodeName == "A") {
        e.preventDefault();
        switch(e.target.getAttribute("data-menu")) {
            case "booking":
                if(user) {
                    window.location.assign("/booking");
                    return;
                } else {
                    localStorage.setItem("data-position", JSON.stringify({
                        "position": "common",
                        "value": null
                    }));
                    // 預設顯示登入畫面
                    renderUserWrap("login");
                    resetUserContainer("login");
                }
                break;
            case "login":
                // 預設顯示登入畫面
                renderUserWrap("login");
                resetUserContainer("login");
                break;
            case "logout":
                setUserLoading("登出中，請稍候");
                userLogout().then(result => {
                    if(result["ok"]) {
                        window.location.reload();
                        return;
                    } else {
                        stopUserLoading();
                        console.log("delete fail");
                    }
                });
                break;
        }
    }
});
userLogin.addEventListener("click", (e) => {
    const target = e.target;
    if(target.nodeName == "INPUT" && target.type == "submit") {
        e.preventDefault();
        if(isValid("login")) {
            setUserLoading("登入中，請稍候");
            patchUser().then(result => {
                if(result["ok"]) {
                    if(loginPosition) {
                        if(loginPosition.position == "common") {
                            // 點擊預定行程做登入，導向 booking 頁面
                            window.location.assign("/booking");
                            return;
                        } else if(loginPosition.position == "attraction") {
                            localStorage.setItem("data-position", JSON.stringify(loginPosition));
                        }
                    }
                    // 當前頁面重新整理
                    window.location.reload();
                    return;
                } else {
                    renderMessage(result["message"], loginMessage, true);
                    stopUserLoading();
                }
            });
        }
    }
    if(target.nodeName == "A") {
        e.preventDefault();
        // 改顯示註冊畫面
        renderUserWrap("signup");
        // 清除畫面資料
        resetUserContainer("login");
    }
    changePasswordVisible(target);
});
userSignup.addEventListener("click", (e) => {
    const target = e.target;
    if(target.nodeName == "INPUT" && target.type == "submit") {
        e.preventDefault();
        if(isValid("signup")) {
            setUserLoading("註冊中，請稍候");
            postUser().then(result => {
                stopUserLoading();
                if(result["ok"]) {
                    renderMessage("註冊成功", signupMessage, false);
                } else {
                    renderMessage(result["message"], signupMessage, true);
                }
            });
        }
    }
    if(target.nodeName == "A") {
        e.preventDefault();
        // 改顯示登入畫面
        renderUserWrap("login");
        // 清除畫面資料
        resetUserContainer("signup");
    }
    changePasswordVisible(target);
});
userWrap.addEventListener("focusout", (event) => {
    const target = event.target;
    if(target.nodeName == "INPUT" && target.type != "submit") {
        // 驗證欄位
        const checkResult = checkData(target.name, target.value);
        // 顯示驗證訊息
        renderInput(target.parentElement, checkResult);
    }
});
userWrap.addEventListener("mousedown", exitUserWrap);
userWrap.addEventListener("touchstart", exitUserWrap);