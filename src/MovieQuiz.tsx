import { useState, useEffect, useMemo } from "react";
import SliderQuestion from "./component/SliderQuestion";
import RadioQuestion from "./component/RadioQuestion";
import CheckboxQuestion from "./component/CheckboxQuestion";
import { useNavigate } from "react-router-dom";
import LoadingOverlay from "./component/LoadingOverlay";
import type { ReactElement } from 'react';

/* ---------- 型別定義 ---------- */
type BaseQuestion = {
  id: string | number;
  label: string;
  field: string;
  required?: boolean;
  type: "range" | "radio" | "checkbox";
};

type RangeQuestion = BaseQuestion & {
  type: "range";
  min?: number;
  max?: number;
  step?: number;
};

type Option = { id: string; label: string; value?: string };

type RadioQuestionT = BaseQuestion & {
  type: "radio";
  options: Option[];
};

type CheckboxQuestionT = BaseQuestion & {
  type: "checkbox";
  options: Option[];
};

type Question = RangeQuestion | RadioQuestionT | CheckboxQuestionT;

type QuizData = {
  title: string;
  titlePic: string;
  questions: Question[];
};

type Answers = {
  duration: number;
  person: string;
  afterMovie: string;
  rating: string;
  language: string[];
  mood: string[];
  fillPerson: string;
  fillDate: string;
  [key: string]: string | number | string[]; // 允許用 answers[q.field]
};

/* 型別守衛：讓 filter 後自動縮小型別 */
const isRange = (q: Question): q is RangeQuestion => q.type === "range";
const isRadio = (q: Question): q is RadioQuestionT => q.type === "radio";
const isCheckbox = (q: Question): q is CheckboxQuestionT => q.type === "checkbox";

export default function MovieQuiz(): ReactElement {
  /* ---------- 載入資料 ---------- */
  const [title, setTitle] = useState<string>("");        // 問卷標題
  const [titlePic, setTitlePic] = useState<string>("");
  const [qData, setQData] = useState<QuizData | null>(null); // 問卷題目 & 必填規則
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 700);
    return () => window.clearTimeout(t);
  }, []);

  const url = `${process.env.PUBLIC_URL}/data/movie.json`; // 用環境變數

  useEffect(() => {
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<{ data: QuizData }>;
      })
      .then(({ data }) => {
        setTitle(data.title);
        setTitlePic(data.titlePic);
        setQData(data);
      })
      .catch((err) => {
        console.error("載入 movie.json 失敗 ", err);
      });
  }, [url]);

  /* ---------- 表單答案 ---------- */
  const [answers, setAnswers] = useState<Answers>({
    duration: 90,
    person: "",
    afterMovie: "",
    rating: "",
    language: [],
    mood: [],
    fillPerson: "",
    fillDate: "",
  });

  /* ---------- 必填驗證 ---------- */
  const isFormComplete = useMemo(() => {
    if (!qData) return false;

    const requiredQuestions = qData.questions.filter((q) => q.required);
    return requiredQuestions.every((q) => {
      const val = answers[q.field];
      if (q.type === "checkbox") {
        return Array.isArray(val) && val.length > 0;
      }
      return val !== undefined && val !== "";
    });
  }, [answers, qData]);

  /* ---------- 送出 ---------- */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormComplete) {
      alert("請完成所有問題");
      return;
    }

    // 導向下一頁，同時用 state 傳遞答案物件
    navigate("/quiz/recommendMovie", { state: { answers } });
  };

  /* ---------- 等 fetch 完再渲染 ---------- */
  if (!qData) return <p>Loading questionnaire…</p>; // 資料尚未載入時

  return (
    <>
      <LoadingOverlay show={loading} text="" />
      {!loading && (
        <div className="movie-quiz mb-3">
          <div className="container py-3">
            <div className="card">
              <img
                src={titlePic}
                className="card-img-top w-100"
                alt="theater"
                style={{ maxHeight: "300px", objectFit: "cover" }}
              />
              <div className="card-body">
                <div className="card-title text-center mb-5">
                  <h3>{title}</h3>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="row pb-4 border-bottom">
                    <div className="col-md-6 py-2">
                      <label htmlFor="fillPerson" className="h5 form-label">
                        暱稱<span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control py-3"
                        id="fillPerson"
                        required
                        value={answers.fillPerson}
                        onChange={(e) => setAnswers((a) => ({ ...a, fillPerson: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-6 py-2">
                      <label htmlFor="fillDate" className="h5 form-label">
                        問卷填寫日期<span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control py-3"
                        id="fillDate"
                        placeholder="yyyy/mm/dd"
                        required
                        value={answers.fillDate}
                        onChange={(e) => setAnswers((a) => ({ ...a, fillDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Range 題 */}
                  {qData.questions.filter(isRange).map((q) => (
                    <SliderQuestion
                      key={q.id}
                      label={q.label}
                      field={q.field}
                      value={(answers[q.field] as number) ?? 0}
                      min={q.min}
                      max={q.max}
                      step={q.step}
                      onChange={(f, val) => setAnswers((a) => ({ ...a, [f]: val }))}
                      sliderClassName="slider-movie"
                    />
                  ))}

                  {/* Radio 題 */}
                  {qData.questions.filter(isRadio).map((q) => (
                    <RadioQuestion
                      key={q.id}
                      question={q.label}
                      options={q.options}
                      field={q.field}
                      value={(answers[q.field] as string) ?? ""}
                      onChange={(val) => setAnswers((a) => ({ ...a, [q.field]: val }))}
                    />
                  ))}

                  {/* Checkbox 題 */}
                  {qData.questions.filter(isCheckbox).map((q) => (
                    <CheckboxQuestion
                      key={q.id}
                      question={q.label}
                      options={q.options}
                      field={q.field}
                      value={(answers[q.field] as string[]) ?? []}
                      onChange={(id, checked) => {
                        setAnswers((prev) => {
                          const set = new Set((prev[q.field] as string[]) ?? []);
                          checked ? set.add(id) : set.delete(id);
                          return { ...prev, [q.field]: Array.from(set) };
                        });
                      }}
                    />
                  ))}

                  <button
                    type="submit"
                    className="btn btn-outline-dark p-2 mt-2 w-100 border-2"
                    disabled={!isFormComplete}
                  >
                    送出
                  </button>
                </form>
              </div>
              <div className="card-footer py-2" style={{ backgroundColor: "#ca4231" }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
