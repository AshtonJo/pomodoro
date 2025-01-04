import pomodoroRoutes from "./routes/pomodoroRoutes.js";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express(); // express 연결
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json()); // 미들웨어(JSON 요청 파싱)

// DB 연결
const uri = process.env.ATLAS_URI;
mongoose
  .connect(uri)
  .then(() => console.log("MongoDB 연결 성공"))
  .catch((err) => {
    console.error("MongoDB 연결 실패:", err);
    process.exit(1); // 연결 실패 시 프로세스 종료
  });

// 라우터 연결 => 웹 페이지에서 url에 따른처리(네트워크 패킷 경로 설정)
app.use("/", pomodoroRoutes);
console.log("몽고 URI:", uri);
// 서버 연결
app.listen(PORT, () => {
  console.log(`Server Ready : http://localhost:${PORT}`);
});
