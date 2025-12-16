import React from 'react';
import { AppMode } from '../types';

interface OverlayProps {
  mode: AppMode;
}

export const Overlay: React.FC<OverlayProps> = ({ mode }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {/* Header - 左上角 */}
      <header className="absolute top-8 left-8">
        <div className="bg-black/20 backdrop-blur-md border border-yellow-600/30 p-6 rounded-lg min-w-[240px]">
          <h1 className="text-yellow-500 font-serif text-3xl tracking-wider drop-shadow-lg">
            Stardust for You
          </h1>
          <div className="flex justify-end mt-2">
            <p className="text-emerald-100/90 text-sm tracking-widest font-serif italic">
              -- Hannah
            </p>
          </div>
        </div>
      </header>

      {/* Instructions - 右下角 */}
      <footer className="absolute bottom-8 right-8 opacity-60 hover:opacity-90 transition-opacity">
        <div className="text-yellow-100/80 font-serif text-sm tracking-widest text-right space-y-2">
            <p>CLICK TO TRANSFORM</p>
            <div className="text-xs text-emerald-300/60 font-mono">
                DRAG TO ROTATE • SCROLL TO ZOOM
            </div>
        </div>
      </footer>
    </div>
  );
};