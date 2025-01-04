import mongoose from "mongoose";

// 스키마는 바인딩할 Collections의 인터페이스(이어주는장치)
// 즉 예시로 뽀모도로 하고 형식을 이어주는 장치
const { Schema, model } = mongoose;

const pomodoroSchema = new Schema({
  // 사용자 id, 날짜, 뽀모도로 횟수 필요
  user: { type: String, required: true },
  date: { type: Date, default: Date.now, required: true },
  count: { type: Number, default: 0, required: true },
});

const Pomodoro = model("Pomodoro", pomodoroSchema);

export default Pomodoro;
// module.exports = model("Pomodoro", pomodoroSchema);
