from flask import Flask
from flask_cors import CORS  # to avoid cors error in different frontend like react js or any other

app = Flask(__name__)
CORS(app)

from src.controllers import user,main,muscle,musclePosition
app.register_blueprint(main.bp)
app.register_blueprint(user.bp)
app.register_blueprint(muscle.bp)
app.register_blueprint(musclePosition.bp)

if __name__ == "__main__":
    app.run(debug=True) 