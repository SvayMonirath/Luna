import { fetchRoomInfo, renderQueue} from "./room_utils.js";

document.addEventListener("DOMContentLoaded", () => {

    fetchRoomInfo();
    renderQueue();

});

