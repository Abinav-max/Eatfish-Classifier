import React from 'react';

export default function FishLogo({ className = "w-8 h-8", color = "#0d9488" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="EatFish Logo"
    >
      <defs>
        <linearGradient id="fishGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f766e" />
          <stop offset="50%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
      {/* Tail fin */}
      <path
        d="M10 22 C14 28, 16 31, 20 32 C16 33, 14 36, 10 42 C12 36, 13 32, 10 22 Z"
        fill="url(#fishGrad)"
      />
      {/* Upper fin */}
      <path
        d="M32 16 C37 13, 44 14, 46 18 C41 18, 36 17, 32 16 Z"
        fill="url(#fishGrad)"
        opacity="0.85"
      />
      {/* Main Fish Body */}
      <path
        d="M18 32 C23 20, 42 17, 54 28 C56 30, 58 32, 58 32 C58 32, 56 34, 54 36 C42 47, 23 44, 18 32 Z"
        fill="url(#fishGrad)"
      />
      {/* Lower fin */}
      <path
        d="M30 46 C34 49, 40 49, 43 45 C38 46, 33 46, 30 46 Z"
        fill="url(#fishGrad)"
        opacity="0.85"
      />
      {/* Gills curve */}
      <path
        d="M44 26 C43 29, 43 35, 44 38"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.75"
      />
      {/* Eye */}
      <circle cx="50" cy="30" r="2.5" fill="#ffffff" />
      <circle cx="50.8" cy="29.6" r="1.1" fill="#042f2e" />
      {/* Subtle scales motif */}
      <path
        d="M34 27 C36 29, 36 33, 34 35"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M27 28 C29 30, 29 33, 27 35"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}
