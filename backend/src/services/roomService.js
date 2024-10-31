const RoomDao = require("../Dao/roomDao");

async function getAllRooms() {
    const result = await RoomDao.getAllRooms();
    return result;
}
async function createRoom(roomCode,nickname) {
    const result = await RoomDao.createRoom(roomCode,nickname);
    return result;
}
async function getOneRoom(roomCode) {
    const result = await RoomDao.getOneRoom(roomCode);
    return result;
}
async function deleteRoom(roomCode) {
    const result = await RoomDao.deleteRoom(roomCode);
    return result;
}
async function patchRoom(roomCode) {
    const result = await RoomDao.patchRoom(roomCode);
    return result;
}

module.exports = {
    getAllRooms,
    createRoom,
    getOneRoom,
    deleteRoom,
    patchRoom,
};
