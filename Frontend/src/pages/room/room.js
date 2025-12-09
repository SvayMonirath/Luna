import { fetchRoomInfo, renderQueue, renderCurrentSong} from "./room_utils.js";

document.addEventListener("DOMContentLoaded", async () => {

    await fetchRoomInfo();
    await renderQueue();
    renderCurrentSong();

});

