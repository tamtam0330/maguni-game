const express = require("express");
const router = express.Router();
const member_controller = require("../controllers/memberController");

//member
router.post("/api/v1/word", member_controller.insertWord);
router.get("/api/v1/word/:roomCode/:nickname", member_controller.getAllWords);
router.get("/api/v1/word/:roomCode", member_controller.getPlayersInfo);

router.post("/participant/game/api/v1", member_controller.participantGame);

module.exports = router;
