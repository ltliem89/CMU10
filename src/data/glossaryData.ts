import { GlossaryTerm, QuizQuestion } from '../types/jetbot';

export const glossaryData: GlossaryTerm[] = [
  {
    term: 'Differential Drive (Truyền Động Vi Sai)',
    vietnamese: 'Cơ cấu chuyển động hai bánh xe độc lập',
    category: 'Robotics',
    definition: 'Hệ thống di chuyển robot bằng hai bánh xe chủ động trái và phải có động cơ riêng biệt, kèm một hoặc hai bánh tự do (caster wheel) để giữ thăng bằng. Hướng và tốc độ di chuyển phụ thuộc vào hiệu số tốc độ giữa hai bánh.',
    realWorldContext: 'Khi v_L = v_R, xe đi thẳng; khi v_L < v_R, xe rẽ trái; khi v_L = -v_R, xe xoay tròn tại chỗ quanh tâm trục bánh.'
  },
  {
    term: 'Regression (Hồi Quy)',
    vietnamese: 'Bài toán dự đoán giá trị liên tục',
    category: 'Deep Learning',
    definition: 'Nhiệm vụ học máy trong đó mô hình dự đoán một hoặc nhiều biến số thực liên tục từ dữ liệu đầu vào. Trong JetBot bám đường, đầu ra là cặp số (x, y) đại diện cho tọa độ mục tiêu trên mặt phẳng ảnh.',
    realWorldContext: 'Khác với phân loại chọn nhãn rời rạc, hồi quy cho phép dự đoán độ lệch góc lái mượt mà để điều khiển bánh xe.'
  },
  {
    term: 'Classification (Phân Loại)',
    vietnamese: 'Bài toán phân loại nhãn rời rạc',
    category: 'Deep Learning',
    definition: 'Nhiệm vụ học máy dự đoán xem ảnh đầu vào thuộc về một trong các lớp cố định. Trong JetBot tránh va chạm, mạng phân loại ảnh thành hai lớp nhị phân: "free" (thông thoáng) hoặc "blocked" (bị chắn).',
    realWorldContext: 'Mô hình không biết chướng ngại vật ở cách bao xa hay hình dạng gì, nó chỉ phán đoán khả năng bị cản đường.'
  },
  {
    term: 'TensorRT',
    vietnamese: 'Bộ tối ưu hóa và suy luận học sâu của NVIDIA',
    category: 'Optimization',
    definition: 'Nền tảng của NVIDIA giúp tối ưu hóa mạng nơ-ron đã huấn luyện để chạy suy luận (inference) với độ trễ thấp nhất và thông lượng cao nhất trên GPU NVIDIA thông qua Layer Fusion, Kernel Auto-Tuning và Precision Calibration.',
    realWorldContext: 'Trên Jetson Nano, TensorRT giúp tăng tốc độ xử lý ResNet18 từ khoảng 15-20 FPS lên tới 40-50+ FPS.'
  },
  {
    term: 'FP16 (Half Precision)',
    vietnamese: 'Định dạng số thực nửa độ chính xác (16-bit)',
    category: 'Hardware & AI',
    definition: 'Định dạng dấu phẩy động 16-bit (1 bit dấu, 5 bit số mũ, 10 bit phần định trị). So với FP32 tiêu chuẩn, FP16 giảm 50% dung lượng bộ nhớ VRAM và tăng gấp đôi tốc độ tính toán trên các nhân GPU có hỗ trợ.',
    realWorldContext: 'Trong các notebook live_demo, model được chuyển qua model.half() để tận dụng khả năng tính toán FP16 trên GPU Jetson Nano.'
  },
  {
    term: 'HWC vs CHW Format',
    vietnamese: 'Định dạng sắp xếp chiều của ảnh',
    category: 'Computer Vision',
    definition: 'HWC là thứ tự (Height, Width, Channels) mà OpenCV và camera thường trả về. PyTorch lại yêu cầu định dạng CHW (Channels, Height, Width) để tăng tốc độ nạp dữ liệu vào các lớp tích chập Conv2D.',
    realWorldContext: 'Hàm transforms.functional.to_tensor() tự động hoán vị trục từ HWC sang CHW và chia giá trị pixel 0..255 về 0..1.'
  },
  {
    term: 'PD Controller (Bộ Điều Khiển Tỷ Lệ - Vi Phân)',
    vietnamese: 'Thuật toán điều khiển lái theo sai lệch và tốc độ biến thiên',
    category: 'Control Theory',
    definition: 'Bộ điều khiển tính toán tín hiệu lái: output = K_p * error + K_d * d(error)/dt + bias. Thành phần P kéo xe về tâm đường; thành phần D hãm tốc độ chuyển động để giảm hiện tượng lắc lư (damping).',
    realWorldContext: 'Trong live_demo.ipynb, steering_gain là K_p, steering_dgain là K_d, giúp xe bám đường êm ái mà không bị đảo võng.'
  },
  {
    term: 'Heartbeat Watchdog',
    vietnamese: 'Bộ giám sát kết nối chống mất tín hiệu',
    category: 'Safety',
    definition: 'Cơ chế an toàn kiểm tra định kỳ (ví dụ mỗi 0.5s) xem trình duyệt có còn duy trì liên lạc với robot hay không. Nếu mạng đứt, robot tự động ngắt lệnh và dừng động cơ ngay lập tức.',
    realWorldContext: 'Ngăn ngừa tai nạn robot tiếp tục chạy mất kiểm soát khi máy tính của học sinh bị mất sóng WiFi.'
  },
  {
    term: 'Transfer Learning (Học Chuyển Tiếp)',
    vietnamese: 'Kế thừa tri thức từ mô hình huấn luyện sẵn',
    category: 'Deep Learning',
    definition: 'Phương pháp sử dụng lại mô hình đã được huấn luyện trên tập dữ liệu khổng lồ (như ImageNet với 1.2 triệu ảnh) làm điểm khởi đầu cho một tác vụ mới với tập dữ liệu nhỏ của JetBot.',
    realWorldContext: 'Chỉ cần từ 50 đến 150 bức ảnh chụp thực tế trên sàn lớp học là JetBot đã có thể học bám đường hoặc tránh vật cản tốt.'
  },
  {
    term: 'torch2trt',
    vietnamese: 'Cầu nối PyTorch sang TensorRT của NVIDIA',
    category: 'Optimization',
    definition: 'Thư viện mã nguồn mở do NVIDIA phát triển giúp chuyển đổi trực tiếp một PyTorch nn.Module sang engine TensorRT một cách dễ dàng chỉ bằng một hàm gọi Python torch2trt().',
    realWorldContext: 'Tạo ra đối tượng TRTModule có thể gọi như mạng PyTorch thông thường nhưng chạy với backend TensorRT.'
  }
];

export const quizData: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Khi cả hai bánh xe của JetBot nhận giá trị tốc độ là left_motor = 0.5 và right_motor = 0.5, robot sẽ di chuyển như thế nào?',
    options: [
      'Robot quay tròn tại chỗ sang bên phải',
      'Robot di chuyển thẳng về phía trước với 50% công suất',
      'Robot rẽ vòng cung sang bên trái',
      'Robot dừng lại do hai động cơ triệt tiêu lực nhau'
    ],
    correctIndex: 1,
    explanation: 'Với cơ cấu truyền động vi sai (Differential Drive), khi hai bánh quay cùng vận tốc và cùng chiều tiến (+0.5), vận tốc góc omega = (v_R - v_L)/b = 0, xe sẽ tịnh tiến thẳng.',
    relatedModuleId: 'teleoperation',
    topic: 'Cơ học vi sai'
  },
  {
    id: 'q2',
    question: 'Trong bài toán bám đường (Road Following) của JetBot, mô hình ResNet18 được sử dụng cho nhiệm vụ học máy nào?',
    options: [
      'Phân loại ảnh 2 lớp (Binary Classification)',
      'Hồi quy tọa độ điểm mục tiêu (x, y) trên ảnh (Regression)',
      'Phát hiện vật thể đa nhãn với hộp giới hạn (Object Detection Bounding Box)',
      'Phân vùng ngữ nghĩa từng pixel (Semantic Segmentation)'
    ],
    correctIndex: 1,
    explanation: 'Bám đường là bài toán hồi quy (Regression): mạng nơ-ron nhận ảnh đầu vào và dự đoán 2 giá trị liên tục là tọa độ mục tiêu [x, y] để điều khiển góc lái.',
    relatedModuleId: 'train_model',
    topic: 'Học sâu & Thị giác'
  },
  {
    id: 'q3',
    question: 'Trong XYDataset của train_model.ipynb, khi thực hiện phép lật ảnh ngang (hflip) để tăng cường dữ liệu, bước xử lý nào sau đây là BẮT BUỘC?',
    options: [
      'Đổi dấu tọa độ Y: y = -y',
      'Đổi dấu tọa độ X: x = -x để phản ánh đúng hướng đối xứng',
      'Giữ nguyên tọa độ X và Y không đổi',
      'Gấp đôi giá trị tọa độ X: x = 2 * x'
    ],
    correctIndex: 1,
    explanation: 'Khi ảnh bị lật theo trục dọc (lật ngang), bên trái trở thành bên phải. Tọa độ điểm mục tiêu x cũng phải đảo dấu x = -x. Nếu quên bước này, mô hình sẽ học sai lệch hoàn toàn.',
    relatedModuleId: 'train_model',
    topic: 'Tiền xử lý & Data Augmentation'
  },
  {
    id: 'q4',
    question: 'Tại sao trong teleoperation.ipynb, lệnh traitlets.dlink nối trục analog của Gamepad với motor lại sử dụng transform=lambda x: -x?',
    options: [
      'Để giảm tốc độ động cơ xuống một nửa',
      'Vì theo chuẩn Gamepad HTML5, đẩy cần joystick về phía trước thường trả về giá trị âm, cần đảo dấu để thành tốc độ tiến dương',
      'Để đảo chiều quay của bánh xe sau khi lùi',
      'Để chuyển đổi kiểu dữ liệu từ float sang integer'
    ],
    correctIndex: 1,
    explanation: 'Trục Y của joystick chuẩn trả về giá trị -1.0 khi đẩy kịch về phía trước và +1.0 khi kéo về phía sau. Hàm lambda x: -x đảo dấu để khi đẩy tới thì motor nhận giá trị dương (tiến).',
    relatedModuleId: 'teleoperation',
    topic: 'Điều khiển & Giao diện'
  },
  {
    id: 'q5',
    question: 'Tại sao quá trình chia dữ liệu trong train_model_plot.ipynb bằng lệnh random_split(dataset, [len(dataset) - 50, 50]) lại tiềm ẩn nguy cơ lỗi nghiêm trọng?',
    options: [
      'Vì PyTorch không hỗ trợ số nguyên 50',
      'Nếu tập dữ liệu thu thập có ít hơn 50 ảnh, len(dataset) - 50 sẽ là số âm và gây crash chương trình',
      'Vì dữ liệu bắt buộc phải chia tỷ lệ 70-30',
      'Vì 50 ảnh test là quá nhiều đối với mô hình AlexNet'
    ],
    correctIndex: 1,
    explanation: 'Cảnh báo kỹ thuật đã nêu rõ: hardcode số lượng 50 mẫu test sẽ báo lỗi nếu người học chỉ mới thu thập 20-40 bức ảnh. Cách tiếp cận an toàn là dùng tỷ lệ phần trăm như 10% trong train_model.ipynb.',
    relatedModuleId: 'train_model_plot',
    topic: 'Lưu ý kỹ thuật dataset'
  },
  {
    id: 'q6',
    question: 'Vai trò chính của cơ chế Heartbeat(period=0.5) trong JetBot là gì?',
    options: [
      'Đo nhịp tim và sức khỏe của người điều khiển',
      'Tự động tăng tốc độ động cơ khi pin yếu',
      'Giám sát kết nối mạng WiFi và dừng robot khẩn cấp nếu mất tín hiệu quá 0.5 giây',
      'Đo số vòng quay của động cơ theo thời gian thực'
    ],
    correctIndex: 2,
    explanation: 'Heartbeat là một phần mềm Watchdog. Nếu kết nối giữa trình duyệt và robot bị ngắt quá 0.5s, hàm callback sẽ unlink điều khiển và gọi robot.stop() để tránh tai nạn.',
    relatedModuleId: 'teleoperation',
    topic: 'An toàn hệ thống'
  },
  {
    id: 'q7',
    question: 'Sự khác biệt căn bản giữa hai notebook live_demo_build_trt.ipynb và live_demo_trt.ipynb là gì?',
    options: [
      'Notebook build_trt dùng cho xe khác, notebook trt dùng cho JetBot',
      'Notebook build_trt thực hiện biên dịch/tối ưu mô hình sang engine TensorRT, còn notebook trt nạp engine đó để chạy suy luận và lái xe',
      'Hai notebook này hoàn toàn giống nhau, chỉ khác tên gọi',
      'Notebook trt dùng để thu thập dữ liệu mới'
    ],
    correctIndex: 1,
    explanation: 'Quy trình TensorRT gồm 2 giai đoạn tách biệt: Giai đoạn 1 là Build Engine (chạy một lần để tối ưu hóa đồ thị) và Giai đoạn 2 là Inference (nạp file engine đã build bằng TRTModule để chạy thực tế).',
    relatedModuleId: 'live_demo_build_trt',
    topic: 'TensorRT Workflow'
  },
  {
    id: 'q8',
    question: 'Trong bài toán tránh va chạm ở live_demo_resnet18.ipynb, robot thực hiện hành vi nào khi phát hiện xác suất bị chặn prob_blocked >= 0.5?',
    options: [
      'Tiếp tục tăng tốc chạy thẳng về phía trước',
      'Tự động quay camera lên trần nhà',
      'Rẽ sang bên trái (robot.left) để tìm hướng đi thông thoáng',
      'Bật đèn LED cảnh báo và tắt nguồn'
    ],
    correctIndex: 2,
    explanation: 'Mã nguồn trong cell 13 quy định: if prob_blocked < 0.5: robot.forward(speed) else: robot.left(speed). Khi bị cản, xe quay trái tìm hướng đi mới.',
    relatedModuleId: 'live_demo_resnet18',
    topic: 'Chiến lược tránh vật cản'
  },
  {
    id: 'q9',
    question: 'Tại sao trước khi truyền ảnh camera vào mạng PyTorch trong live_demo, cần gọi hàm preprocess(image)?',
    options: [
      'Để chuyển đổi từ bố cục HWC của camera sang CHW, chuẩn hóa theo mean/std của ImageNet, đưa lên GPU và ép kiểu FP16',
      'Để nén ảnh thành tệp ZIP lưu trữ',
      'Để giảm độ sáng khung hình xuống 0%',
      'Để vẽ thêm các vòng tròn trang trí lên ảnh'
    ],
    correctIndex: 0,
    explanation: 'Ảnh camera thô có dạng HWC, giá trị [0, 255] trên CPU. preprocess hoán vị chiều sang CHW, chuẩn hóa [0, 1] trừ mean chia std, đưa lên GPU dạng half precision để khớp định dạng đầu vào của ResNet18.',
    relatedModuleId: 'live_demo',
    topic: 'Tiền xử lý thị giác'
  },
  {
    id: 'q10',
    question: 'Điều gì xảy ra nếu bạn đóng một notebook JetBot mà quên gọi lệnh camera.stop()?',
    options: [
      'Camera sẽ tự động nâng cấp độ phân giải',
      'Bộ điều khiển CSI camera trên Jetson Nano vẫn bị chiếm dụng (busy), các notebook tiếp theo sẽ bị lỗi không mở được camera',
      'Robot sẽ tự động xóa sạch dữ liệu trên thẻ nhớ',
      'Không có bất kỳ ảnh hưởng nào cả'
    ],
    correctIndex: 1,
    explanation: 'Cảm biến CSI MIPI trên Jetson Nano sử dụng daemon nvargus-daemon. Nếu không giải phóng bằng camera.stop(), tiến trình sẽ giữ khóa cảm biến, gây lỗi nvarguscamerasrc cannot open device.',
    relatedModuleId: 'teleoperation',
    topic: 'Quản lý tài nguyên phần cứng'
  }
];
