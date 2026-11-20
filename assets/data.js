/* 变身岛 - 静态数据配置（v2 大世界版） */
(function () {
  'use strict';

  var CREATURES = [
    /* ---------- 普通 ---------- */
    { id: 'rabbit', name: '兔子', power: 110, tier: 1, element: 'land', skill: '疾风连踢', desc: '耳朵长，脾气短。后腿一蹬，能踢出残影。' },
    { id: 'pig', name: '小猪', power: 125, tier: 1, element: 'land', skill: '泥地冲撞', desc: '看起来人畜无害，冲撞起来六亲不认。' },
    { id: 'sheep', name: '绵羊', power: 140, tier: 1, element: 'land', skill: '羊毛旋风', desc: '一身卷毛既是铠甲，也是武器。' },
    { id: 'goat', name: '山羊', power: 155, tier: 1, element: 'land', skill: '角顶突击', desc: '悬崖上练出来的平衡感，专治各种不服。' },

    /* ---------- 稀有 ---------- */
    { id: 'cow', name: '奶牛', power: 175, tier: 2, element: 'land', skill: '蛮牛践踏', desc: '平时慢悠悠，认真起来整座岛都在抖。' },
    { id: 'fox', name: '狐狸', power: 195, tier: 2, element: 'land', skill: '幻影突袭', desc: '你看到的是尾巴，真正的攻击已经到背后。' },
    { id: 'wolf', name: '狼', power: 215, tier: 2, element: 'land', skill: '裂空撕咬', desc: '月光下的猎手，耐力和咬合力都很可怕。' },
    { id: 'monkey', name: '猴子', power: 185, tier: 2, element: 'land', skill: '灵巧连击', desc: '上蹿下跳，专挑对手的空档下手。' },
    { id: 'turtle', name: '海龟', power: 205, tier: 2, element: 'water', skill: '龟甲重撞', desc: '慢是慢了点，但壳是真的硬。' },
    { id: 'eagle', name: '鹰', power: 225, tier: 2, element: 'sky', skill: '高空俯冲', desc: '从云层里落下来的时候，猎物已经输了。' },
    { id: 'hedgehog', name: '小刺猬', power: 190, tier: 2, element: 'land', skill: '尖刺滚球', desc: '看着圆滚滚，滚起来连自己都怕。' },

    /* ---------- 史诗 ---------- */
    { id: 'giraffe', name: '长颈鹿', power: 240, tier: 3, element: 'land', skill: '长颈重锤', desc: '脖子一甩，攻击范围覆盖半个擂台。' },
    { id: 'crocodile', name: '鳄鱼', power: 265, tier: 3, element: 'water', skill: '死亡翻滚', desc: '咬住就不松口，水面下的霸主。' },
    { id: 'panda', name: '熊猫', power: 285, tier: 3, element: 'land', skill: '竹棍横扫', desc: '吃竹子是爱好，抡竹子是专业。' },
    { id: 'bear', name: '棕熊', power: 310, tier: 3, element: 'land', skill: '大地熊掌', desc: '一巴掌下去，擂台都要裂开一条缝。' },
    { id: 'crane', name: '仙鹤', power: 255, tier: 3, element: 'sky', skill: '云间鹤舞', desc: '姿态优雅，落点却准得可怕。' },
    { id: 'peacock', name: '孔雀', power: 245, tier: 3, element: 'sky', skill: '翎羽风暴', desc: '开屏的时候，连风都被切成碎片。' },
    { id: 'octopus', name: '章鱼', power: 275, tier: 3, element: 'water', skill: '墨汁缠绕', desc: '八条触手，八种让你头疼的方式。' },
    { id: 'shark', name: '鲨鱼', power: 315, tier: 3, element: 'water', skill: '血海撕咬', desc: '闻到一点血腥味，就会从深海游来。' },

    /* ---------- 传说 ---------- */
    { id: 'tiger', name: '老虎', power: 340, tier: 4, element: 'land', skill: '猛虎扑杀', desc: '山林之王，扑击快得像一道橙色闪电。' },
    { id: 'lion', name: '狮子', power: 370, tier: 4, element: 'land', skill: '王者咆哮', desc: '鬃毛一抖，气势先赢三分。' },
    { id: 'elephant', name: '大象', power: 400, tier: 4, element: 'land', skill: '象鼻风暴', desc: '体重就是战力，鼻子就是攻城锤。' },
    { id: 'qilin', name: '麒麟', power: 480, tier: 4, element: 'land', skill: '祥瑞天火', desc: '踏火而行，所到之处草木复苏。' },
    { id: 'baize', name: '白泽', power: 520, tier: 4, element: 'spirit', skill: '通晓万物', desc: '知天下万物之名，也能叫出你的弱点。' },
    { id: 'ninefox', name: '九尾狐', power: 500, tier: 4, element: 'spirit', skill: '九尾幻境', desc: '九条尾巴一摆，真假已经分不清了。' },
    { id: 'qiongqi', name: '穷奇', power: 550, tier: 4, element: 'land', skill: '凶翼裂空', desc: '有翼之虎，专吃讲道理的人。' },
    { id: 'white_tiger', name: '白虎', power: 560, tier: 4, element: 'land', skill: '庚金虎啸', desc: '西方之神，一啸之下百兽伏地。' },
    { id: 'xuanwu', name: '玄武', power: 600, tier: 4, element: 'water', skill: '玄冥镇海', desc: '龟蛇盘踞，镇住一方深水。' },
    { id: 'zhuque', name: '朱雀', power: 620, tier: 4, element: 'sky', skill: '南明离火', desc: '南方的火焰之神，羽翼燃着不灭的火。' },

    /* ---------- 神话 ---------- */
    { id: 'qinglong', name: '青龙', power: 650, tier: 5, element: 'sky', skill: '东方苍雷', desc: '东方七宿化作龙形，雷声从云海里滚过。' },
    { id: 'phoenix', name: '凤凰', power: 680, tier: 5, element: 'sky', skill: '涅槃天火', desc: '浴火重生一次，就更强一次。' },
    { id: 'kun', name: '鲲', power: 700, tier: 5, element: 'water', skill: '北冥巨浪', desc: '北冥有鱼，其名为鲲。鲲之大，不知其几千里也。' },
    { id: 'zhulong', name: '烛龙', power: 720, tier: 5, element: 'sky', skill: '烛照九幽', desc: '睁眼为昼，闭眼为夜，呼吸之间四季轮转。' },
    { id: 'yinglong', name: '应龙', power: 750, tier: 5, element: 'sky', skill: '应龙行雨', desc: '有翼之龙，所至之处风雨相随。' }
  ];

  var ELEMENTS = {
    sky: { id: 'sky', name: '天', color: '#4FA8E8', soft: '#E8F3FF', counters: 'land', desc: '天空压制陆地' },
    land: { id: 'land', name: '地', color: '#5FB86F', soft: '#EAF8EC', counters: 'water', desc: '陆地压制海洋' },
    water: { id: 'water', name: '水', color: '#3FA9D6', soft: '#E6F7FD', counters: 'sky', desc: '海洋压制天空' },
    spirit: { id: 'spirit', name: '灵', color: '#8A4F45', soft: '#F5EAFB', counters: null, desc: '灵属性不受克制，也不克制其他属性' }
  };

  var RARITY_WEIGHTS = [
    { tier: 1, weight: 55 },
    { tier: 2, weight: 30 },
    { tier: 3, weight: 14 },
    { tier: 4, weight: 0.8 },
    { tier: 5, weight: 0.02 }
  ];

  var ITEMS = [
    { id: 'wood_sword', name: '木剑', type: 'weapon', power: 8, rarity: 1, desc: '岛上随手削的，胜在趁手。' },
    { id: 'stone_axe', name: '石斧', type: 'weapon', power: 16, rarity: 1, desc: '砍树砍怪两不误。' },
    { id: 'iron_spear', name: '铁枪', type: 'weapon', power: 26, rarity: 2, desc: '一寸长，一寸强。' },
    { id: 'bone_blade', name: '兽骨刃', type: 'weapon', power: 38, rarity: 2, desc: '用巨兽骨头磨成的弯刃。' },
    { id: 'flame_sword', name: '烈焰巨剑', type: 'weapon', power: 55, rarity: 3, desc: '剑身自带余温，握久了会烫手。' },
    { id: 'thunder_hammer', name: '雷鸣战锤', type: 'weapon', power: 72, rarity: 4, desc: '挥动时能听见远处的雷声。' },
    { id: 'vine_armor', name: '藤甲', type: 'armor', power: 10, rarity: 1, desc: '轻便透气，就是怕火。' },
    { id: 'leather_armor', name: '皮甲', type: 'armor', power: 18, rarity: 1, desc: '岛上猎手的标准装备。' },
    { id: 'iron_armor', name: '铁甲', type: 'armor', power: 30, rarity: 2, desc: '沉是沉了点，但真抗揍。' },
    { id: 'scale_armor', name: '龙鳞甲', type: 'armor', power: 48, rarity: 3, desc: '鳞片在阳光下泛着七彩的光。' },
    { id: 'star_robe', name: '星辉战袍', type: 'armor', power: 65, rarity: 4, desc: '夜里会自己发光，像披着一片星空。' },
    { id: 'lucky_charm', name: '幸运符', type: 'accessory', power: 6, rarity: 1, desc: '心理作用也是作用。' },
    { id: 'power_bracer', name: '力量护腕', type: 'accessory', power: 14, rarity: 1, desc: '戴上之后搬石头都轻了。' },
    { id: 'wind_boots', name: '疾风靴', type: 'accessory', power: 22, rarity: 2, desc: '跑起来脚底生风。' },
    { id: 'king_crown', name: '王者之冠', type: 'accessory', power: 36, rarity: 3, desc: '戴上它，连走路都带背景音乐。' },
    { id: 'moon_amulet', name: '月光护符', type: 'accessory', power: 50, rarity: 4, desc: '月圆之夜会微微发烫。' }
  ];

  var CARDS = [
    { id: 'refresh', name: '刷新卡', icon: 'refresh', color: '#4FA8E8', desc: '重新随机一次当前变身，战力也会跟着改变。' },
    { id: 'boost', name: '强化卡', icon: 'boost', color: '#6A5478', desc: '永久提升 15 点战力，变身之后依然保留。' },
    { id: 'shield', name: '护盾卡', icon: 'shield', color: '#4F7A58', desc: '下一场战斗中，对手战力降低 15%。' },
    { id: 'double', name: '双倍卡', icon: 'double', color: '#8A4F45', desc: '下一场战斗获胜时，金币、种子和清水翻倍。' }
  ];

  var DECORATIONS = [
    { id: 'palm', name: '椰子树', power: 4, rarity: 1, weight: 18, desc: '海风一吹，叶子沙沙响。' },
    { id: 'flowers', name: '花丛', power: 3, rarity: 1, weight: 18, desc: '几朵不知名的小花，颜色很热闹。' },
    { id: 'fence', name: '木栅栏', power: 2, rarity: 1, weight: 16, desc: '拦住乱跑的鸡，也拦住烦恼。' },
    { id: 'coral', name: '珊瑚摆件', power: 4, rarity: 1, weight: 12, desc: '从浅海捡回来的，还带着海味。' },
    { id: 'lantern', name: '石灯笼', power: 5, rarity: 2, weight: 10, desc: '夜里会亮，蚊子绕着飞。' },
    { id: 'swing', name: '秋千', power: 5, rarity: 2, weight: 8, desc: '战斗回来荡两下，什么气都消了。' },
    { id: 'campfire', name: '篝火', power: 6, rarity: 2, weight: 8, desc: '烤鱼、取暖、发呆，三合一。' },
    { id: 'scarecrow', name: '稻草人', power: 6, rarity: 2, weight: 7, desc: '表情很凶，其实胆子最小。' },
    { id: 'hut', name: '小木屋', power: 7, rarity: 3, weight: 6, desc: '一张床，一盏灯，刚刚好。' },
    { id: 'windmill', name: '小风车', power: 9, rarity: 3, weight: 5, desc: '转啊转，把云都搅散了。' },
    { id: 'fountain', name: '贝壳喷泉', power: 8, rarity: 3, weight: 4, desc: '水花落在贝壳上，叮叮当当。' },
    { id: 'statue', name: '勇者雕像', power: 12, rarity: 4, weight: 2, desc: '纪念第一次以弱胜强。' }
  ];

  var CROPS = [
    { id: 'carrot', name: '胡萝卜', growSec: 30, seedCost: 1, waterCost: 1, coins: 40, seedReturn: 1, itemChance: 0.04, decoChance: 0, color: '#6A5478', desc: '长得快，兔子最爱。' },
    { id: 'pumpkin', name: '南瓜', growSec: 75, seedCost: 2, waterCost: 1, coins: 100, seedReturn: 2, itemChance: 0.1, decoChance: 0.04, color: '#E8833A', desc: '个头大，能存很久。' },
    { id: 'starfruit', name: '星星果', growSec: 150, seedCost: 3, waterCost: 2, coins: 240, seedReturn: 2, itemChance: 0.22, decoChance: 0.1, color: '#A87B3E', desc: '需要耐心，但回报惊人。' }
  ];

  var SHOP = [
    { id: 'seeds', name: '种子 x2', cost: 20, type: 'resource', key: 'seeds', amount: 2, desc: '种地必备，多囤不亏。' },
    { id: 'water', name: '清水 x2', cost: 16, type: 'resource', key: 'water', amount: 2, desc: '浇灌作物，也能解渴。' },
    { id: 'fert', name: '肥料 x2', cost: 24, type: 'resource', key: 'fert', amount: 2, desc: '每株作物可施一次，生长时间减半。' },
    { id: 'refresh', name: '刷新卡', cost: 60, type: 'card', key: 'refresh', amount: 1, desc: '重新随机一次变身。' },
    { id: 'shield', name: '护盾卡', cost: 80, type: 'card', key: 'shield', amount: 1, desc: '下一场对手战力 -15%。' },
    { id: 'double', name: '双倍卡', cost: 90, type: 'card', key: 'double', amount: 1, desc: '下一场胜利奖励翻倍。' },
    { id: 'boost', name: '强化卡', cost: 120, type: 'card', key: 'boost', amount: 1, desc: '永久战力 +15。' },
    { id: 'deco', name: '随机装饰', cost: 140, type: 'randomDeco', desc: '获得一件随机小岛装饰。' },
    { id: 'item', name: '随机装备', cost: 160, type: 'randomItem', desc: '获得一件随机装备。' }
  ];

  var WORLD = {
    tile: 32,
    cols: 40,
    rows: 48,
    seed: 20261119,
    spawn: { x: 20.5, y: 30.5 },
    maxDecos: 80,
    buildings: [
      { id: 'shrine', type: 'shrine', name: '战斗祭坛', x: 18, y: 5, w: 5, h: 4, approach: { x: 20, y: 10 }, hint: '抽取对手，传送到擂台' },
      { id: 'farm', type: 'farm', name: '小农田', x: 5, y: 27, w: 9, h: 8, approach: { x: 14, y: 31 }, hint: '播种、浇水、收获' },
      { id: 'shop', type: 'shop', name: '杂货铺', x: 29, y: 27, w: 7, h: 5, approach: { x: 32, y: 33 }, hint: '用金币补充物资' },
      { id: 'house', type: 'house', name: '我的小屋', x: 24, y: 39, w: 7, h: 5, approach: { x: 27, y: 44 }, hint: '查看图鉴与变身记录' }
    ],
    farmPlots: [
      { x: 6, y: 28, w: 2, h: 2 },
      { x: 9, y: 28, w: 2, h: 2 },
      { x: 6, y: 31, w: 2, h: 2 },
      { x: 9, y: 31, w: 2, h: 2 }
    ],
    migrateDecoPositions: [
      { x: 15, y: 36 }, { x: 17, y: 36 }, { x: 21, y: 36 }, { x: 23, y: 36 },
      { x: 15, y: 37 }, { x: 17, y: 37 }, { x: 21, y: 37 }, { x: 23, y: 37 },
      { x: 16, y: 38 }, { x: 18, y: 38 }, { x: 22, y: 38 }, { x: 24, y: 38 }
    ]
  };

  var WHEEL = [
    { id: 'nothing', label: '谢谢参与', type: 'nothing', weight: 22, color: '#3E4650' },
    { id: 'coins_s', label: '金币', type: 'coins', amount: 25, weight: 24, color: '#A87B3E' },
    { id: 'coins_l', label: '大金币', type: 'coins', amount: 70, weight: 10, color: '#C39A56' },
    { id: 'seeds', label: '种子', type: 'seeds', amount: 2, weight: 12, color: '#4F7A58' },
    { id: 'water', label: '清水', type: 'water', amount: 2, weight: 12, color: '#3F6E85' },
    { id: 'item', label: '装备', type: 'item', weight: 8, color: '#6A5478' },
    { id: 'deco', label: '装饰', type: 'deco', weight: 7, color: '#8A4F45' },
    { id: 'card', label: '道具卡', type: 'card', weight: 5, color: '#7A6A45' }
  ];

  var TOWER = { floors: 12, base: 0.62, perFloor: 0.08, max: 2.5 };

  var CONFIG = {
    version: 2,
    saveKey: 'beast_island_save_v1',
    startForm: 'rabbit',
    startCoins: 40,
    startSeeds: 3,
    startWater: 3,
    startFert: 2,
    startSlots: 2,
    maxSlots: 6,
    plotCount: 4,
    decoSlotCount: 12,
    maxWorldDecos: 80,
    tierNames: ['', '普通', '稀有', '史诗', '传说', '神话'],
    typeNames: { weapon: '武器', armor: '护甲', accessory: '饰品' },
    rarityColors: ['', '#9AA7B8', '#4FA8E8', '#BB6BD9', '#F2994A', '#F26B3F'],
    pity: { legendary: 300, mythic: 2000 },
    elementMultiplier: { counter: 1.25, countered: 0.85, neutral: 1 }
  };

  window.GAME_DATA = {
    CREATURES: CREATURES,
    ELEMENTS: ELEMENTS,
    RARITY_WEIGHTS: RARITY_WEIGHTS,
    ITEMS: ITEMS,
    CARDS: CARDS,
    DECORATIONS: DECORATIONS,
    CROPS: CROPS,
    SHOP: SHOP,
    WHEEL: WHEEL,
    TOWER: TOWER,
    WORLD: WORLD,
    CONFIG: CONFIG
  };
}());
