from flask import Blueprint, request, jsonify
from config.database import mongo
from utils.jwt_utils import token_required
from bson import ObjectId
from datetime import datetime

sessions_bp = Blueprint('sessions', __name__)

@sessions_bp.route('/', methods=['POST'])
@token_required
def create_session():
    data = request.get_json()
    session = {
        'host_id': request.user_id,
        'partner_id': data.get('partner_id'),
        'subject': data.get('subject',''),
        'scheduled_at': data.get('scheduled_at',''),
        'duration': data.get('duration', 60),
        'status': 'scheduled',
        'notes': data.get('notes',''),
        'created_at': datetime.utcnow()
    }
    result = mongo.db.sessions.insert_one(session)
    mongo.db.users.update_one({'_id': ObjectId(request.user_id)}, {'$inc': {'total_sessions': 1}})
    return jsonify({'id': str(result.inserted_id), **session}), 201

@sessions_bp.route('/', methods=['GET'])
@token_required
def get_sessions():
    sessions = list(mongo.db.sessions.find({
        '$or': [{'host_id': request.user_id}, {'partner_id': request.user_id}]
    }).sort('scheduled_at', -1))
    result = []
    for s in sessions:
        partner_id = s['partner_id'] if s['host_id'] == request.user_id else s['host_id']
        partner = mongo.db.users.find_one({'_id': ObjectId(partner_id)}) if partner_id else None
        result.append({
            'id': str(s['_id']),
            'subject': s.get('subject',''),
            'scheduled_at': s.get('scheduled_at',''),
            'duration': s.get('duration',60),
            'status': s.get('status','scheduled'),
            'notes': s.get('notes',''),
            'is_host': s['host_id'] == request.user_id,
            'partner': {'id': str(partner['_id']), 'name': partner.get('name',''), 'avatar': partner.get('avatar','')} if partner else None
        })
    return jsonify(result), 200

@sessions_bp.route('/<session_id>', methods=['PUT'])
@token_required
def update_session(session_id):
    data = request.get_json()
    mongo.db.sessions.update_one({'_id': ObjectId(session_id)}, {'$set': data})
    return jsonify({'message': 'Updated'}), 200
