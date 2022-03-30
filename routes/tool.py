import datetime
import re

class Tool:
    def check_valid_date(self, date_text):
        try:
            datetime.datetime.strptime(date_text, "%Y-%m-%d")
            return True
        except ValueError:
            return False

    def check_int(self, number):
        try:
            if type(number) == int:
                return True
            elif type(number) == float:
                return False
            elif type(number) == str:
                if re.match(r'\d+', number):
                    return True
                else:
                    return False
            else:
                return False
        except:
            return False

tool = Tool()
