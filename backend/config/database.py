from flask_pymongo import PyMongo
import os

mongo = PyMongo()

def init_db(app):
    app.config['MONGO_URI'] = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/mindmatch')
    mongo.init_app(app)
    return mongo
