# Mountain100

日本百名山管理用アプリ

深田久弥『日本百名山』（1964年）に選定された100山の一覧を表示し、登頂した山をチェックボックスで記録できます。

このリポジトリには2つの実装が入っています。

| | 用途 | 必要なもの |
|---|---|---|
| **Web版（PWA）** `docs/` | iPhone のホーム画面に追加して使う。Windows だけで公開・更新できる | ブラウザのみ |
| **iOS版（SwiftUI）** `Mountain100/` | App Store 配布や将来の機能拡張向け | Mac + Xcode 16 |

---

## Web版（PWA）— iPhone へのインストール手順

Mac も Apple Developer アカウントも不要です。

### 1. GitHub Pages を有効にする（PC で1回だけ）

1. GitHub でこのリポジトリを開く
2. **Settings** → 左メニューの **Pages**
3. **Source** を `Deploy from a branch` にする
4. **Branch** を `main`、フォルダを **`/docs`** に設定して **Save**
5. 1〜2分待つと `https://kobayashi0613.github.io/Mountain100/` で公開されます

### 2. iPhone のホーム画面に追加する

1. iPhone の **Safari**（Chrome ではなく Safari）で上記 URL を開く
2. 下部の **共有ボタン**（□に↑のアイコン）をタップ
3. **「ホーム画面に追加」** をタップ → **追加**

ホーム画面にアイコンが追加され、タップするとブラウザのバーが出ない全画面アプリとして起動します。一度開けば**オフラインでも動作**します。

## 機能

- **百名山一覧** — 書籍掲載順（概ね北から南）に100座を表示。No.・山名・読み・都道府県・標高を一覧で確認できます
- **登頂チェック** — チェックボックスをタップして登頂記録を保存。端末内に保存されるのでアプリを閉じても残ります
- **進捗表示** — 登頂数（○/100座）とプログレスバー
- **絞り込み** — すべて / 登頂済み / 未登頂
- **検索** — 山名・読み・都道府県・山域で検索
- **詳細表示** — 最高峰・標高・都道府県・山域
- **日本の世界遺産の記録** — 文化遺産・自然遺産を登録年順に表示。区分の切り替え、訪れた物件のチェック記録、登録年・登録基準の表示に対応
- **特別天然記念物の記録** — 動物・植物・地質鉱物・天然保護区域の区分ごとのページで全75件を表示。見たことがあるものをチェックで記録できます
- **バックアップ** — 登頂記録・世界遺産の訪問記録・「見た」記録をまとめて JSON ファイルに書き出し／読み込み
- **ダークモード対応**

## 記録の保存場所について

登頂記録は端末内（`localStorage`）にのみ保存され、サーバーには送信されません。そのため次の場合に消えることがあります。

- Safari の「履歴とWebサイトデータを消去」を実行した
- 機種変更した

画面下部の **「記録を書き出す」** で JSON ファイルとして保存しておけば、新しい端末で **「記録を読み込む」** から復元できます。

## 更新方法

`docs/` 以下を編集して `main` に push すると、GitHub Pages が自動で更新されます。
ホーム画面のアプリは次回起動時に新しい内容を読み込みます（すぐ反映されない場合はアプリを一度終了して開き直してください）。

---

## iOS版（SwiftUI）

`Mountain100.xcodeproj` を Xcode 16 以上で開き、シミュレータまたは実機を選んで Run（⌘R）。iOS 17.0 以上が対象です。
※ビルドには Mac が必要です。Windows のみの場合は上の Web版をお使いください。

## プロジェクト構成

```
docs/                          # Web版（GitHub Pages で公開されるフォルダ）
├── index.html                 # 日本百名山（トップページ）
├── world-heritage.html        # 日本の世界遺産
├── monuments-animals.html     # 特別天然記念物（動物）
├── monuments-plants.html      # 特別天然記念物（植物）
├── monuments-geology.html     # 特別天然記念物（地質鉱物）
├── monuments-areas.html       # 特別天然記念物（天然保護区域）
├── styles.css
├── app.js                     # 百名山ページ用
├── world-heritage.js          # 世界遺産ページ用
├── monuments.js               # 特別天然記念物ページ共通
├── sw.js                      # オフライン動作用 Service Worker
├── manifest.webmanifest       # ホーム画面追加時の名前・アイコン設定
├── mountain100.json
├── world-heritage.json
├── special-natural-monuments.json
└── icons/

Mountain100/                   # iOS版（SwiftUI）
├── Mountain100App.swift
├── Models/
│   ├── Mountain.swift
│   └── MountainStore.swift
├── Views/
│   ├── MountainListView.swift
│   └── MountainDetailView.swift
├── Resources/mountain100.json
└── Assets.xcassets
```

## データ

### mountain100.json（日本百名山）

各山について以下の情報を収録しています。

| フィールド | 内容 |
|---|---|
| `id` | 掲載順の通し番号（1–100） |
| `name` | 山名（書籍表記） |
| `kana` | 読み |
| `highest_peak` | 最高地点の峰名（山名と異なる場合のみ） |
| `elevation_m` | 標高（m、最高地点） |
| `prefectures` | 所在都道府県 |
| `range` | 山域 |

### world-heritage.json（日本の世界遺産）

UNESCO世界遺産条約に基づき登録された日本国内の全物件（2026年8月時点で27件・文化遺産22／自然遺産5）。登録年の古い順に並んでいます。

| フィールド | 内容 |
|---|---|
| `id` | 登録年順の通し番号（1–27） |
| `category` | 区分（文化遺産 / 自然遺産） |
| `name` | 登録名称（日本語正式名称） |
| `kana` | 読み |
| `year` | 世界遺産登録年 |
| `prefectures` | 所在都道府県 |
| `criteria` | 登録基準（ローマ数字） |
| `note` | 内容の補足（主な構成資産など） |

### special-natural-monuments.json（特別天然記念物）

文化財保護法に基づく特別天然記念物 全75件（動物21・植物30・地質鉱物20・天然保護区域4）。

| フィールド | 内容 |
|---|---|
| `id` | 通し番号（1–75、動物→植物→地質鉱物→天然保護区域の順） |
| `category` | 区分（動物 / 植物 / 地質鉱物 / 天然保護区域） |
| `name` | 名称（指定名称） |
| `kana` | 読み |
| `prefectures` | 所在または分布する都道府県 |
| `note` | 内容の補足 |
