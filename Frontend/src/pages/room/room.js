import { fetchRoomInfo, renderQueue, renderCurrentSong} from "./room_utils.js";

document.addEventListener("DOMContentLoaded", () => {

    fetchRoomInfo();
    renderQueue();
    renderCurrentSong();

});

