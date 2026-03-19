import React from 'react';
import { PulseLoader } from 'react-spinners';

// 定義 props 型別
interface LoadingOverlayProps {
  /** 是否顯示載入畫面 */
  show?: boolean;
  /** 顯示文字 */
  text?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  show = false,
  text = '載入中...',
}) => {
  if (!show) return null;

  return (
    <div className="loading-overlay">
      <PulseLoader size={15} color="#6e340d" />
      <p>{text}</p>
    </div>
  );
};

export default LoadingOverlay;
