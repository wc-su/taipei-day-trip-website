import re

class AttractionView:
    def __init__(self):
        self.response = { "error": True, "message": "系統錯誤" }
        self.http_code = 500


    def get_response(self):
        return self.response, self.http_code


    def check_connect(self, is_connected):
        if is_connected:
            return False
        else:
            self.response["message"] = "資料庫連線失敗"
            self.http_code = 500
            return True


    def check_attractions(self, page):
        # 檢核 page 是否為 integer
        if not re.match("[-+]?\d+$", page):
            self.response["message"] = "page 格式錯誤"
            self.http_code = 400
            return True
        if int(page) < 0:
            self.response["message"] = "page 需大於 0"
            self.http_code = 400
            return True
        return False

    def render_attractions(self, result, page, dataCount):
        # 查詢錯誤，回傳失敗訊息
        if result["status"] == "err":
            self.response["message"] = "資料庫查詢失敗"
            self.http_code = 500
            return self.get_response()
        
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
        self.response = {
            "nextPage": nextPage,
            "data": data
        }
        self.http_code = 200
        return self.get_response()


    def check_attraction(self, id):
        if not re.match("[-+]?\d+$", id):
            self.response["message"] = "id 格式錯誤"
            self.http_code = 400
            return True
        return False

    def render_attraction(self, result):
        # 查詢錯誤，回傳失敗訊息
        if result["status"] == "err":
            self.response["message"] = "資料庫查詢失敗"
            self.http_code = 500
            return self.get_response()
        
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
        self.response = { "data": data }
        self.http_code = 200
        return self.get_response()

attraction_view = AttractionView()