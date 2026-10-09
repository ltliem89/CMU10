/**
 * Vibrant STEM Design System Tokens for CMU Grade 11 JetBot Studio
 * Theme: Colorful EdTech - Interactive Science Lab
 */

export interface StemColorToken {
  name: string;
  hex: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
  badgeBg: string;
  gradientClass: string;
}

export const STEM_PALETTE = {
  // 1. Core STEM Colors
  electricBlue: {
    hex: '#2563EB',
    name: 'Xanh điện tử',
    meaning: 'Màu nhận diện chính, thanh điều hướng & liên kết',
    text: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-600',
    bgLight: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-300 dark:border-blue-700',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    gradient: 'from-blue-600 to-indigo-600'
  },
  neonPurple: {
    hex: '#8B5CF6',
    name: 'Tím neon',
    meaning: 'AI, thuật toán & các chức năng thông minh',
    text: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-600',
    bgLight: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-300 dark:border-purple-700',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    gradient: 'from-purple-600 to-violet-700'
  },
  hotPink: {
    hex: '#EC4899',
    name: 'Hồng rực',
    meaning: 'Điểm nhấn & hoạt động sáng tạo',
    text: 'text-pink-600 dark:text-pink-400',
    bg: 'bg-pink-600',
    bgLight: 'bg-pink-50 dark:bg-pink-950/40',
    border: 'border-pink-300 dark:border-pink-700',
    badge: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300 border-pink-200 dark:border-pink-800',
    gradient: 'from-pink-600 to-rose-600'
  },
  energyOrange: {
    hex: '#F97316',
    name: 'Cam năng lượng',
    meaning: 'Hành động, thử nghiệm & cảnh báo',
    text: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-600',
    bgLight: 'bg-orange-50 dark:bg-orange-950/40',
    border: 'border-orange-300 dark:border-orange-700',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    gradient: 'from-orange-500 to-amber-600'
  },
  vibrantYellow: {
    hex: '#FACC15',
    name: 'Vàng tươi',
    meaning: 'Khám phá, ý tưởng & thông tin nổi bật',
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500',
    bgLight: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-300 dark:border-amber-700',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    gradient: 'from-amber-400 to-orange-500'
  },
  tealData: {
    hex: '#14B8A6',
    name: 'Xanh ngọc',
    meaning: 'Dữ liệu, cảm biến & kết quả tích cực',
    text: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-600',
    bgLight: 'bg-teal-50 dark:bg-teal-950/40',
    border: 'border-teal-300 dark:border-teal-700',
    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    gradient: 'from-teal-500 to-cyan-600'
  },
  activeGreen: {
    hex: '#22C55E',
    name: 'Xanh lá',
    meaning: 'Trạng thái hoàn thành & an toàn',
    text: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-600',
    bgLight: 'bg-green-50 dark:bg-green-950/40',
    border: 'border-green-300 dark:border-green-700',
    badge: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800',
    gradient: 'from-green-500 to-emerald-600'
  }
};

/**
 * Signature color identity for each of the 12 JetBot Notebook Modules
 * Matched strictly to the IDs in modulesData.ts
 */
export interface ModuleTheme {
  primaryHex: string;
  nameVi: string;
  colorName: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  bannerGradient: string;
  cardHighlight: string;
  iconBg: string;
  iconColor: string;
  badgeClass: string;
}

export const MODULE_THEMES: Record<string, ModuleTheme> = {
  // Module 1: teleoperation.ipynb
  teleoperation: {
    primaryHex: '#2563EB',
    nameVi: 'Điều Khiển Từ Xa Bằng Gamepad',
    colorName: 'Xanh điện tử',
    accentBg: 'bg-blue-50 dark:bg-blue-950/50',
    accentText: 'text-blue-700 dark:text-blue-300',
    accentBorder: 'border-blue-300 dark:border-blue-700',
    bannerGradient: 'from-blue-600 via-indigo-700 to-purple-900',
    cardHighlight: 'hover:border-blue-400 hover:shadow-blue-500/20',
    iconBg: 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300',
    iconColor: 'text-blue-600 dark:text-blue-400',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border-blue-200 dark:border-blue-800'
  },

  // Module 2: data_collection.ipynb
  data_collection: {
    primaryHex: '#EAB308',
    nameVi: 'Thu Thập Dữ Liệu Bám Đường (Click Chuột)',
    colorName: 'Vàng tươi',
    accentBg: 'bg-yellow-50 dark:bg-yellow-950/50',
    accentText: 'text-yellow-800 dark:text-yellow-300',
    accentBorder: 'border-yellow-300 dark:border-yellow-700',
    bannerGradient: 'from-amber-500 via-orange-600 to-purple-900',
    cardHighlight: 'hover:border-yellow-400 hover:shadow-yellow-500/20',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/60 text-yellow-800 dark:text-yellow-300',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    badgeClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800'
  },

  // Module 3: data_collection_gamepad.ipynb
  data_collection_gamepad: {
    primaryHex: '#14B8A6',
    nameVi: 'Thu Thập Bám Đường Bằng Gamepad',
    colorName: 'Xanh ngọc',
    accentBg: 'bg-teal-50 dark:bg-teal-950/50',
    accentText: 'text-teal-700 dark:text-teal-300',
    accentBorder: 'border-teal-300 dark:border-teal-700',
    bannerGradient: 'from-teal-600 via-cyan-700 to-indigo-900',
    cardHighlight: 'hover:border-teal-400 hover:shadow-teal-500/20',
    iconBg: 'bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300',
    iconColor: 'text-teal-600 dark:text-teal-400',
    badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200 border-teal-200 dark:border-teal-800'
  },

  // Module 4: train_model.ipynb
  train_model: {
    primaryHex: '#8B5CF6',
    nameVi: 'Huấn Luyện Hồi Quy Bám Đường',
    colorName: 'Tím neon',
    accentBg: 'bg-purple-50 dark:bg-purple-950/50',
    accentText: 'text-purple-700 dark:text-purple-300',
    accentBorder: 'border-purple-300 dark:border-purple-700',
    bannerGradient: 'from-purple-600 via-violet-800 to-indigo-950',
    cardHighlight: 'hover:border-purple-400 hover:shadow-purple-500/20',
    iconBg: 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300',
    iconColor: 'text-purple-600 dark:text-purple-400',
    badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 border-purple-200 dark:border-purple-800'
  },

  // Module 5: train_model_plot.ipynb
  train_model_plot: {
    primaryHex: '#F97316',
    nameVi: 'AlexNet Tránh Cản & Đồ Thị Bokeh',
    colorName: 'Cam năng lượng',
    accentBg: 'bg-orange-50 dark:bg-orange-950/50',
    accentText: 'text-orange-700 dark:text-orange-300',
    accentBorder: 'border-orange-300 dark:border-orange-700',
    bannerGradient: 'from-orange-500 via-pink-600 to-purple-900',
    cardHighlight: 'hover:border-orange-400 hover:shadow-orange-500/20',
    iconBg: 'bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300',
    iconColor: 'text-orange-600 dark:text-orange-400',
    badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200 border-orange-200 dark:border-orange-800'
  },

  // Module 6: train_model_resnet18.ipynb
  train_model_resnet18: {
    primaryHex: '#7C3AED',
    nameVi: 'ResNet18 Tránh Cản',
    colorName: 'Tím neon đậm',
    accentBg: 'bg-violet-50 dark:bg-violet-950/50',
    accentText: 'text-violet-700 dark:text-violet-300',
    accentBorder: 'border-violet-300 dark:border-violet-700',
    bannerGradient: 'from-violet-600 via-purple-700 to-slate-900',
    cardHighlight: 'hover:border-violet-400 hover:shadow-violet-500/20',
    iconBg: 'bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300',
    iconColor: 'text-violet-600 dark:text-violet-400',
    badgeClass: 'bg-violet-100 text-violet-800 dark:bg-violet-900/60 dark:text-violet-200 border-violet-200 dark:border-violet-800'
  },

  // Module 7: live_demo.ipynb
  live_demo: {
    primaryHex: '#2563EB',
    nameVi: 'Demo Bám Đường PyTorch',
    colorName: 'Xanh điện tử',
    accentBg: 'bg-blue-50 dark:bg-blue-950/50',
    accentText: 'text-blue-700 dark:text-blue-300',
    accentBorder: 'border-blue-300 dark:border-blue-700',
    bannerGradient: 'from-blue-600 via-cyan-600 to-slate-900',
    cardHighlight: 'hover:border-blue-400 hover:shadow-blue-500/20',
    iconBg: 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300',
    iconColor: 'text-blue-600 dark:text-blue-400',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border-blue-200 dark:border-blue-800'
  },

  // Module 8: live_demo_build_trt.ipynb
  live_demo_build_trt: {
    primaryHex: '#EA580C',
    nameVi: 'Biên Dịch TRT Bám Đường',
    colorName: 'Cam năng lượng',
    accentBg: 'bg-orange-50 dark:bg-orange-950/50',
    accentText: 'text-orange-800 dark:text-orange-300',
    accentBorder: 'border-orange-300 dark:border-orange-700',
    bannerGradient: 'from-amber-600 via-orange-600 to-purple-900',
    cardHighlight: 'hover:border-orange-400 hover:shadow-orange-500/20',
    iconBg: 'bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-300',
    iconColor: 'text-orange-600 dark:text-orange-400',
    badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200 border-orange-200 dark:border-orange-800'
  },

  // Module 9: live_demo_trt.ipynb
  live_demo_trt: {
    primaryHex: '#0D9488',
    nameVi: 'Demo Bám Đường TensorRT (~45 FPS)',
    colorName: 'Xanh ngọc',
    accentBg: 'bg-teal-50 dark:bg-teal-950/50',
    accentText: 'text-teal-700 dark:text-teal-300',
    accentBorder: 'border-teal-300 dark:border-teal-700',
    bannerGradient: 'from-teal-600 via-emerald-600 to-indigo-950',
    cardHighlight: 'hover:border-teal-400 hover:shadow-teal-500/20',
    iconBg: 'bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300',
    iconColor: 'text-teal-600 dark:text-teal-400',
    badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200 border-teal-200 dark:border-teal-800'
  },

  // Module 10: live_demo_resnet18.ipynb
  live_demo_resnet18: {
    primaryHex: '#EC4899',
    nameVi: 'Demo Tránh Va Chạm PyTorch',
    colorName: 'Hồng rực',
    accentBg: 'bg-pink-50 dark:bg-pink-950/50',
    accentText: 'text-pink-700 dark:text-pink-300',
    accentBorder: 'border-pink-300 dark:border-pink-700',
    bannerGradient: 'from-pink-600 via-rose-700 to-purple-950',
    cardHighlight: 'hover:border-pink-400 hover:shadow-pink-500/20',
    iconBg: 'bg-pink-100 dark:bg-pink-900/60 text-pink-700 dark:text-pink-300',
    iconColor: 'text-pink-600 dark:text-pink-400',
    badgeClass: 'bg-pink-100 text-pink-800 dark:bg-pink-900/60 dark:text-pink-200 border-pink-200 dark:border-pink-800'
  },

  // Module 11: live_demo_resnet18_build_trt.ipynb
  live_demo_resnet18_build_trt: {
    primaryHex: '#F97316',
    nameVi: 'Biên Dịch TRT Tránh Va Chạm',
    colorName: 'Cam năng lượng',
    accentBg: 'bg-orange-50 dark:bg-orange-950/50',
    accentText: 'text-orange-800 dark:text-orange-300',
    accentBorder: 'border-orange-300 dark:border-orange-700',
    bannerGradient: 'from-orange-600 via-amber-700 to-slate-900',
    cardHighlight: 'hover:border-orange-400 hover:shadow-orange-500/20',
    iconBg: 'bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-300',
    iconColor: 'text-orange-600 dark:text-orange-400',
    badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200 border-orange-200 dark:border-orange-800'
  },

  // Module 12: live_demo_resnet18_trt.ipynb
  live_demo_resnet18_trt: {
    primaryHex: '#22C55E',
    nameVi: 'Demo Tránh Va Chạm TensorRT',
    colorName: 'Xanh lá',
    accentBg: 'bg-green-50 dark:bg-green-950/50',
    accentText: 'text-green-700 dark:text-green-300',
    accentBorder: 'border-green-300 dark:border-green-700',
    bannerGradient: 'from-green-600 via-teal-700 to-slate-900',
    cardHighlight: 'hover:border-green-400 hover:shadow-green-500/20',
    iconBg: 'bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-300',
    iconColor: 'text-green-600 dark:text-green-400',
    badgeClass: 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200 border-green-200 dark:border-green-800'
  }
};

export function getModuleTheme(moduleId: string): ModuleTheme {
  return MODULE_THEMES[moduleId] || MODULE_THEMES['teleoperation'];
}
