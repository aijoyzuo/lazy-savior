import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ShareButtons from "./component/ShareButtons";
import RatingStars from "./component/RatingStars";
import TryAgainButton from "./component/TryAgainButton";
import LoadingOverlay from "./component/LoadingOverlay";
import Lightbox from "./component/Lightbox";
import type { ReactElement } from 'react';

/* -------- 型別定義 -------- */
type RangeBucket = "short" | "medium" | "long";

type QuestionMeta = {
  id: string;
  type: "radio" | "checkbox" | "range";
  weight?: number;
};

type AnswerRule = {
  id: string;
  type: "radio" | "checkbox" | "range";
  // radio/checkbox → string[]；range → "short" | "medium" | "long"
  value: string[] | RangeBucket;
};

type Quiz = {
  title: string;
  answer: AnswerRule[];
};

type Answers = {
  [key: string]: string | number | string[] | undefined;
};

type Movie = {
  id: string | number;
  title: string;
  image: string;            // 完整 URL 或相對路徑
  description?: string;
  language?: string;
  genres?: string[];
  duration?: number;        // 片長（分鐘，可選）
  rating?: number;          // 例如 0~10 的分數
  score: number;            // 計分後加上
};

type LocationState = { answers?: Answers };

/* -------- scoring helpers -------- */
function rangeHandler(item: AnswerRule, answers: Answers): number {
  const userValue = answers[item.id];
  const classifyDuration = (minutes: number): RangeBucket => {
    if (minutes <= 100) return "short";
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

function answerHandler(
  quiz: Quiz & Partial<Movie>,
  answers: Answers,
  questionMeta: QuestionMeta[]
): number {
  let score = 0;

  quiz.answer.forEach((item) => {
    const meta = questionMeta.find((q) => q.id === item.id);
    const weight = Number(meta?.weight ?? 1);
    let raw = 0;

    if (item.id === "rating") {
      const userChoice = answers["rating"];
      const movieRating = quiz.rating;
      raw = userChoice === "high" && typeof movieRating === "number" && movieRating > 6 ? 1 : 0;
    } else if (item.type === "radio") {
      raw = radioHandler(item, answers);
    } else if (item.type === "checkbox") {
      raw = checkboxHandler(item, answers);
    } else if (item.type === "range") {
      raw = rangeHandler(item, answers);
    }

    score += raw * weight;
  });

  return score;
}

/* -------- Component -------- */
export default function RecommendMovie(): ReactElement | null {
  const { state } = useLocation() as { state?: LocationState };
  const answers = state?.answers;
  const navigate = useNavigate();

 const [recommended, setRecommended] = useState<Movie[]>([]);
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
      navigate("/quiz/movie");
      return;
    }

    fetch(`${process.env.PUBLIC_URL}/data/movie.json`)
      .then((res) => res.json() as Promise<{ data: { questions: QuestionMeta[] } }>)
      .then(({ data }) => {
        const questionMeta = data.questions;

        return fetch(`${process.env.PUBLIC_URL}/data/moviedata.json`)
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json() as Promise<{ data: (Quiz & Omit<Movie, "score">)[] }>;
          })
          .then(({ data }) => {
            const scored: Movie[] = data.map((movie) => ({
              ...movie,
              score: answerHandler(movie, answers, questionMeta),
            }));

            const top = scored
              .filter((m) => m.score > 0)
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
            className="text-center py-3 shadow-sm fixed-top text-white"
            style={{ backgroundColor: "#ca4231" }}
          >
            <h5 className="m-0">懶惰影迷的選片推薦系統</h5>
          </header>

          <main className="flex-grow-1 py-3">
            <h2 className="text-center mb-4">根據你的選擇，我們推薦：</h2>

            <div className="row justify-content-center">
              {recommended.map((movie, index) => (
                <div key={movie.id} className="col-md-4 col-lg-3 mb-2 position-relative">
                  <div className="card h-100 fade-in-up">
                    <div
                      className="position-absolute top-0 start-0 text-white px-2 py-1 fw-bold rounded-end"
                      style={{ backgroundColor: "rgba(202, 66, 49, 0.6)" }}
                    >
                      <i className="bi bi-award-fill me-1" />No.{index + 1}
                    </div>

                    {/* 圖片可點開燈箱 */}
                    <img
                      src={movie.image}
                      className="card-img-top object-fit-cover"
                      style={{ height: "300px", objectPosition: "center", cursor: "zoom-in" }}
                      alt={movie.title}
                      onClick={() => openLightbox(index)}
                    />

                    <div className="card-body">
                      <div className="d-flex gap-2">
                        <h5 className="card-title">{movie.title}</h5>
                        {typeof movie.rating === "number" && movie.rating > 6 && (
                          <div>
                            <p className="badge bg-warning text-dark">高分推薦</p>
                          </div>
                        )}
                      </div>

                      {movie.description && <p className="card-text">{movie.description}</p>}
                      <ul className="list-unstyled small">
                        {movie.language && <li>語言：{movie.language}</li>}
                        <li>類型：{movie.genres?.join?.("、")}</li>
                        <li>
                          配對分數：<RatingStars score={movie.score} />
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
              {recommended.length === 0 && (
                <p className="text-center mt-5">抱歉，找不到符合條件的電影。</p>
              )}
            </div>

            <div className="row justify-content-center mt-2">
              <div className="col-12 col-md-5">
                <ShareButtons title="快來看看我該看哪部電影！" />
              </div>
            </div>

            <div className="row justify-content-center mt-2">
              <div className="col-12 col-md-4">
                <TryAgainButton
                  text="再懶一次"
                  textColor="text-white"
                  buttonColor="#ca4231"
                  swalBackground="#ffe8e8"
                  swalClass={{
                    confirmButton: "btn btn-danger mx-2",
                    cancelButton: "btn btn-outline-danger bg-white mx-2",
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
            srcResolver={(m: Movie) =>
              /^https?:\/\//i.test(m.image) ? m.image : `${process.env.PUBLIC_URL}/${m.image}`
            }
            altResolver={(m: Movie) => m.title}
            // 顯示欄位
            metaResolver={(m: Movie) =>
              [
                m.language && { label: "", value: m.language },
                typeof m.duration === "number" && { label: "片長", value: `：${m.duration} 分鐘` },
                m.genres?.length && { label: "", value: m.genres.join("、") },
              ].filter(Boolean) as { label: string; value: string }[]
            }
            // 外部動作
            actionsResolver={(m: Movie) => [
              {
                label: "搜尋片源",
                variant: "primary",
                href: `https://www.google.com/search?q=${encodeURIComponent(m.title + " 線上看")}`,
              },
            ]}
          />
        </div>
      )}
    </>
  );
}
