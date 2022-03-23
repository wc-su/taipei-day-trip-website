from mysql.connector import pooling
from dotenv import dotenv_values
from routes.config import config

class DBModel:
    def __init__(self, pool_name, pool_size, db_settings=None):
        self.conn_pool = self.connect(pool_name, pool_size, db_settings)
        self.response = { "status": "err", "count": 0, "data": None }

    def connect(self, pool_name, pool_size, db_settings=None):
        try:
            if not db_settings:
                db_settings = config.db_settings
            # 建立Connection物件
            return pooling.MySQLConnectionPool(pool_name = pool_name,
                                                pool_size = pool_size,
                                                **db_settings)
        except Exception as ex:
            print("*** mysql connect error", ex)
            return None

    def is_connected(self):
        return self.conn_pool

    def reset_response(self):
        self.response["status"] = "err"
        self.response["count"] = 0
        self.response["data"] = None

    def create(self, command, multi_command=False):
        self.reset_response()
        try:
            conn_obj = self.conn_pool.get_connection()
            cursor = conn_obj.cursor()
            if multi_command:
                results = cursor.execute(command, multi=multi_command)
                for cur in results:
                    pass
            else:
                results = cursor.execute(command)

            self.response["status"] = "ok"

            conn_obj.commit()
        except Exception as ex:
            print("*** mysql create error", ex)
        finally:
            if conn_obj.is_connected():
                cursor.close()
                conn_obj.close()

        return self.response

    def insert(self, command, data):
        self.reset_response()
        try:
            conn_obj = self.conn_pool.get_connection()
            cursor = conn_obj.cursor()
            print("db insert", command, data)
            for item in data:
                cursor.execute(command, item)

            self.response["status"] = "ok"

            conn_obj.commit()
        except Exception as ex:
            print("*** mysql insert error", ex)
        finally:
            if conn_obj.is_connected():
                cursor.close()
                conn_obj.close()

        return self.response

    def query(self, command, data, mode, multi_command=False):
        # print("db query:", command, data, mode)
        self.reset_response()
        try:
            conn_obj = self.conn_pool.get_connection()
            cursor = conn_obj.cursor()
            results = cursor.execute(command, data, multi=multi_command)
            
            for cur in results:
                if cur.with_rows:
                    if mode == "one":
                        result = cur.fetchone()
                    else:
                        result = cur.fetchall()
                    count = cur.rowcount
                else:
                    pass

            self.response["status"] = "ok"
            self.response["data"] = result
            self.response["count"] = count

            conn_obj.commit()
        except Exception as ex:
            print("*** mysql query error", ex)
        finally:
            if conn_obj.is_connected():
                cursor.close()
                conn_obj.close()

        return self.response

    def update(self, command, data):
        self.reset_response()
        try:
            conn_obj = self.conn_pool.get_connection()
            cursor = conn_obj.cursor()
            cursor.execute(command, data)

            self.response["status"] = "ok"
            self.response["count"] = cursor.rowcount

            conn_obj.commit()
        except Exception as ex:
            conn_obj.rollback()
            print("*** mysql update error", ex)
        finally:
            if conn_obj.is_connected():
                cursor.close()
                conn_obj.close()

        return self.response

    def delete(self, command, data):
        self.reset_response()
        try:
            conn_obj = self.conn_pool.get_connection()
            cursor = conn_obj.cursor()
            cursor.execute(command, data)

            self.response["status"] = "ok"
            self.response["count"] = cursor.rowcount

            conn_obj.commit()
        except Exception as ex:
            conn_obj.rollback()
            print("*** mysql delete error", ex)
        finally:
            if conn_obj.is_connected():
                cursor.close()
                conn_obj.close()

        return self.response

DB_model = DBModel("mypool", 5)