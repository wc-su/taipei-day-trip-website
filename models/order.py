from models.connectDB import DB_model

class OrderMouel():
    def __init__(self, DB_model):
        self.DB_model = DB_model

    def insert(self, data):
        command = "INSERT INTO `order` (" + ", ".join(data) + ") VALUES (" + ", ".join(["%(" + k + ")s" for k in data.keys()]) + ");"
        return DB_model.insert(command, [data])

    def query_by_number(self, data):
        command = f"""
            SELECT 
                a.*, IFNULL(b.status, 1) status 
            FROM `order` a 
            LEFT JOIN `order_status` b ON b.number = a.number 
            WHERE a.number = %(number)s AND a.user_id=%(user_id)s; 
        """
        return DB_model.query(command, data, "one", True)

order_model = OrderMouel(DB_model)