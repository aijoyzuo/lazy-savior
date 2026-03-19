// types.d.ts 或直接放在各檔上方
export interface QuizRule {
  id: string | number;
  type?: "range" | "radio" | "checkbox" | string;
  value?: any;
}

export interface Book {
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
  score: number;           // 你計算後會加上
  answer?: QuizRule[];     // 如果每本書也有比對規則
}

export interface Movie {
  id: string | number;
  image: string;
  title: string;
  rating?: string;
  language?: string;
  genre?: string;
  score: number;
  answer?: QuizRule[];
}

export interface Food {
  id: string | number;
  image: string;
  title: string;
  score: number;
  rating?: string;
  preference?: string;
  answer?: QuizRule[];
}
