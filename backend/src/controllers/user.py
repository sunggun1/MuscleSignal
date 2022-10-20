import json
from flask import Flask, jsonify, request,Blueprint
import datetime
import bcrypt
import sys
import os
import jwt
sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))

from app import users,db # call model file
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

bp = Blueprint('users', __name__, url_prefix='/users')




@bp.route('/create',methods=['POST'])
def create():
    try:
        data = json.loads(request.get_data().decode('utf-8'))
        User = users(data["email"],data["password"])
        if(users.query.filter_by(email=data["email"]).first()):
            return jsonify({'token':'','result':'이미 이메일이 있습니다.'})
        else:
            db.session.add(User)
            db.session.commit()
            payload = {'email' : data["email"], 'exp': datetime.datetime.now() + datetime.timedelta(minutes=30)}
            token = jwt.encode(payload,os.environ.get("JWT_SECRET_KEY"),os.environ.get("JWT_ALGORITHM"))
            return jsonify({'token':token, 'result' : 'success'})
    except ValueError:
        return jsonify({'token':'','result': ValueError})
    
@bp.route('/login',methods=['POST'])
def login():
    try:
        data = json.loads(request.get_data().decode('utf-8'))
        user_data = users.query.filter_by(email=data["email"]).first()

        if(user_data.check_password(data["password"].encode('utf-8'))):
            payload = {'email' : data["email"], 'exp': datetime.datetime.now() + datetime.timedelta(minutes=30)}
            token = jwt.encode(payload,os.environ.get("JWT_SECRET_KEY"),os.environ.get("JWT_ALGORITHM"))
            return jsonify({'token': token, 'result': 'success'})
        else :
            return jsonify({'token': '', 'result': '잘못된 비밀번호입니다.'})
    except ValueError:
        return jsonify({'token': '','result': ValueError})
