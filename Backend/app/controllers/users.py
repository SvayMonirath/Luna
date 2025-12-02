from flask_smorest import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func

from ..models.models import User, db
from ..schemas.user_schemas import EditUserSchema

user_blp = Blueprint("Users", __name__, url_prefix="/api/v1/users")

from flask_smorest import Blueprint, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.models import User, db
from ..schemas.user_schemas import EditUserSchema

user_blp = Blueprint("Users", __name__, url_prefix="/api/v1/users")

# -------------------- EDIT USER --------------------
@user_blp.route('/edit_user', methods=['PUT'])
@jwt_required()
@user_blp.arguments(EditUserSchema)
def edit_user(user_data):
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)

    new_username = user_data.get('username')
    new_email = user_data.get('email')

    if new_username:
        new_username_clean = new_username.strip()
        # Check for duplicates case-insensitive
        existing_user = db.session.query(User).filter(
            func.lower(User.username) == new_username_clean.lower(),
            User.id != user_id
        ).first()
        if existing_user:
            return {"message": "Username already taken."}, 400
        user.username = new_username_clean

    if new_email:
        new_email_clean = new_email.strip()
        existing_user = db.session.query(User).filter(
            func.lower(User.email) == new_email_clean.lower(),
            User.id != user_id
        ).first()
        if existing_user:
            return {"message": "Email already taken."}, 400
        user.email = new_email_clean

    db.session.commit()
    return {"message": "User updated successfully."}, 200

@user_blp.route('/delete_user', methods=['DELETE'])
@jwt_required()
def delete_account():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)

    if not user:
        return {"message": "User not found."}, 404

    db.session.delete(user)
    db.session.commit()
    return {"message": "User account deleted successfully."}, 200
