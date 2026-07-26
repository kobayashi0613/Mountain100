# Windows 11 環境セットアップガイド

Windows 11 PC を使って Mountain100(iOS アプリ)を開発し、iPhone にインストールするための手順です。

## 全体像 — なぜこの構成なのか

**iOS アプリのビルド(コンパイル)は Apple の規約と技術的制約により macOS + Xcode でしかできません。** Windows 11 だけでは IPA ファイル(iOS アプリ本体)を作れません。

そこで本プロジェクトでは次の構成を採用しています:

```
[Windows 11 PC]                [GitHub Actions (クラウドの macOS)]        [iPhone]
 Flutter でコード編集   ──push──▶  IPA を自動ビルド   ──ダウンロード──▶ Windows PC
 動作確認は Windows/                (無料枠で利用可)                        │
 Chrome 上で実行                                                            ▼
                                                            Sideloadly で署名+USB 転送
```

- **開発**: Flutter を使うので、コードの編集・動作確認は Windows 上で完結します(Windows アプリ / Chrome で実行して確認)。
- **iOS ビルド**: GitHub に push すると GitHub Actions の macOS ランナーが自動で IPA をビルドします(macOS の購入は不要)。
- **インストール**: ビルドされた IPA を Windows にダウンロードし、**Sideloadly** というツールで Apple ID の署名を付けて iPhone に USB 転送します。

## 必要なもの

| 項目 | 備考 |
|---|---|
| Windows 11 PC | 本ガイドの対象 |
| iPhone + USB ケーブル | データ転送対応ケーブル |
| Apple ID | 無料のもので OK(制限は後述) |
| GitHub アカウント | このリポジトリにアクセスできること |

---

## ステップ 1: 開発ツールのインストール

PowerShell を**管理者として実行**し、リポジトリ内のスクリプトを実行するのが簡単です:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\setup-windows11.ps1
```

または手動で以下をインストールします:

### 1-1. Git for Windows

```powershell
winget install -e --id Git.Git
```

### 1-2. Visual Studio Code

```powershell
winget install -e --id Microsoft.VisualStudioCode
```

インストール後、VS Code の拡張機能から **Flutter**(Dart-Code.flutter)を追加してください。

### 1-3. Flutter SDK

winget には公式パッケージがないため、Git で取得します:

```powershell
git clone https://github.com/flutter/flutter.git -b stable C:\dev\flutter
```

環境変数 PATH に `C:\dev\flutter\bin` を追加します:

1. スタートメニュー →「環境変数を編集」
2. ユーザー環境変数の `Path` に `C:\dev\flutter\bin` を追加
3. PowerShell を開き直して確認:

```powershell
flutter doctor
```

`flutter doctor` で「Windows Version」「VS Code」にチェックが付けば OK です(Android toolchain / Xcode の警告は無視して構いません。iOS ビルドはクラウドで行います)。

### 1-4. 動作確認用のデスクトップビルド(任意)

Windows 上でアプリを実行して動作確認したい場合は、Visual Studio 2022 の「C++ によるデスクトップ開発」ワークロードが必要です:

```powershell
winget install -e --id Microsoft.VisualStudio.2022.Community --override "--add Microsoft.VisualStudio.Workload.NativeDesktop --includeRecommended --passive"
```

インストールせずに Chrome で動作確認することもできます:

```powershell
flutter run -d chrome
```

---

## ステップ 2: iPhone 接続用ソフトのインストール

Sideloadly が iPhone と通信するために **iTunes** が必要です(Microsoft Store 版で OK):

```powershell
winget install -e --id 9PB2MZ1ZMB1S --source msstore --accept-package-agreements
```

インストール後、iPhone を USB で接続し、iPhone 側に表示される「このコンピュータを信頼しますか?」で**信頼**をタップしてください。

## ステップ 3: Sideloadly のインストール

1. https://sideloadly.io/ から Windows 版(64bit)をダウンロード
2. インストーラーを実行

> **代替手段**: AltStore(https://altstore.io/)でも同じことができますが、7 日ごとの再署名を Wi-Fi 経由で自動化できる反面、セットアップがやや複雑です。まずは Sideloadly をおすすめします。

---

## ステップ 4: IPA のダウンロード

1. ブラウザで本リポジトリの **Actions** タブを開く
2. 左のリストから **iOS Build** ワークフローを選ぶ
3. 最新の成功した(✅)実行をクリック
4. ページ下部の **Artifacts** から `Mountain100-unsigned-ipa` をダウンロード
5. ZIP を展開して `Mountain100-unsigned.ipa` を取り出す

ビルドを今すぐ実行したい場合は、Actions タブ → iOS Build → **Run workflow** で手動実行できます。

## ステップ 5: Sideloadly でインストール

1. iPhone を USB で PC に接続
2. Sideloadly を起動
3. `Mountain100-unsigned.ipa` を Sideloadly のウィンドウにドラッグ&ドロップ
4. **iDevice** に自分の iPhone が表示されていることを確認
5. **Apple account** に自分の Apple ID を入力して **Start**
6. パスワードを求められたら入力(2 ファクタ認証のコード入力が必要な場合あり)
7. 完了すると iPhone のホーム画面に Mountain100 が追加される

> Apple ID とパスワードは Sideloadly からアプリ署名のために Apple のサーバーへ直接送られます。心配な場合はサイドロード専用の Apple ID を別途作成してください。

## ステップ 6: iPhone 側の設定

インストール直後はまだアプリを起動できません。以下の 2 つを設定します:

### 6-1. 開発元を信頼する

設定 → 一般 → **VPN とデバイス管理** → 自分の Apple ID → **信頼**

### 6-2. デベロッパモードを有効にする(iOS 16 以降)

設定 → プライバシーとセキュリティ → **デベロッパモード** → オン → iPhone を再起動

再起動後の確認ダイアログで「オンにする」を選ぶと、アプリが起動できるようになります。

---

## 無料 Apple ID の制限(重要)

| 項目 | 無料 Apple ID | Apple Developer Program(年 99 ドル) |
|---|---|---|
| アプリの有効期限 | **7 日**(切れたら再インストール) | 1 年 |
| 同時にサイドロードできるアプリ数 | 3 個まで | 制限緩い |
| TestFlight / App Store 配布 | 不可 | 可 |

7 日経つとアプリが起動しなくなりますが、**データは消えません**。ステップ 5 を再実行(同じ Apple ID で上書きインストール)すれば、登頂記録はそのまま引き継がれます。

長期的に使う場合は Apple Developer Program への加入、または AltStore による自動再署名を検討してください。

## 開発の流れ(まとめ)

1. Windows の VS Code でコードを編集
2. `flutter run -d windows`(または `-d chrome`)で動作確認
3. `git push` → GitHub Actions が IPA を自動ビルド
4. IPA をダウンロード → Sideloadly で iPhone に転送

## トラブルシューティング

| 症状 | 対処 |
|---|---|
| Sideloadly が iPhone を認識しない | iTunes を起動して iPhone が見えるか確認。ケーブル・「信頼」設定を再確認 |
| 「Unable to verify app」等で起動できない | ステップ 6-1(VPN とデバイス管理で信頼)を実施 |
| アプリアイコンをタップしても起動しない | ステップ 6-2(デベロッパモード)を実施 |
| 7 日後に起動しなくなった | 仕様です。Sideloadly で再インストール(データは保持されます) |
| `flutter doctor` で Xcode の警告が出る | Windows では正常です。iOS ビルドは GitHub Actions が行います |
| GitHub Actions のビルドが失敗する | Actions タブのログを確認。`flutter analyze` / `flutter test` の失敗はコード修正が必要 |
