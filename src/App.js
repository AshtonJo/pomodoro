import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import axios from "axios";
import Modal from "./modal/Modal.js";
import React, { useEffect, useRef, useState } from "react";

// 1분 = 60초 10분 = 600초 600초, 집중시간 10분은 10분 * 60 = 600초
// 내가 그냥 간단히 사용하려고 만든 뽀모도로 타이머

export default function App() {
  const [pomoCount, setPomoCount] = useState(0); // 뽀모도로 카운트 횟수
  const [dailyPomoCount, setDailyPomoCount] = useState(0);
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [focusTime, setFocusTime] = useState(10); // 기본값 10분
  const [restTime, setRestTime] = useState(5); // 기본값 5분
  const [currentTime, setCurrentTime] = useState(0); // 남은 시간
  const [isRunning, setIsRunning] = useState(false); // 타이머 시작여부
  const [isFocusMode, setIsFocusMode] = useState(true); // 현재 모드
  const [isCountdown, setIsCountdown] = useState(false); // 3초 카운트다운

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const timerRef = useRef(null); // 타이머 ID 저장
  const RADIUS = 90; // 반지름
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // 둘레 계산

  const savePomodoro = async (count) => {
    try {
      await axios.post(
        `http://localhost:5001/pomodoro`,
        { user: "hee56747", date: currentDate, count: count },
        { withCredentials: true }
      );
      console.log("기록 저장 성공!");
      console.log("저장시 date", currentDate);
    } catch (error) {
      console.log("기록 저장 오류", error);
    }
  };

  // Pomodoro 카운트 업데이트 함수
  const updatePomodoroCount = () => {
    const today = new Date().toISOString().split("T")[0];

    if (currentDate !== today) {
      // 날짜가 바뀌었을 경우
      setCurrentDate(today);
      setDailyPomoCount(1);
      savePomodoro(1);
    } else {
      // 같은 날짜일 경우
      setDailyPomoCount((prev) => prev + 1);
      savePomodoro(dailyPomoCount + 1);
    }
    setPomoCount((prev) => prev + 1);
  };

  const startTimer = () => {
    // 타이머 시작전
    if (isRunning) {
      clearInterval(timerRef.current);
      setIsRunning(false);
    } else {
      // 타이머 시작후 => 카운트다운 => 시작후 카운트다운 없애고 타이머시작
      setIsCountdown(true);
      console.log(pomoCount);
      setTimeout(() => {
        setIsCountdown(false);
        beginTimer();
      }, 3000);
    }
  };

  const beginTimer = () => {
    setIsRunning(true);
    let totalSeconds =
      currentTime || (isFocusMode ? focusTime * 60 : restTime * 60);

    // 반복 작업을 ref의 현재값에 access
    timerRef.current = setInterval(() => {
      totalSeconds -= 1;
      setCurrentTime(totalSeconds);

      if (totalSeconds <= 0) {
        clearInterval(timerRef.current); // 생성한 타이머에 의한 반복작업 취소
        setIsRunning(false);

        if (!isFocusMode) {
          updatePomodoroCount();
        }

        setIsFocusMode((prev) => !prev); // 모드 전환
        setCurrentTime(isFocusMode ? restTime * 60 : focusTime * 60); // 새 시간 설정
      }
    }, 1000);
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setCurrentTime(isFocusMode ? focusTime * 60 : restTime * 60);
  };

  // focusTime이나 restTime이 변경되면 타이머 자동 초기화
  // 특정 react component 실행될때마다 resetTimer 함수 실행
  useEffect(() => {
    resetTimer();
  }, [focusTime, restTime]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    if (currentDate !== today) {
      setCurrentDate(today);
      setDailyPomoCount(0); // 날짜 변경 시 초기화
    }
  }, [currentDate]);

  // 시간에 따른 원 진행도 계산
  const calculateDashOffset = () => {
    const totalSeconds = isFocusMode ? focusTime * 60 : restTime * 60;
    const progress = currentTime / totalSeconds;
    return CIRCUMFERENCE * (1 - progress);
  };

  return (
    <>
      <h1 className="text-center text-5xl lg:text-7xl font-bold mt-10">
        Pomodoro Timer
      </h1>

      <p className="text-center text-2xl font-sans">
        뽀모도로 횟수: {pomoCount}
      </p>
      <div className="flex justify-center items-center">
        <Button
          className="mt-2 rounded-md w-auto h-auto bg-slate-300 px-6 py-1"
          onClick={handleOpenModal}
        >
          Pomodoro 기록 보기
        </Button>
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} />

      {/* 입력 필드 */}
      <div className="flex flex-wrap justify-center items-center gap-4 py-4 bg-green-400 text-xl mx-2 min-w-[200px] my-4">
        <div className="flex items-center">
          <h1 className="px-2">집중 시간</h1>
          <Menu as="div" className="relative flex items-center text-left">
            <MenuButton className="inline-flex w-full px-2 gap-x-1.5 rounded-md bg-white py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
              {focusTime}분
              <ChevronDownIcon
                aria-hidden="true"
                className="-mr-1 h-5 w-5 text-gray-400"
              />
            </MenuButton>
            <MenuItems
              className="absolute z-10 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none overflow-y-auto max-h-24 h-52"
              anchor="bottom end"
            >
              {Array.from({ length: 51 }, (_, i) => i + 10).map((time) => (
                <MenuItem key={time}>
                  {({ active }) => (
                    <button
                      onClick={() => setFocusTime(time)}
                      className={`${
                        active ? "bg-gray-100" : ""
                      } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                    >
                      {time}분
                    </button>
                  )}
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>
        </div>
        <div className="flex items-center">
          <h1 className="px-2">휴식 시간</h1>
          <Menu as="div" className="relative flex items-center text-left">
            <MenuButton className="inline-flex w-full px-2 gap-x-1.5 rounded-md bg-white py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
              {restTime}분
              <ChevronDownIcon
                aria-hidden="true"
                className="-mr-1 h-5 w-5 text-gray-400"
              />
            </MenuButton>
            <MenuItems
              className="absolute z-10 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none overflow-y-auto max-h-24 h-52"
              anchor="bottom end"
            >
              {Array.from({ length: 60 }, (_, i) => i + 1).map((time) => (
                <MenuItem key={time}>
                  {({ active }) => (
                    <button
                      onClick={() => setRestTime(time)}
                      className={`${
                        active ? "bg-gray-100" : ""
                      } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                    >
                      {time}분
                    </button>
                  )}
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>
        </div>
      </div>

      {/* 원형 타이머 UI ! */}
      <div className="flex justify-center items-center">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="transparent"
            stroke="#e0e0e0"
            strokeWidth="8"
          />
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="transparent"
            stroke={isFocusMode ? "#4caf50" : "#2196f3"}
            strokeWidth="8"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={calculateDashOffset()}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.5s linear",
            }}
          />
        </svg>
        <div className="absolute text-center" style={{ zIndex: 10 }}>
          {isCountdown ? (
            <p className="text-4xl font-bold">준비 중...</p>
          ) : (
            <>
              <p className="text-xl font-semibold">
                {isFocusMode ? "집중 시간" : "휴식 시간"}
              </p>
              <h1 className="text-4xl font-bold">
                {Math.floor(currentTime / 60)
                  .toString()
                  .padStart(2, "0")}
                :{(currentTime % 60).toString().padStart(2, "0")}
              </h1>
            </>
          )}
        </div>
      </div>
      {/* 컨트롤 버튼 */}
      <div className="flex justify-center items-center gap-4">
        <button
          className="hover:bg-opacity-30 hover:bg-white p-4 border-2 border-black rounded-full text-xl lg:text-2xl mt-5"
          onClick={startTimer}
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          className="hover:bg-opacity-30 hover:bg-white p-4 border-2 border-black rounded-full text-xl lg:text-2xl mt-5"
          onClick={resetTimer}
        >
          Reset
        </button>
      </div>
    </>
  );
}
