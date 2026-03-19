import React from "react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ShareButtons from "./component/ShareButtons";
import RatingStars from "./component/RatingStars";
import TryAgainButton from "./component/TryAgainButton";
import LoadingOverlay from "./component/LoadingOverlay";
import Lightbox from "./component/Lightbox";

/* ========= 型別 ========= */
type Answers = Record<string | number, any>;

type QuizRule = {
  id: string | number;
  type: "radio" | "checkbox" | "range" | string;
  value?: any;
};

type QuestionMeta = {
  id: string | number;
  weight?: number;
  type?: "radio" | "checkbox" | "range" | string;
  value?: any;
};

type Book = {
  id: string | number;
  image: string;
  title: string;
  rating?: string;
  duration?: string;
  description?: string;
  author?: string;
  genre?: string;
  mood?: string[];
  language?: string;
  preference?: string;
  answer?: QuizRule[];
  score: number;
};

type LocationState = { answers: Answers };

/* ========= handler functions ========= */
function rangeHandler(item: QuizRule, answers: Answers): number {
  const userValue = answers[item.id];
  const classifyDuration = (minutes: number) => {
    if (minutes <= 60) return "short";
    if (minutes <= 80) return "medium";
    return "long";
  };
  const userCategory = classifyDuration(Number(userValue));
  if (userCategory === "medium") return 0;
  return userCategory === item.value ? 1 : 0;
}

function radioHandler(item: QuizRule, answers: Answers): number {
  const userValue = answers[item.id];
  if (userValue === "不限") return 0;

  if (item.id === "genre") {
    const userIsInspiration = userValue === "inspiration";
    const bookIsInspiration =
      Array.isArray(item.value) && item.value.includes("inspiration");
    console.log("genre 題選擇：", userValue, "| 書是否勵志：", bookIsInspiration);
    return userIsInspiration && bookIsInspiration ? 1 : 0;
  }

  return Array.isArray(item.value) && item.value.includes(userValue) ? 1 : 0;
}

function checkboxHandler(item: QuizRule, answers: Answers): number {
  const userValues = answers[item.id];
  if (!Array.isArray(userValues)) return 0;
  const matched = (item.value as any[]).filter((v) => userValues.includes(v));
  return matched.length;
}

function answerHandler(
  quiz: { title: string; answer: QuizRule[] },
  answers: Answers,
  questionMeta: QuestionMeta[]
): number {
  let score = 0;
  console.log(`${quiz.title} 的比對開始`);

  quiz.answer.forEach((item: QuizRule) => {
    const meta = questionMeta.find((q) => q.id === item.id);
    const weight = Number(meta?.weight ?? 1);

    let raw = 0;
    if (item.type === "radio") raw = radioHandler(item, answers);
    else if (item.type === "checkbox") raw = checkboxHandler(item, answers);
    else if (item.type === "range") raw = rangeHandler(item, answers);

    score += raw * weight;
    console.log(` 題目 ${item.id}：得 ${raw} * 權重 ${weight} = ${raw * weight}`);
  });

  console.log(`總分：${score}`);
  return score;
}

/* ========= Component ========= */
export default function RecommendBook(): React.ReactElement | null {
  const { state } = useLocation() as { state?: LocationState };
  const answers = state?.answers;
  const navigate = useNavigate();

  const [recommended, setRecommended] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<{ open: boolean; index: number }>({
    open: false,
    index: 0,
  }); //  Lightbox

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!answers) {
      navigate("/quiz/book");
      return;
    }

    // 1) 題目定義（拿到 meta/weight）
    fetch(`${process.env.PUBLIC_URL}/data/book.json`)
      .then((res) => res.json() as Promise<{ data: { questions: QuestionMeta[] } }>)
      .then(({ data }) => {
        const questionMeta = data.questions;

        // 2) 候選書籍
        return fetch(`${process.env.PUBLIC_URL}/data/bookdata.json`)
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json() as Promise<{
              data: (Omit<Book, "score"> & { answer: QuizRule[] })[];
            }>;
          })
          .then(({ data }) => {
            const scored: Book[] = data.map((book) => ({
              ...book,
              score: answerHandler(book, answers, questionMeta),
            }));

            const top = scored
              .filter((b) => b.score > 0)
              .sort((a, b) => b.score - a.score || Math.random() - 0.5)
              .slice(0, 3);

            setRecommended(top);
          });
      })
      .catch((err) => console.error("讀取失敗 👉", err));
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
            style={{ backgroundColor: "#4D606e" }}
          >
            <h5 className="m-0">懶人書蟲的推薦系統</h5>
          </header>

          <main className="flex-grow-1 py-3">
            <h2 className="text-center mb-4">根據你的選擇，我們推薦：</h2>
            <div className="row justify-content-center">
              {recommended.map((book, index) => (
                <div key={book.id} className="col-md-4 col-lg-3 mb-2 position-relative">
                  <div className="card h-100 fade-in-up">
                    <div
                      className="position-absolute top-0 start-0 text-white px-2 py-1 fw-bold rounded-end"
                      style={{ backgroundColor: "rgba(77, 96, 110, 0.7)" }}
                    >
                      <i className="bi bi-award-fill me-1" />
                      No.{index + 1}
                    </div>

                    {/* 圖片，點選後開燈箱 */}
                    <img
                      src={book.image}
                      className="card-img-top object-fit-cover"
                      style={{
                        height: "300px",
                        objectPosition: "center",
                        cursor: "zoom-in",
                      }}
                      alt={book.title}
                      onClick={() => openLightbox(index)}
                    />

                    <div className="card-body">
                      <div className="d-flex gap-2">
                        <h5 className="card-title mb-0">{book.title}</h5>
                        {book.rating === "限制級" && (
                          <div>
                            <p className="badge bg-danger text-white">{book.rating}</p>
                          </div>
                        )}
                        {book.duration !== "一般篇幅" && (
                          <div>
                            <p className="badge bg-secondary text-white">
                              {book.duration}
                            </p>
                          </div>
                        )}
                      </div>

                      <p className="card-text">{book.description}</p>
                      <ul className="list-unstyled small">
                        <li>作者：{book.author}</li>
                        <li>
                          類型：{book.genre} 、{book.mood?.join?.("、")}
                        </li>
                        <li>語言：{book.language}</li>
                        <li>
                          推薦指數：<RatingStars score={book.score} />
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ))}

              {recommended.length === 0 && (
                <p className="text-center mt-5">抱歉，找不到符合條件的書籍。</p>
              )}
            </div>

            <div className="row justify-content-center mt-2">
              <div className="col-12 col-md-5">
                <ShareButtons title="這本書超適合你！" />
              </div>
            </div>

            <div className="row justify-content-center mt-2">
              <div className="col-12 col-md-4">
                <TryAgainButton
                  text="再懶一次"
                  buttonColor="#4D606e"
                  textColor="text-white"
                  swalBackground="#90b4cf"
                  swalClass={{
                    confirmButton: "btn btn-primary mx-2",
                    cancelButton: "btn btn-outline-primary bg-white mx-2",
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
            srcResolver={(m: Book) =>
              /^https?:\/\//i.test(m.image)
                ? m.image
                : `${process.env.PUBLIC_URL}/${m.image}`
            }
            altResolver={(m: Book) => m.title}
            // 顯示欄位
            metaResolver={(m: Book) =>
              [
                m.author && { label: "作者：", value: m.author },
                m.rating && { label: "", value: m.rating },
                m.preference && { label: "", value: m.preference },
              ].filter(Boolean) as { label: string; value: string }[]
            }
            // 動作按鈕
            actionsResolver={(m: Book) => [
              {
                label: "搜尋通路",
                variant: "primary",
                href: `https://www.google.com/search?q=${encodeURIComponent(
                  m.title + " 購買"
                )}`,
              },
            ]}
          />
        </div>
      )}
    </>
  );
}
