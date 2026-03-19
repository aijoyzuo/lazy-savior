// src/component/Lightbox.tsx
import React, { useEffect, useState, useRef } from "react";
import type { ReactElement, ReactNode } from "react";

/** 單一圖片資料的最低需求（保留彈性） */
export type ImageLike = {
  image?: string;
  src?: string;
  title?: string;
} & Record<string, unknown>;

export type MetaChip = {
  label: string;
  value: ReactNode;
};

export type Action<T = unknown> = {
  label: string;
  href?: string;
  onClick?: (item: T, index: number) => void; // ⬅ 修正：傳入 item 與 index
  variant?: "primary" | "secondary" | "danger" | "link";
  target?: string;
  rel?: string;
};

export interface LightboxProps<T extends ImageLike = ImageLike> {
  isOpen: boolean;
  images: T[];
  index?: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  showBadge?: boolean;

  /** 回傳 <img> src；預設使用 item.image || item.src */
  srcResolver?: (item: T) => string;
  /** 回傳 <img> alt；預設使用 item.title || "" */
  altResolver?: (item: T) => string;
  /** 回傳底部 meta chips；預設空陣列 */
  metaResolver?: (item: T) => MetaChip[];
  /** 回傳右下角動作按鈕；預設空陣列 */
  actionsResolver?: (item: T, index: number) => Action<T>[];

  closeLabel?: string;
}

const Lightbox = <T extends ImageLike = ImageLike>({
  isOpen,
  images = [],
  index = 0,
  onClose,
  onPrev,
  onNext,
  showBadge = false,
  srcResolver,
  altResolver,
  metaResolver,
  actionsResolver,
  closeLabel = "關閉",
}: LightboxProps<T>): ReactElement | null => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };

    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose, onPrev, onNext]);

  // 邊界判斷
  if (!isOpen || index < 0 || index >= images.length) return null;

  const item = images[index];

  // 預設 resolver：盡量容錯
  const defaultSrcResolver = (it: T) => String((it as any).image || (it as any).src || "");
  const defaultAltResolver = (it: T) => String((it as any).title || "");
  const defaultMetaResolver = () => [] as MetaChip[];
  const defaultActionsResolver = () => [] as Action<T>[];

  const src = (srcResolver ?? defaultSrcResolver)(item);
  const alt = (altResolver ?? defaultAltResolver)(item);
  const meta = (metaResolver ?? defaultMetaResolver)(item);
  const actions = (actionsResolver ?? defaultActionsResolver)(item, index);

  // 圖片載入後依天然尺寸判斷是否算小圖
  const handleImgLoad: React.ReactEventHandler<HTMLImageElement> = (e) => {
    const { naturalWidth: nw, naturalHeight: nh } = e.currentTarget;
    const SMALL_W = 320;
    const SMALL_H = 320;
    setIsSmall(nw < SMALL_W || nh < SMALL_H);
  };

  const btnClass = (variant?: Action<T>["variant"]) => {
    switch (variant) {
      case "primary":
        return "btn btn-primary";
      case "secondary":
        return "btn btn-outline-light";
      case "danger":
        return "btn btn-danger";
      case "link":
        return "btn btn-link";
      default:
        return "btn btn-danger";
    }
  };

  return (
    <div className="lightbox" role="dialog" aria-modal="true">
      <button
        className="lightbox-btn lightbox-prev"
        aria-label="上一張"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
      >
        ‹
      </button>

      <div className="lightbox-img-wrapper" onClick={(e) => e.stopPropagation()}>
        {showBadge && <div className="lightbox-badge">No.{index + 1}</div>}

        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onLoad={handleImgLoad}
          className={`lightbox-img ${isSmall ? "small" : ""}`}
        />

        {/* 底部資訊框 */}
        <div className="lightbox-info overlay" onClick={(e) => e.stopPropagation()}>
          {(item as any).title && (
            <h6 className="lightbox-title mb-2 fw-bold">{(item as any).title as ReactNode}</h6>
          )}

          {Array.isArray(meta) && meta.length > 0 && (
            <ul className="lightbox-meta list-unstyled d-flex flex-wrap gap-2 mb-2">
              {meta.map(({ label, value }, i) => (
                <li key={i} className="lightbox-meta__chip">
                  <span className="lightbox-meta__label">{label}</span>
                  <span className="lightbox-meta__value">{value}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="d-flex justify-content-end gap-2 flex-wrap">
            {actions.map((a, i) =>
              a.href ? (
                <a
                  key={i}
                  className={btnClass(a.variant)}
                  href={a.href}
                  target={a.target ?? "_blank"}
                  rel={a.rel ?? "noreferrer"}
                  onClick={(e) => e.stopPropagation()}
                >
                  {a.label}
                </a>
              ) : (
                <button
                  key={i}
                  className={btnClass(a.variant)}
                  onClick={(e) => {
                    e.stopPropagation();
                    a.onClick?.(item, index);
                  }}
                >
                  {a.label}
                </button>
              )
            )}
            <button
              className="btn btn-outline-light"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              {closeLabel}
            </button>
          </div>
        </div>
      </div>

      <button
        className="lightbox-btn lightbox-next"
        aria-label="下一張"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
      >
        ›
      </button>

      <button
        className="lightbox-close"
        aria-label="關閉"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        ×
      </button>
    </div>
  );
};

export default Lightbox;
