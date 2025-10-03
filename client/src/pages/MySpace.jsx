// src/pages/MySpace.jsx
import React from "react";
import UploadStatement from "../components/UploadStatement";
import SpeakWithStatement from "../components/SpeakWithStatement";
import WeeklySummariser from "../components/WeeklySummariser";
import MonthlySummariser from "../components/MonthlySummariser";

function MySpace() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] pt-24 px-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">
        MySpace - Finance Dashboard
      </h1>

      {/* Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Upload widget */}
        <div className="min-h-[280px]">
          <UploadStatement />
        </div>

        {/* Chat window */}
        <div className="min-h-[320px] md:col-span-2">
          <SpeakWithStatement />
        </div>

        {/* Weekly summary */}
        <div className="min-h-[280px]">
          <WeeklySummariser />
        </div>

        {/* Monthly summary */}
        <div className="min-h-[280px]">
          <MonthlySummariser />
        </div>
      </div>
    </div>
  );
}

export default MySpace;

