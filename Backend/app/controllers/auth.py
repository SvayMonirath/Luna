from flask_smorest import Blueprint
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from sqlalchemy import func

from ..schemas.auth_schemas import LoginInput, LoginOutput, RegisterInput, RegisterOutput
from ..models.models import User, db

auth_blp = Blueprint("Auth", __name__, url_prefix="/api/v1/auth")

# -------------------- REGISTER --------------------
@auth_blp.route('/register', methods=['POST'])
@auth_blp.arguments(RegisterInput)
@auth_blp.response(201, RegisterOutput)
def register(data):
    username = data.get('username').strip()
    email = data.get('email').strip()
    password = data.get('password')
    confirm_password = data.get('confirm_password')

    if password != confirm_password:
        return {"message": "Passwords do not match."}, 400

    # Case-insensitive check for existing username/email
    existing_user = User.query.filter(
        (func.lower(User.username) == username.lower()) |
        (func.lower(User.email) == email.lower())
    ).first()

    if existing_user:
        return {"message": "Username or email already exists."}, 400
    new_user = User(username=username, email=email)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return {"message": "User registered successfully."}, 201


# -------------------- LOGIN --------------------
@auth_blp.route('/login', methods=['POST'])
@auth_blp.arguments(LoginInput)
@auth_blp.response(200, LoginOutput)
def login(data):
    username = data.get('username').strip()
    password = data.get('password')

    # Case-insensitive username lookup
    user = User.query.filter(func.lower(User.username) == username.lower()).first()
    if not user or not user.check_password(password):
        return {"message": "Invalid username or password."}, 401

    access_token = create_access_token(identity=str(user.id))
    return {"message": "Login successful.", "accessToken": access_token}, 200

# -------------------- No Longer First Time --------------------
@auth_blp.route('/no_longer_first_time', methods=['POST'])
@auth_blp.response(200)
@jwt_required()
def no_longer_first_time():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)

    user.is_first_time = False
    db.session.commit()

    return {"message": "User is no longer first time."}, 200
