# ACT Compass｜タスクとこころのセルフケア

ACT_tool と task_tool を統合した、個人利用向けのスマホPWAです。利用者は日本人の30代社会人男性、CBT/ACT初心者、うつ病や適応障害の罹患者を想定しています。診断・治療・カウンセリングを行うものではありません。

## 使い方

1. `integrated_tool/index.html` をブラウザで開く、または静的サーバで配信する。
2. 初回画面で注意事項に同意する。
3. 「今日」で状態を記録し、「タスク」で負荷を見ながら作業を調整する。
4. 「ケア」でACT/CBTワーク、「尺度」でセルフチェックを実施する。

PWAとして確認する場合：

```bash
cd /Users/yuh_y/Documents/Codex/CSM_ACT_tool/integrated_tool
python3 -m http.server 4174
```

その後、`http://127.0.0.1:4174/` を開きます。ポート使用中の場合は `4175` など空いているポートを使ってください。

## 統合内容

- ACT_tool から移植：AAQ-II / CFQ-7 / CFQ-13 / TSSQ / FFMQ-39 / WHO-5 / VQ の尺度スコアリングと項目定義。
- task_tool から再構成：旧デフォルト分類、タスク入力、開始日/終了日、重要/緊急、担当、項目、工数、進捗、キャパシティ、4象限、WBS一覧/ガント、場所×部位ストレスマトリクス。
- 旧JSONの読み込み：統合版JSONに加え、ACT_tool の `daily_logs` / `scale_sessions` / `work_sessions` と task_tool の `tasks` / `smxData` / `slog` / `masters` を変換して読み込み。
- 追加調査から反映：WHOのストレスセルフヘルプに近い「今ここ」「価値」「小さな行動」、Cochraneレビューで扱われる行動活性化、WHO-5の注意フラグ、厚労省の公的相談窓口案内。

## 設計方針

- スマホ優先、下部5タブ、44px以上のタップ領域。
- Stratum Design System の「Clarity over decoration」「Accessible by default」「Performance is UX」を優先。
- 色はニュートラルを主軸に、緑・青・橙・赤を意味別に使用。
- localStorageを真実のデータとして扱い、ネットワーク連携は実装していません。
- 自由記述を保存しない設定を用意しています。

## 安全上の注意

- 本ツールはセルフケアと記録補助です。医療機関や専門家の判断を置き換えません。
- 自分を傷つけたい気持ちがある、差し迫った危険がある場合は、119/110または地域の緊急窓口へ連絡してください。
- つらさが強い、生活への支障が大きい、状態が続く場合は医療機関、専門家、厚生労働省「まもろうよ こころ」などの公的窓口を確認してください。

## テスト

```bash
node integrated_tool/tests/unit-scales.mjs
node integrated_tool/tests/smoke-dom.mjs
```

ブラウザE2Eは `tests/smoke-playwright.mjs`、旧JSON変換は `tests/smoke-import.mjs` で確認できます。Playwright/Chromiumが利用できる環境では、ローカルサーバ起動後に実行してください。

## 参照した外部情報

- WHO, Doing What Matters in Times of Stress: https://iris.who.int/handle/10665/331901
- WHO-5 Well-Being Index: https://www.who.int/publications/m/item/WHO-UCN-MSD-MHE-2024.01
- Cochrane, Behavioural activation therapy for depression in adults: https://www.cochrane.org/evidence/CD013305_behavioural-activation-therapy-depression-adults
- 厚生労働省「まもろうよ こころ」相談窓口: https://www.mhlw.go.jp/mamorouyokokoro/soudan/
- 厚生労働省「こころの耳」: https://kokoro.mhlw.go.jp/
