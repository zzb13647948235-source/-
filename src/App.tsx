import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, Cloud, StickyNote, Music, Play, Pause, 
  Settings, Crown, ChevronLeft, ChevronRight, Check, 
  Sun, RefreshCw, MessageSquare, LayoutGrid, Maximize, 
  Minimize, Plus, X, MonitorPlay, CloudRain, Wind, Disc, 
  CloudLightning, CloudFog, CloudDrizzle, 
  Globe, CalendarDays, Activity, Hourglass, Target, Lock, AlertTriangle, Camera
} from 'lucide-react';
import { getThemeClasses, WIDGET_THEMES } from './themes';

class LocalFirstSyncEngine {
  static get(key: string, defaultVal: any) {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultVal;
    } catch (e) {
      console.error('Storage read error', e);
      return defaultVal;
    }
  }
  static set(key: string, val: any) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      console.debug(`[SyncEngine] Added ${key} to cloud sync queue...`);
    } catch (e) {
      console.error('Storage write error', e);
    }
  }
}

// --- 核心库配置 ---
const WIDGETS =[
  { id: 'w1', title: '数字荧光屏', type: '时间', size: '大号', image: 'https://picsum.photos/seed/clock/300/300', height: 280, defaultColor: 'from-blue-600 to-indigo-900', componentType: 'clock', isPro: false },
  { id: 'w2', title: '机械指针', type: '时间', size: '大号', image: 'https://picsum.photos/seed/classic-clock/300/300', height: 280, defaultColor: 'from-gray-800 to-black', componentType: 'classic_clock', isPro: false },
  { id: 'w8', title: '年度进度条', type: '效率', size: '中号', image: 'https://picsum.photos/seed/progress/300/300', height: 180, defaultColor: 'from-zinc-800 to-zinc-950', componentType: 'year_progress', isPro: false },
  { id: 'w6', title: '极简日历', type: '效率', size: '大号', image: 'https://picsum.photos/seed/calendar/300/300', height: 280, defaultColor: 'from-emerald-500 to-teal-800', componentType: 'calendar', isPro: false },
  { id: 'w7', title: '灵感便签', type: '效率', size: '中号', image: 'https://picsum.photos/seed/stickynote/300/300', height: 180, defaultColor: 'from-yellow-300 to-amber-500', componentType: 'sticky_note', isPro: false },
  { id: 'w11', title: '倒数纪念日', type: '效率', size: '中号', image: 'https://picsum.photos/seed/countdown/300/300', height: 180, defaultColor: 'from-purple-600 to-fuchsia-900', componentType: 'countdown', isPro: false },
  { id: 'w3', title: '番茄心流(严格模式)', type: '专注', size: '大号', image: 'https://picsum.photos/seed/pomodoro/300/300', height: 280, defaultColor: 'from-rose-500 to-red-900', componentType: 'pomodoro', isPro: true },
  { id: 'w4', title: '高保真白噪音', type: '专注', size: '大号', image: 'https://picsum.photos/seed/music/300/300', height: 280, defaultColor: 'from-amber-700 to-orange-900', componentType: 'whitenoise', isPro: true },
  { id: 'w5', title: '全球动态天气', type: '环境', size: '大号', image: 'https://picsum.photos/seed/weather/300/300', height: 280, defaultColor: 'from-cyan-500 to-blue-700', componentType: 'weather', isPro: true },
  { id: 'w9', title: '全球时区', type: '时间', size: '大号', image: 'https://picsum.photos/seed/worldclock/300/300', height: 280, defaultColor: 'from-slate-700 to-slate-900', componentType: 'world_clock', isPro: true },
  { id: 'w10', title: '习惯热力图', type: '效率', size: '大号', image: 'https://picsum.photos/seed/matrix/300/300', height: 280, defaultColor: 'from-emerald-700 to-green-900', componentType: 'habit_matrix', isPro: true },
  { id: 'w12', title: '每日一言', type: '灵感', size: '中号', image: 'https://picsum.photos/seed/quote/300/300', height: 180, defaultColor: 'from-pink-500 to-rose-800', componentType: 'quote', isPro: false },
];

// --- 保持常亮 Hook ---
function useWakeLock(isActive: boolean) {
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        console.warn('Wake Lock error:', err);
      }
    };
    if (isActive) {
      requestWakeLock();
      const handleVisibilityChange = () => { if (document.visibilityState === 'visible') requestWakeLock(); };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        if (wakeLock) wakeLock.release();
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [isActive]);
}

// ==========================================
// 核心：高级主题包装器
// ==========================================
function ThemeWrapper({ theme, children, isImmersive }: { theme: any, children: React.ReactNode, isImmersive: boolean }) {
  const containerClass = isImmersive 
    ? `${theme.container} !w-screen !h-[100dvh] !rounded-none !border-none !shadow-none !m-0 !p-0 flex flex-col items-center justify-center` 
    : theme.container;

  return (
    <div className={`relative overflow-hidden transition-all duration-700 w-full h-full ${containerClass}`}>
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-50 mix-blend-overlay" />
      {theme.bgDecoration && <div className={`absolute inset-0 pointer-events-none z-0 ${theme.bgDecoration}`} />}
      {!isImmersive && theme.extraDecor === 'tape-top-center' && (
        <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-32 h-8 bg-white/40 backdrop-blur-md -rotate-2 shadow-[0_2px_4px_rgba(0,0,0,0.1)] z-50 mix-blend-overlay" />
      )}
      {!isImmersive && theme.extraDecor === 'photo-clip' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-600 shadow-[0_4px_6px_rgba(0,0,0,0.3)] z-50 border border-red-800">
          <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white/80 rounded-full blur-[0.5px]" />
        </div>
      )}
      <div className={`relative z-10 w-full h-full pointer-events-auto ${isImmersive ? 'p-8 md:p-24 flex items-center justify-center' : 'p-6 sm:p-8'}`}>
        {children}
      </div>
    </div>
  );
}

// ==========================================
// 1. 翻页时钟
// ==========================================
function FlipClockView({ theme, isImmersive }: { theme: any, isImmersive: boolean }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  },[]);
  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');
  const actualFontSize = isImmersive ? '28vmin' : '72px';

  return (
    <div className={`w-full h-full flex items-center justify-center ${isImmersive ? 'gap-4 md:gap-12' : 'gap-3 sm:gap-6'}`}>
      <div className={`relative flex-1 h-full max-h-[600px] flex flex-col items-center justify-center overflow-hidden rounded-2xl sm:rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] ${theme.innerBg} border border-white/10`}>
        <div className="absolute top-1/2 left-0 w-full h-[2px] sm:h-[4px] bg-black/60 z-20 shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
        <span className={`${theme.textPrimary} font-bold tracking-tighter ${theme.fontFamily} drop-shadow-2xl`} style={{ fontSize: actualFontSize, lineHeight: 1 }}>{hours}</span>
      </div>
      <div className="flex flex-col items-center justify-center gap-4 sm:gap-8">
        <motion.div animate={{ opacity:[1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }} className={`w-3 h-3 sm:w-6 sm:h-6 rounded-full ${theme.accentBg} shadow-[0_0_20px_currentColor]`} />
        <motion.div animate={{ opacity:[1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }} className={`w-3 h-3 sm:w-6 sm:h-6 rounded-full ${theme.accentBg} shadow-[0_0_20px_currentColor]`} />
      </div>
      <div className={`relative flex-1 h-full max-h-[600px] flex flex-col items-center justify-center overflow-hidden rounded-2xl sm:rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] ${theme.innerBg} border border-white/10`}>
        <div className="absolute top-1/2 left-0 w-full h-[2px] sm:h-[4px] bg-black/60 z-20 shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
        <span className={`${theme.textPrimary} font-bold tracking-tighter ${theme.fontFamily} drop-shadow-2xl`} style={{ fontSize: actualFontSize, lineHeight: 1 }}>{minutes}</span>
      </div>
      {isImmersive && (
        <>
          <div className="hidden md:flex flex-col items-center justify-center gap-8">
            <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className={`w-6 h-6 rounded-full ${theme.accentBg} shadow-[0_0_20px_currentColor]`} />
            <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className={`w-6 h-6 rounded-full ${theme.accentBg} shadow-[0_0_20px_currentColor]`} />
          </div>
          <div className={`hidden md:flex relative flex-1 h-full max-h-[600px] flex-col items-center justify-center overflow-hidden rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] ${theme.innerBg} border border-white/10 opacity-80`}>
            <div className="absolute top-1/2 left-0 w-full h-[4px] bg-black/60 z-20 shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
            <span className={`${theme.textSecondary} font-bold tracking-tighter ${theme.fontFamily} drop-shadow-2xl`} style={{ fontSize: actualFontSize, lineHeight: 1 }}>{seconds}</span>
          </div>
        </>
      )}
    </div>
  );
}

// ==========================================
// 2. 真实机械指针时钟
// ==========================================
function ClassicAnalogClock({ theme, isImmersive }: { theme: any, isImmersive: boolean }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    let animationFrameId: number;
    const updateClock = () => {
      setTime(new Date());
      animationFrameId = requestAnimationFrame(updateClock);
    };
    animationFrameId = requestAnimationFrame(updateClock);
    return () => cancelAnimationFrame(animationFrameId);
  },[]);

  const ms = time.getMilliseconds();
  const seconds = time.getSeconds() + ms / 1000;
  const minutes = time.getMinutes() + seconds / 60;
  const hours = (time.getHours() % 12) + minutes / 60;

  const clockSize = isImmersive ? 'min(70vw, 70vh)' : '100%';

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center gap-8`}>
      <div 
        className={`relative rounded-full shadow-[0_30px_60px_rgba(0,0,0,0.4),inset_0_5px_15px_rgba(255,255,255,0.2)] border-[8px] sm:border-[16px] border-white/10 ${theme.innerBg} backdrop-blur-xl`}
        style={{ width: clockSize, height: clockSize, maxWidth: '600px', maxHeight: '600px', aspectRatio: '1/1' }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="absolute top-0 left-1/2 w-2 h-full -translate-x-1/2 p-2 sm:p-4" style={{ transform: `rotate(${i * 30}deg)` }}>
            <div className={`w-1.5 sm:w-3 h-6 sm:h-12 rounded-full ${i % 3 === 0 ? theme.textPrimary : theme.textSecondary} opacity-80 bg-current`} />
          </div>
        ))}
        <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 text-center`}>
          <span className={`${theme.textPrimary} font-bold tracking-[0.3em] uppercase ${isImmersive ? 'text-2xl' : 'text-xs'} opacity-50`}>DeskSpace</span>
        </div>
        {/* 时针分针秒针使用 transform: translate3d 优化渲染 */}
        <div className="absolute top-1/2 left-1/2 w-[4%] h-[30%] origin-bottom rounded-full z-10" style={{ backgroundColor: 'white', transform: `translate3d(-50%, -100%, 0) rotate(${hours * 30}deg)`, filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.5))' }} />
        <div className="absolute top-1/2 left-1/2 w-[2.5%] h-[42%] origin-bottom rounded-full z-20" style={{ backgroundColor: 'rgba(255,255,255,0.8)', transform: `translate3d(-50%, -100%, 0) rotate(${minutes * 6}deg)`, filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.5))' }} />
        <div className={`absolute top-1/2 left-1/2 w-[1%] h-[55%] origin-[50%_80%] rounded-full z-30 ${theme.accentBg}`} style={{ transform: `translate3d(-50%, -80%, 0) rotate(${seconds * 6}deg)`, filter: 'drop-shadow(0 8px 8px rgba(0,0,0,0.4))' }} />
        <div className="absolute top-1/2 left-1/2 w-4 h-4 sm:w-8 sm:h-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white z-40 shadow-xl border-4 border-gray-900" />
      </div>
      {isImmersive && (
         <span className={`${theme.textSecondary} text-3xl tracking-widest font-medium uppercase mt-8 ${theme.fontFamily}`}>
           {time.toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' })}
         </span>
      )}
    </div>
  );
}

// ==========================================
// 3. 真实发声：黑胶白噪音
// ==========================================
const TRACKS =[
  { name: '夏日雨夜', icon: CloudRain, url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3' },
  { name: '深林微风', icon: Wind, url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_165e3173db.mp3' },
  { name: '炉火噼啪', icon: Disc, url: 'https://cdn.pixabay.com/download/audio/2022/02/22/audio_111b29a2df.mp3' },
];

function VinylPlayerView({ theme, isImmersive, fluidColor }: { theme: any, isImmersive: boolean, fluidColor: string }) {
  const[isPlaying, setIsPlaying] = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    audioRef.current = new Audio(TRACKS[trackIdx].url);
    audioRef.current.loop = true;
    audioRef.current.volume = volume;
    if (isPlaying) {
      audioRef.current.play().catch(e => {
        console.warn("Audio autoplay prevented", e);
        setIsPlaying(false);
        setAudioError(true);
      });
    }
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [trackIdx]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAudioError(false);
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => setAudioError(true));
    }
  };

  const currentTrack = TRACKS[trackIdx];
  const vinylSize = isImmersive ? 'min(60vw, 60vh)' : '160px';

  return (
    <div className={`w-full h-full flex flex-col lg:flex-row items-center justify-center ${isImmersive ? 'gap-24' : 'gap-6'}`}>
      <div className="relative flex items-center justify-center drop-shadow-2xl">
        {audioError && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 rounded-full backdrop-blur-sm cursor-pointer" onClick={togglePlay}>
             <span className="text-white font-bold text-xs bg-red-600 px-3 py-1 rounded-full">点击解除静音</span>
          </div>
        )}
        {isPlaying && (
          <motion.div animate={{ scale:[1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className={`absolute inset-0 rounded-full ${theme.accentBg} blur-3xl -z-10`} />
        )}
        <motion.div 
          animate={{ rotate: isPlaying ? 360 : 0 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="rounded-full bg-[#111] shadow-2xl border-[4px] border-gray-800 flex items-center justify-center relative overflow-hidden"
          style={{ width: vinylSize, height: vinylSize, aspectRatio: '1/1' }}
        >
          <div className="absolute inset-0 rounded-full border border-white/5 m-4" />
          <div className="absolute inset-0 rounded-full border border-white/5 m-8" />
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 transform rotate-45 pointer-events-none" />
          <div className={`w-1/3 h-1/3 rounded-full flex items-center justify-center ${theme.innerBg} shadow-inner border-[4px] border-black relative overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${fluidColor} opacity-80`} />
            <div className="w-4 h-4 rounded-full bg-black z-10 shadow-inner" />
          </div>
        </motion.div>
        <motion.div 
          animate={{ rotate: isPlaying ? 25 : 0 }}
          transition={{ type: "spring", stiffness: 50, damping: 10 }}
          className="absolute -right-8 sm:-right-12 top-0 origin-top w-2 h-[60%] bg-gradient-to-b from-gray-300 to-gray-500 rounded-full shadow-2xl z-20 pointer-events-none"
        >
          <div className="w-8 h-8 rounded-full bg-gray-400 -ml-3 -mt-2 shadow-md border-4 border-gray-600" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-12 bg-gray-800 rounded-sm shadow-xl" />
        </motion.div>
      </div>

      <div className={`flex flex-col items-center lg:items-start z-10 ${isImmersive ? 'max-w-md' : ''}`}>
        <div className="flex items-center gap-3 mb-2 opacity-80">
          <currentTrack.icon className={theme.iconColor} size={isImmersive ? 32 : 16} />
          <span className={`${theme.textSecondary} ${isImmersive ? 'text-2xl' : 'text-xs'} font-bold tracking-widest uppercase`}>高品质无损白噪音</span>
        </div>
        <h3 className={`${theme.textPrimary} ${isImmersive ? 'text-6xl mb-12' : 'text-xl mb-6'} font-black tracking-tight ${theme.fontFamily}`}>
          {currentTrack.name}
        </h3>
        <div className="flex items-center gap-4 sm:gap-6 mb-6">
          <button onClick={(e) => { e.stopPropagation(); setTrackIdx((prev) => (prev + TRACKS.length - 1) % TRACKS.length); }} className={`p-3 sm:p-5 rounded-full ${theme.panelBg} hover:bg-white/10 transition-colors backdrop-blur-md ${theme.textPrimary}`}>
            <ChevronLeft size={isImmersive ? 36 : 20} />
          </button>
          <button onClick={togglePlay} className={`p-5 sm:p-8 rounded-full shadow-2xl hover:scale-105 transition-transform text-white ${theme.accentBg}`}>
            {isPlaying ? <Pause size={isImmersive ? 48 : 24} className="fill-white" /> : <Play size={isImmersive ? 48 : 24} className="fill-white ml-2" />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); setTrackIdx((prev) => (prev + 1) % TRACKS.length); }} className={`p-3 sm:p-5 rounded-full ${theme.panelBg} hover:bg-white/10 transition-colors backdrop-blur-md ${theme.textPrimary}`}>
            <ChevronRight size={isImmersive ? 36 : 20} />
          </button>
        </div>
        
        <div className="flex items-center gap-3 w-full max-w-[200px]" onClick={e => e.stopPropagation()}>
          <span className={`${theme.textSecondary} text-xs`}>音量</span>
          <input 
            type="range" min="0" max="1" step="0.01" value={volume} 
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
          />
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. 番茄心流
// ==========================================
function PomodoroView({ theme, isImmersive, showToast }: { theme: any, isImmersive: boolean, showToast?: (msg: string, type?: 'success' | 'info') => void }) {
  const[timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [strictMode, setStrictMode] = useState(true);
  const endTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      if (!endTimeRef.current) endTimeRef.current = Date.now() + timeLeft * 1000;
      interval = setInterval(() => {
        const remaining = Math.round((endTimeRef.current! - Date.now()) / 1000);
        if (remaining <= 0) {
          setTimeLeft(0);
          setIsActive(false);
          endTimeRef.current = null;
          clearInterval(interval);
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
    } else {
      endTimeRef.current = null;
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]); 

  const toggleTimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (strictMode && isActive && isImmersive) {
      if (showToast) {
        showToast("⚠️ 严格模式已开启！专注期间严禁暂停。请保持心流，直到计时结束。", "info");
      } else {
        alert("⚠️ 严格模式已开启！专注期间严禁暂停。请保持心流，直到计时结束。");
      }
      return;
    }
    setIsActive(!isActive);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 276; 
  const pomodoroSize = isImmersive ? 'min(60vw, 60vh)' : '180px';

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center`}>
      <div 
        className={`relative flex items-center justify-center z-10 cursor-pointer transition-transform hover:scale-[1.02] ${isImmersive ? 'mb-16' : 'mb-6'}`}
        onClick={toggleTimer}
        style={{ width: pomodoroSize, height: pomodoroSize }}
      >
        {isActive && <motion.div animate={{ scale: [1, 1.15, 1], opacity:[0.2, 0.5, 0.2] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className={`absolute inset-0 rounded-full ${theme.accentBg} blur-3xl -z-10`} />}
        <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-2xl" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="44" fill="none" stroke="currentColor" strokeWidth="3" className={`${theme.textSecondary} opacity-20`} />
          <circle cx="48" cy="48" r="44" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="276" strokeDashoffset={276 - progress} className={`${theme.accent} transition-all duration-1000 ease-linear drop-shadow-md`} strokeLinecap="round" />
        </svg>
        <div className="flex flex-col items-center">
          <span className={`${theme.textPrimary} ${isImmersive ? 'text-[15vmin]' : 'text-5xl'} font-black tracking-tighter leading-none ${theme.fontFamily}`}>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
          {isImmersive && <span className={`${theme.textSecondary} text-2xl font-bold tracking-widest mt-4 uppercase`}>Focus Time</span>}
        </div>
      </div>
      <div className="flex flex-col items-center gap-4 z-10">
        <motion.div 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-3 ${isActive ? 'text-white' : theme.textPrimary} transition-all cursor-pointer px-8 py-4 rounded-full ${isActive ? 'bg-red-500 shadow-lg' : theme.innerBg + ' border border-white/10'}`}
          onClick={toggleTimer}
        >
          {isActive ? <Pause size={isImmersive ? 28 : 20} className="fill-current" /> : <Play size={isImmersive ? 28 : 20} className="fill-current ml-1" />}
          <span className={`${isImmersive ? 'text-2xl' : 'text-sm'} font-bold tracking-widest uppercase`}>{isActive ? '专注中' : '进入心流'}</span>
        </motion.div>
        {isImmersive && (
          <label className="flex items-center gap-2 cursor-pointer text-white/50 hover:text-white transition-colors mt-4">
            <input type="checkbox" checked={strictMode} onChange={(e) => setStrictMode(e.target.checked)} className="accent-red-500 w-4 h-4" />
            <span className="text-xs font-bold tracking-widest uppercase">启用严格模式(禁止中途暂停)</span>
          </label>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 5. 真实天气
// ==========================================
function AeroGlassWeatherView({ theme, isImmersive, content, onContentChange }: { theme: any, isImmersive: boolean, content?: string, onContentChange?: (val: string) => void }) {
  const [weather, setWeather] = useState<{ temp: number, code: number, city: string }>({ temp: 22, code: 0, city: content || 'SHANGHAI' });
  const [loading, setLoading] = useState(true);

  const parseWeather = (code: number) => {
    if (code === 0) return { icon: Sun, desc: 'CLEAR SKY' };
    if (code >= 1 && code <= 3) return { icon: Cloud, desc: 'PARTLY CLOUDY' };
    if (code >= 45 && code <= 48) return { icon: CloudFog, desc: 'FOGGY' };
    if (code >= 51 && code <= 67) return { icon: CloudDrizzle, desc: 'DRIZZLE/RAIN' };
    if (code >= 80 && code <= 82) return { icon: CloudRain, desc: 'HEAVY RAIN' };
    if (code >= 95) return { icon: CloudLightning, desc: 'THUNDERSTORM' };
    return { icon: Cloud, desc: 'CLOUDY' };
  };

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number, cityName: string) => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await res.json();
        setWeather(prev => ({ ...prev, temp: Math.round(data.current_weather.temperature), code: data.current_weather.weathercode, city: cityName }));
      } catch (err) {
        console.error('Weather API Error', err);
      } finally {
        setLoading(false);
      }
    };

    const geocodeAndFetch = async (cityName: string) => {
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const { latitude, longitude, name } = data.results[0];
          fetchWeather(latitude, longitude, name.toUpperCase());
        } else {
          fetchWeather(31.23, 121.47, cityName); // Fallback to Shanghai
        }
      } catch (err) {
        console.error('Geocoding Error', err);
        fetchWeather(31.23, 121.47, cityName);
      }
    };

    if ('geolocation' in navigator && !content) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude, 'MY CITY'),
        () => fetchWeather(31.23, 121.47, 'SHANGHAI')
      );
    } else {
      geocodeAndFetch(content || weather.city);
    }
  }, [content]);

  const WeatherIcon = parseWeather(weather.code).icon;

  return (
    <div className={`w-full h-full flex flex-col ${isImmersive ? 'justify-center max-w-5xl mx-auto' : ''}`}>
      <div className={`flex flex-col md:flex-row gap-6 ${isImmersive ? 'h-[60%] mb-10' : 'h-[55%] mb-4'}`}>
        <div className={`relative flex-[1.5] p-8 md:p-12 flex flex-col justify-between z-30 rounded-[32px] shadow-2xl ${theme.innerBg} border border-white/10 overflow-hidden`}>
           {!loading && (
             <motion.div animate={{ y:[0, -15, 0], x: [0, 10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-8 right-8 md:top-12 md:right-12 opacity-80">
               <WeatherIcon size={isImmersive ? 180 : 80} className={`${theme.accent} drop-shadow-[0_20px_20px_rgba(0,0,0,0.3)]`} strokeWidth={1} />
             </motion.div>
           )}
           <div className="relative z-10">
             <span className={`${theme.textPrimary} ${isImmersive ? 'text-3xl' : 'text-sm'} tracking-wider uppercase font-bold ${theme.fontFamily} bg-white/20 px-4 py-2 rounded-full backdrop-blur-md`}>
               {loading ? 'LOADING...' : parseWeather(weather.code).desc}
             </span>
             <div className="flex items-start leading-none mt-6">
               <span className={`${theme.textPrimary} font-thin tracking-tighter ${theme.fontFamily}`} style={{ fontSize: isImmersive ? '18vmin' : '72px' }}>{loading ? '--' : weather.temp}</span>
               <span className={`${theme.textSecondary} font-light ${theme.fontFamily}`} style={{ fontSize: isImmersive ? '8vmin' : '36px', marginTop: isImmersive ? '2vmin' : '10px' }}>°C</span>
             </div>
           </div>
        </div>
        <div className={`relative flex-1 p-8 flex flex-col items-end justify-center z-20 rounded-[32px] shadow-xl ${theme.panelBg} border border-white/10 backdrop-blur-xl`}>
           <span className={`${theme.textSecondary} ${isImmersive ? 'text-xl' : 'text-[10px]'} tracking-widest uppercase mb-2 ${theme.fontFamily}`}>CURRENT LOCATION</span>
           <input 
             type="text" 
             value={weather.city} 
             onChange={(e) => setWeather(prev => ({ ...prev, city: e.target.value }))}
             onBlur={() => onContentChange && onContentChange(weather.city)}
             onKeyDown={(e) => {
               if (e.key === 'Enter') {
                 e.currentTarget.blur();
               }
             }}
             onClick={(e) => e.stopPropagation()}
             className={`bg-transparent text-right focus:outline-none border-b border-dashed border-white/20 focus:border-white/60 ${theme.textPrimary} ${isImmersive ? 'text-6xl' : 'text-2xl'} font-bold tracking-tight mb-6 w-full ${theme.fontFamily}`}
           />
           <div className={`px-4 py-2 rounded-xl bg-green-500/20 text-green-400 font-bold ${isImmersive ? 'text-xl' : 'text-xs'} border border-green-500/30`}>DATA LIVE SYNC</div>
        </div>
      </div>
      <div className={`relative flex-1 p-6 md:p-8 flex flex-col justify-between z-10 rounded-[32px] shadow-lg ${theme.innerBg} border border-white/10 backdrop-blur-md`}>
        <div className="flex items-center justify-between px-2 h-full">
          {[
            { day: 'MON', icon: Cloud, t: weather.temp + 1 },
            { day: 'TUE', icon: Sun, t: weather.temp + 3 },
            { day: 'WED', icon: Cloud, t: weather.temp - 2 },
            { day: 'THU', icon: CloudRain, t: weather.temp - 1 },
            { day: 'FRI', icon: Sun, t: weather.temp + 2 },
          ].map((f, i) => (
            <div key={i} className={`flex flex-col items-center justify-center gap-4 h-full flex-1 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer`}>
              <span className={`${theme.textSecondary} ${isImmersive ? 'text-2xl' : 'text-[10px]'} font-bold uppercase tracking-wider`}>{f.day}</span>
              <f.icon size={isImmersive ? 48 : 20} className={`${theme.accent} opacity-70 drop-shadow-md`} />
              <span className={`${theme.textPrimary} ${isImmersive ? 'text-4xl' : 'text-sm'} font-bold ${theme.fontFamily}`}>{loading ? '--' : f.t}°</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. 真实算法日历
// ==========================================
function CalendarView({ theme, isImmersive }: { theme: any, isImmersive: boolean }) {
  const now = new Date();
  const dayStr = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const monthStr = now.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
  const todayNum = now.getDate();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks = Array.from({ length: firstDay }, () => null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const calendarSlots =[...blanks, ...days];

  return (
    <div className={`w-full h-full flex flex-col p-6 sm:p-12`}>
      <div className={`flex justify-between items-end mb-8 z-10`}>
        <span className={`${isImmersive ? 'text-[8vmin]' : 'text-4xl'} font-black tracking-tighter ${theme.textPrimary}`}>{dayStr}</span>
        <span className={`${isImmersive ? 'text-[4vmin]' : 'text-xl'} font-bold tracking-widest ${theme.textPrimary}`}>{monthStr}</span>
      </div>
      <div className={`grid grid-cols-7 gap-y-4 text-center z-10 flex-1 items-center`}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={i} className={`${isImmersive ? 'text-3xl' : 'text-xs'} font-black ${theme.textSecondary}`}>{d}</span>
        ))}
        {calendarSlots.map((d, i) => (
          <div key={i} className={`flex justify-center items-center`}>
            {d === todayNum ? (
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className={`${isImmersive ? 'w-20 h-20 text-4xl' : 'w-8 h-8 text-sm'} bg-white text-black font-black rounded-full shadow-[0_0_20px_rgba(255,255,255,0.6)] flex items-center justify-center`}>
                {d}
              </motion.div>
            ) : (
              <span className={`${isImmersive ? 'text-3xl' : 'text-sm'} font-medium ${theme.textPrimary} opacity-80`}>{d || ''}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Stay hungry, stay foolish.", author: "Stewart Brand" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "What we fear doing most is usually what we most need to do.", author: "Tim Ferriss" }
];

function QuoteView({ theme, isImmersive }: { theme: any, isImmersive: boolean }) {
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  return (
    <div className={`w-full h-full flex flex-col justify-center p-6 sm:p-10`}>
      <MessageSquare size={isImmersive ? 48 : 24} className={`${theme.accent} mb-4 opacity-50`} />
      <p className={`${theme.textPrimary} ${isImmersive ? 'text-5xl leading-tight' : 'text-xl leading-snug'} font-bold mb-4 ${theme.fontFamily}`}>"{quote.text}"</p>
      <p className={`${theme.textSecondary} ${isImmersive ? 'text-2xl' : 'text-xs'} font-medium uppercase tracking-widest`}>— {quote.author}</p>
    </div>
  );
}

// ==========================================
// 动态渲染分配器
// ==========================================
function StickyNoteView({ theme, isImmersive, content, onContentChange }: { theme: any, isImmersive: boolean, content?: string, onContentChange?: (val: string) => void }) {
  const [text, setText] = useState(content || "保持专注，活在当下。\n\nType your goals here...");
  const handleBlur = () => { if (onContentChange) onContentChange(text); };

  return (
    <div className={`w-full h-full flex flex-col`}>
      <div className={`flex justify-between items-start mb-4 z-10`}>
        <div className={`px-4 py-2 rounded-full ${theme.innerBg} font-bold ${theme.textPrimary} flex items-center gap-2 shadow-md border border-white/5`}>
          <StickyNote size={isImmersive ? 28 : 16} className={theme.accent} />
          {isImmersive ? '桌面灵感空间' : '桌面灵感'}
        </div>
      </div>
      <div className={`flex-1 flex flex-col justify-center ${theme.innerBg} p-6 sm:p-10 rounded-[32px] shadow-2xl z-10 border border-white/10 relative overflow-hidden group transition-all hover:shadow-white/5`}>
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-transparent via-black/10 to-black/30 rounded-bl-[32px] z-20 pointer-events-none" />
        <textarea 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          onBlur={handleBlur} 
          onClick={(e) => e.stopPropagation()}
          className={`w-full h-full bg-transparent resize-none focus:outline-none ${theme.textPrimary} ${isImmersive ? 'text-[4vmin]' : 'text-lg'} leading-relaxed font-bold ${theme.fontFamily} custom-scrollbar placeholder:opacity-30`}
          placeholder="写下你的灵感..."
        />
        <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold tracking-widest uppercase text-white/20">Click to Edit</div>
      </div>
    </div>
  );
}

function YearProgressView({ theme, isImmersive }: { theme: any, isImmersive: boolean }) {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear() + 1, 0, 1);
  const percent = ((now.getTime() - start.getTime()) / (end.getTime() - start.getTime()) * 100).toFixed(1);
  const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className={`w-full h-full flex flex-col justify-center`}>
      <div className="flex items-center gap-3 mb-6 z-10">
        <Hourglass size={isImmersive ? 48 : 24} className={theme.accent} />
        <span className={`${theme.textPrimary} ${isImmersive ? 'text-4xl' : 'text-xl'} font-bold tracking-tight`}>{now.getFullYear()} 年度进度</span>
      </div>
      
      <div className="relative w-full h-8 sm:h-12 bg-black/20 rounded-full overflow-hidden shadow-inner mb-4 z-10 border border-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`absolute top-0 left-0 h-full ${theme.accentBg} shadow-[0_0_20px_currentColor]`}
        />
        <div className={`absolute inset-0 flex items-center justify-end px-4 ${theme.textPrimary} font-bold ${isImmersive ? 'text-2xl' : 'text-sm'} mix-blend-difference`}>
          {percent}%
        </div>
      </div>
      
      <div className="flex justify-between items-center z-10 opacity-80">
        <span className={`${theme.textSecondary} ${isImmersive ? 'text-xl' : 'text-xs'} font-medium uppercase tracking-widest`}>Time is slipping away</span>
        <span className={`${theme.textPrimary} ${isImmersive ? 'text-2xl' : 'text-sm'} font-bold`}>还剩 <span className={theme.accent}>{daysLeft}</span> 天</span>
      </div>
    </div>
  );
}

function WorldClockView({ theme, isImmersive }: { theme: any, isImmersive: boolean }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer); },[]);
  
  const getCityTime = (tz: string) => time.toLocaleTimeString('en-US', { timeZone: tz, hour12: false, hour: '2-digit', minute: '2-digit' });
  const cities =[
    { name: 'LOCAL', tz: Intl.DateTimeFormat().resolvedOptions().timeZone, icon: Target },
    { name: 'NEW YORK', tz: 'America/New_York', icon: Globe },
    { name: 'LONDON', tz: 'Europe/London', icon: Globe },
    { name: 'TOKYO', tz: 'Asia/Tokyo', icon: Globe },
  ];

  return (
    <div className={`w-full h-full flex flex-col justify-center`}>
      <div className="flex items-center justify-between mb-8 z-10 border-b border-white/10 pb-4">
        <span className={`${theme.textPrimary} ${isImmersive ? 'text-4xl' : 'text-xl'} font-bold tracking-tight flex items-center gap-3`}><Globe size={isImmersive?40:24} className={theme.accent}/> GLOBAL HUB</span>
        <span className={`${theme.textSecondary} ${isImmersive ? 'text-2xl' : 'text-xs'} font-bold uppercase tracking-widest`}>Synched</span>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 z-10 h-full">
        {cities.map((city, i) => (
          <div key={i} className={`flex flex-col justify-center ${theme.innerBg} p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/5`}>
            <span className={`${theme.textSecondary} ${isImmersive ? 'text-xl' : 'text-[10px]'} font-bold uppercase tracking-widest mb-1 sm:mb-2 flex items-center gap-1.5`}>
              <city.icon size={isImmersive?20:12} className="opacity-50" /> {city.name}
            </span>
            <span className={`${i===0 ? theme.accent : theme.textPrimary} ${isImmersive ? 'text-[8vmin]' : 'text-3xl'} font-black tracking-tighter font-mono`}>{getCityTime(city.tz)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HabitMatrixView({ theme, isImmersive }: { theme: any, isImmersive: boolean }) {
  const [matrix, setMatrix] = useState<Record<string, boolean>>(() => {
    return LocalFirstSyncEngine.get('habit_matrix_data', {});
  });

  const toggleHabit = (dateKey: string) => {
    const newMatrix = { ...matrix, [dateKey]: !matrix[dateKey] };
    setMatrix(newMatrix);
    LocalFirstSyncEngine.set('habit_matrix_data', newMatrix);
  };

  const calculateStreak = () => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (matrix[key]) streak++;
      else if (i > 0) break; 
    }
    return streak;
  };

  const cols = isImmersive ? 24 : 14;
  const rows = 7;
  const totalDays = cols * rows;
  const today = new Date();
  
  const days = Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (totalDays - 1 - i));
    return d.toISOString().split('T')[0];
  });

  return (
    <div className={`w-full h-full flex flex-col justify-center`}>
      <div className="flex justify-between items-end mb-6 z-10">
        <div>
          <span className={`${theme.textPrimary} ${isImmersive ? 'text-4xl' : 'text-xl'} font-bold tracking-tight block mb-1 flex items-center gap-2`}><Activity size={isImmersive?36:20} className={theme.accent} /> 活跃矩阵</span>
          <span className={`${theme.textSecondary} ${isImmersive ? 'text-xl' : 'text-[10px]'} font-bold uppercase tracking-widest`}>Last {totalDays} Days</span>
        </div>
        <div className={`px-4 py-1.5 rounded-full ${theme.innerBg} border border-white/10 ${theme.textPrimary} font-bold ${isImmersive ? 'text-xl' : 'text-xs'}`}>
          Streak: <span className={theme.accent}>{calculateStreak()} Days</span>
        </div>
      </div>
      
      <div className={`flex-1 flex gap-1 sm:gap-2 z-10 ${theme.innerBg} p-4 sm:p-6 rounded-3xl border border-white/5`}>
        <div className={`grid grid-rows-7 grid-flow-col gap-1 sm:gap-1.5 w-full h-full`}>
          {days.map((dateKey, i) => {
            const isDone = matrix[dateKey];
            const isToday = dateKey === today.toISOString().split('T')[0];
            return (
              <motion.div 
                key={i} 
                whileHover={{ scale: 1.2, zIndex: 20 }}
                onClick={() => toggleHabit(dateKey)}
                className={`w-full h-full rounded-sm sm:rounded-md cursor-pointer transition-all ${isDone ? theme.accentBg : 'bg-white/10'} ${isToday ? 'ring-2 ring-white/40' : ''} shadow-sm`}
                title={dateKey}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CountdownView({ theme, isImmersive, content, onContentChange }: { theme: any, isImmersive: boolean, content?: string, onContentChange?: (val: string) => void }) {
  const [data, setData] = useState(() => {
    try {
      return content ? JSON.parse(content) : { name: "2027 新年", date: "2027-01-01" };
    } catch (e) {
      return { name: content || "2027 新年", date: "2027-01-01" };
    }
  });

  const [days, setDays] = useState(0);

  useEffect(() => {
    const target = new Date(data.date);
    const diff = target.getTime() - new Date().getTime();
    setDays(Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))));
  }, [data.date]);

  const updateData = (updates: any) => {
    const newData = { ...data, ...updates };
    setData(newData);
    if (onContentChange) onContentChange(JSON.stringify(newData));
  };

  return (
    <div className={`w-full h-full flex flex-col justify-center items-center text-center`}>
      <div className="z-10 mb-2 sm:mb-4">
        <CalendarDays size={isImmersive ? 48 : 24} className={`${theme.accent} mb-2 sm:mb-4 mx-auto opacity-80`} />
        <span className={`${theme.textSecondary} ${isImmersive ? 'text-2xl' : 'text-xs'} font-bold uppercase tracking-widest`}>距离</span>
      </div>
      
      <div className="flex flex-col gap-2 mb-4 z-10 w-full items-center">
        <input 
          type="text" value={data.name} 
          onChange={(e) => updateData({ name: e.target.value })}
          onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
          onClick={(e) => e.stopPropagation()}
          className={`bg-transparent text-center focus:outline-none border-b border-dashed border-white/20 focus:border-white/60 ${theme.textPrimary} ${isImmersive ? 'text-5xl' : 'text-2xl'} font-bold w-[80%]`}
        />
        <input 
          type="date" value={data.date} 
          onChange={(e) => updateData({ date: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          className={`bg-transparent text-center focus:outline-none text-white/40 text-xs font-bold uppercase tracking-widest cursor-pointer hover:text-white/60 transition-colors`}
        />
      </div>

      <div className="flex items-baseline gap-2 z-10">
        <span className={`${theme.accent} ${isImmersive ? 'text-[20vmin]' : 'text-6xl'} font-black tracking-tighter leading-none`}>{days}</span>
        <span className={`${theme.textSecondary} ${isImmersive ? 'text-4xl' : 'text-lg'} font-bold`}>Days</span>
      </div>
    </div>
  );
}

function WidgetRenderer({ widget, onUpdateData, isImmersive = false, showToast }: { widget: any, onUpdateData?: (id: string, data: any) => void, isImmersive?: boolean, showToast?: (msg: string, type?: 'success' | 'info') => void }) {
  const theme = getThemeClasses(widget.themeId || 'glass-pro', widget.defaultColor, widget.customAccent, isImmersive);

  const renderContent = () => {
    switch (widget.componentType) {
      case 'clock': return <FlipClockView theme={theme} isImmersive={isImmersive} />;
      case 'classic_clock': return <ClassicAnalogClock theme={theme} isImmersive={isImmersive} />;
      case 'whitenoise': return <VinylPlayerView theme={theme} isImmersive={isImmersive} fluidColor={widget.defaultColor} />;
      case 'pomodoro': return <PomodoroView theme={theme} isImmersive={isImmersive} showToast={showToast} />;
      case 'weather': return <AeroGlassWeatherView theme={theme} isImmersive={isImmersive} content={widget.content} onContentChange={(val) => onUpdateData && onUpdateData(widget.id, { content: val })} />;
      case 'calendar': return <CalendarView theme={theme} isImmersive={isImmersive} />;
      case 'year_progress': return <YearProgressView theme={theme} isImmersive={isImmersive} />;
      case 'world_clock': return <WorldClockView theme={theme} isImmersive={isImmersive} />;
      case 'habit_matrix': return <HabitMatrixView theme={theme} isImmersive={isImmersive} />;
      case 'countdown': return <CountdownView theme={theme} isImmersive={isImmersive} content={widget.content} onContentChange={(val) => onUpdateData && onUpdateData(widget.id, { content: val })} />;
      case 'quote': return <QuoteView theme={theme} isImmersive={isImmersive} />;
      case 'sticky_note': return (
        <StickyNoteView 
          theme={theme} 
          isImmersive={isImmersive} 
          content={widget.content} 
          onContentChange={(val) => onUpdateData && onUpdateData(widget.id, { content: val })} 
        />
      );
      default: return <div className="text-white">Widget Not Found</div>;
    }
  };

  return (
    <ThemeWrapper theme={theme} isImmersive={isImmersive}>
      {renderContent()}
    </ThemeWrapper>
  );
}

// ==========================================
// 沉浸专注模式视图
// ==========================================
function ImmersiveFocusView({ widget, onClose, onUpdateData, settings, showToast }: { widget: any, onClose: () => void, onUpdateData: any, settings: any, showToast: any }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const[showControls, setShowControls] = useState(false);
  useWakeLock(settings?.keepScreenOn ?? true);

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  },[]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showControls) {
      timer = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timer);
  },[showControls]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.6, ease:[0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden cursor-default"
      onClick={() => setShowControls(true)}
      onMouseMove={() => setShowControls(true)}
    >
      <div className="w-screen h-[100dvh]">
        <WidgetRenderer widget={widget} isImmersive={true} onUpdateData={onUpdateData} showToast={showToast} />
      </div>

      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-12 opacity-100 flex items-center gap-8 px-10 py-5 rounded-full bg-black/80 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 pointer-events-auto"
          >
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-white/70 hover:text-white flex flex-col items-center gap-2 transition-colors">
              <X size={24} />
              <span className="text-[10px] font-bold tracking-widest uppercase">退出沉浸</span>
            </button>
            <div className="w-[1px] h-8 bg-white/20" />
            <button onClick={toggleFullscreen} className="text-white/70 hover:text-white flex flex-col items-center gap-2 transition-colors">
              {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
              <span className="text-[10px] font-bold tracking-widest uppercase">{isFullscreen ? '退出全屏' : '全屏显示'}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ==========================================
// 主应用入口
// ==========================================
export default function App() {
  const[currentView, setCurrentView] = useState('library'); 
  const[showUpgrade, setShowUpgrade] = useState(false);
  const[immersiveWidget, setImmersiveWidget] = useState<any | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'info' } | null>(null);
  const [isProUser, setIsProUser] = useState(LocalFirstSyncEngine.get('isProUser', false));
  const [settings, setSettings] = useState(() => LocalFirstSyncEngine.get('deskspace_settings', { keepScreenOn: true }));
  
  useEffect(() => {
    LocalFirstSyncEngine.set('deskspace_settings', settings);
  }, [settings]);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [myWidgets, setMyWidgets] = useState<any[]>(() => {
    return LocalFirstSyncEngine.get('myDeskWidgets_v3', WIDGETS.slice(0, 4));
  });

  useEffect(() => {
    LocalFirstSyncEngine.set('myDeskWidgets_v3', myWidgets);
  }, [myWidgets]);

  const handleAddWidget = (widget: any) => {
    if (widget.isPro && !isProUser) {
      setShowUpgrade(true);
      return;
    }

    // 允许某些组件重复添加，某些组件唯一
    const uniqueTypes = ['pomodoro', 'weather', 'calendar', 'year_progress', 'habit_matrix'];
    const isUnique = uniqueTypes.includes(widget.componentType);
    const isAlreadyAdded = isUnique && myWidgets.some(w => w.componentType === widget.componentType);
    
    if (isAlreadyAdded) {
      showToast(`${widget.title} 已经在桌面上了`, 'info');
      return;
    }
    
    const newId = `${widget.id}-${Date.now()}`;
    setMyWidgets(prev => [...prev, { ...widget, id: newId }]);
    showToast(`已成功添加 ${widget.title}`);
    setCurrentView('library');
  };

  const handleUpdateWidgetData = (id: string, newData: any) => {
    setMyWidgets(prev => prev.map(w => w.id === id ? { ...w, ...newData } : w));
  };

  const removeWidget = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setMyWidgets(prev => prev.filter(w => w.id !== id));
  };

  return (
    <div className={`w-screen h-[100dvh] overflow-hidden font-sans transition-colors duration-500 bg-[#050505] text-white flex flex-col md:flex-row`}>
      
      {/* 侧边栏 */}
      <nav className={`
        flex md:flex-col items-center justify-between md:justify-start gap-4 z-40
        p-4 md:p-6 border-white/5 bg-[#0a0a0c]/80 backdrop-blur-2xl
        border-t md:border-t-0 md:border-r w-full md:w-28 h-auto md:h-full order-last md:order-first
      `}>
        <div className="hidden md:flex flex-col items-center mb-10 mt-6">
          <MonitorPlay size={36} className="text-blue-500 mb-3" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50">DeskSpace</span>
        </div>

        <div className="flex md:flex-col items-center gap-4 w-full md:w-auto justify-around md:justify-start">
          <button onClick={() => setCurrentView('library')} className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all ${currentView === 'library' ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
            <LayoutGrid size={24} className="mb-1.5" />
            <span className="text-[10px] font-bold tracking-widest">我的桌面</span>
          </button>
          <button onClick={() => setCurrentView('explore')} className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all ${currentView === 'explore' ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
            <Plus size={24} className="mb-1.5" />
            <span className="text-[10px] font-bold tracking-widest">添加组件</span>
          </button>
          <button onClick={() => setCurrentView('settings')} className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all ${currentView === 'settings' ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
            <Settings size={24} className="mb-1.5" />
            <span className="text-[10px] font-bold tracking-widest">首选项</span>
          </button>
        </div>

        <div className="hidden md:flex mt-auto mb-4">
          {!isProUser && (
            <button onClick={() => setShowUpgrade(true)} className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:scale-110 transition-transform">
              <Crown size={28} />
            </button>
          )}
        </div>
      </nav>

      {/* 主界面 */}
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative p-6 md:p-16 custom-scrollbar">
        {currentView === 'library' && (
          <div className="max-w-[1600px] mx-auto">
            <header className="flex items-center justify-between mb-12">
              <div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">我的专注桌面</h1>
                <p className="text-white/50 text-sm md:text-base font-medium">点击组件进入全屏沉浸模式，双击便签可编辑</p>
              </div>
              {!isProUser && (
                <button onClick={() => setShowUpgrade(true)} className="md:hidden w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg">
                  <Crown size={20} />
                </button>
              )}
            </header>

            {myWidgets.length === 0 ? (
              <div className="py-32 flex flex-col items-center justify-center text-center border border-dashed border-white/10 rounded-[40px] bg-white/5">
                <MonitorPlay size={64} className="text-white/20 mb-6" />
                <p className="text-lg mb-8 text-white/60">你的桌面空空如也，快去添加专注工具吧</p>
                <button onClick={() => setCurrentView('explore')} className="px-8 py-4 bg-white text-black font-bold rounded-full shadow-xl hover:scale-105 transition-transform">
                  浏览小组件库
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 md:gap-10">
                {myWidgets.map((widget, index) => (
                  <motion.div 
                    key={widget.id} 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                    className="group relative flex flex-col"
                  >
                    <div 
                      onClick={() => {
                        if (widget.isPro && !isProUser) {
                          setShowUpgrade(true);
                          return;
                        }
                        setImmersiveWidget(widget);
                      }}
                      className="w-full aspect-[4/3] rounded-[32px] overflow-hidden shadow-2xl relative cursor-pointer border border-white/5 bg-[#111]"
                    >
                      <div className="absolute inset-0 pointer-events-none transform scale-[0.5] origin-top-left w-[200%] h-[200%]">
                        <WidgetRenderer widget={widget} onUpdateData={handleUpdateWidgetData} showToast={showToast} />
                      </div>
                      
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center backdrop-blur-0 group-hover:backdrop-blur-sm z-50">
                        <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 bg-white/20 backdrop-blur-xl px-6 py-3 rounded-full border border-white/30 text-white font-bold shadow-2xl pointer-events-none">
                          <Maximize size={18} /> 进入全屏
                          {(widget.isPro && !isProUser) && <span className="text-[10px] bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider shadow-lg ml-1">Pro</span>}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 px-2 flex justify-between items-start">
                      <div className="flex flex-col gap-3 w-full">
                        <div className="flex justify-between items-center pr-4">
                          <span className="font-bold text-lg tracking-wide flex items-center gap-2">
                            {widget.title}
                            {widget.isPro && (
                              <span className="text-[10px] bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider shadow-lg">Pro</span>
                            )}
                          </span>
                          <select 
                            value={widget.themeId || 'glass-pro'} 
                            onChange={(e) => {
                              const selectedTheme = WIDGET_THEMES.find(t => t.id === e.target.value);
                              if (selectedTheme?.isPro && !isProUser) {
                                setShowUpgrade(true);
                                return;
                              }
                              handleUpdateWidgetData(widget.id, { themeId: e.target.value });
                            }}
                            className="bg-white/10 text-xs font-bold text-white border border-white/20 rounded-lg px-2 py-1.5 focus:outline-none hover:bg-white/20 transition-colors cursor-pointer"
                          >
                            {WIDGET_THEMES.map(t => (
                              <option key={t.id} value={t.id} className="bg-zinc-900">
                                {t.name} {t.isPro ? '(Pro)' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <button onClick={(e) => removeWidget(e, widget.id)} className="p-2 text-white/40 hover:text-red-500 transition-all bg-white/5 rounded-full" title="移除">
                        <X size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'explore' && (
          <div className="max-w-[1600px] mx-auto">
            <header className="mb-12 flex justify-between items-end">
              <div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">顶级组件库</h1>
                <p className="text-white/50 text-sm md:text-base font-medium">挑选属于你的桌面数字艺术品</p>
              </div>
              <button onClick={() => setCurrentView('library')} className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full font-bold transition-all">返回桌面</button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {WIDGETS.map(widget => {
                const uniqueTypes = ['pomodoro', 'weather', 'calendar', 'year_progress', 'habit_matrix'];
                const isUnique = uniqueTypes.includes(widget.componentType);
                const isAdded = isUnique && myWidgets.some(w => w.componentType === widget.componentType);
                
                return (
                  <motion.div key={widget.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative rounded-[40px] p-2 bg-[#111] border border-white/10 hover:border-white/20 transition-colors flex flex-col shadow-2xl overflow-hidden group">
                    <div className="w-full aspect-video rounded-[32px] overflow-hidden relative mb-6 bg-black/20">
                      <div className="absolute inset-0 pointer-events-none transform scale-[0.5] origin-top-left w-[200%] h-[200%]">
                        <WidgetRenderer widget={widget} showToast={showToast} />
                      </div>
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                    </div>
                    <div className="px-6 pb-6 flex items-center justify-between mt-auto">
                      <div>
                        <span className="font-bold block text-xl mb-1 flex items-center gap-2">
                          {widget.title}
                          {widget.isPro && (
                            <span className="text-[10px] bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider shadow-lg">Pro</span>
                          )}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white/30 bg-white/5 px-2 py-1 rounded-md">{widget.type}</span>
                          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white/30 bg-white/5 px-2 py-1 rounded-md">{widget.size}</span>
                        </div>
                      </div>
                      <button 
                        disabled={isAdded}
                        onClick={() => handleAddWidget(widget)}
                        className={`px-6 py-3 font-black rounded-full shadow-2xl transition-all flex items-center gap-2 uppercase tracking-widest text-[10px] ${isAdded ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-105 active:scale-95'}`}
                      >
                        {isAdded ? <Check size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={3} />}
                        {isAdded ? '已在桌面' : '立即添加'}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {currentView === 'settings' && (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-12">首选项</h1>
            
            <div className="relative overflow-hidden rounded-[40px] bg-[#111] p-8 md:p-12 mb-12 border border-white/10 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-900/40 pointer-events-none" />
              <div className="relative z-10 md:w-2/3">
                <div className="flex items-center gap-2 mb-6">
                  <Crown className="text-amber-400" size={28} />
                  <span className="text-amber-400 font-bold tracking-[0.2em] uppercase text-sm">DeskSpace Pro</span>
                </div>
                {isProUser ? (
                  <>
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight">尊贵的 Pro 用户<br/>感谢您的支持</h2>
                    <p className="text-white/60 font-medium mb-6">您已解锁全部高级组件、沉浸模式与专属白噪音。</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight">解锁全屏流体光影与<br/>专属白噪音专注空间</h2>
                    <button onClick={() => setShowUpgrade(true)} className="mt-4 px-8 py-4 bg-white text-black font-bold rounded-full text-sm shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform">
                      查看特权
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[32px] p-2 border bg-[#111] border-white/10 shadow-xl">
                <div className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-white/40">关于沉浸模式</div>
                <div 
                  onClick={() => setSettings((s: any) => ({ ...s, keepScreenOn: !s.keepScreenOn }))}
                  className="flex items-center justify-between py-5 px-6 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div>
                    <span className="font-bold text-lg block mb-1">自动保持屏幕常亮</span>
                    <span className="text-xs text-white/50">进入沉浸模式后阻止设备自动息屏 (需浏览器支持)</span>
                  </div>
                  <div className={`w-14 h-8 rounded-full relative shadow-inner transition-colors ${settings.keepScreenOn ? 'bg-blue-600' : 'bg-white/20'}`}>
                    <motion.div 
                      animate={{ x: settings.keepScreenOn ? 24 : 4 }} 
                      className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm" 
                    />
                  </div>
                </div>
              </div>
              <div className="rounded-[32px] p-2 border bg-[#111] border-white/10 shadow-xl">
                <div className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-white/40">数据管理</div>
                <button onClick={() => { if (confirm('清空所有组件？')) { localStorage.removeItem('myDeskWidgets_v3'); window.location.reload(); } }} className="w-full flex items-center justify-between py-5 px-6 rounded-2xl hover:bg-red-500/10 transition-colors text-red-400 group">
                  <span className="font-bold text-lg block mb-1">重置桌面设置</span>
                  <RefreshCw size={24} className="group-hover:rotate-180 transition-transform duration-500" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 沉浸专注模式 Modal */}
      <AnimatePresence>
        {immersiveWidget && (
          <ImmersiveFocusView widget={immersiveWidget} onClose={() => setImmersiveWidget(null)} onUpdateData={handleUpdateWidgetData} settings={settings} showToast={showToast} />
        )}
      </AnimatePresence>

      {/* Pro 升级弹窗 */}
      <AnimatePresence>
        {showUpgrade && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4" onClick={() => setShowUpgrade(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-lg rounded-[48px] p-10 md:p-14 shadow-2xl bg-[#111] border border-white/10 text-white relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-amber-500/20 to-transparent pointer-events-none" />
              <div className="text-center mb-12 relative z-10">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-600 rounded-[32px] mx-auto flex items-center justify-center text-white shadow-[0_20px_40px_rgba(245,158,11,0.4)] mb-8 transform rotate-6"><Crown size={48} /></div>
                <h2 className="text-4xl font-black tracking-tighter mb-4">解锁 DeskSpace Pro</h2>
                <p className="text-white/50 font-medium">升级 Pro，打造你的完美桌面美学空间</p>
              </div>
              <div className="space-y-6 mb-12 relative z-10">
                {['解锁全部高级组件 (番茄钟、天气、习惯追踪等)', '解锁绝美「流体光影」全屏沉浸模式', '无限畅享高品质白噪音与环境音库', 'OLED 防烧屏保护 & 永久屏幕常亮'].map((feature, i) => (
                  <div key={i} className="flex items-center gap-5 text-lg font-bold text-white/90">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0"><Check size={18} strokeWidth={3} /></div>{feature}
                  </div>
                ))}
              </div>
              <div className="flex gap-4 relative z-10">
                <button onClick={() => { setIsProUser(true); LocalFirstSyncEngine.set('isProUser', true); setShowUpgrade(false); showToast('已成功升级至 Pro 版！'); }} className="flex-1 py-5 font-black rounded-[24px] shadow-[0_20px_40px_rgba(255,255,255,0.1)] transition-all bg-white/10 text-white hover:bg-white/20 text-lg border border-white/20">￥18 / 月</button>
                <button onClick={() => { setIsProUser(true); LocalFirstSyncEngine.set('isProUser', true); setShowUpgrade(false); showToast('已成功升级至 Pro 版！'); }} className="flex-[1.5] py-5 font-black rounded-[24px] shadow-[0_20px_40px_rgba(245,158,11,0.4)] transition-all bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:scale-105 text-xl">￥168 / 永久买断</button>
              </div>
              <button onClick={() => setShowUpgrade(false)} className="w-full py-4 mt-6 text-sm font-bold tracking-widest uppercase transition-colors text-white/30 hover:text-white relative z-10">暂不考虑</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[300] px-6 py-3 rounded-full bg-white text-black font-bold shadow-2xl flex items-center gap-3">
            {toast.type === 'success' ? <Check size={18} className="text-emerald-500" /> : <Plus size={18} className="text-blue-500 rotate-45" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 8px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.1); border-radius: 20px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(255,255,255,0.2); }`}</style>
    </div>
  );
}
