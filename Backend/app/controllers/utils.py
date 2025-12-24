from flask_smorest import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.models import User, Room, db

utils_blp = Blueprint("Utils", __name__, url_prefix="/api/v1/utils")
@utils_blp.route('/get_user', methods=['GET'])
@jwt_required()
def get_user():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)

    user_data = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "is_first_time": user.is_first_time
    }

    return {
        'user': user_data
    }, 200
