from flask import request
from flask_smorest import Blueprint, abort
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token, get_jwt,  verify_jwt_in_request

from ..services.room_state import _init_room, delete_room_state, add_to_queue, set_current_song
from ..schemas.room_schemas import CreateRoomSchema, EditRoomSchema
from ..models.models import Music, Room, db, User

rooms_blp = Blueprint("Rooms", __name__, url_prefix="/api/v1/rooms")

@rooms_blp.route('/create', methods=['POST'])
@jwt_required()
@rooms_blp.arguments(CreateRoomSchema)
def create_room(room_data):
    # backend will get the user id
    user_id = get_jwt_identity()

    # room data
    title = room_data.get('name')
    vibe = room_data.get('vibe')
    is_private = room_data.get('is_private')

    # create room instance
    room = Room(
        title=title,
        vibe=vibe,
        is_private=is_private,
        owner_id=user_id,
        code = Room.generate_unique_code()
    )

    # check if the user has a room with the same title
    existing_room = Room.query.filter_by(title=title, owner_id=user_id).first()
    if existing_room:
        return {"message": "You already have a room with this title."}, 400


    # if the room is private, password is required
    if room.is_private:
        password = room_data.get('password')
        if not password:
            return {"message": "Password is required for private rooms."}, 400
        room.password = password

    db.session.add(room)
    db.session.commit()

    _init_room(room.id)

    return {"message": "Room created successfully.", "room_id": room.id}, 201

# DELETE ROOM OPERATION
@rooms_blp.route('/delete_room/<int:room_id>', methods=['DELETE'])
@jwt_required()
def delete_room(room_id):
    user_id = int(get_jwt_identity())
    room = Room.query.get_or_404(room_id)

    if room.owner_id != user_id:
        return {"message": "You do not have permission to delete this room."}, 403

    db.session.delete(room)
    db.session.commit()

    delete_room_state(room_id)

    return {"message": "Room deleted successfully."}, 200

@rooms_blp.route('/check_room_password/<int:room_id>', methods=['POST'])
def check_room_password(room_id):
    data = request.get_json()
    entered_password = data.get("password")
    room = Room.query.get_or_404(room_id)

    if room.password != entered_password:
        return {'access': False}, 200

    # Allow request with OR without JWT token
    verify_jwt_in_request(optional=True)
    user_id = get_jwt_identity()

    room_access_token = create_access_token(
        identity=user_id,
        additional_claims={
            "room_id": room.id,
            "type": "room_token"
        }
    )

    return {
        'access': True,
        'room_token': room_access_token,
        'user_id': user_id
    }, 200

def require_room_access(room_id):
    room = Room.query.get_or_404(room_id)
    if not room.is_private:
        return

    verify_jwt_in_request(optional=True)
    claims = get_jwt() or {}

    # current_user = get_jwt_identity()
    # if room.owner_id == current_user:
    #     return

    if claims.get("type") != "room_token" or claims.get("room_id") != room_id:
        abort(403, message="Access to this private room is forbidden.")


# GET ALL ROOMS OPERATION
@rooms_blp.route('/get_all_owned_rooms', methods=['GET'])
@jwt_required()
def get_all_owned_rooms():
    user_id = int(get_jwt_identity())
    rooms = Room.query.filter_by(owner_id=user_id).all()
    rooms_data = []
    for room in rooms:
        rooms_data.append({
            "id": room.id,
            "title": room.title,
            "description": room.description,
            "is_private": room.is_private,
            "vibe": room.vibe,
            "owner_id": room.owner_id
        })
    return {"rooms": rooms_data}, 200

# HELPER FUNCTION TO CHECK ROOM ACCESS

# GET ROOM BY ID OPERATION
@rooms_blp.route('/get_room/<int:room_id>', methods=['GET'])
@jwt_required(optional=True)
def get_room_by_id(room_id):
    room = Room.query.get_or_404(room_id)

    require_room_access(room_id)

    room_data = {
        "id": room.id,
        "title": room.title,
        "description": room.description,
        "is_private": room.is_private,
        "vibe": room.vibe,
        "code": room.code,
        "owner_id": room.owner_id
    }
    return {"room": room_data}, 200

# GET ROOM BY CODE
@rooms_blp.route('/get_room_by_code/<string:code>', methods=['GET'])
@jwt_required()
def get_room_by_code(code):
    room = Room.query.filter_by(code=code).first_or_404()

    if not room:
        return {"message": "Room not found."}, 404

    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if user in room.members or room.owner_id == user_id:
        return {"message": "User already a member of the room."}, 400

    room.members.append(user)
    db.session.commit()
    return {"message": "User added to the room."}, 200

# Get ALL JOINED ROOMS OPERATION
@rooms_blp.route('/get_all_joined_rooms', methods=['GET'])
@jwt_required()
def get_all_joined_rooms():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    rooms = user.joined_rooms.all()
    rooms_data = []
    for room in rooms:
        rooms_data.append({
            "id": room.id,
            "title": room.title,
            "description": room.description,
            "is_private": room.is_private,
            "vibe": room.vibe,
            "owner_id": room.owner_id
        })
    return {"rooms": rooms_data}, 200

@rooms_blp.route('/get_joined_room_count', methods=['GET'])
@jwt_required()
def get_joined_room_count():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    room_count = user.joined_rooms.count()
    return {"joined_room_count": room_count}, 200


# UPDATE ROOM OPERATION
@rooms_blp.route('/update_room/<int:room_id>', methods=['PUT'])
@jwt_required()
@rooms_blp.arguments(EditRoomSchema)
def update_room(room_data, room_id):
    user_id = int(get_jwt_identity())
    room = Room.query.get_or_404(room_id)

    if room.owner_id != user_id:
        return {"message": "You do not have permission to update this room."}, 403

    updated = False

    # handle just name and genre for now
    if 'name' in room_data:
        room.title = room_data['name']
        updated = True
    if 'vibe' in room_data:
        room.vibe = room_data['vibe']
        updated = True
    if not updated:
        return {"message": "No valid fields to update."}, 400

    db.session.commit()
    return {
        "message": "Room updated successfully.",
        "room": {
            "id": room.id,
            "title": room.title,
            "vibe": room.vibe,
            "is_private": room.is_private,
            "owner_id": room.owner_id
        }
    }, 200

# Get the number of rooms you own
@rooms_blp.route('/owned-room-count', methods=['GET'])
@jwt_required()
def get_owned_room_count():
    user_id = int(get_jwt_identity())
    room_count = Room.query.filter_by(owner_id=user_id).count()
    return {"owned_room_count": room_count}, 200

@rooms_blp.route('/get_room_private_status/<int:room_id>', methods=['GET'])
def get_room_private_status(room_id):
    room = Room.query.get_or_404(room_id)
    return {"is_private": room.is_private}, 200

# -------------------- Room Routes --------------------

# get room state
@rooms_blp.route('/get_room_state/<int:room_id>', methods=['GET'])
@jwt_required()
def get_room_state_route(room_id):
    require_room_access(room_id)
    state = _init_room(room_id)
    return {"room_state": state}, 200

# Add to queue route
@rooms_blp.route('/addToQueue/<int:room_id>/<int:song_id>', methods=['POST'])
@jwt_required()
def add_to_queue_route(room_id, song_id):
    require_room_access(room_id)
    song = Music.query.get_or_404(song_id)
    add_to_queue(room_id, song_id)
    return {"message": "Song added to queue successfully."}, 200

# get room queue route
@rooms_blp.route('/get_room_queue/<int:room_id>', methods=['GET'])
@jwt_required()
def get_room_queue_route(room_id):
    require_room_access(room_id)
    state = _init_room(room_id)
    return {"queue": state["queue"]}, 200

# set current song route
@rooms_blp.route('/set_current_song/<int:room_id>/<int:song_id>', methods=['GET'])
@jwt_required()
def set_current_song_route(room_id, song_id):
    require_room_access(room_id)

    set_current_song(room_id, song_id)
    return {"message": "Current song set successfully."}, 200

# get current song route
@rooms_blp.route('/get_current_song/<int:room_id>', methods=['GET'])
@jwt_required()
def get_current_song_route(room_id):
    require_room_access(room_id)
    state = _init_room(room_id)
    return {"current_song": state["current_song"]}, 200
