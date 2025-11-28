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
    genre = room_data.get('genre')
    is_private = room_data.get('is_private')

    # create room instance
    room = Room(
        title=title,
        genre=genre,
        is_private=is_private,
        owner_id=user_id
    )

    # check if the user has a room with the same title
    existing_room = Room.query.filter_by(title=title, owner_id=user_id).first()
    if existing_room:
        abort(400, message="You already have a room with this title.")

    # if the room is private, password is required
    if room.is_private:
        password = room_data.get('password')
        if not password:
            abort(400, message="Password is required for private rooms.")
        room.password = password

    db.session.add(room)
    db.session.commit()
    return {"message": "Room created successfully.", "room_id": room.id}, 201

# DELETE ROOM OPERATION
@rooms_blp.route('delete_room/<int:room_id>', methods=['DELETE'])
@jwt_required()
def delete_room(room_id):
    user_id = int(get_jwt_identity())
    room = Room.query.get_or_404(room_id)

    if room.owner_id != user_id:
        abort(403, message="You do not have permission to delete this room.")

    db.session.delete(room)
    db.session.commit()
    return {"message": "Room deleted successfully."}, 200

# GET ALL ROOMS OPERATION
@rooms_blp.route('/get_all', methods=['GET'])
@jwt_required()
def get_all_rooms():
    rooms = Room.query.all()
    rooms_data = []
    for room in rooms:
        rooms_data.append({
            "id": room.id,
            "title": room.title,
            "description": room.description,
            "is_private": room.is_private,
            "genre": room.genre,
            "owner_id": room.owner_id
        })
    return {"rooms": rooms_data}, 200

# GET ROOM BY ID OPERATION
@rooms_blp.route('get_room/<int:room_id>', methods=['GET'])
@jwt_required()
def get_room_by_id(room_id):
    room = Room.query.get_or_404(room_id)
    room_data = {
        "id": room.id,
        "title": room.title,
        "description": room.description,
        "is_private": room.is_private,
        "genre": room.genre,
        "owner_id": room.owner_id
    }
    return {"room": room_data}, 200

# UPDATE ROOM OPERATION
@rooms_blp.route('update_room/<int:room_id>', methods=['PUT'])
@jwt_required()
@rooms_blp.arguments(EditRoomSchema)
def update_room(room_data, room_id):
    user_id = int(get_jwt_identity())
    room = Room.query.get_or_404(room_id)

    if room.owner_id != user_id:
        abort(403, message="You do not have permission to update this room.")

    # handle just name and genre for now
    if 'name' in room_data:
        room.title = room_data['name']
    elif 'genre' in room_data:
        room.genre = room_data['genre']
    else:
        abort(400, message="No valid fields to update.")

    db.session.commit()
    return {"message": "Room updated successfully."}, 200
