import Pomodoro from "../models/Pomodoro.js";
import express from "express";

const router = express.Router(); // 라우터는 주소 생성의 역할

// 기록 저장
router.post("/pomodoro", async (req, res) => {
  const { user, date, count } = req.body;
  console.log("user", user, "date", date, "count", count);

  try {
    const existingRecord = await Pomodoro.findOne({ user, date });

    if (existingRecord) {
      // 기록 있으면 업데이트
      existingRecord.count += count;
      await existingRecord.save();
      res.json(existingRecord);
    } else {
      // 없으면 새로운 기록 생성
      const newRecord = new Pomodoro({ user, date, count });
      await newRecord.save();
      res.json(newRecord);
    }
  } catch (error) {
    res.status(500).json({ message: "기록 저장 실패" });
  }
});

// 전체 날짜 기록 조회
router.get("/pomodoro/:user", async (req, res) => {
  const { user } = req.params; // URL 파라미터로 user 가져오기

  try {
    const records = await Pomodoro.find({ user }); // 해당 유저의 모든 기록 조회
    res.json(records || []); // 결과 없으면 빈 배열 반환
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "전체 날짜 기록 조회 실패" });
  }
});

// 특정 날짜 기록 조회
router.get("/pomodoro/:user/:date", async (req, res) => {
  const { user, date } = req.params; // URL 파라미터 사용 토큰 받아오기

  try {
    const record = await Pomodoro.findOne({ user, date });
    res.json(record || { count: 0 });
  } catch (error) {
    res.status(500).json({ message: "특정 날짜 기록 조회 실패" });
  }
});

// 특정 기록 삭제
router.delete("/pomodoro/:id", async (req, res) => {
  const { id } = req.params; // URL에서 _id 가져오기

  try {
    // MongoDB에서 해당 _id로 데이터 삭제
    const deletedRecord = await Pomodoro.findByIdAndDelete(id);

    if (!deletedRecord) {
      return res.status(404).json({ message: "기록을 찾을 수 없습니다." });
    }

    res.json({ message: "기록 삭제 성공", deletedRecord });
  } catch (error) {
    console.error("기록 삭제 오류", error);
    res.status(500).json({ message: "기록 삭제 실패" });
  }
});

export default router;
