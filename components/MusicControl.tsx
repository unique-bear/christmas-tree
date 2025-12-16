import React, { useState, useRef, useEffect } from 'react';

interface MusicControlProps {
  audioSrc: string;
}

export const MusicControl: React.FC<MusicControlProps> = ({ audioSrc }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 创建音频元素
    const audio = new Audio(audioSrc);
    audio.loop = true;
    audio.volume = 0.3; // 默认音量 30%
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audioSrc]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error('Failed to play audio:', err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed top-8 right-8 z-50 flex items-center gap-3">
      {/* 音量控制按钮 */}
      <button
        onClick={toggleMute}
        className="group relative w-10 h-10 rounded-full bg-gradient-to-br from-emerald-900/80 to-emerald-950/80 backdrop-blur-sm border border-amber-400/30 hover:border-amber-400/60 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-amber-400/20"
        title={isMuted ? '取消静音' : '静音'}
      >
        <span className="text-amber-400 text-lg">
          {isMuted ? '🔇' : '🔊'}
        </span>
      </button>

      {/* 播放/暂停按钮 */}
      <button
        onClick={togglePlay}
        className="group relative w-12 h-12 rounded-full bg-gradient-to-br from-emerald-900/80 to-emerald-950/80 backdrop-blur-sm border border-amber-400/30 hover:border-amber-400/60 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-amber-400/20"
        title={isPlaying ? '暂停音乐' : '播放音乐'}
      >
        {/* 播放/暂停图标 */}
        <div className="relative w-5 h-5 flex items-center justify-center">
          {isPlaying ? (
            // 暂停图标
            <div className="flex gap-1">
              <div className="w-1.5 h-5 bg-amber-400 rounded-sm"></div>
              <div className="w-1.5 h-5 bg-amber-400 rounded-sm"></div>
            </div>
          ) : (
            // 播放图标
            <div className="w-0 h-0 border-l-[10px] border-l-amber-400 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
          )}
        </div>

        {/* 音波动画效果 */}
        {isPlaying && (
          <div className="absolute inset-0 rounded-full">
            <div className="absolute inset-0 rounded-full border-2 border-amber-400/30 animate-ping"></div>
          </div>
        )}
      </button>

      {/* 提示文字 */}
      <div className="text-amber-400/80 text-sm font-serif hidden md:block">
        {isPlaying ? '🎵 播放中' : '🎵 已暂停'}
      </div>
    </div>
  );
};
