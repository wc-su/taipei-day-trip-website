from models.connectDB import DB_model

class UserModel:
    def __init__(self, DB_model):
        self.DB_model = DB_model

    # 註冊一個新的使用者
    def insert(self, data):
        command = "INSERT INTO user (" + ", ".join(data) + ") VALUES (" + ", ".join(["%(" + k + ")s" for k in data.keys()]) + ");"
        return DB_model.insert(command, [data])

    # 搜尋使用者資訊
    def query(self, data):
        command = "SELECT * FROM user WHERE " + " AND ".join([k + " = %(" + k + ")s" for k in data.keys()]) + ";"
        return DB_model.query(command, data, "one", True)

user_model = UserModel(DB_model)