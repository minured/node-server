import pymysql
import time
import requests
import json
import os

order_str = '''

'''

cookie = ""

order_list = list(order_str.strip().split("\n"))

undone = []


def query_serial_number(order_list):
    result = []
    length = len(order_list)
    mysql_con = pymysql.connect("10.245.32.85", "prod_jzjk_stats", "prod_dparameter_9827", "stats")
    cursor = mysql_con.cursor(pymysql.cursors.DictCursor)
    for index, order_id in enumerate(order_list):
        sql = "SELECT a.serial_number FROM worksheet a WHERE order_id = '%s' LIMIT 1 " % order_id
        cursor.execute(sql)
        res = cursor.fetchone()
        result.append({
            "order_id": order_id,
            "serial_number": res['serial_number'],
        })
        print("{}/{}: {}, {}".format(index + 1, length, order_id, res["serial_number"]))

    cursor.close()
    mysql_con.close()
    path = os.path.join(os.getcwd(), "output")
    if not (os.path.exists(path)):
        os.mkdir(path)

    with open("./output/" + filename + ".txt", "w+") as f:
        f.write(output_result)
        print("\n业务号码已保存到 output/{}.txt\n".format(filename))
    return result


print("查询用户状态：")


def query_jk_user_state(model, cookie):
    xiaohu = "销户：\n"
    kaitong = "\n开通：\n"
    others = "\n其他：\n"
    url = "http://10.123.0.205/gCustWeb/groupCust/ajax!queryUserListByUser.jspa"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36",
        "Cookie": cookie,
    }
    params = {
        "_search": "false",
        "nd": "1608198659814",
        "rows": "10",
        "page": "1",
        "sidx": "serialNumber",
        "sord": "asc",
        "user.serialNumber": "",
        "provincrCodeQry": "00",
        "serviceId": ""
    }
    for index, item in enumerate(model):
        params["user.serialNumber"] = item['serial_number']
        res = requests.post(url, headers=headers, data=params)
        try:
            user_state = res.json()["rows"][0]['userState']
        except:
            print(res.text)
            print("请求错误，请检查cookie和params")
            break

        print("{}: {}".format(item["serial_number"], user_state))

        item['userState'] = user_state

        if user_state == "销户":
            xiaohu += "{}\n".format(item["order_id"])
        elif user_state == "开通":
            kaitong += "{}\n".format(item["order_id"])
        else:
            others += "{}\n".format(item["order_id"])

    output_result = xiaohu + kaitong + others

    with open("./output/result.txt", "w") as f:
        f.write(xiaohu + kaitong + others)

    with open("./output/json.txt", "w") as f:
        f.write(json.dumps(model, ensure_ascii=False))
    print("结果保存output下")


model = query_serial_number(order_list)
query_jk_user_state(model)
