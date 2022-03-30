from flask import Blueprint, request
import re

from routes.user import get_userid
from routes.tool import tool
from models.booking import booking_model
from views.booking import booking_view

booking = Blueprint(
	"booking",
	__name__,
    template_folder="/templates",
    static_folder="static"
)

# 取得尚未確認下單的預定行程
@booking.route("/", methods=["GET"])
def booking_get():
    # print("booking get")
    user_id = get_userid()
    # 未登入
    if not user_id:
        return booking_view.render_not_login()
    # print("  -> booking user id:", user_id)
    result = booking_model.query_by_userid({
        "user_id": user_id
    })
    # print("  -> get result:", result)
    return booking_view.render(result, True)

# 建立新的預定行程
@booking.route("/", methods=["POST"])
def booking_post():
    # print("booking post")
    user_id = get_userid()
    # 未登入
    if not user_id:
        return booking_view.render_not_login()

    # 取得行程資訊
    attraction_id = request.json["attractionId"]
    date = request.json["date"]
    time = request.json["time"]
    price = request.json["price"]
    # 檢核資料格式
    if not data_check(attraction_id, date, time, price):
        return booking_view.render(result, False)
    # 檢核是否有預定行程
    result = booking_model.query_by_userid({
        "user_id": user_id
    })
    if result["status"] == "ok" and result["count"] > 0:
        # 有預定行程，更新資料庫
        result = booking_model.update_by_userid({
            "user_id": user_id,
            "attraction_id": attraction_id,
            "date": date,
            "time": time,
            "price": price
        })
    else:
        # 無預定行程，寫入資料庫
        result = booking_model.insert({
            "user_id": user_id,
            "attraction_id": attraction_id,
            "date": date,
            "time": time,
            "price": price
        })
    return booking_view.render(result, False)
    # return { "error": True, "message": "測試" }, 403

# 刪除目前的預定行程
@booking.route("/", methods=["DELETE"])
def booking_delete():
    print("booking delete")
    user_id = get_userid()
    # 未登入
    if not user_id:
        return booking_view.render_not_login()

    result = booking_model.delete_by_userid({
        "user_id": user_id
    })
    return booking_view.render(result, False)
    # return { "error": True, "message": "測試" }, 403


# 欄位檢核
def data_check(attraction_id, date_text, time, price):
    # 不可為空白
    if (not attraction_id) or (not date_text) or (not time) or (not price):
        print("this check error 1", attraction_id, date_text, time, price)
        return False
    
    # 檢核為數值格式
    if (not tool.check_int(attraction_id)) or (not tool.check_int(price)):
        print("this check error 2: not int", attraction_id, type(attraction_id), price, type(price))
        return False

    # 檢核日期格式
    if not tool.check_valid_date(date_text):
        print("this check error 3: date", date_text)
        return False

    if time not in ["morning", "afternoon"]:
        print("this check error 4: time", time)
        return False

    # 檢核成功
    return True