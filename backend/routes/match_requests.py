from flask import Blueprint, request, jsonify
from config.database import mongo
from utils.jwt_utils import token_required
from bson import ObjectId
from datetime import datetime

match_req_bp = Blueprint('match_requests', __name__)

def _fmt_user(u):
    if not u: return {}
    return {'id': str(u['_id']), 'name': u.get('name',''), 'avatar': u.get('avatar',''),
            'subjects': u.get('subjects',[]), 'skills_have': u.get('skills_have',[]),
            'mentor_tag': u.get('mentor_tag', False), 'college': u.get('college','')}

@match_req_bp.route('/send/<to_id>', methods=['POST'])
@token_required
def send_request(to_id):
    from_id = request.user_id
    if from_id == to_id:
        return jsonify({'error': 'Cannot match with yourself'}), 400
    existing = mongo.db.match_requests.find_one({
        '$or': [
            {'from_id': from_id, 'to_id': to_id},
            {'from_id': to_id, 'to_id': from_id}
        ]
    })
    if existing:
        return jsonify({'error': 'Request already exists', 'status': existing['status']}), 409

    req = {
        'from_id': from_id, 'to_id': to_id,
        'status': 'pending', 'created_at': datetime.utcnow()
    }
    result = mongo.db.match_requests.insert_one(req)

    # Create notification for recipient
    from_user = mongo.db.users.find_one({'_id': ObjectId(from_id)})
    from routes.notifications import create_notification
    notif = create_notification(
        mongo.db, to_id, 'match_request',
        '🔗 New Match Request',
        f"{from_user.get('name','Someone')} wants to be your study partner!",
        {'from_id': from_id, 'request_id': str(result.inserted_id)}
    )
    return jsonify({'message': 'Match request sent', 'request_id': str(result.inserted_id)}), 201

@match_req_bp.route('/respond/<req_id>', methods=['POST'])
@token_required
def respond_request(req_id):
    action = request.get_json().get('action')  # 'accept' or 'decline'
    req = mongo.db.match_requests.find_one({'_id': ObjectId(req_id), 'to_id': request.user_id})
    if not req:
        return jsonify({'error': 'Request not found'}), 404

    new_status = 'accepted' if action == 'accept' else 'declined'
    mongo.db.match_requests.update_one({'_id': ObjectId(req_id)}, {'$set': {'status': new_status, 'responded_at': datetime.utcnow()}})

    me = mongo.db.users.find_one({'_id': ObjectId(request.user_id)})
    from routes.notifications import create_notification
    title = '✅ Match Accepted!' if new_status == 'accepted' else '❌ Match Declined'
    msg = f"{me.get('name','Someone')} {'accepted' if new_status=='accepted' else 'declined'} your study partner request."
    create_notification(mongo.db, req['from_id'], 'match_response', title, msg,
                        {'to_id': request.user_id, 'status': new_status})

    return jsonify({'message': f'Request {new_status}', 'status': new_status}), 200

@match_req_bp.route('/incoming', methods=['GET'])
@token_required
def incoming():
    reqs = list(mongo.db.match_requests.find({'to_id': request.user_id, 'status': 'pending'}))
    result = []
    for r in reqs:
        u = mongo.db.users.find_one({'_id': ObjectId(r['from_id'])})
        result.append({'id': str(r['_id']), 'from_user': _fmt_user_full(u), 'created_at': str(r['created_at'])})
    return jsonify(result), 200

@match_req_bp.route('/my-matches', methods=['GET'])
@token_required
def my_matches():
    uid = request.user_id
    accepted = list(mongo.db.match_requests.find({
        '$or': [{'from_id': uid}, {'to_id': uid}], 'status': 'accepted'
    }))
    result = []
    for r in accepted:
        other_id = r['to_id'] if r['from_id'] == uid else r['from_id']
        u = mongo.db.users.find_one({'_id': ObjectId(other_id)})
        result.append({'id': str(r['_id']), 'partner': _fmt_user(u), 'matched_at': str(r.get('responded_at',''))})
    return jsonify(result), 200

@match_req_bp.route('/status/<other_id>', methods=['GET'])
@token_required
def get_status(other_id):
    uid = request.user_id
    req = mongo.db.match_requests.find_one({
        '$or': [{'from_id': uid, 'to_id': other_id}, {'from_id': other_id, 'to_id': uid}]
    })
    if not req:
        return jsonify({'status': 'none'}), 200
    return jsonify({'status': req['status'], 'id': str(req['_id']),
                    'is_sender': req['from_id'] == uid}), 200

def _fmt_user_full(u):
    """Full user info for outgoing/accepted views."""
    if not u: return {}
    return {
        'id': str(u['_id']),
        'name': u.get('name', ''),
        'avatar': u.get('avatar', ''),
        'college': u.get('college', ''),
        'year': u.get('year', ''),
        'subjects': u.get('subjects', []),
        'skills_have': u.get('skills_have', []),
        'skills_want': u.get('skills_want', []),
        'teachSubjectDetails': u.get('teachSubjectDetails', []),
        'learnSubjectDetails': u.get('learnSubjectDetails', []),
        'availability': u.get('availability', []),
        'preparation_level': u.get('preparation_level', ''),
        'reputation_score': u.get('reputation_score', 0),
        'skill_credits': u.get('skill_credits', 0),
        'mentor_tag': u.get('mentor_tag', False),
        'bio': u.get('bio', ''),
    }


@match_req_bp.route('/outgoing', methods=['GET'])
@token_required
def outgoing():
    """Requests the current user has SENT that are still pending."""
    uid = request.user_id
    reqs = list(mongo.db.match_requests.find({'from_id': uid, 'status': 'pending'}))
    result = []
    for r in reqs:
        u = mongo.db.users.find_one({'_id': ObjectId(r['to_id'])})
        result.append({
            'id': str(r['_id']),
            'to_user': _fmt_user_full(u),
            'created_at': str(r['created_at']),
            'status': r['status'],
        })
    return jsonify(result), 200


@match_req_bp.route('/accepted', methods=['GET'])
@token_required
def accepted():
    """All mutually accepted matches — used for Skill Barter and Sessions partner list."""
    uid = request.user_id
    reqs = list(mongo.db.match_requests.find({
        '$or': [{'from_id': uid}, {'to_id': uid}],
        'status': 'accepted',
    }))
    result = []
    for r in reqs:
        other_id = r['to_id'] if r['from_id'] == uid else r['from_id']
        u = mongo.db.users.find_one({'_id': ObjectId(other_id)})
        result.append({
            'id': str(r['_id']),
            'from_user': _fmt_user_full(mongo.db.users.find_one({'_id': ObjectId(r['from_id'])})),
            'to_user': _fmt_user_full(u),
            'responded_at': str(r.get('responded_at', '')),
            'status': 'accepted',
        })
    return jsonify(result), 200
