require('dotenv').config();
const express = require('express');
const { Client, middleware } = require('@line/bot-sdk');

const app = express();

// LINE APIの設定
const lineConfig = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// 必要なミドルウェアの追加
app.use(express.json()); // JSONボディをパース
app.use(express.urlencoded({ extended: true })); // URLエンコードされたデータをパース
app.use(middleware(lineConfig)); // このミドルウェアをボディパーサーの後に設定

// ダブルトーク情報の返信
async function replyWithEcho(event, name, email, tel) {
  const replyText = `Received info:\nName: ${name}\nEmail: ${email}\nTel: ${tel}`;
  try {
    await client.replyMessage(event.replyToken, {
      type: 'text',
      text: replyText,
    });
  } catch (err) {
    console.error('Error sending reply:', err);
  }
}

// Webhookエンドポイント
app.post('/webhook', (req, res) => {
  const events = req.body.events;
  events.forEach((event) => {
    if (event.type === 'message' && event.message.type === 'text') {
      const message = event.message.text;
      console.log('Received message:', message);

      // メッセージを:で解析
      const parts = message.split(':');
      if (parts.length === 3) {
        const name = parts[0].trim();
        const email = parts[1].trim();
        const tel = parts[2].trim();
        console.log(`Parsed info - Name: ${name}, Email: ${email}, Tel: ${tel}`);

        // ユーザーにメッセージを送信
        replyWithEcho(event, name, email, tel);

        // 応答として解析後の情報を出力
        const userId = event.source.userId;
        console.log(`UserId: ${userId}, Name: ${name}, Email: ${email}, Tel: ${tel}`);
      } else {
        console.log('Format not matching');
        client.replyMessage(event.replyToken, {
          type: 'text',
          text: '情報のフォーマットが正しくありません。例: "名前:メール:電話番号"',
        }).catch(err => console.error('Error sending format error reply:', err));
      }
    }
  });
  res.sendStatus(200); // 正しいレスポンス送信形式
});

// サーバーを起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});