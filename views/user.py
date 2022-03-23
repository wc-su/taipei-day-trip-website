from flask import make_response

class UserView:
    def __init__(self):
        self.response = { "error": True, "message": "系統錯誤" }
        self.http_code = 500
        self.data = None
    
    def get_response(self):
        return self.response, self.http_code

    def set_response(self, response, http_code):
        self.response = response
        self.http_code = http_code

    def render(self, result):
        print("user view render", result)
        if result["status"] == "err":
            pass
        else:
            self.response = {
                "ok": True
            }
            self.http_code = 200
        return self.get_response()

    def render_login(self, result):
        print("user view render login", result)
        if result["status"] == "err":
            pass
        else:
            self.data = {
                "id": result["data"][0],
                "name": result["data"][1],
                "email": result["data"][2]
            }
            self.response = {
                "ok": True
            }
            self.http_code = 200
        return self.get_response()

    def render_logout(self):
        self.response = {
                "ok": True
            }
        self.http_code = 200
        return self.get_response()

user_view = UserView()