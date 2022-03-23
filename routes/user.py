from flask import Blueprint, request, make_response
import jwt
from datetime import datetime, timedelta

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

@user.route("/", methods=["GET"])
def user_get():
    token = request.cookies.get('authId')
    res = logincheck(token)
    # print("decode result:", res)
    if res["status"] == "ok":
        return {
            "data": {
                "id": res["data"]["id"],
                "name": res["data"]["name"],
                "email": res["data"]["email"]
            }
        }, 200
    else:
        return { "data": None }, 200

@user.route("/", methods=["POST"])
def user_post():
    name = request.json["name"]
    email = request.json["email"]
    password = request.json["password"]
    # print("name:", name, ", email:", email, "password:", password)

    # check

    # signup
    result = user_model.postUser({
        "name": name,
        "email": email,
        "password": password
    })
    return user_view.render(result)

@user.route("/", methods=["PATCH"])
def user_patch():
    email = request.json["email"]
    password = request.json["password"]
    # print("email:", email, "password:", password)

    # check

    # login
    result = user_model.patchUser({
        "email": email,
        "password": password
    })
    resp = make_response(user_view.render_login(result))
    # print(user_view.data)
    token = make_token(user_view.data)
    resp.set_cookie("authId", token, expires=datetime.utcnow() + timedelta(days=1))
    return resp

@user.route("/", methods=["DELETE"])
def user_delete():
    resp = make_response(user_view.render_logout())
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
    except jwt.ExpiredSignatureError:
        res["message"] = "login expir"
    except Exception as e:
        res["message"] = e
    finally:
        return res

# def logincheck(*methods):
#     def _logincheck(func):
#         def wrapper(request, *args, **kwargs):
#             token = request.META.get("HTTP_AUTHORIZATION")
#             if request.method not in methods:
#                 return func(request, *args, **kwargs)
#             if not token:
#                 user_view.set_response("no token", 500)
#                 return user_view.get_response()
#             try:
#                 key = config.env_config["JWT_SECRET"]
#                 res = jwt.decode(token, key, algorithms=['HS256'])
#             except jwt.ExpiredSignatureError:
#                 user_view.set_response("login again", 500)
#                 return user_view.get_response()
#             except Exception as e:
#                 user_view.set_response("Internal Server Error", 500)
#                 return user_view.get_response()
#             email = res['email']
#             # user = User.objects.filter(email = email)
#             # if not user:
#             #     user_view.set_response("User does not exist", 200)
#             #     return user_view.get_response()
#             request.user = user
#             return func(request, *args, **kwargs)
#         return wrapper
#     return _logincheck


# 在作業文件 Part 4-1 中的 JWT機制 的 第1點，
# 最後有提到「指示前端紀錄在 Cookie 中。」。
# 想請問老師，
# 在前後端分離的情況下，token 記在 cookie 的動作，通常會是後端將加密 token、有效時間給前端，再由前端寫入嗎？
# 還是每間公司有不同的處理(分工)方式？
# 因為有看到 flask 的 set_cookie 可以直接由後端寫到 cookie
