import json
from flask import Flask, jsonify, request,Blueprint
import datetime
import bcrypt
import sys
import os
import jwt
sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))

from models import user  # call model file
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

bp = Blueprint('user', __name__, url_prefix='/user')

user = user.User()

@bp.route('/create',methods=['POST'])
def create():
    try:
        data = json.loads(request.get_data().decode('utf-8'))
        email = data["email"]
        password = data["password"]
        hashed = bcrypt.hashpw(password.encode('utf-8'),bcrypt.gensalt())
        
        if(user.find_by_one({'email':email})):
            return jsonify({'token':'','result':'이미 이메일이 있습니다.'})
        else:
            data_info = {}
            data_info['email'] = email
            data_info['password'] = hashed
            user.create(data_info) 
        payload = {'email' : email, 'exp': datetime.datetime.now() + datetime.timedelta(minutes=30)}
        token = jwt.encode(payload,os.environ.get("JWT_SECRET_KEY"),os.environ.get("JWT_ALGORITHM"))
        return jsonify({'token':token, 'result' : 'success'})
    except ValueError:
        return jsonify({'token':'','result': ValueError})
    
@bp.route('/login',methods=['POST'])
def login():
    try:
        data = json.loads(request.get_data().decode('utf-8'))
        email = data["email"]
        password = data["password"].encode('utf-8')
        user_data = user.find_by_one({"email": email})

        if(bcrypt.checkpw(password,user_data["password"])):
            payload = {'email' : email, 'exp': datetime.datetime.now() + datetime.timedelta(minutes=30)}
            token = jwt.encode(payload,os.environ.get("JWT_SECRET_KEY"),os.environ.get("JWT_ALGORITHM"))
            return jsonify({'token': token, 'result': 'success'})
        else :
            return jsonify({'token': '', 'result': '잘못된 비밀번호입니다.'})
    except ValueError:
        return jsonify({'token': '','result': ValueError})
