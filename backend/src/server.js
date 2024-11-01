const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config(); // .env 파일의 변수를 불러옵니다.
const cors = require("cors");
app.use(cors({
    origin: ["http://13.124.180.166:5173","http://13.124.180.166:5174","http://13.124.180.166:5175"], // 클라이언트 도메인으로 변경
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
}));
app.options('*', cors()); // Pre-flight request handling


const PORT =  3001;
const IP = "0.0.0.0";

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const path = require("path");
const static = require("serve-static");

const roomRouter = require("./routes/roomRoute");
app.use("/room", roomRouter);

const memberRouter = require("./routes/memberRoute");
app.use("/member", memberRouter);

app.get("*", (_, res) => {
    res.status(404).send("404 Not Found");
});

app.listen(PORT, () => {
    console.log(`Server is running on https://localhost:${PORT}`);
});
