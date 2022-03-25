from flask import Blueprint, request
# Blueprint
from routes.user import user
# models
from models.connectDB import DB_model
from models.attraction import attraction_model
from models.user import user_model
# views
from views.attraction import attraction_view
from views.user import user_view

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

dataCount = 12 # 每一頁資料筆數

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

	result = attraction_model.get_attractions(page, keyword, dataCount)
	return attraction_view.render_attractions(result, page, dataCount)

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
