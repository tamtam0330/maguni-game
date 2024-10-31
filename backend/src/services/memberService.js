const MemberDao = require("../Dao/memberDao");

async function insertWord(roomCode, nickname, word) {
    const result = await MemberDao.insertWord(roomCode, nickname, word);
    return result;
}
async function participantGame(roomCode,nickname) {
    const result = await MemberDao.participantGame( roomCode,nickname);
    return result;
}
async function getAllWords(roomCode, nickname) {
    const result = await MemberDao.getAllWords(roomCode, nickname);
    return result;
}

module.exports = {
    insertWord,
    getAllWords,
    participantGame
};
