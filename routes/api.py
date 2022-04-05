from flask import Blueprint, request
import datetime
import requests
# config
from routes.config import config
# Blueprint
from routes.user import user, get_userid
from routes.booking import booking
# models
from models.connectDB import DB_model
from models.attraction import attraction_model
from models.order import order_model
from models.order_status import order_status_model
# views
from views.attraction import attraction_view
from views.order import order_view

api = Blueprint(
	"api",
	__name__,
    template_folder="/templates",
    static_folder="static"
)

api.register_blueprint(
    user,
    url_prefix="/user"
)
api.register_blueprint(
    booking,
    url_prefix="/booking"
)

@api.route("/attractions")
def attractions():
	# 檢核 資料庫連線
	if attraction_view.check_connect(DB_model.is_connected()):
		return attraction_view.get_response()

	page = request.args.get("page", "0")
	keyword = request.args.get("keyword", "")
	# 檢核 query string
	if attraction_view.check_attractions(page):
		return attraction_view.get_response()

	result = attraction_model.get_attractions(page, keyword, config.page_unit_count)
	return attraction_view.render_attractions(result, page, config.page_unit_count)

@api.route("/attraction/<id>")
def attraction(id):
	# 檢核 資料庫連線
	if attraction_view.check_connect(DB_model.is_connected()):
		return attraction_view.get_response()
	
	# 檢核 id
	if attraction_view.check_attraction(id):
		return attraction_view.get_response()
	
	result = attraction_model.get_attraction(id)
	return attraction_view.render_attraction(result)


@api.route("/order/<orderNumber>", methods=["GET"])
def order(orderNumber):
	# 確認會員是否登入
	user_id = get_userid()
    # 未登入
	if not user_id:
		return order_view.render_not_login()

	# 檢核 query string

	# 查詢資料庫
	query_result = order_model.query_by_number({ "number": orderNumber })
	if query_result["status"] == "ok":
		return order_view.render_query(query_result["data"])
	else:
		return order_view.render_query()

@api.route("/orders", methods=["POST"])
def orders():
	# 確認會員是否登入
	user_id = get_userid()
    # 未登入
	if not user_id:
		return order_view.render_not_login()

	prime = request.json["prime"]
	order = request.json["order"]
	contact = request.json["contact"]

	# 檢核 data

	# 以日期(取到毫秒)做為訂單流水號
	orderNumber = datetime.datetime.now().strftime('%Y%m%d%H%M%S%f')
	# 訂單寫入資料庫
	insert_result = order_model.insert({
		"number": orderNumber,
		"user_id": user_id,
		"price": order["price"],
		"attraction_id": order["trip"]["attraction"]["id"],
		"attraction_name": order["trip"]["attraction"]["name"],
		"attraction_address": order["trip"]["attraction"]["address"],
		"attraction_image": order["trip"]["attraction"]["image"],
		"date": order["trip"]["date"],
		"time": order["trip"]["time"],
		"contact_name": contact["name"],
		"contact_email": contact["email"],
		"contact_phone": contact["phone"]
	})
	# 寫入資料庫
	if insert_result["status"] == "ok":
		pay_status = 1 # 未付款
		# 付款
		pay_result = tappay(prime, order["price"], {
			"name": contact["name"],
			"email": contact["email"],
			"phone": contact["phone"]
		})
		if pay_result["status"] == 0:
			pay_status = 0 # 付款成功

		# 記錄至資料庫
		insert_order_status_result = order_status_model.insert({
			"number": orderNumber,
			"status": pay_status
		})
		if insert_order_status_result["status"] == "ok":
			return order_view.render_setOrder(orderNumber, (pay_status == 0))
		else:
			return order_view.render_server_error()
	else:
		return order_view.render_server_error()

def tappay(prime, amount, card_holder_data):
	# 設定資料
	request_url = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"
	request_headers = {
		"Content-Type": "application/json",
		"x-api-key": config.env_config["TAPPAY_PARTNERKEY"]
	}
	request_data = {
		"prime": prime,
		"partner_key": config.env_config["TAPPAY_PARTNERKEY"],
		"merchant_id": "theblissout_NCCC",
		"details":"TapPay Test",
		"amount": amount,
		"cardholder": {
			"phone_number": card_holder_data["phone"],
			"name": card_holder_data["name"],
			"email": card_holder_data["email"]
		},
		"remember": False
	}
	# 向 TapPay 發出請求
	response = requests.post(request_url, headers=request_headers, json=request_data)
	return response.json()