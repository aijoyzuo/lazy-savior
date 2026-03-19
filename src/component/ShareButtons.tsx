
import type { ReactElement } from 'react';
import Swal from "sweetalert2";

type ShareButtonsProps = {
  url?:string;
  title?:string;
}

export default function ShareButtons({ url = window.location.href, title = "快來看看這個內容！" }:ShareButtonsProps):ReactElement  {
  return (
    <div className="text-center">
      <h5>分享這個頁面</h5>
      <div className="d-flex justify-content-center gap-3 mt-2 flex-wrap">
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center share-btn"
          style={{width:'44px',height:'44px'}}
        ><i className="bi bi-facebook fs-5 text-white"></i>
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-info rounded-circle d-flex align-items-center justify-content-center share-btn"
          style={{width:'44px',height:'44px'}}
        >
          <i className="bi bi-twitter fs-5 text-white"></i>
        </a>       
        <button
          className="btn btn-secondary rounded-circle d-flex align-items-center justify-content-center share-btn"
          style={{width:'44px',height:'44px'}}
          onClick={() => {
            navigator.clipboard.writeText(url);
            Swal.fire('連結已複製', '', 'success');
          }}
        >
          <i className="bi bi-clipboard-fill fs-5 text-white"></i>
        </button>
      </div>
    </div>
  );
}
