from models.connectDB import DB_model

class UserModel:
    def __init__(self, DB_model):
        self.DB_model = DB_model
    
    # 取得當前登入的使用者資訊
    def getUser(self):
        print("user model get")

    # 註冊一個新的使用者
    def postUser(self, data):
        command = "INSERT INTO user (" + ", ".join(data) + ") VALUES (" + ", ".join(["%(" + k + ")s" for k in data.keys()]) + ");"
        return DB_model.insert(command, [data])

    # 登入使用者帳號
    def patchUser(self, data):
        command = "SELECT * FROM user WHERE " + " AND ".join([k + " = %(" + k + ")s" for k in data.keys()]) + ";"
        return DB_model.query(command, data, "one", True)

user_model = UserModel(DB_model)