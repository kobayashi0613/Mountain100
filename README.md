# Mountain100

日本百名山管理用iOSアプリ

深田久弥の日本百名山(100座)の登頂記録をチェックリストで管理する Flutter 製アプリです。

## 機能

- 百名山 100 座の一覧表示(山名・よみがな・標高・都道府県)
- 登頂チェックと進捗バー(登頂数 / 100)
- 山名・よみ・都道府県での検索、未登頂のみの絞り込み
- 登頂記録は端末内に自動保存

## Windows 11 で開発して iPhone にインストールする

iOS アプリのビルドには macOS が必要ですが、本プロジェクトは **GitHub Actions(クラウドの macOS)** でビルドする構成のため、Windows 11 PC だけで開発〜iPhone へのインストールまで完結できます。

**→ 手順の詳細: [docs/SETUP_WINDOWS11.md](docs/SETUP_WINDOWS11.md)**

概要:

1. `scripts/setup-windows11.ps1` で開発ツール(Git / VS Code / Flutter / iTunes)をインストール
2. GitHub に push すると [iOS Build ワークフロー](.github/workflows/ios-build.yml) が IPA を自動ビルド
3. Actions の Artifacts から IPA をダウンロード
4. [Sideloadly](https://sideloadly.io/) で Apple ID 署名を付けて iPhone に USB 転送

## 開発

```powershell
flutter pub get
flutter run -d windows   # または -d chrome
flutter test
```

`ios/` ディレクトリはリポジトリに含めず、CI 上で `flutter create --platforms=ios` により生成しています。

## プロジェクト構成

```
lib/main.dart            アプリ本体(一覧・検索・進捗・保存)
lib/mountains.dart       日本百名山 100 座のデータ
test/widget_test.dart    テスト
.github/workflows/       iOS Build ワークフロー(IPA 自動ビルド)
docs/SETUP_WINDOWS11.md  Windows 11 セットアップガイド
scripts/setup-windows11.ps1  セットアップスクリプト
```
