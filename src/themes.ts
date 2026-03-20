export const WIDGET_THEMES =[
  { id: 'glass-pro', name: '流体毛玻璃(基础版)', isPro: false },
  { id: 'journal', name: '手账日记', isPro: false },
  { id: 'pixel', name: '复古像素', isPro: false },
  { id: 'polaroid', name: '拍立得', isPro: false },
  { id: 'swiss-grid', name: '瑞士网格', isPro: false },
  { id: 'bento-dark', name: '暗黑便当(Pro)', isPro: true },
  { id: 'neo-brutalist', name: '新粗野主义(Pro)', isPro: true },
  { id: 'claymorphism', name: '黏土拟物(Pro)', isPro: true },
  { id: 'gradient-aura', name: '极光渐变(Pro)', isPro: true },
  { id: 'scrapbook', name: '拼贴剪贴簿(Pro)', isPro: true },
  { id: 'vaporwave', name: '蒸汽波动态(Pro)', isPro: true },
  { id: 'minimalist-mono', name: '极简黑白(Pro)', isPro: true },
  { id: 'organic-texture', name: '有机质感(Pro)', isPro: true },
];

export interface ThemeClasses {
  container: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentBg: string;
  innerBg: string;
  panelBg: string;
  fontFamily: string;
  iconColor: string;
  bgGradient?: string;
  bgDecoration?: string; // For background textures
  extraDecor?: string;   // For extra decorative elements like tape, pins
}

export function getThemeClasses(themeId: string, fluidColor: string, customAccentColor?: string, isImmersive?: boolean): ThemeClasses {
  let classes: ThemeClasses;
  switch (themeId) {
    case 'vaporwave':
      classes = {
        container: 'bg-[#120458] border-2 border-[#ff00ff] shadow-[0_0_20px_rgba(255,0,255,0.5),inset_0_0_20px_rgba(0,255,255,0.3)] rounded-lg relative overflow-hidden',
        innerBg: 'bg-[#2d033b] border border-[#00ffff] rounded-md',
        panelBg: 'bg-[#480032] border border-[#ff00ff] rounded-sm',
        textPrimary: 'text-[#00ffff] font-bold italic tracking-widest drop-shadow-[0_2px_2px_rgba(255,0,255,0.8)]',
        textSecondary: 'text-[#ff00ff] font-medium uppercase',
        accent: 'text-[#ff00ff] drop-shadow-[0_0_10px_rgba(255,0,255,1)]',
        accentBg: 'bg-[#ff00ff]',
        iconColor: 'text-[#00ffff]',
        fontFamily: 'font-sans',
        bgDecoration: 'bg-[linear-gradient(rgba(18,4,88,0.8)_2px,transparent_2px),linear-gradient(90deg,rgba(18,4,88,0.8)_2px,transparent_2px)] bg-[length:40px_40px][background-position:center_center]',
        bgGradient: 'bg-gradient-to-b from-[#ff00ff33] to-[#00ffff33]',
      };
      break;
    case 'minimalist-mono':
      classes = {
        container: 'bg-white border border-black shadow-none rounded-none',
        innerBg: 'bg-white border-b border-black rounded-none',
        panelBg: 'bg-white border border-black rounded-none',
        textPrimary: 'text-black font-light tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl',
        textSecondary: 'text-black/40 font-medium uppercase tracking-[0.2em] text-[10px] sm:text-xs',
        accent: 'text-black font-bold',
        accentBg: 'bg-black',
        iconColor: 'text-black',
        fontFamily: 'font-mono',
        bgDecoration: 'bg-[radial-gradient(#000_1px,transparent_1px)] bg-[length:20px_20px]',
      };
      break;
    case 'organic-texture':
      classes = {
        container: 'bg-[#f4f1ea] border border-[#dcd7cc] shadow-md rounded-2xl sm:rounded-3xl relative overflow-hidden',
        innerBg: 'bg-[#e9e5d8] border border-[#dcd7cc] rounded-2xl',
        panelBg: 'bg-[#dfdbcf] border border-[#dcd7cc] rounded-xl',
        textPrimary: 'text-[#4a4435] font-serif font-semibold text-2xl sm:text-3xl md:text-4xl',
        textSecondary: 'text-[#8b8471] font-serif italic',
        accent: 'text-[#5d6d4f]',
        accentBg: 'bg-[#5d6d4f]',
        iconColor: 'text-[#6d6753]',
        fontFamily: 'font-serif',
        bgDecoration: 'bg-[url("https://www.transparenttextures.com/patterns/natural-paper.png")] opacity-60',
        bgGradient: 'bg-gradient-to-br from-[#5d6d4f11] to-transparent',
      };
      break;
    case 'journal':
      classes = {
        container: 'bg-[#FDFBF7] border border-[#E8E4D9] shadow-[2px_4px_12px_rgba(0,0,0,0.08)] rounded-sm relative overflow-visible',
        innerBg: 'bg-transparent',
        panelBg: 'bg-[#F5F2EB] border border-[#E8E4D9] rounded-sm',
        textPrimary: 'text-[#2C2A25] font-serif tracking-wide',
        textSecondary: 'text-[#7A7565] font-serif text-sm',
        accent: 'text-[#D96C5B]',
        accentBg: 'bg-[#D96C5B]',
        iconColor: 'text-[#5C584F]',
        fontFamily: 'font-["Noto_Serif_SC"]',
        bgDecoration: 'bg-[url("https://www.transparenttextures.com/patterns/cream-paper.png")]',
        extraDecor: 'tape-top-center',
      };
      break;
    case 'pixel':
      classes = {
        container: 'bg-[#000000] border-[4px] border-[#4A4A4A] shadow-[inset_-4px_-4px_0px_0px_rgba(0,0,0,0.5),inset_4px_4px_0px_0px_rgba(255,255,255,0.2)] rounded-none',
        innerBg: 'bg-[#1A1A1A] border-[2px] border-[#333333] rounded-none',
        panelBg: 'bg-[#2A2A2A] border-[2px] border-[#4A4A4A] rounded-none',
        textPrimary: 'text-[#39FF14] font-["Press_Start_2P"] text-xs leading-relaxed',
        textSecondary: 'text-[#AAAAAA] font-["Press_Start_2P"] text-[8px]',
        accent: 'text-[#FF00FF]',
        accentBg: 'bg-[#FF00FF]',
        iconColor: 'text-[#39FF14]',
        fontFamily: 'font-["Press_Start_2P"]',
        bgDecoration: 'bg-[url("https://www.transparenttextures.com/patterns/pixel-weave.png")] opacity-90',
      };
      break;
    case 'polaroid':
      classes = {
        container: 'bg-white border border-gray-200 shadow-[0_10px_20px_rgba(0,0,0,0.15),0_3px_6px_rgba(0,0,0,0.1)] rounded-sm pb-12 pt-4 px-4 relative',
        innerBg: 'bg-gray-100 shadow-inner rounded-sm',
        panelBg: 'bg-white border border-gray-100 rounded-sm',
        textPrimary: 'text-gray-800 font-["Caveat"] text-2xl',
        textSecondary: 'text-gray-600 font-["Caveat"] text-xl',
        accent: 'text-black',
        accentBg: 'bg-black',
        iconColor: 'text-black',
        fontFamily: 'font-["Caveat"]',
        extraDecor: 'photo-clip',
      };
      break;
    case 'bento-dark':
      classes = {
        container: 'bg-[#1C1C1E] border border-white/10 shadow-2xl rounded-[32px]',
        innerBg: 'bg-[#2C2C2E] rounded-[24px]',
        panelBg: 'bg-[#3A3A3C] rounded-[20px]',
        textPrimary: 'text-white font-["Space_Grotesk"] font-medium tracking-tight',
        textSecondary: 'text-[#EBEBF5]/60 font-["Space_Grotesk"]',
        accent: `bg-gradient-to-br ${fluidColor} bg-clip-text text-transparent`,
        accentBg: `bg-gradient-to-br ${fluidColor}`,
        iconColor: 'text-white',
        fontFamily: 'font-["Space_Grotesk"]',
        bgGradient: `bg-gradient-to-br ${fluidColor} opacity-10`,
      };
      break;
    case 'neo-brutalist':
      classes = {
        container: 'bg-[#FFDF00] border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]',
        innerBg: 'bg-white border-[3px] border-black rounded-none',
        panelBg: 'bg-[#FF90E8] border-[3px] border-black rounded-none',
        textPrimary: 'text-black font-black uppercase tracking-tighter text-xl',
        textSecondary: 'text-black font-bold',
        accent: 'text-black',
        accentBg: 'bg-black',
        iconColor: 'text-black',
        fontFamily: 'font-sans',
      };
      break;
    case 'claymorphism':
      classes = {
        container: `bg-[#E0E5EC] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] rounded-[2rem] border border-white/40`,
        innerBg: 'bg-[#E0E5EC] shadow-[inset_6px_6px_10px_0_rgba(163,177,198,0.7),inset_-6px_-6px_10px_0_rgba(255,255,255,0.8)] rounded-2xl',
        panelBg: 'bg-[#E0E5EC] shadow-[6px_6px_10px_0_rgba(163,177,198,0.7),-6px_-6px_10px_0_rgba(255,255,255,0.8)] rounded-xl',
        textPrimary: 'text-[#4D5B76] font-["ZCOOL_KuaiLe"] text-lg',
        textSecondary: 'text-[#7988A3] font-["ZCOOL_KuaiLe"]',
        accent: 'text-[#FF7B93]',
        accentBg: 'bg-[#FF7B93]',
        iconColor: 'text-[#4D5B76]',
        fontFamily: 'font-["ZCOOL_KuaiLe"]',
      };
      break;
    case 'gradient-aura':
      classes = {
        container: `bg-gradient-to-br ${fluidColor} shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] rounded-[2.5rem] border border-white/20 relative overflow-hidden`,
        innerBg: 'bg-white/10 backdrop-blur-2xl shadow-[inset_0_0_20px_rgba(255,255,255,0.2)] rounded-[2rem]',
        panelBg: 'bg-white/20 backdrop-blur-3xl rounded-2xl border border-white/30',
        textPrimary: 'text-white drop-shadow-md font-bold tracking-wide',
        textSecondary: 'text-white/80 font-medium',
        accent: 'text-white',
        accentBg: 'bg-white',
        iconColor: 'text-white',
        fontFamily: 'font-sans',
        bgDecoration: 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent opacity-60',
      };
      break;
    case 'swiss-grid':
      classes = {
        container: 'bg-[#F4F4F4] border border-[#D1D1D1] rounded-none p-6 relative',
        innerBg: 'bg-white border border-[#E5E5E5] rounded-none',
        panelBg: 'bg-[#FAFAFA] border border-[#E5E5E5] rounded-none',
        textPrimary: 'text-[#111111] font-["Space_Grotesk"] font-bold tracking-tight text-2xl',
        textSecondary: 'text-[#666666] font-["Space_Grotesk"] text-sm uppercase tracking-widest',
        accent: 'text-[#FF3300]',
        accentBg: 'bg-[#FF3300]',
        iconColor: 'text-[#111111]',
        fontFamily: 'font-["Space_Grotesk"]',
        bgDecoration: 'bg-[url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMWgydjJIMUMxeiIgZmlsbD0iI0QxRDFEMSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+")]',
      };
      break;
    case 'scrapbook':
      classes = {
        container: 'bg-[#EAE6DF] border-[2px] border-[#D3CCC1] shadow-[4px_6px_15px_rgba(0,0,0,0.1)] rounded-lg relative rotate-1 hover:rotate-0 transition-transform',
        innerBg: 'bg-[#F2EFE9] border border-[#E0DCD3] rounded-md shadow-inner',
        panelBg: 'bg-[#FAF8F5] border border-[#EBE7E0] rounded-sm',
        textPrimary: 'text-[#3E3A35] font-["Playfair_Display"] italic font-bold text-xl',
        textSecondary: 'text-[#8C857B] font-["Caveat"] text-lg',
        accent: 'text-[#4A7C59]',
        accentBg: 'bg-[#4A7C59]',
        iconColor: 'text-[#5C554D]',
        fontFamily: 'font-["Playfair_Display"]',
        bgDecoration: 'bg-[url("https://www.transparenttextures.com/patterns/notebook-dark.png")] opacity-50',
        extraDecor: 'torn-paper-edge',
      };
      break;
    case 'glass-pro':
    default:
      classes = {
        container: 'bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] rounded-[2.5rem]',
        innerBg: 'bg-white/5 backdrop-blur-lg border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] rounded-[2rem]',
        panelBg: 'bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl',
        textPrimary: 'text-white drop-shadow-sm font-medium tracking-wide',
        textSecondary: 'text-white/70',
        accent: 'text-white',
        accentBg: 'bg-white',
        iconColor: 'text-white',
        fontFamily: 'font-sans',
        bgGradient: `bg-gradient-to-br ${fluidColor} opacity-30`,
      };
      break;
  }

  if (isImmersive) {
    // Strip card-like styling for full screen
    classes.container = classes.container
      .replace(/rounded-[^\s]+/g, 'rounded-none')
      .replace(/border-[^\s]+/g, 'border-none')
      .replace(/shadow-[^\s]+/g, 'shadow-none')
      .replace(/rotate-[^\s]+/g, 'rotate-0')
      .replace(/p[xybtl]?-[^\s]+/g, 'p-0') // Strip padding
      .replace(/m[xybtl]?-[^\s]+/g, 'm-0'); // Strip margins
    
    // Ensure it fills the screen and has no rounding
    classes.container += ' w-full h-full rounded-none border-none shadow-none p-0 m-0';
  }

  if (customAccentColor) {
    classes.accent = customAccentColor;
    const accentBgMap: Record<string, string> = {
      'text-blue-400': 'bg-blue-400',
      'text-emerald-400': 'bg-emerald-400',
      'text-rose-400': 'bg-rose-400',
      'text-amber-400': 'bg-amber-400',
      'text-purple-400': 'bg-purple-400',
      'text-black': 'bg-black',
      'text-white': 'bg-white',
    };
    classes.accentBg = accentBgMap[customAccentColor] || 'bg-current';
  }

  return classes;
}
