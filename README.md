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
- **バックアップ** — 記録を JSON ファイルに書き出し／読み込み
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
├── index.html
├── styles.css
├── app.js
├── sw.js                      # オフライン動作用 Service Worker
├── manifest.webmanifest       # ホーム画面追加時の名前・アイコン設定
├── mountain100.json
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
