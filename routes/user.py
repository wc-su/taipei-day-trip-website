from flask import Blueprint, request, make_response
import jwt
from datetime import datetime, timedelta
import re

from routes.config import config
from models.user import user_model
from views.user import user_view

user = Blueprint(
	"user",
	__name__,
    template_folder="/templates",
    static_folder="static"
)

secret_key = config.env_config["JWT_SECRET"]

# 取得當前使用者資訊
@user.route("/", methods=["GET"])
def user_get():
    # 取得 token
    get_authToken()
    token = request.cookies.get('authId')
    # 檢核使用者狀態
    result = logincheck(token)
    response = { "data": None }
    if result["status"] == "ok":
        # 確認狀態為登入，回傳使用者資料
        response["data"] = {
            "id": result["data"]["id"],
            "name": result["data"]["name"],
            "email": result["data"]["email"]
        }

    # 回傳
    return response, 200

# 註冊新的使用者
@user.route("/", methods=["POST"])
def user_post():
    # 取得註冊資訊
    name = request.json["name"]
    email = request.json["email"]
    password = request.json["password"]

    # 檢核資訊
    chk_result = login_data_check(name, email, password)
    if not chk_result:
        user_view.set_response(False, "註冊失敗，重複的 Email 或其他原因", 400)
        return user_view.render(None)

    # 檢核是否重複註冊
    result = user_model.query({
        "email": email
    })
    if result["status"] == "ok" and result["count"] > 0:
        user_view.set_reponse(False, "註冊失敗，重複的 Email 或其他原因", 400)
        return user_view.render(None)

    # 寫入資料庫
    result = user_model.insert({
        "name": name,
        "email": email,
        "password": password
    })
    return user_view.render(result)

# 登入
@user.route("/", methods=["PATCH"])
def user_patch():
    # 取得登入資訊
    email = request.json["email"]
    password = request.json["password"]

    # 檢核資訊
    chk_result = login_data_check(None, email, password)
    if not chk_result:
        user_view.set_reponse(False, "登入失敗，帳號或密碼錯誤或其他原因", 400)
        return user_view.render(None)
    
    # 資料庫搜尋登入資訊
    result = user_model.query({
        "email": email,
        "password": password
    })
    resp = make_response(user_view.render(result))
    # 將使用者資訊寫入 cookie
    if user_view.token_data:
        token = make_token(user_view.token_data)
        resp.set_cookie("authId", token, expires=datetime.utcnow() + timedelta(days=1), httponly = True)
        # resp.headers["Authorization"] = "Bearer " + token
    return resp

# 登出
@user.route("/", methods=["DELETE"])
def user_delete():
    # 將使用者資訊從 cookie 刪除
    user_view.set_reponse(True, "", 200)
    resp = make_response(user_view.render(None))
    resp.delete_cookie("authId")
    return resp


def make_token(data):
    payload = {
        **data,
        "exp": datetime.utcnow() + timedelta(days=1)
    }
    return jwt.encode(payload, secret_key, algorithm = "HS256")

def logincheck(token):
    res = { "status": "err", "data": None, "message": "驗證錯誤" }
    try:
        decode_token = jwt.decode(token, secret_key, algorithms=['HS256'])
        res["status"] = "ok"
        res["data"] = decode_token
        res["message"] = "驗證成功"
    # except jwt.ExpiredSignatureError:
    #     res["message"] = "login expir"
    except Exception as e:
        res["message"] = e
    finally:
        return res

def login_data_check(name, email, password):
    # 不可為空白
    if (name != None and (not name)) or (not email) or (not password):
        return False
    
    # 檢核 email 格式
    if not re.match(config.email_regex, email):
        return False 

    return True


# 需再調整
def get_authToken():
    header_auth = request.headers.get("Authorization")
    # print("header auth token:", header_auth)
    token = request.cookies.get('authId')
    header_auth = token
    return header_auth

def get_userid():
    token = get_authToken()
    result = logincheck(token)
    if result["status"] == "ok":
        return result["data"]["id"]
    return None