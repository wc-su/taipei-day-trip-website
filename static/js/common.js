const navMenu = document.querySelector(".menu");
const itemLogin = document.querySelector("#item-login");
const itemLogout = document.querySelector("#item-logout");
// 登入/註冊事件
const userWrap = document.querySelector(".user-wrap");
const userContainer = document.querySelector(".user-container");

const userLogin = document.querySelector("#user-login");
const loginEmail = document.querySelector("#login-email");
const loginPassword = document.querySelector("#login-password");

const userSignup = document.querySelector("#user-signup");
const signupName = document.querySelector("#signup-name");
const signupEmail = document.querySelector("#signup-email");
const signupPassword = document.querySelector("#signup-password");

// 頁面初始
window.addEventListener("DOMContentLoaded", () => {
    console.log("window DOMContentLoaded");
    initDOMLoaded();
});
async function initDOMLoaded() {
    return fetch("/api/user"
    ).then((response) => {
        return response.json()
    }).then((data) => {
        console.log(data);
        if(data.data) {
            console.log("ok", data);
            // itemLogin.parentElement.classList.add("menu__item--inactive");
            itemLogout.parentElement.classList.remove("menu__item--inactive");
        } else {
            console.log("fail");
            itemLogin.parentElement.classList.remove("menu__item--inactive");
            // itemLogout.parentElement.classList.add("menu__item--inactive");
        }
    })
}
window.addEventListener("load", () => {
    console.log("window load");
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
                userLogin.classList.add("user-container--active");
                break;
            case "logout":
                fetch("/api/user", {
                    method: "DELETE",
                    headers: { "content-type": "application/json" }
                }).then((response) => {
                    return response.json()
                }).then((data) => {
                    console.log(data);
                    if(data["ok"]) {
                        console.log("ok");
                        window.location.reload();
                    } else {
                        console.log("fail");
                    }
                })
                break;
        }
    }
});
userWrap.addEventListener("click", (e) => {
    e.preventDefault();
    if(e.target.nodeName == "DIV") {
        if(e.target.classList.contains("user-wrap") || e.target.classList.contains("user__close-line")) {
            userWrap.classList.add("user-wrap--inactive");
            userWrap.classList.remove("user-wrap--active");
            userLogin.classList.remove("user-container--active");
            userSignup.classList.remove("user-container--active");
        }
    }
});
userLogin.addEventListener("click", (e) => {
    if(e.target.nodeName == "INPUT" && e.target.type == "submit") {
        console.log("login");
        fetch("/api/user", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                email: loginEmail.value,
                password: loginPassword.value
            })
        }).then((response) => {
            return response.json()
        }).then((data) => {
            console.log(data);
            if(data["ok"]) {
                console.log("ok");
                window.location.reload();
            } else {
                console.log("fail");
            }
        })
    }
    // 改顯示註冊畫面
    if(e.target.nodeName == "A") {
        userLogin.classList.remove("user-container--active");
        userSignup.classList.add("user-container--active");
    }
});
userSignup.addEventListener("click", (e) => {
    if(e.target.nodeName == "INPUT" && e.target.type == "submit") {
        console.log("signup");
        fetch("/api/user", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                name: signupName.value,
                email: signupEmail.value,
                password: signupPassword.value
            })
        }).then((response) => {
            return response.json()
        }).then((data) => {
            console.log(data);
            if(data["ok"]) {
                console.log("ok");
            } else {
                console.log("fail");
            }
        })
    }
    // 改顯示登入畫面
    if(e.target.nodeName == "A") {
        userLogin.classList.add("user-container--active");
        userSignup.classList.remove("user-container--active");
    }
});