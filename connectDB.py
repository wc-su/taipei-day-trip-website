import mysql.connector
from dotenv import dotenv_values

# 資料庫參數設定
def config(path):
    config = dotenv_values(path + ".env")
    db_settings = {
        "host": config["DBHOST"],
        "port": config["DBPORT"],
        "user": config["DBUSER"],
        "password": config["DBPASSWORD"],
        "db": config["DBDATABASE"],
        "charset": "utf8"
    }
    return db_settings

def connect(env_path, pool_name, pool_size):
    db_settings = config(env_path)
    try:
        # 建立Connection物件
        conn = mysql.connector.connect(pool_name = pool_name,
                                       pool_size = pool_size,
                                       **db_settings)
        return conn
    except Exception as ex:
        print("*** mysql connect error", ex)
        return None

def create(conn, command, multi_command=False):
    reponse = { "status": "err" }
    try:
        cursor = conn.cursor()
        if multi_command:
            results = cursor.execute(command, multi=multi_command)
            for cur in results:
                pass
                # if cur.with_rows:
                #     print('result-1:', cur.fetchall())
                # else:
                #     # print('result-2:', cur.statement, cur.rowcount)
        else:
            results = cursor.execute(command)

        reponse["status"] = "ok"

        conn.commit()
    except Exception as ex:
        print("*** mysql create error", ex)
    finally:
        cursor.close()

    return reponse

def insert(conn, command, data):
    reponse = { "status": "err" }
    try:
        cursor = conn.cursor()
        for item in data:
            cursor.execute(command, item)

        reponse["status"] = "ok"

        conn.commit()
    except Exception as ex:
        print("*** mysql create error", ex)
    finally:
        cursor.close()

    return reponse

def query(conn, command, data, mode, size):
    reponse = { "status": "err", "count": 0, "data": None }

    try:
        with conn.cursor() as cursor:
            cursor.execute(command, data)

            if mode == "one":
                result = cursor.fetchone()
            elif mode == "many":
                result = cursor.fetchmany(size)
            else:
                result = cursor.fetchall()
            
            count = cursor.rowcount

            reponse["status"] = "ok"
            reponse["data"] = result
            reponse["count"] = count

            conn.commit()
    except Exception as ex:
        print("*** mysql query error", ex)
    finally:
        cursor.close()

    return reponse

def update(conn, command, data):
    reponse = { "status": "err", "count": 0 }

    try:
        with conn.cursor() as cursor:
            cursor.execute(command, data)

            reponse["status"] = "ok"
            reponse["count"] = cursor.rowcount

            conn.commit()
    except Exception as ex:
        conn.rollback()
        print("*** mysql update error", ex)
    finally:
        cursor.close()

    return reponse