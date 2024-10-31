const { MongoClient } = require("mongodb");
const dbconfig = require("../config/dbconfig.json");

const url = `mongodb+srv://${dbconfig.id}:${dbconfig.password}@cluster0.jmw2t.mongodb.net/database?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(url, {
    maxPoolSize: 10,
});
const MemberDao = {
    insertWord: async (roomCode, nickname, word) => {
        let result;
        try {
            await client.connect();
            const db = client.db("database");
            const rooms = db.collection("rooms");

            // roomCode와 nickname에 맞는 participant의 word를 업데이트
            result = await rooms.updateOne(
                {
                    code: roomCode, // room.code로 필터링
                    "participants.nickname": nickname, // nickname으로 필터링
                },
                {
                    $push: { "participants.$.words": word }, // 찾은 participant의 words 배열에 추가
                }
            );
        } catch (error) {
            throw error;
        } finally {
            // client.close(); // 클라이언트 연결 종료
        }

        return result; // updateOne의 결과 반환
    },

    getAllWords: async (roomCode, nickname) => {
        let allWords = [];
        try {
            await client.connect();
            const db = client.db("database");
            const rooms = db.collection("rooms");
    
            // roomCode와 nickname을 조건으로 참가자의 words 값을 가져오는 쿼리
            const result = await rooms
                .aggregate([
                    {
                        $match: {
                            "code": roomCode, // room의 code로 필터링
                            "participants.nickname": nickname, // 참여자의 nickname으로 필터링
                        },
                    },
                    {
                        $unwind: "$participants", // participants 배열을 펼침
                    },
                    {
                        $match: {
                            "participants.nickname": nickname, // 다시 nickname으로 필터링
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            words: "$participants.words", // 해당 참여자의 words를 가져옴
                        },
                    },
                ])
                .toArray();
    
            // words 필드가 존재하는지 확인하고 값 할당
            if (result.length > 0) {
                allWords = result.map(participant => participant.words);
            }
        } catch (error) {
            throw error;
        } finally {
            // client.close(); // 클라이언트 연결 종료
        }
    
        return allWords;
    },

    participantGame: async (roomCode, nickname) => {
        let result;
        try {
            await client.connect();
            const db = client.db("database");
            const rooms = db.collection("rooms");
    
            // roomCode에 맞는 participants 배열에 새로운 참가자 추가
            result = await rooms.updateOne(
                {
                    "code": roomCode, // room.code로 필터링
                },
                {
                    $push: {
                        participants: {
                            nickname: nickname,
                            words: [],
                            missions: [],
                            secret: [],
                        },
                    },
                }
            );
        } catch (error) {
            throw error;
        } finally {
            // client.close(); // 클라이언트 연결 종료
        }
    
        return result; // updateOne의 결과 반환
    },
    
    getPlayersInfo: async (roomCode) => {
        let room;
        let participants;
        try {
            await client.connect();
            const db = client.db("database");
            const rooms = db.collection("rooms");

            // roomId에 따라 필터링
            room = await rooms.findOne({ code: roomCode });
            participants = room.participants;
        } catch (error) {
            throw error;
        } finally {
            // client.close(); // 클라이언트 연결 종료
        }

        return participants;
    },
    
    
};

// 프로세스 종료 시 클라이언트 연결 종료
process.on("SIGINT", async () => {
    await client.close();
    console.log("MongoDB connection closed");
    process.exit(0);
});

module.exports = MemberDao;
