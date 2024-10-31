const MemberService = require("../services/memberService");

async function getAllWords(req, res) {
    const roomCode = req.params.roomCode;
    const nickname = req.params.nickname;

    const result = await MemberService.getAllWords(roomCode, nickname);
    if (result) {
        res.json(result);
    } else {
        console.log("err : ");
        // res.status(500).json({ error: error.message });
    }
}

async function insertWord(req, res) {
    const roomCode = req.body.roomCode;
    const nickname = req.body.nickname;
    const word = req.body.word;

    const result = await MemberService.insertWord(roomCode, nickname, word);
    if (result) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
}
async function participantGame(req, res) {
    const roomCode = req.body.roomCode;
    const nickname = req.body.nickname;

    const result = await MemberService.participantGame(roomCode, nickname);
    if (result) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
}


module.exports = {
    insertWord,
    getAllWords,
    participantGame
};
