const { MongoClient } = require("mongodb");
const dbconfig = require("../config/dbconfig.json");

const url = `mongodb+srv://${process.env.DB_ID}:${process.env.DB_PW}@cluster0.jmw2t.mongodb.net/database?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(url, {
    maxPoolSize: 10,
});
const UploadDao = {
    uploadImage: async (filename) => {
        let roomCode = filename.substring(0, 6);
        let result;
        try {
            await client.connect();
            const db = client.db("database");
            const rooms = db.collection("rooms");

            // roomCode와 nickname에 맞는 participant의 word를 업데이트
            result = await rooms.updateOne(
                { code: roomCode },
                { $push: { photos: filename } } // 올바른 구문으로 수정
            );
        } catch (error) {
            throw error;
        } finally {
            // client.close(); // 클라이언트 연결 종료
        }

        return result; // updateOne의 결과 반환
    },

    recvImages: async (roomCode) => {
        let room;
        let photos;
        try {
            await client.connect();
            const db = client.db("database");
            const rooms = db.collection("rooms");

            // roomId에 따라 필터링
            room = await rooms.findOne({ code: roomCode });
            photos = room.photos;
        } catch (error) {
            throw error;
        } finally {
            // client.close(); // 클라이언트 연결 종료
        }

        return photos;
    },
};

// 프로세스 종료 시 클라이언트 연결 종료
process.on("SIGINT", async () => {
    await client.close();
    console.log("MongoDB connection closed");
    process.exit(0);
});

module.exports = UploadDao;
