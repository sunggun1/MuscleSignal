from flask import Flask
from flask_cors import CORS
from flaskext.mysql import MySQL
from src.database import dbModule

app = Flask(__name__)
CORS(app)

from src.controllers import main,muscle,musclePosition,fft
app.register_blueprint(main.bp)
app.register_blueprint(muscle.bp)
app.register_blueprint(musclePosition.bp)
app.register_blueprint(fft.bp)

if __name__ == "__main__":
    app.run(debug=True) 
    
