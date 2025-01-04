import axios from "axios";
import { useEffect, useState } from "react";

export default function Modal({ isOpen, onClose }) {
  const [savedRecords, setSavedRecords] = useState([]);

  const fetchRecords = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5001/pomodoro/hee56747`,
        {
          withCredentials: true,
        }
      );

      // 날짜 기준으로 최신순 정렬 + 중복 제거
      const uniqueRecords = Object.values(
        response.data.reduce((acc, record) => {
          const dateKey = new Date(record.date).toISOString().split("T")[0];
          acc[dateKey] = record; // 같은 날짜가 있으면 최신 값으로 덮어씀
          return acc;
        }, {})
      ).sort((a, b) => new Date(b.date) - new Date(a.date));

      console.log(uniqueRecords);
      setSavedRecords(uniqueRecords);
    } catch (error) {
      console.error("기록 조회 오류", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost:5001/pomodoro/${id}`
      );
      alert(response.data.message); // 삭제 성공 메시지
      fetchRecords(); // 삭제 후 목록 새로고침
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제 중 오류 발생");
    }
  };

  useEffect(() => {
    if (isOpen) fetchRecords(); // 모달 열리면 데이터 로드
  }, [isOpen]);

  return isOpen ? (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      style={{ zIndex: 50 }}
    >
      <div className="bg-white rounded-lg p-6 w-1/2 max-h-[80%] overflow-y-auto min-w-[300px]">
        <h2 className="text-2xl font-bold mb-4">Pomodoro 기록</h2>
        <ul>
          {savedRecords.length ? (
            savedRecords.map((record, idx) => (
              <li key={idx} className="py-2 border-b">
                날짜: {new Date(record.date).toLocaleDateString("ko-KR")} -
                횟수: {record.count}
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 ml-2"
                  onClick={() => handleDelete(record._id)}
                >
                  삭제
                </button>
              </li>
            ))
          ) : (
            <p className="text-center">기록이 없습니다.</p>
          )}
        </ul>
        <div className="flex justify-end">
          <button
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  ) : null;
}
