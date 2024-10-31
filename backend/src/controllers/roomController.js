const RoomService = require("../services/roomService");

async function getAllRooms(_, res) {
    const result = await RoomService.getAllRooms();
    if (result) {
        res.json(result);
    } else {
        console.log("err : ");
        // res.status(500).json({ error: error.message });
    }
}
async function getOneRoom(req, res) {
    const roomCode = req.params.roomCode;
    const result = await RoomService.getOneRoom(roomCode);
    if (result) {
        res.json(result);
    } else {
        console.log("err :== ");
        // res.status(500).json({ error: error.message });
    }
}

async function createRoom(req, res) {
    const roomCode = req.body.roomCode;
    const nickname = req.body.nickname;
    const result = await RoomService.createRoom(roomCode, nickname);
    if (result) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
}

async function deleteRoom(req, res) {
    const roomCode = req.params.roomCode;
    const result = await RoomService.deleteRoom(roomCode);
    if (result) {
        res.json(result);
    } else {
        console.log("err :== ");
        // res.status(500).json({ error: error.message });
    }
}
async function patchRoom(req, res) {
    const roomCode = req.params.roomCode;
    console.log(roomCode);
    const result = await RoomService.patchRoom(roomCode);
    if (result) {
        res.json(result);
    } else {
        console.log("err :== ");
        // res.status(500).json({ error: error.message });
    }
}
module.exports = {
    getAllRooms,
    createRoom,
    getOneRoom,
    deleteRoom,
    patchRoom,
};
