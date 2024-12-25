require('dotenv').config();
const express = require('express');
const { middleware } = require('@line/bot-sdk');

const app = express();

// LINE APIの設定
const lineConfig = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// ローカルメモリデータストアのセットアップ
let userStore = {};

app.use(middleware(lineConfig));

// ユーザー情報の保存と検証
function saveOrUpdateUser(data) {
  const { userId, name, email, tel } = data;
  if (userStore[userId]) {
    console.log('ユーザー情報が見つかりました。:', userStore[userId]);
  } else {
    userStore[userId] = { name: name, email: email, tel: tel };
    console.log('新しいユーザーが追加されました:', userStore[userId]);
  }
}

// Webhookエンドポイント
app.post('/webhook', (req, res) => {
  const events = req.body.events;
  events.forEach(event => {
    if (event.type === 'message' && event.message.type === 'text') {
      const userId = event.source.userId;
      const data = {
        userId: userId,
        name: "Demo Name",   // 実際にはこの情報を有効に収集します
        email: "demo@example.com",
        tel: "090-1234-5678"
      };

      saveOrUpdateUser(data);
      // LINEへの応答などの追加処理
    }
  });
  res.sendStatus(200);
});

// サーバーを起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});