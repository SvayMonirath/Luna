from flask_smorest import Blueprint
from flask_jwt_extended import create_access_token

from ..schemas.auth_schemas import LoginInput, LoginOutput, RegisterInput, RegisterOutput
from ..models.models import User, db

auth_blp = Blueprint("Auth", __name__, url_prefix="/api/v1/auth")

@auth_blp.route('/register', methods=['POST'])
@auth_blp.arguments(RegisterInput)
@auth_blp.response(201, RegisterOutput)
def register(data):
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirm_password')

    if password != confirm_password:
        return {"message": "Passwords do not match."}, 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return {"message": "Username or email already exists."}, 400

    new_user = User(username=username, email=email)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return {"message": "User registered successfully."}, 201

@auth_blp.route('/login', methods=['POST'])
@auth_blp.arguments(LoginInput)
@auth_blp.response(200, LoginOutput)
def login(data):
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return {"message": "Invalid username or password."}, 401

    accessToken = create_access_token(str(user.id))

    return {"message": "Login successful.", "accessToken": accessToken}, 200
