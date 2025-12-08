room_state = {}

def _init_room(room_id):
    global room_state
    if room_id not in room_state:
        room_state[room_id] = {
            "queue": [],
            "current_song": None,
            "is_playing": False
        }

    return room_state[room_id]

def reset_room(room_id):
    global room_state
    if room_id in room_state:
        room_state[room_id]["queue"] = []
        room_state[room_id]["current_song"] = None
        room_state[room_id]["is_playing"] = False

def get_room_state(room_id):
    global room_state
    return room_state.get(room_id)

def add_to_queue(room_id, song_id):
    global room_state
    if room_id in room_state:
        room_state[room_id]["queue"].append(song_id)

def delete_room_state(room_id):
    global room_state
    if room_id in room_state:
        del room_state[room_id]

def set_current_song(room_id, song_id):
    global room_state
    if room_id in room_state:
        room_state[room_id]["current_song"] = song_id

def play_song(room_id):
    global room_state
    if room_id in room_state:
        room_state[room_id]["is_playing"] = True

def pause_song(room_id):
    global room_state
    if room_id in room_state:
        room_state[room_id]["is_playing"] = False
