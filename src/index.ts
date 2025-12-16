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

// 首頁Testing
app.get('/', (req, res) => {
    res.send('🎸 GrooveLog API is running! Let\'s Rock!');
});

// 取得所有歌曲 (GET /songs)
app.get('/songs', async (req, res) => {
    const songs = await prisma.songs.findMany({
        where: { status: { not: 'ARCHIVED' } },
        orderBy: { created_at: 'desc' },
        include: {
            instruments: {
                include: {
                    defined_instrument: true // 這樣才能拿到樂器名字 "Guitar"
                }
            }
        }
    });
    res.json(songs);
});

// 建立使用者 (POST /users)
app.post('/users', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = await prisma.users.create({
            data: {
                username,
                email,
                password_hash: password, // 實務上要加密,這裡先簡化
            },
        });
        res.json(newUser);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: '建立使用者失敗' });
    }
});

// API: 取得樂器總表 (給前端選單用)
app.get('/instruments', async (req, res) => {
    const list = await prisma.defined_instruments.findMany();
    res.json(list);
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

// 新增一首歌 (POST /songs)
app.post('/songs', async (req, res) => {
    try {
        // 前端改傳 instrumentIds: [1, 2, 4] 這樣的 ID 陣列
        const { title, artist, youtube_url, instrumentIds } = req.body;

        const newSong = await prisma.songs.create({
            data: {
                title,
                artist,
                youtube_url,
                user_id: 1,
                status: 'PRACTICING',
                instruments: {
                    create: instrumentIds
                        ? instrumentIds.map((instId: number) => ({
                            progress: 0,
                            // 連接已存在的樂器 ID
                            defined_instrument: {
                                connect: { id: instId }
                            }
                        }))
                        : []
                }
            },
            // 記得 include 的結構也變了，要多包一層才能拿到 name
            include: {
                instruments: {
                    include: {
                        defined_instrument: true
                    }
                }
            }
        });
        res.json(newSong);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '建立失敗' });
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