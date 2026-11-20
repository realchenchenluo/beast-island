/* 万灵屿 - 界面渲染与交互（v2 大世界版） */
(function () {
  'use strict';

  var D = window.GAME_DATA;
  var C = D.CONFIG;
  var Art = window.Art;
  var Core = window.Core;

  var currentScreen = 'world';
  var bagTab = 'equip';
  var bagReturn = 'world';
  var shopReturn = 'world';
  var collectionFilter = 'all';
  var collectionReturn = 'world';
  var battleTimer = null;
  var battleResultTimer = null;
  var battleToken = 0;
  var currentBattle = null;
  var battleSettled = false;
  var farmTimer = null;
  var farmMatureFlags = [];
  var guideStep = 0;
  var guideShown = false;
  var buildFocus = null;
  var guideSteps = [
    { art: 'rabbit', title: '一座空岛，从你开始', body: '岛上现在只有战斗祭坛和草地。没有现成的花园、商店和农田，都要靠金币一点点建设起来。' },
    { art: 'fox', title: '先学会走路', body: '左下角摇杆或 WASD / 方向键移动，拖动画面旋转视角，点击地面会自动寻路。靠近祭坛后点右下角的互动按钮。' },
    { art: 'tiger', title: '去祭坛赚第一笔金币', body: '战斗会自动进行：普通攻击更常出现并积累气势，气势满后才会随机释放技能。胜利后转动战利品转盘，金币和物资都从这里来。' },
    { art: 'hedgehog', title: '用金币建设小岛', body: '点右侧的「建设」打开建设页，可以解锁花园、杂货铺、小农田、装饰、小屋和高塔。解锁后建筑会真的出现在岛上，快捷栏也会多出对应入口。' },
    { art: 'cow', title: '自由种出一座岛', body: '解锁花园后，点「种植」自选草、花、蕨、蘑菇、芦苇、卵石、灌木、树和岩石，点附近地面就能种。草簇免费，点已有植物可以拔除重来。' },
    { art: 'goat', title: '种一棵增益树', body: '解锁小农田后，除了普通作物，还能种战意树、铁壁树、疾风树。收获的果实会变成下一场战斗的增益，摘完再去祭坛打架。' }
  ];
  var farmDockTimer = null;
  var farmTargetIndex = -1;
  var farmSelectedCrop = 'carrot';
  var toastTimer = null;

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el && el.textContent !== text) el.textContent = text;
  }

  function state() {
    return Core.getState();
  }

  function head(title, subtitle, backAction, rightHtml) {
    return '<div class="screen-head">' +
      '<button type="button" class="icon-btn" data-action="' + backAction + '" aria-label="返回">' +
      Art.icon('back', '#3A3A44') +
      '</button>' +
      '<div class="head-text"><strong>' + title + '</strong><span>' + subtitle + '</span></div>' +
      '<div class="head-right">' + (rightHtml || '') + '</div>' +
      '</div>';
  }

  function elementBadge(elementId, showName) {
    var e = Core.findElement(elementId);
    return '<span class="elem-badge elem-' + e.id + '">' +
      Art.elementIcon(e.id) +
      (showName === false ? '' : '<em>' + e.name + '</em>') +
      '</span>';
  }

  function rarityBadge(tier) {
    return '<span class="rarity-badge rarity-' + tier + '">' + (C.tierNames[tier] || '普通') + '</span>';
  }

  function money(n) {
    return String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function compactNumber(n) {
    var v = Math.round(Number(n) || 0);
    if (v >= 1000000) return String(Math.round(v / 10000)) + '万';
    if (v >= 10000) {
      var s = (v / 10000).toFixed(1);
      return s.replace(/\.0$/, '') + '万';
    }
    return String(v);
  }

  function formatTime(sec) {
    var s = Math.max(0, Math.ceil(sec));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return (m < 10 ? '0' + m : m) + ':' + (r < 10 ? '0' + r : r);
  }

  function formatDuration(sec) {
    if (sec < 60) return sec + ' 秒';
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return s ? m + ' 分 ' + s + ' 秒' : m + ' 分钟';
  }

  function formatDate(ts) {
    if (!ts) return '—';
    var d = new Date(ts);
    if (isNaN(d.getTime())) return '—';
    var m = d.getMonth() + 1;
    var day = d.getDate();
    var hh = d.getHours();
    var mm = d.getMinutes();
    return m + '/' + day + ' ' + (hh < 10 ? '0' + hh : hh) + ':' + (mm < 10 ? '0' + mm : mm);
  }

  function toast(message, duration) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove('is-visible');
      toastTimer = null;
    }, duration || 2000);
  }

  function renderHUD() {
    var s = state();
    if (!s) return;
    setText('res-coins', compactNumber(s.coins));
    setText('res-seeds', String(s.seeds));
    setText('res-water', String(s.water));
    setText('res-power', String(Core.getPower()));
    setText('hud-day', '第 ' + Core.getDay() + ' 天 · ' + (s.streak > 0 ? '连胜 ' + s.streak : '今天也要变强'));
  }

  function matureCount() {
    var s = state();
    var count = 0;
    for (var i = 0; i < s.plots.length; i += 1) {
      if (isMature(s.plots[i])) count += 1;
    }
    return count;
  }

  /* ---------------- 战斗准备 ---------------- */
  function cardUsable(cardId) {
    var s = state();
    if ((s.cards[cardId] || 0) <= 0) return false;
    if (cardId === 'shield' && s.buffs.shield) return false;
    if (cardId === 'double' && s.buffs.double) return false;
    return true;
  }

  function cardButtonLabel(cardId) {
    var s = state();
    if (cardId === 'shield' && s.buffs.shield) return '已生效';
    if (cardId === 'double' && s.buffs.double) return '已生效';
    return '使用';
  }

  function elementMatchText(matchup) {
    var pEl = Core.findElement(matchup.playerElement);
    var eEl = Core.findElement(matchup.enemyElement);
    if (matchup.neutral) {
      return pEl.name + ' vs ' + eEl.name + '：没有克制加成。';
    }
    if (matchup.playerAdvantage) {
      return pEl.name + '克' + eEl.name + '：我方伤害 +25%，敌方伤害 -15%。';
    }
    return eEl.name + '克' + pEl.name + '：我方伤害 -15%，敌方伤害 +25%。';
  }

  function renderPrep() {
    var s = state();
    if (!s.pendingEnemy) {
      s.pendingEnemy = Core.makeEnemy();
      Core.saveState();
    }
    var battle = window.Battle.prepare(s);
    var c = battle.playerCreature;
    var e = battle.enemyCreature;
    var matchup = battle.matchup;
    var equipPower = Core.getEquipPower();
    var decoPower = Core.getDecoPower();
    var slotInfo = Core.getSlotsInfo();
    var shell = document.getElementById('prep-shell');
    if (!shell) return;

    var html = [];
    var towerMode = !!s.towerBattle;
    var prepTitle = towerMode ? '高塔第 ' + s.tower.floor + ' 层' : '战斗准备';
    var prepSub = towerMode ? '连续闯关 · 最佳 ' + s.tower.best + ' 层' : ('第 ' + (s.totalBattles + 1) + ' 场 · ' + (s.streak > 0 ? '连胜 ' + s.streak : '新的挑战'));
    var prepBack = towerMode ? 'go-tower' : 'go-world';
    html.push(head(prepTitle, prepSub, prepBack));
    html.push('<div class="screen-body"><div class="prep-content">');

    html.push('<div class="versus-row">');
    html.push('<div class="fighter-card player">' +
      '<div class="fighter-art">' + Art.creature(c.id) + '</div>' +
      '<div class="fighter-info"><div class="fighter-title">' + elementBadge(c.element) + rarityBadge(c.tier) + '</div>' +
      '<strong>' + c.name + '</strong>' +
      '<em>' + c.skill + '</em>' +
      '<b>' + battle.playerPower + ' 战力</b></div></div>');
    html.push('<div class="vs-badge">VS</div>');
    html.push('<div class="fighter-card enemy">' +
      '<div class="fighter-art">' + Art.creature(e.id) + '</div>' +
      '<div class="fighter-info"><div class="fighter-title">' + elementBadge(e.element) + rarityBadge(e.tier) + '</div>' +
      '<strong>野生' + e.name + '</strong>' +
      '<em>' + e.skill + '</em>' +
      '<b>' + battle.enemyPower + ' 战力</b>' +
      (battle.shieldActive ? '<span class="shield-note">护盾卡：-' + Math.round((1 - battle.enemyPower / battle.baseEnemyPower) * 100) + '%</span>' : '') +
      '</div></div>');
    html.push('</div>');

    html.push('<button type="button" class="transform-cta" data-action="open-transform">' +
      '<span class="transform-cta-ico">' + Art.icon('refresh', '#E8C98A') + '</span>' +
      '<span class="transform-cta-text"><strong>指定变身</strong><em>金币 ' + money(D.TRANSFORM_COSTS[1]) + ' 起 · 直接变成任意生物</em></span>' +
      '<span class="transform-cta-go">查看</span></button>');

    html.push('<div class="panel element-panel"><div class="panel-title">属性克制</div>' +
      '<div class="element-versus">' +
      '<div class="element-side">' + elementBadge(c.element) + '<strong>' + c.name + '</strong></div>' +
      '<div class="element-arrow ' + (matchup.playerAdvantage ? 'good' : (matchup.enemyAdvantage ? 'bad' : '')) + '">' +
      (matchup.playerAdvantage ? '克制 →' : (matchup.enemyAdvantage ? '← 被克' : '↔ 无克制')) + '</div>' +
      '<div class="element-side">' + elementBadge(e.element) + '<strong>野生' + e.name + '</strong></div>' +
      '</div>' +
      '<p class="element-note">' + elementMatchText(matchup) + '</p>' +
      '<p class="element-cycle">天 → 地 → 水 → 天；灵属性不受克制。</p></div>');

    html.push('<div class="panel"><div class="panel-title">战力构成</div>' +
      '<div class="power-grid">' +
      '<div class="power-cell"><span>基础</span><b>' + c.power + '</b></div>' +
      '<div class="power-cell"><span>装备</span><b>+' + equipPower + '</b></div>' +
      '<div class="power-cell"><span>装饰</span><b>+' + decoPower + '</b></div>' +
      '<div class="power-cell"><span>强化</span><b>+' + s.boost + '</b></div>' +
      '</div>' +
      '<div class="power-total">总战力 <b>' + battle.playerPower + '</b></div></div>');

    var buffItems = '';
    for (var bf = 0; bf < D.BATTLE_BUFFS.length; bf += 1) {
      var bdef = D.BATTLE_BUFFS[bf];
      var bcount = s.buffs[bdef.id] || 0;
      if (bcount > 0) {
        buffItems += '<span class="buff-chip" style="border-color:' + bdef.color + '66">' +
          '<i class="buff-chip-ico">' + Art.icon(bdef.icon, bdef.color) + '</i>' +
          '<strong>' + bdef.name + ' x' + bcount + '</strong><em>' + bdef.short + '</em></span>';
      }
    }
    if (s.buffs.shield) {
      buffItems += '<span class="buff-chip"><i class="buff-chip-ico">' + Art.icon('shield', '#8CC7A8') +
        '</i><strong>护盾卡</strong><em>对手 -15%</em></span>';
    }
    if (s.buffs.double) {
      buffItems += '<span class="buff-chip"><i class="buff-chip-ico">' + Art.icon('double', '#E8C98A') +
        '</i><strong>双倍卡</strong><em>奖励翻倍</em></span>';
    }
    html.push('<div class="panel buff-panel"><div class="panel-title">战斗增益 <span>生效一场，战斗后消耗一层</span></div>' +
      (buffItems ? '<div class="buff-chips">' + buffItems + '</div>' :
        '<p class="buff-empty">暂无增益。解锁农田后种战意树 / 铁壁树 / 疾风树，收获果实就能带着增益去打架。</p>') +
      '</div>');

    html.push('<div class="panel"><div class="panel-title">装备槽 <span>' + slotInfo.total + ' / ' + C.maxSlots +
      '（' + slotInfo.base + ' 基础 + ' + slotInfo.temporary + ' 临时）</span>' +
      '<button type="button" class="text-btn" data-action="go-bag">整理</button></div>' +
      '<div class="equip-strip">');
    for (var i = 0; i < s.equipment.length; i += 1) {
      var uid = s.equipment[i];
      var inv = uid ? Core.getItemByUid(uid) : null;
      var item = inv ? Core.findItem(inv.id) : null;
      if (item) {
        html.push('<div class="equip-mini"><span class="equip-mini-art">' + Art.item(item) + '</span>' +
          '<span class="equip-mini-info"><strong>' + item.name + '</strong><em>+' + item.power + '</em></span></div>');
      } else {
        html.push('<div class="equip-mini empty"><span>+</span><em>空槽</em></div>');
      }
    }
    html.push('</div><p class="panel-note">胜利后装备槽重置为 ' + C.startSlots + ' 格；连续失败才能临时增加。</p></div>');

    html.push('<div class="panel"><div class="panel-title">道具卡</div><div class="card-grid">');
    for (var k = 0; k < D.CARDS.length; k += 1) {
      var card = D.CARDS[k];
      var count = s.cards[card.id] || 0;
      var usable = cardUsable(card.id);
      html.push('<div class="card-tile' + (count > 0 ? '' : ' is-empty') + '">' +
        '<div class="card-top"><span class="card-icon" style="background:' + card.color + '">' + Art.icon(card.icon, '#FFFFFF') + '</span>' +
        '<span class="card-count">x' + count + '</span></div>' +
        '<strong>' + card.name + '</strong>' +
        '<p>' + card.desc + '</p>' +
        '<button type="button" class="btn tiny" data-action="use-card" data-card="' + card.id + '"' + (usable ? '' : ' disabled') + '>' +
        cardButtonLabel(card.id) + '</button></div>');
    }
    html.push('</div></div>');

    html.push('<p class="battle-tip">普通攻击会积累气势，气势满后随机释放技能；普通攻击出现得更多。属性克制、会心一击和背水一战都可能改写结果。</p>');
    html.push('</div></div>');
    html.push('<div class="screen-foot">' +
      '<button type="button" class="btn ghost" data-action="' + prepBack + '">' + Art.icon('back', '#C9C0B0') + (towerMode ? '返回高塔' : '返回小岛') + '</button>' +
      '<button type="button" class="btn primary" data-action="start-battle">' + Art.icon('sword', '#171009') + '开始战斗</button>' +
      '</div>');
    shell.innerHTML = html.join('');
  }

  /* ---------------- 战斗播放 ---------------- */
  function buildBattleScreen(battle) {
    var shell = document.getElementById('battle-body');
    if (!shell) return;
    var p = battle.playerCreature;
    var e = battle.enemyCreature;
    var sim = battle.sim;
    shell.innerHTML =
      '<div class="battle-top">' +
      '<span class="battle-count">第 ' + (state().totalBattles + 1) + ' 场战斗</span>' +
      '<span class="round-chip" id="battle-round">准备</span>' +
      '<button type="button" class="btn tiny ghost" data-action="skip-battle">' + Art.icon('fast', '#C9C0B0') + '跳过</button>' +
      '</div>' +
      '<div class="arena" id="arena">' +
      '<div class="arena-sky"><i class="cloud c1"></i><i class="cloud c2"></i><i class="cloud c3"></i></div>' +
      '<div class="arena-platform"></div>' +
      '<div class="battle-side side-p" id="side-p">' +
      '<div class="hp-box"><div class="hp-label"><span>' + elementBadge(p.element, false) + ' ' + p.name + '</span><b>' + battle.playerPower + '</b></div>' +
      '<div class="hp-bar"><i id="hp-p" style="width:100%"></i></div>' +
      '<div class="hp-num" id="hp-p-num">' + sim.pMax + ' / ' + sim.pMax + '</div>' +
      '<div class="skill-meter"><i id="skill-p" style="width:0%"></i></div></div>' +
      '<div class="battle-art">' + Art.creature(p.id) + '</div>' +
      '<div class="dmg-layer" id="dmg-p"></div></div>' +
      '<div class="battle-side side-e" id="side-e">' +
      '<div class="hp-box"><div class="hp-label"><span>' + elementBadge(e.element, false) + ' 野生' + e.name + '</span><b>' + battle.enemyPower + '</b></div>' +
      '<div class="hp-bar enemy"><i id="hp-e" style="width:100%"></i></div>' +
      '<div class="hp-num" id="hp-e-num">' + sim.eMax + ' / ' + sim.eMax + '</div>' +
      '<div class="skill-meter"><i id="skill-e" style="width:0%"></i></div></div>' +
      '<div class="battle-art">' + Art.creature(e.id) + '</div>' +
      '<div class="dmg-layer" id="dmg-e"></div></div>' +
      '<div class="vs-mark">VS</div>' +
      '</div>' +
      '<div class="battle-log" id="battle-log" role="status" aria-live="polite">' +
      '<div class="log-line system">战斗开始！</div>' +
      '<div class="log-line element">' + sim.elementLine + '</div>' +
      '</div>';
  }

  function setHp(pHp, pMax, eHp, eMax) {
    var pPct = Math.max(0, Math.min(100, pHp / pMax * 100));
    var ePct = Math.max(0, Math.min(100, eHp / eMax * 100));
    var pBar = document.getElementById('hp-p');
    var eBar = document.getElementById('hp-e');
    if (pBar) {
      pBar.style.width = pPct + '%';
      pBar.className = pPct < 30 ? 'low' : '';
    }
    if (eBar) {
      eBar.style.width = ePct + '%';
      eBar.className = ePct < 30 ? 'low' : '';
    }
    setText('hp-p-num', Math.max(0, pHp) + ' / ' + pMax);
    setText('hp-e-num', Math.max(0, eHp) + ' / ' + eMax);
  }

  function appendLog(text, cls) {
    var log = document.getElementById('battle-log');
    if (!log) return;
    var line = document.createElement('div');
    line.className = 'log-line ' + (cls || '');
    line.textContent = text;
    log.appendChild(line);
    while (log.children.length > 4) log.removeChild(log.firstChild);
    log.scrollTop = log.scrollHeight;
  }

  function showDamage(side, dmg, crit) {
    var layer = document.getElementById('dmg-' + side);
    if (!layer) return;
    var span = document.createElement('span');
    span.className = 'dmg-num' + (crit ? ' crit' : '');
    span.textContent = '-' + dmg;
    layer.appendChild(span);
    setTimeout(function () {
      if (span.parentNode) span.parentNode.removeChild(span);
    }, 900);
  }

  function animateSide(side) {
    var el = document.getElementById('side-' + side);
    if (!el) return;
    el.classList.remove('is-attacking');
    void el.offsetWidth;
    el.classList.add('is-attacking');
    setTimeout(function () {
      el.classList.remove('is-attacking');
    }, 360);
  }

  function applyRound(r) {
    setHp(r.pHp, r.pMax, r.eHp, r.eMax);
    setText('battle-round', '第 ' + r.round + ' 回合');
    var pSkill = document.getElementById('skill-p');
    var eSkill = document.getElementById('skill-e');
    if (pSkill) pSkill.style.width = Math.max(0, Math.min(100, r.pEnergy || 0)) + '%';
    if (eSkill) eSkill.style.width = Math.max(0, Math.min(100, r.eEnergy || 0)) + '%';
    var side = r.side === 'p' ? 'e' : 'p';
    var action = r.action || 'normal';
    appendLog(r.text, (r.side === 'p' ? 'side-p' : 'side-e') + ' ' + action);
    if (r.dmg > 0) {
      showDamage(side, r.dmg, r.crit);
      animateSide(r.side);
      Core.haptic(r.crit ? 'heavy' : 'light');
      var arena = document.getElementById('arena');
      if (arena && (r.crit || r.burst || action === 'skill')) {
        arena.classList.add(action === 'skill' ? 'is-skill' : 'is-crit');
        setTimeout(function () {
          arena.classList.remove('is-skill');
          arena.classList.remove('is-crit');
        }, 420);
      }
    }
  }

  function playBattle(battle) {
    var sim = battle.sim;
    var index = 0;
    battleSettled = false;
    var token = ++battleToken;
    function step() {
      if (battleSettled || token !== battleToken) return;
      if (index >= sim.rounds.length) {
        appendLog('战斗结束！', 'system');
        battleTimer = setTimeout(function () {
          battleTimer = null;
          finishBattle(battle);
        }, 620);
        return;
      }
      var r = sim.rounds[index];
      index += 1;
      applyRound(r);
      battleTimer = setTimeout(step, r.dmg === 0 ? 900 : 540);
    }
    step();
  }

  function clearBattleTimers() {
    if (battleTimer) {
      clearTimeout(battleTimer);
      battleTimer = null;
    }
    if (battleResultTimer) {
      clearTimeout(battleResultTimer);
      battleResultTimer = null;
    }
  }

  function skipBattle() {
    if (!currentBattle || battleSettled) return;
    if (battleTimer) {
      clearTimeout(battleTimer);
      battleTimer = null;
    }
    var sim = currentBattle.sim;
    setHp(sim.pHp, sim.pMax, sim.eHp, sim.eMax);
    appendLog('战斗结束！', 'system');
    finishBattle(currentBattle);
  }

  function finishBattle(battle) {
    if (battleSettled) return;
    battleSettled = true;
    if (battleTimer) {
      clearTimeout(battleTimer);
      battleTimer = null;
    }
    window.Battle.settle(state(), battle, battle.sim);
    Core.saveNow();
    battleResultTimer = setTimeout(function () {
      battleResultTimer = null;
      show('result');
    }, 680);
  }

  function startBattle() {
    var battle = window.Battle.createBattle(state());
    currentBattle = battle;
    buildBattleScreen(battle);
    show('battle');
    playBattle(battle);
  }

  /* ---------------- 战斗结果 ---------------- */
  function resultFlavor(kind) {
    if (kind === 'crush') return '对手几乎没有还手之力，擂台都在为你鼓掌。';
    if (kind === 'clear') return '你牢牢掌握了节奏，胜利来得干净利落。';
    if (kind === 'close') return '最后一击之前，胜负还很难说。';
    if (kind === 'rout') return '这次差距有点大，先回岛上休整一下吧。';
    if (kind === 'loss') return '只差一点点，下次换个形态再来。';
    return '战斗非常胶着，你只是差了一点运气。';
  }

  function rewardChip(iconHtml, text) {
    return '<div class="reward-chip"><span class="reward-icon">' + iconHtml + '</span><b>' + text + '</b></div>';
  }

  function sparkles(count) {
    var out = '<div class="legend-sparkles">';
    for (var i = 0; i < count; i += 1) {
      out += '<i style="left:' + (6 + (i * 13) % 88) + '%;animation-delay:' + (i * 0.18).toFixed(2) + 's"></i>';
    }
    return out + '</div>';
  }

  var wheelState = { spinning: false, resolved: false, result: null };
  var wheelTimer = null;

  function resetWheel() {
    wheelState = { spinning: false, resolved: false, result: null };
    if (wheelTimer) {
      clearTimeout(wheelTimer);
      wheelTimer = null;
    }
  }

  function buildWheelSvg() {
    var segs = D.WHEEL;
    var n = segs.length;
    var step = 360 / n;
    var out = '<svg class="wheel-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">';
    for (var i = 0; i < n; i += 1) {
      var a0 = step * i - 90;
      var a1 = a0 + step;
      var x0 = 100 + 94 * Math.cos(a0 * Math.PI / 180);
      var y0 = 100 + 94 * Math.sin(a0 * Math.PI / 180);
      var x1 = 100 + 94 * Math.cos(a1 * Math.PI / 180);
      var y1 = 100 + 94 * Math.sin(a1 * Math.PI / 180);
      out += '<path d="M100 100 L' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' A94 94 0 0 1 ' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' Z" fill="' + segs[i].color + '" stroke="#FFFFFF" stroke-width="1.5"/>';
      var am = a0 + step / 2;
      var lx = 100 + 57 * Math.cos(am * Math.PI / 180);
      var ly = 100 + 57 * Math.sin(am * Math.PI / 180);
      out += '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" fill="#FFFFFF" font-size="9" font-weight="bold" text-anchor="middle" dominant-baseline="middle">' + segs[i].label + '</text>';
    }
    out += '<circle cx="100" cy="100" r="17" fill="#2E2A26"/><circle cx="100" cy="100" r="7" fill="#F2C94C"/></svg>';
    return out;
  }

  function finishWheel(roll) {
    if (wheelState.resolved) return;
    var r = state().lastResult;
    if (!r) return;
    var out = Core.applyWheel(roll.segment, r.wheelDouble);
    wheelState.resolved = true;
    wheelState.spinning = false;
    wheelState.result = out;
    var outEl = document.getElementById('wheel-outcome');
    if (outEl) {
      outEl.textContent = out.detail;
      outEl.className = 'wheel-outcome is-done' + (out.type === 'nothing' ? ' is-empty' : '');
    }
    var spinBtn = document.querySelector('[data-action="wheel-spin"]');
    var skipBtn = document.querySelector('[data-action="wheel-skip"]');
    if (spinBtn) spinBtn.disabled = true;
    if (skipBtn) skipBtn.disabled = true;
    var cont = document.getElementById('result-continue-btn');
    if (cont) cont.disabled = false;
    renderHUD();
  }

  function spinWheel() {
    if (wheelState.spinning || wheelState.resolved) return;
    var r = state().lastResult;
    if (!r || !r.wheel) return;
    var roll = Core.rollWheel();
    wheelState.spinning = true;
    var rotor = document.getElementById('wheel-rotor');
    var step = 360 / D.WHEEL.length;
    var target = 360 * 6 + (360 - (roll.index * step + step / 2));
    if (rotor) rotor.style.transform = 'rotate(' + target + 'deg)';
    var spinBtn = document.querySelector('[data-action="wheel-spin"]');
    var skipBtn = document.querySelector('[data-action="wheel-skip"]');
    if (spinBtn) spinBtn.disabled = true;
    if (skipBtn) skipBtn.disabled = true;
    if (wheelTimer) clearTimeout(wheelTimer);
    wheelTimer = setTimeout(function () {
      wheelTimer = null;
      finishWheel(roll);
    }, 2300);
  }

  function skipWheel() {
    if (wheelState.spinning || wheelState.resolved) return;
    var r = state().lastResult;
    if (!r || !r.wheel) return;
    finishWheel(Core.rollWheel());
  }

  function renderResult() {
    var s = state();
    var r = s.lastResult;
    var shell = document.getElementById('result-shell');
    if (!shell) return;
    if (!r) {
      show('world');
      return;
    }
    resetWheel();
    var win = r.win;
    var formId = win && r.newFormId ? r.newFormId : s.formId;
    var form = Core.findCreature(formId) || Core.findCreature(s.formId) || D.CREATURES[0];
    var enemy = Core.findCreature(r.enemyCreatureId) || D.CREATURES[0];
    var entry = s.collection[form.id] || { owned: 0, seen: true };
    var matchup = r.matchup || Core.elementMatchup(r.playerElement, r.enemyElement);
    var playerC = Core.findCreature(r.playerCreatureId) || D.CREATURES[0];
    var legendary = win && (r.legendary || form.tier >= 4);
    var mythic = win && (r.mythic || form.tier >= 5);
    var tower = r.tower;
    var bannerTitle = win
      ? (mythic ? '神话降临！' : (legendary ? '传说降临！' : r.kindLabel + '！'))
      : r.kindLabel + '…';
    var bannerClass = win ? 'win' : 'lose';
    if (legendary) bannerClass += ' is-legend';
    if (mythic) bannerClass += ' is-myth';

    var html = [];
    html.push('<div class="screen-body result-body">');
    html.push('<div class="result-banner ' + bannerClass + '">' +
      sparkles(legendary ? 12 : 0) +
      '<div class="result-kicker">' + (tower ? '高塔第 ' + tower.floorBefore + ' 层 · ' : '') +
      '第 ' + r.totalBattles + ' 场 · ' + (win ? '胜利' : '失败') + ' · ' + r.kindLabel + '</div>' +
      '<h2>' + bannerTitle + '</h2>' +
      '<p>' + resultFlavor(r.kind) + '</p>' +
      '<div class="result-badges">' +
      (r.upset ? '<span class="badge gold">以弱胜强</span>' : '') +
      (r.streak >= 3 ? '<span class="badge blue">连胜 ' + r.streak + '</span>' : '') +
      (r.wheelDouble ? '<span class="badge purple">双倍卡生效</span>' : '') +
      (legendary ? '<span class="badge gold">' + (mythic ? '神话生物' : '传说生物') + '</span>' : '') +
      '</div></div>');

    html.push('<div class="element-strip">' +
      '<div class="element-strip-side">' + elementBadge(r.playerElement) + '<b>' + playerC.name + '</b></div>' +
      '<div class="element-strip-mid ' + (matchup.playerAdvantage ? 'good' : (matchup.enemyAdvantage ? 'bad' : '')) + '">' +
      (matchup.playerAdvantage ? '克制' : (matchup.enemyAdvantage ? '被克' : '无克制')) + '</div>' +
      '<div class="element-strip-side">' + elementBadge(r.enemyElement) + '<b>野生' + enemy.name + '</b></div>' +
      '</div>');

    html.push('<div class="hp-summary">' +
      '<div class="hp-side"><span>我方剩余体力</span><b>' + Math.round(r.playerHpRatio * 100) + '%</b></div>' +
      '<div class="hp-vs">VS</div>' +
      '<div class="hp-side enemy"><span>敌方剩余体力</span><b>' + Math.round(r.enemyHpRatio * 100) + '%</b></div>' +
      '</div>');

    if (tower) {
      html.push('<div class="panel tower-result"><div class="panel-title">战斗高塔</div><p>' +
        (tower.win
          ? (tower.completed
            ? '恭喜通关第 ' + D.TOWER.floors + ' 层！最佳纪录 ' + tower.best + ' 层。'
            : '第 ' + tower.floorBefore + ' 层通过！最佳纪录 ' + tower.best + ' 层，下一层：第 ' + tower.floorAfter + ' 层。')
          : '第 ' + tower.floorBefore + ' 层闯关失败，本次高塔结束。最佳纪录 ' + tower.best + ' 层。') +
        '</p></div>');
    }

    if (win) {
      if (r.slotsReset) {
        html.push('<div class="panel slot-panel"><div class="panel-title">装备槽重置</div>' +
          '<p>胜利后装备槽重置：<b>' + r.slotsBefore + ' → ' + r.slotsAfter + '</b>' +
          (r.unequippedCount > 0 ? '，' + r.unequippedCount + ' 件装备已放回背包。' : '。') +
          '</p><p class="panel-note">连续失败可以临时增加装备槽，胜利后回到 ' + C.startSlots + ' 格。</p></div>');
      }
      if (r.wheel) {
        html.push('<div class="panel wheel-panel"><div class="panel-title">战利品转盘' +
          (r.wheelDouble ? '<span class="badge gold">双倍卡</span>' : '') +
          '</div><div class="wheel-stage"><div class="wheel-pointer"></div>' +
          '<div class="wheel-rotor" id="wheel-rotor">' + buildWheelSvg() + '</div>' +
          '<div class="wheel-center">转</div></div>' +
          '<p class="wheel-outcome" id="wheel-outcome">胜利获得一次转盘机会。转动转盘，或一键跳过直接抽取。</p>' +
          '<div class="wheel-actions">' +
          '<button type="button" class="btn primary" data-action="wheel-spin">转动转盘</button>' +
          '<button type="button" class="btn ghost" data-action="wheel-skip">一键跳过</button>' +
          '</div></div>');
      }
      html.push('<div class="panel transform-panel' + (legendary ? ' is-legend' : '') + '"><div class="panel-title">胜利变身' +
        (legendary ? '<span class="legend-tag">' + (mythic ? '神话' : '传说') + '</span>' : '') + '</div>' +
        '<div class="transform-row">' +
        '<div class="transform-art">' + Art.creature(form.id) + '</div>' +
        '<div class="transform-info"><span>你随机变成了</span>' +
        '<strong>' + form.name + '</strong>' +
        '<div class="transform-badges">' + elementBadge(form.element) + rarityBadge(form.tier) + '</div>' +
        '<em>基础战力 ' + form.power + ' · 图鉴第 ' + entry.owned + ' 次</em>' +
        '<p>技能：' + form.skill + '</p></div>' +
        '</div></div>');
      html.push('<p class="battle-tip">' + form.desc + '</p>');
    } else {
      var slotText = r.slotsAfter > r.slotsBefore
        ? '装备槽 +1：' + r.slotsBefore + ' → ' + r.slotsAfter + ' 格'
        : '装备槽已满（' + r.slotsAfter + ' 格）';
      html.push('<div class="panel choice-panel"><div class="panel-title">失败领悟</div>' +
        '<p class="choice-text">' + slotText + '。当前形态 <b>' + form.name + '</b>（' +
        elementBadge(form.element, false) + ' 基础战力 ' + form.power + '）。要随机变身再战吗？</p>' +
        '<div class="choice-buttons">' +
        '<button type="button" class="btn primary" data-action="loss-reroll">随机变身</button>' +
        '<button type="button" class="btn ghost" data-action="loss-keep">保持形态</button>' +
        '</div><p class="panel-note">胜利后装备槽会重置为 ' + C.startSlots + ' 格。本次失败没有战利品转盘。</p></div>');
    }

    html.push('<p class="result-enemy">对手：野生' + enemy.name + ' · ' + C.tierNames[enemy.tier] + ' · ' + r.enemyPower + ' 战力</p>');
    html.push('</div>');

    if (win) {
      var label;
      if (tower && !tower.completed) label = '继续第 ' + tower.floorAfter + ' 层';
      else if (tower && tower.completed) label = '高塔通关，回到小岛';
      else label = Art.icon('check', '#171009') + '收下奖励，回到小岛';
      html.push('<div class="screen-foot">');
      if (tower) html.push('<button type="button" class="btn ghost" data-action="tower-leave">离开高塔</button>');
      html.push('<button type="button" class="btn primary" id="result-continue-btn" data-action="result-continue"' +
        (r.wheel ? ' disabled' : '') + '>' + label + '</button>');
      html.push('</div>');
    }
    shell.innerHTML = html.join('');
  }

  function renderTower() {
    var s = state();
    var t = s.tower;
    var shell = document.getElementById('tower-shell');
    if (!shell) return;
    var power = Core.getPower();
    var html = [];
    html.push(head('战斗高塔', '最佳 ' + t.best + ' 层 · ' + (t.active ? '当前第 ' + t.floor + ' 层' : '等待挑战'), 'go-world'));
    html.push('<div class="screen-body tower-body">');
    html.push('<div class="panel tower-intro"><div class="panel-title">一层层往上打</div>' +
      '<p>每层对手战力递增。胜利后进入下一层，失败则本次闯关结束。每层胜利都能获得一次战利品转盘。</p>' +
      '<p class="panel-note">共 ' + D.TOWER.floors + ' 层，最佳纪录会保留；失败后从第 1 层重新开始。</p></div>');
    html.push('<div class="tower-grid">');
    for (var f = 1; f <= D.TOWER.floors; f += 1) {
      var enemyPower = Math.round(power * (D.TOWER.base + f * D.TOWER.perFloor));
      var cls = 'tower-floor';
      if (t.best >= f) cls += ' is-cleared';
      if (t.active && t.floor === f) cls += ' is-current';
      html.push('<div class="' + cls + '"><span>第 ' + f + ' 层</span><b>' + enemyPower + '</b><em>' +
        (t.best >= f ? '已通过' : (t.active && t.floor === f ? '当前' : '未挑战')) + '</em></div>');
    }
    html.push('</div>');
    if (t.active) {
      html.push('<button type="button" class="btn primary wide" data-action="tower-continue">' + Art.icon('sword', '#171009') + '继续挑战第 ' + t.floor + ' 层</button>');
      html.push('<button type="button" class="btn ghost wide tower-leave-btn" data-action="tower-leave">结束本次闯关</button>');
    } else {
      html.push('<button type="button" class="btn primary wide" data-action="tower-start">' + Art.icon('tower', '#171009') + '开始闯关（第 1 层）</button>');
    }
    html.push('</div>');
    shell.innerHTML = html.join('');
  }

  /* ---------------- 农田 ---------------- */
  function isMature(plot) {
    var crop = Core.findCrop(plot.cropId);
    if (!crop || !plot.watered || !plot.plantedAt) return false;
    return Date.now() >= plot.plantedAt + crop.growSec * 1000;
  }

  function plotRemain(plot) {
    var crop = Core.findCrop(plot.cropId);
    if (!crop || !plot.watered || !plot.plantedAt) return 0;
    return Math.max(0, (plot.plantedAt + crop.growSec * 1000 - Date.now()) / 1000);
  }

  function plotProgress(plot) {
    var crop = Core.findCrop(plot.cropId);
    if (!crop || !plot.watered || !plot.plantedAt) return 0;
    var pct = (Date.now() - plot.plantedAt) / (crop.growSec * 1000) * 100;
    return Math.max(0, Math.min(100, pct));
  }

  function plotCard(plot, index) {
    var crop = Core.findCrop(plot.cropId);
    if (!crop) {
      return '<div class="plot-card empty"><div class="plot-art">' + Art.crop(null, 0) + '</div>' +
        '<div class="plot-info"><strong>空地</strong><span>种点东西吧</span></div>' +
        '<button type="button" class="btn tiny" data-action="plant" data-plot="' + index + '">播种</button></div>';
    }
    var mature = isMature(plot);
    var stage = mature ? 2 : (plot.watered ? 1 : 0);
    var status;
    var action;
    if (mature) {
      status = '已成熟，可以收获';
      action = '<button type="button" class="btn tiny primary" data-action="harvest" data-plot="' + index + '">收获</button>';
    } else if (!plot.watered) {
      status = '待浇水（需要 ' + crop.waterCost + ' 清水）';
      action = '<button type="button" class="btn tiny" data-action="water" data-plot="' + index + '">浇水</button>';
    } else {
      status = '生长中 · 剩余 <b data-plot-timer="' + index + '">' + formatTime(plotRemain(plot)) + '</b>';
      action = '<button type="button" class="btn tiny" disabled>生长中</button>';
    }
    return '<div class="plot-card' + (mature ? ' is-mature' : '') + '">' +
      '<div class="plot-art">' + Art.crop(crop.id, stage) + '</div>' +
      '<div class="plot-info"><strong>' + crop.name + '</strong><span>' + status + '</span></div>' +
      (plot.watered && !mature
        ? '<div class="plot-progress"><i data-plot-progress="' + index + '" style="width:' + plotProgress(plot) + '%"></i></div>'
        : '') +
      action + '</div>';
  }

  function renderFarm() {
    var s = state();
    var shell = document.getElementById('farm-shell');
    if (!shell) return;
    farmMatureFlags = [];
    var html = [];
    html.push(head('小农田', '种子 ' + s.seeds + ' · 清水 ' + s.water, 'go-world'));
    html.push('<div class="screen-body farm-body"><div class="farm-grid">');
    for (var i = 0; i < s.plots.length; i += 1) {
      farmMatureFlags.push(isMature(s.plots[i]));
      html.push(plotCard(s.plots[i], i));
    }
    html.push('</div>');
    html.push('<div class="panel farm-help"><div class="panel-title">种植提示</div>' +
      '<p>播种消耗种子，浇水消耗清水。作物按真实时间生长，离开小工具后也会继续长大。</p>' +
      '<p>收获可获得金币，还有机会得到装备和装饰。世界里的农田会同步显示作物状态。</p></div>');
    html.push('</div>');
    shell.innerHTML = html.join('');
  }

  function tickFarm() {
    if (currentScreen !== 'farm') return;
    var s = state();
    var needRender = false;
    for (var i = 0; i < s.plots.length; i += 1) {
      var p = s.plots[i];
      var crop = Core.findCrop(p.cropId);
      if (!crop || !p.watered) continue;
      var mature = isMature(p);
      if (mature !== !!farmMatureFlags[i]) {
        needRender = true;
        break;
      }
      if (!mature) {
        var timerEl = document.querySelector('[data-plot-timer="' + i + '"]');
        if (timerEl) timerEl.textContent = formatTime(plotRemain(p));
        var barEl = document.querySelector('[data-plot-progress="' + i + '"]');
        if (barEl) barEl.style.width = plotProgress(p) + '%';
      }
    }
    if (needRender) renderFarm();
  }

  function startFarmTimer() {
    stopFarmTimer();
    farmTimer = setInterval(tickFarm, 1000);
  }

  function stopFarmTimer() {
    if (farmTimer) {
      clearInterval(farmTimer);
      farmTimer = null;
    }
  }

  /* ---------------- 农田场景操作面板 ---------------- */
  function showFarmDock(index) {
    farmTargetIndex = typeof index === 'number' ? index : -1;
    var el = document.getElementById('farm-dock');
    if (!el) return;
    el.hidden = false;
    renderFarmDock();
    if (!farmDockTimer) {
      farmDockTimer = setInterval(function () {
        if (currentScreen !== 'world' || !document.body.classList.contains('is-in-farm')) return;
        renderFarmDock();
      }, 1000);
    }
  }

  function hideFarmDock() {
    if (farmDockTimer) {
      clearInterval(farmDockTimer);
      farmDockTimer = null;
    }
    var el = document.getElementById('farm-dock');
    if (el) {
      el.hidden = true;
      el.innerHTML = '';
    }
    farmTargetIndex = -1;
  }

  function updateFarmDock(index) {
    farmTargetIndex = typeof index === 'number' ? index : -1;
    var el = document.getElementById('farm-dock');
    if (!el || el.hidden) {
      showFarmDock(farmTargetIndex);
      return;
    }
    renderFarmDock();
  }

  function renderFarmDock() {
    var el = document.getElementById('farm-dock');
    if (!el || el.hidden) return;
    var s = state();
    if (!s) return;
    var idx = farmTargetIndex;
    var plot = idx >= 0 ? s.plots[idx] : null;
    var crop = plot ? Core.findCrop(plot.cropId) : null;
    var html = [];
    html.push('<div class="farm-dock-head"><div class="farm-dock-title">小农田' +
      (plot ? '<em>田块 ' + (idx + 1) + '</em>' : '') + '</div>' +
      '<button type="button" class="farm-dock-exit" data-action="farm-leave">离开</button></div>');
    html.push('<div class="farm-dock-res"><span>种子 <b>' + s.seeds + '</b></span>' +
      '<span>清水 <b>' + s.water + '</b></span><span>肥料 <b>' + s.fert + '</b></span></div>');
    if (!plot) {
      html.push('<div class="farm-dock-status"><span class="farm-dock-empty">走近一块田就能开始操作</span></div>');
    } else if (!crop) {
      html.push('<div class="farm-dock-status"><span class="farm-dock-empty">空地 · 选一种作物</span></div>');
      html.push('<div class="farm-crop-row">');
      for (var i = 0; i < D.CROPS.length; i += 1) {
        var c = D.CROPS[i];
        var cropBuff = c.buff ? Core.findBuff(c.buff) : null;
        var poor = s.seeds < c.seedCost;
        html.push('<button type="button" class="farm-crop-chip' +
          (farmSelectedCrop === c.id ? ' is-selected' : '') + (poor ? ' is-poor' : '') +
          (cropBuff ? ' is-buff' : '') +
          '" data-action="farm-select-crop" data-crop="' + c.id + '">' +
          '<span class="farm-crop-chip-art">' + Art.crop(c.id, 2) + '</span>' +
          (cropBuff ? '<i class="farm-buff-mark">增益</i>' : '') +
          '<b>' + c.name + '</b><em>' + c.seedCost + ' 种子</em></button>');
      }
      html.push('</div>');
    } else {
      var mature = isMature(plot);
      var progress = plotProgress(plot);
      var stage = mature ? 2 : (plot.watered ? 1 : 0);
      var status;
      if (!plot.watered) status = '待浇水 · 需要 ' + crop.waterCost + ' 清水';
      else if (mature) status = crop.buff ? ('已成熟 · 摘取' + crop.buffName) : '已成熟 · 可以收获';
      else status = '生长中 ' + Math.round(progress) + '% · 约 ' + formatDuration(plotRemain(plot));
      html.push('<div class="farm-dock-status"><span class="farm-status-art">' + Art.crop(crop.id, stage) + '</span>' +
        '<div class="farm-status-text"><strong>' + crop.name + '</strong><span>' + status + '</span>' +
        (plot.watered && !mature ? '<span class="farm-tags">' +
          (plot.fertilized ? '已施肥 · 生长加速' : '已浇水') + '</span>' : '') +
        '</div></div>');
      if (plot.watered && !mature) {
        html.push('<div class="farm-progress"><i style="width:' + Math.round(progress) + '%"></i></div>');
      }
    }
    var selected = Core.findCrop(farmSelectedCrop) || D.CROPS[0];
    var canPlant = !!plot && !crop && s.seeds >= selected.seedCost;
    var canHarvest = !!plot && !!crop && isMature(plot);
    var canWater = !!plot && !!crop && !plot.watered && s.water >= crop.waterCost;
    var canFert = !!plot && !!crop && plot.watered && !plot.fertilized && !isMature(plot) && s.fert >= 1;
    var canRemove = !!plot && !!crop;
    var primaryAction = canHarvest ? 'farm-harvest' : 'farm-plant';
    var primaryLabel = canHarvest ? '收获' : '种田';
    var primaryDisabled = canHarvest ? false : !canPlant;
    html.push('<div class="farm-actions">' +
      '<button type="button" class="btn farm-action ' + (canHarvest || canPlant ? 'primary' : 'ghost') +
      '" data-action="' + primaryAction + '"' + (primaryDisabled ? ' disabled' : '') + '>' + primaryLabel + '</button>' +
      '<button type="button" class="btn farm-action ghost" data-action="farm-water"' + (canWater ? '' : ' disabled') + '>浇水</button>' +
      '<button type="button" class="btn farm-action ghost" data-action="farm-fert"' + (canFert ? '' : ' disabled') + '>施肥</button>' +
      '<button type="button" class="btn farm-action ghost is-remove" data-action="farm-remove"' + (canRemove ? '' : ' disabled') + '>铲除</button>' +
      '</div>');
    el.innerHTML = html.join('');
  }

  function grantCropBuff(crop) {
    if (!crop || !crop.buff) return '';
    var buff = Core.findBuff(crop.buff);
    var result = Core.addBattleBuff(crop.buff, 1);
    if (!result.ok) {
      if (result.reason === 'cap') return '，' + (crop.buffName || '增益') + '已达上限';
      return '';
    }
    return '，获得「' + (buff ? buff.name : crop.buffName) + '」x' + result.count +
      (buff ? '（' + buff.short + '）' : '');
  }

  function farmPlant() {
    var s = state();
    if (!s || farmTargetIndex < 0) return;
    var plot = s.plots[farmTargetIndex];
    var crop = Core.findCrop(farmSelectedCrop);
    if (!plot || !crop) return;
    if (plot.cropId) { toast('这块地已经种了东西'); return; }
    if (s.seeds < crop.seedCost) { toast('种子不够，去杂货铺买一些'); return; }
    s.seeds -= crop.seedCost;
    plot.cropId = crop.id;
    plot.watered = false;
    plot.plantedAt = 0;
    plot.fertilized = false;
    Core.saveState();
    renderHUD();
    if (window.World && window.World.refreshFarmCrops) window.World.refreshFarmCrops();
    renderFarmDock();
    toast('种下了' + crop.name + '，记得浇水');
  }

  function farmWater() {
    var s = state();
    if (!s || farmTargetIndex < 0) return;
    var plot = s.plots[farmTargetIndex];
    var crop = plot ? Core.findCrop(plot.cropId) : null;
    if (!plot || !crop) return;
    if (plot.watered) { toast('已经浇过水了'); return; }
    if (s.water < crop.waterCost) { toast('清水不够，去杂货铺买一些'); return; }
    s.water -= crop.waterCost;
    plot.watered = true;
    plot.plantedAt = Date.now();
    plot.fertilized = false;
    Core.saveState();
    renderHUD();
    if (window.World && window.World.refreshFarmCrops) window.World.refreshFarmCrops();
    renderFarmDock();
    toast('浇水完成，' + formatDuration(crop.growSec) + '后成熟');
  }

  function farmFertilize() {
    var s = state();
    if (!s || farmTargetIndex < 0) return;
    var plot = s.plots[farmTargetIndex];
    var crop = plot ? Core.findCrop(plot.cropId) : null;
    if (!plot || !crop) return;
    if (!plot.watered) { toast('先浇水再施肥'); return; }
    if (plot.fertilized) { toast('这株已经施过肥了'); return; }
    if (isMature(plot)) { toast('已经成熟了，直接收获吧'); return; }
    if (s.fert < 1) { toast('肥料不够，去杂货铺买一些'); return; }
    s.fert -= 1;
    plot.fertilized = true;
    plot.plantedAt -= crop.growSec * 500;
    Core.saveState();
    renderHUD();
    if (window.World && window.World.refreshFarmCrops) window.World.refreshFarmCrops();
    renderFarmDock();
    toast('施肥完成，' + crop.name + '生长加速');
  }

  function farmHarvest() {
    var s = state();
    if (!s || farmTargetIndex < 0) return;
    var plot = s.plots[farmTargetIndex];
    var crop = plot ? Core.findCrop(plot.cropId) : null;
    if (!plot || !crop) return;
    if (!isMature(plot)) { toast('还没成熟'); return; }
    s.coins += crop.coins;
    s.seeds += crop.seedReturn;
    var extras = [];
    if (Math.random() < crop.itemChance) {
      var item = Core.rollItemByRarity();
      Core.addItem(item.id);
      extras.push(item.name);
    }
    if (Math.random() < crop.decoChance) {
      var deco = Core.rollDeco();
      Core.addDeco(deco.id, 1);
      extras.push(deco.name);
    }
    var buffMsg = grantCropBuff(crop);
    plot.cropId = null;
    plot.watered = false;
    plot.plantedAt = 0;
    plot.fertilized = false;
    Core.saveState();
    renderHUD();
    if (window.World && window.World.refreshFarmCrops) window.World.refreshFarmCrops();
    renderFarmDock();
    toast('收获 +' + crop.coins + ' 金币、+' + crop.seedReturn + ' 种子' +
      (extras.length ? '，额外获得 ' + extras.join('、') : '') + buffMsg, 2800);
  }

  function farmConfirmRemove() {
    var s = state();
    if (!s || farmTargetIndex < 0) return;
    var plot = s.plots[farmTargetIndex];
    var crop = plot ? Core.findCrop(plot.cropId) : null;
    if (!plot || !crop) return;
    openModal('<div class="modal-mask" data-action="close-modal"></div><div class="modal-card">' +
      '<div class="modal-head"><strong>铲除作物</strong>' +
      '<button type="button" class="icon-btn" data-action="close-modal" aria-label="关闭">' +
      Art.icon('close', '#E9E1D2') + '</button></div>' +
      '<div class="modal-body"><p class="modal-sub">确定铲除「' + crop.name +
      '」吗？已经投入的种子和清水不会返还。</p><div class="choice-buttons">' +
      '<button type="button" class="btn ghost" data-action="close-modal">再想想</button>' +
      '<button type="button" class="btn danger" data-action="farm-remove-confirm" data-plot="' +
      farmTargetIndex + '">铲除</button></div></div></div>');
  }

  function farmRemove(index) {
    var s = state();
    var plot = s && s.plots[index];
    var crop = plot ? Core.findCrop(plot.cropId) : null;
    if (!plot || !crop) { closeModal(); return; }
    plot.cropId = null;
    plot.watered = false;
    plot.plantedAt = 0;
    plot.fertilized = false;
    closeModal();
    Core.saveState();
    renderHUD();
    if (window.World && window.World.refreshFarmCrops) window.World.refreshFarmCrops();
    renderFarmDock();
    toast('已铲除' + crop.name);
  }

  function farmSelectCrop(cropId) {
    if (!Core.findCrop(cropId)) return;
    farmSelectedCrop = cropId;
    renderFarmDock();
  }

  function openCropPicker(plotIndex) {
    var s = state();
    var html = '<div class="modal-mask" data-action="close-modal"></div><div class="modal-card">' +
      '<div class="modal-head"><strong>选择作物</strong>' +
      '<button type="button" class="icon-btn" data-action="close-modal" aria-label="关闭">' + Art.icon('close', '#3A3A44') + '</button></div>' +
      '<div class="modal-body"><p class="modal-sub">种子 ' + s.seeds + ' · 清水 ' + s.water + '</p><div class="crop-list">';
    for (var i = 0; i < D.CROPS.length; i += 1) {
      var crop = D.CROPS[i];
      var cropBuff = crop.buff ? Core.findBuff(crop.buff) : null;
      var enough = s.seeds >= crop.seedCost;
      html += '<button type="button" class="crop-option' + (cropBuff ? ' is-buff' : '') + '" data-action="crop-choose" data-crop="' + crop.id + '" data-plot="' + plotIndex + '"' + (enough ? '' : ' disabled') + '>' +
        '<span class="crop-art">' + Art.crop(crop.id, 2) + '</span>' +
        '<span class="crop-info"><strong>' + crop.name + (cropBuff ? ' · 增益' : '') + '</strong><span>' + crop.desc + '</span>' +
        '<em>种子 x' + crop.seedCost + ' · 浇水 x' + crop.waterCost + ' · ' + formatDuration(crop.growSec) + '</em>' +
        '<b>' + (cropBuff ? ('收获 +' + crop.coins + ' 金币 · ' + crop.buffName + '（' + cropBuff.short + '）') : ('收获 +' + crop.coins + ' 金币')) + '</b></span></button>';
    }
    html += '</div>';
    if (s.seeds <= 0) html += '<p class="modal-warn">种子不够了，去战斗或杂货铺补充吧。</p>';
    html += '</div></div>';
    openModal(html);
  }

  function openModal(html) {
    var modal = document.getElementById('modal');
    if (!modal) return;
    modal.innerHTML = html;
    modal.classList.add('is-open');
    modal.removeAttribute('hidden');
  }

  function closeModal() {
    var modal = document.getElementById('modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('hidden', 'hidden');
    modal.innerHTML = '';
  }

  function plantCrop(plotIndex, cropId) {
    var s = state();
    var crop = Core.findCrop(cropId);
    var plot = s.plots[plotIndex];
    if (!crop || !plot) return;
    if (plot.cropId) {
      toast('这块地已经种了东西');
      return;
    }
    if (s.seeds < crop.seedCost) {
      toast('种子不够');
      return;
    }
    s.seeds -= crop.seedCost;
    plot.cropId = crop.id;
    plot.watered = false;
    plot.plantedAt = 0;
    closeModal();
    Core.saveState();
    renderFarm();
    renderHUD();
    toast('种下了' + crop.name + '，记得浇水');
  }

  function waterPlot(plotIndex) {
    var s = state();
    var plot = s.plots[plotIndex];
    var crop = plot ? Core.findCrop(plot.cropId) : null;
    if (!plot || !crop) return;
    if (plot.watered) {
      toast('已经浇过水了');
      return;
    }
    if (s.water < crop.waterCost) {
      toast('清水不够，去战斗或杂货铺补充吧');
      return;
    }
    s.water -= crop.waterCost;
    plot.watered = true;
    plot.plantedAt = Date.now();
    Core.saveState();
    renderFarm();
    renderHUD();
    toast('浇水完成，' + formatDuration(crop.growSec) + '后成熟');
  }

  function harvestPlot(plotIndex) {
    var s = state();
    var plot = s.plots[plotIndex];
    var crop = plot ? Core.findCrop(plot.cropId) : null;
    if (!plot || !crop) return;
    if (!isMature(plot)) {
      toast('还没成熟');
      return;
    }
    s.coins += crop.coins;
    s.seeds += crop.seedReturn;
    var extras = [];
    if (Math.random() < crop.itemChance) {
      var item = Core.rollItemByRarity();
      Core.addItem(item.id);
      extras.push(item.name);
    }
    if (Math.random() < crop.decoChance) {
      var deco = Core.rollDeco();
      Core.addDeco(deco.id, 1);
      extras.push(deco.name);
    }
    var buffMsg = grantCropBuff(crop);
    plot.cropId = null;
    plot.watered = false;
    plot.plantedAt = 0;
    Core.saveState();
    renderFarm();
    renderHUD();
    toast('收获 +' + crop.coins + ' 金币、+' + crop.seedReturn + ' 种子' +
      (extras.length ? '，额外获得 ' + extras.join('、') : '') + buffMsg, 2800);
  }

  /* ---------------- 背包 ---------------- */
  function itemCard(inv) {
    var item = Core.findItem(inv.id);
    if (!item) return '';
    return '<button type="button" class="item-card rarity-' + item.rarity + '" data-action="equip" data-uid="' + inv.uid + '">' +
      '<span class="item-art">' + Art.item(item) + '</span>' +
      '<span class="item-info"><strong>' + item.name + '</strong>' +
      '<em>' + C.typeNames[item.type] + ' · +' + item.power + ' 战力</em>' +
      '<i>' + C.tierNames[item.rarity] + '</i></span></button>';
  }

  function renderBag(tab) {
    bagTab = tab || bagTab;
    var s = state();
    var shell = document.getElementById('bag-shell');
    if (!shell) return;
    var slotInfo = Core.getSlotsInfo();
    var tabs = [
      { id: 'equip', name: '装备' },
      { id: 'cards', name: '卡牌' },
      { id: 'deco', name: '装饰' },
      { id: 'collection', name: '图鉴' },
      { id: 'more', name: '更多' }
    ];
    var html = [];
    html.push(head('背包', '装备槽 ' + slotInfo.total + ' / ' + C.maxSlots, 'bag-back',
      '<button type="button" class="btn tiny" data-action="go-shop">杂货铺</button>'));
    html.push('<div class="tabs">');
    for (var t = 0; t < tabs.length; t += 1) {
      html.push('<button type="button" class="tab' + (bagTab === tabs[t].id ? ' is-active' : '') + '" ' +
        'data-action="bag-tab" data-tab="' + tabs[t].id + '">' + tabs[t].name + '</button>');
    }
    html.push('</div>');
    html.push('<div class="screen-body bag-body">');

    if (bagTab === 'equip') {
      html.push('<div class="panel"><div class="panel-title">已装备 <span>' + slotInfo.base + ' 基础 + ' +
        slotInfo.temporary + ' 临时</span></div><div class="equip-slots">');
      for (var i = 0; i < s.equipment.length; i += 1) {
        var uid = s.equipment[i];
        var inv = uid ? Core.getItemByUid(uid) : null;
        var item = inv ? Core.findItem(inv.id) : null;
        if (item) {
          html.push('<button type="button" class="equip-slot filled" data-action="unequip" data-slot="' + i + '">' +
            '<span class="equip-art">' + Art.item(item) + '</span>' +
            '<span class="equip-info"><strong>' + item.name + '</strong><em>+' + item.power + ' 战力</em></span>' +
            '<span class="equip-tag">卸下</span></button>');
        } else {
          html.push('<div class="equip-slot empty"><span class="equip-plus">+</span><em>空装备槽</em></div>');
        }
      }
      html.push('</div><p class="panel-note">装备槽会随连续失败临时增加，最多 ' + C.maxSlots +
        ' 格；胜利后重置为 ' + C.startSlots + ' 格，超出槽位的装备会自动放回背包。</p></div>');

      var list = Core.getUnequippedItems();
      html.push('<div class="panel"><div class="panel-title">装备库 <span>' + list.length + ' 件</span></div>');
      if (list.length) {
        html.push('<div class="item-grid">');
        for (var k = 0; k < list.length; k += 1) html.push(itemCard(list[k]));
        html.push('</div>');
      } else {
        html.push('<p class="empty-hint">还没有可用装备。战斗、收获作物和杂货铺都能获得。</p>');
      }
      html.push('</div>');
    }

    if (bagTab === 'cards') {
      html.push('<div class="panel"><div class="panel-title">道具卡</div><div class="card-list">');
      for (var c = 0; c < D.CARDS.length; c += 1) {
        var card = D.CARDS[c];
        html.push('<div class="card-row"><span class="card-icon" style="background:' + card.color + '">' +
          Art.icon(card.icon, '#FFFFFF') + '</span>' +
          '<span class="card-row-info"><strong>' + card.name + ' <b>x' + (s.cards[card.id] || 0) + '</b></strong>' +
          '<span>' + card.desc + '</span></span></div>');
      }
      html.push('</div><p class="panel-note">道具卡在「战斗准备」页面使用。</p></div>');
    }

    if (bagTab === 'deco') {
      html.push('<div class="panel"><div class="panel-title">装饰库存</div>');
      var hasDeco = false;
      html.push('<div class="deco-inventory">');
      for (var d = 0; d < D.DECORATIONS.length; d += 1) {
        var deco = D.DECORATIONS[d];
        var count = s.decoBag[deco.id] || 0;
        if (count <= 0) continue;
        hasDeco = true;
        html.push('<div class="deco-row"><span class="deco-row-art">' + Art.deco(deco.id) + '</span>' +
          '<span class="deco-row-info"><strong>' + deco.name + ' <b>x' + count + '</b></strong>' +
          '<em>+' + deco.power + ' 繁荣度 · Lv.' + deco.rarity + ' ' + C.tierNames[deco.rarity] + '</em></span></div>');
      }
      html.push('</div>');
      if (!hasDeco) html.push('<p class="empty-hint">还没有装饰。战斗胜利、收获星星果或杂货铺都能获得。</p>');
      html.push('<p class="panel-note">装饰分 Lv.1 普通到 Lv.4 传说，等级越高越难获得。小岛上已摆放 ' + s.worldDecos.length + ' / ' + C.maxWorldDecos +
        ' 件，繁荣度 +' + Core.getDecoPower() + ' 战力。</p>');
      html.push('<button type="button" class="btn wide" data-action="go-world-decorate">去小岛装饰</button></div>');
    }

    if (bagTab === 'collection') {
      var stats = Core.getCollectionStats();
      html.push('<div class="panel"><div class="panel-title">生物图鉴 <span>' + stats.owned + ' / ' + stats.total + '</span></div>' +
        '<p class="panel-note">已变身 ' + stats.owned + ' 种，已遇见 ' + stats.seen + ' 种。</p>' +
        '<button type="button" class="btn primary wide" data-action="go-collection">打开完整图鉴</button></div>');
    }

    if (bagTab === 'more') {
      var storageOk = Core.isStorageAvailable();
      var stats2 = Core.getCollectionStats();
      html.push('<div class="panel"><div class="panel-title">冒险记录</div><div class="stat-grid">' +
        '<div class="stat-cell"><span>总战斗</span><b>' + s.totalBattles + '</b></div>' +
        '<div class="stat-cell"><span>胜利</span><b>' + s.wins + '</b></div>' +
        '<div class="stat-cell"><span>失败</span><b>' + s.losses + '</b></div>' +
        '<div class="stat-cell"><span>最高连胜</span><b>' + s.bestStreak + '</b></div>' +
        '<div class="stat-cell"><span>图鉴</span><b>' + stats2.owned + '/' + stats2.total + '</b></div>' +
        '<div class="stat-cell"><span>繁荣度</span><b>+' + Core.getDecoPower() + '</b></div>' +
        '</div></div>');
      html.push('<div class="panel"><div class="panel-title">存档</div>' +
        '<p class="storage-status ' + (storageOk ? 'ok' : 'warn') + '">' +
        (storageOk ? '自动保存已开启，关闭小工具后进度会保留。' : '当前环境不支持本地存档，本次进度仅在本次打开期间保留。') +
        '</p>' +
        '<button type="button" class="btn danger wide" data-action="reset-save">重新开始</button></div>');
      html.push('<div class="panel"><div class="panel-title">关于</div>' +
        '<p class="about-text">万灵屿 v3.0 · 大世界探索、随机变身、属性克制、自动战斗、增益树与金币指定变身。<br>' +
        '场景素材：Kenney（CC0）。全部内容离线运行，无需联网。</p></div>');
    }

    html.push('</div>');
    shell.innerHTML = html.join('');
  }

  /* ---------------- 图鉴 ---------------- */
  function renderCollection() {
    var s = state();
    var shell = document.getElementById('collection-shell');
    if (!shell) return;
    var stats = Core.getCollectionStats();
    var pity = Core.getPityInfo();
    var filters = [
      { id: 'all', name: '全部' },
      { id: 'owned', name: '已变身' },
      { id: 'legend', name: '传说 / 神话' }
    ];
    var html = [];
    html.push(head('生物图鉴', '已变身 ' + stats.owned + ' / ' + stats.total + ' · 已遇见 ' + stats.seen, 'collection-back',
      '<button type="button" class="btn tiny" data-action="open-transform">指定变身</button>'));
    html.push('<div class="screen-body collection-body">');

    html.push('<div class="panel collection-summary"><div class="tier-chips">');
    for (var t = 1; t <= 5; t += 1) {
      html.push('<span class="tier-chip rarity-' + t + '">' + C.tierNames[t] + ' ' +
        stats.byTier[t].owned + '/' + stats.byTier[t].total + '</span>');
    }
    html.push('</div><p class="panel-note">图鉴记录每次随机变身；遇见过的生物会点亮，变身次数会累计。</p>' +
      '<p class="pity-line">传说保底：再变身 <b>' + pity.legendaryIn + '</b> 次 · 神话保底：再变身 <b>' + pity.mythicIn + '</b> 次</p></div>');

    html.push('<div class="tabs collection-tabs">');
    for (var f = 0; f < filters.length; f += 1) {
      html.push('<button type="button" class="tab' + (collectionFilter === filters[f].id ? ' is-active' : '') + '" ' +
        'data-action="collection-filter" data-filter="' + filters[f].id + '">' + filters[f].name + '</button>');
    }
    html.push('</div>');

    html.push('<div class="collection-grid">');
    for (var i = 0; i < D.CREATURES.length; i += 1) {
      var c = D.CREATURES[i];
      var entry = s.collection[c.id] || { seen: false, owned: 0 };
      if (collectionFilter === 'owned' && !(entry.owned > 0)) continue;
      if (collectionFilter === 'legend' && c.tier < 4) continue;
      var locked = !entry.seen;
      var cls = 'collection-card rarity-' + c.tier;
      if (locked) cls += ' is-locked';
      if (entry.owned > 0) cls += ' is-owned';
      if (c.tier >= 5) cls += ' is-myth';
      else if (c.tier >= 4) cls += ' is-legend';
      html.push('<div class="' + cls + '">' +
        '<span class="collection-art">' + Art.creature(c.id) + '</span>' +
        '<strong>' + (locked ? '???' : c.name) + '</strong>' +
        '<div class="collection-badges">' +
        (locked ? '' : elementBadge(c.element, false) + rarityBadge(c.tier)) +
        '</div>' +
        '<em>' + (locked ? '尚未遇见' : (C.tierNames[c.tier] + ' · ' + c.power + ' 战力')) + '</em>' +
        '<span class="collection-skill">' + (locked ? '' : c.skill) + '</span>' +
        '<span class="collection-count">' +
        (entry.owned > 0 ? '变身 x' + entry.owned : (entry.seen ? '已遇见' : '')) +
        '</span></div>');
    }
    html.push('</div>');

    html.push('<div class="panel"><div class="panel-title">最近变身 <span>最多记录 30 条</span></div>');
    if (s.transformLog.length) {
      html.push('<div class="transform-log">');
      for (var l = 0; l < Math.min(12, s.transformLog.length); l += 1) {
        var log = s.transformLog[l];
        var lc = Core.findCreature(log.id);
        if (!lc) continue;
        html.push('<div class="log-row rarity-' + log.tier + '">' +
          '<span class="log-art">' + Art.creature(lc.id) + '</span>' +
          '<span class="log-info"><strong>' + lc.name + '</strong>' +
          '<em>' + C.tierNames[log.tier] + ' · ' + Core.findElement(lc.element).name + '</em></span>' +
          '<span class="log-time">' + formatDate(log.at) + '</span></div>');
      }
      html.push('</div>');
    } else {
      html.push('<p class="empty-hint">还没有变身记录，去战斗或使用刷新卡吧。</p>');
    }
    html.push('</div>');

    html.push('<div class="panel"><div class="panel-title">概率说明</div>' +
      '<p class="rate-text">普通 55% · 稀有 30% · 史诗 14% · 传说 0.8% · 神话 0.02%。<br>' +
      '连续变身会积累机缘：300 次必得传说，2000 次必得神话。传说与神话生物非常稀有，遇到就是赚到。</p></div>');
    html.push('</div>');
    shell.innerHTML = html.join('');
  }

  /* ---------------- 商店 ---------------- */
  function shopIcon(good) {
    if (good.type === 'resource') return Art.icon(good.key === 'seeds' ? 'seed' : (good.key === 'fert' ? 'fert' : 'water'));
    if (good.type === 'card') {
      var card = Core.findCard(good.key);
      if (!card) return Art.icon('star', '#F2C94C');
      return '<span class="shop-card-icon" style="background:' + card.color + '">' +
        Art.icon(card.icon, '#FFFFFF') + '</span>';
    }
    if (good.type === 'randomDeco') return Art.deco('fountain');
    return Art.item(Core.findItem('thunder_hammer'));
  }

  function renderShop() {
    var s = state();
    var shell = document.getElementById('shop-shell');
    if (!shell) return;
    var html = [];
    html.push(head('杂货铺', '金币 ' + s.coins, 'shop-back'));
    html.push('<div class="screen-body shop-body"><div class="shop-list">');
    for (var i = 0; i < D.SHOP.length; i += 1) {
      var good = D.SHOP[i];
      var afford = s.coins >= good.cost;
      html.push('<div class="shop-row"><span class="shop-icon">' + shopIcon(good) + '</span>' +
        '<span class="shop-info"><strong>' + good.name + '</strong><span>' + good.desc + '</span></span>' +
        '<button type="button" class="btn tiny" data-action="buy" data-good="' + good.id + '"' + (afford ? '' : ' disabled') + '>' +
        good.cost + ' 金币</button></div>');
    }
    html.push('</div><p class="shop-note">金币来自战斗奖励、作物收获和连胜加成。</p></div>');
    shell.innerHTML = html.join('');
  }

  function buyGood(goodId) {
    var s = state();
    var good = Core.findShopGood(goodId);
    if (!good) return;
    if (s.coins < good.cost) {
      toast('金币不够');
      return;
    }
    s.coins -= good.cost;
    var message = '购买成功：' + good.name;
    if (good.type === 'resource') {
      s[good.key] += good.amount;
    } else if (good.type === 'card') {
      Core.addCard(good.key, good.amount);
    } else if (good.type === 'randomDeco') {
      var deco = Core.rollDeco();
      Core.addDeco(deco.id, 1);
      message = '获得装饰：' + deco.name + '（Lv.' + deco.rarity + ' ' + C.tierNames[deco.rarity] + '）';
    } else if (good.type === 'randomItem') {
      var item = Core.rollItemByRarity();
      Core.addItem(item.id);
      message = '获得装备：' + item.name;
    }
    Core.saveState();
    renderShop();
    renderHUD();
    toast(message);
  }

  /* ---------------- 道具卡 ---------------- */
  function useCard(cardId) {
    var s = state();
    if ((s.cards[cardId] || 0) <= 0) {
      toast('没有这张卡了');
      return;
    }
    if (cardId === 'shield' && s.buffs.shield) {
      toast('护盾卡已经生效');
      return;
    }
    if (cardId === 'double' && s.buffs.double) {
      toast('双倍卡已经生效');
      return;
    }
    var message = '';
    if (cardId === 'refresh') {
      var transform = Core.rollTransform(s.formId);
      message = '变身刷新：' + transform.creature.name + '（' + C.tierNames[transform.tier] + '）';
      if (transform.mythic) message = '神话降临！你变成了' + transform.creature.name;
      else if (transform.legendary) message = '传说降临！你变成了' + transform.creature.name;
    } else if (cardId === 'boost') {
      s.boost += 15;
      message = '强化完成：永久战力 +15';
    } else if (cardId === 'shield') {
      s.buffs.shield = true;
      message = '护盾卡生效：下一场对手战力 -15%';
    } else if (cardId === 'double') {
      s.buffs.double = true;
      message = '双倍卡生效：下一场胜利奖励翻倍';
    }
    Core.removeCard(cardId);
    Core.saveState();
    renderPrep();
    renderHUD();
    toast(message);
  }

  /* ---------------- 金币指定变身 ---------------- */
  function openTransformModal() {
    var s = state();
    if (!s) return;
    var html = '<div class="modal-mask" data-action="close-modal"></div><div class="modal-card transform-card">' +
      '<div class="modal-head"><div class="transform-head-text"><strong>指定变身</strong>' +
      '<span>金币 ' + money(s.coins) + '</span></div>' +
      '<button type="button" class="icon-btn" data-action="close-modal" aria-label="关闭">' +
      Art.icon('close', '#E9E1D2') + '</button></div>' +
      '<div class="modal-body transform-body">' +
      '<div class="transform-intro"><b>直接变成你指定的生物</b>' +
      '<span>价格按稀有度决定，越高越贵。指定变身不消耗随机变身的传说 / 神话保底。</span></div>' +
      '<div class="transform-legend"><span>普通 ' + money(D.TRANSFORM_COSTS[1]) + '</span>' +
      '<span>稀有 ' + money(D.TRANSFORM_COSTS[2]) + '</span>' +
      '<span>史诗 ' + money(D.TRANSFORM_COSTS[3]) + '</span>' +
      '<span>传说 ' + money(D.TRANSFORM_COSTS[4]) + '</span>' +
      '<span>神话 ' + money(D.TRANSFORM_COSTS[5]) + '</span></div>' +
      '<div class="transform-grid">';
    for (var i = 0; i < D.CREATURES.length; i += 1) {
      var c = D.CREATURES[i];
      var cost = Core.getTransformCost(c.id);
      var current = s.formId === c.id;
      var poor = s.coins < cost;
      html += '<button type="button" class="transform-choice rarity-' + c.tier +
        (current ? ' is-current' : '') + (poor ? ' is-poor' : '') + '" ' +
        'data-action="select-transform" data-creature="' + c.id + '"' + (current ? ' disabled' : '') + '>' +
        '<span class="transform-choice-art">' + Art.creature(c.id) + '</span>' +
        '<span class="transform-choice-main"><strong>' + c.name + '</strong>' +
        '<em>' + C.tierNames[c.tier] + ' · ' + c.power + ' 战力</em>' +
        '<b><i class="coin-dot"></i>' + money(cost) + '</b></span>' +
        (current ? '<span class="transform-current">当前</span>' : '') +
        '</button>';
    }
    html += '</div></div></div>';
    openModal(html);
  }

  function requestTransform(creatureId) {
    var s = state();
    var creature = Core.findCreature(creatureId);
    if (!s || !creature) return;
    if (s.formId === creatureId) { toast('你现在就是' + creature.name); return; }
    var cost = Core.getTransformCost(creatureId);
    if (s.coins < cost) {
      toast('金币不足，还差 ' + money(cost - s.coins) + ' 金币');
      return;
    }
    var html = '<div class="modal-mask" data-action="close-modal"></div><div class="modal-card transform-confirm-card">' +
      '<div class="modal-head"><strong>确认变身</strong>' +
      '<button type="button" class="icon-btn" data-action="close-modal" aria-label="关闭">' +
      Art.icon('close', '#E9E1D2') + '</button></div>' +
      '<div class="modal-body transform-confirm-body">' +
      '<div class="transform-confirm-hero"><span class="transform-confirm-art">' + Art.creature(creatureId) + '</span>' +
      '<div><strong>' + creature.name + '</strong><em>' + rarityBadge(creature.tier) +
      ' <span class="transform-confirm-power">' + creature.power + ' 战力</span></em></div></div>' +
      '<p class="transform-confirm-note">花费 <b>' + money(cost) + ' 金币</b>，金币将从 ' +
      money(s.coins) + ' 变为 ' + money(s.coins - cost) + '。指定变身不会改变随机变身保底。</p>' +
      '<div class="choice-buttons"><button type="button" class="btn ghost" data-action="close-modal">再想想</button>' +
      '<button type="button" class="btn primary" data-action="confirm-transform" data-creature="' + creatureId + '">' +
      '确认变身</button></div></div></div>';
    openModal(html);
  }

  function confirmTransform(creatureId) {
    var result = Core.transformTo(creatureId);
    if (!result.ok) {
      if (result.reason === 'coins') toast('金币不足，还差 ' + money(result.short || 0) + ' 金币');
      else if (result.reason === 'same') toast('你现在就是' + result.creature.name);
      else toast('暂时无法变身');
      return;
    }
    closeModal();
    renderHUD();
    if (currentScreen === 'prep') renderPrep();
    else if (currentScreen === 'collection') renderCollection();
    else if (currentScreen === 'bag') renderBag(bagTab);
    toast('花费 ' + money(result.cost) + ' 金币，变身为' + result.creature.name, 2600);
  }

  /* ---------------- 建设与快捷栏 ---------------- */
  var UNLOCK_ICONS = {
    garden: 'sprout', shop: 'bag', farm: 'seed',
    deco: 'tree', house: 'book', tower: 'tower'
  };

  function visibleQuickCount() {
    var s = state();
    if (!s) return 2;
    var count = 0;
    var btns = document.querySelectorAll('#world-quick .quick-btn');
    for (var i = 0; i < btns.length; i += 1) {
      var need = btns[i].getAttribute('data-unlock');
      if (!need || (s.unlocks && s.unlocks[need])) count += 1;
    }
    return Math.max(1, Math.min(4, count));
  }

  function renderQuickDock() {
    var s = state();
    if (!s) return;
    var btns = document.querySelectorAll('#world-quick .quick-btn');
    var shown = 0;
    for (var i = 0; i < btns.length; i += 1) {
      var need = btns[i].getAttribute('data-unlock');
      var open = !need || !!(s.unlocks && s.unlocks[need]);
      btns[i].hidden = !open;
      btns[i].setAttribute('aria-hidden', open ? 'false' : 'true');
      if (open) shown += 1;
    }
    var dock = document.getElementById('world-quick');
    if (dock) dock.style.setProperty('--quick-cols', String(Math.min(4, Math.max(1, shown))));
  }

  function renderBuild() {
    var s = state();
    var shell = document.getElementById('build-shell');
    if (!shell) return;
    var html = [];
    html.push(head('建设小岛', '金币 ' + s.coins + ' · 解锁后永久开放', 'go-world'));
    html.push('<div class="screen-body build-body">');
    html.push('<div class="build-intro"><b>从一座空岛开始</b><span>祭坛是岛上唯一的建筑。用战斗赚来的金币，决定这座岛接下来长成什么样。</span></div>');
    html.push('<div class="build-list">');
    for (var i = 0; i < D.UNLOCKS.length; i += 1) {
      var u = D.UNLOCKS[i];
      var owned = !!(s.unlocks && s.unlocks[u.id]);
      var afford = s.coins >= u.cost;
      var icon = UNLOCK_ICONS[u.id] || u.icon || 'star';
      html.push('<article class="build-card' + (owned ? ' is-owned' : '') + (buildFocus === u.id ? ' is-focus' : '') + '">' +
        '<span class="build-art">' + Art.icon(icon, owned ? '#8FC7A2' : '#E4C88C') + '</span>' +
        '<div class="build-main"><strong>' + u.name + '</strong><p>' + u.desc + '</p>' +
        '<span class="build-cost">' + (owned ? '已解锁' : ('<i class="coin-dot"></i>' + u.cost + ' 金币')) + '</span></div>' +
        (owned
          ? '<span class="build-state">' + Art.icon('check', '#8FC7A2') + '</span>'
          : '<button type="button" class="btn tiny primary build-buy" data-action="unlock-build" data-unlock="' + u.id + '"' + (afford ? '' : ' disabled') + '>' + (afford ? '解锁' : '金币不足') + '</button>') +
        '</article>');
    }
    html.push('</div>');
    html.push('<div class="panel build-note"><div class="panel-title">建设顺序建议</div>' +
      '<p>先解锁花园，草簇免费，可以马上把空岛铺出层次；再去祭坛赚金币，解锁杂货铺和小农田形成循环。高塔和装饰工坊适合中后期。</p></div>');
    html.push('</div>');
    shell.innerHTML = html.join('');
    if (buildFocus) {
      var focusEl = shell.querySelector('.build-card.is-focus');
      if (focusEl && focusEl.scrollIntoView) {
        setTimeout(function () { focusEl.scrollIntoView({ block: 'center' }); }, 60);
      }
    }
  }

  function showBuild(focusId) {
    buildFocus = focusId || null;
    show('build');
  }

  /* ---------------- 页面切换与动作 ---------------- */
  function show(id) {
    if (currentScreen === 'world' && id !== 'world') window.World.leave();
    if (currentScreen === 'battle' && id !== 'battle') {
      clearBattleTimers();
      battleToken += 1;
      currentBattle = null;
      battleSettled = true;
    }
    if (id === 'collection' && currentScreen !== 'collection') {
      collectionReturn = currentScreen === 'bag' ? 'bag' : 'world';
    }

    var screens = document.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i += 1) screens[i].classList.remove('is-active');
    var target = document.getElementById('screen-' + id);
    if (!target) return;
    target.classList.add('is-active');
    currentScreen = id;
    document.body.setAttribute('data-screen', id);
    renderHUD();

    if (id === 'world') { renderQuickDock(); window.World.enter(); maybeShowGuide(); }
    else if (id === 'build') renderBuild();
    else if (id === 'prep') renderPrep();
    else if (id === 'result') renderResult();
 else if (id === 'bag') renderBag(bagTab);
    else if (id === 'shop') renderShop();
    else if (id === 'collection') renderCollection();
    else if (id === 'tower') renderTower();

    var body = target.querySelector('.screen-body');
    if (body) body.scrollTop = 0;
  }

  function handleAction(action, el) {
    var s = state();
    if (!s && action !== 'reset-save') return;

    if (action === 'go-world' || action === 'go-island') {
      show('world');
    } else if (action === 'go-build') {
      showBuild();
    } else if (action === 'unlock-build') {
      var unlockId = el.getAttribute('data-unlock');
      var result = Core.unlockBuilding(unlockId);
      if (!result.ok) {
        if (result.reason === 'coins') toast('金币不够，先去祭坛战斗赚金币');
        else if (result.reason === 'owned') toast('这里已经建设好了');
        else toast('暂时无法解锁');
        return;
      }
      if (window.World && window.World.refreshBuildings) window.World.refreshBuildings();
      renderHUD();
      renderQuickDock();
      renderBuild();
      var unlockTips = {
        garden: '点右侧「种植」开始种草',
        shop: '杂货铺已经出现在东侧',
        farm: '小农田已经出现在西侧',
        deco: '点右侧「装饰」布置小岛',
        house: '图鉴入口已经加入快捷栏',
        tower: '高塔挑战已经加入快捷栏'
      };
      toast('已解锁「' + result.def.name + '」' + (unlockTips[unlockId] ? ' · ' + unlockTips[unlockId] : ''), 2600);
    } else if (action === 'open-transform') {
      openTransformModal();
    } else if (action === 'select-transform') {
      requestTransform(el.getAttribute('data-creature'));
    } else if (action === 'confirm-transform') {
      confirmTransform(el.getAttribute('data-creature'));
    } else if (action === 'world-garden') {
      if (!s.unlocks.garden) { showBuild('garden'); return; }
      if (currentScreen !== 'world') show('world');
      window.World.toggleGarden();
    } else if (action === 'world-select-plant') {
      window.World.selectPlant(el.getAttribute('data-plant'));
    } else if (action === 'go-battle') {
      if (s.towerBattle) {
        s.towerBattle = false;
        s.pendingEnemy = null;
        Core.saveState();
      }
      show('prep');
    } else if (action === 'start-battle') {
      startBattle();
    } else if (action === 'skip-battle') {
      skipBattle();
    } else if (action === 'result-continue') {
      var rr = s.lastResult;
      if (rr && rr.wheel && !wheelState.resolved) {
        toast('先转动转盘或一键跳过');
        return;
      }
      if (rr && rr.tower && rr.tower.win && !rr.tower.completed) {
        Core.nextTowerFloor();
        show('prep');
      } else {
        if (rr && rr.tower) Core.endTower();
        show('world');
      }
    } else if (action === 'loss-reroll' || action === 'loss-keep') {
      var reroll = action === 'loss-reroll';
      var before = s.formId;
      window.Battle.chooseLossForm(s, reroll);
      Core.saveState();
      if (reroll && s.formId !== before) {
        var creature = Core.findCreature(s.formId);
        if (creature.tier >= 5) toast('神话降临！你变成了' + creature.name);
        else if (creature.tier >= 4) toast('传说降临！你变成了' + creature.name);
        else toast('你变成了' + creature.name + '（' + creature.power + ' 战力）');
      }
      show('world');
    } else if (action === 'go-farm') {
      if (!s.unlocks.farm) { showBuild('farm'); return; }
      show('world');
      if (window.World && window.World.enterFarm) window.World.enterFarm();
    } else if (action === 'go-bag' || action === 'world-bag') {
      if (currentScreen !== 'bag') bagReturn = currentScreen;
      show('bag');
    } else if (action === 'bag-back') {
      show(bagReturn === 'prep' ? 'prep' : (bagReturn === 'shop' ? 'shop' : 'world'));
    } else if (action === 'go-shop') {
      if (!s.unlocks.shop) { showBuild('shop'); return; }
      if (currentScreen !== 'shop') shopReturn = currentScreen;
      show('shop');
    } else if (action === 'shop-back') {
      show(shopReturn === 'bag' ? 'bag' : (shopReturn === 'prep' ? 'prep' : 'world'));
    } else if (action === 'go-tower') {
      if (!s.unlocks.tower) { showBuild('tower'); return; }
      show('tower');
    } else if (action === 'tower-start') {
      Core.startTower();
      show('prep');
    } else if (action === 'tower-continue') {
      Core.nextTowerFloor();
      show('prep');
    } else if (action === 'tower-leave') {
      var tr = s.lastResult;
      if (tr && tr.wheel && !wheelState.resolved) {
        toast('先转动转盘或一键跳过');
        return;
      }
      Core.endTower();
      show('world');
    } else if (action === 'wheel-spin') {
      spinWheel();
    } else if (action === 'wheel-skip') {
      skipWheel();
    } else if (action === 'go-collection' || action === 'world-collection') {
      if (!s.unlocks.house) { showBuild('house'); return; }
      show('collection');
    } else if (action === 'collection-back') {
      show(collectionReturn === 'bag' ? 'bag' : 'world');
    } else if (action === 'world-interact') {
      window.World.interact();
    } else if (action === 'world-decorate') {
      if (!s.unlocks.deco) { showBuild('deco'); return; }
      window.World.toggleDecorate();
    } else if (action === 'go-world-decorate') {
      if (!s.unlocks.deco) { showBuild('deco'); return; }
      show('world');
      window.World.toggleDecorate();
    } else if (action === 'world-select-deco') {
      window.World.selectDeco(el.getAttribute('data-deco'));
    } else if (action === 'collection-filter') {
      collectionFilter = el.getAttribute('data-filter');
      renderCollection();
    } else if (action === 'use-card') {
      useCard(el.getAttribute('data-card'));
    } else if (action === 'bag-tab') {
      renderBag(el.getAttribute('data-tab'));
    } else if (action === 'equip') {
      var uid = el.getAttribute('data-uid');
      var slot = Core.equipItem(uid);
      if (slot < 0) {
        toast('装备槽已满，连续失败可以临时解锁更多槽位');
      } else {
        Core.saveState();
        renderBag('equip');
        renderHUD();
        toast('已装备到第 ' + (slot + 1) + ' 格');
      }
    } else if (action === 'unequip') {
      Core.unequipSlot(parseInt(el.getAttribute('data-slot'), 10));
      Core.saveState();
      renderBag('equip');
      renderHUD();
      toast('已卸下装备');
    } else if (action === 'guide-next') {
      if (guideStep >= guideSteps.length - 1) finishGuide();
      else { guideStep += 1; renderGuide(); }
    } else if (action === 'guide-prev') {
      if (guideStep > 0) { guideStep -= 1; renderGuide(); }
    } else if (action === 'guide-skip' || action === 'guide-done') {
      finishGuide();
    } else if (action === 'farm-leave') {
      if (window.World && window.World.leaveFarm) window.World.leaveFarm();
    } else if (action === 'farm-select-crop') {
      farmSelectCrop(el.getAttribute('data-crop'));
    } else if (action === 'farm-plant') {
      farmPlant();
    } else if (action === 'farm-water') {
      farmWater();
    } else if (action === 'farm-fert') {
      farmFertilize();
    } else if (action === 'farm-harvest') {
      farmHarvest();
    } else if (action === 'farm-remove') {
      farmConfirmRemove();
    } else if (action === 'farm-remove-confirm') {
      farmRemove(parseInt(el.getAttribute('data-plot'), 10));
    } else if (action === 'buy') {
      buyGood(el.getAttribute('data-good'));
    } else if (action === 'close-modal') {
      closeModal();
    } else if (action === 'reset-save') {
      if (window.confirm('确定要重新开始吗？当前小岛的所有进度都会被清空。')) {
        Core.resetState();
        if (window.World && window.World.refreshBuildings) window.World.refreshBuildings();
        guideShown = false;
        guideStep = 0;
        buildFocus = null;
        bagTab = 'equip';
        collectionFilter = 'all';
        closeModal();
        renderQuickDock();
        show('world');
        toast('新的小岛生活开始了');
      }
    }
  }

  function onDocumentClick(event) {
    var el = event.target;
    while (el && el !== document) {
      if (el.getAttribute && el.getAttribute('data-action')) break;
      el = el.parentNode;
    }
    if (!el || el === document) return;
    handleAction(el.getAttribute('data-action'), el);
  }

  function decorateQuickButtons() {
    var btns = document.querySelectorAll('.world-quick .quick-btn');
    for (var i = 0; i < btns.length; i += 1) {
      var ico = btns[i].querySelector('.quick-ico');
      if (!ico) continue;
      var name = ico.getAttribute('data-icon') || 'star';
      var color = ico.getAttribute('data-color') || '#DCD3C2';
      ico.innerHTML = Art.icon(name, color);
    }
  }

  function renderGuide() {
    var step = guideSteps[guideStep];
    var total = guideSteps.length;
    var dots = '';
    for (var i = 0; i < total; i += 1) {
      dots += '<i class="' + (i === guideStep ? 'is-active' : '') + '"></i>';
    }
    var html = '<div class="modal-mask" data-action="guide-skip"></div><div class="modal-card guide-card">' +
      '<div class="guide-head"><span class="guide-kicker">第一次上岛 · ' + (guideStep + 1) + ' / ' + total + '</span>' +
      '<span class="guide-dots">' + dots + '</span></div>' +
      '<div class="guide-art">' + Art.creature(step.art) + '</div>' +
      '<h2>' + step.title + '</h2><p>' + step.body + '</p>' +
      '<div class="guide-actions">' +
      (guideStep > 0
        ? '<button type="button" class="btn ghost" data-action="guide-prev">上一步</button>'
        : '<button type="button" class="btn ghost" data-action="guide-skip">跳过</button>') +
      '<button type="button" class="btn primary" data-action="' + (guideStep === total - 1 ? 'guide-done' : 'guide-next') + '">' +
      (guideStep === total - 1 ? '开始冒险' : '下一步') + '</button></div></div>';
    openModal(html);
  }

  function finishGuide() {
    var s = state();
    if (s) {
      s.guideSeen = true;
      Core.saveState();
    }
    closeModal();
    toast('旅途愉快，先去看看小岛吧', 1800);
  }

  function maybeShowGuide() {
    var s = state();
    if (!s || s.guideSeen || guideShown) return;
    guideShown = true;
    setTimeout(function () {
      if (currentScreen === 'world' && !state().guideSeen) {
        guideStep = 0;
        renderGuide();
      }
    }, 900);
  }

  function init() {
    document.addEventListener('click', onDocumentClick);
    decorateQuickButtons();
    renderQuickDock();
    renderHUD();
  }

  window.UI = {
    init: init,
    show: show,
    showBuild: showBuild,
    renderQuickDock: renderQuickDock,
    toast: toast,
    renderHUD: renderHUD,
    showFarmDock: showFarmDock,
    hideFarmDock: hideFarmDock,
    updateFarmDock: updateFarmDock
  };
}());
