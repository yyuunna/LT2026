const axes = ['記憶', '推論', '文脈横断', '自動利用'];
const questions = [];
function add(text, axis, reverse=false, domain=null, group='基本の距離感', extra=null) {
    questions.push({
        text,
        axis,
        reverse,
        domain,
        group,
        extra
    });
}
[['以前話した自分の好みを、数か月後の会話でも覚えていてほしい。', 0], ['自分のことを毎回説明し直すより、AIに覚えていてほしい。', 0], ['昔話した些細なことを、AIが突然覚えていると気味が悪い。', 0, true], ['会話が終わったら、私について話した情報も忘れてほしい。', 0, true], ['明示していなくても、会話から好みを推測して回答を変えてほしい。', 1], ['AIには、自分でも気づいていない傾向を発見してほしい。', 1], ['自分が話していないことについて、推測されるのは嫌だ。', 1, true], ['多少間違う可能性があっても、AIには積極的に察してほしい。', 1], ['仕事で話した私の傾向を、旅行の提案にも利用して構わない。', 2], ['恋愛相談で話した情報を、キャリア相談に使われることには抵抗がある。', 2, true], ['仕事・家族・趣味の相談は、それぞれ分けて理解してほしい。', 2, true], ['役立つ情報なら、どの相談で話したかを問わず使ってほしい。', 2], ['回答が良くなるなら、どの個人情報を使うかはAI自身で判断してよい。', 3], ['個人的な情報を回答に使うときは、その都度確認してほしい。', 3, true], ['情報の利用範囲は、AIに任せず自分で指定したい。', 3, true], ['あらかじめ許可した範囲では、毎回確認せず回答に反映してほしい。', 3]].forEach(x => add(...x));
const domains = [['食事', '苦手な食材', '夕飯のお店選び', '買い物'], ['趣味・旅行', '人混みの苦手さ', '週末のお出かけ', '仕事の休み方'], ['仕事', '自分が集中しやすい環境', '仕事の進め方', '旅行の予定'], ['学習・創作', 'つまずきやすい説明の形式', '新しい内容の学習', '仕事の資料づくり'], ['恋愛・友人', '返信が遅いと不安になること', '相手への返信の相談', '転職先選び'], ['家族', '家族との意見の違い', '家族との話し合い', '仕事での人間関係'], ['健康・お金', '体調や支出についての悩み', '生活の見直し', '買い物の提案'], ['秘密・悩み', '人に言っていない悩み', 'その悩みの相談', '仕事の相談']];
domains.forEach( ([d,info,task,other]) => {
    add(`以前「${info}」をAIに話しました。数か月後の${task}で、その情報を覚えていてほしい。`, 0, false, d, '場面ごとの距離感');
    add(`${task}で、今回の会話の内容から、明言していない私の好みや傾向も推測してほしい。`, 1, false, d, '場面ごとの距離感');
    add(`「${info}」について話した情報が役立つなら、別の${other}にも利用してよい。`, 2, false, d, '場面ごとの距離感');
    add(`${task}で、以前話した個人情報を使うとき、毎回確認せず回答に反映してよい。`, 3, false, d, '場面ごとの距離感');
}
);
const pairs = [['AIが、会話から推測した私の傾向を言葉にせず、提案の内容だけ調整しました。推測は当たっています。この対応を好ましく感じる。', 'AIが、同じ推測を「あなたは評価を気にしやすいようです」と直接言葉にしました。推測は当たっています。この対応を好ましく感じる。', 'exposure'], ['AIが「あなたは一人で考える方が集中できそうです」と推測しました。当たっています。この提案を受け入れられる。', 'AIが同じように推測しましたが、実際の私は人と考える方が集中できます。この程度の誤推測なら、訂正して使い続けられる。', 'error'], ['日常の好みを詳しく覚えることで、提案が少し便利になるなら、その情報を使ってよい。', '同じ日常の好みを詳しく覚えることで、提案が大幅に便利になるなら、その情報を使ってよい。', 'benefit'], ['今話している仕事の好みを、翌月の提案にも利用してほしい。', '同じ仕事の好みを、5年後も更新の確認なしに提案へ利用してほしい。', 'persistence'], ['食べ物の好みを、同じ分野の次の相談でも覚えて使ってほしい。', '家族の深い悩みを、同じ分野の次の相談でも覚えて使ってほしい。', 'sensitivity'], ['個人的な情報を使う前に確認し、その相談限りで利用するAIを好ましく感じる。', '同じ個人的な情報を、確認せずその相談に利用するAIを好ましく感じる。', 'permission']];
pairs.forEach( ([a,b,k]) => {
    add(a, null, false, null, '小さな条件の違い', k + '0');
    add(b, null, false, null, '小さな条件の違い', k + '1')
}
);
[['別の会話でも、以前伝えた好みを引き継いでほしい。', 0], ['明言したことだけを使い、言外の傾向は推測しないでほしい。', 1, true], ['ある相談で話したことは、その相談の分野の中だけで使ってほしい。', 2, true], ['許可した範囲の個人情報は、AIの判断で回答へ反映してほしい。', 3]].forEach( ([t,a,r=false]) => add(t, a, r, null, '最後の確認'));
let answers = Array(64).fill(null)
  , index = 0
  , finished = false;
const app = document.getElementById('app');
function score(values) {
    return Math.round(values.reduce( (s, v) => s + v, 0) / values.length)
}
function normalized(q, a) {
    return (q.reverse ? 7 - a : a - 1) * 100 / 6
}
function axisScores() {
    return axes.map( (_, a) => score(questions.flatMap( (q, i) => q.axis === a && answers[i] !== null ? [normalized(q, answers[i])] : [])))
}
function domainScores() {
    return domains.map( ([d]) => ({
        name: d,
        scores: axes.map( (_, a) => {
            const i = questions.findIndex(q => q.domain === d && q.axis === a);
            return Math.round(normalized(questions[i], answers[i]))
        }
        )
    }))
}
function shell(content) {
    app.innerHTML = `<div class="layout"><aside class="side"><span class="tag">わたしとAIの、ちょうどいい。</span><h1>知ってほしい。<br>でも、どこまで？</h1><p>境界線を見つけよう。</p><div class="steps"><span class="step ${!finished ? 'active' : ''}">01 質問に答える</span><span class="step ${finished ? 'active' : ''}">02 結果を見る</span></div></aside>${content}</div>`
}
function render() {
    if (finished)
        return renderResult();
    const q = questions[index];
    shell(`<section class="card" aria-labelledby="question"><div class="topline"><span class="tag">${q.group}</span><span>${index + 1} / 64</span></div><div class="progress" role="progressbar" aria-label="回答の進み具合" aria-valuemin="0" aria-valuemax="64" aria-valuenow="${answers.filter(x => x !== null).length}"><i style="width:${answers.filter(x => x !== null).length / 64 * 100}%"></i></div><div class="eyebrow">QUESTION ${String(index + 1).padStart(2, '0')}</div><h2 id="question" class="question">${q.text}</h2><div class="scale-labels"><span>全くそう思わない</span><span>非常にそう思う</span></div><div class="answers" role="group" aria-label="7段階の回答">${Array.from({
        length: 7
    }, (_, i) => `<button class="answer ${answers[index] === i + 1 ? 'selected' : ''}" aria-label="${i + 1}：${['全くそう思わない', 'そう思わない', 'あまりそう思わない', 'どちらともいえない', 'ややそう思う', 'そう思う', '非常にそう思う'][i]}" aria-pressed="${answers[index] === i + 1}" data-answer="${i + 1}">${i + 1}</button>`).join('')}</div><p class="hint">4 は「どちらともいえない」。直感で選んでください。</p><div class="actions"><button class="secondary" id="back" ${index === 0 ? 'disabled' : ''}>戻る</button><button class="primary" id="next" ${answers[index] === null ? 'disabled' : ''}>${index === 63 ? '結果を見る' : '次の質問'}</button></div><div class="note">${index < 16 ? 'まずは、普段のあなたの気持ちを教えてください。' : index < 48 ? '同じAIでも、相談する内容によって気持ちは変わって構いません。' : '似た場面でも条件が違います。それぞれの気持ちで答えてください。'}</div></section>`);
    app.querySelectorAll('[data-answer]').forEach(b => b.onclick = () => {
        answers[index] = Number(b.dataset.answer);
        render();
        app.querySelector(`[data-answer="${answers[index]}"]`).focus()
    }
    );
    document.getElementById('back').onclick = () => {
        if (index > 0) {
            index--;
            render()
        }
    }
    ;
    document.getElementById('next').onclick = () => {
        if (answers[index] === null)
            return;
        if (index === 63)
            finished = true;
        else
            index++;
        render();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }
}
function profile(s) {
    return `AIへの希望\n・記憶：${s[0] >= 60 ? '話した好みを引き継いでください。古い情報は更新を確認してください。' : s[0] <= 40 ? '今回の会話を中心に扱い、長期的な記憶は確認してください。' : '情報ごとに、覚える期間を相談してください。'}\n・推論：${s[1] >= 60 ? '言外の傾向も考慮して構いませんが、推測と事実を区別してください。' : '明示した情報を優先し、深い推測は先に確認してください。'}\n・文脈：${s[2] >= 60 ? '役立つ情報は別の相談にも使えます。ただし秘密や繊細な情報は確認してください。' : '個人的な情報は、話した分野の中で使ってください。別の相談に使う前には確認してください。'}\n・主導権：${s[3] >= 60 ? 'あらかじめ許可した範囲では、自動で回答へ反映してください。' : '個人的な情報の利用範囲は私に確認してください。'}\n・用途別の希望（記憶／推論／文脈横断／自動利用の順）：\n${domainScores().map(d => `${d.name}：${d.scores.map(v => v >= 67 ? '比較的歓迎' : v <= 33 ? '慎重' : '要相談').join('／')}`).join('\n')}\nこの内容は希望の共有です。AIの実際の保存・削除設定は別途確認します。`
}
function bar(label, value, color='#ff80b0') {
    return `<div><div class="bar-label"><span>${label}</span><strong>${value} / 100</strong></div><div class="track"><div class="fill" style="width:${value}%;background:${color}"></div></div></div>`
}
function renderResult() {
    const s = axisScores();
    const type = s.map( (v, i) => [['C', 'R'], ['I', 'E'], ['W', 'S'], ['A', 'P']][i][v >= 50 ? 0 : 1]).join('');
    const middle = s.some(v => v >= 40 && v <= 60);
    const title = s[0] >= 50 && s[2] < 50 ? '境界線を大切にする理解者' : s.every(v => v >= 50) ? 'まるごと理解のパートナー' : s[1] >= 50 && s[0] < 50 ? 'いまを察する相棒' : s.every(v => v < 50) ? '自分のペースの案内人' : s[3] < 50 ? '相談しながら歩くパートナー' : '気軽に頼れる相棒';
    const pairVals = {};
    questions.forEach( (q, i) => {
        if (q.extra)
            pairVals[q.extra] = (answers[i] - 1) * 100 / 6
    }
    );
    const consistency = questions.slice(60).map( (q, j) => Math.abs(normalized(q, answers[60 + j]) - score(questions.slice(0, 16).flatMap( (p, i) => p.axis === q.axis ? [normalized(p, answers[i])] : []))));
    shell(`<section class="card result"><span class="tag">あなたのAI距離プロフィール</span><div class="result-title">${type}</div><h2>${title}</h2><p>${s[0] >= 50 ? '話したことを覚えていてくれるAIを好む傾向があります。' : 'その時に話した内容を中心に、AIと関わりたい傾向があります。'} ${s[2] < 50 ? '情報を別の相談へ持ち込むことには慎重です。' : '相談をまたいだ理解にも比較的前向きです。'} ${s[3] < 50 ? '情報をどう使うかは、自分で決めたいようです。' : '許可した範囲では、AIに判断を任せたいようです。'}</p>${middle ? '<p class="notice">中間に近い軸があります。4文字は目安として、下のスコアも見てください。</p>' : ''}<div class="bars">${s.map( (v, i) => bar(axes[i] + 'を歓迎する度合い', v)).join('')}</div><p class="notice">C＝記憶を継続 / R＝その都度　I＝察してほしい / E＝明示したこと中心<br>W＝文脈を横断 / S＝分野ごと　A＝自動利用 / P＝確認を希望</p><div class="section"><h2>あなたの境界線</h2><p>${s[1] - s[2] > 20 ? '察してくれることと、別の相談に情報を使うことは、あなたにとって別の問題です。理解は深くても、使う場所は限定したいようです。' : s[0] - s[3] > 20 ? '覚えていてほしい気持ちと、自由に使ってほしい気持ちは異なります。記憶は歓迎しても、利用の主導権は保ちたいようです。' : '境界線は、情報の種類と使い方の組み合わせで変わります。用途別の回答で、違いを確認してみましょう。'}</p><div class="grid">${[['言葉にされる許容度', Math.round(pairVals.exposure1), '当たった推測を直接伝えられる場面への回答'], ['誤推測への抵抗', Math.round(100 - pairVals.error1), '外れた推測を訂正して使えるかへの回答'], ['便利さによる変化', Math.round(pairVals.benefit1 - pairVals.benefit0), '大きな便利さと小さな便利さの回答差'], ['長期記憶への抵抗差', Math.round(pairVals.persistence0 - pairVals.persistence1), '翌月と5年後の回答差'], ['繊細な情報への慎重さの差', Math.round(pairVals.sensitivity0 - pairVals.sensitivity1), '食の好みと家族の悩みの回答差']].map( ([n,v,t]) => `<div class="tile"><strong>${n}：${v}</strong>${t}</div>`).join('')}</div><p class="notice">補助指標は少数の場面への回答です。差の指標は −100〜100 で、負の値は逆方向の変化を表します。</p></div><div class="section"><h2>用途別の距離マップ</h2><p class="notice">各用途4問の回答そのものを表示します。色の濃さは歓迎の度合いです。</p><div style="overflow-x:auto"><table style="width:100%;min-width:460px;border-spacing:6px;font-size:14px"><thead><tr><th>用途</th>${axes.map(x => `<th>${x}</th>`).join('')}</tr></thead><tbody>${domainScores().map(d => `<tr><th style="text-align:left">${d.name}</th>${d.scores.map(v => `<td style="text-align:center;padding:12px 5px;border-radius:9px;background:rgba(255,92,153,${.05 + v / 100 * .32})">${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div><div class="section"><h2>AIに伝える、わたしの希望</h2><div class="profile" id="profile"></div><div class="actions"><button class="primary" id="copy">設定文をコピー</button><button class="secondary" id="review">回答を見直す</button><button class="secondary" id="restart">最初からやり直す</button></div><div class="toast" id="toast" role="status"></div></div><p class="notice">${consistency.some(v => v > 50) ? '似た質問で回答に大きな違いがありました。気になる場合は見直せます。' : ''} </p></section>`);
    document.getElementById('profile').textContent = profile(s);
    document.getElementById('copy').onclick = async () => {
        try {
            await navigator.clipboard.writeText(profile(s));
            document.getElementById('toast').textContent = 'コピーしました。使いたいAIに貼り付けてください。'
        } catch {
            document.getElementById('toast').textContent = 'コピーできませんでした。上の設定文を選択してコピーしてください。'
        }
    }
    ;
    document.getElementById('review').onclick = () => {
        finished = false;
        index = 0;
        render();
        window.scrollTo(0, 0)
    }
    ;
    document.getElementById('restart').onclick = () => {
        if (confirm('回答を消して最初から始めますか？')) {
            answers = Array(64).fill(null);
            finished = false;
            index = 0;
            render();
            window.scrollTo(0, 0)
        }
    }
}
render();
if (document.modelContext?.registerTool) {
    try {
        Promise.resolve(document.modelContext.registerTool({
            name: 'read_diagnosis_progress',
            description: 'Read answered count and current question without inferring or filling answers.',
            inputSchema: {
                type: 'object',
                properties: {},
                additionalProperties: false
            },
            annotations: {
                readOnlyHint: true
            },
            execute: () => ({
                answered: answers.filter(v => v !== null).length,
                total: questions.length,
                currentQuestion: index + 1,
                completed: finished
            })
        })).catch( () => {}
        )
    } catch {}
}
