const navMenu = document.querySelector(".menu");
const itemLogin = document.querySelector("#item-login");
const itemLogout = document.querySelector("#item-logout");
// 登入/註冊事件
const userWrap = document.querySelector(".user-wrap");
const userContainer = document.querySelector(".user-container");

const userLogin = document.querySelector("#user-login");
const loginEmail = document.querySelector("#login-email");
const loginPassword = document.querySelector("#login-password");
const loginMessage = document.querySelector("#login-message");

const userSignup = document.querySelector("#user-signup");
const signupName = document.querySelector("#signup-name");
const signupEmail = document.querySelector("#signup-email");
const signupPassword = document.querySelector("#signup-password");
const signupMessage = document.querySelector("#signup-message");

// 頁面初始
window.addEventListener("DOMContentLoaded", () => {
    fetchUserAPI("GET").then(result => {
        if(result.data) {
            itemLogout.parentElement.classList.remove("menu__item--inactive");
        } else {
            itemLogin.parentElement.classList.remove("menu__item--inactive");
        }
    });
});
navMenu.addEventListener("click", (e) => {
    if(e.target.nodeName == "A") {
        e.preventDefault();
        switch(e.target.getAttribute("data-menu")) {
            case "booking":
                break;
            case "login":
                userWrap.classList.remove("user-wrap--inactive");
                userWrap.classList.add("user-wrap--active");
                // 預設顯示登入畫面
                renderUserWrap("login");
                break;
            case "logout":
                fetchUserAPI(
                    "DELETE",
                    { "content-type": "application/json" }
                ).then(result => {
                    if(result["ok"]) {
                        window.location.reload();
                    } else {
                        console.log("delete fail");
                    }
                });
                break;
        }
    }
});
// 移除 form 預設事件
userWrap.addEventListener("click", event => event.preventDefault());
userWrap.addEventListener("mousedown", exitUserWrap);
userWrap.addEventListener("touchstart", exitUserWrap);

userLogin.addEventListener("click", (e) => {
    if(e.target.nodeName == "INPUT" && e.target.type == "submit") {
        if(isValid("login")) {
            fetchUserAPI(
                "PATCH",
                { "content-type": "application/json" },
                {
                    email: loginEmail.value,
                    password: loginPassword.value
                }
            ).then(result => {
                if(result["ok"]) {
                    window.location.reload();
                } else {
                    loginMessage.textContent = result["message"];
                    loginMessage.parentElement.classList.add("user__err-message--active");
                    loginMessage.parentElement.classList.remove("user__err-message--valid");
                    loginMessage.parentElement.classList.add("user__err-message--invalid");
                }
            });
        }
    }
    if(e.target.nodeName == "A") {
        // 改顯示註冊畫面
        renderUserWrap("signup");
        // 清除畫面資料
        resetUserContainer(userLogin);
    }
});
userSignup.addEventListener("click", (e) => {
    if(e.target.nodeName == "INPUT" && e.target.type == "submit") {
        if(isValid("signup")){
            fetchUserAPI(
                "POST",
                { "content-type": "application/json" },
                {
                    name: signupName.value,
                    email: signupEmail.value,
                    password: signupPassword.value
                }
            ).then(result => {
                if(result["ok"]) {
                    signupMessage.textContent = "註冊成功";
                    signupMessage.parentElement.classList.remove("user__err-message--invalid");
                    signupMessage.parentElement.classList.add("user__err-message--valid");
                    signupMessage.parentElement.classList.remove("user__err-message--invalid");
                } else {
                    signupMessage.textContent = result["message"];
                    signupMessage.parentElement.classList.add("user__err-message--active");
                    signupMessage.parentElement.classList.remove("user__err-message--valid");
                    signupMessage.parentElement.classList.add("user__err-message--invalid");
                }
            });
        }
    }
    if(e.target.nodeName == "A") {
        // 改顯示登入畫面
        renderUserWrap("login");
        // 清除畫面資料
        resetUserContainer(userSignup);
    }
});

// UserWrap 要顯示畫面 (login / signup)
function renderUserWrap(type="default") {
    switch(type) {
        case "login":
            userLogin.classList.add("user-container--active");
            userSignup.classList.remove("user-container--active");
            break;
        case "signup":
            userLogin.classList.remove("user-container--active");
            userSignup.classList.add("user-container--active");
            break;
        default:
            userLogin.classList.remove("user-container--active");
            userSignup.classList.remove("user-container--active");
            break;
    }
}

function exitUserWrap(event) {
    const target = event.target;
    if((target.nodeName == "DIV" && target.classList.contains("user-wrap"))
    || (target.nodeName == "IMG" && target.classList.contains("user__close"))) {
        userWrap.classList.add("user-wrap--inactive");
        userWrap.classList.remove("user-wrap--active");
        renderUserWrap();
        // 清除畫面資料
        resetUserContainer(userLogin);
        resetUserContainer(userSignup);
    }
}

async function fetchUserAPI(methods, headers={}, body=null) {
    if(body) {
        body = JSON.stringify(body);
    }
    return fetch("/api/user", {
        method: methods,
        headers: headers,
        body: body
    }).then((response) => {
        return response.json()
    }).then((result) => {
        return result;
    })
}

function checkData(name=null, email, password) {
    checkResult = { "err": true, "message": "" }
    // 檢核 姓名
    if(name != null && !name) {
        checkResult["message"] = "姓名不可為空白";
        return checkResult;
    }
    // 檢核 電子信箱
    if(!email) {
        checkResult["message"] = "電子信箱不可為空白";
        return checkResult;
    } else {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
        } else {
            checkResult["message"] = "電子信箱格式錯誤";
            return checkResult;
        }
    }
    // 檢核 密碼
    if(!password) {
        checkResult["message"] = "密碼不可為空白";
        return checkResult;
    }
    if(password.length < 6) {
        checkResult["message"] = "密碼長度需超過6位";
        return checkResult;
    }
    // checkResult = { "err": false, "message": "驗證成功" };
    return checkResult;
}

function isValid(checkArea) {
    let valid = true;
    const checkList = document.querySelectorAll(`[data-verify=${checkArea}]`);
    for(const checkItem of checkList) {
        const input = checkItem.querySelector("input");
        const result = checkData(input.name, input.value);
        const messageArea = checkItem.querySelector(".user__err-message");
        messageArea.children[0].textContent = result;
        if(result) {
            valid = false;
            checkItem.classList.add("user__verify-item--invalid");
        } else {
            checkItem.classList.remove("user__verify-item--invalid");
        }
    }
    return valid;
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
            // 之後再調整和後端一致
            // if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(inputValue))) {
            //     return  "電子信箱格式錯誤";
            // }
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

function resetUserContainer(resetArea) {
    const resetList = resetArea.querySelectorAll("div.user__verify-item");
    for(const resetItem of resetList) {
        resetItem.classList.remove("user__verify-item--invalid");
        // 清除 input value
        const input = resetItem.querySelector("input");
        input.value = "";
    }
}