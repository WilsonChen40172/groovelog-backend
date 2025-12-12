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
        const songs = await prisma.songs.findMany({
            where: {
                status: {
                    not: 'ARCHIVED' // 👈 關鍵：只要狀態「不是」封存的，都拿出來
                }
            },
            orderBy: {
                created_at: 'desc' // (順便加的) 讓新歌排在最上面，體驗比較好
            },
            // 👇 關鍵：告訴 Prisma 把這首歌底下的樂器也一起撈出來
            include: {
                instruments: true
            }
        });
        res.json(songs);
    } catch (error) {
        res.status(500).json({ error: '無法讀取歌曲列表' });
    }
});

// API 2: 新增一位使用者 (POST /users)
// 為了測試，我們先寫一個簡單的建立使用者 API
app.post('/users', async (req, res) => {
    try {
        // 前端傳來的 body 會多一個 instruments 陣列，例如 ["Guitar", "Bass"]
        const { title, artist, youtube_url, instruments } = req.body;

        const newSong = await prisma.songs.create({
            data: {
                title,
                artist,
                youtube_url,
                user_id: 1,
                status: 'PRACTICING',
                // 👇 這裡用了 Prisma 強大的 Nested Write (巢狀寫入)
                // 如果前端有傳 instruments 陣列，就自動建立對應的資料
                instruments: {
                    create: instruments ? instruments.map((inst: string) => ({
                        instrument: inst,
                        progress: 0 // 預設進度 0%
                    })) : []
                }
            },
            include: { instruments: true } // 回傳時也包含樂器資料
        });

        res.json(newSong);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '建立失敗' });
    }
});

// 3. 新增 PATCH: 更新某個樂器的進度
// 前端呼叫範例: PATCH /instruments/5  Body: { progress: 70 }
app.patch('/instruments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { progress } = req.body; // 0-100 的數字

        const updatedInstrument = await prisma.song_instruments.update({
            where: { id: Number(id) },
            data: { progress: Number(progress) }
        });

        res.json(updatedInstrument);
    } catch (error) {
        res.status(500).json({ error: '更新進度失敗' });
    }
});

// src/index.ts

// API: 新增一首歌 (POST /songs)
app.post('/songs', async (req, res) => {
    try {
        const { title, artist, youtube_url, instruments } = req.body;

        // 使用 Prisma 寫入資料庫
        const newSong = await prisma.songs.create({
            data: {
                title,
                artist,
                youtube_url,
                user_id: 1, // 暫時先寫死，假裝是剛剛建立的那個 DemoUser (ID=1)
                status: 'PRACTICING', // 預設狀態
                instruments: {
                    // 如果前端有傳 instruments 陣列，就用 map 轉成 Prisma 看得懂的物件格式
                    // 如果沒傳 (undefined)，就給空陣列
                    create: instruments
                        ? instruments.map((inst: string) => ({
                            instrument: inst, // e.g. "Guitar"
                            progress: 0       // 預設進度 0
                        }))
                        : []
                }
            },
            include: {
                instruments: true
            }
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
    try {
        const { id } = req.params;

        // ❌ 原本是 delete (硬刪除)
        // const deletedSong = await prisma.songs.delete({ ... });

        // ✅ 現在改成 update (軟刪除)
        const archivedSong = await prisma.songs.update({
            where: { id: Number(id) },
            data: {
                status: 'ARCHIVED' // 把狀態改成封存
            },
        });

        console.log(`歌曲 ID ${id} 已封存 (軟刪除)`);
        res.json(archivedSong);
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