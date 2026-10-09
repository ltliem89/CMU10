import { FunctionEntry } from '../types/jetbot';

export const functionsData: FunctionEntry[] = [
  {
    id: 'jetbot-robot',
    name: 'Robot()',
    kind: 'class',
    group: 'motor',
    groupNameVi: 'Động cơ & Robot',
    moduleIds: ['teleoperation', 'live_demo', 'live_demo_trt', 'live_demo_resnet18', 'live_demo_resnet18_trt'],
    sourceNotebooks: ['teleoperation.ipynb', 'live_demo.ipynb', 'live_demo_trt.ipynb', 'live_demo_resnet18.ipynb', 'live_demo_resnet18_trt.ipynb'],
    summaryVi: 'Lớp cốt lõi trong gói jetbot để khởi tạo và điều khiển hai động cơ robot vi sai.',
    explanationVi: 'Đối tượng Robot() giao tiếp với mạch driver điều khiển động cơ (thường là PCA9685 PWM qua I2C và cầu H TB6612FNG trên JetBot). Cung cấp các thuộc tính left_motor, right_motor cũng như các hàm tiện ích robot.forward(speed), robot.left(speed), robot.stop().',
    syntax: 'robot = Robot()',
    inputs: ['Không có đối số bắt buộc (sử dụng cấu hình mặc định I2C bus 1)'],
    outputs: ['Instance của lớp Robot'],
    codeExample: `from jetbot import Robot
robot = Robot()
robot.forward(0.3)  # Chạy tiến với tốc độ 30%
robot.stop()        # Dừng 2 động cơ ngay lập tức`,
    sourceStatus: 'source-identified',
    cautions: [
      'Không khởi tạo nhiều instance Robot cùng lúc trong nhiều notebook vì sẽ gây tranh chấp I2C bus.',
      'Luôn gọi robot.stop() trước khi tắt ứng dụng.'
    ],
    level: 'basic'
  },
  {
    id: 'jetbot-camera-instance',
    name: 'Camera.instance()',
    kind: 'function',
    group: 'camera',
    groupNameVi: 'Camera & Hình ảnh',
    moduleIds: ['teleoperation', 'live_demo_resnet18', 'live_demo_resnet18_trt'],
    sourceNotebooks: ['teleoperation.ipynb', 'live_demo_resnet18.ipynb', 'live_demo_resnet18_trt.ipynb'],
    summaryVi: 'Tạo hoặc lấy lại thể hiện Singleton dùng chung của camera CSI trên JetBot.',
    explanationVi: 'Sử dụng mẫu Singleton (Mẫu thiết kế một thực thể duy nhất). Nếu camera đã được bật trước đó, hàm trả về đối tượng đang hoạt động mà không mở lại pipeline GStreamer của camera CSI MIPI, tránh lỗi "device or resource busy".',
    syntax: 'camera = Camera.instance(width=224, height=224)',
    inputs: ['width (int, mặc định 224)', 'height (int, mặc định 224)', 'fps (tùy chọn)'],
    outputs: ['Instance dùng chung của lớp Camera'],
    codeExample: `from jetbot import Camera
camera = Camera.instance(width=224, height=224)
# Khung hình BGR8 hiện tại lưu trong camera.value`,
    sourceStatus: 'source-identified',
    cautions: [
      'Cần gọi camera.stop() khi kết thúc bài thực hành để giải phóng sensor CSI.'
    ],
    level: 'basic'
  },
  {
    id: 'jetbot-camera-ctor',
    name: 'Camera()',
    kind: 'class',
    group: 'camera',
    groupNameVi: 'Camera & Hình ảnh',
    moduleIds: ['data_collection', 'data_collection_gamepad', 'live_demo', 'live_demo_trt'],
    sourceNotebooks: ['data_collection.ipynb', 'data_collection_gamepad.ipynb', 'live_demo.ipynb', 'live_demo_trt.ipynb'],
    summaryVi: 'Khởi tạo trực tiếp đối tượng Camera chuẩn trong một số notebook JetBot.',
    explanationVi: 'Khởi động luồng GStreamer nvarguscamerasrc để lấy ảnh từ camera Raspberry Pi Camera V2 kết nối qua cổng CSI MIPI trên Jetson Nano. Kích thước mặc định thường là 224x224 để phù hợp với mạng nơ-ron.',
    syntax: 'camera = Camera()',
    inputs: ['Không có đối số hoặc nhận width, height'],
    outputs: ['Instance mới của Camera'],
    codeExample: `from jetbot import Camera
camera = Camera()
print(camera.value.shape) # (224, 224, 3) BGR8`,
    sourceStatus: 'source-identified',
    cautions: [
      'Khác với Camera.instance(), nếu instance trước chưa stop() thì Camera() có thể ném ngoại lệ camera busy.'
    ],
    level: 'basic'
  },
  {
    id: 'jetbot-bgr8-to-jpeg',
    name: 'bgr8_to_jpeg(...)',
    kind: 'function',
    group: 'vision',
    groupNameVi: 'Xử lý ảnh',
    moduleIds: ['teleoperation', 'data_collection', 'data_collection_gamepad', 'live_demo', 'live_demo_trt', 'live_demo_resnet18', 'live_demo_resnet18_trt'],
    sourceNotebooks: ['teleoperation.ipynb', 'data_collection.ipynb', 'data_collection_gamepad.ipynb', 'live_demo.ipynb'],
    summaryVi: 'Chuyển đổi mảng ảnh NumPy BGR8 thành mảng byte JPEG nén để hiển thị trên web.',
    explanationVi: 'Camera JetBot cung cấp dữ liệu ảnh thô dạng BGR 8-bit (Blue-Green-Red). Tuy nhiên ipywidgets.Image trên trình duyệt chỉ đọc được các định dạng ảnh nén như JPEG hoặc PNG. Hàm này nén ảnh bằng OpenCV (cv2.imencode) sang JPEG byte string.',
    syntax: 'jpeg_bytes = bgr8_to_jpeg(bgr_image, quality=75)',
    inputs: ['bgr_image: NumPy array (H, W, 3) định dạng BGR', 'quality: int (chất lượng JPEG, tùy chọn)'],
    outputs: ['bytes: chuỗi byte ảnh JPEG nén'],
    codeExample: `from jetbot import bgr8_to_jpeg
jpeg_data = bgr8_to_jpeg(camera.value)
image_widget.value = jpeg_data`,
    sourceStatus: 'source-identified',
    cautions: [
      'Chỉ dùng để hiển thị trên UI. Khi đưa vào mô hình PyTorch, dùng trực tiếp tensor/NumPy, không nén JPEG để tránh mất mát chất lượng.'
    ],
    level: 'basic'
  },
  {
    id: 'jetbot-heartbeat',
    name: 'Heartbeat(period=0.5)',
    kind: 'class',
    group: 'system',
    groupNameVi: 'Hệ thống & An toàn',
    moduleIds: ['teleoperation'],
    sourceNotebooks: ['teleoperation.ipynb'],
    summaryVi: 'Bộ giám sát nhịp tim kiểm tra liên tục kết nối giữa trình duyệt web và robot.',
    explanationVi: 'Hoạt động như một cơ chế an toàn Watchdog Timer. Nếu mạng WiFi chập chờn hoặc trình duyệt bị treo quá khoảng thời gian period (0.5 giây), trạng thái chuyển sang Heartbeat.Status.dead, kích hoạt callback ngắt liên kết động cơ và dừng robot an toàn.',
    syntax: 'heartbeat = Heartbeat(period=0.5)',
    inputs: ['period: float (chu kỳ nhịp tim tính bằng giây)'],
    outputs: ['Instance của lớp Heartbeat'],
    codeExample: `from jetbot import Heartbeat
heartbeat = Heartbeat(period=0.5)
heartbeat.observe(handle_heartbeat_status, names='status')`,
    sourceStatus: 'source-identified',
    cautions: [
      'Đây là cơ chế mẫu phía phần mềm trong notebook. Trong công nghiệp, cần watchdog phần cứng ở cấp độ vi điều khiển.'
    ],
    level: 'intermediate'
  },
  {
    id: 'traitlets-dlink',
    name: 'traitlets.dlink(...)',
    kind: 'function',
    group: 'system',
    groupNameVi: 'Hệ thống & An toàn',
    moduleIds: ['teleoperation', 'data_collection', 'data_collection_gamepad', 'live_demo', 'live_demo_resnet18'],
    sourceNotebooks: ['teleoperation.ipynb', 'data_collection.ipynb', 'live_demo.ipynb'],
    summaryVi: 'Liên kết một chiều có phép biến đổi giữa thuộc tính nguồn và thuộc tính đích trong IPython.',
    explanationVi: 'Directional Link (dlink) thiết lập phản ứng tự động: mỗi khi giá trị ở tuple nguồn (source, "value") thay đổi, giá trị lập tức được truyền qua hàm biến đổi (transform) và ghi đè vào tuple đích (target, "value").',
    syntax: 'link = traitlets.dlink((source, "value"), (target, "value"), transform=func)',
    inputs: ['source tuple: (object, "attr_name")', 'target tuple: (object, "attr_name")', 'transform (callable, tùy chọn)'],
    outputs: ['Đối tượng Link có phương thức .unlink()'],
    codeExample: `import traitlets
left_link = traitlets.dlink(
    (controller.axes[1], 'value'),
    (robot.left_motor, 'value'),
    transform=lambda x: -x
)
# Khi muốn ngắt kết nối:
left_link.unlink()`,
    sourceStatus: 'source-identified',
    cautions: [
      'Không gọi dlink nhiều lần cho cùng một nguồn/đích mà không unlink, sẽ gây ra nhân đôi lệnh điều khiển.'
    ],
    level: 'intermediate'
  },
  {
    id: 'clickable-image-widget',
    name: 'ClickableImageWidget',
    kind: 'class',
    group: 'vision',
    groupNameVi: 'Xử lý ảnh',
    moduleIds: ['data_collection'],
    sourceNotebooks: ['data_collection.ipynb'],
    summaryVi: 'Widget ảnh tương tác trong Jupyter cho phép bắt tọa độ pixel khi người dùng nhấp chuột.',
    explanationVi: 'Thành phần mở rộng từ thư viện jupyter_clickable_image_widget. Khi click vào ảnh, widget phát ra sự kiện on_msg chứa eventData với offsetX và offsetY tính bằng pixel từ góc trên-trái.',
    syntax: 'camera_widget = ClickableImageWidget(width=224, height=224)',
    inputs: ['width (int)', 'height (int)'],
    outputs: ['Widget hiển thị ảnh có khả năng nhận click chuột'],
    codeExample: `camera_widget = ClickableImageWidget(width=224, height=224)
def save_snapshot(_, content, msg):
    if content['event'] == 'click':
        x = content['eventData']['offsetX']
        y = content['eventData']['offsetY']
camera_widget.on_msg(save_snapshot)`,
    sourceStatus: 'source-identified',
    cautions: [
      'Yêu cầu cài đặt jupyter_clickable_image_widget trong môi trường JupyterLab.'
    ],
    level: 'intermediate'
  },
  {
    id: 'xy-dataset',
    name: 'XYDataset',
    kind: 'class',
    group: 'dataset',
    groupNameVi: 'Tập dữ liệu & Tiền xử lý',
    moduleIds: ['train_model'],
    sourceNotebooks: ['train_model.ipynb'],
    summaryVi: 'Lớp Dataset tùy chỉnh kế thừa từ torch.utils.data.Dataset để tải ảnh và nhãn tọa độ X/Y.',
    explanationVi: 'Được xây dựng trong notebook train_model.ipynb để đọc các file ảnh từ thư mục dataset_xy. Triển khai __len__ và __getitem__. Tự động phân tích tên file dạng xy_<x>_<y>_<uuid>.jpg qua get_x và get_y, áp dụng lật ngang hflip và ColorJitter, chuẩn hóa ImageNet và trả về (image_tensor, [x, y]).',
    syntax: 'dataset = XYDataset(directory="dataset_xy", random_hflips=False)',
    inputs: ['directory: đường dẫn thư mục ảnh', 'random_hflips: bool (tùy chọn lật ngang)'],
    outputs: ['Instance của XYDataset dùng cho DataLoader'],
    codeExample: `dataset = XYDataset('dataset_xy', random_hflips=True)
image, label = dataset[0]
print(image.shape, label) # torch.Size([3, 224, 224]), tensor([-0.12, 0.45])`,
    sourceStatus: 'source-identified',
    cautions: [
      'Khi random_hflips=True, BẮT BUỘC phải đổi dấu nhãn tọa độ x = -x tương ứng với ảnh bị lật.'
    ],
    level: 'advanced'
  },
  {
    id: 'get-x-get-y',
    name: 'get_x(path, width) / get_y(path, height)',
    kind: 'function',
    group: 'dataset',
    groupNameVi: 'Tập dữ liệu & Tiền xử lý',
    moduleIds: ['train_model'],
    sourceNotebooks: ['train_model.ipynb'],
    summaryVi: 'Hàm giải mã tọa độ pixel từ tên file ảnh và chuẩn hóa về khoảng [-1.0, 1.0].',
    explanationVi: 'Tên file lưu trong dataset có định dạng xy_<x_px>_<y_px>_<uuid>.jpg. get_x tách chuỗi "_" lấy phần tử thứ 1, trừ đi width/2 và chia cho width/2 để đưa về khoảng đối xứng [-1.0, 1.0]. get_y thực hiện tương tự cho trục tung.',
    syntax: 'x = get_x(path, width); y = get_y(path, height)',
    inputs: ['path: chuỗi tên file', 'width/height: kích thước ảnh (224)'],
    outputs: ['float: giá trị tọa độ chuẩn hóa [-1.0, 1.0]'],
    codeExample: `def get_x(path, width):
    return (float(int(path.split("_")[1])) - width/2) / (width/2)

def get_y(path, height):
    return (float(int(path.split("_")[2])) - height/2) / (height/2)`,
    sourceStatus: 'source-identified',
    cautions: [
      'Quy ước tên file phải tuyệt đối đúng định dạng xy_%03d_%03d_%s.'
    ],
    level: 'intermediate'
  },
  {
    id: 'torchvision-imagefolder',
    name: 'datasets.ImageFolder(...)',
    kind: 'class',
    group: 'dataset',
    groupNameVi: 'Tập dữ liệu & Tiền xử lý',
    moduleIds: ['train_model_plot', 'train_model_resnet18'],
    sourceNotebooks: ['train_model_plot.ipynb', 'train_model_resnet18.ipynb'],
    summaryVi: 'Trình nạp dữ liệu phân loại mặc định của PyTorch theo cấu trúc thư mục.',
    explanationVi: 'Đọc dữ liệu từ cấu trúc thư mục dạng root/class_name/xxx.jpg. Tự động gán nhãn số (0, 1) cho các thư mục (ở đây là free và blocked theo thứ tự từ điển), áp dụng các biến đổi transforms.Compose.',
    syntax: 'dataset = datasets.ImageFolder("dataset", transform=transforms_compose)',
    inputs: ['root: đường dẫn thư mục gốc', 'transform: pipeline biến đổi ảnh'],
    outputs: ['PyTorch Dataset'],
    codeExample: `dataset = datasets.ImageFolder(
    'dataset',
    transforms.Compose([
        transforms.ColorJitter(0.1, 0.1, 0.1, 0.1),
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
)`,
    sourceStatus: 'source-identified',
    cautions: [
      'Thứ tự class_to_idx phụ thuộc tên thư mục. Đảm bảo lớp blocked ứng với đầu ra mong muốn trong mã suy luận.'
    ],
    level: 'intermediate'
  },
  {
    id: 'resnet18-model',
    name: 'models.resnet18(pretrained=True/False)',
    kind: 'function',
    group: 'training',
    groupNameVi: 'Huấn luyện & Học sâu',
    moduleIds: ['train_model', 'train_model_resnet18', 'live_demo', 'live_demo_build_trt', 'live_demo_resnet18', 'live_demo_resnet18_build_trt'],
    sourceNotebooks: ['train_model.ipynb', 'train_model_resnet18.ipynb', 'live_demo.ipynb', 'live_demo_build_trt.ipynb'],
    summaryVi: 'Khởi tạo mạng Residual Network 18 tầng từ thư viện torchvision.models.',
    explanationVi: 'ResNet18 sử dụng các khối liên kết tắt (skip connection / residual block) gồm 18 tầng có trọng số. Trong các bài toán JetBot, pretrained=True được dùng khi huấn luyện để tận dụng trọng số ImageNet (Transfer Learning). Khi suy luận, dùng pretrained=False rồi nạp checkpoint qua load_state_dict.',
    syntax: 'model = models.resnet18(pretrained=True)',
    inputs: ['pretrained: bool (True nạp trọng số ImageNet, False tạo ngẫu nhiên)'],
    outputs: ['PyTorch nn.Module'],
    codeExample: `model = models.resnet18(pretrained=True)
# Thay lớp cuối cùng:
model.fc = torch.nn.Linear(512, 2)
model = model.to(torch.device('cuda'))`,
    sourceStatus: 'source-identified',
    cautions: [
      'Ở các phiên bản torchvision mới, tham số pretrained bị deprecated và thay bằng weights=ResNet18_Weights.DEFAULT. Cần lưu ý khi chạy trên môi trường mới.'
    ],
    level: 'intermediate'
  },
  {
    id: 'alexnet-model',
    name: 'models.alexnet(pretrained=True)',
    kind: 'function',
    group: 'training',
    groupNameVi: 'Huấn luyện & Học sâu',
    moduleIds: ['train_model_plot'],
    sourceNotebooks: ['train_model_plot.ipynb'],
    summaryVi: 'Khởi tạo mạng AlexNet cổ điển cho bài toán phân loại tránh va chạm.',
    explanationVi: 'AlexNet gồm 5 lớp tích chập Conv và 3 lớp Fully Connected lớn (classifier[6]). Trong notebook train_model_plot.ipynb, lớp model.classifier[6] được thay bằng Linear(in_features, 2).',
    syntax: 'model = models.alexnet(pretrained=True)',
    inputs: ['pretrained: bool'],
    outputs: ['PyTorch nn.Module AlexNet'],
    codeExample: `model = models.alexnet(pretrained=True)
model.classifier[6] = torch.nn.Linear(model.classifier[6].in_features, 2)
model = model.to(torch.device('cuda'))`,
    sourceStatus: 'source-identified',
    cautions: [
      'AlexNet có số tham số lớn hơn ResNet18 ở phần classifier (hơn 50M tham số), tốn bộ nhớ GPU hơn.'
    ],
    level: 'intermediate'
  },
  {
    id: 'torch-device-cuda',
    name: 'torch.device("cuda")',
    kind: 'function',
    group: 'training',
    groupNameVi: 'Huấn luyện & Học sâu',
    moduleIds: ['train_model', 'train_model_plot', 'train_model_resnet18', 'live_demo', 'live_demo_build_trt', 'live_demo_trt', 'live_demo_resnet18', 'live_demo_resnet18_build_trt', 'live_demo_resnet18_trt'],
    sourceNotebooks: ['train_model.ipynb', 'train_model_plot.ipynb', 'train_model_resnet18.ipynb', 'live_demo.ipynb'],
    summaryVi: 'Chỉ định bộ xử lý đồ họa GPU NVIDIA (CUDA) để tính toán tensor và huấn luyện mạng.',
    explanationVi: 'Các notebook gốc của JetBot đều thiết lập mặc định device = torch.device("cuda"). Thao tác này đưa mô hình và dữ liệu lên bộ nhớ VRAM của GPU, giúp tăng tốc độ xử lý ma trận.',
    syntax: 'device = torch.device("cuda")',
    inputs: ['Chuỗi định danh thiết bị ("cuda" hoặc "cpu")'],
    outputs: ['torch.device'],
    codeExample: `device = torch.device('cuda')
model = model.to(device)
images = images.to(device)`,
    sourceStatus: 'source-identified',
    cautions: [
      'CẢNH BÁO: Sẽ báo lỗi CUDA error hoặc assertion failure nếu môi trường không có GPU NVIDIA hoặc thiếu driver CUDA.'
    ],
    level: 'basic'
  },
  {
    id: 'model-eval-half',
    name: 'model.eval().half()',
    kind: 'function',
    group: 'inference',
    groupNameVi: 'Suy luận & Điều khiển',
    moduleIds: ['live_demo', 'live_demo_build_trt', 'live_demo_resnet18', 'live_demo_resnet18_build_trt'],
    sourceNotebooks: ['live_demo.ipynb', 'live_demo_build_trt.ipynb', 'live_demo_resnet18.ipynb'],
    summaryVi: 'Chuyển mô hình sang chế độ đánh giá và ép kiểu sang số thực 16-bit (FP16).',
    explanationVi: 'eval() tắt Dropout và đóng băng BatchNorm để đảm bảo tính tất định khi dự đoán. half() chuyển đổi toàn bộ trọng số từ FP32 (32-bit float) sang FP16 (half-precision float), giảm một nửa bộ nhớ và tận dụng nhân Tensor Cores/FP16 trên GPU NVIDIA.',
    syntax: 'model = model.eval().half()',
    inputs: ['Không có đối số'],
    outputs: ['Mô hình ở chế độ evaluation và kiểu dữ liệu torch.float16'],
    codeExample: `device = torch.device('cuda')
model = model.to(device)
model = model.eval().half()`,
    sourceStatus: 'source-identified',
    cautions: [
      'Dữ liệu ảnh đầu vào cũng phải ép sang .half() trước khi truyền vào model, nếu không PyTorch sẽ báo lỗi DataType Mismatch.'
    ],
    level: 'advanced'
  },
  {
    id: 'preprocess-func',
    name: 'preprocess(image)',
    kind: 'function',
    group: 'vision',
    groupNameVi: 'Xử lý ảnh',
    moduleIds: ['live_demo', 'live_demo_trt', 'live_demo_resnet18', 'live_demo_resnet18_trt'],
    sourceNotebooks: ['live_demo.ipynb', 'live_demo_trt.ipynb', 'live_demo_resnet18.ipynb', 'live_demo_resnet18_trt.ipynb'],
    summaryVi: 'Pipeline tiền xử lý ảnh camera CSI sang tensor tương thích mạng nơ-ron.',
    explanationVi: 'Thực hiện 4 bước: 1) Chuyển mảng NumPy sang PIL Image. 2) to_tensor() chuyển sang bố cục CHW (Kênh-Cao-Rộng) và chia tỉ lệ [0.0, 1.0]. 3) Chuyển lên GPU và đổi sang half(). 4) Chuẩn hóa trừ mean và chia std của ImageNet. 5) Thêm chiều batch qua [None, ...].',
    syntax: 'tensor = preprocess(camera_numpy_image)',
    inputs: ['image: mảng NumPy ảnh camera (224, 224, 3)'],
    outputs: ['torch.Tensor shape (1, 3, 224, 224) trên GPU FP16'],
    codeExample: `mean = torch.Tensor([0.485, 0.456, 0.406]).cuda().half()
std = torch.Tensor([0.229, 0.224, 0.225]).cuda().half()

def preprocess(image):
    image = PIL.Image.fromarray(image)
    image = transforms.functional.to_tensor(image).to(device).half()
    image.sub_(mean[:, None, None]).div_(std[:, None, None])
    return image[None, ...]`,
    sourceStatus: 'source-identified',
    cautions: [
      'Phép sub_ và div_ thực hiện in-place để tiết kiệm bộ nhớ trên Jetson Nano.'
    ],
    level: 'intermediate'
  },
  {
    id: 'torch2trt-func',
    name: 'torch2trt(...)',
    kind: 'function',
    group: 'tensorrt',
    groupNameVi: 'Tối ưu hóa TensorRT',
    moduleIds: ['live_demo_build_trt', 'live_demo_resnet18_build_trt'],
    sourceNotebooks: ['live_demo_build_trt.ipynb', 'live_demo_resnet18_build_trt.ipynb'],
    summaryVi: 'Hàm chuyển đổi mô hình PyTorch sang TensorRT Engine của thư viện torch2trt.',
    explanationVi: 'Nhận mô hình PyTorch đã nạp trọng số và một list chứa tensor mẫu đại diện cho đầu vào. Thư viện phân tích cấu trúc đồ thị tính toán (Computational Graph), dịch các toán tử sang TensorRT IExecutionContext và tối ưu hóa kernel CUDA với cờ fp16_mode=True.',
    syntax: 'model_trt = torch2trt(model, [data], fp16_mode=True)',
    inputs: ['model: mô hình PyTorch', '[data]: danh sách tensor mẫu đầu vào', 'fp16_mode: bool (bật chế độ FP16)'],
    outputs: ['TRTModule: đối tượng engine TensorRT'],
    codeExample: `from torch2trt import torch2trt

data = torch.zeros((1, 3, 224, 224)).cuda().half()
model_trt = torch2trt(model, [data], fp16_mode=True)
torch.save(model_trt.state_dict(), 'best_steering_model_xy_trt.pth')`,
    sourceStatus: 'source-identified',
    cautions: [
      'Quá trình biên dịch mất vài phút trên Jetson Nano. Cần cài đặt gói torch2trt từ mã nguồn GitHub của NVIDIA AI IOT.'
    ],
    level: 'advanced'
  },
  {
    id: 'trt-module',
    name: 'TRTModule()',
    kind: 'class',
    group: 'tensorrt',
    groupNameVi: 'Tối ưu hóa TensorRT',
    moduleIds: ['live_demo_trt', 'live_demo_resnet18_trt'],
    sourceNotebooks: ['live_demo_trt.ipynb', 'live_demo_resnet18_trt.ipynb'],
    summaryVi: 'Lớp wrapper của torch2trt giúp nạp và thực thi engine TensorRT như một nn.Module PyTorch thông thường.',
    explanationVi: 'Cho phép lập trình viên gọi model_trt(x) hoàn toàn giống như một mạng PyTorch nhưng bên dưới mã nguồn là engine TensorRT C++ tốc độ cao đã được nạp từ state dict.',
    syntax: 'model_trt = TRTModule(); model_trt.load_state_dict(torch.load("xxx_trt.pth"))',
    inputs: ['Không có đối số khởi tạo'],
    outputs: ['Instance của TRTModule sẵn sàng suy luận'],
    codeExample: `from torch2trt import TRTModule
model_trt = TRTModule()
model_trt.load_state_dict(torch.load('best_steering_model_xy_trt.pth'))
outputs = model_trt(input_tensor)`,
    sourceStatus: 'source-identified',
    cautions: [
      'Chỉ nạp được các file checkpoint đã được sinh ra bởi torch2trt.'
    ],
    level: 'advanced'
  },
  {
    id: 'f-softmax',
    name: 'F.softmax(y, dim=1)',
    kind: 'function',
    group: 'inference',
    groupNameVi: 'Suy luận & Điều khiển',
    moduleIds: ['live_demo_resnet18', 'live_demo_resnet18_trt'],
    sourceNotebooks: ['live_demo_resnet18.ipynb', 'live_demo_resnet18_trt.ipynb'],
    summaryVi: 'Hàm kích hoạt Softmax chuyển đổi vector logits 2 lớp thành phân phối xác suất tổng bằng 1.0.',
    explanationVi: 'Mô hình ResNet18 xuất ra 2 số thực bất kỳ (logits). F.softmax tính hàm mũ và chia cho tổng, biến chúng thành xác suất [prob_blocked, prob_free] nằm trong khoảng [0.0, 1.0].',
    syntax: 'prob_distribution = F.softmax(logits, dim=1)',
    inputs: ['y: Tensor logits đầu ra từ model', 'dim=1: trục phân loại'],
    outputs: ['Tensor xác suất có shape tương đương'],
    codeExample: `import torch.nn.functional as F
y = model(x)
y = F.softmax(y, dim=1)
prob_blocked = float(y.flatten()[0])
if prob_blocked < 0.5:
    robot.forward(0.2)
else:
    robot.left(0.2)`,
    sourceStatus: 'source-identified',
    cautions: [
      'Không áp dụng Softmax trong hàm mất mát khi huấn luyện nếu đã dùng F.cross_entropy vì cross_entropy đã tích hợp sẵn LogSoftmax bên trong.'
    ],
    level: 'intermediate'
  },
  {
    id: 'camera-observe',
    name: 'camera.observe(callback, names="value")',
    kind: 'function',
    group: 'system',
    groupNameVi: 'Hệ thống & An toàn',
    moduleIds: ['live_demo', 'live_demo_trt', 'live_demo_resnet18', 'live_demo_resnet18_trt'],
    sourceNotebooks: ['live_demo.ipynb', 'live_demo_trt.ipynb', 'live_demo_resnet18.ipynb', 'live_demo_resnet18_trt.ipynb'],
    summaryVi: 'Đăng ký hàm xử lý sự kiện (callback) mỗi khi camera có khung hình mới.',
    explanationVi: 'Cơ chế kích hoạt theo sự kiện (Event-driven): mỗi khi luồng camera cập nhật thuộc tính value, callback (ví dụ execute hoặc update) sẽ tự động được gọi với tham số change chứa ảnh mới qua change["new"].',
    syntax: 'camera.observe(callback_function, names="value")',
    inputs: ['callback_function: hàm xử lý nhận đối số change', 'names: chuỗi tên thuộc tính ("value")'],
    outputs: ['Không có'],
    codeExample: `def execute(change):
    image = change['new']
    # Xử lý suy luận và lái xe...

camera.observe(execute, names='value')`,
    sourceStatus: 'source-identified',
    cautions: [
      'BẮT BUỘC phải gọi camera.unobserve(execute, names="value") trước khi dừng robot.'
    ],
    level: 'intermediate'
  },
  {
    id: 'cv2-circle-line',
    name: 'cv2.circle(...) & cv2.line(...)',
    kind: 'function',
    group: 'vision',
    groupNameVi: 'Xử lý ảnh',
    moduleIds: ['data_collection', 'data_collection_gamepad'],
    sourceNotebooks: ['data_collection.ipynb', 'data_collection_gamepad.ipynb'],
    summaryVi: 'Các hàm vẽ đồ họa của OpenCV dùng để trực quan hóa điểm mục tiêu và đường hướng tâm trên ảnh.',
    explanationVi: 'cv2.circle vẽ vòng tròn xanh (0, 255, 0) tại tọa độ điểm đích (x, y) và vòng tròn đỏ (0, 0, 255) tại tâm đáy xe (width/2, height). cv2.line vẽ đường nối màu xanh dương (255, 0, 0) biểu diễn hướng lái mong muốn.',
    syntax: 'cv2.circle(img, center, radius, color, thickness)',
    inputs: ['img: mảng ảnh', 'center: (x, y)', 'radius: bán kính', 'color: BGR tuple', 'thickness: độ dày nét vẽ'],
    outputs: ['Mảng ảnh đã vẽ'],
    codeExample: `image = cv2.circle(image, (x, y), 8, (0, 255, 0), 3)
image = cv2.line(image, (x, y), (widget_width // 2, widget_height), (255, 0, 0), 3)`,
    sourceStatus: 'source-identified',
    cautions: [
      'OpenCV sử dụng thứ tự màu BGR (Blue-Green-Red), khác với RGB của PIL và PyTorch.'
    ],
    level: 'basic'
  },
  {
    id: 'random-split',
    name: 'torch.utils.data.random_split(...)',
    kind: 'function',
    group: 'dataset',
    groupNameVi: 'Tập dữ liệu & Tiền xử lý',
    moduleIds: ['train_model', 'train_model_plot', 'train_model_resnet18'],
    sourceNotebooks: ['train_model.ipynb', 'train_model_plot.ipynb', 'train_model_resnet18.ipynb'],
    summaryVi: 'Chia ngẫu nhiên một dataset thành các tập con (Train và Test/Validation).',
    explanationVi: 'Trong train_model.ipynb dùng tỷ lệ phần trăm (90%-10%). Trong train_model_plot.ipynb và train_model_resnet18.ipynb chia cố định [len(dataset) - 50, 50].',
    syntax: 'train_set, test_set = torch.utils.data.random_split(dataset, lengths)',
    inputs: ['dataset: PyTorch Dataset', 'lengths: list độ dài các tập con'],
    outputs: ['Danh sách các Subset'],
    codeExample: `test_percent = 0.1
num_test = int(test_percent * len(dataset))
train_dataset, test_dataset = torch.utils.data.random_split(
    dataset, [len(dataset) - num_test, num_test]
)`,
    sourceStatus: 'source-identified',
    cautions: [
      'LƯU Ý KỸ THUẬT: Khi chia cố định 50 ảnh test, nếu tổng số ảnh nhỏ hơn 50 sẽ gây crash chương trình.'
    ],
    level: 'intermediate'
  },
  {
    id: 'data-loader',
    name: 'torch.utils.data.DataLoader(...)',
    kind: 'class',
    group: 'training',
    groupNameVi: 'Huấn luyện & Học sâu',
    moduleIds: ['train_model', 'train_model_plot', 'train_model_resnet18'],
    sourceNotebooks: ['train_model.ipynb', 'train_model_plot.ipynb', 'train_model_resnet18.ipynb'],
    summaryVi: 'Bộ tạo batch dữ liệu, xáo trộn mẫu và đa tiến trình nạp song song của PyTorch.',
    explanationVi: 'Gói gọn một Dataset để tạo vòng lặp huấn luyện theo từng lô (mini-batch) kích thước batch_size=8 hoặc 16. Hỗ trợ shuffle=True để xáo trộn dữ liệu qua mỗi epoch.',
    syntax: 'loader = DataLoader(dataset, batch_size=8, shuffle=True, num_workers=0)',
    inputs: ['dataset: Dataset', 'batch_size: kích cỡ lô', 'shuffle: xáo trộn ngẫu nhiên', 'num_workers: số tiến trình'],
    outputs: ['Iterator sinh các batch (images, labels)'],
    codeExample: `train_loader = torch.utils.data.DataLoader(
    train_dataset,
    batch_size=8,
    shuffle=True,
    num_workers=0
)`,
    sourceStatus: 'source-identified',
    cautions: [
      'Trên Jetson Nano hoặc hệ điều hành hạn chế bộ nhớ chia sẻ, num_workers nên đặt bằng 0 để tránh lỗi Bus Error / Shared Memory.'
    ],
    level: 'intermediate'
  },
  {
    id: 'shell-unzip-zip',
    name: '!unzip -q / !zip -r -q',
    kind: 'shell-command',
    group: 'system',
    groupNameVi: 'Lệnh Shell & Hệ thống',
    moduleIds: ['data_collection', 'data_collection_gamepad', 'train_model', 'train_model_plot', 'train_model_resnet18'],
    sourceNotebooks: ['data_collection.ipynb', 'train_model.ipynb', 'train_model_plot.ipynb'],
    summaryVi: 'Lệnh shell thực thi trực tiếp từ cell Jupyter Notebook qua tiền tố "!" để đóng gói hoặc giải nén dataset.',
    explanationVi: '!zip -r -q đóng gói đệ quy (-r) và ẩn thông báo (-q) thư mục dataset thành file zip để tải về máy trạm. !unzip -q giải nén nhanh vào thư mục làm việc.',
    syntax: '!zip -r -q road_following.zip dataset_xy',
    inputs: ['Các cờ dòng lệnh Linux: -r (recursive), -q (quiet)'],
    outputs: ['Tệp nén .zip hoặc thư mục giải nén'],
    codeExample: `!zip -r -q road_following_{DATASET_DIR}_{timestr()}.zip {DATASET_DIR}
!unzip -q road_following.zip`,
    sourceStatus: 'source-identified',
    cautions: [
      'Tiền tố "!" chỉ hoạt động trong môi trường Jupyter/IPython, không phải cú pháp Python thuần.'
    ],
    level: 'basic'
  }
];
