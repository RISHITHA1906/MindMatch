from flask import Blueprint, request, jsonify
from config.database import mongo
from utils.jwt_utils import token_required
from bson import ObjectId
from datetime import datetime
import os, base64, uuid

chat_bp = Blueprint('chat', __name__)

def room_id(a, b):
    return '_'.join(sorted([str(a), str(b)]))

@chat_bp.route('/rooms', methods=['GET'])
@token_required
def get_rooms():
    uid = request.user_id
    rooms = list(mongo.db.chat_rooms.find({
        '$or': [{'user1': uid}, {'user2': uid}]
    }).sort('last_message_at', -1))
    result = []
    for r in rooms:
        other_id = r['user2'] if r['user1'] == uid else r['user1']
        other = mongo.db.users.find_one({'_id': ObjectId(other_id)})
        if other:
            unread = mongo.db.messages.count_documents({
                'room_id': r['room_id'], 'sender_id': {'$ne': uid}, 'read': False
            })
            result.append({
                'room_id': r['room_id'],
                'other_user': {
                    'id': str(other['_id']), 'name': other.get('name',''),
                    'avatar': other.get('avatar',''), 'online': other.get('online',False),
                    'mentor_tag': other.get('mentor_tag',False)
                },
                'last_message': r.get('last_message',''),
                'last_message_at': str(r.get('last_message_at','')),
                'unread_count': unread
            })
    return jsonify(result), 200

@chat_bp.route('/rooms/<other_id>/messages', methods=['GET'])
@token_required
def get_messages(other_id):
    rid = room_id(request.user_id, other_id)
    # Ensure room exists
    mongo.db.chat_rooms.update_one(
        {'room_id': rid},
        {'$setOnInsert': {'room_id': rid, 'user1': request.user_id, 'user2': other_id,
                          'last_message': '', 'last_message_at': datetime.utcnow()}},
        upsert=True
    )
    # Mark messages as read
    mongo.db.messages.update_many(
        {'room_id': rid, 'sender_id': {'$ne': request.user_id}, 'read': False},
        {'$set': {'read': True}}
    )
    page = int(request.args.get('page', 1))
    limit = 50
    msgs = list(mongo.db.messages.find({'room_id': rid})
                .sort('created_at', -1).skip((page-1)*limit).limit(limit))
    msgs.reverse()
    return jsonify([_fmt_msg(m) for m in msgs]), 200

@chat_bp.route('/rooms/<other_id>/send', methods=['POST'])
@token_required
def send_message(other_id):
    data = request.get_json()
    rid = room_id(request.user_id, other_id)
    msg = {
        'room_id': rid,
        'sender_id': request.user_id,
        'receiver_id': other_id,
        'content': data.get('content', ''),
        'type': data.get('type', 'text'),
        'file_url': data.get('file_url', ''),
        'file_name': data.get('file_name', ''),
        'read': False,
        'created_at': datetime.utcnow()
    }
    result = mongo.db.messages.insert_one(msg)
    mongo.db.chat_rooms.update_one(
        {'room_id': rid},
        {'$set': {'last_message': data.get('content','📎 File'), 'last_message_at': datetime.utcnow()},
         '$setOnInsert': {'user1': request.user_id, 'user2': other_id}},
        upsert=True
    )
    msg['_id'] = result.inserted_id
    return jsonify(_fmt_msg(msg)), 201

@chat_bp.route('/upload', methods=['POST'])
@token_required
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file'}), 400
    f = request.files['file']
    ext = f.filename.rsplit('.', 1)[-1].lower() if '.' in f.filename else 'bin'
    fname = f"{uuid.uuid4().hex}.{ext}"
    save_path = os.path.join(os.path.dirname(__file__), '..', 'uploads', fname)
    f.save(save_path)
    return jsonify({'file_url': f'/api/chat/files/{fname}', 'file_name': f.filename}), 200

from flask import send_from_directory
@chat_bp.route('/files/<filename>', methods=['GET'])
def serve_file(filename):
    uploads_dir = os.path.join(os.path.dirname(__file__), '..', 'uploads')
    return send_from_directory(uploads_dir, filename)

def _fmt_msg(m):
    return {
        'id': str(m['_id']),
        'room_id': m.get('room_id',''),
        'sender_id': m.get('sender_id',''),
        'receiver_id': m.get('receiver_id',''),
        'content': m.get('content',''),
        'type': m.get('type','text'),
        'file_url': m.get('file_url',''),
        'file_name': m.get('file_name',''),
        'read': m.get('read',False),
        'created_at': str(m.get('created_at',''))
    }
