from flask_smorest import Blueprint, abort
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..schemas.room_schemas import CreateRoomSchema, EditRoomSchema
from ..models.models import Room, db

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
        owner_id=user_id
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
    return {"message": "Room deleted successfully."}, 200

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


# GET ROOM BY ID OPERATION
@rooms_blp.route('/get_room/<int:room_id>', methods=['GET'])
@jwt_required()
def get_room_by_id(room_id):
    room = Room.query.get_or_404(room_id)
    room_data = {
        "id": room.id,
        "title": room.title,
        "description": room.description,
        "is_private": room.is_private,
        "vibe": room.vibe,
        "owner_id": room.owner_id
    }
    return {"room": room_data}, 200


# UPDATE ROOM OPERATION
@rooms_blp.route('/update_room/<int:room_id>', methods=['PUT'])
@jwt_required()
@rooms_blp.arguments(EditRoomSchema)
def update_room(room_data, room_id):
    user_id = int(get_jwt_identity())
    room = Room.query.get_or_404(room_id)

    if room.owner_id != user_id:
        return {"message": "You do not have permission to update this room."}, 403

    # handle just name and genre for now
    if 'name' in room_data:
        room.title = room_data['name']
    elif 'vibe' in room_data:
        room.vibe = room_data['vibe']
    else:
        return {"message": "No valid fields to update."}, 400

    db.session.commit()
    return {"message": "Room updated successfully."}, 200

# Get the number of rooms you own
@rooms_blp.route('/owned-room-count', methods=['GET'])
@jwt_required()
def get_owned_room_count():
    user_id = int(get_jwt_identity())
    room_count = Room.query.filter_by(owner_id=user_id).count()
    return {"owned_room_count": room_count}, 200
