from base64 import encode
from flask import Blueprint, request, Response
import re
import connectDB

api = Blueprint(
	"api",
	__name__,
    template_folder="/templates",
    static_folder="static"
)

dataCount = 12 # 每一頁資料筆數
conn_pool = connectDB.connect("", "mypool", 5)

@api.route("/attractions")
def attractions():
	# 初始化失敗訊息
	response = { "error": True, "message": "系統錯誤" }

	# 檢查連線
	if not conn_pool:
		response["message"] = "資料庫連線失敗"
		return response, 500

	# 接收 query string
	page = request.args.get("page", "0")
	keyword = request.args.get("keyword", "")
	# 檢核 page 是否為 integer
	if not re.match("[-+]?\d+$", page):
		response["message"] = "page 格式錯誤"
		return response, 400

	# 計算起始索引
	startIndex = int(page) * dataCount
	# sql 語法
	query_command_list = []
	query_command_list.append("""
		SELECT
			attraction.id AS id, name, category, description, address, transport, mrt, latitude, longitude,
			GROUP_CONCAT(attraction_image.image) AS images
		FROM attraction
		LEFT JOIN attraction_image ON attraction_image.attraction_id = attraction.id
	""")
	if keyword:
		query_command_list.append("WHERE attraction.name REGEXP %(keyword)s")
	# 多取1筆，若有13筆則表示有下一頁
	query_command_list.append("GROUP BY attraction.id")
	# 多取 1 筆，判斷是否有下一頁
	query_command_list.append("LIMIT %(index)s, %(dataCount)s;")
	result = connectDB.query(
		conn_pool,
		" ".join(query_command_list),
		{ "keyword": keyword, "index": startIndex, "dataCount": dataCount + 1 },
		"all", 0
	)
	# 查詢錯誤，回傳失敗訊息
	if result["status"] == "err":
		response["message"] = "資料庫查詢失敗"
		return response, 500

	# 判斷是否有下一頁
	nextPage = None
	if result["count"] > dataCount:
		nextPage = int(page) + 1
	# 處理資料
	data = []
	for i in range(result["count"]):
		# 回傳資料筆數，不超過設定
		if i > dataCount - 1:
			break
		attraction = result["data"][i]
		data.append({
			"id": attraction[0],
			"name": attraction[1],
			"category": attraction[2],
			"description": attraction[3],
			"address": attraction[4],
			"transport": attraction[5],
			"mrt": attraction[6],
			"latitude": attraction[7],
			"longitude": attraction[8],
			"images": attraction[9].split(","),
		})
	# 調整成功訊息
	response = {
		"nextPage": nextPage,
		"data": data
	}
	return response

@api.route("/attraction/<id>")
def attraction(id):
	# 初始化失敗訊息
	response = { "error": True, "message": "系統錯誤" }
	
	# 檢查連線
	if not conn_pool:
		response["message"] = "資料庫連線失敗"
		return response, 500
	
	# 檢核 id 是否為 integer
	if not re.match("[-+]?\d+$", id):
		response["message"] = "id 格式錯誤"
		return response, 400

	query_command = """
		SELECT
			attraction.id AS id, name, category, description, address, transport, mrt, latitude, longitude,
			GROUP_CONCAT(attraction_image.image) AS images
		FROM attraction
		LEFT JOIN attraction_image ON attraction_image.attraction_id = attraction.id
		WHERE attraction.id = %(id)s
		GROUP BY attraction.id;
	"""
	result = connectDB.query(conn_pool, query_command, { "id":id }, "one", 0)
	# 查詢錯誤，回傳失敗訊息
	if result["status"] == "err":
		response["message"] = "資料庫查詢失敗"
		return response, 500
	
	# 處理資料
	data = {}
	if result["count"] > 0:
		attraction = result["data"]
		data["id"] = attraction[0]
		data["name"] = attraction[1]
		data["category"] = attraction[2]
		data["description"] = attraction[3]
		data["address"] = attraction[4]
		data["transport"] = attraction[5]
		data["mrt"] = attraction[6]
		data["latitude"] = attraction[7]
		data["longitude"] = attraction[8]
		data["images"] = attraction[9].split(",")
	# 調整成功訊息
	response = { "data": data }
	return response
