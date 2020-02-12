from flask import Flask, render_template
import process_data

app = Flask(__name__)


@app.route("/")
def index():
    global data_map
    data = {'data_map': data_map}
    return render_template("index.html", data=data)


if __name__ == "__main__":
    data_map = process_data.constructData("players.csv")

    app.config["CACHE_TYPE"] = "null"
    app.run()
