import React from "react";
import { Link } from "react-router-dom";
import "./NotFoundPage.css";

export const NotFoundPage = () => (
  <div className="notfound-container">
    <div className="notfound-bg">
      <div className="notfound-moon"></div>
      <div className="notfound-stars">
        {Array.from({ length: 32 }).map((_, i) => (
          <div
            className="notfound-star"
            key={i}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      <div className="notfound-404">
        <span>4</span>
        <span className="notfound-zero">0</span>
        <span>4</span>
      </div>
      <div className="notfound-text">
        <h1>Страница не найдена</h1>
        <p>Похоже, вы заблудились в монастырских стенах...</p>
        <Link to="/" className="notfound-link">Вернуться на главную</Link>
      </div>
    </div>
  </div>
);
