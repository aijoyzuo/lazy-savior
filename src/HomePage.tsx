import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Film, Book, CupHot } from "react-bootstrap-icons";
import type { ReactElement } from 'react';

export default function HomePage(): ReactElement {
  // 路由鍵
  const options = ["movie", "book", "food"] as const;
  // 顯示標籤（順序要對上）
  const labels: string[] = ["看電影", "看點書", "吃東西"]; 
  const icons: React.ReactNode[] = [
    <Film aria-hidden="true" />,
    <Book aria-hidden="true" />,
    <CupHot aria-hidden="true" />,
  ];

  const navigate = useNavigate();
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);

  const sectorAngle = 120; // 三等分
  const pointerAngle = 90; // 指針在下方（6 點鐘）→ 90°

  const spinWheel = (): void => {
    if (isSpinning) return;

    setIsSpinning(true);

    const randomIndex = Math.floor(Math.random() * options.length);
    const chosen = options[randomIndex];

    const targetAngle = pointerAngle - randomIndex * sectorAngle;
    const baseRotation = 360 * 5;
    const randomWiggle = Math.random() * 10 - 5;
    const newRotation = rotation + baseRotation + targetAngle + randomWiggle;

    // 下一輪事件迴圈再觸發快速轉
    window.setTimeout(() => {
      setRotation(newRotation);
    }, 50);

    window.setTimeout(() => {
      navigate(`/quiz/${chosen}`);
      setIsSpinning(false);
    }, 3500);
  };

  useEffect(() => {
    const t = window.setTimeout(() => setLoaded(true), 100);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      <div className="py-0 py-md-4">
        <header
          className="text-center py-2 shadow-sm fixed-top"
          style={{ color: "var(--darkBlue)", backgroundColor: "var(--pink-alpha)" }}
        >
          <h1 className="title mb-0">懶人救星</h1>
        </header>

        <div className="wheel-page">
          <div className="info text-center p-4 mb-3 mt-0 mt-md-4">
            <p className="mb-1">懶人今天怎麼過</p>
            <p className="mb-0">試試給懶人的活動推薦系統！</p>
          </div>

          <div className={`box ${loaded ? "wheel-fadein" : ""}`}>
            <div className="wheel-background" />
            <div className="bgImg">
              {/* 旋轉的容器 */}
              <div
                className={`wheel ${!isSpinning ? "slow-spin" : ""}`}
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning ? "transform 3.5s cubic-bezier(0.33, 1, 0.68, 1)" : "none",
                }}
              >
                {/* 底層：扇形色塊 */}
                <div className="sectors">
                  {labels.map((_, i) => (
                    <div
                      className="sector"
                      key={`sector-${i}`}
                      style={{ transform: `translate(-50%, -50%) rotate(${i * sectorAngle}deg)` }}
                    />
                  ))}
                </div>

                {/* 上層：標籤（圖示＋文字） */}
                <div className="labels">
                  {labels.map((text, i) => (
                    <div
                      className="labelBlock"
                      key={`label-${i}`}
                      style={{
                        transform: `
                          translate(-50%, -50%) 
                          rotate(${i * sectorAngle - sectorAngle / 6}deg)
                          translate(var(--labelRadius), 0) 
                          rotate(80deg)
                          translate(-50%, -20%)
                        `,
                      }}
                    >
                      <span className="icon" aria-hidden="true">
                        {icons[i]}
                      </span>                     
                      <span className={`label ${labels[i] === "食物" ? "vertical" : ""}`}>{labels[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 覆蓋層：中央按鈕＋下方指針 */}
            <div className="overlay">
              <button className="centerText" onClick={spinWheel} disabled={isSpinning} aria-label="開始轉盤">
                PRESS
              </button>
              <img
                src={`${process.env.PUBLIC_URL}/images/pointer.png`}
                alt="指針"
                className="arrowIcon"
              />
            </div>
          </div>
        </div>

        <footer
          className="text-white text-center py-3 fixed-bottom"
          style={{ backgroundColor: "var(--pink-alpha)" }}
        >
          <small>© {new Date().getFullYear()} All rights reserved.</small>
        </footer>
      </div>
    </>
  );
}
