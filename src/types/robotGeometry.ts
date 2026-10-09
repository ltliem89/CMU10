/**
 * ROBOT GEOMETRY & MECHANICAL CONFIGURATION (CMU10 STEM JETBOT STANDARD)
 * =====================================================================
 * Cấu hình thông số hình học, cơ khí và tọa độ tập trung cho robot ảo CMU10.
 * Đơn vị chuẩn: Mét (m) trong không gian vật lý, hiển thị Milimét (mm) cho kỹ thuật.
 * Khối lượng: Kilogram (kg). Góc: Radian (rad) / Độ (deg).
 */

export interface ComponentSpec {
  id: string;
  nameVi: string;
  category: 'chassis' | 'drivetrain' | 'electronics' | 'sensor' | 'power' | 'accessory';
  materialVi: string;
  dimensionsMm: string;
  weightGrams: number;
  mountingPositionVi: string;
  descriptionVi: string;
  specs: Record<string, string>;
}

export interface CollisionHullConfig {
  type: 'box' | 'compound';
  boxDimensions: [number, number, number]; // [lengthX, heightY, widthZ] in meters
  boxCenterOffset: [number, number, number]; // [x, y, z] relative to wheel ground contact
  safetyMarginMeters: number;
}

export interface SensorMountConfig {
  id: string;
  nameVi: string;
  type: 'camera' | 'ultrasonic' | 'lidar';
  position: [number, number, number]; // [x, y, z] in meters from robot origin
  orientationDeg: [number, number, number]; // [pitch, yaw, roll] in degrees
  fovHorizontalDeg: number;
  fovVerticalDeg: number;
  rangeMinMeters: number;
  rangeMaxMeters: number;
}

export interface RobotGeometryConfigType {
  modelName: string;
  standardVersion: string;
  driveType: 'differential-drive';
  
  // Body Dimensions (in meters)
  bodyLength: number; // 0.138m = 138mm
  bodyWidth: number;  // 0.125m = 125mm
  bodyHeight: number; // 0.130m = 130mm
  
  // Drivetrain & Kinematic Parameters
  wheelRadius: number;     // 0.0325m = 32.5mm (Diameter: 65mm)
  wheelWidth: number;      // 0.026m = 26mm
  wheelBase: number;       // 0.102m = 102mm (Track width between wheels)
  groundClearance: number; // 0.012m = 12mm
  casterRadius: number;    // 0.0075m = 7.5mm (Diameter: 15mm)
  casterOffsetZ: number;   // -0.055m = -55mm (Behind drive axle)
  
  // Mass & Inertia
  mass: number; // 0.95 kg
  centerOfMassOffset: [number, number, number]; // [0, 0.045, -0.010] m
  
  // Standoffs (Cọc đồng M3 kết nối 2 tầng)
  tierSpacing: number; // 0.035m = 35mm
  
  // Coordinate Frame Definition
  coordinateConvention: string;
  originDescription: string;
  
  // Collision Geometry
  collisionGeometry: CollisionHullConfig;
  
  // Sensor Mounts
  sensorMounts: SensorMountConfig[];
  
  // Hardware Components Catalog
  components: ComponentSpec[];
}

export const ROBOT_GEOMETRY_CONFIG: RobotGeometryConfigType = {
  modelName: 'NVIDIA JetBot AI Mobile Robot (CMU10 STEM)',
  standardVersion: 'CMU10-V2.4-ISO',
  driveType: 'differential-drive',
  
  bodyLength: 0.138,      // 138 mm
  bodyWidth: 0.125,       // 125 mm
  bodyHeight: 0.130,      // 130 mm
  
  wheelRadius: 0.0325,    // Đường kính 65 mm -> Bán kính 32.5 mm
  wheelWidth: 0.026,      // Độ rộng bản lốp 26 mm
  wheelBase: 0.102,       // Khoảng cách 2 bánh vi sai b = 102 mm
  groundClearance: 0.012, // Khoảng sáng gầm xe 12 mm
  casterRadius: 0.0075,   // Bánh bi đa hướng sau bán kính 7.5 mm
  casterOffsetZ: -0.055,  // Tâm bánh bi cách trục bánh trước 55 mm về phía sau
  
  mass: 0.95, // 950g
  centerOfMassOffset: [0.0, 0.042, -0.008], // Hạ thấp gần sàn đáy nhờ khay pin
  tierSpacing: 0.035, // Khoảng cách giữa sàn đáy và sàn trên là 35 mm
  
  coordinateConvention: 'ROS Right-Hand Rule: +X (Phải), +Y (Lên trên), +Z (Tiến phía trước)',
  originDescription: 'Gốc tọa độ (0,0,0) đặt tại tâm điểm tiếp đất của trục 2 bánh dẫn động chủ động',
  
  collisionGeometry: {
    type: 'box',
    boxDimensions: [0.142, 0.132, 0.146], // Kích thước bao an toàn có margin
    boxCenterOffset: [0.0, 0.066, -0.005],
    safetyMarginMeters: 0.005
  },
  
  sensorMounts: [
    {
      id: 'camera-csi',
      nameVi: 'Camera CSI Sony IMX219 (8MP Fisheye)',
      type: 'camera',
      position: [0.0, 0.108, 0.058], // Đỉnh trước giá đỡ tầng 2
      orientationDeg: [18.0, 0.0, 0.0], // Nghiêng chúc xuống 18 độ
      fovHorizontalDeg: 160.0,
      fovVerticalDeg: 90.0,
      rangeMinMeters: 0.05,
      rangeMaxMeters: 3.5
    },
    {
      id: 'ultrasonic-front',
      nameVi: 'Cảm biến Khoảng cách Siêu âm HC-SR04 / ToF',
      type: 'ultrasonic',
      position: [0.0, 0.035, 0.072], // Mép cản trước
      orientationDeg: [0.0, 0.0, 0.0], // Hướng thẳng phía trước
      fovHorizontalDeg: 30.0,
      fovVerticalDeg: 15.0,
      rangeMinMeters: 0.02,
      rangeMaxMeters: 4.0
    }
  ],
  
  components: [
    {
      id: 'chassis-base',
      nameVi: 'Khung Gầm Đáy (Bottom Chassis Plate)',
      category: 'chassis',
      materialVi: 'Hợp kim nhôm Anode hóa / Acrylic cường lực 3mm',
      dimensionsMm: '138 x 92 x 3 mm',
      weightGrams: 85,
      mountingPositionVi: 'Tầng đáy cơ sở, đỡ 2 motor và bánh đa hướng sau',
      descriptionVi: 'Tấm sàn gia công CNC chính xác có lỗ khoan định vị trục động cơ TT và khe luồn dây nguồn.',
      specs: { 'Độ dày': '3 mm', 'Khả năng chịu tải': '2.5 kg', 'Lỗ ren': 'Chuẩn M3' }
    },
    {
      id: 'upper-deck',
      nameVi: 'Sàn Tầng Trên (Upper Deck Plate)',
      category: 'chassis',
      materialVi: 'Acrylic màu xanh JetBot đặc trưng / Nhôm gia công',
      dimensionsMm: '125 x 90 x 3 mm',
      weightGrams: 65,
      mountingPositionVi: 'Liên kết với sàn đáy qua 4 cọc đồng M3 cao 35mm',
      descriptionVi: 'Giá đỡ chính cho bo mạch máy tính AI NVIDIA Jetson Nano và màn hình OLED mini.',
      specs: { 'Khoảng cách cọc': '35 mm', 'Vật liệu cọc': 'Đồng thau M3 Hex' }
    },
    {
      id: 'dc-motors',
      nameVi: 'Động Cơ DC Giảm Tốc TT (Dual Gear Motors)',
      category: 'drivetrain',
      materialVi: 'Vỏ nhựa kỹ thuật ABS màu vàng, bánh răng kim loại/nhựa POM',
      dimensionsMm: '70 x 22 x 18 mm (mỗi động cơ)',
      weightGrams: 70,
      mountingPositionVi: 'Kẹp cố định hai bên hông sàn đáy',
      descriptionVi: 'Cặp động cơ DC giảm tốc tỷ số 1:48, trục ra D-shaft kim loại dẫn động trực tiếp bánh xe.',
      specs: { 'Điện áp': '3V - 6V DC', 'Tỷ số truyền': '1:48', 'Tốc độ tối đa': '200 vòng/phút', 'Mô-men xoắn': '0.8 kg.cm' }
    },
    {
      id: 'drive-wheels',
      nameVi: 'Bánh Xe Chủ Động Cao Su Gai (Drive Wheels)',
      category: 'drivetrain',
      materialVi: 'Mâm nhựa nan hoa thể thao, lốp cao su lưu hóa xẻ rãnh chống trượt',
      dimensionsMm: 'Đường kính 65 mm x Chiều dày 26 mm',
      weightGrams: 80,
      mountingPositionVi: 'Khóa chặt vào trục D-shaft của 2 motor TT',
      descriptionVi: 'Hệ bánh xe bám dính cao giúp robot di chuyển chuẩn xác và không bị trượt khi vào cua gấp.',
      specs: { 'Đường kính': '65 mm', 'Bản rộng': '26 mm', 'Khóa trục': 'Ngàm D-shaft 5.3mm' }
    },
    {
      id: 'caster-wheel',
      nameVi: 'Bánh Bi Đa Hướng Caster (Rear Ball Caster)',
      category: 'drivetrain',
      materialVi: 'Bi thép tôi mạ crom, chén đỡ kim loại dập nổi',
      dimensionsMm: 'Đường kính bi 15 mm, chiều cao tổng 20 mm',
      weightGrams: 28,
      mountingPositionVi: 'Tâm sau sàn đáy, cách trục trước 55 mm',
      descriptionVi: 'Điểm tì thứ ba tạo hệ cân bằng tĩnh vững chắc, xoay tự do 360 độ giảm thiểu ma sát quay.',
      specs: { 'Loại': 'Bi cầu kim loại', 'Góc quay': '360° tự do', 'Tải tĩnh': '10 kg' }
    },
    {
      id: 'jetson-nano',
      nameVi: 'Máy Tính AI Nhúng NVIDIA Jetson Nano',
      category: 'electronics',
      materialVi: 'Bo mạch PCB FR-4 nhiều lớp, khối tản nhiệt nhôm đùn xẻ rãnh đen',
      dimensionsMm: '100 x 80 x 29 mm (kèm tản nhiệt)',
      weightGrams: 140,
      mountingPositionVi: 'Lắp ở vị trí trung tâm sàn tầng 2 (Upper Deck)',
      descriptionVi: 'Trung tâm xử lý AI 128 lõi GPU Maxwell, 4GB RAM, cổng CSI camera MIPI, Ethernet và 4 cổng USB.',
      specs: { 'GPU': '128-core NVIDIA Maxwell', 'CPU': 'Quad-core ARM A57', 'Bộ nhớ': '4GB 64-bit LPDDR4', 'Công suất': '5W - 10W' }
    },
    {
      id: 'motor-driver',
      nameVi: 'Mạch Điều Khiển Động Cơ I2C (PCA9685 & TB6612FNG)',
      category: 'electronics',
      materialVi: 'Mạch PCB xanh chuẩn Feather / Motor Hat',
      dimensionsMm: '50 x 25 x 12 mm',
      weightGrams: 22,
      mountingPositionVi: 'Tầng trên, cắm header hoặc kết nối cáp I2C 0x60',
      descriptionVi: 'IC tạo xung PWM 16 kênh 12-bit PCA9685 kết hợp cầu H MOSFET TB6612FNG công suất cao.',
      specs: { 'Giao thức': 'I2C (Địa chỉ 0x60)', 'Tần số PWM': '50 Hz - 1.6 kHz', 'Dòng liên tục': '1.2A/kênh' }
    },
    {
      id: 'camera-module',
      nameVi: 'Module Camera CSI 8MP Sony IMX219 (Fisheye 160°)',
      category: 'sensor',
      materialVi: 'Cụm thấu kính quang học góc rộng, cáp ribbon FPC 15-pin mạ vàng',
      dimensionsMm: '25 x 24 x 18 mm + Giá đỡ chữ L',
      weightGrams: 18,
      mountingPositionVi: 'Giá đỡ camera nghiêng 18° gắn phía trước sàn tầng trên',
      descriptionVi: 'Mắt thần thị giác máy tính cho các tác vụ Phân loại vật cản (Classification) và Bám đường (Regression).',
      specs: { 'Cảm biến': 'Sony IMX219 8MP', 'Độ phân giải': '3280 x 2464', 'Góc nhìn FOV': '160° FoV', 'Giao diện': 'MIPI CSI-2' }
    },
    {
      id: 'ultrasonic-sensor',
      nameVi: 'Cụm Cảm Biến Siêu Âm HC-SR04 / ToF',
      category: 'sensor',
      materialVi: '2 ống thu-phát áp điện mạ nhôm, mạch điều khiển PCB xanh',
      dimensionsMm: '45 x 20 x 15 mm',
      weightGrams: 15,
      mountingPositionVi: 'Mép trước khung xe (cản trước)',
      descriptionVi: 'Phát sóng siêu âm 40 kHz đo thời gian dội lại để xác định khoảng cách vật cản từ 2cm đến 400cm.',
      specs: { 'Tần số': '40 kHz', 'Góc quét': '15°', 'Độ chính xác': '3 mm' }
    },
    {
      id: 'battery-pack',
      nameVi: 'Khối Nguồn Pin Li-ion 3S 18650 / Power Bank 5V-3A',
      category: 'power',
      materialVi: '3 cell pin Li-ion ghép nối tiếp bọc màng co cách điện màu xanh dương',
      dimensionsMm: '72 x 58 x 20 mm',
      weightGrams: 155,
      mountingPositionVi: 'Kẹp giữa 2 tầng hoặc khay dưới sàn đáy để hạ thấp trọng tâm',
      descriptionVi: 'Cung cấp năng lượng ổn định độc lập cho Jetson Nano (5V 3A) và động cơ (8.4V - 11.1V).',
      specs: { 'Dung lượng': '2600 - 3000 mAh', 'Điện áp danh định': '11.1V (Max 12.6V)', 'Mạch bảo vệ': 'BMS tích hợp' }
    },
    {
      id: 'oled-display',
      nameVi: 'Màn Hình Hiển Thị Trạng Thái OLED 0.91" I2C',
      category: 'accessory',
      materialVi: 'Màn hình OLED đơn sắc phát quang màu xanh dương / trắng',
      dimensionsMm: '38 x 12 x 4 mm',
      weightGrams: 8,
      mountingPositionVi: 'Sàn tầng trên cạnh Jetson Nano',
      descriptionVi: 'Hiển thị địa chỉ IP WiFi, dung lượng pin còn lại, nhiệt độ CPU và trạng thái runtime thời gian thực.',
      specs: { 'Độ phân giải': '128 x 32 pixel', 'Chuẩn giao tiếp': 'I2C (Địa chỉ 0x3C)' }
    },
    {
      id: 'wifi-antennas',
      nameVi: 'Cặp Ăng-ten Wi-Fi Kép Băng Tần Kép (Dual SMA Antennas)',
      category: 'accessory',
      materialVi: 'Vỏ cao su TPE đàn hồi, khớp nối đồng mạ vàng ren SMA',
      dimensionsMm: 'Dài 110 mm x Đường kính 10 mm (x2)',
      weightGrams: 26,
      mountingPositionVi: 'Gắn cọc sau sàn trên, nghiêng 45° chữ V',
      descriptionVi: 'Đảm bảo kết nối không dây tầm xa mượt mà cho điều khiển Gamepad và truyền hình ảnh video.',
      specs: { 'Băng tần': '2.4 GHz & 5 GHz', 'Độ lợi': '3 dBi', 'Đầu nối': 'SMA Male' }
    }
  ]
};

export type InspectionMode = 
  | 'realistic'   // Hiển thị đầy đủ mô hình vật liệu thực
  | 'wireframe'   // Khung dây quan sát cấu trúc và topology
  | 'components'  // Làm nổi bật từng bộ phận linh kiện
  | 'collision'   // Hiển thị hộp vùng va chạm an toàn
  | 'coordinates' // Hiển thị 3 trục tọa độ và điểm gốc (0,0,0)
  | 'sensors'     // Hiển thị nón FOV camera và chùm tia cảm biến
  | 'dimensions'; // Hiển thị các thước đo CAD kích thước thực tế
