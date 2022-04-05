from models.connectDB import DB_model

class BookingMouel():
    def __init__(self, DB_model):
        self.DB_model = DB_model

    def insert(self, data):
        command = "INSERT INTO booking (" + ", ".join(data) + ") VALUES (" + ", ".join(["%(" + k + ")s" for k in data.keys()]) + ");"
        return DB_model.insert(command, [data])

    def query_by_userid(self, data):
        command = f"""
            SET SESSION GROUP_CONCAT_MAX_LEN = 2500; 
            SELECT a.attraction_id, b.name, b.address, c.image, a.date, a.time, a.price 
            FROM booking a 
            LEFT JOIN attraction b ON b.id = a.attraction_id 
            LEFT JOIN attraction_image c ON c.attraction_id = a.attraction_id 
            WHERE a.user_id = %(user_id)s 
            LIMIT 1; 
        """
        return DB_model.query(command, data, "one", True)

    def update_by_userid(self, data):
        command = "UPDATE booking SET attraction_id= %(attraction_id)s, date= %(date)s, time= %(time)s, price= %(price)s WHERE user_id = %(user_id)s;"
        return DB_model.update(command, data)

    def delete_by_userid(self, data):
        command = "DELETE FROM booking WHERE user_id=%(user_id)s;"
        return DB_model.delete(command, data)

booking_model = BookingMouel(DB_model)