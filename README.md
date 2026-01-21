# 🎮 Game Kéo Búa Bao - Đa Người Chơi

Game Kéo Búa Bao đa người chơi với giao diện hiện đại, responsive và real-time multiplayer!

## ✨ Tính năng

- 🎯 **Game đa người chơi**: Chơi với bạn bè qua mạng
- 📱 **Responsive Design**: Hoạt động tốt trên cả desktop và mobile
- 🎵 **Âm thanh**: Nhạc nền và hiệu ứng âm thanh đầy đủ
- 💬 **Chat**: Trò chuyện real-time trong khi chơi
- 🎨 **Giao diện đẹp**: Thiết kế hiện đại với animations mượt mà
- 🌐 **Real-time**: Cập nhật kết quả theo thời gian thực
- ⚡ **Tốc độ nhanh**: Socket.IO cho kết nối real-time

## 🚀 Cài đặt

### Yêu cầu

- Node.js (phiên bản 14 trở lên)
- npm hoặc yarn

### Bước 1: Cài đặt dependencies

```bash
cd Game_Rock
npm install
```

### Bước 2: Chạy server

```bash
npm start
```

Hoặc chạy với nodemon (tự động restart khi có thay đổi):

```bash
npm run dev
```

### Bước 3: Mở trình duyệt

Truy cập: **http://localhost:3000**

## 🎮 Cách chơi

### 1. Tạo phòng hoặc vào phòng

- Nhập tên của bạn
- Chọn "Tạo phòng mới" để tạo phòng mới (mã phòng sẽ được tạo tự động)
- Hoặc chọn "Vào phòng có sẵn" và nhập mã phòng của bạn bè

### 2. Bắt đầu game

- Khi có 2 người chơi trong phòng, nhấn "Bắt đầu trận đấu"
- Chọn Búa (🪨), Bao (📄), hoặc Kéo (✂️)
- Người đầu tiên đạt số điểm cần thiết sẽ thắng trận đấu!

### 3. Chat

- Nhấn vào nút chat ở góc trên bên phải để mở chat panel
- Gửi tin nhắn cho đối thủ trong khi chơi

## 📁 Cấu trúc thư mục

```
Game_Rock/
├── server.js              # Server Node.js với Express + Socket.IO
├── package.json           # Dependencies
├── sounds/                # File âm thanh
│   ├── bg.mp3            # Nhạc nền
│   ├── click.mp3          # Âm thanh click
│   ├── win.mp3            # Âm thanh thắng
│   ├── lose.mp3           # Âm thanh thua
│   └── draw.mp3           # Âm thanh hòa
└── public/                # Frontend files
    ├── index.html         # Landing page
    ├── game.html          # Game room page
    ├── css/
    │   ├── style.css      # Styles cho landing page
    │   └── game.css       # Styles cho game room
    └── js/
        ├── main.js        # Logic cho landing page
        ├── socket.js      # Socket.IO client manager
        ├── audio.js       # Audio manager
        └── game.js        # Game logic chính
```

## 🛠️ Công nghệ sử dụng

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: HTML5, CSS3 (với animations), Vanilla JavaScript
- **Real-time**: Socket.IO cho kết nối real-time
- **Audio**: HTML5 Audio API

## 🎨 Giao diện

- **Theme**: Sáng, màu sắc rực rỡ với gradients
- **Responsive**: Hoạt động tốt trên mọi kích thước màn hình
- **Animations**: Hiệu ứng mượt mà, đẹp mắt
- **UX**: Trải nghiệm người dùng tốt với feedback rõ ràng

## 📝 Notes

- Server mặc định chạy trên port **3000**
- Mã phòng tự động được tạo với 6 ký tự (chữ in hoa và số)
- Game mặc định là "Best of 3" (người đầu tiên đạt 2 điểm thắng)
- Âm thanh chỉ phát sau khi người dùng tương tác với trang (do browser policy)

## 🐛 Troubleshooting

### Port đã được sử dụng

Nếu port 3000 đã được sử dụng, bạn có thể thay đổi bằng cách:

```bash
PORT=3001 npm start
```

### Không nghe được âm thanh

- Đảm bảo các file âm thanh có trong thư mục `sounds/`
- Kiểm tra volume của trình duyệt
- Một số trình duyệt có thể yêu cầu tương tác người dùng trước khi phát âm thanh

### Không kết nối được với server

- Đảm bảo server đã được khởi động
- Kiểm tra firewall không chặn port 3000
- Kiểm tra địa chỉ trong file `socket.js` khớp với server

## 📄 License

MIT License

## 👨‍💻 Author

Game được phát triển với Nhóm 10

