from flask import Blueprint, request, jsonify
from config.database import mongo
from utils.jwt_utils import token_required
from bson import ObjectId
from datetime import datetime

notif_bp = Blueprint('notifications', __name__)

@notif_bp.route('/', methods=['GET'])
@token_required
def get_notifications():
    notifs = list(mongo.db.notifications.find(
        {'user_id': request.user_id}
    ).sort('created_at', -1).limit(50))
    return jsonify([_fmt(n) for n in notifs]), 200

@notif_bp.route('/unread-count', methods=['GET'])
@token_required
def unread_count():
    count = mongo.db.notifications.count_documents({'user_id': request.user_id, 'read': False})
    return jsonify({'count': count}), 200

@notif_bp.route('/mark-read', methods=['POST'])
@token_required
def mark_read():
    data = request.get_json()
    nid = data.get('notification_id')
    if nid:
        mongo.db.notifications.update_one({'_id': ObjectId(nid)}, {'$set': {'read': True}})
    else:
        mongo.db.notifications.update_many({'user_id': request.user_id}, {'$set': {'read': True}})
    return jsonify({'message': 'Marked read'}), 200

@notif_bp.route('/delete/<nid>', methods=['DELETE'])
@token_required
def delete_notif(nid):
    mongo.db.notifications.delete_one({'_id': ObjectId(nid), 'user_id': request.user_id})
    return jsonify({'message': 'Deleted'}), 200

def create_notification(db, user_id, type_, title, message, meta=None):
    """Helper to create a notification in DB"""
    notif = {
        'user_id': str(user_id),
        'type': type_,
        'title': title,
        'message': message,
        'meta': meta or {},
        'read': False,
        'created_at': datetime.utcnow()
    }
    result = db.notifications.insert_one(notif)
    notif['_id'] = result.inserted_id
    return notif

def _fmt(n):
    return {
        'id': str(n['_id']),
        'type': n.get('type', 'info'),
        'title': n.get('title', ''),
        'message': n.get('message', ''),
        'meta': n.get('meta', {}),
        'read': n.get('read', False),
        'created_at': str(n.get('created_at', ''))
    }
