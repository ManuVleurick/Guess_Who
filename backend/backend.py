from flask import Flask, request, jsonify
from get_content import get_response, trying_guess
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route("/get_content",methods=["POST"])
def get_content_api():
    print("get_content")
    data = request.get_json()
    result = get_response(data["msg"],data["persona"])
    return jsonify({"result": result})

@app.route("/try_guess",methods=["POST"])
def try_guess():
    data = request.get_json()
    result = trying_guess(data["msg"],data["persona"])
    return jsonify({"result": result})

if __name__ == "__main__":
    app.run(port=5500, debug=True)