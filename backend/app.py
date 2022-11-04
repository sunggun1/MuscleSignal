from flask import Flask,jsonify
from flask_cors import CORS

from werkzeug.exceptions import HTTPException

app = Flask(__name__)
CORS(app)


from src.controllers import main,muscle,musclePosition,fft
app.register_blueprint(main.bp)
app.register_blueprint(muscle.bp)
app.register_blueprint(musclePosition.bp)
app.register_blueprint(fft.bp)


if __name__ == "__main__":
    app.debug=True
    app.run(port=8000); 
    
