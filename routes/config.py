from dotenv import dotenv_values

class Config:
    def get_env_config(self, path):
        self.env_config = dotenv_values(path + ".env")
        try:
            self.db_settings = {
                "pool_reset_session": True,
                "host": self.env_config["DBHOST"],
                "port": self.env_config["DBPORT"],
                "user": self.env_config["DBUSER"],
                "password": self.env_config["DBPASSWORD"],
                "database": self.env_config["DBDATABASE"],
                "charset": "utf8"
            }
        except Exception as e:
            print("*** env load error:", e)

config = Config()
config.get_env_config("")