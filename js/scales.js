/* Extracted from ACT_tool/index.html for the integrated personal-use tool. */
const isNum = (n) => typeof n === 'number' && Number.isFinite(n);
const Scoring = {
  /* AAQ-II: 7 items, 1-7, sum 7-49, higher = more avoidance/inflexibility */
  scoreAAQ2(responses){
    const ids = ['AAQ2_01','AAQ2_02','AAQ2_03','AAQ2_04','AAQ2_05','AAQ2_06','AAQ2_07'];
    if(!ids.every(id => isNum(responses[id]) && responses[id]>=1 && responses[id]<=7)) return null;
    const total = ids.reduce((s,id)=> s+Number(responses[id]), 0);
    return { scale:'AAQ-II', total, min:7, max:49,
      interpretation: total<=14 ? '回避傾向は相対的に低めです。'
                    : total<=28 ? '回避傾向が中程度に見られます。'
                                : '回避傾向が高めに出ています。受容・脱フュージョン・価値行動の短いワークが役立つかもしれません。' };
  },

  /* CFQ: 13 items 1-7. Returns both 7-item and 13-item subscales. */
  scoreCFQ(responses, variant='cfq7'){
    const cfq7 = ['CFQ_01','CFQ_02','CFQ_04','CFQ_05','CFQ_07','CFQ_10','CFQ_13'];
    const cfq13_fusion = ['CFQ_01','CFQ_02','CFQ_04','CFQ_05','CFQ_07','CFQ_08','CFQ_10','CFQ_11','CFQ_13'];
    const cfq13_defusion = ['CFQ_03','CFQ_06','CFQ_09','CFQ_12'];
    const valid = (ids)=> ids.every(id => isNum(responses[id]) && responses[id]>=1 && responses[id]<=7);
    const sum = (ids)=> ids.reduce((s,id)=>s+Number(responses[id]),0);
    if(variant==='cfq7'){
      if(!valid(cfq7)) return null;
      const total = sum(cfq7);
      return { scale:'CFQ-7', total, min:7, max:49,
        interpretation: total<=21 ? '思考と程よく距離が取れている傾向です。'
                      : total<=35 ? '思考への巻き込まれは中程度です。'
                                  : '思考にかなり巻き込まれやすい傾向があります。「〜という考え」ワークが役立つことがあります。' };
    } else {
      if(!valid([...cfq13_fusion, ...cfq13_defusion])) return null;
      const fusion = sum(cfq13_fusion);
      const defusion = sum(cfq13_defusion);
      return { scale:'CFQ-13', fusion, defusion,
        fusion_max:63, defusion_max:28,
        interpretation:'高いフュージョンは思考への巻き込まれ、高い脱フュージョンは思考と自己の弁別を示します（参考目安）。' };
    }
  },

  /* TSSQ: 20 items 1-7, 4 subscales (no total) */
  scoreTSSQ(responses){
    const subs = {
      active:           ['TSSQ_03','TSSQ_09','TSSQ_10','TSSQ_14','TSSQ_16','TSSQ_17','TSSQ_20'],
      conceptualized_self:['TSSQ_02','TSSQ_07','TSSQ_08','TSSQ_11','TSSQ_12','TSSQ_18'],
      perspective_taking:['TSSQ_01','TSSQ_04','TSSQ_06'],
      present_moment:   ['TSSQ_05','TSSQ_13','TSSQ_15','TSSQ_19'],
    };
    const all = Object.values(subs).flat();
    if(!all.every(id => isNum(responses[id]) && responses[id]>=1 && responses[id]<=7)) return null;
    const sum = ids => ids.reduce((s,id)=>s+Number(responses[id]),0);
    return { scale:'TSSQ',
      active: sum(subs.active),
      conceptualized_self: sum(subs.conceptualized_self),
      perspective_taking: sum(subs.perspective_taking),
      present_moment: sum(subs.present_moment),
      note:'下位尺度ごとの参考スコアです。合計点は算出しません。' };
  },

  /* FFMQ-39: 5 subscales, 5-point Likert. Reverse on certain items. */
  scoreFFMQ(responses){
    const observing = ['FFMQ_01','FFMQ_06','FFMQ_11','FFMQ_15','FFMQ_20','FFMQ_26','FFMQ_31','FFMQ_36'];
    const nonreact  = ['FFMQ_04','FFMQ_09','FFMQ_19','FFMQ_21','FFMQ_24','FFMQ_29','FFMQ_33'];
    const nonjudge_R= ['FFMQ_03','FFMQ_10','FFMQ_14','FFMQ_17','FFMQ_25','FFMQ_30','FFMQ_35','FFMQ_39'];
    const describing= [{id:'FFMQ_02'},{id:'FFMQ_07'},{id:'FFMQ_12',r:true},{id:'FFMQ_16',r:true},{id:'FFMQ_22',r:true},{id:'FFMQ_27'},{id:'FFMQ_32'},{id:'FFMQ_37'}];
    const acting_R  = ['FFMQ_05','FFMQ_08','FFMQ_13','FFMQ_18','FFMQ_23','FFMQ_28','FFMQ_34','FFMQ_38'];
    const ids = [...observing, ...nonreact, ...nonjudge_R, ...describing.map(x=>x.id), ...acting_R];
    if(!ids.every(id => isNum(responses[id]) && responses[id]>=1 && responses[id]<=5)) return null;
    const raw = id => Number(responses[id]);
    const r = id => 6 - raw(id);
    const sumR = ids => ids.reduce((s,id)=>s+raw(id),0);
    const sumRev = ids => ids.reduce((s,id)=>s+r(id),0);
    const sumMixed = arr => arr.reduce((s,o)=> s + (o.r?r(o.id):raw(o.id)),0);
    return { scale:'FFMQ-39',
      observing: sumR(observing),
      nonreactivity: sumR(nonreact),
      nonjudging: sumRev(nonjudge_R),
      describing: sumMixed(describing),
      acting_with_awareness: sumRev(acting_R),
      note:'各下位尺度の参考スコアです。'
    };
  },

  /* WHO-5: 5 items 0-5; sum 0-25; *4 = 0-100 percent. Recommend MDI if <13. */
  scoreWHO5(responses){
    const ids = ['WHO5_01','WHO5_02','WHO5_03','WHO5_04','WHO5_05'];
    if(!ids.every(id => isNum(responses[id]) && responses[id]>=0 && responses[id]<=5)) return null;
    const total = ids.reduce((s,id)=>s+Number(responses[id]),0);
    const percent = total * 4;
    const anyZeroOne = ids.some(id => responses[id]<=1);
    let interpretation = total<13
      ? 'ウェルビーイングが低めの傾向です。気分・睡眠・興味の領域でケアの余地がありそうです。続く場合は医療機関や専門家への相談を検討してください。'
      : 'ウェルビーイングは比較的良好な範囲です。';
    if(anyZeroOne) interpretation += '（1つ以上の項目で「ほんのたまに」または「まったくない」が選ばれています。継続的なら相談をご検討ください。）';
    return { scale:'WHO-5', total, percent, min:0, max:25,
      caution_flag: total<13 || anyZeroOne, interpretation };
  },

  /* VQ: 10 items 0-6; Progress: 3,4,5,7,9; Obstruction: 1,2,6,8,10 */
  scoreVQ(responses){
    const progress = ['VQ_03','VQ_04','VQ_05','VQ_07','VQ_09'];
    const obstruction = ['VQ_01','VQ_02','VQ_06','VQ_08','VQ_10'];
    const all = [...progress, ...obstruction];
    if(!all.every(id => isNum(responses[id]) && responses[id]>=0 && responses[id]<=6)) return null;
    const sum = ids => ids.reduce((s,id)=>s+Number(responses[id]),0);
    const prog = sum(progress);
    const obst = sum(obstruction);
    return { scale:'VQ', progress: prog, obstruction: obst, max:30,
      interpretation: `価値に沿った行動（Progress）：${prog}/30、価値から逸れる妨げ（Obstruction）：${obst}/30。Progressが高く、Obstructionが低いほど、価値に沿って動けている傾向を示します。` };
  }
};

/* ============================================================
   Scale definitions (items)
============================================================ */
const SCALES = {
  'AAQ-II': {
    name:'AAQ-II（経験的回避・心理的非柔軟性）',
    min:1, max:7,
    labels:['全くそうではない','めったにそうではない','ほとんどそうではない','ときどきそうである','たびたびそうである','たいていそうである','常にそうである'],
    minLabel:'全くない', maxLabel:'常にある',
    purpose:'苦しい経験への回避傾向と心理的柔軟性を振り返ります。',
    duration:'約2分',
    items:[
      {id:'AAQ2_01', text:'自分の苦しい経験や記憶は、私が大事にしている生活を送ることを困難にする。'},
      {id:'AAQ2_02', text:'自分の感情に恐れを感じる。'},
      {id:'AAQ2_03', text:'自分の悩みや感情をコントロールできないことについて心配する。'},
      {id:'AAQ2_04', text:'自分の苦しい経験は、充実した生活を送ることの妨げとなる。'},
      {id:'AAQ2_05', text:'感情は私の人生における問題の原因となる。'},
      {id:'AAQ2_06', text:'多くの人は自分よりもうまく人生と付き合っているようである。'},
      {id:'AAQ2_07', text:'心配することは私の成功の妨げとなる。'},
    ],
    score: (r) => Scoring.scoreAAQ2(r),
  },
  'CFQ-7': {
    name:'CFQ-7（認知的フュージョン 7項目版）',
    min:1, max:7,
    labels:['全くあてはまらない','極まれにあてはまる','まれにあてはまる','時にあてはまる','かなりあてはまる','ほとんどいつもあてはまる','いつもあてはまる'],
    minLabel:'あてはまらない', maxLabel:'いつもあてはまる',
    purpose:'思考への巻き込まれやすさ（フュージョン）を振り返ります。',
    duration:'約2分',
    items:[
      {id:'CFQ_01', text:'自分の思考が、苦悩や心の痛みの原因になっている。'},
      {id:'CFQ_02', text:'考えていることに囚われすぎて、自分が一番したいことができない。'},
      {id:'CFQ_04', text:'自分に役に立たないほどに、状況の分析をしすぎてしまう。'},
      {id:'CFQ_05', text:'自分自身の考えと苦闘する。'},
      {id:'CFQ_07', text:'特定のことを考えてしまうことで、自分が動揺する。'},
      {id:'CFQ_10', text:'自分の考えにかなり巻き込まれがちだ。'},
      {id:'CFQ_13', text:'動揺するような考えに執着しない方が役立つと分かっていても、そうすることに苦労する。'},
    ],
    score: (r) => Scoring.scoreCFQ(r, 'cfq7'),
  },
  'CFQ-13': {
    name:'CFQ-13（認知的フュージョン 13項目版）',
    min:1, max:7,
    labels:['全くあてはまらない','極まれにあてはまる','まれにあてはまる','時にあてはまる','かなりあてはまる','ほとんどいつもあてはまる','いつもあてはまる'],
    minLabel:'あてはまらない', maxLabel:'いつもあてはまる',
    purpose:'フュージョンと脱フュージョンの両側面を振り返ります。',
    duration:'約3分',
    items:[
      {id:'CFQ_01', text:'自分の思考が、苦悩や心の痛みの原因になっている。'},
      {id:'CFQ_02', text:'考えていることに囚われすぎて、自分が一番したいことができない。'},
      {id:'CFQ_03', text:'自分を苦しめる考えを持っているときでも、結局その考え自体はそれほど重要ではないと気づいている。'},
      {id:'CFQ_04', text:'自分に役に立たないほどに、状況の分析をしすぎてしまう。'},
      {id:'CFQ_05', text:'自分自身の考えと苦闘する。'},
      {id:'CFQ_06', text:'動揺するようなことを考えたときでも、その考えが文字通りの事実ではないかもしれないと理解できる。'},
      {id:'CFQ_07', text:'特定のことを考えてしまうことで、自分が動揺する。'},
      {id:'CFQ_08', text:'頭に浮かぶ考えはコントロールする必要がある。'},
      {id:'CFQ_09', text:'違う観点から自分の考えを見ることは容易である。'},
      {id:'CFQ_10', text:'自分の考えにかなり巻き込まれがちだ。'},
      {id:'CFQ_11', text:'自分の考えに対し、あまりに強く反応してしまいがちである。'},
      {id:'CFQ_12', text:'自分自身に対して否定的な考えを持ちながら、それでもなお自分は満足のいく人間だと理解していることは可能である。'},
      {id:'CFQ_13', text:'動揺するような考えに執着しない方が役立つと分かっていても、そうすることに苦労する。'},
    ],
    score: (r) => Scoring.scoreCFQ(r, 'cfq13'),
  },
  'TSSQ': {
    name:'TSSQ（三つの自己の体験尺度）',
    min:1, max:7,
    labels:['全くそうではない','めったにそうではない','ほとんどそうではない','ときどきそうである','たびたびそうである','たいていそうである','常にそうである'],
    minLabel:'全くない', maxLabel:'常にある',
    purpose:'柔軟な行動・概念化された自己・視点取り・今この瞬間の4側面を振り返ります（合計点は出しません）。',
    duration:'約4分',
    items:[
      {id:'TSSQ_01', text:'自分のことを客観的に見ている自分を感じる。'},
      {id:'TSSQ_02', text:'人と接するとき、その人に対して、自分が抱くイメージのフィルターをかけている。'},
      {id:'TSSQ_03', text:'状況に応じて臨機応変に対応する。'},
      {id:'TSSQ_04', text:'自分が感じていることや考えていることを、距離を置いて眺める。'},
      {id:'TSSQ_05', text:'日々新しい自分が生まれるのを感じる。'},
      {id:'TSSQ_06', text:'他人を見るように、距離をおいて自分を眺める。'},
      {id:'TSSQ_07', text:'自分自身に関わる思考や感情に振り回される。'},
      {id:'TSSQ_08', text:'自分の将来を考えることや、過去を振り返ることに没頭する。'},
      {id:'TSSQ_09', text:'一つの考え方だけでなく、さまざまなものの見方をする。'},
      {id:'TSSQ_10', text:'問題を解決するとき、今、自分ができることに焦点を当てる。'},
      {id:'TSSQ_11', text:'他者から与えられる、自分自身に関する評価を気にする。'},
      {id:'TSSQ_12', text:'自分は○○だから、と決めつけて行動する。'},
      {id:'TSSQ_13', text:'今、ここで起こっていることを生き生きと感じる。'},
      {id:'TSSQ_14', text:'自分の考えていることや感じていることを、他人に伝わるように説明できる。'},
      {id:'TSSQ_15', text:'考えるよりも感じることが得意だ。'},
      {id:'TSSQ_16', text:'広い視野を持って、自分の人生の方向性に合った行動を選択する。'},
      {id:'TSSQ_17', text:'様々な物事に気を配り、客観的に見る。'},
      {id:'TSSQ_18', text:'固定的な自己イメージを持っている。'},
      {id:'TSSQ_19', text:'自分の内面や、自分の周囲で起きていることが、絶えず変化していく様子を捉える。'},
      {id:'TSSQ_20', text:'他人の気持ちを、その人の立場に立って理解できる。'},
    ],
    score: (r) => Scoring.scoreTSSQ(r),
  },
  'FFMQ-39': {
    name:'FFMQ-39（マインドフルネス5側面尺度）',
    min:1, max:5,
    labels:['まったくあてはまらない','めったにあてはまらない','たまにあてはまる','しばしばあてはまる','いつもあてはまる'],
    minLabel:'まったくない', maxLabel:'いつもある',
    purpose:'観察・描写・意識的行動・非判断・非反応の5側面を振り返ります。',
    duration:'約7分',
    items:[
      {id:'FFMQ_01', text:'歩いているときに、自分の身体が動いている感覚に意識的に注意を向ける。'},
      {id:'FFMQ_02', text:'自分の感情を表現する言葉を見つけるのが得意である。'},
      {id:'FFMQ_03', text:'不合理または不適切な感情をいだいたことで自分を責める。'},
      {id:'FFMQ_04', text:'自分の気分や感情に気づきつつ、それにどうしても反応してしまうということはない。'},
      {id:'FFMQ_05', text:'何かをする時、意識がどこかにそれて簡単に気が散る。'},
      {id:'FFMQ_06', text:'シャワーや入浴時、お湯が身体に当たる感覚に敏感である。'},
      {id:'FFMQ_07', text:'私は、簡単に自分の信念、意見、期待を言葉にできる。'},
      {id:'FFMQ_08', text:'空想や心配で気が散り、自分がやっていることに注意を向けていない。'},
      {id:'FFMQ_09', text:'感情を見守っていても、その中に迷い込むことはない。'},
      {id:'FFMQ_10', text:'自分の感じ方に対して、そんなふうに感じるべきではないと自分に言い聞かせる。'},
      {id:'FFMQ_11', text:'食べ物や飲み物が、自分の考え・身体・感情にどう影響するかに気づく。'},
      {id:'FFMQ_12', text:'自分が考えていることを表現する言葉を見つけるのは難しい。'},
      {id:'FFMQ_13', text:'簡単に気が散る。'},
      {id:'FFMQ_14', text:'自分の考えの一部は異常か悪いものだと思い、そう考えるべきではないと思う。'},
      {id:'FFMQ_15', text:'髪に吹く風や、顔に当たる日光などの感覚に注意を向ける。'},
      {id:'FFMQ_16', text:'自分が物事についてどう感じているかを表現する言葉を思いつくのに苦労する。'},
      {id:'FFMQ_17', text:'自分の考えが良いか悪いか判断する。'},
      {id:'FFMQ_18', text:'目の前で起きていることに集中し続けるのが難しいと感じる。'},
      {id:'FFMQ_19', text:'つらい考えやイメージが浮かんだとき、心を占領されることなく、一歩下がってそれらを意識しておく。'},
      {id:'FFMQ_20', text:'時計の音や鳥のさえずり、車の音などに注意を向ける。'},
      {id:'FFMQ_21', text:'難しい状況で、慌てて反応することなく、一呼吸おくことができる。'},
      {id:'FFMQ_22', text:'自分の身体に何かを感じても、ぴったりの言葉を見つけられず、表現するのが難しい。'},
      {id:'FFMQ_23', text:'自分がしていることをあまり意識せず「自動操縦」で動いている。'},
      {id:'FFMQ_24', text:'つらい考えやイメージが浮かんでも、たいていじきに気持ちが落ち着く。'},
      {id:'FFMQ_25', text:'自分の考え方に対して、そんなふうに考えるべきではないと自分に言い聞かせる。'},
      {id:'FFMQ_26', text:'物事の匂いや香りに気づく。'},
      {id:'FFMQ_27', text:'ひどく混乱した時でさえ、何とかそれを言葉で表現できる。'},
      {id:'FFMQ_28', text:'十分に注意を払わずに、性急に物事をすすめる。'},
      {id:'FFMQ_29', text:'つらい考えやイメージが浮かんだとき、何とかしようとせずただそれらを見つめられる。'},
      {id:'FFMQ_30', text:'自分の感情のいくつかは不適当であり、それらを感じるべきではないと思う。'},
      {id:'FFMQ_31', text:'芸術や自然をみるとき、色・形・質感・光と影に注意を向ける。'},
      {id:'FFMQ_32', text:'自分の体験を言葉で表現する傾向をうまれもっている。'},
      {id:'FFMQ_33', text:'つらい考えやイメージが浮かんだとき、気づくだけで放っておく。'},
      {id:'FFMQ_34', text:'自分がしていることに注意を払わずに自動的に仕事をしている。'},
      {id:'FFMQ_35', text:'辛い考えが浮かんだとき、その内容によって自分が良かったのか悪かったのかを評価する。'},
      {id:'FFMQ_36', text:'自分の感情が自分の考えや行動にどう影響するかに注意を向ける。'},
      {id:'FFMQ_37', text:'たいてい現在自分がどのように感じているかをかなり詳細に表現できる。'},
      {id:'FFMQ_38', text:'気がつくと、注意を払わずに何かをしている。'},
      {id:'FFMQ_39', text:'不合理な考えをいだいた時、自分に不満をいだく。'},
    ],
    score: (r) => Scoring.scoreFFMQ(r),
  },
  'WHO-5': {
    name:'WHO-5（精神的健康状態表）',
    min:0, max:5,
    labels:['まったくない','ほんのたまに','半分以下の期間を','半分以上の期間を','ほとんどいつも','いつも'],
    minLabel:'まったくない', maxLabel:'いつも',
    purpose:'最近2週間のあなたのウェルビーイングを振り返ります。',
    duration:'約1分',
    instruction:'以下の5つの各項目について、最近2週間のあなたの状態に最も近いものを選んでください。',
    items:[
      {id:'WHO5_01', text:'明るく、楽しい気分で過ごした。'},
      {id:'WHO5_02', text:'落ち着いた、リラックスした気分で過ごした。'},
      {id:'WHO5_03', text:'意欲的で、活動的に過ごした。'},
      {id:'WHO5_04', text:'ぐっすりと休め、気持ちよくめざめた。'},
      {id:'WHO5_05', text:'日常生活の中に、興味のあることがたくさんあった。'},
    ],
    score: (r) => Scoring.scoreWHO5(r),
  },
  'VQ': {
    name:'VQ（価値に沿った行動の質問票）',
    min:0, max:6,
    labels:['まったく当てはまらない','ほぼ当てはまらない','少し当てはまる','ある程度当てはまる','かなり当てはまる','ほとんど完全に当てはまる','完全に当てはまる'],
    minLabel:'当てはまらない', maxLabel:'完全に当てはまる',
    purpose:'過去1週間、価値に沿って生きられていたかを振り返ります（Smout et al. 2014 に基づく作業翻訳）。',
    duration:'約2分',
    instruction:'過去1週間について、それぞれの項目がどの程度あなたに当てはまっていたかを評価してください。',
    items:[
      {id:'VQ_01', text:'過去や未来のことを考えるのに多くの時間を使い、自分にとって大切な活動に取り組めなかった。'},
      {id:'VQ_02', text:'ほとんどの時間、私は「自動操縦」のように行動していた。'},
      {id:'VQ_03', text:'やる気を感じなくても、自分の目標に向かって努力した。'},
      {id:'VQ_04', text:'自分の生き方を誇りに思えた。'},
      {id:'VQ_05', text:'自分が最も大切にしている領域で、進展があった。'},
      {id:'VQ_06', text:'困難な思考・感情・記憶が、本当にやりたいことの妨げになった。'},
      {id:'VQ_07', text:'自分がなりたい人物像に、少しずつ近づき続けた。'},
      {id:'VQ_08', text:'計画通りに進まなかったとき、簡単にあきらめてしまった。'},
      {id:'VQ_09', text:'自分の人生に目的があると感じた。'},
      {id:'VQ_10', text:'自分にとって重要なことに集中せず、ただ「やり過ごしている」だけのように感じた。'},
    ],
    score: (r) => Scoring.scoreVQ(r),
  },
};

window.ACT_SCORING = Scoring;
window.ACT_SCALES = SCALES;
