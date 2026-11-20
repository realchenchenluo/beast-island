/* 变身岛 - 自动战斗模拟与结算（v2 属性克制版） */
(function () {
  'use strict';

  var D = window.GAME_DATA;
  var C = D.CONFIG;

  function pickAction(round, ownRatio, enemyRatio, advantage, energy, skillBonus) {
    var nextEnergy = Math.min(100, energy + 25);
    if (energy >= 100 && round >= 2) {
      var chance = 0.70 + (advantage ? 0.08 : 0) + (enemyRatio < 0.30 ? 0.07 : 0) -
        (ownRatio < 0.25 ? 0.12 : 0) + (skillBonus || 0);
      chance = Math.max(0.45, Math.min(0.92, chance));
      if (Math.random() < chance) return { action: 'skill', energy: 0, chance: chance };
    }
    return { action: 'normal', energy: nextEnergy, chance: 0 };
  }

  function rollDamage(atkPower, behind, action) {
    var isSkill = action === 'skill';
    var crit = Math.random() < (isSkill ? 0.16 : 0.12);
    var burst = !crit && behind && Math.random() < (isSkill ? 0.14 : 0.08);
    var variance = 0.80 + Math.random() * 0.44;
    var factor = isSkill ? 0.38 : 0.17;
    var dmg = atkPower * factor * variance;
    if (crit) dmg *= 1.75;
    if (burst) dmg *= 1.55;
    return { dmg: Math.max(1, Math.round(dmg)), crit: crit, burst: burst };
  }

  function moveText(creature, roll, action) {
    var normal = action === 'normal';
    if (roll.crit) {
      return normal
        ? '会心一击！' + creature.name + '的普通攻击造成 ' + roll.dmg + ' 点伤害'
        : '会心一击！' + creature.name + '的「' + creature.skill + '」造成 ' + roll.dmg + ' 点伤害';
    }
    if (roll.burst) {
      return normal
        ? '背水一战！' + creature.name + '的普通攻击爆发，造成 ' + roll.dmg + ' 点伤害'
        : '背水一战！' + creature.name + '爆发「' + creature.skill + '」，造成 ' + roll.dmg + ' 点伤害';
    }
    return normal
      ? creature.name + ' 使用普通攻击，造成 ' + roll.dmg + ' 点伤害'
      : creature.name + ' 使出「' + creature.skill + '」，造成 ' + roll.dmg + ' 点伤害';
  }

  function classify(win, pRatio, eRatio, playerPower, enemyPower) {
    var kind;
    var label;
    if (win) {
      if (pRatio >= 0.6) { kind = 'crush'; label = '战力碾压'; }
      else if (pRatio >= 0.3) { kind = 'clear'; label = '优势取胜'; }
      else { kind = 'close'; label = '极限险胜'; }
    } else {
      if (eRatio >= 0.6) { kind = 'rout'; label = '全面溃败'; }
      else if (eRatio >= 0.3) { kind = 'loss'; label = '惜败'; }
      else { kind = 'narrow'; label = '憾负'; }
    }
    return {
      kind: kind,
      kindLabel: label,
      upset: win && playerPower < enemyPower
    };
  }

  function elementLine(matchup, playerCreature, enemyCreature) {
    var pEl = D.ELEMENTS[matchup.playerElement];
    var eEl = D.ELEMENTS[matchup.enemyElement];
    if (matchup.neutral) {
      return '属性：' + pEl.name + ' vs ' + eEl.name + '，没有克制加成。';
    }
    if (matchup.playerAdvantage) {
      return '属性克制：' + pEl.name + '克' + eEl.name + '，我方伤害 +25%。';
    }
    return '属性被克：' + eEl.name + '克' + pEl.name + '，我方伤害 -15%。';
  }

  function simulate(playerPower, enemyPower, playerCreature, enemyCreature, options) {
    options = options || {};
    var skillBonus = Number(options.skillBonus) || 0;
    var pMax = Math.round(80 + playerPower * 0.9);
    var eMax = Math.round(80 + enemyPower * 0.9);
    var pHp = pMax;
    var eHp = eMax;
    var rounds = [];
    var roundNo = 0;
    var first = playerPower >= enemyPower ? 'p' : 'e';
    var matchup = window.Core.elementMatchup(playerCreature.element, enemyCreature.element);
    var pMult = matchup.playerMult;
    var eMult = matchup.enemyMult;
    var pEnergy = 0;
    var eEnergy = 0;
    var pAdvantage = !!matchup.playerAdvantage;
    var eAdvantage = !matchup.neutral && !matchup.playerAdvantage;

    while (pHp > 0 && eHp > 0 && roundNo < 40) {
      roundNo += 1;
      var order = first === 'p' ? ['p', 'e'] : ['e', 'p'];
      if (roundNo % 2 === 0) order.reverse();

      for (var i = 0; i < order.length; i += 1) {
        if (pHp <= 0 || eHp <= 0) break;
        if (order[i] === 'p') {
          var pBehind = pHp / pMax < 0.35;
          var pAction = pickAction(roundNo, pHp / pMax, eHp / eMax, pAdvantage, pEnergy, skillBonus);
          pEnergy = pAction.energy;
          var pRoll = rollDamage(playerPower, pBehind, pAction.action);
          pRoll.dmg = Math.max(1, Math.round(pRoll.dmg * pMult));
          eHp = Math.max(0, eHp - pRoll.dmg);
          rounds.push({
            side: 'p', action: pAction.action, skill: playerCreature.skill,
            pEnergy: pEnergy, eEnergy: eEnergy,
            dmg: pRoll.dmg, crit: pRoll.crit, burst: pRoll.burst,
            pHp: pHp, eHp: eHp, pMax: pMax, eMax: eMax, round: roundNo,
            text: moveText(playerCreature, pRoll, pAction.action)
          });
        } else {
          var eBehind = eHp / eMax < 0.35;
          var eAction = pickAction(roundNo, eHp / eMax, pHp / pMax, eAdvantage, eEnergy);
          eEnergy = eAction.energy;
          var eRoll = rollDamage(enemyPower, eBehind, eAction.action);
          eRoll.dmg = Math.max(1, Math.round(eRoll.dmg * eMult));
          pHp = Math.max(0, pHp - eRoll.dmg);
          rounds.push({
            side: 'e', action: eAction.action, skill: enemyCreature.skill,
            pEnergy: pEnergy, eEnergy: eEnergy,
            dmg: eRoll.dmg, crit: eRoll.crit, burst: eRoll.burst,
            pHp: pHp, eHp: eHp, pMax: pMax, eMax: eMax, round: roundNo,
            text: moveText(enemyCreature, eRoll, eAction.action)
          });
        }
      }
    }

    var win;
    if (pHp <= 0 && eHp <= 0) win = pHp / pMax >= eHp / eMax;
    else if (eHp <= 0) win = true;
    else if (pHp <= 0) win = false;
    else win = pHp / pMax >= eHp / eMax;

    if (roundNo >= 40 && pHp > 0 && eHp > 0) {
      rounds.push({
        side: 'p', dmg: 0, crit: false, burst: false,
        pHp: pHp, eHp: eHp, pMax: pMax, eMax: eMax, round: roundNo,
        text: '双方体力耗尽，裁判按剩余体力判定！'
      });
    }

    var pRatio = pHp / pMax;
    var eRatio = eHp / eMax;
    var cls = classify(win, pRatio, eRatio, playerPower, enemyPower);

    return {
      win: win,
      kind: cls.kind,
      kindLabel: cls.kindLabel,
      upset: cls.upset,
      rounds: rounds,
      pMax: pMax,
      eMax: eMax,
      pHp: pHp,
      eHp: eHp,
      pRatio: pRatio,
      eRatio: eRatio,
      totalRounds: roundNo,
      matchup: matchup,
      elementLine: elementLine(matchup, playerCreature, enemyCreature)
    };
  }

  function prepare(state) {
    if (!state.pendingEnemy) {
      state.pendingEnemy = window.Core.makeEnemy();
    }
    var buffs = state.buffs || {};
    var basePlayerPower = window.Core.getPower();
    var playerPower = buffs.war > 0 ? Math.round(basePlayerPower * 1.2) : basePlayerPower;
    var baseEnemyPower = state.pendingEnemy.power;
    var enemyPower = baseEnemyPower;
    if (buffs.shield) {
      enemyPower = Math.round(enemyPower * 0.85);
    }
    if (buffs.guard > 0) {
      enemyPower = Math.round(enemyPower * 0.8);
    }
    enemyPower = Math.max(40, enemyPower);
    var playerCreature = window.Core.findCreature(state.formId);
    var enemyCreature = window.Core.findCreature(state.pendingEnemy.creatureId);
    return {
      playerPower: playerPower,
      basePlayerPower: basePlayerPower,
      baseEnemyPower: baseEnemyPower,
      enemyPower: enemyPower,
      shieldActive: !!buffs.shield,
      warActive: !!(buffs.war > 0),
      guardActive: !!(buffs.guard > 0),
      focusActive: !!(buffs.focus > 0),
      buffCharges: { war: buffs.war || 0, guard: buffs.guard || 0, focus: buffs.focus || 0 },
      skillBonus: buffs.focus > 0 ? 0.12 : 0,
      playerCreature: playerCreature,
      enemyCreature: enemyCreature,
      matchup: window.Core.elementMatchup(playerCreature.element, enemyCreature.element)
    };
  }

  function createBattle(state) {
    var battle = prepare(state);
    battle.sim = simulate(battle.playerPower, battle.enemyPower, battle.playerCreature, battle.enemyCreature, {
      skillBonus: battle.skillBonus
    });
    return battle;
  }

  function settle(state, battle, sim) {
    var win = sim.win;
    var streakBefore = state.streak;
    var slotsBefore = state.slots;
    var wheelDouble = false;
    var towerInfo = null;

    state.totalBattles += 1;
    window.Core.markSeen(battle.enemyCreature.id);
    window.Core.markSeen(state.formId);

    var slotsReset = false;
    var unequippedCount = 0;

    if (win) {
      state.wins += 1;
      state.streak += 1;
      if (state.streak > state.bestStreak) state.bestStreak = state.streak;
      if (state.slots > C.startSlots) {
        slotsReset = true;
        for (var i = C.startSlots; i < state.equipment.length; i += 1) {
          if (state.equipment[i]) unequippedCount += 1;
        }
        state.slots = C.startSlots;
        state.equipment = state.equipment.slice(0, C.startSlots);
      }
    } else {
      state.losses += 1;
      state.streak = 0;
      if (state.slots < C.maxSlots) {
        state.slots += 1;
        state.equipment.push(null);
      }
    }

    if (state.buffs.double && win) {
      wheelDouble = true;
      state.buffs.double = false;
    }
    state.buffs.shield = false;
    var battleBuffIds = ['war', 'guard', 'focus'];
    for (var bi = 0; bi < battleBuffIds.length; bi += 1) {
      var bid = battleBuffIds[bi];
      if (state.buffs[bid] > 0) state.buffs[bid] -= 1;
    }

    if (state.towerBattle) {
      var floorBefore = state.tower.floor;
      if (win) {
        state.tower.best = Math.max(state.tower.best, floorBefore);
        if (floorBefore >= D.TOWER.floors) {
          towerInfo = {
            win: true,
            floorBefore: floorBefore,
            floorAfter: floorBefore,
            best: D.TOWER.floors,
            completed: true
          };
          state.tower.active = false;
          state.tower.floor = 1;
        } else {
          towerInfo = {
            win: true,
            floorBefore: floorBefore,
            floorAfter: floorBefore + 1,
            best: state.tower.best,
            completed: false
          };
          state.tower.floor = floorBefore + 1;
          state.tower.active = true;
        }
      } else {
        towerInfo = {
          win: false,
          floorBefore: floorBefore,
          floorAfter: floorBefore,
          best: state.tower.best,
          completed: false,
          end: true
        };
        state.tower.active = false;
        state.tower.floor = 1;
      }
      state.towerBattle = false;
    }

    var transform = null;
    if (win) {
      transform = window.Core.rollTransform(state.formId);
    }

    var result = {
      win: win,
      kind: sim.kind,
      kindLabel: sim.kindLabel,
      upset: sim.upset,
      playerPower: battle.playerPower,
      enemyPower: battle.enemyPower,
      warActive: battle.warActive,
      guardActive: battle.guardActive,
      focusActive: battle.focusActive,
      playerCreatureId: battle.playerCreature.id,
      enemyCreatureId: battle.enemyCreature.id,
      playerElement: battle.playerCreature.element,
      enemyElement: battle.enemyCreature.element,
      playerTier: battle.playerCreature.tier,
      enemyTier: battle.enemyCreature.tier,
      matchup: sim.matchup,
      playerHpRatio: sim.pRatio,
      enemyHpRatio: sim.eRatio,
      wheel: win,
      wheelDouble: wheelDouble,
      tower: towerInfo,
      newFormId: transform ? transform.creature.id : null,
      newFormTier: transform ? transform.tier : null,
      newFormElement: transform ? transform.creature.element : null,
      legendary: !!(transform && transform.legendary),
      mythic: !!(transform && transform.mythic),
      pity: transform ? transform.pity : null,
      slotsBefore: slotsBefore,
      slotsAfter: state.slots,
      slotsReset: slotsReset,
      unequippedCount: unequippedCount,
      streakBefore: streakBefore,
      streak: state.streak,
      totalBattles: state.totalBattles
    };

    state.pendingEnemy = null;
    state.lastResult = result;
    return result;
  }

  function chooseLossForm(state, reroll) {
    var transform = null;
    if (reroll) {
      transform = window.Core.rollTransform(state.formId);
    }
    if (state.lastResult) {
      state.lastResult.lossChoice = reroll ? 'reroll' : 'keep';
      if (transform) {
        state.lastResult.lossTransform = {
          id: transform.creature.id,
          tier: transform.tier,
          element: transform.creature.element,
          legendary: transform.legendary,
          mythic: transform.mythic
        };
      }
    }
    return state.formId;
  }

  window.Battle = {
    simulate: simulate,
    prepare: prepare,
    createBattle: createBattle,
    settle: settle,
    chooseLossForm: chooseLossForm
  };
}());
