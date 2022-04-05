from models.connectDB import DB_model

class OrderStatusMouel():
    def __init__(self, DB_model):
        self.DB_model = DB_model

    def insert(self, data):
        command = "INSERT INTO `order_status` (" + ", ".join(data) + ") VALUES (" + ", ".join(["%(" + k + ")s" for k in data.keys()]) + ");"
        return DB_model.insert(command, [data])

    def update_status_by_number(self, data):
        command = "UPDATE `order_status` SET status=%(status)s WHERE number = %(number)s;"
        return DB_model.update(command, data)

order_status_model = OrderStatusMouel(DB_model)