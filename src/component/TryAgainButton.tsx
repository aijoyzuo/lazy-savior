import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import type { ReactElement } from 'react';

type TryAgainButtonProps = {
  text?: string;
  textColor?: string;
  buttonColor?: string;
  swalBackground?: string;
  swalClass?: {
    confirmButton?: string;
    cancelButton?: string;
    actions?: string;
  };
  redirectPath?: string;
};

export default function TryAgainButton({
  text = "再懶一次",
  textColor = "text-white",
  buttonColor = "#f6da85",
  swalBackground = "#fffbe6",
  swalClass = {
    confirmButton: "btn btn-warning mx-2",
    cancelButton: "btn btn-outline-warning bg-white mx-2",
    actions: "swal2-button-group-gap",
  },
  redirectPath = "/",
}: TryAgainButtonProps): ReactElement {
  const navigate = useNavigate();

  const handleClick = () => {
    Swal.fire({
      title: "確定要回到轉盤頁？",
      text: "這會清除目前的推薦結果",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "確定",
      cancelButtonText: "取消",
      customClass: swalClass,
      background: swalBackground,
      buttonsStyling: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(redirectPath);
      }
    });
  };

  return (
    <button
      className={`btn w-100 text-center mt-4 fs-6 fw-bold share-btn ${textColor}`}
      style={{ backgroundColor: buttonColor }}
      onClick={handleClick}
    >
      {text}
    </button>
  );
}
