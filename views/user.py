class UserView:
    def __init__(self):
        self.ok_response = { "ok": True }
        self.err_response = { "error": True, "message": "" }
        self.http_code = 200
        self.response_flag = True # 依該 flag 決定回傳 ok / err 訊息
        self.token_data = None

    def set_reponse(self, flag, response, http_code):
        self.response_flag = flag
        self.err_response["message"] = response
        self.http_code = http_code

    def render(self, result):
        if result:
            if result["status"] == "err":
                self.set_reponse(False, "伺服器內部錯誤", 500)
            else:
                self.token_data = None
                if result["count"] > 0:
                    if result["data"]:
                        self.token_data = {
                            "id": result["data"][0],
                            "name": result["data"][1],
                            "email": result["data"][2]
                        }
                    self.set_reponse(True, "", 200)
                else:
                    self.set_reponse(False, "登入失敗，帳號或密碼錯誤或其他原因", 400)
            return self.render(None)
        else:
            if self.response_flag:
                return self.ok_response, self.http_code
            else:
                return self.err_response, self.http_code

user_view = UserView()