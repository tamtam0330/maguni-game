const express = require("express");
const router = express.Router();
const room_controller = require("../controllers/roomController");

router.get("/api/v1/", room_controller.getAllRooms);
router.post("/api/v1", room_controller.createRoom);
router.get("/api/v1/:roomCode", room_controller.getOneRoom);
router.delete("/api/v1/:roomCode", room_controller.deleteRoom);
router.patch("/api/v1/:roomCode", room_controller.patchRoom);

module.exports = router;
