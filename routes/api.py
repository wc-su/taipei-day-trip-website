from flask import Blueprint, request
# config
from routes.config import config
# Blueprint
from routes.user import user
from routes.booking import booking
# models
from models.connectDB import DB_model
from models.attraction import attraction_model
# views
from views.attraction import attraction_view

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
