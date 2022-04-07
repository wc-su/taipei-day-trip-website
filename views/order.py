class OrderView():
    def __init__(self):
        self.response = { "error": True, "message": "伺服器內部錯誤" }
        self.http_code = 500

    def get_response(self):
        return self.response, self.http_code

    def render_not_login(self):
        self.response["message"] = "未登入系統，拒絕存取"
        self.http_code = 403
        return self.get_response()

    def render_server_error(self):
        self.response["message"] = "伺服器內部錯誤"
        self.http_code = 500
        return self.get_response()

    def render_query(self, query_data=None):
        if query_data:
            return {
                "data": {
                    "number": query_data[0],
                    "price": query_data[2],
                    "trip": {
                        "attraction": {
                            "id": query_data[3],
                            "name": query_data[4],
                            "address": query_data[5],
                            "image": query_data[6],
                        },
                        "date": query_data[7],
                        "time": query_data[8]
                    },
                    "contact": {
                        "name": query_data[9],
                        "email": query_data[10],
                        "phone": query_data[11]
                    },
                    "status": query_data[12]
                }
            }
        else:
            return {
                "data": None
            }

    def render_setOrder(self, orderNumber, pay_result):
        # 預設成功回應
        result = {
            "data": {
                "number": orderNumber,
                "payment": {
                    "status": 0,
                    "message": "付款成功"
                }
            }
        }
        if not pay_result: # 付款失敗
            result["data"]["payment"]["status"] = 1
            result["data"]["payment"]["message"] = "付款失敗"
        
        return result

order_view = OrderView()