import React from 'react';
import './assets/all.scss';
import { Routes, Route } from 'react-router-dom';

import HomePage from './HomePage';
import BookQuiz from './BookQuiz';
import MovieQuiz from './MovieQuiz';
import FoodQuiz from './FoodQuiz';
import RecommendMovie from './RecommendMovie';
import RecommendFood from './RecommendFood';
import RecommendBook from './RecommendBook';

const App: React.FC = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quiz/book" element={<BookQuiz />} />
        <Route path="/quiz/movie" element={<MovieQuiz />} />
        <Route path="/quiz/food" element={<FoodQuiz />} />
        <Route path="/quiz/recommendMovie" element={<RecommendMovie />} />
        <Route path="/quiz/recommendFood" element={<RecommendFood />} />
        <Route path="/quiz/recommendBook" element={<RecommendBook />} />
      </Routes>
    </div>
  );
};

export default App;
