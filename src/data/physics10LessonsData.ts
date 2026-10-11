export interface Physics10Lesson {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  badgeColor: string; // circle number color
  objectives: string[];
  currentTask: string;
  formula: string;
  initialSpeed: number; // m/s
  description: string;
}

export const PHYSICS_10_LESSONS: Physics10Lesson[] = [
  {
    id: 'uniform-linear',
    order: 1,
    title: 'Chuyển động thẳng đều',
    subtitle: 'Vận tốc không đổi',
    badgeColor: '#1677FF', // Blue
    objectives: [
      'Quan sát chuyển động thẳng đều của xe robot.',
      'Đo và tính vận tốc từ dữ liệu mô phỏng.',
      'So sánh kết quả với lý thuyết (s = v * t).',
      'Rèn kỹ năng phân tích đồ thị vận tốc v-t.'
    ],
    currentTask: 'Cho robot chạy với vận tốc 0.82 m/s trong 10 giây, ghi nhận quãng đường và vẽ đồ thị v-t.',
    formula: 'v = \\text{const}, \\quad s = v \\cdot t',
    initialSpeed: 0.82,
    description: 'Chuyển động có quỹ đạo là đường thẳng và có tốc độ trung bình như nhau trên mọi quãng đường.'
  },
  {
    id: 'accelerated-linear',
    order: 2,
    title: 'Chuyển động thẳng biến đổi đều',
    subtitle: 'Gia tốc không đổi',
    badgeColor: '#FFB020', // Orange/Amber
    objectives: [
      'Khảo sát gia tốc a của robot khi tăng ga.',
      'Vẽ đồ thị vận tốc v theo thời gian t (đường thẳng dốc).',
      'Xác định quãng đường đi được từ diện tích dưới đồ thị v-t.',
      'Kiểm chứng công thức độc lập thời gian v² - v₀² = 2as.'
    ],
    currentTask: 'Tăng tốc độ động cơ từ 0 lên 0.8 m/s, đo thời gian tăng tốc để tính gia tốc a = Δv/Δt.',
    formula: 'v = v_0 + a \\cdot t, \\quad s = v_0 t + \\frac{1}{2} a t^2',
    initialSpeed: 0.50,
    description: 'Chuyển động có gia tốc không đổi theo thời gian (nhanh dần đều hoặc chậm dần đều).'
  },
  {
    id: 'newton-laws',
    order: 3,
    title: 'Định luật Newton',
    subtitle: 'Quán tính và lực',
    badgeColor: '#F0182D', // Red
    objectives: [
      'Khảo sát quán tính của xe khi phanh khẩn cấp (E-STOP).',
      'Mối liên hệ giữa lực kéo F của động cơ, khối lượng m và gia tốc a.',
      'Xác định hệ số ma sát lăn giữa bánh cao su và mặt đường sa bàn.',
      'Vận dụng định luật II Newton F = m*a để tính lực cản.'
    ],
    currentTask: 'Cho xe đạt tốc độ tối đa rồi kích hoạt E-STOP, đo quãng đường phanh để xác định lực cản ma sát.',
    formula: '\\vec{F}_{k} + \\vec{F}_{ms} = m \\cdot \\vec{a}',
    initialSpeed: 0.80,
    description: 'Gia tốc của một vật cùng hướng với lực tác dụng và tỉ lệ thuận với độ lớn của lực.'
  },
  {
    id: 'circular-motion',
    order: 4,
    title: 'Chuyển động tròn',
    subtitle: 'Lực hướng tâm',
    badgeColor: '#009E66', // Teal/Green
    objectives: [
      'Khảo sát chuyển động rẽ của robot vi sai hai bánh độc lập.',
      'Mối quan hệ giữa vận tốc góc ω, bán kính quay R và gia tốc hướng tâm a_ht.',
      'Đo góc quay Yaw theo thời gian khi hai bánh chạy vận tốc khác nhau.',
      'Tính bán kính quay R từ hiệu vận tốc bánh phải và bánh trái.'
    ],
    currentTask: 'Đặt tốc độ bánh trái vL = 0.4, bánh phải vR = 0.8, quan sát quỹ đạo tròn và tính bán kính quay R.',
    formula: '\\omega = \\frac{v_R - v_L}{L}, \\quad a_{ht} = \\omega^2 \\cdot R',
    initialSpeed: 0.60,
    description: 'Chuyển động có quỹ đạo tròn, vectơ vận tốc luôn tiếp tuyến với quỹ đạo và có gia tốc hướng vào tâm.'
  },
  {
    id: 'integrated-practice',
    order: 5,
    title: 'Thực hành tổng hợp',
    subtitle: 'Vận dụng kiến thức',
    badgeColor: '#6828D9', // Purple
    objectives: [
      'Lập trình robot bám đường cong và tránh vật cản trên sa bàn.',
      'Đo lường sai số thực nghiệm giữa mô hình tính toán và thực tế.',
      'Thu thập toàn bộ dữ liệu telemetry (v, a, s, t) để xuất phiếu báo cáo.',
      'Đánh giá kết quả qua bài kiểm tra trắc nghiệm Vật lí 10.'
    ],
    currentTask: 'Điều khiển robot hoàn thành 1 vòng sa bàn đua trong thời gian ngắn nhất mà không va chạm vật cản.',
    formula: 's = \\int v(t) dt, \\quad v_{tb} = \\frac{s_{total}}{t_{total}}',
    initialSpeed: 0.70,
    description: 'Tổng hợp các quy luật động học, động lực học và điều khiển tự động để giải quyết bài toán thực tế.'
  }
];
