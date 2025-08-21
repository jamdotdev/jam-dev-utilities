import React from "react";

export const RecordVideoFeedback = () => {
  return (
    <div className="fixed bottom-5 right-5 z-10 print:hidden">
      <button
        rel="noopener noreferrer"
        aria-label="Record your screen and send video feedback directly with Jam"
        title="Record your screen and send video feedback directly"
        className="flex flex-col shadow-md px-4 pr-6 py-2 rounded-full ring-1 ring-black/10 bg-white items-center"
        onClick={() =>
          window.open(
            "https://jam.dev/s?jam-recording=4UNxcBj",
            "_blank",
            "noopener,noreferrer"
          )
        }
      >
        <span className="flex items-center gap-2">
          <img
            width="32"
            height="32"
            src="https://storage.googleapis.com/jam-assets/jam-logo.webp"
            alt=""
          />

          <span className="flex flex-col items-start">
            <span className="text-sm font-medium text-black">Report a bug</span>
            <span className="text-[11px] text-gray-500">
              by jam.dev/recording-links
            </span>
          </span>
        </span>
      </button>
    </div>
  );
};
