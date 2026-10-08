"use client";

import React, { useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

interface PhoneFrameProps {
  children: React.ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  const [fullscreenPreview, setFullscreenPreview] = useState(false);

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center sm:p-6 bg-[#eef1f5] transition-colors">
      {/* Frame Toggle for Desktop Viewers */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-[430px] mb-3 px-2">
        <span className="text-xs font-semibold text-[#7a8291] tracking-wide flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          ELDROPLUS LEADS PWA
        </span>
        <button
          onClick={() => setFullscreenPreview((prev) => !prev)}
          className="text-xs text-[#525a68] hover:text-[#172033] bg-white/80 hover:bg-white px-2.5 py-1 rounded-full border border-[#e1e4ea] flex items-center gap-1 shadow-xs transition"
          title={fullscreenPreview ? "Switch to Phone Frame" : "Switch to Fullscreen"}
        >
          {fullscreenPreview ? (
            <>
              <Minimize2 className="w-3.5 h-3.5" /> Phone Frame
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5" /> Full Width
            </>
          )}
        </button>
      </div>

      {/* Main Container: Mobile is 100% full screen, Desktop is Phone Mockup */}
      <div
        className={`w-full bg-[#f7f8fa] overflow-hidden relative transition-all duration-300 ${
          fullscreenPreview
            ? "sm:max-w-xl sm:h-[90vh] sm:rounded-3xl sm:border-[4px] sm:border-[#171a21] sm:shadow-2xl"
            : "sm:w-[390px] sm:h-[844px] sm:border-[8px] sm:border-[#171a21] sm:rounded-[44px] sm:shadow-[0_25px_70px_rgba(0,0,0,0.18)]"
        } h-[100dvh] max-w-full`}
      >
        {/* iPhone / Modern Phone Notch (Hidden on Mobile) */}
        {!fullscreenPreview && (
          <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[24px] bg-[#171a21] rounded-b-[16px] z-50 pointer-events-none">
            <div className="absolute top-[6px] right-[24px] w-2.5 h-2.5 rounded-full bg-[#0a0a0a]" />
            <div className="absolute top-[8px] left-[32px] w-12 h-1 rounded-full bg-[#20242e]" />
          </div>
        )}

        {/* Inner App Container with proper height constraint */}
        <div className="h-full w-full flex flex-col overflow-hidden relative">
          {children}
        </div>
      </div>
    </div>
  );
}
