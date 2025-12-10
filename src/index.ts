import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

// 1. 初始化 Prisma Client (連線資料庫的橋樑)
const prisma = new PrismaClient();

// 2. 初始化 Express (Web Server)
const app = express();
const PORT = 3000;

// 3. 設定 Middleware (中介軟體)
app.use(cors()); // 允許跨域請求 (讓你的 React 可以打 API)
app.use(express.json()); // 讓後端看得懂 JSON 格式的 Request Body

// --- API 路由區 ---

// 測試用：首頁
app.get('/', (req, res) => {
    res.send('🎸 GrooveLog API is running! Let\'s Rock!');
});

// API 1: 取得所有歌曲 (GET /songs)
app.get('/songs', async (req, res) => {
    try {
        const songs = await prisma.songs.findMany(); // 直接從資料庫撈資料！
        res.json(songs);
    } catch (error) {
        res.status(500).json({ error: '無法讀取歌曲列表' });
    }
});

// API 2: 新增一位使用者 (POST /users)
// 為了測試，我們先寫一個簡單的建立使用者 API
app.post('/users', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 寫入資料庫
        const newUser = await prisma.users.create({
            data: {
                username,
                email,
                password_hash: password, // 注意：實務上這裡要 hash 加密，練習先存明碼沒關係
            },
        });

        res.json(newUser);
    } catch (error) {
        console.error(error); // 在終端機印出錯誤以便除錯
        res.status(400).json({ error: '建立使用者失敗，可能是 Email 重複了' });
    }
});

// src/index.ts

// API: 新增一首歌 (POST /songs)
app.post('/songs', async (req, res) => {
    try {
        const { title, artist, youtube_url } = req.body;

        // 使用 Prisma 寫入資料庫
        const newSong = await prisma.songs.create({
            data: {
                title,
                artist,
                youtube_url,
                user_id: 1, // 暫時先寫死，假裝是剛剛建立的那個 DemoUser (ID=1)
                status: 'PRACTICING', // 預設狀態
            },
        });

        console.log("新歌已建立:", newSong);
        res.json(newSong);
    } catch (error) {
        console.error("建立失敗:", error);
        res.status(500).json({ error: '無法建立歌曲' });
    }
});

// 刪除歌曲 (DELETE /songs/:id)
app.delete('/songs/:id', async (req, res) => {
    const songId = parseInt(req.params.id, 10);

    try {
        const deletedSong = await prisma.songs.delete({
            where: { id: songId },
        });

        res.json({ message: '歌曲已刪除', song: deletedSong });
    } catch (error) {
        console.error("刪除失敗:", error);
        res.status(500).json({ error: '無法刪除歌曲' });
    }
});

// 更新歌曲狀態 (PATCH /songs/:id/status)
app.patch('/songs/:id/status', async (req, res) => {
    const songId = parseInt(req.params.id, 10);
    const { status } = req.body;

    try {
        const updatedSong = await prisma.songs.update({
            where: { id: songId },
            data: { status },
        });

        res.json(updatedSong);
    } catch (error) {
        console.error("更新失敗:", error);
        res.status(500).json({ error: '無法更新歌曲狀態' });
    }
});

// --- 啟動伺服器 ---
app.listen(PORT, () => {
    console.log(`🚀 Server ready at: http://localhost:${PORT}`);
});