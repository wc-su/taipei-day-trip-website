class BookingView():
    def __init__(self):
        self.response = { "error": True, "message": "伺服器內部錯誤" }
        self.http_code = 500

    def get_response(self):
        return self.response, self.http_code

    def render_not_login(self):
        self.response["message"] = "未登入系統，拒絕存取"
        self.http_code = 403
        return self.get_response()

    def render_date_err(self):
        self.response["message"] = "建立失敗，輸入不正確或其他原因"
        self.http_code = 400
        return self.get_response()

    def render(self, result, need_data):
        # 查詢錯誤，回傳失敗訊息
        if result["status"] == "err":
            self.response["message"] = "伺服器內部錯誤"
            self.http_code = 500
            return self.get_response()
        
        # 處理資料
        if need_data:
            data = None
            if result["count"] > 0:
                data = {
                    "attraction": {
                        "id": result["data"][0],
                        "name": result["data"][1],
                        "address": result["data"][2],
                        "image": result["data"][3]
                    },
                    "date": result["data"][4],
                    "time": result["data"][5],
                    "price": result["data"][6],
                }
            # 調整成功訊息
            self.response = { "data": data }
        else:
            self.response = { "ok": True }
        self.http_code = 200
        return self.get_response()


booking_view = BookingView()