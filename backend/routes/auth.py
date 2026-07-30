from flask import Blueprint, request, jsonify
from config.database import mongo
from utils.jwt_utils import generate_token, token_required
import bcrypt
import random
from bson import ObjectId
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)


def _format_user(user):
    return {
        'id': str(user['_id']),
        'name': user.get('name', ''),
        'email': user.get('email', ''),
        'phone': user.get('phone', ''),
        'subjects': user.get('subjects', []),
        'skills_have': user.get('skills_have', []),
        'skills_want': user.get('skills_want', []),
        'availability': user.get('availability', []),
        'preparation_level': user.get('preparation_level', 'Beginner'),
        'bio': user.get('bio', ''),
        'avatar': user.get('avatar', ''),
        'college': user.get('college', ''),
        'year': user.get('year', ''),
        'subjectDetails': user.get('subjectDetails', []),
        'teachSubjectDetails': user.get('teachSubjectDetails', []),
        'learnSubjectDetails': user.get('learnSubjectDetails', []),
        'skill_credits': user.get('skill_credits', 100),
        'reputation_score': user.get('reputation_score', 0),
        'total_sessions': user.get('total_sessions', 0),
        'is_mentor': user.get('is_mentor', False),
        'mentor_tag': user.get('mentor_tag', False),
        'online': user.get('online', False),
        'last_seen': str(user.get('last_seen', '')),
        'created_at': str(user.get('created_at', '')),
    }


# ── Register ───────────────────────────────────────────────────
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data.get('name') or not data.get('password'):
        return jsonify({'error': 'Name and password required'}), 400
    if not data.get('email') and not data.get('phone'):
        return jsonify({'error': 'Email or phone required'}), 400

    query = []
    if data.get('email'): query.append({'email': data['email']})
    if data.get('phone'): query.append({'phone': data['phone']})
    if query and mongo.db.users.find_one({'$or': query}):
        return jsonify({'error': 'Email or phone already registered'}), 409

    hashed = bcrypt.hashpw(data['password'].encode(), bcrypt.gensalt())
    user = {
        'name': data['name'],
        'email': data.get('email', ''),
        'phone': data.get('phone', ''),
        'password': hashed,
        'subjects': data.get('subjects', []),
        'skills_have': data.get('skills_have', []),
        'skills_want': data.get('skills_want', []),
        'availability': data.get('availability', []),
        'preparation_level': data.get('preparation_level', 'Beginner'),
        'subjectDetails': data.get('subjectDetails', []),
        'teachSubjectDetails': data.get('teachSubjectDetails', []),
        'learnSubjectDetails': data.get('learnSubjectDetails', []),
        'bio': data.get('bio', ''),
        'avatar': data.get('avatar', ''),
        'college': data.get('college', ''),
        'year': data.get('year', ''),
        'skill_credits': 100,
        'reputation_score': 0,
        'total_sessions': 0,
        'ratings_received': [],
        'is_mentor': False,
        'mentor_tag': False,
        'created_at': datetime.utcnow(),
        'online': False,
        'last_seen': datetime.utcnow(),
    }
    result = mongo.db.users.insert_one(user)
    user['_id'] = result.inserted_id
    token = generate_token(result.inserted_id, data.get('email') or data.get('phone'))
    return jsonify({'token': token, 'user': _format_user(user)}), 201


# ── Login ──────────────────────────────────────────────────────
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    identifier = data.get('identifier') or data.get('email') or data.get('phone') or ''
    password   = data.get('password', '')
    if not identifier:
        return jsonify({'error': 'Email or phone required'}), 400

    user = mongo.db.users.find_one({'$or': [{'email': identifier}, {'phone': identifier}]})
    if not user or not bcrypt.checkpw(password.encode(), user['password']):
        return jsonify({'error': 'Invalid credentials'}), 401

    mongo.db.users.update_one(
        {'_id': user['_id']},
        {'$set': {'online': True, 'last_seen': datetime.utcnow()}}
    )
    token = generate_token(user['_id'], identifier)
    return jsonify({'token': token, 'user': _format_user(user)}), 200


# ── Get current user ───────────────────────────────────────────
@auth_bp.route('/me', methods=['GET'])
@token_required
def get_me():
    user = mongo.db.users.find_one({'_id': ObjectId(request.user_id)})
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(_format_user(user)), 200


# ── Logout ─────────────────────────────────────────────────────
@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout():
    mongo.db.users.update_one(
        {'_id': ObjectId(request.user_id)},
        {'$set': {'online': False, 'last_seen': datetime.utcnow()}}
    )
    return jsonify({'message': 'Logged out'}), 200


# ── Forgot Password — Step 1: Send OTP ────────────────────────
@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """
    Send a password-reset OTP to the user's email or phone.
    In dev mode the OTP is printed to the server console and
    returned in the response body as dev_otp.
    In production: integrate Twilio / Fast2SMS / SendGrid here.
    """
    data = request.get_json()
    identifier = (data.get('identifier') or '').strip()
    if not identifier:
        return jsonify({'error': 'Email or phone required'}), 400

    user = mongo.db.users.find_one({'$or': [{'email': identifier}, {'phone': identifier}]})
    # Always return 200 to avoid user enumeration attacks
    if not user:
        return jsonify({'message': 'If an account exists, an OTP has been sent.'}), 200

    otp     = str(random.randint(100000, 999999))
    expires = datetime.utcnow() + timedelta(minutes=15)

    # Upsert the password-reset OTP record
    mongo.db.password_resets.update_one(
        {'identifier': identifier},
        {'$set': {
            'user_id':    str(user['_id']),
            'otp':        otp,
            'expires':    expires,
            'used':       False,
            'created_at': datetime.utcnow(),
        }},
        upsert=True,
    )

    # ── Dev mode: print to console ──────────────────────────
    print(f"\n{'='*50}")
    print(f"🔑 PASSWORD RESET OTP for {identifier}: {otp}")
    print(f"   Expires at: {expires.strftime('%H:%M:%S UTC')}")
    print(f"{'='*50}\n")

    # In production replace the above with your SMS/email service call.
    # e.g. send_sms(user['phone'], f"MindMatch OTP: {otp}")

    return jsonify({
        'message': 'OTP sent. Check your email/phone (or server console in dev mode).',
        'dev_otp': otp,   # Remove this line in production!
    }), 200


# ── Reset Password — Step 2: Verify OTP + set new password ────
@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data         = request.get_json()
    identifier   = (data.get('identifier') or '').strip()
    otp          = (data.get('otp') or '').strip()
    new_password = data.get('new_password', '')

    if not identifier or not otp or not new_password:
        return jsonify({'error': 'identifier, otp, and new_password are required'}), 400
    if len(new_password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    record = mongo.db.password_resets.find_one({'identifier': identifier})
    if not record:
        return jsonify({'error': 'No OTP request found. Please try again.'}), 404
    if record.get('used'):
        return jsonify({'error': 'OTP already used. Please request a new one.'}), 400
    if datetime.utcnow() > record['expires']:
        return jsonify({'error': 'OTP has expired. Please request a new one.'}), 410
    if record['otp'] != otp:
        return jsonify({'error': 'Invalid OTP. Please check and try again.'}), 401

    # Hash new password and update the user record
    hashed = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt())
    mongo.db.users.update_one(
        {'_id': ObjectId(record['user_id'])},
        {'$set': {'password': hashed}}
    )

    # Mark OTP as used
    mongo.db.password_resets.update_one(
        {'identifier': identifier},
        {'$set': {'used': True}}
    )

    return jsonify({'message': 'Password reset successfully! Please log in with your new password.'}), 200
