import json
from flask import Flask, json
import os

def showjson():
    with open(os.path.join(os.path.dirname(__file__), "db_config.json")) as file:
        return json.load(file)
        