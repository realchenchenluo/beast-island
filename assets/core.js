/* 变身岛 - 核心状态、存档与工具模块（v2 大世界版） */
(function () {
  'use strict';

  var D = window.GAME_DATA;
  var C = D.CONFIG;
  var W = D.WORLD;

  var state = null;
  var saveTimer = null;
  var storageAllowed = false;
  var storageChecked = false;
  var storageReadFailed = false;

  function getMiniTool() {
    return window.xhs && window.xhs.miniTool ? window.xhs.miniTool : null;
  }

  function getBuildVersionSync() {
    var xhs = window.xhs;
    var env = xhs && xhs.launchOptions ? xhs.launchOptions.miniToolEnv : null;
    return Number(env && env.buildVersion) || 0;
  }

  function clientVersion(buildVersion) {
    return Math.floor((Number(buildVersion) || 0) / 1000);
  }

  function resolveBuildVersion() {
    var sync = getBuildVersionSync();
    if (sync) return Promise.resolve(sync);
    var mt = getMiniTool();
    if (!mt || typeof mt.getLaunchOptions !== 'function') return Promise.resolve(0);
    try {
      return mt.getLaunchOptions().then(function (options) {
        var env = options && options.miniToolEnv;
        return Number(env && env.buildVersion) || 0;
      }).catch(function () {
        return 0;
      });
    } catch (error) {
      return Promise.resolve(0);
    }
  }

  function checkStorageSupport() {
    if (storageChecked) return Promise.resolve(storageAllowed);
    storageChecked = true;
    return resolveBuildVersion().then(function (buildVersion) {
      var mt = getMiniTool();
      var hasApi = !!(mt && typeof mt.setStorage === 'function' && typeof mt.getStorage === 'function');
      var versionOk = buildVersion > 0 ? clientVersion(buildVersion) >= 9460 : true;
      storageAllowed = hasApi && versionOk;
      return storageAllowed;
    });
  }

  function num(value, fallback, min, max) {
    var n = Number(value);
    if (!isFinite(n)) n = fallback;
    n = Math.round(n);
    if (typeof min === 'number' && n < min) n = min;
    if (typeof max === 'number' && n > max) n = max;
    return n;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function numFloat(value, fallback, min, max) {
    var n = Number(value);
    if (!isFinite(n)) n = fallback;
    if (typeof min === 'number' && n < min) n = min;
    if (typeof max === 'number' && n > max) n = max;
    return n;
  }

  function findById(list, id) {
    for (var i = 0; i < list.length; i += 1) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function findCreature(id) { return findById(D.CREATURES, id); }
  function findItem(id) { return findById(D.ITEMS, id); }
  function findDeco(id) { return findById(D.DECORATIONS, id); }
  function findCrop(id) { return findById(D.CROPS, id); }
  function findCard(id) { return findById(D.CARDS, id); }
  function findShopGood(id) { return findById(D.SHOP, id); }
  function findElement(id) { return D.ELEMENTS[id] || D.ELEMENTS.land; }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function newPlot() {
    return { cropId: null, watered: false, plantedAt: 0, fertilized: false };
  }

  function emptyCollectionEntry() {
    return { seen: false, owned: 0, lastAt: 0 };
  }

  function createDefaultState() {
    var worldDecos = [];
    var plots = [];
    var equipment = [];
    var collection = {};
    var i;
    for (i = 0; i < C.plotCount; i += 1) plots.push(newPlot());
    for (i = 0; i < C.startSlots; i += 1) equipment.push(null);
    for (i = 0; i < D.CREATURES.length; i += 1) collection[D.CREATURES[i].id] = emptyCollectionEntry();
    collection[C.startForm] = { seen: true, owned: 1, lastAt: Date.now() };
    var cards = {};
    for (i = 0; i < D.CARDS.length; i += 1) cards[D.CARDS[i].id] = 0;
    cards.refresh = 1;
    return {
      version: C.version,
      coins: C.startCoins,
      seeds: C.startSeeds,
      water: C.startWater,
      fert: C.startFert,
      formId: C.startForm,
      wins: 0,
      losses: 0,
      streak: 0,
      bestStreak: 0,
      slots: C.startSlots,
      boost: 0,
      equipment: equipment,
      items: [],
      cards: cards,
      guideSeen: false,
      decoBag: { palm: 1, flowers: 1 },
      worldDecos: worldDecos,
      plots: plots,
      buffs: { shield: false, double: false },
      collection: collection,
      transformLog: [],
      luck: 0,
      mythicLuck: 0,
      playerPos: { x: W.spawn.x, y: W.spawn.y },
      pendingEnemy: null,
      lastResult: null,
      totalBattles: 0,
      tower: { active: false, floor: 1, best: 0 },
      towerBattle: false,
      uidSeq: 0,
      createdAt: Date.now()
    };
  }

  function normalizeCollection(raw, formId) {
    var collection = {};
    var i;
    for (i = 0; i < D.CREATURES.length; i += 1) {
      var id = D.CREATURES[i].id;
      var value = raw && raw.collection ? raw.collection[id] : null;
      if (value === true) {
        collection[id] = { seen: true, owned: 0, lastAt: 0 };
      } else if (value && typeof value === 'object') {
        var owned = num(value.owned, 0, 0, 999999);
        collection[id] = {
          seen: !!value.seen || owned > 0,
          owned: owned,
          lastAt: num(value.lastAt, 0, 0, Date.now() + 86400000)
        };
      } else {
        collection[id] = emptyCollectionEntry();
      }
    }
    if (collection[formId]) {
      collection[formId].seen = true;
      if (collection[formId].owned < 1) collection[formId].owned = 1;
    }
    return collection;
  }

  function normalizeWorldDecos(raw) {
    var list = [];
    var used = {};
    var source = null;
    if (Array.isArray(raw.worldDecos)) {
      source = raw.worldDecos;
    } else if (Array.isArray(raw.decoPlaced)) {
      source = [];
      for (var i = 0; i < raw.decoPlaced.length; i += 1) {
        var legacyId = raw.decoPlaced[i];
        if (!legacyId) continue;
        var pos = W.migrateDecoPositions[i] || W.migrateDecoPositions[0];
        source.push({ x: pos.x, y: pos.y, id: legacyId });
      }
    }
    if (!source) return list;
    for (var k = 0; k < source.length && list.length < C.maxWorldDecos; k += 1) {
      var item = source[k];
      if (!item || !findDeco(item.id)) continue;
      var rawX = Number(item.x);
      var rawY = Number(item.y);
      if (!isFinite(rawX) || !isFinite(rawY)) continue;
      var x = Math.round(rawX);
      var y = Math.round(rawY);
      if (x < 0 || x >= W.cols || y < 0 || y >= W.rows) continue;
      var key = x + ',' + y;
      if (used[key]) continue;
      used[key] = true;
      list.push({ x: x, y: y, id: item.id });
    }
    return list;
  }

  function normalize(raw) {
    var def = createDefaultState();
    if (!raw || typeof raw !== 'object') return def;
    var s = def;
    var i;

    s.coins = num(raw.coins, def.coins, 0, 99999999);
    s.seeds = num(raw.seeds, def.seeds, 0, 999999);
    s.water = num(raw.water, def.water, 0, 999999);
    s.fert = num(raw.fert, def.fert, 0, 999999);
    s.wins = num(raw.wins, 0, 0, 9999999);
    s.losses = num(raw.losses, 0, 0, 9999999);
    s.streak = num(raw.streak, 0, 0, 9999999);
    s.bestStreak = Math.max(num(raw.bestStreak, 0, 0, 9999999), s.streak);
    s.slots = clamp(num(raw.slots, C.startSlots, C.startSlots, C.maxSlots), C.startSlots, C.maxSlots);
    s.boost = num(raw.boost, 0, 0, 99999);
    s.totalBattles = num(raw.totalBattles, 0, 0, 9999999);
    s.guideSeen = !!raw.guideSeen;
    s.tower = {
      active: !!(raw.tower && raw.tower.active),
      floor: clamp(num(raw.tower && raw.tower.floor, 1, 1, D.TOWER.floors), 1, D.TOWER.floors),
      best: num(raw.tower && raw.tower.best, 0, 0, D.TOWER.floors)
    };
    s.towerBattle = false;
    s.uidSeq = num(raw.uidSeq, 0, 0, 999999999);
    s.createdAt = num(raw.createdAt, Date.now(), 0, Date.now() + 86400000);
    if (findCreature(raw.formId)) s.formId = raw.formId;

    s.items = [];
    var usedUids = {};
    if (Array.isArray(raw.items)) {
      for (i = 0; i < raw.items.length; i += 1) {
        var rawItem = raw.items[i];
        if (!rawItem || !findItem(rawItem.id)) continue;
        var uid = rawItem.uid ? String(rawItem.uid) : '';
        if (!uid || usedUids[uid]) {
          s.uidSeq += 1;
          uid = 'i' + s.uidSeq;
        }
        usedUids[uid] = true;
        s.items.push({ uid: uid, id: rawItem.id });
        var uidNum = parseInt(String(uid).replace(/[^0-9]/g, ''), 10);
        if (isFinite(uidNum) && uidNum > s.uidSeq) s.uidSeq = uidNum;
      }
    }

    function itemUidExists(uid) {
      for (var k = 0; k < s.items.length; k += 1) {
        if (s.items[k].uid === uid) return true;
      }
      return false;
    }

    s.equipment = [];
    for (i = 0; i < s.slots; i += 1) s.equipment.push(null);
    var equipped = {};
    if (Array.isArray(raw.equipment)) {
      for (i = 0; i < Math.min(raw.equipment.length, s.slots); i += 1) {
        var eqUid = raw.equipment[i];
        if (typeof eqUid === 'string' && itemUidExists(eqUid) && !equipped[eqUid]) {
          s.equipment[i] = eqUid;
          equipped[eqUid] = true;
        }
      }
    }

    s.cards = {};
    for (i = 0; i < D.CARDS.length; i += 1) {
      var cardId = D.CARDS[i].id;
      s.cards[cardId] = num(raw.cards && raw.cards[cardId], 0, 0, 9999);
    }
    if (!raw.cards) s.cards.refresh = 1;

    s.decoBag = {};
    if (raw.decoBag && typeof raw.decoBag === 'object') {
      for (i = 0; i < D.DECORATIONS.length; i += 1) {
        var decoId = D.DECORATIONS[i].id;
        var count = num(raw.decoBag[decoId], 0, 0, 9999);
        if (count > 0) s.decoBag[decoId] = count;
      }
    } else {
      s.decoBag = { palm: 1, flowers: 1 };
    }

    s.worldDecos = normalizeWorldDecos(raw);

    s.plots = [];
    for (i = 0; i < C.plotCount; i += 1) {
      var p = raw.plots && raw.plots[i];
      s.plots.push({
        cropId: p && findCrop(p.cropId) ? p.cropId : null,
        watered: !!(p && p.watered),
        plantedAt: p ? num(p.plantedAt, 0, 0, Date.now() + 86400000) : 0,
        fertilized: !!(p && p.fertilized)
      });
    }

    s.buffs = {
      shield: !!(raw.buffs && raw.buffs.shield),
      double: !!(raw.buffs && raw.buffs.double)
    };

    s.collection = normalizeCollection(raw, s.formId);

    s.transformLog = [];
    if (Array.isArray(raw.transformLog)) {
      for (i = 0; i < raw.transformLog.length && s.transformLog.length < 30; i += 1) {
        var log = raw.transformLog[i];
        if (log && findCreature(log.id)) {
          s.transformLog.push({
            id: log.id,
            tier: num(log.tier, 1, 1, 5),
            at: num(log.at, 0, 0, Date.now() + 86400000)
          });
        }
      }
    }

    s.luck = num(raw.luck, 0, 0, 999999);
    s.mythicLuck = num(raw.mythicLuck, 0, 0, 999999);

    s.playerPos = {
      x: numFloat(raw.playerPos && raw.playerPos.x, W.spawn.x, 0.5, W.cols - 0.5),
      y: numFloat(raw.playerPos && raw.playerPos.y, W.spawn.y, 0.5, W.rows - 0.5)
    };

    s.pendingEnemy = null;
    if (raw.pendingEnemy && findCreature(raw.pendingEnemy.creatureId)) {
      s.pendingEnemy = {
        creatureId: raw.pendingEnemy.creatureId,
        power: num(raw.pendingEnemy.power, 100, 40, 99999)
      };
      if (s.collection[s.pendingEnemy.creatureId]) {
        s.collection[s.pendingEnemy.creatureId].seen = true;
      }
    }

    s.lastResult = raw.lastResult && typeof raw.lastResult === 'object' ? raw.lastResult : null;
    return s;
  }

  function getState() { return state; }

  function getItemByUid(uid) {
    for (var i = 0; i < state.items.length; i += 1) {
      if (state.items[i].uid === uid) return state.items[i];
    }
    return null;
  }

  function getEquipPower() {
    var total = 0;
    for (var i = 0; i < state.equipment.length; i += 1) {
      var uid = state.equipment[i];
      if (!uid) continue;
      var inv = getItemByUid(uid);
      var item = inv ? findItem(inv.id) : null;
      if (item) total += item.power;
    }
    return total;
  }

  function getDecoPower() {
    var total = 0;
    for (var i = 0; i < state.worldDecos.length; i += 1) {
      var deco = findDeco(state.worldDecos[i].id);
      if (deco) total += deco.power;
    }
    return total;
  }

  function getPower() {
    var creature = findCreature(state.formId) || D.CREATURES[0];
    return creature.power + getEquipPower() + getDecoPower() + state.boost;
  }

  function getDay() {
    var diff = Date.now() - state.createdAt;
    if (diff < 0) diff = 0;
    return Math.floor(diff / 86400000) + 1;
  }

  function getDecoBagCount() {
    var total = 0;
    for (var id in state.decoBag) {
      if (Object.prototype.hasOwnProperty.call(state.decoBag, id)) {
        total += state.decoBag[id];
      }
    }
    return total;
  }

  function getWorldDecoCount() {
    return state.worldDecos.length;
  }

  function getDecoAt(x, y) {
    for (var i = 0; i < state.worldDecos.length; i += 1) {
      if (state.worldDecos[i].x === x && state.worldDecos[i].y === y) return state.worldDecos[i];
    }
    return null;
  }

  function placeDecoAt(id, x, y) {
    if (!findDeco(id)) return false;
    if ((state.decoBag[id] || 0) <= 0) return false;
    if (state.worldDecos.length >= C.maxWorldDecos) return false;
    if (getDecoAt(x, y)) return false;
    state.decoBag[id] -= 1;
    if (state.decoBag[id] <= 0) delete state.decoBag[id];
    state.worldDecos.push({ x: x, y: y, id: id });
    return true;
  }

  function removeDecoAt(x, y) {
    for (var i = 0; i < state.worldDecos.length; i += 1) {
      if (state.worldDecos[i].x === x && state.worldDecos[i].y === y) {
        var deco = state.worldDecos[i];
        state.worldDecos.splice(i, 1);
        state.decoBag[deco.id] = (state.decoBag[deco.id] || 0) + 1;
        return deco.id;
      }
    }
    return null;
  }

  function getSlotsInfo() {
    return {
      base: C.startSlots,
      total: state.slots,
      temporary: Math.max(0, state.slots - C.startSlots)
    };
  }

  function elementMultiplier(attacker, defender) {
    var a = D.ELEMENTS[attacker];
    var b = D.ELEMENTS[defender];
    if (!a || !b || !a.counters || !b.counters) return C.elementMultiplier.neutral;
    if (a.counters === defender) return C.elementMultiplier.counter;
    if (b.counters === attacker) return C.elementMultiplier.countered;
    return C.elementMultiplier.neutral;
  }

  function elementMatchup(playerElement, enemyElement) {
    var playerMult = elementMultiplier(playerElement, enemyElement);
    var enemyMult = elementMultiplier(enemyElement, playerElement);
    return {
      playerElement: playerElement,
      enemyElement: enemyElement,
      playerMult: playerMult,
      enemyMult: enemyMult,
      playerAdvantage: playerMult > 1,
      enemyAdvantage: enemyMult > 1,
      neutral: playerMult === 1 && enemyMult === 1
    };
  }

  function recordCollection(id, owned) {
    if (!state.collection[id]) state.collection[id] = emptyCollectionEntry();
    state.collection[id].seen = true;
    if (owned) {
      state.collection[id].owned += 1;
      state.collection[id].lastAt = Date.now();
    }
  }

  function markSeen(id) {
    if (!findCreature(id)) return;
    recordCollection(id, false);
  }

  function rollTier() {
    var luck = state.luck || 0;
    var mythicLuck = state.mythicLuck || 0;
    if (mythicLuck >= C.pity.mythic) return { tier: 5, pity: 'mythic' };
    if (luck >= C.pity.legendary) return { tier: 4, pity: 'legendary' };
    var total = 0;
    var entries = [];
    var i;
    for (i = 0; i < D.RARITY_WEIGHTS.length; i += 1) {
      var entry = D.RARITY_WEIGHTS[i];
      var weight = entry.weight;
      if (entry.tier === 4 && luck > 100) {
        weight *= 1 + Math.min(2, (luck - 100) / 100);
      }
      if (entry.tier === 5 && mythicLuck > 500) {
        weight *= 1 + Math.min(2, (mythicLuck - 500) / 500);
      }
      entries.push({ tier: entry.tier, weight: weight });
      total += weight;
    }
    var roll = Math.random() * total;
    for (i = 0; i < entries.length; i += 1) {
      roll -= entries[i].weight;
      if (roll <= 0) return { tier: entries[i].tier, pity: null };
    }
    return { tier: 1, pity: null };
  }

  function pickCreatureOfTier(tier, excludeId) {
    var pool = [];
    var fallback = [];
    for (var i = 0; i < D.CREATURES.length; i += 1) {
      var c = D.CREATURES[i];
      if (c.id !== excludeId) fallback.push(c);
      if (c.tier === tier && c.id !== excludeId) pool.push(c);
    }
    if (pool.length) return pick(pool);
    if (fallback.length) return pick(fallback);
    return D.CREATURES[0];
  }

  function rollTransform(excludeId) {
    var before = excludeId || state.formId;
    var tierRoll = rollTier();
    var creature = pickCreatureOfTier(tierRoll.tier, before);
    var tier = creature.tier;

    if (tier >= 4) state.luck = 0;
    else state.luck = Math.min(999999, (state.luck || 0) + 1);
    if (tier === 5) state.mythicLuck = 0;
    else state.mythicLuck = Math.min(999999, (state.mythicLuck || 0) + 1);

    state.formId = creature.id;
    recordCollection(creature.id, true);
    state.transformLog.unshift({ id: creature.id, tier: tier, at: Date.now() });
    if (state.transformLog.length > 30) state.transformLog.length = 30;

    return {
      creature: creature,
      tier: tier,
      pity: tierRoll.pity,
      legendary: tier >= 4,
      mythic: tier === 5
    };
  }

  function randomCreature(excludeId) {
    var pool = [];
    for (var i = 0; i < D.CREATURES.length; i += 1) {
      if (D.CREATURES[i].id !== excludeId) pool.push(D.CREATURES[i]);
    }
    if (!pool.length) pool = D.CREATURES.slice();
    return pick(pool);
  }

  function pickEnemyCreature(enemyPower, excludeId) {
    var candidates = [];
    var fallback = [];
    var i;
    for (i = 0; i < D.CREATURES.length; i += 1) {
      var c = D.CREATURES[i];
      if (excludeId && c.id === excludeId) continue;
      fallback.push(c);
      if (c.power >= enemyPower * 0.55 && c.power <= enemyPower * 1.65) candidates.push(c);
    }
    if (!candidates.length) {
      fallback.sort(function (a, b) {
        return Math.abs(a.power - enemyPower) - Math.abs(b.power - enemyPower);
      });
      candidates = fallback.slice(0, 5);
    }
    var weights = {};
    for (i = 0; i < D.RARITY_WEIGHTS.length; i += 1) {
      var tier = D.RARITY_WEIGHTS[i].tier;
      weights[tier] = tier === 5 ? 0.01 : (tier === 4 ? 0.5 : D.RARITY_WEIGHTS[i].weight);
    }
    var total = 0;
    for (i = 0; i < candidates.length; i += 1) total += weights[candidates[i].tier] || 1;
    var roll = Math.random() * total;
    for (i = 0; i < candidates.length; i += 1) {
      roll -= weights[candidates[i].tier] || 1;
      if (roll <= 0) return candidates[i];
    }
    return candidates[0];
  }

  function makeEnemy() {
    var playerPower = getPower();
    var factor = 0.68 + Math.random() * 0.52;
    factor += Math.min(0.24, state.streak * 0.045);
    factor -= Math.min(0.1, state.losses * 0.012);
    if (state.streak >= 3) factor += 0.06;
    factor = clamp(factor, 0.56, 1.46);
    var power = Math.max(60, Math.round(playerPower * factor / 5) * 5);
    var creature = pickEnemyCreature(power, state.formId);
    markSeen(creature.id);
    return { creatureId: creature.id, power: power };
  }

  function rollItemByRarity() {
    var r = Math.random() * 100;
    var rarity;
    if (r < 52) rarity = 1;
    else if (r < 82) rarity = 2;
    else if (r < 96) rarity = 3;
    else rarity = 4;
    var pool = [];
    var i;
    for (i = 0; i < D.ITEMS.length; i += 1) {
      if (D.ITEMS[i].rarity === rarity) pool.push(D.ITEMS[i]);
    }
    if (!pool.length) {
      for (i = 0; i < D.ITEMS.length; i += 1) pool.push(D.ITEMS[i]);
    }
    return pick(pool);
  }

  function rollDeco() {
    var total = 0;
    var i;
    for (i = 0; i < D.DECORATIONS.length; i += 1) total += D.DECORATIONS[i].weight || 1;
    var r = Math.random() * total;
    for (i = 0; i < D.DECORATIONS.length; i += 1) {
      r -= D.DECORATIONS[i].weight || 1;
      if (r <= 0) return D.DECORATIONS[i];
    }
    return D.DECORATIONS[0];
  }

  function addItem(itemId) {
    if (!findItem(itemId)) return null;
    state.uidSeq += 1;
    var uid = 'i' + state.uidSeq;
    state.items.push({ uid: uid, id: itemId });
    return uid;
  }

  function addDeco(decoId, count) {
    if (!findDeco(decoId)) return false;
    var n = count || 1;
    state.decoBag[decoId] = (state.decoBag[decoId] || 0) + n;
    return true;
  }

  function addCard(cardId, count) {
    if (!findCard(cardId)) return false;
    var n = count || 1;
    state.cards[cardId] = (state.cards[cardId] || 0) + n;
    return true;
  }

  function removeCard(cardId, count) {
    var n = count || 1;
    if ((state.cards[cardId] || 0) < n) return false;
    state.cards[cardId] -= n;
    return true;
  }

  function equipItem(uid) {
    var inv = getItemByUid(uid);
    if (!inv) return -1;
    for (var i = 0; i < state.equipment.length; i += 1) {
      if (state.equipment[i] === uid) return -1;
    }
    for (var j = 0; j < state.equipment.length; j += 1) {
      if (!state.equipment[j]) {
        state.equipment[j] = uid;
        return j;
      }
    }
    return -1;
  }

  function unequipSlot(index) {
    if (index < 0 || index >= state.equipment.length) return null;
    var uid = state.equipment[index];
    state.equipment[index] = null;
    return uid;
  }

  function getUnequippedItems() {
    var equipped = {};
    var i;
    for (i = 0; i < state.equipment.length; i += 1) {
      if (state.equipment[i]) equipped[state.equipment[i]] = true;
    }
    var list = [];
    for (i = 0; i < state.items.length; i += 1) {
      if (!equipped[state.items[i].uid]) list.push(state.items[i]);
    }
    return list;
  }

  function getCollectionStats() {
    var stats = {
      total: D.CREATURES.length,
      seen: 0,
      owned: 0,
      byTier: {}
    };
    for (var t = 1; t <= 5; t += 1) {
      stats.byTier[t] = { total: 0, seen: 0, owned: 0 };
    }
    for (var i = 0; i < D.CREATURES.length; i += 1) {
      var c = D.CREATURES[i];
      var entry = state.collection[c.id] || emptyCollectionEntry();
      var tier = stats.byTier[c.tier];
      tier.total += 1;
      if (entry.seen) { stats.seen += 1; tier.seen += 1; }
      if (entry.owned > 0) { stats.owned += 1; tier.owned += 1; }
    }
    return stats;
  }

  function getPityInfo() {
    return {
      luck: state.luck || 0,
      mythicLuck: state.mythicLuck || 0,
      legendaryIn: Math.max(0, C.pity.legendary - (state.luck || 0)),
      mythicIn: Math.max(0, C.pity.mythic - (state.mythicLuck || 0))
    };
  }

  function makeTowerEnemy() {
    var floor = state.tower.floor;
    var playerPower = getPower();
    var factor = Math.min(D.TOWER.max, D.TOWER.base + floor * D.TOWER.perFloor);
    var power = Math.max(60, Math.round(playerPower * factor / 5) * 5);
    var creature = pickEnemyCreature(power, state.formId);
    markSeen(creature.id);
    return { creatureId: creature.id, power: power, tower: floor };
  }

  function startTower() {
    state.tower.active = true;
    state.tower.floor = 1;
    state.towerBattle = true;
    state.pendingEnemy = makeTowerEnemy();
    saveState();
    return state.tower;
  }

  function nextTowerFloor() {
    if (!state.tower.active) return null;
    state.towerBattle = true;
    state.pendingEnemy = makeTowerEnemy();
    saveState();
    return state.tower;
  }

  function endTower() {
    state.tower.active = false;
    state.tower.floor = 1;
    state.towerBattle = false;
    state.pendingEnemy = null;
    saveState();
  }

  function rollWheel() {
    var total = 0;
    var i;
    for (i = 0; i < D.WHEEL.length; i += 1) total += D.WHEEL[i].weight;
    var r = Math.random() * total;
    for (i = 0; i < D.WHEEL.length; i += 1) {
      r -= D.WHEEL[i].weight;
      if (r <= 0) return { index: i, segment: D.WHEEL[i] };
    }
    return { index: 0, segment: D.WHEEL[0] };
  }

  function applyWheel(segment, double) {
    var out = { label: segment.label, type: segment.type, amount: 0, name: '', rarity: 0, detail: '' };
    if (segment.type === 'nothing') {
      out.detail = '谢谢参与，下次再来';
      return out;
    }
    if (segment.type === 'coins' || segment.type === 'seeds' || segment.type === 'water') {
      var amount = segment.amount * (double ? 2 : 1);
      state[segment.type] += amount;
      out.amount = amount;
      out.detail = segment.label + ' +' + amount + (double ? '（双倍卡）' : '');
    } else if (segment.type === 'item') {
      var item = rollItemByRarity();
      addItem(item.id);
      out.name = item.name;
      out.rarity = item.rarity;
      out.detail = '装备：' + item.name + '（' + C.tierNames[item.rarity] + '）';
    } else if (segment.type === 'deco') {
      var deco = rollDeco();
      addDeco(deco.id, 1);
      out.name = deco.name;
      out.rarity = deco.rarity;
      out.detail = '装饰：' + deco.name + '（Lv.' + deco.rarity + ' ' + C.tierNames[deco.rarity] + '）';
    } else if (segment.type === 'card') {
      var card = pick(D.CARDS);
      addCard(card.id, 1);
      out.name = card.name;
      out.detail = '道具卡：' + card.name;
    }
    saveState();
    return out;
  }

  function applyRewards(rewards) {
    state.coins += rewards.coins || 0;
    state.seeds += rewards.seeds || 0;
    state.water += rewards.water || 0;
  }

  function loadState() {
    return checkStorageSupport().then(function (allowed) {
      if (!allowed) {
        state = createDefaultState();
        storageReadFailed = false;
        return state;
      }
      var mt = getMiniTool();
      return mt.getStorage({ key: C.saveKey }).then(function (result) {
        var text = result && result.data;
        if (!text) {
          state = createDefaultState();
          return state;
        }
        try {
          state = normalize(JSON.parse(text));
        } catch (error) {
          state = createDefaultState();
          storageReadFailed = true;
        }
        return state;
      }).catch(function () {
        state = createDefaultState();
        storageReadFailed = true;
        return state;
      });
    });
  }

  function saveNow() {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    if (!state || !storageAllowed) return Promise.resolve(false);
    var mt = getMiniTool();
    if (!mt || typeof mt.setStorage !== 'function') return Promise.resolve(false);
    var text;
    try {
      text = JSON.stringify(state);
    } catch (error) {
      return Promise.resolve(false);
    }
    if (text.length > 900000) {
      state.transformLog = state.transformLog.slice(0, 10);
      state.worldDecos = state.worldDecos.slice(0, 40);
      try {
        text = JSON.stringify(state);
      } catch (error2) {
        return Promise.resolve(false);
      }
    }
    try {
      return Promise.resolve(mt.setStorage({ key: C.saveKey, data: text })).then(function (result) {
        return !!result && result.errMsg === 'setStorage:ok';
      }).catch(function () {
        return false;
      });
    } catch (error) {
      return Promise.resolve(false);
    }
  }

  function saveState() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      saveTimer = null;
      saveNow();
    }, 260);
  }

  function resetState() {
    state = createDefaultState();
    saveState();
    return state;
  }

  function isStorageAvailable() { return storageAllowed; }
  function didStorageReadFail() { return storageReadFailed; }

  function initViewport() {
    var root = document.documentElement;
    function applyHeight(height) {
      var h = Number(height);
      if (isFinite(h) && h > 120) {
        root.style.setProperty('--app-height', Math.round(h) + 'px');
      }
    }
    function fallback() {
      applyHeight(window.innerHeight);
    }
    var mt = getMiniTool();
    if (mt && typeof mt.getWindowInfo === 'function') {
      try {
        var result = mt.getWindowInfo();
        if (result && typeof result.then === 'function') {
          result.then(function (info) {
            if (info && info.windowHeight) applyHeight(info.windowHeight);
            else fallback();
          }).catch(fallback);
        } else {
          fallback();
        }
      } catch (error) {
        fallback();
      }
    } else {
      fallback();
    }
    var resizeTimer = null;
    function onResize() {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(fallback, 120);
    }
    window.addEventListener('resize', onResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', onResize);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) saveNow();
    });
  }

  function haptic(type) {
    var mt = getMiniTool();
    if (!mt || typeof mt.vibrateShort !== 'function') return;
    try {
      var result = mt.vibrateShort({ type: type || 'light' });
      if (result && typeof result.catch === 'function') result.catch(function () {});
    } catch (error) {
      /* 振动是增强反馈，失败静默降级 */
    }
  }

  window.Core = {
    getState: getState,
    loadState: loadState,
    saveState: saveState,
    saveNow: saveNow,
    resetState: resetState,
    initViewport: initViewport,
    haptic: haptic,
    isStorageAvailable: isStorageAvailable,
    didStorageReadFail: didStorageReadFail,
    findCreature: findCreature,
    findItem: findItem,
    findDeco: findDeco,
    findCrop: findCrop,
    findCard: findCard,
    findShopGood: findShopGood,
    findElement: findElement,
    getItemByUid: getItemByUid,
    getEquipPower: getEquipPower,
    getDecoPower: getDecoPower,
    getPower: getPower,
    getDay: getDay,
    getDecoBagCount: getDecoBagCount,
    getWorldDecoCount: getWorldDecoCount,
    getDecoAt: getDecoAt,
    placeDecoAt: placeDecoAt,
    removeDecoAt: removeDecoAt,
    getSlotsInfo: getSlotsInfo,
    elementMultiplier: elementMultiplier,
    elementMatchup: elementMatchup,
    rollTier: rollTier,
    rollTransform: rollTransform,
    randomCreature: randomCreature,
    makeEnemy: makeEnemy,
    markSeen: markSeen,
    rollItemByRarity: rollItemByRarity,
    rollDeco: rollDeco,
    addItem: addItem,
    addDeco: addDeco,
    addCard: addCard,
    removeCard: removeCard,
    equipItem: equipItem,
    unequipSlot: unequipSlot,
    getUnequippedItems: getUnequippedItems,
    getCollectionStats: getCollectionStats,
    getPityInfo: getPityInfo,
    applyRewards: applyRewards,
    makeTowerEnemy: makeTowerEnemy,
    startTower: startTower,
    nextTowerFloor: nextTowerFloor,
    endTower: endTower,
    rollWheel: rollWheel,
    applyWheel: applyWheel,
    clamp: clamp,
    num: num
  };
}());
