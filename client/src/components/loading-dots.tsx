import React from "react";

export function LoadingDots() {
  return (
    <div className="loading-dots flex space-x-2">
      <div className="w-3 h-3 bg-primary rounded-full animate-[bounce_1.4s_infinite_ease-in-out_-0.32s]"></div>
      <div className="w-3 h-3 bg-primary rounded-full animate-[bounce_1.4s_infinite_ease-in-out_-0.16s]"></div>
      <div className="w-3 h-3 bg-primary rounded-full animate-[bounce_1.4s_infinite]"></div>
    </div>
  );
}
