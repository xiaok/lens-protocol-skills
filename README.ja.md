# Lens Protocol Skills

![Lens Protocol Skills](./banner.png)

AI エージェント（Cursor、opencode、Claude 等）が [Lens Protocol](https://www.lens.xyz/) エコシステム上でソーシャルアプリケーションを迅速に構築するための、構造化された知識ベース＆コードスキルパックです。

> [English](./README.md) | [中文版](./README.zh.md)

## 何が作れるのか？

Lens Protocol を分散型バックボーンとして、**あらゆる種類のソーシャルアプリケーション**を構築できます：

- **個人ブログ＆ニュースレター** — 分散型 publishing、ユーザー所有のコンテンツ
- **マイクロブログプラットフォーム** — X/Twitter のような体験、完全分散型
- **コミュニティフォーラム** — カスタムガバナンスを持つニッチなコミュニティ
- **ソーシャルフィード＆コンテンツプラットフォーム** — カスタムアルゴリズムによるキュレーションフィード
- **グループベースのソーシャルネットワーク** — プライベートまたはパブリックコミュニティ
- **その他にも** — Lens のコンポーザブルなアーキテクチャは事実上あらゆるソーシャルプロダクトをサポート

## なぜ Lens Protocol なのか？

- **分散型** — ユーザーが自分のアイデンティティ、コンテンツ、ソーシャルグラフを所有。プラットフォームロックインはありません
- **無料で使用可能** — Lens API がすべてをカバー：ガス代、画像アップロード、動画ホスティング。投稿、保存、共有 — ユーザーはゼロコスト
- **安全** — Lens Chain（ZKsync L2）上に構築、イーサリアムレベルのセキュリティを継承
- **コンポーザブル** — アカウント、フィード、グラフ、グループ、ルールをブロックのように組み合わせ可能

## プロジェクト構成

```
├── skills/
│   ├── SKILL.md                 # メインスキル定義＆設計ガイドライン
│   ├── examples/
│   │   ├── client-setup.ts      # SDK 初期化＆フラグメント定義
│   │   ├── auth.ts              # 認証フロー（4つのログインモード）
│   │   ├── account.ts           # アカウント CRUD、マネージャー、ブロック/ミュート
│   │   ├── post.ts              # 投稿、コメント、引用、リポスト、リアクション
│   │   ├── content-read.ts      # フィード読み取り、ページネーション、ビューモデル
│   │   ├── social.ts            # フォロー、グループ、通知、レコメンデーション
│   │   └── storage.ts           # Grove 分散型ストレージ操作
│   └── ref/
│       ├── actions.md           # SDK アクション関数リファレンス
│       ├── graphql.md           # GraphQL クエリ/ミューテーションパターン
│       ├── graphql-schema.graphql # すぐ参照できるスキーマスナップショット
│       └── metadata.md          # メタデータビルダー＆スキーマ選択
├── README.ja.md                 # 日本語版
├── README.md                    # 英語版
├── README.zh.md                 # 中国語版
├── llms.txt                     # LLM 用にパックされたコードベース
└── package.json
```

## コアモジュール

| モジュール | 説明 |
|-----------|------|
| **Account** | メタデータ（名前、自己紹介、アバター）を持つオンチェーンアイデンティティ、アカウントマネージャー、ブロック/ミュート |
| **Feed** | コンテンツ公開＆配信：テキスト、画像、記事、動画の投稿タイプ |
| **Graph** | ソーシャルグラフ：フォロー/アンフォロー、フォロワー、フォロー中、相互フォロー |
| **Group** | メンバーシップ管理、承認ワークフロー、BAN 機能を持つオンチェーングループ |
| **Username** | 人が読める識別子（`namespace/localName`） |
| **App** | アプリケーション設定：デフォルトフィード、グラフ、ネームスペース、スポンサーシップ |
| **Rules** | フィード、グラフ、グループ、投稿、フォローを制約するプラガブルモジュール |
| **Actions** | 拡張可能なオンチェーンアクション：collect、tip 等 |
| **Sponsorship** | ガスレスユーザー体験のためのガス代スポンサーシップ |
| **Grove** | メタデータ、画像、動画のための分散型ストレージレイヤー |

## クイックスタート

AI エージェント（Cursor、opencode、Claude 等）に次のように伝えてください：

> Install Lens Protocol Skills from: <https://github.com/xiaok/lens-protocol-skills>

エージェントが `skills/` 内のすべてを読み込み、Lens ソーシャルアプリのコード生成を開始します。

### お試しプロンプト

| プロンプト | 効果 |
|-----------|------|
| `Write a post and publish it on Lens` | 投稿の完全なフローを生成 |
| `Upload an image and give me the link` | Grove アップロードコードを生成 |
| `Build me a personal blog` | 完全な個人ブログアプリを生成 |
| `Build me a gaming forum with Privy login, full UI, post list / posting / replies / tag-based groups, UI themed after Slay the Spire to attract gamers` | 完全なゲーミングコミュニティアプリを生成 |

## 環境情報

| 環境 | Chain ID | Gas Token | SDK 環境値 |
|------|----------|-----------|-----------|
| Mainnet | 232 | GHO | `mainnet` |
| Testnet | 37111 | GRASS | `testnet` |

## ライセンス

MIT
