# 🎸 GrooveLog Backend API

這是 **GrooveLog 練琴日記** 的後端服務,提供 RESTful API 來管理練習曲目與進度。

本專案使用 **Node.js (Express)**、**TypeScript** 與 **Prisma ORM** 開發,資料庫採用 **MySQL**。

---

## 🛠 技術堆疊

| 類別          | 技術                |
| ------------- | ------------------- |
| **Runtime**   | Node.js             |
| **Framework** | Express             |
| **Language**  | TypeScript          |
| **Database**  | MySQL 8.0           |
| **ORM**       | Prisma v5.22.0      |
| **Dev Tools** | Docker, ts-node-dev |

---

## 🚀 快速開始

### 1️⃣ 環境準備

確保你的電腦已安裝：

- [Node.js](https://nodejs.org/) (建議 v18 以上)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (用於啟動資料庫)

---

### 2️⃣ 啟動資料庫

使用 Docker 快速啟動 MySQL 伺服器：

```bash
# 下載並啟動 MySQL 8.0 容器 (帳號: root, Port: 3306)
docker run --name groovelog-db \
  -e MYSQL_ROOT_PASSWORD=your_password \
  -p 3306:3306 \
  -d mysql:8.0

# 確認容器是否正在執行
docker ps
```

> **💡 提示:** 將 `your_password` 替換成你自己的密碼

---

### 3️⃣ 設定環境變數

在專案根目錄建立 `.env` 檔案：

```env
# 資料庫連線字串
# 格式: mysql://使用者:密碼@主機:Port/資料庫名稱
DATABASE_URL="mysql://root:your_password@localhost:3306/GrooveLog_251208"
```

> **⚠️ 注意:** 請將 `your_password` 改成你在步驟 2 設定的密碼

---

### 4️⃣ 安裝依賴與同步資料庫

```bash
# 安裝 npm 套件
npm install

# 讓 Prisma 根據 schema.prisma 自動建立資料表
npx prisma db push

# 產生 Prisma Client 型別檔案
npx prisma generate
```

---

### 5️⃣ 啟動伺服器

```bash
# 開發模式 (存檔會自動重啟)
npm run dev
```

成功後你會看到：

```text
🚀 Server ready at: http://localhost:3000
```

---

## 📚 API 端點

| 方法     | 路徑                | 說明         |
| -------- | ------------------- | ------------ |
| `GET`    | `/`                 | 測試首頁     |
| `GET`    | `/songs`            | 取得所有歌曲 |
| `POST`   | `/songs`            | 新增歌曲     |
| `DELETE` | `/songs/:id`        | 刪除歌曲     |
| `POST`   | `/users`            | 建立使用者   |
| `PATCH`  | `/songs/:id/status` | 更新歌曲狀態 |

---

## 🗄️ 資料庫結構

專案使用 Prisma ORM,資料表結構定義在 `prisma/schema.prisma`：

- **users** - 使用者資料
- **songs** - 歌曲清單
- **practice_sessions** - 練習紀錄

查看完整 Schema：

```bash
npx prisma studio
```

---

## 🛠️ 常用指令

```bash
# 啟動開發伺服器
npm run dev

# 同步資料庫結構
npx prisma db push

# 產生 Prisma Client
npx prisma generate

# 開啟 Prisma Studio (資料庫 GUI)
npx prisma studio

# 停止 Docker 容器
docker stop groovelog-db

# 重新啟動 Docker 容器
docker start groovelog-db
```

---

## 📝 授權

MIT License
