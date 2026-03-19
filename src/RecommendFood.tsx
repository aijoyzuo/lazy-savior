import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ShareButtons from "./component/ShareButtons";
import RatingStars from "./component/RatingStars";
import TryAgainButton from "./component/TryAgainButton";
import LoadingOverlay from "./component/LoadingOverlay";
import Lightbox from "./component/Lightbox";
import type { ReactElement } from 'react';

/* ---------- 型別定義 ---------- */
type RangeBucket = "short" | "medium" | "long";

type QuestionMeta = {
  id: string;
  type: "radio" | "checkbox" | "range";
  weight?: number;
};

type AnswerRule = {
  id: string;
  type: "radio" | "checkbox" | "range";
  // radio/checkbox → string[]；range → RangeBucket
  value: string[] | RangeBucket;
};

type Quiz = {
  title: string;
  answer: AnswerRule[];
};

type QuizWithDiet = Quiz & { diet?: string };

type Answers = {
  // 固定欄位（可以按需求增減）
  fillPerson?: string;
  fillDate?: string;
  // 動態欄位（所有 q.id 都會放進來）
  [key: string]: string | number | string[] | undefined;
};

type Food = {
  id: string | number;
  title: string;
  image: string;                  // e.g. "/images/xxx.jpg" 或完整 URL
  description?: string;
  diet?: string;                  // e.g. "葷素皆可" / "vegetarian"
  preference?: string[];          // e.g. ["炒","湯"]
  score: number;                  // 計分後加上
};

type LocationState = { answers?: Answers };

/* ---------- handler（加上型別） ---------- */
function rangeHandler(item: AnswerRule, answers: Answers): number {
  const userValue = answers[item.id];

  const classifyDuration = (minutes: number): RangeBucket => {
    if (minutes <= 60) return "short";
    if (minutes <= 120) return "medium";
    return "long";
  };

  if (typeof userValue !== "number") return 0;
  const userCategory = classifyDuration(userValue);
  return userCategory === item.value ? 1 : 0;
}

function radioHandler(item: AnswerRule, answers: Answers): number {
  const userValue = answers[item.id];
  if (typeof userValue !== "string") return 0;
  const ruleVals = Array.isArray(item.value) ? item.value : [];
  return ruleVals.includes(userValue) ? 1 : 0;
}

function checkboxHandler(item: AnswerRule, answers: Answers): number {
  const userValues = answers[item.id];
  if (!Array.isArray(userValues)) return 0;
  const ruleVals = Array.isArray(item.value) ? item.value : [];
  const matched = ruleVals.filter((v) => userValues.includes(v));
  return matched.length;
}

/* ---------- 主比對邏輯 ---------- */
function answerHandler(quiz: QuizWithDiet, answers: Answers, questionMeta: QuestionMeta[]): number {
  let score = 0;

  quiz.answer.forEach((item) => {
    const meta = questionMeta.find((q) => q.id === item.id);
    const weight = Number(meta?.weight ?? 1);

    let raw = 0;
    if (item.type === "radio") raw = radioHandler(item, answers);
    else if (item.type === "checkbox") raw = checkboxHandler(item, answers);
    else if (item.type === "range") raw = rangeHandler(item, answers);

    // 特例：若是飲食題且此料理為 vegetarian，跳過加權
    if (item.id === "diet" && quiz.diet === "vegetarian") return;

    score += raw * weight;
  });

  return score;
}

/* ---------- Component ---------- */
export default function RecommendFood(): ReactElement | null {
  const { state } = useLocation() as { state?: LocationState };
  const answers = state?.answers;
  const navigate = useNavigate();

  const [recommended, setRecommended] = useState<Food[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lightbox, setLightbox] = useState<{ open: boolean; index: number }>({
    open: false,
    index: 0,
  });

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 1000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!answers) {
      navigate("/quiz/food");
      return;
    }

    // 1) 載入題目定義（取出權重等 meta）
    fetch(`${process.env.PUBLIC_URL}/data/food.json`)
      .then((res) => res.json() as Promise<{ data: { questions: QuestionMeta[] } }>)
      .then(({ data }) => {
        const questionMeta = data.questions;

        // 2) 載入候選料理資料（每筆需含 answer 規則）
        return fetch(`${process.env.PUBLIC_URL}/data/fooddata.json`)
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json() as Promise<{ data: (QuizWithDiet & Omit<Food, "score">)[] }>;
          })
          .then(({ data }) => {
            const scored: Food[] = data.map((food) => ({
              ...food,
              score: answerHandler(food, answers, questionMeta),
            }));

            const top = scored
              .filter((f) => f.score > 0)
              .sort((a, b) => b.score - a.score || Math.random() - 0.5)
              .slice(0, 3);

            setRecommended(top);
          });
      })
      .catch((err) => console.error("讀取失敗", err));
  }, [answers, navigate]);

  // Lightbox 控制
  const openLightbox = (i: number) => setLightbox({ open: true, index: i });
  const closeLightbox = () => setLightbox({ open: false, index: 0 });
  const nextImage = () =>
    setLightbox((lb) => ({ open: true, index: (lb.index + 1) % recommended.length }));
  const prevImage = () =>
    setLightbox((lb) => ({
      open: true,
      index: (lb.index - 1 + recommended.length) % recommended.length,
    }));

  if (!answers) return null;

  return (
    <>
      <LoadingOverlay show={loading} text="推薦生成中..." />
      {!loading && (
        <div className="container py-5">
          <header
            className="text-center py-3 shadow-sm fixed-top"
            style={{ backgroundColor: "#f6da85" }}
          >
            <h5 className="m-0">懶惰吃貨的飲食推薦系統</h5>
          </header>

          <main className="flex-grow-1 py-3">
            <h2 className="text-center mb-4">根據你的選擇，我們推薦：</h2>
            <div className="row">
              {recommended.map((food, index) => (
                <div key={food.id} className="col-md-4 mb-2 position-relative">
                  <div className="card h-100 fade-in-up">
                    <div
                      className="position-absolute top-0 start-0 text-white px-2 py-1 fw-bold rounded-end"
                      style={{ backgroundColor: "rgba(255, 193, 7, 0.7)" }}
                    >
                      <i className="bi bi-award-fill me-1" />
                      No.{index + 1}
                    </div>

                    {/* 圖片可點開燈箱 */}
                    <img
                      src={`${process.env.PUBLIC_URL}${food.image}`}
                      className="card-img-top object-fit-cover"
                      style={{ height: "300px", objectPosition: "center", cursor: "zoom-in" }}
                      alt={food.title}
                      onClick={() => openLightbox(index)}
                    />

                    <div className="card-body">
                      <div className="d-flex gap-2">
                        <h5 className="card-title">{food.title}</h5>
                        {food.diet !== "葷素皆可" && (
                          <div>
                            <p className="badge bg-warning text-dark">{food.diet}</p>
                          </div>
                        )}
                      </div>
                      {food.description && <p className="card-text">{food.description}</p>}
                      <ul className="list-unstyled small">
                        <li>料理分類：{food.preference?.join?.("、")}</li>
                        <li>
                          推薦指數：<RatingStars score={food.score} />
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ))}

              {recommended.length === 0 && (
                <p className="text-center mt-5">抱歉，找不到符合條件的料理。</p>
              )}
            </div>

            <div className="row justify-content-center mt-2">
              <div className="col-12 col-md-5">
                <ShareButtons title="今天就吃這個吧！" />
              </div>
            </div>

            <div className="row justify-content-center mt-2">
              <div className="col-12 col-md-4">
                <TryAgainButton
                  text="再懶一次"
                  textColor="text-dark"
                  buttonColor="#f6da85"
                  swalBackground="#fffbe6"
                  swalClass={{
                    confirmButton: "btn btn-warning mx-2",
                    cancelButton: "btn btn-outline-warning bg-white mx-2",
                    actions: "swal2-button-group-gap",
                  }}
                  redirectPath="/"
                />
              </div>
            </div>
          </main>

          <footer className="bg-dark text-white text-center py-3 fixed-bottom">
            <small>© {new Date().getFullYear()} All rights reserved.</small>
          </footer>

          {/* ===== Lightbox Overlay ===== */}
          <Lightbox
            isOpen={lightbox.open}
            images={recommended}
            index={lightbox.index}
            onClose={closeLightbox}
            onPrev={prevImage}
            onNext={nextImage}
            showBadge
            closeLabel="關閉"
            // 圖片
            srcResolver={(m: Food) =>
              /^https?:\/\//i.test(m.image) ? m.image : `${process.env.PUBLIC_URL}/${m.image}`
            }
            altResolver={(m: Food) => m.title}
            // 顯示欄位
            metaResolver={(m: Food) =>
              [
                m.preference?.length && { label: "", value: m.preference!.join("、") },
                m.diet && { label: "", value: m.diet },
              ].filter(Boolean) as { label: string; value: string }[]
            }
            // 外部動作
            actionsResolver={(m: Food) => [
              {
                label: "搜尋餐廳",
                variant: "primary",
                href: `https://www.google.com/search?q=${encodeURIComponent(m.title + " 推薦餐廳")}`,
              },
            ]}
          />
        </div>
      )}
    </>
  );
}
