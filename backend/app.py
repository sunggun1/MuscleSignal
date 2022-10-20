from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy  # to avoid cors error in different frontend like react js or any other
import pymysql 
from src.config import showjson
import bcrypt
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHMEY_DATABASE_URL'] = sa_url = "mysql+pmysql://"+showjson()['db']['user']+":"+showjson()['db']['password']+"@"+showjson()['db']['host']+"/"+showjson()['db']['name']
app.config['SQLALCHMEY_TRACK_MODIFICATION'] = False
CORS(app)

db = SQLAlchemy(app)

class users(db.Model):
    __tablename__ = 'user'

    '''
        "email": "string",
        "password": "string",
        "created": "datetime",
        "updated": "datetime",
    '''

    id = db.Column(db.Integer, primary_key=True, nullable=False, autoincrement=True)
    email = db.Column(
        db.String(40),
        unique=True,
        nullable=False
    )
    password = db.Column(
        db.String(200),
        primary_key=False,
        unique=False,
        nullable=False
	)
    created = db.Column(
        db.DateTime,
        index=False,
        unique=False,
        nullable=True
    )
    updated = db.Column(
        db.DateTime,
        index=False,
        unique=False,
        nullable=True
    )

    muscle = db.relationship('muscle')
    muscle_position = db.relationship('muscle_position')

    def __init__(self, email,password):
        self.email = email
        self.password = bcrypt.hashpw(password.encode('utf-8'),bcrypt.gensalt())

    def check_password(self, password):
        return bcrypt.checkpw(self.password,password)

class musclePosition(db.Model):
    __tablename__ = 'muscle_position'

    '''
        "position_name" : "string",
        "user_id" : "string",
        "created": "datetime",
        "updated": "datetime",
    '''

    id = db.Column(db.Integer, primary_key=True, nullable=False, autoincrement=True)
    position_name = db.Column(
        db.String(40),
        nullable=False
    )
    user_id = db.Column(db.Integer,db.ForeignKey('user.id'),nullable=False)
    created = db.Column(db.DateTime, default=datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3])
    updated = db.Column(db.DateTime, default=datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3])

    def __init__(self, position_name, user_id):
        db.create_all()
        db.session.commit()
        self.position_name = position_name        
        self.user_id = user_id


class muscle(db.Model):
    __tablename__ = 'muscle'

    '''
        "power" : "number",
        "time" : "datetime",
        "muscleposition_id" : "number",
        "user_id" : "number",
        "created": "datetime",
        "updated": "datetime",
    '''

    id = db.Column(db.Integer, primary_key=True, nullable=False, autoincrement=True)
    power = db.Column(db.Integer,nullable=False)
    time = SQLAlchemy.dialects.mysql.DATETIME(fsp=3)
    muscle_position_id = db.Column(db.Integer, db.ForeignKey("muscle_position.id"), nullable=False)
    user_id = db.Column(db.Integer,db.ForeignKey('user.id'),nullable=False)

    created = db.Column(db.DateTime, default=datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3])
    updated = db.Column(db.DateTime, default=datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3])

    def __init__(self, power, time, muscle_position_id, userId):
        self.power = power
        self.time = time
        self.muscle_position_id = muscle_position_id
        self.userId = userId

    from src.controllers import user,main,muscle,musclePosition
    app.register_blueprint(main.bp)
    app.register_blueprint(user.bp)
    app.register_blueprint(muscle.bp)
    app.register_blueprint(musclePosition.bp)

if __name__ == "__main__":
    db.create_all()
    db.init_app(app)
    app.run(debug=True) 
