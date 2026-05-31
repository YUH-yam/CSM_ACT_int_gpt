# QA レポート — ACT Compass 統合版

検証日：2026-05-31  
対象：`/Users/yuh_y/Documents/Codex/CSM_ACT_tool/integrated_tool`

## 1. サマリ

ACT_tool と task_tool を統合したスマホPWAとして、主要機能の実装と検証を行いました。Critical / High 相当の既知バグはありません。個人利用のMVPとしては使用可能です。

ただし、医療・心理支援領域のため、公開配布・商用利用・第三者提供を行う場合は、尺度の利用許諾、設問文、相談窓口表記、心理士/医師による監修を別途確認してください。

## 2. 実装範囲

- 今日の状態記録：気分、体調、不安・緊張、思考への巻き込まれ、回避したい気持ち、価値領域、5分行動。
- タスク管理：旧デフォルト分類、英数字カテゴリID、工数、開始日、終了日、重要/緊急、担当、項目、価値領域、次の一手、進捗、ステータス、タスク並び替え、後追い編集、カテゴリ/担当/項目の編集・削除・並び替え・初期化、4象限、WBS一覧/ガント。
- ケア：場所×部位ストレスマトリクス、ACTワーク、行動活性化、自分への言葉、タスク減圧。
- 尺度：AAQ-II、CFQ-7、CFQ-13、TSSQ、FFMQ-39、WHO-5、VQ。
- 設定：キャパシティ、自由記述保存ON/OFF、カテゴリ/担当/項目/ストレス場所の追加・削除、JSONエクスポート/インポート、全削除。
- 互換インポート：ACT_tool JSON と task_tool JSON を統合版形式へ変換。
- GAS連携：GAS Web App URL保存、保存時デバウンス同期、手動送信、JSONP手動読み込み。
- PWA：manifest、service worker、SVGアイコン、オフラインキャッシュ。

## 3. テスト結果

- 構文チェック：`node --check integrated_tool/js/app.js` 合格。
- 構文チェック：`node --check integrated_tool/js/scales.js` 合格。
- 尺度単体テスト：`node integrated_tool/tests/unit-scales.mjs` 7 / 7 合格。
- 静的スモーク：`node integrated_tool/tests/smoke-dom.mjs` 6 / 6 合格。
- ブラウザE2E：`ACT_COMPASS_URL=http://127.0.0.1:4175/ node integrated_tool/tests/smoke-playwright.mjs` 合格。タスク追加、進捗編集、担当追加、4象限、WBS、ストレスマトリクス、ケア、尺度の導線を確認。
- 旧JSON変換：`ACT_COMPASS_URL=http://127.0.0.1:4175/ node integrated_tool/tests/smoke-import.mjs` 合格。task_tool 形式（`tasks/smxData/slog/masters`）と ACT_tool 形式（`daily_logs/scale_sessions/work_sessions`）の変換、日本語カテゴリ名から英数字IDへの変換を確認。
- モバイル幅390px：横スクロールなし、下部ナビ5項目、初回同意、前ツール形式のタスク追加、進捗編集、タスク設定、4象限、WBS表示、場所×部位ストレスマトリクス、ケア画面、尺度画面の遷移を確認。

## 4. Critical / High issues

該当なし。

## 5. Medium / Low issues

Medium：医療安全上、公開配布前の監修は未実施です。  
影響：セルフケア表現や相談窓口表記がユーザーの状態に対して不足する可能性があります。  
対応：個人利用に限定。公開時は専門家レビューを追加。

Medium：自由記述は暗号化していません。  
影響：共有端末では心理情報を第三者に見られる可能性があります。  
対応：「自由記述を保存する」をOFFにできます。将来はパスコード/暗号化を検討。

Low：GAS側のWeb App実体はこのリポジトリには含めていません。  
影響：GAS URLが未設定、またはデプロイ権限が不適切な場合は同期できません。  
対応：前ツール同様、GAS Web Appを「全員」向けにデプロイし、データ管理画面でURLを設定してください。失敗時はJSON貼り付け読み込みで代替できます。

Low：実機iOS Safari / Android Chromeでの手動確認は未実施です。  
影響：ホーム画面追加後の挙動やキーボード表示時の細部は未確認です。  
対応：実機でオンボーディングから各主要操作を再確認。

## 6. リリース判定

個人利用MVPとしてリリース可。条件は以下です。

- 個人利用に限定する。
- 診断・治療目的として使わない。
- つらさが強い場合や自傷念慮がある場合は、医療機関・専門家・地域の相談窓口を優先する。
- 公開配布や商用利用では、尺度利用許諾と専門家監修を追加する。
