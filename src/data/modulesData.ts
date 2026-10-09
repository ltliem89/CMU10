import { ModuleMeta } from '../types/jetbot';

export const modulesData: ModuleMeta[] = [
  {
    id: 'teleoperation',
    number: 1,
    nameVi: 'Điều Khiển Từ Xa Bằng Gamepad',
    notebookName: 'teleoperation.ipynb',
    category: 'teleoperation',
    categoryNameVi: 'Điều khiển thủ công',
    taskTypeVi: 'Điều khiển thủ công',
    targetGoalVi: 'Người điều khiển trực tiếp can thiệp hai động cơ qua tay cầm gamepad và theo dõi video camera thời gian thực, có cơ chế an toàn ngắt khi mất kết nối (Heartbeat watchdog).',
    descriptionVi: 'Đây là điều khiển thủ công hoàn toàn: con người đưa ra quyết định lái. Notebook thiết lập liên kết phản hồi nhanh (traitlets.dlink) giữa trục analog của gamepad và giá trị tốc độ motor, đồng thời stream ảnh từ Camera JetBot (BGR8) sang định dạng JPEG nén trên giao diện web. Một bộ đếm nhịp tim Heartbeat được dùng để dừng khẩn cấp robot khi mạng WiFi ngắt quãng.',
    dataFlow: {
      input: 'Tín hiệu analog trục gamepad (controller.axes[1], axes[3]), luồng khung hình camera (Camera.instance())',
      process: 'Đảo dấu trục qua lambda transform=lambda x: -x; dlink liên kết trực tiếp giá trị; bgr8_to_jpeg nén ảnh; Heartbeat giám sát mỗi 0.5s',
      output: 'robot.left_motor.value, robot.right_motor.value; ảnh hiển thị trên widgets.Image; tệp snapshot/<uuid>.jpg'
    },
    keyFunctions: [
      'widgets.Controller(index=1)',
      'Robot()',
      'traitlets.dlink(...)',
      'Camera.instance()',
      'bgr8_to_jpeg',
      'Heartbeat(period=0.5)',
      'handle_heartbeat_status(change)',
      'save_snapshot(change)',
      'camera.stop()'
    ],
    codeSnippets: [
      {
        language: 'python',
        captionVi: 'Khởi tạo Robot và liên kết trục Gamepad với 2 động cơ (Cell 5)',
        code: `from jetbot import Robot
import traitlets

robot = Robot()

# Đảo dấu trục vì đẩy cần lên thường trả về giá trị âm trên gamepad chuẩn
left_link = traitlets.dlink((controller.axes[1], 'value'), (robot.left_motor, 'value'), transform=lambda x: -x)
right_link = traitlets.dlink((controller.axes[3], 'value'), (robot.right_motor, 'value'), transform=lambda x: -x)`,
        annotations: [
          { line: 4, explanation: 'Tạo đối tượng Robot JetBot điều khiển driver động cơ qua I2C (mặc định PCA9685/TB6612FNG).', impactOnRobot: 'Kích hoạt phần cứng điều khiển hai bánh xe' },
          { line: 7, explanation: 'traitlets.dlink tạo liên kết 1 chiều: khi axes[1] đổi, giá trị left_motor lập tức cập nhật.', impactOnRobot: 'Bánh trái quay theo trục tay cầm' },
          { line: 8, explanation: 'transform=lambda x: -x đảo dấu để đẩy cần joystick về trước ứng với tiến.', impactOnRobot: 'Đảm bảo robot chạy đúng chiều người lái muốn' }
        ]
      },
      {
        language: 'python',
        captionVi: 'Watchdog an toàn Heartbeat ngắt kết nối khi mất mạng (Cell 16)',
        code: `from jetbot import Heartbeat

def handle_heartbeat_status(change):
    if change['new'] == Heartbeat.Status.dead:
        camera_link.unlink()
        left_link.unlink()
        right_link.unlink()
        robot.stop()

heartbeat = Heartbeat(period=0.5)

# Gắn hàm xử lý sự kiện khi trạng thái heartbeat thay đổi
heartbeat.observe(handle_heartbeat_status, names='status')`,
        annotations: [
          { line: 4, explanation: 'Kiểm tra nếu trạng thái heartbeat chuyển sang Dead (mất tín hiệu > 0.5s).', impactOnRobot: 'Phát hiện sự cố mạng' },
          { line: 5, explanation: 'Hủy toàn bộ liên kết dlink tới camera và 2 motor.', impactOnRobot: 'Ngừng tiếp nhận lệnh cũ bị treo' },
          { line: 8, explanation: 'Gọi hàm dừng robot.stop() để hạ cả 2 motor về 0.0.', impactOnRobot: 'Robot dừng lại ngay lập tức, chống lao vào tường' }
        ]
      }
    ],
    hardwareRequirements: ['Gamepad USB/Bluetooth', 'JetBot kit (2 motor, CSI camera)', 'Mạng WiFi ổn định'],
    caveatsAndErrors: [
      'Chỉ số gamepad index=1 trong notebook có thể khác nhau tùy hệ điều hành và số thiết bị kết nối. Cần kiểm tra trên html5gamepad.com.',
      'Nếu không gọi camera.stop() khi đóng notebook, tài nguyên CSI camera MIPI trên Jetson Nano bị khóa (camera busy), các notebook sau sẽ lỗi nvarguscamerasrc.',
      'Khi mất heartbeat và liên kết bị unlink, nếu kết nối lại phải liên kết lại cẩn thận, tránh dlink 2 lần gây nhân đôi lệnh gửi qua I2C.'
    ],
    simulationFeature: 'Bộ giả lập Gamepad với 2 cần analog, công tắc kiểm thử Heartbeat Watchdog, và camera giả lập.'
  },
  {
    id: 'data_collection',
    number: 2,
    nameVi: 'Thu Thập Dữ Liệu Bám Đường (Click Chuột)',
    notebookName: 'data_collection.ipynb',
    category: 'road-following',
    categoryNameVi: 'Thu thập dữ liệu bám đường',
    taskTypeVi: 'Hồi quy tọa độ (Regression)',
    targetGoalVi: 'Thu thập ảnh camera và gán nhãn mục tiêu tọa độ điểm đích (x, y) bằng cách bấm trực tiếp lên ảnh qua ClickableImageWidget.',
    descriptionVi: 'Bám đường là bài toán hồi quy (Regression): mạng nơ-ron học cách dự đoán vị trí mục tiêu (x, y) để robot hướng tới (khái niệm "củ cà rốt trên cây gậy"). Trong notebook này, người dùng đặt robot ở nhiều góc và vị trí khác nhau trên đường đi, quan sát khung camera 224x224 và click chuột vào điểm xa nhất có thể đi thẳng an toàn.',
    dataFlow: {
      input: 'Khung ảnh trực tiếp từ Camera (224x224), sự kiện click chuột offsetX, offsetY',
      process: 'Lưu ảnh vào dataset_xy với tên xy_<x>_<y>_<uuid>.jpg; vẽ chấm xanh đường kính 8px bằng cv2.circle để hiển thị ảnh snapshot',
      output: 'Thư mục dataset_xy/ chứa các cặp ảnh và nhãn tọa độ; gói nén road_following_dataset_xy_<timestr>.zip'
    },
    keyFunctions: [
      'ClickableImageWidget(...)',
      'save_snapshot(_, content, msg)',
      'cv2.circle(snapshot, (x, y), 8, (0, 255, 0), 3)',
      'glob.glob(os.path.join(DATASET_DIR, "*.jpg"))',
      '!zip -r -q ...'
    ],
    codeSnippets: [
      {
        language: 'python',
        captionVi: 'Callback lưu ảnh khi click chuột vào ClickableImageWidget (Cell 8)',
        code: `def save_snapshot(_, content, msg):
    if content['event'] == 'click':
        data = content['eventData']
        x = data['offsetX']
        y = data['offsetY']
        
        # Tọa độ X, Y tính bằng pixel từ góc trên-bên trái
        uuid = 'xy_%03d_%03d_%s' % (x, y, uuid1())
        image_path = os.path.join(DATASET_DIR, uuid + '.jpg')
        with open(image_path, 'wb') as f:
            f.write(camera_widget.value)
        
        # Hiển thị ảnh chụp với vòng tròn xanh lục tại điểm nhấp chuột
        snapshot = camera.value.copy()
        snapshot = cv2.circle(snapshot, (x, y), 8, (0, 255, 0), 3)
        snapshot_widget.value = bgr8_to_jpeg(snapshot)
        count_widget.value = len(glob.glob(os.path.join(DATASET_DIR, '*.jpg')))`
      }
    ],
    hardwareRequirements: ['CSI Camera 224x224', 'Đường piste hoặc vạch kẻ sàn'],
    caveatsAndErrors: [
      'Tọa độ (x, y) ở bước này được lưu dưới dạng pixel (0..224), không phải tỉ lệ chuẩn hóa [-1, 1]. Bước huấn luyện mới chuyển đổi.',
      'Sự đa dạng dữ liệu quan trọng hơn số lượng: cần đặt robot ở mép đường, lệch trái, lệch phải, góc xiên để mô hình học cách kéo robot quay lại tâm đường.'
    ],
    simulationFeature: 'Bảng tương tác cho phép click chuột lên màn hình camera giả lập, hiển thị tọa độ pixel tức thời và lưu mẫu thử vào bộ đếm.'
  },
  {
    id: 'data_collection_gamepad',
    number: 3,
    nameVi: 'Thu Thập Dữ Liệu Bám Đường Bằng Gamepad',
    notebookName: 'data_collection_gamepad.ipynb',
    category: 'road-following',
    categoryNameVi: 'Thu thập dữ liệu bám đường',
    taskTypeVi: 'Hồi quy tọa độ (Regression)',
    targetGoalVi: 'Sử dụng cần điều khiển Gamepad để dịch chuyển chấm xanh mục tiêu trên màn hình camera và nhấn nút DPAD Down để lưu ảnh kèm tọa độ.',
    descriptionVi: 'Thay vì dùng chuột nhấp, notebook này liên kết trục cần gạt gamepad (controller.axes[2], axes[3]) với thanh trượt tọa độ x_slider, y_slider (-1.0 đến +1.0). Hàm display_xy dùng OpenCV vẽ điểm mục tiêu màu xanh lá, điểm tâm xuất phát màu đỏ và đường chỉ hướng màu xanh dương.',
    dataFlow: {
      input: 'Trục cần gạt Gamepad (axes[2], axes[3]), nút bấm DPAD Down (button[13]), ảnh camera',
      process: 'Ánh xạ tọa độ thanh trượt [-1, 1] sang pixel; vẽ đồ họa cv2.circle và cv2.line; sinh tên tệp qua xy_uuid(x, y)',
      output: 'Tệp ảnh trong dataset_xy/ với tên mã hóa tọa độ pixel: xy_<x>_<y>_<uuid>.jpg'
    },
    keyFunctions: [
      'display_xy(camera_image)',
      'xy_uuid(x, y)',
      'controller.buttons[13].observe(save_snapshot, names="value")',
      'cv2.line(image, (x,y), (widget_width / 2, widget_height), (255,0,0), 3)'
    ],
    codeSnippets: [
      {
        language: 'python',
        captionVi: 'Vẽ mục tiêu và đường dẫn hướng trên ảnh camera (Cell 8)',
        code: `def display_xy(camera_image):
    image = np.copy(camera_image)
    x = x_slider.value
    y = y_slider.value
    # Ánh xạ từ khoảng [-1.0, 1.0] sang tọa độ pixel
    x = int(x * widget_width / 2 + widget_width / 2)
    y = int(y * widget_height / 2 + widget_height / 2)
    image = cv2.circle(image, (x, y), 8, (0, 255, 0), 3)
    image = cv2.circle(image, (widget_width // 2, widget_height), 8, (0, 0, 255), 3)
    image = cv2.line(image, (x, y), (widget_width // 2, widget_height), (255, 0, 0), 3)
    jpeg_image = bgr8_to_jpeg(image)
    return jpeg_image`
      }
    ],
    hardwareRequirements: ['Tay cầm Gamepad tương thích HTML5', 'JetBot CSI Camera'],
    caveatsAndErrors: [
      'Gamepad ở notebook này dùng để GÁN NHÃN MỤC TIÊU X/Y, KHÔNG PHẢI ĐIỀU KHIỂN ĐỘNG CƠ như teleoperation.',
      'Cần unobserve_all() các nút của controller trước khi gán observe mới để tránh lưu trùng lặp nhiều ảnh trong một lần bấm.'
    ],
    simulationFeature: 'Hai thanh trượt X/Y tương tác vẽ trực tiếp đường vector màu xanh nối từ tâm đáy xe lên điểm mục tiêu.'
  },
  {
    id: 'train_model',
    number: 4,
    nameVi: 'Huấn Luyện Hồi Quy Bám Đường (ResNet18)',
    notebookName: 'train_model.ipynb',
    category: 'road-following',
    categoryNameVi: 'Huấn luyện bám đường',
    taskTypeVi: 'Hồi quy tọa độ (Regression)',
    targetGoalVi: 'Xây dựng dataset tùy chỉnh XYDataset, giải mã nhãn X/Y từ tên file, tinh chỉnh mạng ResNet18 (Transfer Learning) với hàm mất mát MSE để dự đoán tọa độ lái.',
    descriptionVi: 'Notebook chuyển đổi bài toán thị giác thành hồi quy: mạng nhận ảnh 224x224 và dự đoán vector 2 chiều [x, y] chuẩn hóa trong khoảng [-1.0, 1.0]. Sử dụng kiến trúc ResNet18 tiền huấn luyện trên ImageNet, thay thế lớp Linear(512, 2). Kỹ thuật tăng cường dữ liệu (Data Augmentation) ColorJitter và lật ngang ngẫu nhiên (hflip) - lưu ý khi lật ảnh phải đảo dấu nhãn x = -x.',
    dataFlow: {
      input: 'Thư mục dataset_xy/ chứa ảnh tên xy_<x>_<y>_<uuid>.jpg',
      process: 'Giải mã nhãn qua get_x, get_y; XYDataset; hflip (x = -x); ResNet18 fc=Linear(512, 2); Optimizer Adam; MSE Loss F.mse_loss(outputs, labels)',
      output: 'Checkpoint trọng số tốt nhất: best_steering_model_xy.pth'
    },
    keyFunctions: [
      'get_x(path, width)',
      'get_y(path, height)',
      'class XYDataset(torch.utils.data.Dataset)',
      'transforms.functional.hflip(image)',
      'models.resnet18(pretrained=True)',
      'model.fc = torch.nn.Linear(512, 2)',
      'F.mse_loss(outputs, labels)',
      'torch.save(model.state_dict(), BEST_MODEL_PATH)'
    ],
    codeSnippets: [
      {
        language: 'python',
        captionVi: 'Giải mã nhãn X/Y và lớp XYDataset với Data Augmentation (Cell 6)',
        code: `def get_x(path, width):
    """Lấy giá trị x chuẩn hóa [-1.0, 1.0] từ tên file ảnh"""
    return (float(int(path.split("_")[1])) - width/2) / (width/2)

def get_y(path, height):
    """Lấy giá trị y chuẩn hóa [-1.0, 1.0] từ tên file ảnh"""
    return (float(int(path.split("_")[2])) - height/2) / (height/2)

class XYDataset(torch.utils.data.Dataset):
    def __init__(self, directory, random_hflips=False):
        self.directory = directory
        self.random_hflips = random_hflips
        self.image_paths = glob.glob(os.path.join(self.directory, '*.jpg'))
        self.color_jitter = transforms.ColorJitter(0.3, 0.3, 0.3, 0.3)
    
    def __len__(self):
        return len(self.image_paths)
    
    def __getitem__(self, idx):
        image_path = self.image_paths[idx]
        image = PIL.Image.open(image_path)
        width, height = image.size
        x = float(get_x(os.path.basename(image_path), width))
        y = float(get_y(os.path.basename(image_path), height))
        
        # QUAN TRỌNG: Nếu lật ngang ảnh thì trục X phải đảo dấu tương ứng
        if self.random_hflips and float(np.random.rand(1)) > 0.5:
            image = transforms.functional.hflip(image)
            x = -x
            
        image = self.color_jitter(image)
        image = transforms.functional.resize(image, (224, 224))
        image = transforms.functional.to_tensor(image)
        image = image.numpy()[::-1].copy()  # Chuyển BGR sang RGB phù hợp
        image = torch.from_numpy(image)
        image = transforms.functional.normalize(image, [0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        return image, torch.tensor([x, y]).float()`
      }
    ],
    hardwareRequirements: ['Máy trạm có GPU NVIDIA hỗ trợ CUDA hoặc Jetson Nano chạy PyTorch'],
    caveatsAndErrors: [
      'Lỗi kinh điển: Nếu lật ngang ảnh (hflip) mà KHÔNG đảo dấu x = -x, robot sẽ học sai hoàn toàn (gặp rẽ trái lại rẽ phải).',
      'Định dạng ảnh trong notebook có bước numpy()[::-1] để đảo kênh màu (BGR sang RGB) do JetBot camera chụp BGR.',
      'Sử dụng NUM_EPOCHS = 70 với Adam optimizer, lưu checkpoint khi test_loss < best_loss.'
    ],
    simulationFeature: 'Mô phỏng minh họa quá trình tính loss MSE qua từng epoch và trực quan hóa điểm nhãn ground truth so với điểm AI dự đoán.'
  },
  {
    id: 'train_model_plot',
    number: 5,
    nameVi: 'Huấn Luyện Tránh Va Chạm Với AlexNet & Đồ Thị Bokeh',
    notebookName: 'train_model_plot.ipynb',
    category: 'collision-avoidance',
    categoryNameVi: 'Huấn luyện tránh va chạm',
    taskTypeVi: 'Phân loại ảnh (Classification)',
    targetGoalVi: 'Huấn luyện mô hình AlexNet phân loại 2 lớp (free và blocked) kèm vẽ đồ thị Loss & Accuracy trực tiếp bằng thư viện Bokeh trong Jupyter.',
    descriptionVi: 'Tránh va chạm là bài toán phân loại ảnh nhị phân: nhãn "free" (đường trống, có thể tiến) và "blocked" (có vật cản phía trước, phải rẽ). Dữ liệu được tổ chức theo cấu trúc thư mục ImageFolder (thư mục dataset/free và dataset/blocked). Điểm đặc biệt của notebook này là sử dụng mạng AlexNet và thư viện Bokeh để vẽ đường đồ thị Loss và Accuracy thời gian thực sau mỗi epoch.',
    dataFlow: {
      input: 'Tệp nén dataset.zip giải nén thành 2 thư mục con dataset/free/ và dataset/blocked/',
      process: 'datasets.ImageFolder; random_split cố định 50 ảnh test; models.alexnet; thay classifier[6] = Linear(in_features, 2); SGD optimizer; Bokeh push_notebook cập nhật đồ thị',
      output: 'best_model.pth (lưu theo tiêu chí test_accuracy cao nhất)'
    },
    keyFunctions: [
      'datasets.ImageFolder(...)',
      'models.alexnet(pretrained=True)',
      'model.classifier[6] = torch.nn.Linear(..., 2)',
      'ColumnDataSource(...)',
      'push_notebook(handle=handle)',
      'F.cross_entropy(outputs, labels)'
    ],
    codeSnippets: [
      {
        language: 'python',
        captionVi: 'Thay đổi lớp phân loại của AlexNet và huấn luyện với đồ thị Bokeh (Cell 17 & 23)',
        code: `# Thay thế lớp cuối của AlexNet thành 2 ngõ ra cho 2 lớp (free / blocked)
model.classifier[6] = torch.nn.Linear(model.classifier[6].in_features, 2)
device = torch.device('cuda')
model = model.to(device)

optimizer = optim.SGD(model.parameters(), lr=0.001, momentum=0.9)

for epoch in range(NUM_EPOCHS):
    # Huấn luyện và tính loss bằng CrossEntropy
    # Cập nhật Bokeh data source:
    new_data1 = {'epochs': [epoch+1], 'trainlosses': [float(train_loss)], 'testlosses': [float(test_loss)]}
    source1.stream(new_data1)
    new_data2 = {'epochs': [epoch+1], 'train_accuracies': [float(train_accuracy)], 'test_accuracies': [float(test_accuracy)]}
    source2.stream(new_data2)
    push_notebook(handle=handle)
    
    if test_accuracy > best_accuracy:
        torch.save(model.state_dict(), 'best_model.pth')
        best_accuracy = test_accuracy`
      }
    ],
    hardwareRequirements: ['Môi trường Jupyter Notebook có cài đặt bokeh, GPU CUDA'],
    caveatsAndErrors: [
      'LƯU Ý KỸ THUẬT: Notebook chia test cố định bằng len(dataset) - 50, 50. Nếu tập dữ liệu thu thập được ít hơn 50 ảnh, lệnh random_split sẽ báo lỗi âm số mẫu!',
      'AlexNet có số lượng tham số lớn ở các lớp fully connected (classifier), tiêu tốn nhiều bộ nhớ RAM hơn ResNet18.'
    ],
    simulationFeature: 'Bảng điều khiển đồ thị Bokeh mô phỏng các đường cong Loss và Accuracy, cho phép soi từng điểm Epoch và so sánh train/test.'
  },
  {
    id: 'train_model_resnet18',
    number: 6,
    nameVi: 'Huấn Luyện Tránh Va Chạm Với ResNet18',
    notebookName: 'train_model_resnet18.ipynb',
    category: 'collision-avoidance',
    categoryNameVi: 'Huấn luyện tránh va chạm',
    taskTypeVi: 'Phân loại ảnh (Classification)',
    targetGoalVi: 'Huấn luyện bài toán phân loại free/blocked nhưng dùng kiến trúc ResNet18 hiện đại hơn với kết nối tắt Residual Connection.',
    descriptionVi: 'Cùng bài toán phân loại tránh va chạm như notebook số 5, nhưng thay thế AlexNet bằng ResNet18. ResNet18 sử dụng Residual Blocks giúp giải quyết triệt để hiện tượng tiêu biến đạo hàm (vanishing gradient), lớp cuối fc chỉ gồm Linear(512, 2) gọn gàng và nhẹ hơn AlexNet.',
    dataFlow: {
      input: 'Thư mục dataset/ chứa ảnh free/ và blocked/',
      process: 'ImageFolder; ResNet18 thay model.fc = Linear(512, 2); SGD optimizer lr=0.001 momentum=0.9; 30 epochs',
      output: 'best_model_resnet18.pth'
    },
    keyFunctions: [
      'models.resnet18(pretrained=True)',
      'model.fc = torch.nn.Linear(512, 2)',
      'F.cross_entropy(outputs, labels)',
      'torch.save(model.state_dict(), "best_model_resnet18.pth")'
    ],
    codeSnippets: [
      {
        language: 'python',
        captionVi: 'Cấu hình ResNet18 cho phân loại 2 lớp (Cell 15-21)',
        code: `model = models.resnet18(pretrained=True)

# Lớp fc ban đầu có out_features=1000 (ImageNet), thay thành 2
model.fc = torch.nn.Linear(512, 2)
device = torch.device('cuda')
model = model.to(device)

NUM_EPOCHS = 30
BEST_MODEL_PATH = 'best_model_resnet18.pth'
best_accuracy = 0.0

optimizer = optim.SGD(model.parameters(), lr=0.001, momentum=0.9)`
      }
    ],
    hardwareRequirements: ['GPU CUDA', 'Tập dữ liệu tối thiểu > 50 ảnh'],
    caveatsAndErrors: [
      'Tên file lưu mô hình là best_model_resnet18.pth, khác với best_model.pth (AlexNet) và best_steering_model_xy.pth (bám đường).',
      'Vẫn giữ nguyên cảnh báo chia tập test cố định 50 ảnh giống notebook 5.'
    ],
    simulationFeature: 'Bảng đối chiếu so sánh trực quan giữa AlexNet và ResNet18 về kiến trúc, lớp thay thế và bộ nhớ chiếm dụng.'
  },
  {
    id: 'live_demo',
    number: 7,
    nameVi: 'Demo AI Bám Đường Trực Tiếp (PyTorch)',
    notebookName: 'live_demo.ipynb',
    category: 'road-following',
    categoryNameVi: 'Demo AI bám đường',
    taskTypeVi: 'Hồi quy tọa độ (Regression)',
    targetGoalVi: 'Nạp mô hình ResNet18 đã huấn luyện, thực thi suy luận nửa độ chính xác (FP16 half-precision) trên khung hình camera, chuyển đổi tọa độ dự đoán thành góc lái và điều khiển 2 động cơ qua thuật toán PD.',
    descriptionVi: 'Quy trình khép kín từ nhận thức tới hành động: Khung camera được tiền xử lý (HWC -> CHW, chuẩn hóa mean/std, đưa lên GPU dạng half precision). Mô hình xuất ra [x, y]. Logic điều khiển tính góc: angle = np.arctan2(x, y), áp dụng bộ điều khiển vi sai tỷ lệ PD (steering_gain * angle + steering_dgain * d_angle + bias) để sinh ra lệnh vi sai cho hai động cơ trái và phải.',
    dataFlow: {
      input: 'Khung ảnh camera liên tục từ Camera()',
      process: 'preprocess(image); ResNet18.eval().half(); arctan2(x, y); PD controller; motor vi sai: left = speed + steering, right = speed - steering',
      output: 'robot.left_motor.value, robot.right_motor.value liên tục'
    },
    keyFunctions: [
      'model.eval().half()',
      'preprocess(image)',
      'np.arctan2(x, y)',
      'camera.observe(execute, names="value")',
      'camera.unobserve(execute, names="value")',
      'robot.stop()'
    ],
    codeSnippets: [
      {
        language: 'python',
        captionVi: 'Tiền xử lý ảnh và thuật toán điều khiển vi sai PD (Cell 13 & 23)',
        code: `mean = torch.Tensor([0.485, 0.456, 0.406]).cuda().half()
std = torch.Tensor([0.229, 0.224, 0.225]).cuda().half()

def preprocess(image):
    image = PIL.Image.fromarray(image)
    image = transforms.functional.to_tensor(image).to(device).half()
    image.sub_(mean[:, None, None]).div_(std[:, None, None])
    return image[None, ...]

def execute(change):
    global angle, angle_last
    image = change['new']
    xy = model(preprocess(image)).detach().float().cpu().numpy().flatten()
    x = xy[0]
    y = (0.5 - xy[1]) / 2.0
    
    # Tính góc hướng tới mục tiêu
    angle = np.arctan2(x, y)
    pid = angle * steering_gain_slider.value + (angle - angle_last) * steering_dgain_slider.value
    angle_last = angle
    steering = pid + steering_bias_slider.value
    
    # Điều khiển vi sai cho 2 bánh xe (giới hạn tốc độ trong khoảng [0.0, 1.0])
    robot.left_motor.value = max(min(speed_slider.value + steering, 1.0), 0.0)
    robot.right_motor.value = max(min(speed_slider.value - steering, 1.0), 0.0)`
      }
    ],
    hardwareRequirements: ['JetBot hoàn chỉnh có pin đầy, vạch đường thử nghiệm an toàn'],
    caveatsAndErrors: [
      'Không được quên camera.unobserve(execute) trước khi dừng, nếu không callback sẽ tiếp tục chạy ngầm trong background và làm treo kernel.',
      'Nếu JetBot bị lắc lư hình sin (lắc qua lắc lại liên tục), cần giảm steering_gain hoặc tăng steering_kd để triệt tiêu dao động.'
    ],
    simulationFeature: 'Mô phỏng bám đường tương tác với các thanh trượt Speed Gain, Steering Gain, Kd và Steering Bias; xem phản ứng bẻ lái của xe.'
  },
  {
    id: 'live_demo_build_trt',
    number: 8,
    nameVi: 'Biên Dịch TensorRT Bám Đường (Build Engine)',
    notebookName: 'live_demo_build_trt.ipynb',
    category: 'tensorrt-optimization',
    categoryNameVi: 'Tối ưu hóa TensorRT',
    taskTypeVi: 'Biên dịch tối ưu (Engine Build)',
    targetGoalVi: 'Sử dụng thư viện torch2trt của NVIDIA để tối ưu hóa đồ thị tính toán và các kernel CUDA của mô hình bám đường ResNet18 ở chế độ FP16.',
    descriptionVi: 'TensorRT là framework tối ưu hóa suy luận hiệu năng cao của NVIDIA. Bước build engine này nạp checkpoint best_steering_model_xy.pth, truyền một tensor mẫu dummy shape (1, 3, 224, 224) qua thư viện torch2trt. TensorRT sẽ hợp nhất các lớp (Layer Fusion), chọn kernel GPU tối ưu nhất và nén độ chính xác sang số thực 16-bit (FP16 mode) giúp tăng tốc độ FPS rõ rệt trên Jetson Nano.',
    dataFlow: {
      input: 'Mô hình PyTorch ResNet18 + checkpoint best_steering_model_xy.pth + tensor mẫu (1, 3, 224, 224)',
      process: 'torch2trt(model, [data], fp16_mode=True) phân tích đồ thị và biên dịch',
      output: 'Tệp trọng số động cơ TensorRT: best_steering_model_xy_trt.pth'
    },
    keyFunctions: [
      'from torch2trt import torch2trt',
      'data = torch.zeros((1, 3, 224, 224)).cuda().half()',
      'model_trt = torch2trt(model, [data], fp16_mode=True)',
      'torch.save(model_trt.state_dict(), "best_steering_model_xy_trt.pth")'
    ],
    codeSnippets: [
      {
        language: 'python',
        captionVi: 'Biên dịch mô hình bám đường sang TensorRT engine (Cell 13 & 15)',
        code: `from torch2trt import torch2trt

# Dữ liệu giả lập đầu vào để TensorRT định hình kích thước tensor
data = torch.zeros((1, 3, 224, 224)).cuda().half()

# Biên dịch với chế độ nửa độ chính xác FP16
model_trt = torch2trt(model, [data], fp16_mode=True)

# Lưu state dict của engine đã tối ưu hóa
torch.save(model_trt.state_dict(), 'best_steering_model_xy_trt.pth')`
      }
    ],
    hardwareRequirements: ['GPU NVIDIA với TensorRT và gói torch2trt được biên dịch đúng phiên bản JetPack'],
    caveatsAndErrors: [
      'Quá trình torch2trt build engine có thể mất từ 2-5 phút trên Jetson Nano, trong lúc chạy CPU/GPU sẽ lên 100%. Không tắt kernel giữa chừng.',
      'TensorRT engine phụ thuộc chặt chẽ vào kiến trúc GPU phần cứng và phiên bản CUDA/TensorRT cụ thể: không thể mang file build từ máy khác sang nếu khác phiên bản JetPack.'
    ],
    simulationFeature: 'Sơ đồ giải thích cơ chế Layer Fusion và Quantization FP16 của TensorRT so với PyTorch tiêu chuẩn.'
  },
  {
    id: 'live_demo_trt',
    number: 9,
    nameVi: 'Demo AI Bám Đường Bằng TensorRT (Suy Luận Nhanh)',
    notebookName: 'live_demo_trt.ipynb',
    category: 'tensorrt-optimization',
    categoryNameVi: 'Tối ưu hóa TensorRT',
    taskTypeVi: 'Suy luận tối ưu (Inference)',
    targetGoalVi: 'Nạp mô hình đã biên dịch TensorRT thông qua lớp bao TRTModule để suy luận thời gian thực với độ trễ siêu thấp và FPS cao.',
    descriptionVi: 'Notebook này có logic điều khiển bám đường tương tự live_demo.ipynb, nhưng thay thế hoàn toàn mô hình PyTorch thuần bằng TRTModule nạp từ best_steering_model_xy_trt.pth. Nhờ tối ưu hóa của TensorRT, thời gian suy luận giảm đáng kể (từ ~40ms xuống ~10-15ms trên Jetson Nano), giúp robot phản ứng kịp thời ở các khúc cua gắt.',
    dataFlow: {
      input: 'Ảnh từ Camera, nạp checkpoint best_steering_model_xy_trt.pth',
      process: 'model_trt = TRTModule(); model_trt(preprocess(image)); tính arctan2 và điều khiển PD',
      output: 'Lệnh điều khiển 2 motor vi sai với tần số phản hồi khung hình cao'
    },
    keyFunctions: [
      'from torch2trt import TRTModule',
      'model_trt = TRTModule()',
      'model_trt.load_state_dict(torch.load("best_steering_model_xy_trt.pth"))',
      'camera.observe(execute, names="value")'
    ],
    codeSnippets: [
      {
        language: 'python',
        captionVi: 'Nạp mô hình TRTModule và thực thi suy luận (Cell 5 & 19)',
        code: `from torch2trt import TRTModule

model_trt = TRTModule()
model_trt.load_state_dict(torch.load('best_steering_model_xy_trt.pth'))

def execute(change):
    global angle, angle_last
    image = change['new']
    # Thực thi qua engine TensorRT tối ưu tốc độ
    xy = model_trt(preprocess(image)).detach().float().cpu().numpy().flatten()
    x = xy[0]
    y = (0.5 - xy[1]) / 2.0
    
    angle = np.arctan2(x, y)
    pid = angle * steering_gain_slider.value + (angle - angle_last) * steering_dgain_slider.value
    angle_last = angle
    steering_slider.value = pid + steering_bias_slider.value
    
    robot.left_motor.value = max(min(speed_slider.value + steering_slider.value, 1.0), 0.0)
    robot.right_motor.value = max(min(speed_slider.value - steering_slider.value, 1.0), 0.0)`
      }
    ],
    hardwareRequirements: ['JetBot chạy TensorRT và file engine đã build'],
    caveatsAndErrors: [
      'Phải nạp file best_steering_model_xy_trt.pth bằng TRTModule, không dùng torchvision.models.resnet18 để load file TRT.',
      'Cần đảm bảo dữ liệu đầu vào có đúng kích thước (1, 3, 224, 224) và kiểu dữ liệu half() như lúc build.'
    ],
    simulationFeature: 'Bộ so sánh thời gian đáp ứng giữa PyTorch thông thường và TensorRT trong điều kiện mô phỏng.'
  },
  {
    id: 'live_demo_resnet18',
    number: 10,
    nameVi: 'Demo Tránh Va Chạm Trực Tiếp (ResNet18)',
    notebookName: 'live_demo_resnet18.ipynb',
    category: 'collision-avoidance',
    categoryNameVi: 'Demo tránh va chạm',
    taskTypeVi: 'Phân loại ảnh (Classification)',
    targetGoalVi: 'Nạp mô hình ResNet18 phân loại 2 lớp, áp dụng hàm Softmax để tính xác suất bị chặn (prob_blocked), điều khiển robot đi thẳng hoặc rẽ trái tránh vật cản.',
    descriptionVi: 'Mô hình nhận khung hình 224x224, xuất ra logits 2 lớp. Hàm F.softmax chuẩn hóa ngõ ra thành phân phối xác suất. Nếu prob_blocked < 0.5 (đường thoáng): robot.forward(speed); nếu prob_blocked >= 0.5 (bị chặn): robot.left(speed) để quay đầu tìm lối thoát.',
    dataFlow: {
      input: 'Khung ảnh camera liên tục, trọng số best_model_resnet18.pth',
      process: 'preprocess(x); model(x); F.softmax(y, dim=1); đọc prob_blocked; so sánh ngưỡng 0.5',
      output: 'robot.forward(speed) hoặc robot.left(speed)'
    },
    keyFunctions: [
      'model.load_state_dict(torch.load("best_model_resnet18.pth"))',
      'F.softmax(y, dim=1)',
      'prob_blocked = float(y.flatten()[0])',
      'robot.forward(speed)',
      'robot.left(speed)',
      'camera.observe(update, names="value")'
    ],
    codeSnippets: [
      {
        language: 'python',
        captionVi: 'Logic ra quyết định tránh va chạm (Cell 13)',
        code: `def update(change):
    global blocked_slider, robot
    x = change['new'] 
    x = preprocess(x)
    y = model(x)
    
    # Softmax chuẩn hóa vector đầu ra về dạng xác suất tổng bằng 1.0
    y = F.softmax(y, dim=1)
    prob_blocked = float(y.flatten()[0])
    blocked_slider.value = prob_blocked
    
    # Quyết định hành vi robot:
    if prob_blocked < 0.5:
        robot.forward(speed_slider.value)
    else:
        robot.left(speed_slider.value)
    time.sleep(0.001)`
      }
    ],
    hardwareRequirements: ['JetBot có cảm biến camera phía trước, sàn nhà có chướng ngại vật'],
    caveatsAndErrors: [
      'Chỉ số y.flatten()[0] tương ứng với lớp bị chặn nếu thư mục lớp đầu tiên trong ImageFolder là "blocked" theo bảng chữ cái. Cần kiểm tra đúng thứ tự class_to_idx.',
      'Hành vi chỉ rẽ trái (robot.left) là một chiến lược tránh né cơ bản; robot có thể bị kẹt trong góc nhọn hoặc góc tường nếu không có cảm biến phụ.'
    ],
    simulationFeature: 'Bộ chọn cảnh mô phỏng (Đường thoáng / Vật cản Lego trước mặt / Góc tường) xem xác suất prob_blocked và quyết định rẽ của robot.'
  },
  {
    id: 'live_demo_resnet18_build_trt',
    number: 11,
    nameVi: 'Biên Dịch TensorRT Tránh Va Chạm (Build Engine)',
    notebookName: 'live_demo_resnet18_build_trt.ipynb',
    category: 'tensorrt-optimization',
    categoryNameVi: 'Tối ưu hóa TensorRT',
    taskTypeVi: 'Biên dịch tối ưu (Engine Build)',
    targetGoalVi: 'Biên dịch mô hình phân loại tránh va chạm ResNet18 thành engine TensorRT FP16 với tên file đích best_model_trt.pth.',
    descriptionVi: 'Tương tự như bước build TRT bám đường, nhưng áp dụng cho mô hình phân loại 2 lớp từ best_model_resnet18.pth. File engine xuất ra là best_model_trt.pth (lưu ý phân biệt rõ với best_steering_model_xy_trt.pth của nhánh bám đường).',
    dataFlow: {
      input: 'best_model_resnet18.pth, tensor dummy torch.zeros((1, 3, 224, 224)).cuda().half()',
      process: 'torch2trt(model, [data], fp16_mode=True)',
      output: 'best_model_trt.pth'
    },
    keyFunctions: [
      'from torch2trt import torch2trt',
      'torch.save(model_trt.state_dict(), "best_model_trt.pth")'
    ],
    codeSnippets: [
      {
        language: 'python',
        captionVi: 'Biên dịch ResNet18 phân loại sang TensorRT (Cell 8 & 10)',
        code: `from torch2trt import torch2trt

data = torch.zeros((1, 3, 224, 224)).cuda().half()
model_trt = torch2trt(model, [data], fp16_mode=True)

# Lưu ý tên file cho nhánh tránh va chạm: best_model_trt.pth
torch.save(model_trt.state_dict(), 'best_model_trt.pth')`
      }
    ],
    hardwareRequirements: ['Jetson Nano / GPU NVIDIA hỗ trợ TensorRT'],
    caveatsAndErrors: [
      'Tuyệt đối không nhầm lẫn giữa 2 file: best_model_trt.pth (tránh va chạm) và best_steering_model_xy_trt.pth (bám đường) vì kiến trúc đầu ra khác nhau.'
    ],
    simulationFeature: 'Bảng minh họa quy trình nén mô hình FP32 sang FP16 và cắt tỉa đồ thị tính toán.'
  },
  {
    id: 'live_demo_resnet18_trt',
    number: 12,
    nameVi: 'Demo Tránh Va Chạm Bằng TensorRT (Suy Luận Nhanh)',
    notebookName: 'live_demo_resnet18_trt.ipynb',
    category: 'tensorrt-optimization',
    categoryNameVi: 'Tối ưu hóa TensorRT',
    taskTypeVi: 'Suy luận tối ưu (Inference)',
    targetGoalVi: 'Nạp mô hình TRTModule từ best_model_trt.pth để chạy phân loại tránh va chạm thời gian thực ở tốc độ khung hình cao nhất.',
    descriptionVi: 'Kết hợp TRTModule với camera và driver động cơ để robot phản ứng né vật cản gần như tức thì khi xuất hiện vật chắn trước ống kính. Thử nghiệm trên Jetson Nano cho thấy FPS tăng từ ~18 FPS lên ~45+ FPS.',
    dataFlow: {
      input: 'Khung ảnh camera CSI, nạp best_model_trt.pth',
      process: 'model_trt(x); Softmax; đánh giá prob_blocked; phát lệnh robot.forward hoặc robot.left',
      output: 'Chuyển động linh hoạt của robot tránh va chạm'
    },
    keyFunctions: [
      'from torch2trt import TRTModule',
      'model_trt.load_state_dict(torch.load("best_model_trt.pth"))',
      'camera.observe(update, names="value")'
    ],
    codeSnippets: [
      {
        language: 'python',
        captionVi: 'Suy luận thời gian thực với TRTModule (Cell 4 & 12)',
        code: `from torch2trt import TRTModule

model_trt = TRTModule()
model_trt.load_state_dict(torch.load('best_model_trt.pth'))

def update(change):
    global blocked_slider, robot
    x = change['new'] 
    x = preprocess(x)
    y = model_trt(x)
    y = F.softmax(y, dim=1)
    
    prob_blocked = float(y.flatten()[0])
    blocked_slider.value = prob_blocked
    
    if prob_blocked < 0.5:
        robot.forward(speed_slider.value)
    else:
        robot.left(speed_slider.value)
    time.sleep(0.001)`
      }
    ],
    hardwareRequirements: ['JetBot với mô hình TRT đã biên dịch'],
    caveatsAndErrors: [
      'Khi robot chạy tốc độ cao nhờ TensorRT phản ứng nhanh, cần chú ý không gian thử nghiệm đủ rộng để tránh văng khỏi bàn học.',
      'Cần có nút robot.stop() và camera.unobserve() khẩn cấp.'
    ],
    simulationFeature: 'Chế độ mô phỏng trực tiếp với đo đạc độ trễ giả lập (Latency benchmark) so sánh giữa PyTorch và TensorRT.'
  }
];
