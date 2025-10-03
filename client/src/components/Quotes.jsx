// src/components/Quotes.jsx
import React, { useMemo } from "react";

function Quotes() {
  // Hardcoded quotes
  const quotes = [
    "It's not how much money you make, but how much money you keep. – Robert Kiyosaki",
    "An investment in knowledge pays the best interest. – Benjamin Franklin",
    "The goal isn’t more money. The goal is living life on your terms. – Chris Brogan",
    "Financial freedom is available to those who learn about it and work for it. – Robert Kiyosaki",
    "You must gain control over your money or the lack of it will forever control you. – Dave Ramsey",
    "The more you learn, the more you earn. – Warren Buffett",
    "Wealth is the ability to fully experience life. – Henry David Thoreau",
    "Spend less than you earn. Invest the surplus. – Morgan Housel",
    "Rich people acquire assets. The poor and middle class acquire liabilities they think are assets. – Robert Kiyosaki",
    "Time is more valuable than money. You can get more money, but you cannot get more time. – Jim Rohn",
    "It’s not your salary that makes you rich, it’s your spending habits. – Charles A. Jaffe",
    "Money is a tool. Used properly it makes something beautiful; used wrong, it makes a mess. – Bradley Vinson"
  ];

  // Pick 3 random quotes
  const randomQuotes = useMemo(() => {
    const shuffled = [...quotes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, []);

  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg border border-purple-100 flex flex-col gap-3 min-h-[280px] md:col-span-2">
      <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-3">
        Todays Quotes 
      </h2>
      {randomQuotes.map((quote, index) => (
        <p
          key={index}
          className="text-gray-800 text-sm italic bg-purple-50 p-3 rounded-lg shadow-sm"
        >
          {quote}
        </p>
      ))}
    </div>
  );
}

export default Quotes;
