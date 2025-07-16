# Mani Peta

Cloud Vision API を活用して**画像内の個人情報を自動で検出し、マスキングするサービス**です。
このサービスは、スクリーンショットを技術記事に使用する際の個人情報の手動マスキング作業を、ワンクリックで完了させることができます。

## Getting Started

はじめにリポジトリをクローンします。

```bash
$ git clone git@github.com:yumemiru-masomi/mani-peta.git
$ cd mani-peta
```

環境変数を設定します。

```sh
$ cp .env.example .env
```

次に、開発サーバーを起動します。

```bash
$ npm run dev
```

ブラウザで[http://localhost:3000](http://localhost:3000)を開くとサービスが表示されます。

## Learn More

使い方です。

1. 個人情報を含む画像をアップロードする
2. Execute Masking ボタンを押す
3. AI が処理した画像を保存して完了

使い方の詳細については、下記の記事をご覧ください。

- [【個人開発】Cloud Vision API で個人情報を隠すサービスを開発しました 🎉](https://zenn.dev/yumemi9808/articles/a28e0442a51ef9)
