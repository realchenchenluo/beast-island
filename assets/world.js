/* 变身岛 - 3D 大世界引擎（three.js r120 / WebGL1 / Chrome 61 基线） */
(function () {
  'use strict';

  window.__worldError = null;
  window.addEventListener('error', function (event) {
    window.__worldError = (event.message || 'unknown') + ' @ ' + (event.filename || '') + ':' + (event.lineno || 0);
  });

  var D = window.GAME_DATA;
  var C = D.CONFIG;
  var W = D.WORLD;
  var TILE = 2;
  var COLS = W.cols;
  var ROWS = W.rows;
  var WORLD_W = COLS * TILE;
  var WORLD_H = ROWS * TILE;
  var WATER_Y = -0.18;
  var HEIGHT = { 0: -1.0, 1: -0.5, 2: 0.05, 3: 0.3, 4: 0.34, 5: -0.35 };
  var TILE_COLORS = {
    0: '#2A6F8E', 1: '#5FB3C6', 2: '#CBB78C', 3: '#5E8F50', 4: '#B08A5C', 5: '#2F7F9E'
  };

  var refs = {};
  var scene = null;
  var camera = null;
  var renderer = null;
  var canvas = null;
  var minimapCanvas = null;
  var mctx = null;
  var minimapBase = null;
  var viewW = 360;
  var viewH = 600;
  var dpr = 1;

  var map = null;
  var heightGrid = null;
  var terrainMesh = null;
  var waterMesh = null;
  var decoMeshes = {};
  var decoGeometries = {};
  var farmCropMeshes = [];
  var inFarm = false;
  var farmTargetIndex = -1;
  var farmTargetRing = null;
  var lastFarmCheck = 0;
  var lastFarmCrops = 0;
  var sceneryParts = {};
  var buildingMeshes = [];
  var buildingLabels = [];
  var markerSprite = null;
  var markerRing = null;
  var sunMesh = null;
  var clouds = [];

  var player = {
    x: W.spawn.x * TILE,
    z: W.spawn.y * TILE,
    y: 0,
    angle: Math.PI,
    targetAngle: Math.PI,
    speed: 4.4,
    path: [],
    pendingInteract: null,
    moving: false
  };
  var cam = { yaw: 0, pitch: 0.60, distance: 14 };
  var camTarget = null;
  var camDesired = null;

  var avatarGroup = null;
  var avatarHolder = null;
  var avatarShadow = null;
  var avatarGlow = null;
  var avatarNameSprite = null;
  var avatarModel = null;
  var currentFormId = null;
  var currentAvatarHeight = 1.6;
  var portraitTextures = {};
  var MODEL_KEYS = {
    rabbit: 'rabbit', pig: 'pig', sheep: 'sheep', goat: 'goat', cow: 'cow',
    fox: 'fox', wolf: 'wolf', turtle: 'seaturtle', giraffe: 'giraffe',
    crocodile: 'crocodile', bear: 'bear', octopus: 'octopus', shark: 'shark',
    lion: 'lion', elephant: 'elephant',
    tiger: 'tiger', white_tiger: 'tiger', panda: 'panda', monkey: 'monkey',
    eagle: 'eagle', hedgehog: 'hedgehog', crane: 'egret', peacock: 'pheasant',
    phoenix: 'pheasant', zhuque: 'pheasant', kun: 'whale',
    qilin: 'horse', baize: 'whitelion', xuanwu: 'turtle',
    ninefox: 'fox', qiongqi: 'tiger',
    qinglong: 'greendragon', zhulong: 'reddragon', yinglong: 'purpledragon'
  };
  var MODEL_TEXTURE = {
    tiger: 'tiger', white_tiger: 'tiger-white', qiongqi: 'tiger',
    panda: 'panda', monkey: 'monkey', eagle: 'eagle', hedgehog: 'hedgehog',
    crane: 'egret', peacock: 'pheasant-peacock', phoenix: 'pheasant-fire',
    zhuque: 'pheasant-vermilion', baize: 'whitelion-white', qilin: 'horse-qilin'
  };
  var MODEL_STYLE = {
    qilin: { tint: 0xFFFFFF },
    baize: { tint: 0xFFFFFF, sat: 0.3, lift: 0.25 },
    ninefox: { tint: 0xF4EFEA, sat: 0.12, lift: 0.4 },
    qiongqi: { tint: 0x8A7AA8, sat: 0.6, lift: -0.05 },
    white_tiger: { tint: 0xFFFFFF },
    xuanwu: { tint: 0x7A9A8A, sat: 0.4, lift: -0.08 },
    zhuque: { tint: 0xE8B07A, sat: 1.0, lift: 0.02 },
    kun: { tint: 0x9AC8E8, sat: 0.8, lift: 0.08 },
    crane: { tint: 0xFFFFFF },
    peacock: { tint: 0xBFE8E0 },
    phoenix: { tint: 0xF2D8A0 },
    qinglong: { tint: 0x8CE8C8 },
    zhulong: { tint: 0xFFA080 },
    yinglong: { tint: 0xE8D8A0, sat: 1.0, lift: 0.04 }
  };
  var polyBaseCache = {};
  var polyImageState = {};
  var polyPending = {};
  var modelTextureCache = {};
  var PORTRAIT_TINT = {
    qinglong: 0x88CCFF, zhulong: 0xFF9A8A, yinglong: 0xFFD27A,
    phoenix: 0xFFB070, zhuque: 0xFF8A6A, white_tiger: 0xD6EAF8,
    qiongqi: 0x9A8AA8, ninefox: 0xFFF0F4, baize: 0xF2F0E8,
    xuanwu: 0x7A9A8A, qilin: 0xC9E8B0, kun: 0x7AB8E8
  };
  var avatarMaterialCache = {};
  var proceduralAvatarCache = {};

  var input = { x: 0, y: 0 };
  var keys = {};
  var joystick = { active: false, pointerId: null, cx: 0, cy: 0, radius: 40 };
  var active = false;
  var running = false;
  var rafId = 0;
  var lastTime = 0;
  var time = 0;
  var lastSave = 0;
  var lastNearCheck = 0;
  var lastMinimap = 0;
  var lastPlace = 0;
  var dirty = false;
  var nearby = null;
  var lastInteractLabel = '';
  var decorateMode = false;
  var selectedDeco = null;
  var gardenMode = false;
  var selectedPlant = null;
  var plantMeshes = [];
  var plantSolidTiles = {};
  var initialized = false;
  var errorCount = 0;
  var hintTimer = null;
  var placeText = '';
  var textureCache = {};

  var SCENERY_MODELS = {
    tree1: ['tree_default'], tree2: ['tree_pineDefaultA'], tree3: ['tree_small'],
    pine: ['tree_pineTallA'], long: ['tree_tall'], round: ['tree_oak'], round2: ['tree_fat'],
    palm: ['tree_palm'],
    bush1: ['plant_bush'], bush3: ['plant_bushLarge'], bush4: ['plant_bushDetailed'], hedge: ['plant_flatTall'],
    rock: ['rock_largeA', 'rock_largeC', 'rock_smallA'],
    flower: ['flower_redA', 'flower_yellowA', 'flower_purpleA'],
    grass: ['grass'], mushroom: ['mushroom_red']
  };
  var MODEL_HEIGHT = {
    tree_default: 4.6, tree_pineDefaultA: 5.6, tree_small: 2.9, tree_pineTallA: 6.4,
    tree_tall: 6.2, tree_oak: 5.2, tree_fat: 4.4, tree_palm: 5.0,
    plant_bush: 1.2, plant_bushLarge: 1.6, plant_bushDetailed: 1.4, plant_flatTall: 1.0,
    rock_largeA: 1.5, rock_largeC: 1.3, rock_smallA: 0.8,
    flower_redA: 0.75, flower_yellowA: 0.75, flower_purpleA: 0.75,
    grass: 0.55, mushroom_red: 0.55
  };
  var PET_MODEL = {
    rabbit: 'animal-bunny', pig: 'animal-pig', cow: 'animal-cow', fox: 'animal-fox',
    wolf: 'animal-fox', sheep: 'animal-koala', goat: 'animal-deer', monkey: 'animal-monkey',
    turtle: 'animal-crab', eagle: 'animal-parrot', giraffe: 'animal-giraffe',
    crocodile: 'animal-crab', panda: 'animal-panda', bear: 'animal-koala',
    crane: 'animal-parrot', peacock: 'animal-parrot', octopus: 'animal-crab',
    shark: 'animal-fish', tiger: 'animal-tiger', lion: 'animal-lion',
    elephant: 'animal-elephant', qilin: 'animal-deer', baize: 'animal-lion',
    ninefox: 'animal-fox', qiongqi: 'animal-tiger', white_tiger: 'animal-tiger',
    xuanwu: 'animal-crab', zhuque: 'animal-parrot', kun: 'animal-fish'
  };
  var PET_TINT = {
    wolf: '#9AA7B8', sheep: '#F2E6D0', bear: '#A97142', turtle: '#6FBF6A',
    crocodile: '#5FA85C', octopus: '#BB6BD9', eagle: '#F7F5F2', crane: '#FFFFFF',
    peacock: '#3FA9A0', shark: '#5A8FB8', qilin: '#7FB86F', baize: '#F7F5F2',
    ninefox: '#F7F5F2', qiongqi: '#5A4A6A', white_tiger: '#D6EAF8',
    xuanwu: '#4A6B6A', zhuque: '#E85D5D', kun: '#3F7FA8'
  };

  function toast(message) {
    if (window.UI && window.UI.toast) window.UI.toast(message);
    else if (window.console) console.log(message);
  }

  function setText(el, text) {
    if (el && el.textContent !== text) el.textContent = text;
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function sRGB(hex) {
    return new THREE.Color(hex).convertSRGBToLinear();
  }

  function lerpAngle(a, b, t) {
    var diff = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
    return a + diff * t;
  }

  function hash(x, y) {
    var h = Math.imul(x, 374761393) + Math.imul(y, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  }

  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a += 0x6D2B79F5;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function inBounds(x, y) {
    return x >= 0 && y >= 0 && x < COLS && y < ROWS;
  }

  function dist2(ax, az, bx, bz) {
    var dx = ax - bx;
    var dz = az - bz;
    return Math.sqrt(dx * dx + dz * dz);
  }

  /* ---------------- 模型数据解析（自写 GLB，避免 XHR） ---------------- */
  function decodeBase64(base64) {
    var binary = atob(base64);
    var len = binary.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }

  function decodeUtf8(bytes) {
    if (window.TextDecoder) return new TextDecoder('utf-8').decode(bytes);
    var out = '';
    for (var i = 0; i < bytes.length; i += 1) out += String.fromCharCode(bytes[i]);
    return decodeURIComponent(escape(out));
  }

  function parseGLB(buffer) {
    var dv = new DataView(buffer);
    if (dv.getUint32(0, true) !== 0x46546C67) return null;
    var total = dv.getUint32(8, true);
    var offset = 12;
    var json = null;
    var bin = null;
    while (offset < total) {
      var chunkLength = dv.getUint32(offset, true);
      var chunkType = dv.getUint32(offset + 4, true);
      var chunkData = buffer.slice(offset + 8, offset + 8 + chunkLength);
      if (chunkType === 0x4E4F534A) json = JSON.parse(decodeUtf8(new Uint8Array(chunkData)));
      else if (chunkType === 0x004E4942) bin = chunkData;
      offset += 8 + chunkLength;
    }
    if (!json || !bin) return null;
    return { json: json, bin: bin };
  }

  var COMPONENT = {
    5120: Int8Array, 5121: Uint8Array, 5122: Int16Array,
    5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array
  };
  var NUM_COMPONENTS = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 };

  function readAccessor(json, bin, index) {
    var acc = json.accessors[index];
    if (!acc || acc.bufferView === undefined) return null;
    var bv = json.bufferViews[acc.bufferView];
    var comp = COMPONENT[acc.componentType];
    var num = NUM_COMPONENTS[acc.type];
    var count = acc.count;
    var elemSize = comp.BYTES_PER_ELEMENT;
    var stride = bv.byteStride || elemSize * num;
    var base = (bv.byteOffset || 0) + (acc.byteOffset || 0);
    if (stride === elemSize * num) {
      try {
        return new comp(bin, base, count * num);
      } catch (error) {
        return null;
      }
    }
    var out = new comp(count * num);
    var dv = new DataView(bin);
    for (var i = 0; i < count; i += 1) {
      for (var j = 0; j < num; j += 1) {
        var o = base + i * stride + j * elemSize;
        var v = 0;
        if (acc.componentType === 5126) v = dv.getFloat32(o, true);
        else if (acc.componentType === 5123) v = dv.getUint16(o, true);
        else if (acc.componentType === 5125) v = dv.getUint32(o, true);
        else if (acc.componentType === 5121) v = dv.getUint8(o);
        else if (acc.componentType === 5122) v = dv.getInt16(o, true);
        else v = dv.getInt8(o);
        out[i * num + j] = v;
      }
    }
    return out;
  }

  function getTexture(src) {
    if (textureCache[src]) return textureCache[src];
    var tex = new THREE.Texture();
    tex.flipY = false;
    tex.encoding = THREE.sRGBEncoding;
    var img = new Image();
    img.onload = function () {
      tex.image = img;
      tex.needsUpdate = true;
    };
    img.onerror = function () {};
    img.src = src;
    textureCache[src] = tex;
    return tex;
  }

  function buildMaterial(json, prim, basePath, hasVertexColors) {
    var def = (json.materials && prim.material !== undefined) ? json.materials[prim.material] : null;
    var pbr = def && def.pbrMetallicRoughness ? def.pbrMetallicRoughness : {};
    var color = pbr.baseColorFactor || [1, 1, 1, 1];
    var opts = {
      color: new THREE.Color(color[0], color[1], color[2]),
      side: def && def.doubleSided ? THREE.DoubleSide : THREE.FrontSide
    };
    if (hasVertexColors) opts.vertexColors = true;
    if (color[3] < 1 || (def && def.alphaMode === 'BLEND')) {
      opts.transparent = true;
      opts.opacity = color[3];
    }
    if (pbr.baseColorTexture && pbr.baseColorTexture.index !== undefined) {
      var texDef = json.textures ? json.textures[pbr.baseColorTexture.index] : null;
      var imgDef = texDef && json.images ? json.images[texDef.source] : null;
      if (imgDef && imgDef.uri) opts.map = getTexture(basePath + imgDef.uri);
    }
    return new THREE.MeshLambertMaterial(opts);
  }

  function buildPrimitive(json, bin, prim) {
    var geo = new THREE.BufferGeometry();
    var attrs = prim.attributes || {};
    var pos = attrs.POSITION !== undefined ? readAccessor(json, bin, attrs.POSITION) : null;
    if (!pos) return null;
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    if (attrs.NORMAL !== undefined) {
      var nor = readAccessor(json, bin, attrs.NORMAL);
      if (nor) geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    }
    if (attrs.TEXCOORD_0 !== undefined) {
      var uv = readAccessor(json, bin, attrs.TEXCOORD_0);
      if (uv) geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    }
    if (attrs.COLOR_0 !== undefined) {
      var colorData = readAccessor(json, bin, attrs.COLOR_0);
      if (colorData) {
        var colorAcc = json.accessors[attrs.COLOR_0];
        var colorSize = colorAcc && colorAcc.type === 'VEC4' ? 4 : 3;
        geo.setAttribute('color', new THREE.BufferAttribute(colorData, colorSize));
      }
    }
    if (prim.indices !== undefined) {
      var idx = readAccessor(json, bin, prim.indices);
      if (idx) geo.setIndex(new THREE.BufferAttribute(idx, 1));
    }
    return geo;
  }

  function parseModelData(key) {
    var b64 = window.BEAST_MODELS && window.BEAST_MODELS[key];
    if (!b64) return null;
    var buffer;
    try {
      buffer = decodeBase64(b64);
    } catch (error) {
      return null;
    }
    var glb = parseGLB(buffer);
    if (!glb) return null;
    var json = glb.json;
    var bin = glb.bin;
    var basePath = key.indexOf('pets/') === 0 ? './assets/models/pets/' : './assets/models/nature/';
    var parts = [];
    var sceneDef = json.scenes && json.scenes[json.scene || 0];

    function walk(nodeIndex, parentMatrix) {
      var node = json.nodes[nodeIndex];
      if (!node) return;
      var local = new THREE.Matrix4();
      if (node.matrix) {
        local.fromArray(node.matrix);
      } else {
        var t = node.translation || [0, 0, 0];
        var r = node.rotation || [0, 0, 0, 1];
        var s = node.scale || [1, 1, 1];
        local.compose(
          new THREE.Vector3(t[0], t[1], t[2]),
          new THREE.Quaternion(r[0], r[1], r[2], r[3]),
          new THREE.Vector3(s[0], s[1], s[2])
        );
      }
      var world = new THREE.Matrix4().multiplyMatrices(parentMatrix, local);
      if (node.mesh !== undefined) {
        var meshDef = json.meshes[node.mesh];
        if (meshDef) {
          for (var i = 0; i < meshDef.primitives.length; i += 1) {
            var prim = meshDef.primitives[i];
            var geo = buildPrimitive(json, bin, prim);
            if (!geo) continue;
            geo.applyMatrix4(world);
            parts.push({
              geometry: geo,
              material: buildMaterial(json, prim, basePath, prim.attributes && prim.attributes.COLOR_0 !== undefined)
            });
          }
        }
      }
      if (node.children) {
        for (var c = 0; c < node.children.length; c += 1) walk(node.children[c], world);
      }
    }

    var roots = sceneDef ? sceneDef.nodes : [];
    for (var r = 0; r < roots.length; r += 1) walk(roots[r], new THREE.Matrix4());
    return parts;
  }

  function normalizeParts(parts, targetHeight) {
    if (!parts || !parts.length) return null;
    var box = new THREE.Box3();
    for (var i = 0; i < parts.length; i += 1) {
      parts[i].geometry.computeBoundingBox();
      box.union(parts[i].geometry.boundingBox);
    }
    var size = new THREE.Vector3();
    var center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    var scale = targetHeight / Math.max(0.001, size.y);
    for (var k = 0; k < parts.length; k += 1) {
      parts[k].geometry.translate(-center.x, -box.min.y, -center.z);
      parts[k].geometry.scale(scale, scale, scale);
    }
    return { parts: parts, height: targetHeight, scale: scale };
  }

  function getNatureModel(name) {
    if (sceneryParts[name]) return sceneryParts[name];
    var parts = parseModelData('nature/' + name);
    var model = parts ? normalizeParts(parts, MODEL_HEIGHT[name] || 2) : null;
    sceneryParts[name] = model;
    return model;
  }

  function getPetModel(name) {
    if (sceneryParts['pet:' + name]) return sceneryParts['pet:' + name];
    var parts = parseModelData('pets/' + name);
    var model = parts ? normalizeParts(parts, 1.6) : null;
    sceneryParts['pet:' + name] = model;
    return model;
  }

  /* ---------------- 合并几何工具 ---------------- */
  function part(geo, color, x, y, z, rx, ry, rz, sx, sy, sz) {
    return {
      geo: geo, color: color,
      x: x || 0, y: y || 0, z: z || 0,
      rx: rx || 0, ry: ry || 0, rz: rz || 0,
      sx: sx || 1, sy: sy || 1, sz: sz || 1
    };
  }

  function box(w, h, d, color, x, y, z, ry) {
    return part(new THREE.BoxBufferGeometry(w, h, d), color, x, y, z, 0, ry || 0, 0);
  }

  function cyl(rt, rb, h, seg, color, x, y, z, rx, ry, rz) {
    return part(new THREE.CylinderBufferGeometry(rt, rb, h, seg), color, x, y, z, rx || 0, ry || 0, rz || 0);
  }

  function cone(r, h, seg, color, x, y, z, ry) {
    return part(new THREE.ConeBufferGeometry(r, h, seg), color, x, y, z, 0, ry || 0, 0);
  }

  function sphere(r, seg, color, x, y, z, sx, sy, sz) {
    return part(new THREE.SphereBufferGeometry(r, seg, Math.max(6, Math.round(seg * 0.75))), color, x, y, z, 0, 0, 0, sx || 1, sy || 1, sz || 1);
  }

  function mergeParts(parts) {
    var positions = [];
    var colors = [];
    var color = new THREE.Color();
    for (var i = 0; i < parts.length; i += 1) {
      var p = parts[i];
      var geo = p.geo.index ? p.geo.toNonIndexed() : p.geo.clone();
      var matrix = new THREE.Matrix4();
      matrix.compose(
        new THREE.Vector3(p.x, p.y, p.z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(p.rx, p.ry, p.rz)),
        new THREE.Vector3(p.sx, p.sy, p.sz)
      );
      geo.applyMatrix4(matrix);
      var arr = geo.attributes.position.array;
      color.set(p.color || '#FFFFFF').convertSRGBToLinear();
      for (var k = 0; k < arr.length; k += 3) {
        positions.push(arr[k], arr[k + 1], arr[k + 2]);
        colors.push(color.r, color.g, color.b);
      }
      geo.dispose();
    }
    var merged = new THREE.BufferGeometry();
    merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    merged.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    merged.computeVertexNormals();
    return merged;
  }

  function makeMergedMesh(parts, opts) {
    var geo = mergeParts(parts);
    var mat = new THREE.MeshLambertMaterial(Object.assign({
      vertexColors: true,
      flatShading: true
    }, opts || {}));
    return new THREE.Mesh(geo, mat);
  }

  /* ---------------- 地图与地形 ---------------- */
  function generateMap() {
    var rand = mulberry32(W.seed);
    var tiles = [];
    var solid = [];
    var decoBlocked = [];
    var occupied = [];
    var scenery = [];
    var x;
    var y;

    for (y = 0; y < ROWS; y += 1) {
      tiles[y] = []; solid[y] = []; decoBlocked[y] = []; occupied[y] = [];
      for (x = 0; x < COLS; x += 1) {
        tiles[y][x] = 0; solid[y][x] = true; decoBlocked[y][x] = false; occupied[y][x] = false;
      }
    }

    var cx = COLS / 2;
    var cy = ROWS / 2;
    var rx = COLS * 0.46;
    var ry = ROWS * 0.46;
    for (y = 0; y < ROWS; y += 1) {
      for (x = 0; x < COLS; x += 1) {
        var nx = (x + 0.5 - cx) / rx;
        var ny = (y + 0.5 - cy) / ry;
        var d = nx * nx + ny * ny;
        var angle = Math.atan2(ny, nx);
        var wobble = 1 + 0.055 * Math.sin(angle * 5 + 1.2) + 0.035 * Math.sin(angle * 9 + 0.6);
        var tile = 0;
        if (d < 0.80 * wobble) tile = 3;
        else if (d < 0.97 * wobble) tile = 2;
        else if (d < 1.16 * wobble) tile = 1;
        tiles[y][x] = tile;
        solid[y][x] = tile === 0 || tile === 1;
      }
    }

    var pondX = 9;
    var pondY = 15;
    var pondR = 3.6;
    for (y = 0; y < ROWS; y += 1) {
      for (x = 0; x < COLS; x += 1) {
        var pd = dist2(x + 0.5, y + 0.5, pondX, pondY);
        if (pd < pondR) {
          tiles[y][x] = 5;
          solid[y][x] = true;
        } else if (pd < pondR + 1.5 && (tiles[y][x] === 3 || tiles[y][x] === 2)) {
          tiles[y][x] = 2;
          solid[y][x] = false;
        }
      }
    }

    function paintPath(ax, ay, bx, by, width) {
      var steps = Math.max(Math.abs(bx - ax), Math.abs(by - ay));
      for (var s = 0; s <= steps; s += 1) {
        var t = steps ? s / steps : 0;
        var px = Math.round(ax + (bx - ax) * t);
        var py = Math.round(ay + (by - ay) * t);
        for (var oy = -width; oy <= width; oy += 1) {
          for (var ox = -width; ox <= width; ox += 1) {
            var tx = px + ox;
            var ty = py + oy;
            if (!inBounds(tx, ty)) continue;
            if (tiles[ty][tx] === 0 || tiles[ty][tx] === 1 || tiles[ty][tx] === 5) continue;
            tiles[ty][tx] = 4;
            solid[ty][tx] = false;
          }
        }
      }
    }

    paintPath(20, 44, 20, 9, 1);
    paintPath(20, 31, 13, 31, 0);
    paintPath(20, 31, 32, 31, 0);
    paintPath(32, 31, 32, 33, 0);
    paintPath(20, 9, 20, 10, 0);
    paintPath(20, 44, 27, 44, 0);

    var buildings = [];
    for (var bi = 0; bi < W.buildings.length; bi += 1) {
      var source = W.buildings[bi];
      var b = {
        id: source.id, type: source.type, name: source.name,
        x: source.x, y: source.y, w: source.w, h: source.h,
        approach: source.approach, hint: source.hint,
        centerX: (source.x + source.w / 2) * TILE,
        centerZ: (source.y + source.h / 2) * TILE,
        approachX: source.approach.x * TILE + TILE / 2,
        approachZ: source.approach.y * TILE + TILE / 2,
        labelY: 4
      };
      buildings.push(b);
      var isFarm = b.type === 'farm';
      var gateY1 = b.y + Math.floor(b.h / 2) - 1;
      var gateY2 = b.y + Math.floor(b.h / 2);
      for (var by = b.y; by < b.y + b.h; by += 1) {
        for (var bx = b.x; bx < b.x + b.w; bx += 1) {
          if (!inBounds(bx, by)) continue;
          if (isFarm) {
            var edge = bx === b.x || bx === b.x + b.w - 1 || by === b.y || by === b.y + b.h - 1;
            var gate = bx === b.x + b.w - 1 && (by === gateY1 || by === gateY2);
            solid[by][bx] = edge && !gate;
          } else {
            solid[by][bx] = true;
          }
          decoBlocked[by][bx] = true;
          occupied[by][bx] = true;
        }
      }
      for (var oy2 = -1; oy2 <= 1; oy2 += 1) {
        for (var ox2 = -1; ox2 <= 1; ox2 += 1) {
          var atx = b.approach.x + ox2;
          var aty = b.approach.y + oy2;
          if (inBounds(atx, aty)) {
            solid[aty][atx] = false;
            decoBlocked[aty][atx] = true;
          }
        }
      }
    }

    /* 空岛开局：岛上不预置任何花草树木与标牌，全部交给玩家种植。 */

    solid[Math.floor(W.spawn.y)][Math.floor(W.spawn.x)] = false;
    for (var bj = 0; bj < buildings.length; bj += 1) {
      var bb = buildings[bj];
      for (var ay2 = -1; ay2 <= 1; ay2 += 1) {
        for (var ax2 = -1; ax2 <= 1; ax2 += 1) {
          if (inBounds(bb.approach.x + ax2, bb.approach.y + ay2)) {
            solid[bb.approach.y + ay2][bb.approach.x + ax2] = false;
          }
        }
      }
    }

    return { tiles: tiles, solid: solid, decoBlocked: decoBlocked, scenery: scenery, buildings: buildings };
  }

  function buildHeightGrid() {
    var grid = [];
    for (var gy = 0; gy <= ROWS; gy += 1) {
      grid[gy] = [];
      for (var gx = 0; gx <= COLS; gx += 1) {
        var sum = 0;
        var n = 0;
        for (var dy = -1; dy <= 0; dy += 1) {
          for (var dx = -1; dx <= 0; dx += 1) {
            var tx = gx + dx;
            var ty = gy + dy;
            if (tx >= 0 && ty >= 0 && tx < COLS && ty < ROWS) {
              sum += HEIGHT[map.tiles[ty][tx]];
              n += 1;
            }
          }
        }
        grid[gy][gx] = n ? sum / n : -1;
      }
    }
    return grid;
  }

  function heightAtGrid(gx, gz) {
    if (!heightGrid || gx < 0 || gz < 0 || gx > COLS || gz > ROWS) return -1;
    return heightGrid[gz][gx];
  }

  function terrainHeightAt(x, z) {
    var gx = x / TILE;
    var gz = z / TILE;
    var x0 = Math.floor(gx);
    var z0 = Math.floor(gz);
    var fx = gx - x0;
    var fz = gz - z0;
    var h00 = heightAtGrid(x0, z0);
    var h10 = heightAtGrid(x0 + 1, z0);
    var h01 = heightAtGrid(x0, z0 + 1);
    var h11 = heightAtGrid(x0 + 1, z0 + 1);
    return (h00 * (1 - fx) + h10 * fx) * (1 - fz) + (h01 * (1 - fx) + h11 * fx) * fz;
  }

  var worldTextureCache = {};

  function getWorldTexture(key, draw, repeat) {
    if (worldTextureCache[key]) return worldTextureCache[key];
    var c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    var g = c.getContext('2d');
    if (!g) return null;
    draw(g, 256);
    var tex = new THREE.Texture();
    tex.image = c;
    tex.encoding = THREE.sRGBEncoding;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    if (repeat) tex.repeat.set(repeat[0], repeat[1]);
    tex.needsUpdate = true;
    worldTextureCache[key] = tex;
    return tex;
  }

  function drawTerrainDetail(g, S) {
    g.fillStyle = '#F5F3E6';
    g.fillRect(0, 0, S, S);
    var i;
    // mottled ground: mossy and sun-bleached patches
    for (i = 0; i < 150; i += 1) {
      var px = hash(i, 3) * S;
      var py = hash(i, 7) * S;
      var pr = 3 + hash(i, 9) * 16;
      var pg = g.createRadialGradient(px, py, 0, px, py, pr);
      var dark = hash(i, 11) > 0.45;
      pg.addColorStop(0, dark ? 'rgba(54,76,38,0.10)' : 'rgba(255,248,214,0.11)');
      pg.addColorStop(1, 'rgba(90,110,60,0)');
      g.fillStyle = pg;
      g.beginPath();
      g.arc(px, py, pr, 0, Math.PI * 2);
      g.fill();
    }
    // fine grass blades
    for (i = 0; i < 1250; i += 1) {
      var x = hash(i, 13) * S;
      var y = hash(i, 17) * S;
      var len = 1.5 + hash(i, 19) * 5;
      var lean = (hash(i, 23) - 0.5) * 4;
      g.strokeStyle = i % 7 === 0
        ? 'rgba(122,128,64,0.22)'
        : (i % 3 === 0 ? 'rgba(40,64,30,0.20)' : 'rgba(214,228,168,0.28)');
      g.lineWidth = 0.7 + hash(i, 29) * 0.8;
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x + lean * 0.4, y - len * 0.6, x + lean, y - len);
      g.stroke();
    }
    // clover and broadleaf flecks
    for (i = 0; i < 120; i += 1) {
      var cx = hash(i, 31) * S;
      var cy = hash(i, 37) * S;
      g.fillStyle = i % 4 === 0 ? 'rgba(92,122,60,0.26)' : 'rgba(156,186,104,0.24)';
      for (var k = 0; k < 3; k += 1) {
        var a = k / 3 * Math.PI * 2 + hash(i, 41);
        g.beginPath();
        g.ellipse(cx + Math.cos(a) * 1.6, cy + Math.sin(a) * 1.6, 1.5, 1.1, a, 0, Math.PI * 2);
        g.fill();
      }
    }
    // dry soil flecks and tiny stones
    for (i = 0; i < 190; i += 1) {
      var sx = hash(i, 43) * S;
      var sy = hash(i, 47) * S;
      g.fillStyle = i % 3 === 0 ? 'rgba(120,96,62,0.20)' : 'rgba(160,148,112,0.17)';
      g.beginPath();
      g.ellipse(sx, sy, 0.7 + hash(i, 53) * 1.8, 0.5 + hash(i, 59) * 1.2, hash(i, 61) * 3, 0, Math.PI * 2);
      g.fill();
    }
  }

  function drawPathTexture(g, S) {
    g.clearRect(0, 0, S, S);
    var i;
    var grad = g.createLinearGradient(0, 0, S, 0);
    grad.addColorStop(0, 'rgba(128,100,64,0)');
    grad.addColorStop(0.05, 'rgba(128,100,64,0.72)');
    grad.addColorStop(0.14, 'rgba(150,119,78,0.96)');
    grad.addColorStop(0.5, 'rgba(166,133,89,0.99)');
    grad.addColorStop(0.86, 'rgba(150,119,78,0.96)');
    grad.addColorStop(0.95, 'rgba(128,100,64,0.72)');
    grad.addColorStop(1, 'rgba(128,100,64,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, S, S);
    // broad damp / dry patches
    for (i = 0; i < 34; i += 1) {
      var bx = S * 0.12 + hash(i, 201) * S * 0.76;
      var by = hash(i, 203) * S;
      var br = 8 + hash(i, 207) * 30;
      var bg = g.createRadialGradient(bx, by, 1, bx, by, br);
      bg.addColorStop(0, i % 3 === 0 ? 'rgba(102,74,44,0.18)' : 'rgba(206,176,128,0.16)');
      bg.addColorStop(1, 'rgba(150,120,80,0)');
      g.fillStyle = bg;
      g.beginPath();
      g.arc(bx, by, br, 0, Math.PI * 2);
      g.fill();
    }
    // wheel ruts with soft shoulders
    for (var r = 0; r < 2; r += 1) {
      var rx = S * (r ? 0.63 : 0.37);
      g.strokeStyle = 'rgba(96,70,42,0.16)';
      g.lineWidth = 15;
      g.beginPath();
      g.moveTo(rx, -2);
      g.lineTo(rx, S + 2);
      g.stroke();
      g.strokeStyle = 'rgba(86,62,38,0.20)';
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(rx + 1.5, -2);
      g.lineTo(rx + 1.5, S + 2);
      g.stroke();
      g.strokeStyle = 'rgba(206,178,132,0.13)';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(rx - 7, -2);
      g.lineTo(rx - 7, S + 2);
      g.stroke();
    }
    // churned clods
    var palette = ['#7E5F3C', '#94714A', '#B08A5A', '#C4A171', '#6E5234', '#A57D4E'];
    for (i = 0; i < 210; i += 1) {
      var x = S * 0.08 + hash(i, 101) * S * 0.84;
      var y = hash(i, 103) * S;
      var ew = 1.2 + hash(i, 109) * 5.2;
      var eh = 1 + hash(i, 113) * 3.2;
      g.fillStyle = palette[i % palette.length];
      g.globalAlpha = 0.32 + hash(i, 107) * 0.42;
      g.beginPath();
      g.ellipse(x, y, ew, eh, hash(i, 127) * Math.PI, 0, Math.PI * 2);
      g.fill();
      if (i % 5 === 0) {
        g.strokeStyle = 'rgba(74,54,32,0.22)';
        g.lineWidth = 0.8;
        g.stroke();
      }
    }
    // compacted stones with a highlight
    for (i = 0; i < 90; i += 1) {
      var sx = S * 0.08 + hash(i, 211) * S * 0.84;
      var sy = hash(i, 213) * S;
      var sr = 1.2 + hash(i, 217) * 3.2;
      g.globalAlpha = 0.72;
      g.fillStyle = i % 4 === 0 ? '#8D7E68' : '#BCA98C';
      g.beginPath();
      g.ellipse(sx, sy, sr, sr * 0.7, hash(i, 219) * Math.PI, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 0.55;
      g.fillStyle = 'rgba(240,226,196,0.7)';
      g.beginPath();
      g.ellipse(sx - sr * 0.22, sy - sr * 0.25, sr * 0.5, sr * 0.3, hash(i, 219) * Math.PI, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
    // fine grit
    for (i = 0; i < 1100; i += 1) {
      var nx = S * 0.04 + hash(i, 221) * S * 0.92;
      var ny = hash(i, 223) * S;
      g.fillStyle = i % 5 === 0 ? 'rgba(64,46,28,0.24)' : 'rgba(226,204,164,0.22)';
      g.fillRect(nx, ny, 0.8, 0.8);
    }
    // hairline cracks
    for (i = 0; i < 12; i += 1) {
      var cx2 = S * 0.16 + hash(i, 227) * S * 0.68;
      var cy2 = hash(i, 229) * S;
      g.strokeStyle = 'rgba(70,50,30,0.22)';
      g.lineWidth = 0.9;
      g.beginPath();
      g.moveTo(cx2, cy2);
      for (var c = 1; c <= 4; c += 1) {
        g.lineTo(cx2 + (hash(i * 7 + c, 231) - 0.5) * 15, cy2 + c * 4 + hash(c, 233) * 4);
      }
      g.stroke();
    }
    // grass creeping in from both edges
    for (var j = 0; j < 110; j += 1) {
      var left = j % 2 === 0;
      var gx = left ? S * 0.02 + hash(j, 137) * S * 0.14 : S * 0.84 + hash(j, 137) * S * 0.14;
      var gy = hash(j, 139) * S;
      var gh = 4 + hash(j, 151) * 11;
      g.strokeStyle = j % 3 === 0 ? 'rgba(74,110,52,0.58)' : 'rgba(96,132,62,0.50)';
      g.lineWidth = 1.1 + hash(j, 157) * 1.1;
      g.beginPath();
      g.moveTo(gx, gy);
      g.quadraticCurveTo(gx + (left ? 3 : -3), gy - gh * 0.55, gx + (hash(j, 149) - 0.5) * 9, gy - gh);
      g.stroke();
    }
  }

  function drawPlazaTexture(g, S) {
    g.clearRect(0, 0, S, S);
    var cx = S / 2;
    var cy = S / 2;
    g.beginPath();
    g.arc(cx, cy, S * 0.48, 0, Math.PI * 2);
    g.fillStyle = '#A98B61';
    g.fill();
    g.strokeStyle = 'rgba(94,74,48,0.75)';
    g.lineWidth = 6;
    g.stroke();
    g.beginPath();
    g.arc(cx, cy, S * 0.40, 0, Math.PI * 2);
    g.strokeStyle = 'rgba(90,72,46,0.45)';
    g.lineWidth = 3;
    g.stroke();
    for (var ring = 0; ring < 4; ring += 1) {
      var r = S * (0.10 + ring * 0.095);
      var n = 10 + ring * 5;
      for (var i = 0; i < n; i += 1) {
        var a = i / n * Math.PI * 2 + ring * 0.18;
        var x = cx + Math.cos(a) * r;
        var y = cy + Math.sin(a) * r;
        g.save();
        g.translate(x, y);
        g.rotate(a);
        g.fillStyle = i % 3 === 0 ? '#C2A06F' : (i % 3 === 1 ? '#B79666' : '#CFAF7C');
        g.fillRect(-S * 0.026, -S * 0.017, S * 0.052, S * 0.034);
        g.strokeStyle = 'rgba(96,76,50,0.40)';
        g.lineWidth = 1;
        g.strokeRect(-S * 0.026, -S * 0.017, S * 0.052, S * 0.034);
        g.restore();
      }
    }
    g.beginPath();
    g.arc(cx, cy, S * 0.055, 0, Math.PI * 2);
    g.fillStyle = '#D9B26F';
    g.fill();
    g.strokeStyle = '#7A5A36';
    g.lineWidth = 2;
    g.stroke();
    g.beginPath();
    for (var k = 0; k < 8; k += 1) {
      var aa = k / 8 * Math.PI * 2;
      var rr = k % 2 === 0 ? S * 0.048 : S * 0.026;
      var px = cx + Math.cos(aa) * rr;
      var py = cy + Math.sin(aa) * rr;
      if (k === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.closePath();
    g.fillStyle = '#F0D9A4';
    g.fill();
  }

  function buildTerrain() {
    var positions = [];
    var colors = [];
    var uvs = [];
    var indices = [];
    var c = new THREE.Color();
    var sample = new THREE.Color();
    var cols = COLS + 1;
    var rows = ROWS + 1;
    function sampleColor(vx, vy) {
      var r = 0;
      var g = 0;
      var b = 0;
      var n = 0;
      for (var oy = -1; oy <= 0; oy += 1) {
        for (var ox = -1; ox <= 0; ox += 1) {
          var tx = vx + ox;
          var ty = vy + oy;
          if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) continue;
          sample.set(TILE_COLORS[map.tiles[ty][tx]] || '#6FA85F');
          r += sample.r;
          g += sample.g;
          b += sample.b;
          n += 1;
        }
      }
      if (!n) return c.setRGB(0.4, 0.55, 0.35);
      return c.setRGB(r / n, g / n, b / n);
    }
    for (var vy = 0; vy < rows; vy += 1) {
      for (var vx = 0; vx < cols; vx += 1) {
        positions.push(vx * TILE, heightGrid[vy][vx], vy * TILE);
        sampleColor(vx, vy).convertSRGBToLinear();
        var n = 0.92 + hash(vx, vy) * 0.16;
        var tint = 1 + (hash(vx + 23, vy + 7) - 0.5) * 0.05;
        var macro = 1 + Math.sin(vx * 0.31 + vy * 0.17) * 0.05 +
          Math.sin(vx * 0.11 - vy * 0.23 + 1.7) * 0.04 +
          (hash(Math.floor(vx / 4) + 53, Math.floor(vy / 4) + 31) - 0.5) * 0.10;
        colors.push(c.r * n * tint * macro * 0.94, c.g * n * macro * 0.97, c.b * n / tint * 0.88);
        uvs.push(vx * TILE / 5, vy * TILE / 5);
      }
    }
    for (var ty = 0; ty < ROWS; ty += 1) {
      for (var tx = 0; tx < COLS; tx += 1) {
        var a = ty * cols + tx;
        var b2 = a + 1;
        var d = a + cols;
        var e = d + 1;
        indices.push(a, d, b2, b2, d, e);
      }
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    var mat = new THREE.MeshLambertMaterial({
      vertexColors: true,
      map: getWorldTexture('terrain-detail', drawTerrainDetail),
      flatShading: false
    });
    terrainMesh = new THREE.Mesh(geo, mat);
    terrainMesh.receiveShadow = false;
    scene.add(terrainMesh);
    buildPath();
  }

  function buildPath() {
    var paths = [
      [[20.5, 9.5], [20.5, 44.5]],
      [[13.5, 31.5], [20.5, 31.5]],
      [[20.5, 31.5], [32.5, 31.5]],
      [[32.5, 31.5], [32.5, 34.0]],
      [[20.5, 44.5], [27.5, 44.5]],
      [[20.5, 9.5], [20.5, 10.5]]
    ];
    var positions = [];
    var uvs = [];
    var indices = [];
    var vertexBase = 0;
    for (var p = 0; p < paths.length; p += 1) {
      var path = paths[p];
      var ax = path[0][0] * TILE;
      var az = path[0][1] * TILE;
      var bx = path[1][0] * TILE;
      var bz = path[1][1] * TILE;
      var dx = bx - ax;
      var dz = bz - az;
      var len = Math.sqrt(dx * dx + dz * dz);
      if (len < 0.1) continue;
      var nx = -dz / len;
      var nz = dx / len;
      var steps = Math.max(2, Math.ceil(len / 1.4));
      for (var s = 0; s <= steps; s += 1) {
        var t = s / steps;
        var cx = ax + dx * t;
        var cz = az + dz * t;
        var half = 1.82 + Math.sin(t * 9 + p * 2.3) * 0.09;
        var lx = cx + nx * half;
        var lz = cz + nz * half;
        var rx = cx - nx * half;
        var rz = cz - nz * half;
        positions.push(lx, terrainHeightAt(lx, lz) + 0.05, lz);
        positions.push(rx, terrainHeightAt(rx, rz) + 0.05, rz);
        uvs.push(0, t * len / 4);
        uvs.push(1, t * len / 4);
      }
      for (var s2 = 0; s2 < steps; s2 += 1) {
        var b0 = vertexBase + s2 * 2;
        indices.push(b0, b0 + 2, b0 + 1, b0 + 1, b0 + 2, b0 + 3);
      }
      vertexBase += (steps + 1) * 2;
    }
    if (!positions.length) return;
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    var mat = new THREE.MeshLambertMaterial({
      map: getWorldTexture('path', drawPathTexture),
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      side: THREE.DoubleSide
    });
    scene.add(new THREE.Mesh(geo, mat));

  }


  function drawWaterTexture(g, S) {
    g.fillStyle = '#C9E9E5';
    g.fillRect(0, 0, S, S);
    for (var i = 0; i < 24; i += 1) {
      var y = hash(i, 71) * S;
      g.strokeStyle = i % 2 ? 'rgba(255,255,255,0.28)' : 'rgba(66,137,148,0.20)';
      g.lineWidth = 1.2 + hash(i, 73) * 2;
      g.beginPath();
      for (var x = 0; x <= S; x += 12) {
        var yy = y + Math.sin(x * 0.05 + i) * 2.8;
        if (x === 0) g.moveTo(x, yy);
        else g.lineTo(x, yy);
      }
      g.stroke();
    }
  }

  function drawFoamTexture(g, S) {
    g.clearRect(0, 0, S, S);
    for (var i = 0; i < 46; i += 1) {
      var x = hash(i, 79) * S;
      var y = hash(i, 83) * S;
      var r = 1.5 + hash(i, 89) * 5;
      g.fillStyle = 'rgba(255,255,255,' + (0.22 + hash(i, 97) * 0.5) + ')';
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    }
    g.strokeStyle = 'rgba(255,255,255,0.65)';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(0, S * 0.42);
    for (var j = 0; j <= S; j += 8) g.lineTo(j, S * 0.42 + Math.sin(j * 0.08) * 4);
    g.stroke();
  }

  function drawShadowTexture(g, S) {
    g.clearRect(0, 0, S, S);
    var grad = g.createRadialGradient(S / 2, S / 2, 4, S / 2, S / 2, S / 2);
    grad.addColorStop(0, 'rgba(24,36,24,0.44)');
    grad.addColorStop(0.55, 'rgba(24,36,24,0.24)');
    grad.addColorStop(1, 'rgba(24,36,24,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, S, S);
  }

  function drawSunTexture(g, S) {
    g.clearRect(0, 0, S, S);
    var grad = g.createRadialGradient(S / 2, S / 2, 2, S / 2, S / 2, S / 2);
    grad.addColorStop(0, 'rgba(255,250,220,0.95)');
    grad.addColorStop(0.22, 'rgba(255,235,170,0.55)');
    grad.addColorStop(1, 'rgba(255,220,140,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, S, S);
  }

  function buildWater() {
    var waterTex = getWorldTexture('water', drawWaterTexture);
    waterTex.repeat.set(22, 22);
    var geo = new THREE.PlaneBufferGeometry(260, 260, 1, 1);
    var mat = new THREE.MeshPhongMaterial({
      color: sRGB(0x2F7F9E),
      map: waterTex,
      transparent: true,
      opacity: 0.86,
      shininess: 110,
      specular: sRGB(0xD8F3F0),
      depthWrite: false,
      side: THREE.DoubleSide
    });
    waterMesh = new THREE.Mesh(geo, mat);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.y = WATER_Y;
    scene.add(waterMesh);

    var foamTex = getWorldTexture('foam', drawFoamTexture);
    var foamMat = new THREE.MeshBasicMaterial({
      map: foamTex,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      side: THREE.DoubleSide,
      color: sRGB(0xE8FAF4)
    });
    var islandFoam = new THREE.Mesh(new THREE.RingBufferGeometry(1, 1.045, 96), foamMat);
    islandFoam.rotation.x = -Math.PI / 2;
    islandFoam.scale.set(COLS * TILE * 0.465, ROWS * TILE * 0.465, 1);
    islandFoam.position.set(COLS * TILE / 2, WATER_Y + 0.02, ROWS * TILE / 2);
    scene.add(islandFoam);
    var pondFoam = new THREE.Mesh(new THREE.RingBufferGeometry(1, 1.08, 48), foamMat);
    pondFoam.rotation.x = -Math.PI / 2;
    pondFoam.scale.set(7.8, 7.8, 1);
    pondFoam.position.set(9 * TILE, WATER_Y + 0.025, 15 * TILE);
    scene.add(pondFoam);
  }

  function buildSky() {
    scene.background = sRGB(0xA7C6D2);
    scene.fog = new THREE.Fog(sRGB(0xC9D8D2), 48, 145);
    var skyCanvas = document.createElement('canvas');
    skyCanvas.width = 4;
    skyCanvas.height = 512;
    var sg = skyCanvas.getContext('2d');
    if (sg) {
      var grad = sg.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, '#3D6F92');
      grad.addColorStop(0.35, '#78A8BE');
      grad.addColorStop(0.62, '#C6D3C9');
      grad.addColorStop(0.82, '#E9D6B2');
      grad.addColorStop(1, '#F3DEB6');
      sg.fillStyle = grad;
      sg.fillRect(0, 0, 4, 512);
    }
    var skyTex = new THREE.Texture();
    skyTex.image = skyCanvas;
    skyTex.encoding = THREE.sRGBEncoding;
    skyTex.needsUpdate = true;
    var skyDome = new THREE.Mesh(
      new THREE.SphereBufferGeometry(215, 24, 16),
      new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false, depthWrite: false })
    );
    scene.add(skyDome);

    var hemi = new THREE.HemisphereLight(0xC9E2EE, 0x4A5C3E, 0.5);
    scene.add(hemi);
    var sunLight = new THREE.DirectionalLight(0xFFE6C2, 0.82);
    sunLight.position.set(30, 50, 20);
    scene.add(sunLight);
    var fillLight = new THREE.DirectionalLight(0xA8C8E8, 0.22);
    fillLight.position.set(-35, 28, -25);
    scene.add(fillLight);

    var sunGeo = new THREE.SphereBufferGeometry(3, 16, 12);
    var sunMat = new THREE.MeshBasicMaterial({ color: sRGB(0xFFF0B8), fog: false });
    sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(42, 46, -34);
    scene.add(sunMesh);
    var glowTex = getWorldTexture('sun-glow', drawSunTexture);
    var glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex,
      color: sRGB(0xFFF0C0),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false
    }));
    glow.position.copy(sunMesh.position);
    glow.scale.set(30, 30, 1);
    scene.add(glow);

    var cloudParts = [
      [0, 0, 0, 3.2], [2.8, 0.4, 0.4, 2.2], [-2.6, 0.2, 0.2, 2.4], [1.2, 1.0, -0.4, 1.8]
    ];
    for (var i = 0; i < 5; i += 1) {
      var parts = [];
      for (var k = 0; k < cloudParts.length; k += 1) {
        var cp = cloudParts[k];
        parts.push(sphere(cp[3], 8, '#FFF8EA', cp[0], cp[1], cp[2], 1.2, 0.55, 1));
      }
      var cloud = makeMergedMesh(parts, { transparent: true, opacity: 0.72, fog: false });
      cloud.position.set(-34 + i * 20, 18 + (i % 2) * 3, -40 - (i % 3) * 12);
      cloud.scale.setScalar(1.5 + (i % 3) * 0.3);
      scene.add(cloud);
      clouds.push(cloud);
    }
  }

  /* ---------------- 建筑 ---------------- */
  function buildShrine(b) {
    var parts = [
      box(9, 0.3, 7, '#8A8F98', 0, 0.15, 0),
      box(7, 0.2, 2, '#9AA0A8', 0, 0.1, 3.2),
      cyl(0.35, 0.45, 4, 8, '#7A5A4A', -3.2, 2.2, 0),
      cyl(0.35, 0.45, 4, 8, '#7A5A4A', 3.2, 2.2, 0),
      box(8.6, 0.5, 0.7, '#5A4A3A', 0, 4.4, 0),
      box(7, 0.35, 0.5, '#8A8F98', 0, 3.75, 0),
      box(2.2, 0.25, 0.4, '#F2C94C', 0, 3.3, 0),
      box(1.2, 0.12, 5.8, '#A97142', 0, 0.31, 0)
    ];
    var mesh = makeMergedMesh(parts);
    mesh.position.set(b.centerX, terrainHeightAt(b.centerX, b.centerZ), b.centerZ);
    scene.add(mesh);
    buildingMeshes.push(mesh);
    var rune = new THREE.Mesh(
      new THREE.OctahedronBufferGeometry(0.55, 0),
      new THREE.MeshBasicMaterial({ color: sRGB(0xF2C94C) })
    );
    rune.position.set(b.centerX, terrainHeightAt(b.centerX, b.centerZ) + 2.7, b.centerZ);
    scene.add(rune);
    b.rune = rune;
    b.labelY = 5.8;
  }

  function buildShop(b) {
    var parts = [
      box(9, 0.8, 2.6, '#C98A5A', 0, 0.4, 1.4),
      box(0.35, 3.2, 0.35, '#A97142', -4.2, 1.6, 0.4),
      box(0.35, 3.2, 0.35, '#A97142', 4.2, 1.6, 0.4),
      box(9.4, 0.16, 3.4, '#F26B3F', 0, 3.3, 0.2),
      box(1.45, 0.18, 3.4, '#FFF3E6', -3.5, 3.28, 0.2),
      box(1.45, 0.18, 3.4, '#F26B3F', -1.75, 3.28, 0.2),
      box(1.45, 0.18, 3.4, '#FFF3E6', 0, 3.28, 0.2),
      box(1.45, 0.18, 3.4, '#F26B3F', 1.75, 3.28, 0.2),
      box(1.45, 0.18, 3.4, '#FFF3E6', 3.5, 3.28, 0.2),
      box(0.9, 0.9, 0.9, '#A97142', -3.5, 0.45, 2.8),
      box(0.8, 0.7, 0.8, '#C98A5A', -2.4, 0.35, 2.9),
      box(0.8, 0.7, 0.8, '#C98A5A', 3.4, 0.35, 2.9),
      box(2.2, 0.8, 0.15, '#FFF9E9', 0, 2.1, 3.5)
    ];
    var mesh = makeMergedMesh(parts);
    mesh.position.set(b.centerX, terrainHeightAt(b.centerX, b.centerZ), b.centerZ);
    scene.add(mesh);
    buildingMeshes.push(mesh);
    b.labelY = 4.6;
  }

  function buildHouse(b) {
    var parts = [
      box(9, 3.2, 7, '#D9B382', 0, 1.6, 0),
      cone(6.9, 2.4, 4, '#C96A4A', 0, 4.3, 0, Math.PI / 4),
      box(1.7, 2.3, 0.2, '#8A5A2B', 0, 1.15, 3.55),
      box(1.5, 1.3, 0.2, '#8ED8F8', -2.7, 1.9, 3.55),
      box(1.5, 1.3, 0.2, '#8ED8F8', 2.7, 1.9, 3.55),
      box(0.9, 2.2, 0.9, '#9AA0A8', 2.9, 4.5, -1.5),
      box(1.2, 0.15, 1.2, '#6B7280', 2.9, 5.65, -1.5),
      box(0.4, 0.4, 0.4, '#F2C94C', 0.85, 1.1, 3.66)
    ];
    var mesh = makeMergedMesh(parts);
    mesh.position.set(b.centerX, terrainHeightAt(b.centerX, b.centerZ), b.centerZ);
    scene.add(mesh);
    buildingMeshes.push(mesh);
    b.labelY = 6.4;
  }

  function buildFarm(b) {
    var parts = [];
    var halfW = b.w * TILE / 2;
    var halfH = b.h * TILE / 2;
    var postColor = '#A97142';
    var railColor = '#8A5A2B';
    var gapZ1 = -2.2;
    var gapZ2 = 2.2;
    for (var px = -halfW + 0.5; px <= halfW - 0.5; px += 2) {
      parts.push(box(0.22, 1.3, 0.22, postColor, px, 0.65, -halfH + 0.5));
      parts.push(box(0.22, 1.3, 0.22, postColor, px, 0.65, halfH - 0.5));
    }
    for (var pz = -halfH + 0.5; pz <= halfH - 0.5; pz += 2) {
      parts.push(box(0.22, 1.3, 0.22, postColor, -halfW + 0.5, 0.65, pz));
      if (pz < gapZ1 || pz > gapZ2) parts.push(box(0.22, 1.3, 0.22, postColor, halfW - 0.5, 0.65, pz));
    }
    parts.push(box(halfW * 2 - 1, 0.14, 0.14, railColor, 0, 0.55, -halfH + 0.5));
    parts.push(box(halfW * 2 - 1, 0.14, 0.14, railColor, 0, 0.95, -halfH + 0.5));
    parts.push(box(halfW * 2 - 1, 0.14, 0.14, railColor, 0, 0.55, halfH - 0.5));
    parts.push(box(halfW * 2 - 1, 0.14, 0.14, railColor, 0, 0.95, halfH - 0.5));
    parts.push(box(0.14, 0.14, halfH * 2 - 1, railColor, -halfW + 0.5, 0.55, 0));
    parts.push(box(0.14, 0.14, halfH * 2 - 1, railColor, -halfW + 0.5, 0.95, 0));
    var gapCenter = (gapZ1 + gapZ2) / 2;
    parts.push(box(0.14, 0.14, gapZ1 + halfH - 0.5, railColor, halfW - 0.5, 0.55, (-halfH + 0.5 + gapZ1) / 2));
    parts.push(box(0.14, 0.14, halfH - 0.5 - gapZ2, railColor, halfW - 0.5, 0.55, (gapZ2 + halfH - 0.5) / 2));

    for (var i = 0; i < W.farmPlots.length; i += 1) {
      var p = W.farmPlots[i];
      var cx = (p.x + p.w / 2) * TILE - b.centerX;
      var cz = (p.y + p.h / 2) * TILE - b.centerZ;
      parts.push(box(p.w * TILE - 0.3, 0.16, p.h * TILE - 0.3, '#8A5A2B', cx, 0.08, cz));
      parts.push(box(p.w * TILE - 0.6, 0.03, 0.12, '#6B4426', cx, 0.17, cz - 1.1));
      parts.push(box(p.w * TILE - 0.6, 0.03, 0.12, '#6B4426', cx, 0.17, cz));
      parts.push(box(p.w * TILE - 0.6, 0.03, 0.12, '#6B4426', cx, 0.17, cz + 1.1));
    }

    parts.push(cyl(0.12, 0.16, 2.4, 6, '#8A5A2B', halfW - 1.6, 1.2, -halfH + 2.4));
    parts.push(sphere(0.42, 8, '#F2DFC0', halfW - 1.6, 2.4, -halfH + 2.4));
    parts.push(cone(0.6, 0.5, 6, '#C98A5A', halfW - 1.6, 2.9, -halfH + 2.4));
    parts.push(box(1.4, 0.12, 0.12, '#8A5A2B', halfW - 1.6, 1.7, -halfH + 2.4));

    var mesh = makeMergedMesh(parts);
    mesh.position.set(b.centerX, terrainHeightAt(b.centerX, b.centerZ), b.centerZ);
    scene.add(mesh);
    buildingMeshes.push(mesh);
    b.labelY = 3.6;
  }

  function makeTextSprite(text, opts) {
    opts = opts || {};
    var canvasEl = document.createElement('canvas');
    canvasEl.width = 512;
    canvasEl.height = 128;
    var g = canvasEl.getContext('2d');
    if (!g) return null;
    g.clearRect(0, 0, 512, 128);
    g.font = 'bold 42px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
    var tw = g.measureText(text).width;
    var w = Math.min(500, tw + 70);
    var x = (512 - w) / 2;
    var y = 18;
    var h = 92;
    var r = 30;
    g.beginPath();
    g.moveTo(x + r, y);
    g.lineTo(x + w - r, y);
    g.quadraticCurveTo(x + w, y, x + w, y + r);
    g.lineTo(x + w, y + h - r);
    g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    g.lineTo(x + r, y + h);
    g.quadraticCurveTo(x, y + h, x, y + h - r);
    g.lineTo(x, y + r);
    g.quadraticCurveTo(x, y, x + r, y);
    g.closePath();
    g.fillStyle = opts.bg || 'rgba(255,255,255,0.92)';
    g.fill();
    if (opts.stroke) {
      g.strokeStyle = opts.stroke;
      g.lineWidth = 6;
      g.stroke();
    }
    g.fillStyle = opts.color || '#3A3028';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, 256, y + h / 2);
    var tex = new THREE.CanvasTexture(canvasEl);
    tex.minFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    var mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthTest: opts.depthTest !== false,
      depthWrite: false
    });
    var sprite = new THREE.Sprite(mat);
    sprite.scale.set(opts.scaleX || 3.4, opts.scaleY || 0.85, 1);
    sprite.renderOrder = opts.renderOrder || 5;
    return sprite;
  }

  function buildingUnlocked(type) {
    if (type === 'shrine') return true;
    return !!(window.Core && window.Core.isUnlocked(type));
  }

  function buildLockedPlot(b) {
    var parts = [];
    var halfW = b.w * TILE / 2;
    var halfH = b.h * TILE / 2;
    var inset = 0.9;
    var post = '#A98B62';
    var rope = '#D9C49C';
    var corners = [
      [-halfW + inset, -halfH + inset], [halfW - inset, -halfH + inset],
      [halfW - inset, halfH - inset], [-halfW + inset, halfH - inset]
    ];
    for (var c = 0; c < corners.length; c += 1) {
      parts.push(box(0.26, 1.5, 0.26, post, corners[c][0], 0.75, corners[c][1]));
      parts.push(box(0.44, 0.12, 0.44, '#8A6A46', corners[c][0], 1.52, corners[c][1]));
    }
    for (var e = 0; e < 4; e += 1) {
      var a = corners[e];
      var d = corners[(e + 1) % 4];
      var mx = (a[0] + d[0]) / 2;
      var mz = (a[1] + d[1]) / 2;
      var lenX = Math.abs(d[0] - a[0]);
      var lenZ = Math.abs(d[1] - a[1]);
      if (lenX > 0.1) parts.push(box(lenX, 0.06, 0.06, rope, mx, 1.34, a[1]));
      if (lenZ > 0.1) parts.push(box(0.06, 0.06, lenZ, rope, a[0], 1.34, mz));
    }
    parts.push(box(3.1, 0.12, 1.7, '#B9A47E', 0, 0.06, 0));
    parts.push(cyl(0.09, 0.12, 2.2, 6, '#7A5A3A', 0, 1.1, 0));
    parts.push(box(2.0, 0.9, 0.12, '#E7D6B2', 0, 2.05, 0));
    parts.push(box(2.2, 0.12, 0.2, '#8A6A46', 0, 2.5, 0));
    parts.push(box(1.5, 0.07, 0.06, '#B57A3E', 0, 2.04, -0.07));
    parts.push(box(1.5, 0.07, 0.06, '#B57A3E', 0, 1.92, -0.07));
    parts.push(box(1.5, 0.07, 0.06, '#B57A3E', 0, 1.8, -0.07));
    var mesh = makeMergedMesh(parts);
    mesh.position.set(b.centerX, terrainHeightAt(b.centerX, b.centerZ), b.centerZ);
    scene.add(mesh);
    buildingMeshes.push(mesh);
    b.labelY = 3.6;
  }

  function buildBuildingLabels() {
    for (var i = 0; i < map.buildings.length; i += 1) {
      var b = map.buildings[i];
      b.locked = !buildingUnlocked(b.type);
      var sprite;
      if (b.locked) {
        sprite = makeTextSprite(b.name + ' · 可建设', {
          bg: 'rgba(16,22,28,0.90)', color: '#EAD9B4', stroke: '#7A5A32', scaleX: 4.0, scaleY: 0.9
        });
      } else {
        var shrineLabel = b.type === 'shrine';
        sprite = makeTextSprite(b.name, {
          bg: 'rgba(255,250,238,0.94)', color: '#3A3028', stroke: '#A97142',
          scaleX: shrineLabel ? 4.4 : 3.2, scaleY: shrineLabel ? 1.05 : 0.8
        });
      }
      if (!sprite) continue;
      sprite.position.set(b.centerX, terrainHeightAt(b.centerX, b.centerZ) + b.labelY, b.centerZ);
      scene.add(sprite);
      b.labelSprite = sprite;
      buildingLabels.push(sprite);
    }
  }

  function buildBuildings() {
    for (var i = 0; i < map.buildings.length; i += 1) {
      var b = map.buildings[i];
      var unlocked = buildingUnlocked(b.type);
      b.locked = !unlocked;
      if (b.type === 'shrine') buildShrine(b);
      else if (!unlocked) buildLockedPlot(b);
      else if (b.type === 'shop') buildShop(b);
      else if (b.type === 'house') buildHouse(b);
      else if (b.type === 'farm') buildFarm(b);
    }
    buildBuildingLabels();
  }

  function refreshBuildings() {
    if (!initialized || !scene) return;
    var i;
    for (i = 0; i < buildingMeshes.length; i += 1) {
      var mesh = buildingMeshes[i];
      scene.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        if (mesh.material.map) mesh.material.map.dispose();
        mesh.material.dispose();
      }
    }
    buildingMeshes.length = 0;
    for (i = 0; i < buildingLabels.length; i += 1) {
      var label = buildingLabels[i];
      scene.remove(label);
      if (label.material) {
        if (label.material.map) label.material.map.dispose();
        label.material.dispose();
      }
    }
    buildingLabels.length = 0;
    for (i = 0; i < map.buildings.length; i += 1) {
      var b = map.buildings[i];
      if (b.rune) {
        scene.remove(b.rune);
        if (b.rune.material) b.rune.material.dispose();
        if (b.rune.geometry) b.rune.geometry.dispose();
        b.rune = null;
      }
      b.labelSprite = null;
    }
    buildBuildings();
    updateNearby();
    drawMinimap();
  }

  /* ---------------- 场景物件 ---------------- */
  var SCENERY_VARIANT = {
    tree1: 'treeA', tree2: 'treeA', tree3: 'treeB', pine: 'treeB',
    long: 'treeA', round: 'treeA', round2: 'treeB', palm: 'treeC',
    bush1: 'bush', bush3: 'bush', bush4: 'bush', hedge: 'bush',
    rock: 'rock', flower: 'flower', grass: 'grass', mushroom: 'mushroom',
    fern: 'fern', reed: 'reed', log: 'log', stump: 'stump', pebble: 'pebble',
    lantern: 'lantern', bench: 'bench', stoneMarker: 'stoneMarker'
  };
  var SHADOW_SIZE = {
    treeA: 2.8, treeB: 2.3, treeC: 2.2, bush: 1.3, rock: 1.5, log: 1.5,
    stump: 1.1, bench: 1.2, lantern: 0.55, stoneMarker: 0.6, fern: 0.55,
    reed: 0.45, grass: 0.62, flower: 0.48, mushroom: 0.36, pebble: 0.30
  };
  var sceneryGeometries = {};

  function drawGrassTuft(g, S) {
    g.clearRect(0, 0, S, S);
    var baseY = S * 0.97;
    var dark = ['#2E5532', '#386339', '#416F3D', '#4C7C43'];
    var mid = ['#588C4A', '#659B51', '#72A85A', '#80B463'];
    var light = ['#8FC273', '#9CCF80', '#ACD98D'];
    var i;
    var shadow = g.createRadialGradient(S * 0.5, baseY, 1, S * 0.5, baseY, S * 0.40);
    shadow.addColorStop(0, 'rgba(28,42,24,0.28)');
    shadow.addColorStop(1, 'rgba(28,42,24,0)');
    g.fillStyle = shadow;
    g.beginPath();
    g.ellipse(S * 0.5, baseY, S * 0.39, S * 0.10, 0, 0, Math.PI * 2);
    g.fill();
    // back layer: darker, shorter blades
    for (i = 0; i < 26; i += 1) {
      var bx = S * 0.5 + (hash(i, 301) - 0.5) * S * 0.76;
      var bh = S * (0.26 + hash(i, 303) * 0.44);
      var bl = (hash(i, 305) - 0.5) * S * 0.34;
      var bw = 3.0 + hash(i, 307) * 3.6;
      g.beginPath();
      g.moveTo(bx - bw, baseY);
      g.quadraticCurveTo(bx + bl * 0.25, baseY - bh * 0.58, bx + bl, baseY - bh);
      g.quadraticCurveTo(bx + bl * 0.2 + bw, baseY - bh * 0.5, bx + bw, baseY);
      g.closePath();
      g.fillStyle = dark[i % dark.length];
      g.globalAlpha = 0.68 + hash(i, 309) * 0.24;
      g.fill();
    }
    // main layer: blades fanning out naturally
    for (i = 0; i < 42; i += 1) {
      var mx = S * 0.5 + (hash(i, 311) - 0.5) * S * 0.68;
      var mh = S * (0.38 + hash(i, 313) * 0.47);
      var ml = (hash(i, 317) - 0.5) * S * 0.44;
      var mw = 2.6 + hash(i, 319) * 3.6;
      g.beginPath();
      g.moveTo(mx - mw, baseY);
      g.bezierCurveTo(mx - mw * 0.4, baseY - mh * 0.35, mx + ml * 0.55, baseY - mh * 0.72, mx + ml, baseY - mh);
      g.bezierCurveTo(mx + ml * 0.5 + mw * 0.3, baseY - mh * 0.60, mx + mw * 0.6, baseY - mh * 0.28, mx + mw, baseY);
      g.closePath();
      g.fillStyle = mid[i % mid.length];
      g.globalAlpha = 0.82 + hash(i, 321) * 0.18;
      g.fill();
    }
    // front highlight blades
    for (i = 0; i < 14; i += 1) {
      var fx = S * 0.5 + (hash(i, 323) - 0.5) * S * 0.55;
      var fh = S * (0.25 + hash(i, 327) * 0.38);
      var fl = (hash(i, 329) - 0.5) * S * 0.32;
      g.strokeStyle = light[i % light.length];
      g.globalAlpha = 0.55 + hash(i, 331) * 0.3;
      g.lineWidth = 1.4 + hash(i, 337) * 1.4;
      g.beginPath();
      g.moveTo(fx, baseY - 2);
      g.quadraticCurveTo(fx + fl * 0.3, baseY - fh * 0.6, fx + fl, baseY - fh);
      g.stroke();
    }
    // seed heads
    for (i = 0; i < 6; i += 1) {
      var sx = S * 0.5 + (hash(i, 339) - 0.5) * S * 0.48;
      var sh = S * (0.48 + hash(i, 341) * 0.34);
      var sl = (hash(i, 343) - 0.5) * S * 0.22;
      g.strokeStyle = 'rgba(126,148,86,0.80)';
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(sx, baseY - 4);
      g.quadraticCurveTo(sx + sl * 0.4, baseY - sh * 0.65, sx + sl, baseY - sh);
      g.stroke();
      g.fillStyle = 'rgba(176,178,112,0.82)';
      g.beginPath();
      g.ellipse(sx + sl, baseY - sh - 2, 2.4, 5.2, sl * 0.01, 0, Math.PI * 2);
      g.fill();
    }
    // broad ground-hugging leaves hide the stalky base
    for (i = 0; i < 14; i += 1) {
      var gx2 = S * 0.5 + (hash(i, 357) - 0.5) * S * 0.64;
      var gy2 = baseY - 2;
      var gw = 10 + hash(i, 359) * 18;
      var gl = (hash(i, 361) - 0.5) * 0.9;
      g.fillStyle = i % 2 === 0 ? 'rgba(63,103,53,0.92)' : 'rgba(79,122,62,0.88)';
      g.beginPath();
      g.ellipse(gx2, gy2 - 3, gw * 0.5, 3.2 + hash(i, 367) * 2.6, gl, 0, Math.PI * 2);
      g.fill();
    }
    // a few dry blades for natural variation
    for (i = 0; i < 5; i += 1) {
      var dx = S * 0.5 + (hash(i, 347) - 0.5) * S * 0.62;
      var dh = S * (0.18 + hash(i, 349) * 0.28);
      var dl = (hash(i, 353) - 0.5) * S * 0.30;
      g.strokeStyle = 'rgba(166,146,86,0.60)';
      g.lineWidth = 1.3;
      g.beginPath();
      g.moveTo(dx, baseY - 2);
      g.quadraticCurveTo(dx + dl * 0.5, baseY - dh * 0.7, dx + dl, baseY - dh);
      g.stroke();
    }
    g.globalAlpha = 1;
  }

  function crossGrassGeometry() {
    var planes = [
      new THREE.PlaneBufferGeometry(1.78, 1.14),
      new THREE.PlaneBufferGeometry(1.78, 1.14),
      new THREE.PlaneBufferGeometry(1.78, 1.14),
      new THREE.PlaneBufferGeometry(1.78, 1.14)
    ];
    planes[1].rotateY(Math.PI / 4);
    planes[2].rotateY(Math.PI / 2);
    planes[3].rotateY(Math.PI * 3 / 4);
    var positions = [];
    var uvs = [];
    var indices = [];
    var offset = 0;
    for (var p = 0; p < planes.length; p += 1) {
      var g = planes[p];
      g.translate(0, 0.56, 0);
      var pos = g.attributes.position.array;
      var uv = g.attributes.uv.array;
      var idx = g.index.array;
      for (var i = 0; i < pos.length; i += 1) positions.push(pos[i]);
      for (var u = 0; u < uv.length; u += 1) uvs.push(uv[u]);
      for (var k = 0; k < idx.length; k += 1) indices.push(idx[k] + offset);
      offset += pos.length / 3;
      g.dispose();
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  function buildSceneryGeometry(variant) {
    if (sceneryGeometries[variant]) return sceneryGeometries[variant];
    var parts = [];
    var leaf = ['#3F6F4A', '#4F8A55', '#5F9A5D', '#76B06A', '#8CC47A'];
    var wood = '#7A5235';
    if (variant === 'grass') {
      var grassGeo = crossGrassGeometry();
      sceneryGeometries[variant] = grassGeo;
      return grassGeo;
    }
    if (variant === 'treeA') {
      parts.push(cyl(0.22, 0.42, 2.9, 8, wood, 0, 1.45, 0));
      parts.push(cyl(0.09, 0.17, 1.5, 5, wood, -0.38, 2.55, 0.08, 0, 0, -0.52));
      parts.push(cyl(0.08, 0.15, 1.4, 5, wood, 0.40, 2.45, -0.08, 0, 0, 0.58));
      parts.push(cyl(0.05, 0.10, 1.0, 4, wood, 0.12, 3.15, 0.34, 0.55, 0, 0.2));
      parts.push(cone(0.28, 0.7, 5, wood, -0.55, 0.17, 0.12, 0.5));
      parts.push(cone(0.24, 0.6, 5, wood, 0.50, 0.15, -0.10, -0.4));
      parts.push(cone(0.20, 0.5, 5, wood, 0.06, 0.14, 0.45, 0.15));
      var canopy = [
        [0, 4.05, 0, 1.32, 1.16, 1.28, 2],
        [-1.08, 3.58, 0.32, 1.05, 0.92, 1.00, 2],
        [1.06, 3.62, -0.24, 1.08, 0.95, 1.04, 1],
        [0.18, 4.68, 0.08, 0.95, 0.84, 0.92, 1],
        [-0.62, 4.42, -0.48, 0.80, 0.72, 0.76, 1],
        [0.70, 4.46, 0.45, 0.78, 0.70, 0.74, 1],
        [-1.38, 4.14, -0.12, 0.70, 0.64, 0.68, 1],
        [1.34, 4.08, 0.20, 0.72, 0.66, 0.68, 1],
        [0.02, 3.42, 0.84, 0.75, 0.64, 0.70, 0],
        [0.02, 3.38, -0.88, 0.80, 0.66, 0.72, 0],
        [-0.42, 3.16, -0.30, 0.70, 0.56, 0.62, 0],
        [0.90, 3.90, 0.42, 0.66, 0.58, 0.64, 1],
        [-0.94, 4.75, 0.26, 0.58, 0.52, 0.56, 0],
        [0.38, 5.02, -0.20, 0.54, 0.48, 0.52, 0],
        [-0.20, 4.90, 0.52, 0.50, 0.44, 0.48, 0]
      ];
      for (var i = 0; i < canopy.length; i += 1) {
        var c = canopy[i];
        parts.push(part(
          new THREE.IcosahedronBufferGeometry(1, c[6] || 1),
          leaf[(i % 3) + (c[6] ? 2 : 0)],
          c[0], c[1], c[2],
          (hash(i, 401) - 0.5) * 0.35,
          hash(i, 403) * Math.PI,
          (hash(i, 407) - 0.5) * 0.35,
          c[3], c[4], c[5]
        ));
      }
      // smaller outer clumps break the silhouette
      for (var e = 0; e < 20; e += 1) {
        var ea = e / 20 * Math.PI * 2 + 0.3;
        var er = 1.15 + hash(e, 411) * 0.48;
        parts.push(part(
          new THREE.IcosahedronBufferGeometry(0.38 + hash(e, 413) * 0.22, 0),
          leaf[1 + (e % 4)],
          Math.cos(ea) * er, 3.55 + hash(e, 417) * 1.15, Math.sin(ea) * er,
          0, ea, 0.3, 1.05, 0.85, 0.95
        ));
      }
      // bright leaf sprays on top
      for (var l = 0; l < 9; l += 1) {
        var la = hash(l, 419) * Math.PI * 2;
        var lr = 0.4 + hash(l, 421) * 1.05;
        parts.push(part(
          new THREE.IcosahedronBufferGeometry(0.26 + hash(l, 423) * 0.12, 0),
          leaf[4],
          Math.cos(la) * lr, 4.35 + hash(l, 427) * 0.7, Math.sin(la) * lr,
          0.4, la, 0, 1.3, 0.38, 0.9
        ));
      }
      parts.push(sphere(0.10, 5, '#E8B45A', 0.95, 3.85, 0.58));
      parts.push(sphere(0.09, 5, '#E8B45A', -0.80, 4.0, -0.32));
      parts.push(sphere(0.08, 5, '#D96A7A', 0.40, 4.55, 0.68));
      parts.push(sphere(0.07, 5, '#D96A7A', -1.1, 3.7, 0.55));
    } else if (variant === 'treeB') {
      parts.push(cyl(0.18, 0.34, 3.5, 7, '#6B4A33', 0, 1.75, 0));
      parts.push(cone(0.46, 0.8, 6, '#5A3E2A', 0, 0.28, 0, 0.4));
      for (var pn = 0; pn < 9; pn += 1) {
        var py = 1.55 + pn * 0.48;
        var pr = 1.90 - pn * 0.165 + Math.sin(pn * 1.7) * 0.07;
        var pc = leaf[Math.min(leaf.length - 1, 1 + (pn % 4))];
        parts.push(part(
          new THREE.ConeBufferGeometry(pr, 1.28 + pn * 0.03, 8),
          pc, 0.03 * Math.sin(pn * 2.1), py, 0.03 * Math.cos(pn * 1.3),
          0, pn * 0.7, 0,
          1.0, 1.0, 0.93
        ));
        if (pn < 5) {
          var ba = pn * 1.3 + 0.4;
          parts.push(part(
            new THREE.ConeBufferGeometry(0.30, 1.1, 5),
            leaf[0], Math.cos(ba) * (pr * 0.72), py - 0.18, Math.sin(ba) * (pr * 0.72),
            0.55, -ba, 0
          ));
        }
      }
      parts.push(cone(0.42, 1.1, 6, leaf[4], 0, 5.85, 0));
      parts.push(sphere(0.11, 5, '#E8B45A', 0.9, 4.2, 0.45));
    } else if (variant === 'treeC') {
      parts.push(cyl(0.20, 0.34, 1.9, 6, '#9A7A52', 0, 0.95, 0, 0, 0, 0.14));
      parts.push(cyl(0.16, 0.24, 1.6, 6, '#9A7A52', 0.16, 2.18, 0, 0, 0, 0.27));
      parts.push(cyl(0.12, 0.18, 1.5, 6, '#9A7A52', 0.44, 3.28, 0, 0, 0, 0.40));
      parts.push(cyl(0.09, 0.14, 1.1, 5, '#9A7A52', 0.72, 4.15, 0, 0, 0, 0.50));
      var crownX = 0.82;
      var crownY = 4.52;
      for (var f = 0; f < 10; f += 1) {
        var fa = f / 10 * Math.PI * 2 + 0.12;
        var reach = 1.35 + (f % 3) * 0.14;
        for (var seg = 0; seg < 4; seg += 1) {
          var sr = 0.34 + seg * 0.31;
          var sy = crownY - seg * seg * 0.10;
          var skin = leaf[1 + ((f + seg) % 4)];
          parts.push(part(
            new THREE.IcosahedronBufferGeometry(1, 0),
            skin,
            crownX + Math.cos(fa) * sr, sy, Math.sin(fa) * sr,
            0, -fa, -0.40 - seg * 0.08,
            0.42 + seg * 0.10, 0.075, 0.16 - seg * 0.02
          ));
          parts.push(part(
            new THREE.IcosahedronBufferGeometry(1, 0),
            skin,
            crownX + Math.cos(fa + 0.12) * (sr + 0.1), sy - 0.12, Math.sin(fa + 0.12) * (sr + 0.1),
            0, -fa, -0.55,
            0.30, 0.06, 0.13
          ));
        }
        parts.push(part(
          new THREE.ConeBufferGeometry(0.11, 0.55, 4),
          leaf[2],
          crownX + Math.cos(fa) * reach, crownY - 0.62, Math.sin(fa) * reach,
          Math.PI / 2.3, -fa, 0
        ));
      }
      parts.push(sphere(0.20, 7, '#6B4A28', crownX + 0.24, crownY - 0.32, 0.18));
      parts.push(sphere(0.18, 7, '#5A3E22', crownX - 0.18, crownY - 0.38, -0.12));
      parts.push(sphere(0.16, 7, '#7A5530', crownX + 0.02, crownY - 0.30, -0.30));
    } else if (variant === 'bush') {
      var bush = [
        [0, 0.58, 0, 0.78, 0.60, 0.70, 1],
        [0.52, 0.44, 0.12, 0.58, 0.46, 0.54, 0],
        [-0.46, 0.42, -0.10, 0.54, 0.42, 0.50, 0],
        [0.10, 0.94, 0.02, 0.50, 0.38, 0.46, 0],
        [0.72, 0.78, -0.14, 0.42, 0.34, 0.40, 1],
        [-0.68, 0.72, 0.16, 0.40, 0.32, 0.38, 1],
        [0.32, 0.36, 0.44, 0.38, 0.30, 0.36, 0],
        [-0.22, 0.32, -0.44, 0.36, 0.28, 0.34, 1]
      ];
      for (var b = 0; b < bush.length; b += 1) {
        var bb = bush[b];
        parts.push(part(
          new THREE.IcosahedronBufferGeometry(1, bb[6] ? 1 : 0),
          leaf[(b % 4) + (bb[6] ? 1 : 0)],
          bb[0], bb[1], bb[2],
          (hash(b, 431) - 0.5) * 0.3, b, 0.2,
          bb[3], bb[4], bb[5]
        ));
      }
      for (var bl = 0; bl < 8; bl += 1) {
        var ba2 = bl / 8 * Math.PI * 2;
        parts.push(part(
          new THREE.IcosahedronBufferGeometry(0.22, 0),
          leaf[4],
          Math.cos(ba2) * 0.62, 0.80 + hash(bl, 433) * 0.20, Math.sin(ba2) * 0.55,
          0.5, ba2, 0, 1.4, 0.35, 0.8
        ));
      }
      parts.push(sphere(0.08, 5, '#D96A7A', 0.30, 0.78, 0.25));
      parts.push(sphere(0.07, 5, '#D96A7A', -0.22, 0.72, 0.33));
      parts.push(sphere(0.07, 5, '#F2C94C', 0.44, 0.64, -0.16));
      parts.push(sphere(0.06, 5, '#F7F1E0', -0.5, 0.82, 0.08));
    } else if (variant === 'rock') {
      parts.push(part(new THREE.DodecahedronBufferGeometry(1, 0), '#8A98A6', 0, 0.52, 0, 0.1, 0.4, 0.05, 1.2, 0.82, 1.0));
      parts.push(part(new THREE.IcosahedronBufferGeometry(0.58, 0), '#A8B3BF', 0.68, 0.3, 0.18, 0.2, 1.1, 0.1, 1.0, 0.75, 0.9));
      parts.push(part(new THREE.IcosahedronBufferGeometry(0.48, 0), '#66727E', -0.58, 0.25, -0.25, 0.4, 0.2, 0.1, 1.0, 0.65, 0.9));
      parts.push(part(new THREE.IcosahedronBufferGeometry(0.62, 0), '#536B46', -0.05, 0.88, -0.05, 0.1, 0.7, 0.1, 1.15, 0.25, 1.0));
      parts.push(sphere(0.07, 5, '#6B8A52', -0.4, 0.55, 0.3));
    } else if (variant === 'flower') {
      var flowerColors = ['#E86A8A', '#F2C94C', '#B97AD9', '#F28C6A', '#F7F1E0'];
      var heads = [
        { x: -0.30, z: 0.06, h: 0.62, c: 0 },
        { x: 0.02, z: -0.08, h: 0.86, c: 1 },
        { x: 0.32, z: 0.10, h: 0.72, c: 2 },
        { x: 0.12, z: 0.24, h: 0.48, c: 3 }
      ];
      for (var f = 0; f < heads.length; f += 1) {
        var hd = heads[f];
        var fc2 = flowerColors[(hd.c + f) % flowerColors.length];
        parts.push(part(
          new THREE.CylinderBufferGeometry(0.018, 0.028, hd.h, 4),
          '#4F8A55', hd.x, hd.h / 2, hd.z,
          (hash(f, 441) - 0.5) * 0.22, 0, (hash(f, 443) - 0.5) * 0.22
        ));
        // leaves
        for (var lf = 0; lf < 2; lf += 1) {
          var lfa = hash(f * 3 + lf, 447) * Math.PI * 2;
          parts.push(part(
            new THREE.SphereBufferGeometry(1, 6, 4),
            '#4F8A55',
            hd.x + Math.cos(lfa) * 0.14, 0.20 + lf * 0.09, hd.z + Math.sin(lfa) * 0.14,
            0.15, -lfa, 0.55,
            0.19, 0.028, 0.10
          ));
        }
        var topY = hd.h + 0.03;
        for (var pt = 0; pt < 7; pt += 1) {
          var pa = pt / 7 * Math.PI * 2 + f * 0.3;
          parts.push(part(
            new THREE.SphereBufferGeometry(1, 6, 4),
            fc2,
            hd.x + Math.cos(pa) * 0.105, topY, hd.z + Math.sin(pa) * 0.105,
            -0.45, -pa, 0,
            0.115, 0.038, 0.072
          ));
        }
        parts.push(sphere(0.055, 6, '#F2C94C', hd.x, topY + 0.02, hd.z, 1.0, 0.7, 1.0));
      }
      // unopened bud
      parts.push(cyl(0.015, 0.02, 0.52, 4, '#4F8A55', -0.42, 0.26, -0.02));
      parts.push(sphere(0.075, 6, '#D96A7A', -0.42, 0.58, -0.02, 0.8, 1.3, 0.8));
      parts.push(sphere(0.06, 5, '#5F9A5D', -0.42, 0.50, -0.02, 1.5, 0.35, 1.2));
    } else if (variant === 'fern') {
      for (var q = 0; q < 9; q += 1) {
        var qa = q / 9 * Math.PI * 2 + 0.2;
        var qreach = 0.58 + (q % 3) * 0.08;
        for (var qs = 0; qs < 4; qs += 1) {
          var qd = qs / 3 * qreach;
          var qh = 0.18 + qs * 0.075;
          parts.push(part(
            new THREE.IcosahedronBufferGeometry(1, 0),
            leaf[(q + qs) % 4],
            Math.cos(qa) * qd, qh, Math.sin(qa) * qd,
            0.35, -qa, 0.45 + qs * 0.08,
            0.22 - qs * 0.02, 0.022, 0.12
          ));
        }
      }
      parts.push(sphere(0.18, 7, leaf[0], 0, 0.10, 0, 1.15, 0.38, 1.15));
      parts.push(sphere(0.10, 5, leaf[4], 0.08, 0.20, 0.05, 1.3, 0.3, 1.0));
    } else if (variant === 'reed') {
      for (var r = 0; r < 5; r += 1) {
        var rx = (hash(r, 223) - 0.5) * 0.7;
        var rz = (hash(r, 227) - 0.5) * 0.7;
        var rh = 0.9 + hash(r, 229) * 0.8;
        parts.push(cyl(0.018, 0.025, rh, 4, '#6B8A52', rx, rh / 2, rz));
        parts.push(sphere(0.06, 6, '#6B4A33', rx, rh + 0.03, rz, 0.8, 2.2, 0.8));
        parts.push(part(new THREE.BoxBufferGeometry(0.35, 0.02, 0.05), leaf[2], rx + 0.12, rh * 0.6, rz, 0.2, 0.6, 0.2));
      }
    } else if (variant === 'mushroom') {
      var mushrooms = [
        [-0.24, 0.08, 0.26, '#D96A4A'],
        [0.20, -0.06, 0.20, '#E85D5D'],
        [0.02, 0.24, 0.30, '#C95A46'],
        [0.38, 0.16, 0.14, '#E8A05A']
      ];
      for (var mu = 0; mu < mushrooms.length; mu += 1) {
        var md = mushrooms[mu];
        parts.push(part(
          new THREE.CylinderBufferGeometry(0.045, 0.07, md[2], 6),
          '#EFE3C8', md[0], md[2] / 2, md[1],
          (hash(mu, 451) - 0.5) * 0.16, 0, (hash(mu, 453) - 0.5) * 0.16
        ));
        parts.push(part(
          new THREE.SphereBufferGeometry(1, 8, 5),
          md[3],
          md[0], md[2] + 0.02, md[1],
          0, mu, 0,
          md[2] * 0.92, md[2] * 0.50, md[2] * 0.92
        ));
        for (var sp = 0; sp < 4; sp += 1) {
          var sa = sp / 4 * Math.PI * 2 + mu;
          parts.push(sphere(
            md[2] * 0.10, 4, '#F7F2E6',
            md[0] + Math.cos(sa) * md[2] * 0.48,
            md[2] + 0.05,
            md[1] + Math.sin(sa) * md[2] * 0.48,
            1, 0.55, 1
          ));
        }
      }
      parts.push(sphere(0.42, 7, leaf[0], 0, 0.04, 0, 1.2, 0.16, 1.05));
      parts.push(sphere(0.30, 6, leaf[2], 0.24, 0.035, 0.12, 1.1, 0.13, 1.0));
    } else if (variant === 'log') {
      parts.push(cyl(0.32, 0.36, 2.3, 8, '#6B4A33', 0, 0.35, 0, Math.PI / 2, 0, 0.1));
      parts.push(cyl(0.27, 0.31, 0.03, 8, '#C6A575', 0, 0.35, 1.16, Math.PI / 2, 0, 0));
      parts.push(part(new THREE.IcosahedronBufferGeometry(0.4, 0), '#536B46', -0.5, 0.58, 0, 0.2, 0.8, 0.1, 1.3, 0.25, 0.8));
      parts.push(part(new THREE.IcosahedronBufferGeometry(0.3, 0), '#6B8A52', 0.55, 0.5, 0.2, 0.1, 0.2, 0.1, 1.1, 0.25, 0.7));
    } else if (variant === 'stump') {
      parts.push(cyl(0.48, 0.58, 0.65, 7, '#6B4A33', 0, 0.33, 0));
      parts.push(cyl(0.42, 0.45, 0.05, 7, '#C6A575', 0, 0.66, 0));
      parts.push(part(new THREE.IcosahedronBufferGeometry(0.28, 0), '#536B46', 0.25, 0.72, 0.1, 0.1, 0.5, 0.1, 1.2, 0.25, 0.9));
    } else if (variant === 'pebble') {
      parts.push(part(new THREE.DodecahedronBufferGeometry(0.18, 0), '#9AA7B8', 0, 0.12, 0, 0.2, 0.3, 0.1, 1.2, 0.6, 1.0));
      parts.push(part(new THREE.DodecahedronBufferGeometry(0.12, 0), '#B8C3D1', 0.25, 0.08, 0.1, 0.1, 0.8, 0.1, 1.0, 0.6, 0.9));
      parts.push(part(new THREE.DodecahedronBufferGeometry(0.1, 0), '#7E8B99', -0.2, 0.07, -0.12, 0.3, 0.4, 0.2, 1.0, 0.5, 1.0));
    } else if (variant === 'lantern') {
      parts.push(cyl(0.07, 0.11, 2.3, 5, '#5A4030', 0, 1.15, 0));
      parts.push(cyl(0.18, 0.22, 0.18, 5, '#6B4A33', 0, 0.09, 0));
      parts.push(box(0.62, 0.08, 0.08, '#5A4030', 0.28, 2.26, 0));
      parts.push(box(0.36, 0.46, 0.36, '#E8D8A0', 0.55, 1.92, 0));
      parts.push(box(0.26, 0.34, 0.26, '#FFE2A4', 0.55, 1.92, 0));
      parts.push(part(new THREE.ConeBufferGeometry(0.32, 0.2, 4), '#4A3528', 0.55, 2.24, 0, 0, Math.PI / 4, 0));
    } else if (variant === 'bench') {
      parts.push(box(1.6, 0.1, 0.46, '#8A5A2B', 0, 0.55, 0));
      parts.push(box(1.55, 0.42, 0.08, '#8A5A2B', 0, 0.83, -0.21));
      parts.push(box(0.1, 0.55, 0.1, '#5A4030', -0.65, 0.28, 0.15));
      parts.push(box(0.1, 0.55, 0.1, '#5A4030', 0.65, 0.28, 0.15));
      parts.push(box(0.1, 0.9, 0.1, '#5A4030', -0.65, 0.45, -0.2));
      parts.push(box(0.1, 0.9, 0.1, '#5A4030', 0.65, 0.45, -0.2));
    } else if (variant === 'stoneMarker') {
      parts.push(part(new THREE.IcosahedronBufferGeometry(0.42, 0), '#7F8D9B', 0, 0.5, 0, 0, 0.3, 0.05, 0.72, 1.35, 0.6));
      parts.push(box(0.05, 0.3, 0.03, '#D9B26F', 0, 0.52, 0.3));
      parts.push(box(0.18, 0.05, 0.03, '#D9B26F', 0, 0.58, 0.3));
    } else {
      parts.push(cone(0.4, 1.0, 6, '#4F8A55', 0, 0.5, 0));
    }
    var geo = mergeParts(parts);
    sceneryGeometries[variant] = geo;
    return geo;
  }

  function buildSign(obj) {
    var x = (obj.x + 0.5) * TILE;
    var z = (obj.y + 0.5) * TILE;
    var y = terrainHeightAt(x, z);
    var parts = [
      cyl(0.07, 0.1, 1.45, 5, '#6B4A33', 0, 0.73, 0),
      box(1.55, 0.5, 0.1, '#A97142', 0, 1.34, 0),
      box(1.35, 0.34, 0.04, '#D9BE8C', 0, 1.34, 0.06)
    ];
    var mesh = makeMergedMesh(parts);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    if (obj.text) {
      var label = makeTextSprite(obj.text, {
        bg: 'rgba(24,30,36,0.88)',
        color: '#F0E6D4',
        scaleX: 2.8,
        scaleY: 0.58,
        depthTest: false,
        renderOrder: 30
      });
      if (label) {
        label.position.set(x, y + 2.0, z);
        scene.add(label);
      }
    }
  }

  function buildScenery() {
    var byVariant = {};
    var shadowList = [];
    var lanterns = [];
    for (var i = 0; i < map.scenery.length; i += 1) {
      var obj = map.scenery[i];
      if (obj.asset === 'sign') {
        buildSign(obj);
        continue;
      }
      var variant = SCENERY_VARIANT[obj.asset] || 'treeA';
      if (!byVariant[variant]) byVariant[variant] = [];
      var y = terrainHeightAt((obj.x + 0.5) * TILE, (obj.y + 0.5) * TILE);
      var rot = hash(obj.x + 7, obj.y + 3) * Math.PI * 2;
      var scale = 0.82 + hash(obj.x + 11, obj.y + 5) * 0.36;
      var item = {
        position: new THREE.Vector3((obj.x + 0.5) * TILE, y, (obj.y + 0.5) * TILE),
        rotation: rot,
        scale: scale
      };
      byVariant[variant].push(item);
      var shadow = SHADOW_SIZE[variant];
      if (shadow) shadowList.push({ item: item, size: shadow * scale });
      if (variant === 'lantern') lanterns.push(item);
    }
    for (var name in byVariant) {
      if (!Object.prototype.hasOwnProperty.call(byVariant, name)) continue;
      var list = byVariant[name];
      var geo = buildSceneryGeometry(name);
      var mat = name === 'grass'
        ? new THREE.MeshLambertMaterial({
            map: getWorldTexture('grass-tuft', drawGrassTuft),
            transparent: true,
            alphaTest: 0.25,
            side: THREE.DoubleSide
          })
        : new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
      var inst = new THREE.InstancedMesh(geo, mat, list.length);
      var matrix = new THREE.Matrix4();
      var quat = new THREE.Quaternion();
      var scaleVec = new THREE.Vector3();
      for (var k = 0; k < list.length; k += 1) {
        quat.setFromEuler(new THREE.Euler(0, list[k].rotation, 0));
        scaleVec.set(list[k].scale, list[k].scale, list[k].scale);
        matrix.compose(list[k].position, quat, scaleVec);
        inst.setMatrixAt(k, matrix);
      }
      inst.instanceMatrix.needsUpdate = true;
      scene.add(inst);
    }
    if (shadowList.length) {
      var shadowTex = getWorldTexture('scenery-shadow', drawShadowTexture);
      var shadowMat = new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1
      });
      var shadowGeo = new THREE.PlaneBufferGeometry(1, 1);
      shadowGeo.rotateX(-Math.PI / 2);
      var shadows = new THREE.InstancedMesh(shadowGeo, shadowMat, shadowList.length);
      var sm = new THREE.Matrix4();
      var sq = new THREE.Quaternion();
      var sv = new THREE.Vector3();
      for (var sh = 0; sh < shadowList.length; sh += 1) {
        var entry = shadowList[sh];
        sv.set(entry.size, 1, entry.size * 0.72);
        sm.compose(
          new THREE.Vector3(entry.item.position.x + 0.2, entry.item.position.y + 0.035, entry.item.position.z + 0.16),
          sq,
          sv
        );
        shadows.setMatrixAt(sh, sm);
      }
      shadows.instanceMatrix.needsUpdate = true;
      scene.add(shadows);
    }
    if (lanterns.length) {
      var glowTex = getWorldTexture('lantern-glow', drawSunTexture);
      for (var l = 0; l < lanterns.length; l += 1) {
        var sprite = new THREE.Sprite(new THREE.SpriteMaterial({
          map: glowTex,
          color: sRGB(0xFFD79A),
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          opacity: 0.55
        }));
        sprite.position.copy(lanterns[l].position);
        sprite.position.x += 0.55 * lanterns[l].scale;
        sprite.position.y += 1.92 * lanterns[l].scale;
        sprite.scale.set(1.7, 1.7, 1);
        scene.add(sprite);
      }
    }
  }

  var butterflies = [];
  var pollen = null;

  function drawButterflyWing(g, S) {
    g.clearRect(0, 0, S, S);
    g.fillStyle = 'rgba(255,255,255,0.95)';
    g.beginPath();
    g.ellipse(S * 0.58, S * 0.42, S * 0.36, S * 0.24, -0.5, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.ellipse(S * 0.46, S * 0.66, S * 0.22, S * 0.16, 0.4, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = 'rgba(70,50,40,0.35)';
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(S * 0.26, S * 0.78);
    g.lineTo(S * 0.65, S * 0.5);
    g.stroke();
  }

  function buildButterflies() {
    var wingTex = getWorldTexture('butterfly-wing', drawButterflyWing);
    var colors = ['#F2A65A', '#6FB8D8', '#D9A6D0', '#F2D46A', '#8CD0B0'];
    for (var i = 0; i < 7; i += 1) {
      var group = new THREE.Group();
      var mat = new THREE.MeshLambertMaterial({
        map: wingTex,
        transparent: true,
        side: THREE.DoubleSide,
        alphaTest: 0.04,
        color: sRGB(colors[i % colors.length])
      });
      var left = new THREE.Group();
      var lw = new THREE.Mesh(new THREE.PlaneBufferGeometry(0.32, 0.26), mat);
      lw.position.x = -0.16;
      left.add(lw);
      var right = new THREE.Group();
      var rw = new THREE.Mesh(new THREE.PlaneBufferGeometry(0.32, 0.26), mat);
      rw.position.x = 0.16;
      right.add(rw);
      var body = new THREE.Mesh(new THREE.CylinderBufferGeometry(0.018, 0.025, 0.24, 5), new THREE.MeshLambertMaterial({ color: sRGB(0x3A3028) }));
      body.rotation.x = Math.PI / 2;
      group.add(left, right, body);
      group.scale.setScalar(0.8 + hash(i, 241) * 0.4);
      scene.add(group);
      butterflies.push({
        group: group,
        left: left,
        right: right,
        center: new THREE.Vector3(22 + (hash(i, 251) - 0.5) * 18, 0, 34 + (hash(i, 257) - 0.5) * 22),
        baseY: 1.4 + hash(i, 263) * 1.4,
        phase: hash(i, 269) * Math.PI * 2,
        speed: 0.25 + hash(i, 271) * 0.3,
        radius: 1.6 + hash(i, 277) * 2.2
      });
    }
    var positions = [];
    var colorsArr = [];
    for (var p = 0; p < 110; p += 1) {
      var angle = hash(p, 281) * Math.PI * 2;
      var dist = 6 + hash(p, 283) * 32;
      positions.push(COLS * TILE / 2 + Math.cos(angle) * dist, 1.2 + hash(p, 293) * 5, ROWS * TILE / 2 + Math.sin(angle) * dist);
      colorsArr.push(1, 0.93, 0.7);
    }
    var pgeo = new THREE.BufferGeometry();
    pgeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    pgeo.setAttribute('color', new THREE.Float32BufferAttribute(colorsArr, 3));
    var pmat = new THREE.PointsMaterial({
      color: sRGB(0xFFF0C0),
      size: 0.11,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      vertexColors: false,
      sizeAttenuation: true
    });
    pollen = new THREE.Points(pgeo, pmat);
    scene.add(pollen);
  }

  function updateAmbient(dt) {
    for (var i = 0; i < butterflies.length; i += 1) {
      var b = butterflies[i];
      var t = time * b.speed + b.phase;
      b.group.position.set(
        b.center.x + Math.cos(t) * b.radius,
        b.baseY + Math.sin(t * 1.7) * 0.45,
        b.center.z + Math.sin(t) * b.radius * 0.75
      );
      b.group.rotation.y = -t;
      var flap = 0.45 + Math.sin(time * 22 + b.phase) * 0.55;
      b.left.rotation.z = flap;
      b.right.rotation.z = -flap;
    }
    if (pollen) pollen.rotation.y += dt * 0.012;
  }

  /* ---------------- 装饰物 ---------------- */
  function buildDecoGeometries() {
    var defs = {};
    defs.palm = [
      cyl(0.13, 0.2, 2.6, 6, '#A97142', 0, 1.3, 0),
      cone(0.55, 1.8, 6, '#4A9E5C', 0, 3.1, 0, 0),
      cone(0.5, 1.5, 6, '#5FB86F', -0.9, 2.8, 0, 0.5),
      cone(0.5, 1.5, 6, '#5FB86F', 0.9, 2.8, 0, -0.5),
      cone(0.5, 1.5, 6, '#4A9E5C', 0, 2.8, 0.9, 0.3),
      cone(0.5, 1.5, 6, '#4A9E5C', 0, 2.8, -0.9, -0.3),
      sphere(0.16, 6, '#8A5A2B', 0.25, 2.6, 0.15)
    ];
    defs.flowers = [
      cyl(0.03, 0.04, 0.8, 4, '#4A9E5C', -0.4, 0.4, 0),
      cyl(0.03, 0.04, 1.0, 4, '#4A9E5C', 0, 0.5, 0.1),
      cyl(0.03, 0.04, 0.7, 4, '#4A9E5C', 0.4, 0.35, -0.1),
      sphere(0.18, 6, '#F27E9D', -0.4, 0.9, 0),
      sphere(0.2, 6, '#F2C94C', 0, 1.1, 0.1),
      sphere(0.17, 6, '#BB6BD9', 0.4, 0.85, -0.1)
    ];
    defs.fence = [
      box(0.14, 1.2, 0.14, '#C98A5A', -0.8, 0.6, 0),
      box(0.14, 1.2, 0.14, '#C98A5A', 0, 0.6, 0),
      box(0.14, 1.2, 0.14, '#C98A5A', 0.8, 0.6, 0),
      box(1.8, 0.12, 0.12, '#A97142', 0, 0.45, 0),
      box(1.8, 0.12, 0.12, '#A97142', 0, 0.85, 0)
    ];
    defs.coral = [
      cyl(0.1, 0.16, 1.2, 6, '#F27E9D', 0, 0.6, 0),
      cyl(0.08, 0.12, 0.9, 5, '#F27E9D', -0.35, 1.0, 0.1, 0, 0, 0.5),
      cyl(0.08, 0.12, 0.8, 5, '#F2999D', 0.35, 0.95, -0.1, 0, 0, -0.5),
      cyl(0.06, 0.1, 0.7, 5, '#F2999D', 0.1, 1.2, 0.3, 0.4, 0, 0.2),
      sphere(0.14, 6, '#F7C6D0', -0.55, 1.4, 0.1),
      sphere(0.13, 6, '#F7C6D0', 0.55, 1.3, -0.1)
    ];
    defs.lantern = [
      cyl(0.22, 0.3, 0.5, 6, '#9AA0A8', 0, 0.25, 0),
      cyl(0.12, 0.16, 1.2, 6, '#B8B8C2', 0, 1.0, 0),
      box(0.55, 0.55, 0.55, '#F2C94C', 0, 1.75, 0),
      cone(0.5, 0.35, 6, '#9AA0A8', 0, 2.2, 0)
    ];
    defs.swing = [
      cyl(0.1, 0.14, 2.4, 6, '#A97142', -0.9, 1.2, 0),
      cyl(0.1, 0.14, 2.4, 6, '#A97142', 0.9, 1.2, 0),
      box(2.0, 0.12, 0.12, '#8A5A2B', 0, 2.4, 0),
      box(0.9, 0.12, 0.5, '#C98A5A', 0, 0.8, 0),
      cyl(0.03, 0.03, 1.6, 4, '#D8CDBB', -0.35, 1.6, 0),
      cyl(0.03, 0.03, 1.6, 4, '#D8CDBB', 0.35, 1.6, 0)
    ];
    defs.campfire = [
      cyl(0.1, 0.12, 1.2, 6, '#8A5A2B', 0, 0.6, 0, 0, 0, 1.1),
      cyl(0.1, 0.12, 1.2, 6, '#8A5A2B', 0, 0.6, 0, 0, 0, -1.1),
      cone(0.45, 1.1, 6, '#F2994A', 0, 1.1, 0),
      cone(0.25, 0.7, 6, '#F2C94C', 0, 0.95, 0)
    ];
    defs.scarecrow = [
      cyl(0.08, 0.12, 2.4, 6, '#8A5A2B', 0, 1.2, 0),
      box(1.8, 0.12, 0.12, '#8A5A2B', 0, 1.7, 0),
      sphere(0.35, 8, '#F2DFC0', 0, 2.5, 0),
      cone(0.45, 0.4, 6, '#C98A5A', 0, 2.95, 0),
      box(0.6, 0.7, 0.35, '#5FB86F', 0, 1.5, 0)
    ];
    defs.hut = [
      box(2.4, 1.6, 2.2, '#D9B382', 0, 0.8, 0),
      cone(1.9, 1.3, 4, '#C98A5A', 0, 2.2, 0, Math.PI / 4),
      box(0.6, 1.0, 0.12, '#8A5A2B', 0, 0.5, 1.15)
    ];
    defs.windmill = [
      cyl(0.5, 0.75, 2.4, 6, '#D8CDBB', 0, 1.2, 0),
      cone(0.6, 0.6, 6, '#B8B8C2', 0, 2.7, 0),
      box(0.16, 1.8, 0.16, '#F7F5F2', 0, 2.9, 0, 0.4),
      box(1.8, 0.16, 0.16, '#F7F5F2', 0, 2.9, 0, 0.4)
    ];
    defs.fountain = [
      cyl(1.0, 1.15, 0.4, 10, '#B8C3D1', 0, 0.2, 0),
      cyl(0.85, 0.85, 0.12, 10, '#4FC3E8', 0, 0.43, 0),
      cyl(0.18, 0.25, 1.1, 8, '#B8C3D1', 0, 0.95, 0),
      sphere(0.28, 8, '#8ED8F8', 0, 1.6, 0)
    ];
    defs.statue = [
      box(1.2, 0.35, 1.2, '#B8B8C2', 0, 0.18, 0),
      box(0.8, 0.25, 0.8, '#D8D8E0', 0, 0.46, 0),
      cyl(0.22, 0.3, 1.5, 8, '#D8D8E0', 0, 1.25, 0),
      sphere(0.32, 8, '#D8D8E0', 0, 2.15, 0),
      box(0.12, 1.2, 0.12, '#F2C94C', 0.45, 1.5, 0, 0.4)
    ];
    for (var id in defs) {
      if (Object.prototype.hasOwnProperty.call(defs, id)) {
        decoGeometries[id] = mergeParts(defs[id]);
      }
    }
  }

  function buildDecoMeshes() {
    for (var i = 0; i < D.DECORATIONS.length; i += 1) {
      var id = D.DECORATIONS[i].id;
      var geo = decoGeometries[id];
      if (!geo) continue;
      var mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
      var inst = new THREE.InstancedMesh(geo, mat, C.maxWorldDecos);
      inst.count = 0;
      inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      inst.frustumCulled = false;
      scene.add(inst);
      decoMeshes[id] = inst;
    }
  }

  function refreshDecos() {
    var s = window.Core.getState();
    var byType = {};
    for (var i = 0; i < s.worldDecos.length; i += 1) {
      var d = s.worldDecos[i];
      if (!byType[d.id]) byType[d.id] = [];
      byType[d.id].push(d);
    }
    for (var id in decoMeshes) {
      if (!Object.prototype.hasOwnProperty.call(decoMeshes, id)) continue;
      var inst = decoMeshes[id];
      var list = byType[id] || [];
      var matrix = new THREE.Matrix4();
      var quat = new THREE.Quaternion();
      var scaleVec = new THREE.Vector3();
      for (var k = 0; k < list.length; k += 1) {
        var d2 = list[k];
        var x = (d2.x + 0.5) * TILE;
        var z = (d2.y + 0.5) * TILE;
        var y = terrainHeightAt(x, z);
        var rot = hash(d2.x + 3, d2.y + 9) * Math.PI * 2;
        var sc = 0.9 + hash(d2.x + 5, d2.y + 1) * 0.2;
        quat.setFromEuler(new THREE.Euler(0, rot, 0));
        scaleVec.set(sc, sc, sc);
        matrix.compose(new THREE.Vector3(x, y, z), quat, scaleVec);
        inst.setMatrixAt(k, matrix);
      }
      inst.count = list.length;
      inst.instanceMatrix.needsUpdate = true;
    }
  }

  /* ---------------- 农田作物 ---------------- */
  function refreshFarmCrops() {
    for (var i = 0; i < farmCropMeshes.length; i += 1) {
      var old = farmCropMeshes[i];
      if (old) {
        scene.remove(old);
        if (old.geometry) old.geometry.dispose();
        if (old.material) old.material.dispose();
      }
    }
    farmCropMeshes = [];
    var s = window.Core.getState();
    for (var p = 0; p < W.farmPlots.length; p += 1) {
      var plot = W.farmPlots[p];
      var sp = s.plots[p];
      if (!sp || !sp.cropId) continue;
      var crop = window.Core.findCrop(sp.cropId);
      if (!crop) continue;
      var x = (plot.x + plot.w / 2) * TILE;
      var z = (plot.y + plot.h / 2) * TILE;
      var y = terrainHeightAt(x, z) + 0.16;
      var mature = sp.watered && sp.plantedAt && Date.now() >= sp.plantedAt + crop.growSec * 1000;
      var pct = sp.watered && sp.plantedAt ? Math.min(1, (Date.now() - sp.plantedAt) / (crop.growSec * 1000)) : 0;
      var parts = [];
      if (!sp.watered) {
        parts.push(cyl(0.04, 0.05, 0.35, 5, '#5FB86F', 0, 0.18, 0));
        parts.push(sphere(0.12, 6, '#5FB86F', -0.1, 0.35, 0));
        parts.push(sphere(0.12, 6, '#4A9E5C', 0.1, 0.4, 0));
        parts.push(sphere(0.09, 6, '#4FC3E8', 0.3, 0.55, 0));
      } else if (mature) {
        parts.push(cyl(0.07, 0.1, 0.9, 6, '#4A9E5C', 0, 0.45, 0));
        parts.push(sphere(0.24, 7, '#5FB86F', -0.22, 0.75, 0));
        parts.push(sphere(0.24, 7, '#4A9E5C', 0.22, 0.8, 0));
        parts.push(sphere(0.3, 8, crop.color || '#F2C94C', 0, 1.0, 0));
      } else {
        var h = 0.35 + pct * 0.55;
        parts.push(cyl(0.05, 0.08, h, 6, '#4A9E5C', 0, h / 2, 0));
        parts.push(sphere(0.2, 7, '#5FB86F', -0.18, h * 0.8, 0));
        parts.push(sphere(0.2, 7, '#4A9E5C', 0.18, h * 0.85, 0));
      }
      var mesh = makeMergedMesh(parts);
      mesh.position.set(x, y, z);
      scene.add(mesh);
      farmCropMeshes.push(mesh);
    }
  }

  /* ---------------- 农田场景交互 ---------------- */
  function findFarmBuilding() {
    if (!map || !map.buildings) return null;
    for (var i = 0; i < map.buildings.length; i += 1) {
      if (map.buildings[i].type === 'farm') return map.buildings[i];
    }
    return null;
  }

  function nearestFarmPlot() {
    var best = -1;
    var bestD = Infinity;
    for (var i = 0; i < W.farmPlots.length; i += 1) {
      var p = W.farmPlots[i];
      var cx = (p.x + p.w / 2) * TILE;
      var cz = (p.y + p.h / 2) * TILE;
      var d = dist2(player.x, player.z, cx, cz);
      if (d < bestD) { best = i; bestD = d; }
    }
    if (best < 0 || bestD > (TILE * 2.35) * (TILE * 2.35)) return -1;
    return best;
  }

  function updateFarmMode() {
    if (!map || !initialized) return;
    var farm = findFarmBuilding();
    var inside = false;
    if (farm && buildingUnlocked('farm')) {
      var tx = player.x / TILE;
      var tz = player.z / TILE;
      inside = tx >= farm.x && tx <= farm.x + farm.w && tz >= farm.y && tz <= farm.y + farm.h;
    }
    var target = inside ? nearestFarmPlot() : -1;
    if (inside !== inFarm) {
      inFarm = inside;
      document.body.classList.toggle('is-in-farm', inFarm);
      if (inFarm) {
        if (window.UI && window.UI.showFarmDock) window.UI.showFarmDock(target);
      } else {
        if (window.UI && window.UI.hideFarmDock) window.UI.hideFarmDock();
      }
    } else if (inFarm && target !== farmTargetIndex) {
      if (window.UI && window.UI.updateFarmDock) window.UI.updateFarmDock(target);
    }
    farmTargetIndex = target;
    if (farmTargetRing) {
      if (inside && target >= 0) {
        var plot = W.farmPlots[target];
        var px = (plot.x + plot.w / 2) * TILE;
        var pz = (plot.y + plot.h / 2) * TILE;
        farmTargetRing.position.set(px, terrainHeightAt(px, pz) + 0.2, pz);
        farmTargetRing.visible = true;
      } else {
        farmTargetRing.visible = false;
      }
    }
  }

  function enterFarm() {
    if (!initialized && !init()) return false;
    var farm = findFarmBuilding();
    if (!farm) return false;
    if (!buildingUnlocked('farm')) {
      if (window.UI && window.UI.showBuild) window.UI.showBuild('farm');
      return false;
    }
    if (!inFarm) {
      var tx = farm.x + farm.w - 3;
      var ty = farm.y + Math.floor(farm.h / 2);
      if (!setPlayerTile(tx, ty)) setPlayerTile(farm.x + Math.floor(farm.w / 2), farm.y + Math.floor(farm.h / 2));
      camTarget = null;
      camDesired = null;
      if (avatarGroup) avatarGroup.position.set(player.x, player.y, player.z);
      savePlayerPos();
    }
    updateFarmMode();
    showHint('在田块旁选择种田 / 浇水 / 施肥 / 铲除', 4600);
    return true;
  }

  function leaveFarm() {
    if (!initialized) return;
    var farm = findFarmBuilding();
    if (!farm) return;
    setPlayerTile(farm.x + farm.w, farm.y + Math.floor(farm.h / 2));
    camTarget = null;
    camDesired = null;
    updateFarmMode();
    savePlayerPos();
    showHint('离开了小农田', 1600);
  }

  /* ---------------- 玩家化身 ---------------- */
  function makeAvatarName(name, elementId) {
    var e = window.Core.findElement(elementId);
    var canvasEl = document.createElement('canvas');
    canvasEl.width = 512;
    canvasEl.height = 128;
    var g = canvasEl.getContext('2d');
    if (!g) return null;
    g.clearRect(0, 0, 512, 128);
    g.font = 'bold 44px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
    var label = name + ' · ' + e.name;
    var tw = g.measureText(label).width;
    var w = Math.min(480, tw + 80);
    var x = (512 - w) / 2;
    var y = 20;
    var h = 88;
    var r = 28;
    g.beginPath();
    g.moveTo(x + r, y);
    g.lineTo(x + w - r, y);
    g.quadraticCurveTo(x + w, y, x + w, y + r);
    g.lineTo(x + w, y + h - r);
    g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    g.lineTo(x + r, y + h);
    g.quadraticCurveTo(x, y + h, x, y + h - r);
    g.lineTo(x, y + r);
    g.quadraticCurveTo(x, y, x + r, y);
    g.closePath();
    g.fillStyle = 'rgba(255,255,255,0.92)';
    g.fill();
    g.strokeStyle = e.color;
    g.lineWidth = 5;
    g.stroke();
    g.fillStyle = e.color;
    g.beginPath();
    g.arc(x + 28, y + h / 2, 9, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#2E2A26';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(label, 256 + 10, y + h / 2);
    var tex = new THREE.CanvasTexture(canvasEl);
    tex.minFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    var mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false });
    var sprite = new THREE.Sprite(mat);
    sprite.scale.set(3.0, 0.75, 1);
    sprite.renderOrder = 20;
    return sprite;
  }

  function tintMaterial(material, tint) {
    var mat = material.clone();
    if (tint) mat.color.set(tint).convertSRGBToLinear();
    return mat;
  }

  function buildPetAvatar(formId, modelKey, height, tint) {
    var pet = getPetModel(modelKey);
    if (!pet) return null;
    var group = new THREE.Group();
    if (!avatarMaterialCache[formId]) avatarMaterialCache[formId] = [];
    for (var i = 0; i < pet.parts.length; i += 1) {
      var partDef = pet.parts[i];
      var mat = avatarMaterialCache[formId][i];
      if (!mat) {
        mat = tintMaterial(partDef.material, tint);
        avatarMaterialCache[formId][i] = mat;
      }
      group.add(new THREE.Mesh(partDef.geometry, mat));
    }
    group.scale.setScalar(height / 1.6);
    return group;
  }

  function buildDragonAvatar(height, colors) {
    var parts = [];
    var bodyColor = colors[0];
    var accent = colors[1];
    var dark = colors[2];
    var s = height / 2.8;
    parts.push(sphere(0.55 * s, 8, bodyColor, 0, 0.75 * s, -0.8 * s, 1, 0.8, 1.5));
    parts.push(sphere(0.5 * s, 8, bodyColor, 0, 0.95 * s, 0.1 * s, 1, 0.8, 1.3));
    parts.push(sphere(0.44 * s, 8, bodyColor, 0, 1.25 * s, 0.9 * s, 1, 0.85, 1.1));
    parts.push(sphere(0.34 * s, 8, bodyColor, 0, 1.55 * s, 1.5 * s, 1, 0.9, 1));
    parts.push(box(0.55 * s, 0.3 * s, 0.6 * s, accent, 0, 1.5 * s, 1.95 * s));
    parts.push(cone(0.16 * s, 0.7 * s, 5, accent, -0.28 * s, 1.95 * s, 1.45 * s, 0.3));
    parts.push(cone(0.16 * s, 0.7 * s, 5, accent, 0.28 * s, 1.95 * s, 1.45 * s, -0.3));
    parts.push(sphere(0.07 * s, 6, '#F2C94C', -0.16 * s, 1.65 * s, 1.75 * s));
    parts.push(sphere(0.07 * s, 6, '#F2C94C', 0.16 * s, 1.65 * s, 1.75 * s));
    parts.push(cone(0.3 * s, 1.2 * s, 6, bodyColor, 0, 0.55 * s, -1.9 * s, 0));
    for (var i = 0; i < 4; i += 1) {
      var lx = i < 2 ? -0.35 * s : 0.35 * s;
      var lz = i % 2 === 0 ? 0.55 * s : -0.35 * s;
      parts.push(cyl(0.09 * s, 0.12 * s, 0.65 * s, 6, dark, lx, 0.32 * s, lz));
    }
    parts.push(box(0.12 * s, 1.4 * s, 2.4 * s, accent, -0.9 * s, 1.25 * s, 0.1 * s, 0.45));
    parts.push(box(0.12 * s, 1.4 * s, 2.4 * s, accent, 0.9 * s, 1.25 * s, 0.1 * s, -0.45));
    parts.push(cyl(0.03 * s, 0.03 * s, 0.9 * s, 4, accent, -0.45 * s, 1.55 * s, 2.0 * s, 0.9));
    parts.push(cyl(0.03 * s, 0.03 * s, 0.9 * s, 4, accent, 0.45 * s, 1.55 * s, 2.0 * s, 0.9));
    var geo = mergeParts(parts);
    var mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
    return new THREE.Mesh(geo, mat);
  }

  function buildPhoenixAvatar(height, colors) {
    var parts = [];
    var body = colors[0];
    var accent = colors[1];
    var s = height / 2.6;
    parts.push(sphere(0.5 * s, 8, body, 0, 1.0 * s, 0, 1, 0.9, 1.2));
    parts.push(sphere(0.3 * s, 8, body, 0, 1.55 * s, 0.55 * s));
    parts.push(cone(0.18 * s, 0.55 * s, 5, '#F2C94C', 0, 1.5 * s, 1.0 * s, 0));
    parts.push(cone(0.22 * s, 0.7 * s, 5, accent, -0.18 * s, 1.95 * s, 0.4 * s, 0.3));
    parts.push(cone(0.22 * s, 0.7 * s, 5, accent, 0.18 * s, 1.95 * s, 0.4 * s, -0.3));
    parts.push(box(0.1 * s, 1.4 * s, 2.0 * s, accent, -0.85 * s, 1.15 * s, 0, 0.5));
    parts.push(box(0.1 * s, 1.4 * s, 2.0 * s, accent, 0.85 * s, 1.15 * s, 0, -0.5));
    for (var i = 0; i < 3; i += 1) {
      parts.push(cone(0.16 * s, 1.6 * s, 5, i === 1 ? '#F2C94C' : accent, (i - 1) * 0.3 * s, 0.9 * s, -1.3 * s, 0.35));
    }
    for (var k = 0; k < 3; k += 1) {
      parts.push(cone(0.12 * s, 0.5 * s, 5, '#F2C94C', (k - 1) * 0.18 * s, 1.95 * s, 0.55 * s, (k - 1) * 0.4));
    }
    parts.push(cyl(0.06 * s, 0.09 * s, 0.5 * s, 5, '#F2C94C', -0.18 * s, 0.25 * s, 0));
    parts.push(cyl(0.06 * s, 0.09 * s, 0.5 * s, 5, '#F2C94C', 0.18 * s, 0.25 * s, 0));
    var geo = mergeParts(parts);
    var mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
    return new THREE.Mesh(geo, mat);
  }

  function buildGenericAvatar(height, creature) {
    var color = window.Core.findElement(creature.element).color;
    var accent = '#FFF3E6';
    var s = height / 1.6;
    var parts = [
      sphere(0.5 * s, 8, color, 0, 0.75 * s, 0, 1, 0.85, 1.3),
      sphere(0.36 * s, 8, color, 0, 1.25 * s, 0.55 * s),
      sphere(0.18 * s, 6, accent, -0.18 * s, 1.45 * s, 0.75 * s),
      sphere(0.18 * s, 6, accent, 0.18 * s, 1.45 * s, 0.75 * s),
      sphere(0.1 * s, 6, '#2B2B33', -0.14 * s, 1.3 * s, 0.82 * s),
      sphere(0.1 * s, 6, '#2B2B33', 0.14 * s, 1.3 * s, 0.82 * s),
      cone(0.12 * s, 0.35 * s, 5, color, -0.28 * s, 1.7 * s, 0.5 * s, 0.3),
      cone(0.12 * s, 0.35 * s, 5, color, 0.28 * s, 1.7 * s, 0.5 * s, -0.3),
      cone(0.14 * s, 0.8 * s, 6, color, 0, 0.7 * s, -0.75 * s, 0)
    ];
    for (var i = 0; i < 4; i += 1) {
      parts.push(cyl(0.09 * s, 0.12 * s, 0.5 * s, 6, color, i < 2 ? -0.28 * s : 0.28 * s, 0.25 * s, i % 2 === 0 ? 0.3 * s : -0.3 * s));
    }
    var geo = mergeParts(parts);
    var mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
    return new THREE.Mesh(geo, mat);
  }

  var featureTextureCache = {};

  function getFeatureTexture(key, draw) {
    if (featureTextureCache[key]) return featureTextureCache[key];
    var c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    var g = c.getContext('2d');
    if (!g) return null;
    draw(g, 512);
    var tex = new THREE.Texture();
    tex.image = c;
    tex.encoding = THREE.sRGBEncoding;
    tex.flipY = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    featureTextureCache[key] = tex;
    return tex;
  }

  function featurePlane(group, key, draw, w, h, x, y, z, ry, mirror, tint) {
    var tex = getFeatureTexture(key, draw);
    if (!tex) return;
    var mat = new THREE.MeshLambertMaterial({
      map: tex,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      alphaTest: 0.02,
      color: tint || 0xFFFFFF
    });
    var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(w, h), mat);
    mesh.position.set(x, y, z);
    mesh.rotation.y = ry || 0;
    if (mirror) mesh.scale.x = -1;
    group.add(mesh);
  }

  function drawPeacockFan(g, S) {
    var cx = S * 0.5;
    var cy = S * 0.98;
    for (var i = 0; i < 9; i += 1) {
      var a = -Math.PI * 0.5 + (i - 4) * 0.20;
      var tx = cx + Math.cos(a) * S * 0.55;
      var ty = cy + Math.sin(a) * S * 0.55;
      var px = Math.cos(a + Math.PI / 2) * S * 0.10;
      var py = Math.sin(a + Math.PI / 2) * S * 0.10;
      g.beginPath();
      g.moveTo(cx + px * 0.3, cy + py * 0.3);
      g.quadraticCurveTo(cx + Math.cos(a) * S * 0.30 + px, cy + Math.sin(a) * S * 0.30 + py, tx, ty);
      g.quadraticCurveTo(cx + Math.cos(a) * S * 0.30 - px, cy + Math.sin(a) * S * 0.30 - py, cx - px * 0.3, cy - py * 0.3);
      g.closePath();
      var grad = g.createLinearGradient(cx, cy, tx, ty);
      grad.addColorStop(0, 'rgba(20,70,64,0.25)');
      grad.addColorStop(0.55, 'rgba(38,150,128,0.95)');
      grad.addColorStop(1, 'rgba(96,210,176,0.98)');
      g.fillStyle = grad;
      g.fill();
      var ex = tx * 0.88 + cx * 0.12;
      var ey = ty * 0.88 + cy * 0.12;
      g.beginPath(); g.arc(ex, ey, S * 0.062, 0, Math.PI * 2); g.fillStyle = '#D9B26A'; g.fill();
      g.beginPath(); g.arc(ex, ey, S * 0.043, 0, Math.PI * 2); g.fillStyle = '#2A6F8E'; g.fill();
      g.beginPath(); g.arc(ex, ey, S * 0.019, 0, Math.PI * 2); g.fillStyle = '#12252F'; g.fill();
    }
  }

  function drawFlameFan(g, S, hot) {
    var cx = S * 0.5;
    var cy = S * 0.96;
    for (var i = 0; i < 7; i += 1) {
      var a = -Math.PI * 0.5 + (i - 3) * 0.26;
      var tx = cx + Math.cos(a) * S * 0.52;
      var ty = cy + Math.sin(a) * S * 0.56;
      var px = Math.cos(a + Math.PI / 2) * S * 0.10;
      var py = Math.sin(a + Math.PI / 2) * S * 0.10;
      g.beginPath();
      g.moveTo(cx + px * 0.2, cy + py * 0.2);
      g.quadraticCurveTo(cx + Math.cos(a) * S * 0.34 + px * 1.3, cy + Math.sin(a) * S * 0.30 + py * 1.3, tx, ty);
      g.quadraticCurveTo(cx + Math.cos(a) * S * 0.34 - px * 1.3, cy + Math.sin(a) * S * 0.30 - py * 1.3, cx - px * 0.2, cy - py * 0.2);
      g.closePath();
      var grad = g.createLinearGradient(cx, cy, tx, ty);
      grad.addColorStop(0, hot ? 'rgba(120,10,10,0.4)' : 'rgba(120,60,10,0.35)');
      grad.addColorStop(0.5, hot ? 'rgba(210,46,30,0.95)' : 'rgba(230,120,30,0.95)');
      grad.addColorStop(1, hot ? 'rgba(255,120,60,0.98)' : 'rgba(255,214,110,0.98)');
      g.fillStyle = grad;
      g.fill();
    }
  }


  function drawFireFan(g, S, hot) {
    var cx = S * 0.5;
    var cy = S * 0.98;
    for (var i = 0; i < 9; i += 1) {
      var a = -Math.PI * 0.5 + (i - 4) * 0.20;
      var tx = cx + Math.cos(a) * S * 0.55;
      var ty = cy + Math.sin(a) * S * 0.55;
      var px = Math.cos(a + Math.PI / 2) * S * 0.10;
      var py = Math.sin(a + Math.PI / 2) * S * 0.10;
      g.beginPath();
      g.moveTo(cx + px * 0.3, cy + py * 0.3);
      g.quadraticCurveTo(cx + Math.cos(a) * S * 0.30 + px, cy + Math.sin(a) * S * 0.30 + py, tx, ty);
      g.quadraticCurveTo(cx + Math.cos(a) * S * 0.30 - px, cy + Math.sin(a) * S * 0.30 - py, cx - px * 0.3, cy - py * 0.3);
      g.closePath();
      var grad = g.createLinearGradient(cx, cy, tx, ty);
      grad.addColorStop(0, hot ? 'rgba(90,8,8,0.2)' : 'rgba(110,50,8,0.25)');
      grad.addColorStop(0.55, hot ? 'rgba(210,35,25,0.95)' : 'rgba(235,125,26,0.95)');
      grad.addColorStop(1, hot ? 'rgba(255,120,54,0.98)' : 'rgba(255,220,120,0.98)');
      g.fillStyle = grad;
      g.fill();
      var ex = tx * 0.88 + cx * 0.12;
      var ey = ty * 0.88 + cy * 0.12;
      g.beginPath(); g.arc(ex, ey, S * 0.062, 0, Math.PI * 2); g.fillStyle = '#F2C94C'; g.fill();
      g.beginPath(); g.arc(ex, ey, S * 0.043, 0, Math.PI * 2); g.fillStyle = hot ? '#9A1A10' : '#B84A20'; g.fill();
      g.beginPath(); g.arc(ex, ey, S * 0.019, 0, Math.PI * 2); g.fillStyle = '#2B1208'; g.fill();
    }
  }

  function drawWing(g, S, base, edge) {
    g.beginPath();
    g.moveTo(S * 0.12, S * 0.88);
    g.quadraticCurveTo(S * 0.30, S * 0.22, S * 0.86, S * 0.12);
    g.quadraticCurveTo(S * 0.72, S * 0.38, S * 0.82, S * 0.55);
    g.quadraticCurveTo(S * 0.60, S * 0.50, S * 0.66, S * 0.72);
    g.quadraticCurveTo(S * 0.46, S * 0.62, S * 0.50, S * 0.86);
    g.quadraticCurveTo(S * 0.32, S * 0.76, S * 0.12, S * 0.88);
    g.closePath();
    var grad = g.createLinearGradient(S * 0.2, S * 0.2, S * 0.7, S * 0.8);
    grad.addColorStop(0, edge);
    grad.addColorStop(1, base);
    g.fillStyle = grad;
    g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.25)';
    g.lineWidth = S * 0.012;
    g.beginPath();
    g.moveTo(S * 0.18, S * 0.82); g.lineTo(S * 0.76, S * 0.20);
    g.moveTo(S * 0.24, S * 0.84); g.lineTo(S * 0.30, S * 0.40);
    g.stroke();
  }

  function drawFin(g, S) {
    g.beginPath();
    g.moveTo(S * 0.50, S * 0.92);
    g.quadraticCurveTo(S * 0.22, S * 0.56, S * 0.28, S * 0.16);
    g.quadraticCurveTo(S * 0.44, S * 0.38, S * 0.55, S * 0.24);
    g.quadraticCurveTo(S * 0.62, S * 0.46, S * 0.74, S * 0.30);
    g.quadraticCurveTo(S * 0.78, S * 0.58, S * 0.62, S * 0.92);
    g.closePath();
    var grad = g.createLinearGradient(S * 0.3, S * 0.2, S * 0.7, S * 0.9);
    grad.addColorStop(0, 'rgba(220,190,110,0.95)');
    grad.addColorStop(1, 'rgba(70,150,190,0.95)');
    g.fillStyle = grad;
    g.fill();
  }

  function buildAvatarFeatures(formId, h) {
    var group = new THREE.Group();
    var parts = [];
    var gold = '#E8C97A';
    if (formId === 'crane') {
      parts.push(sphere(0.055 * h, 8, '#C94A3A', 0, 0.95 * h, 0.10 * h));
      parts.push(sphere(0.022 * h, 6, '#2B2B33', 0, 0.86 * h, 0.12 * h, 1.4, 1, 0.8));
      for (var ci = 0; ci < 4; ci += 1) {
        parts.push(sphere(0.045 * h, 6, '#2B2B33', 0, (0.56 + ci * 0.09) * h, (0.08 + ci * 0.012) * h, 1.3, 1, 0.8));
      }
    } else if (formId === 'peacock') {
      featurePlane(group, 'peacock-fan', drawPeacockFan, 1.7 * h, 1.35 * h, 0, 0.62 * h, -0.12 * h, 0, false, 0xFFFFFF);
      for (var pi = 0; pi < 3; pi += 1) {
        parts.push(cone(0.026 * h, 0.18 * h, 5, pi === 1 ? gold : '#6FE0C8', (pi - 1) * 0.035 * h, 0.99 * h, 0.10 * h, (pi - 1) * 0.25));
      }
    } else if (formId === 'phoenix' || formId === 'zhuque') {
      featurePlane(group, formId + '-fan', function (g, S) { drawFireFan(g, S, formId === 'zhuque'); }, 1.70 * h, 1.35 * h, 0, 0.62 * h, -0.12 * h, 0, false, 0xFFFFFF);
      for (var fi = 0; fi < 3; fi += 1) {
        parts.push(cone(0.024 * h, 0.20 * h, 5, fi === 1 ? '#FFE0A0' : '#E85D3A', (fi - 1) * 0.035 * h, 0.99 * h, 0.10 * h, (fi - 1) * 0.25));
      }
    } else if (formId === 'qiongqi') {
      featurePlane(group, 'qiongqi-wing', function (g, S) { drawWing(g, S, '#3A2A4A', '#7A5F92'); }, 0.92 * h, 0.70 * h, -0.42 * h, 0.58 * h, -0.06 * h, 0.55, true, 0xFFFFFF);
      featurePlane(group, 'qiongqi-wing', function (g, S) { drawWing(g, S, '#3A2A4A', '#7A5F92'); }, 0.92 * h, 0.70 * h, 0.42 * h, 0.58 * h, -0.06 * h, -0.55, false, 0xFFFFFF);
    } else if (formId === 'qilin') {
      var antlers = [
        [0.025, 0.045, 0.26, -0.07, 0.80, 0.24, -0.35, 0, -0.25],
        [0.018, 0.030, 0.22, -0.10, 0.96, 0.20, -0.25, 0, 0.42],
        [0.015, 0.024, 0.16, -0.12, 0.90, 0.30, -0.9, 0, 0.25],
        [0.025, 0.045, 0.26, 0.07, 0.80, 0.24, -0.35, 0, 0.25],
        [0.018, 0.030, 0.22, 0.10, 0.96, 0.20, -0.25, 0, -0.42],
        [0.015, 0.024, 0.16, 0.12, 0.90, 0.30, -0.9, 0, -0.25]
      ];
      for (var ai = 0; ai < antlers.length; ai += 1) {
        var a = antlers[ai];
        parts.push(cyl(a[0] * h, a[1] * h, a[2] * h, 5, gold, a[3] * h, a[4] * h, a[5] * h, a[6], a[7], a[8]));
      }
      parts.push(cyl(0.006 * h, 0.006 * h, 0.34 * h, 4, gold, -0.055 * h, 0.64 * h, 0.40 * h, Math.PI / 2, 0, 0.1));
      parts.push(cyl(0.006 * h, 0.006 * h, 0.34 * h, 4, gold, 0.055 * h, 0.64 * h, 0.40 * h, Math.PI / 2, 0, -0.1));
      for (var mi = 0; mi < 4; mi += 1) {
        parts.push(cone(0.035 * h, 0.17 * h, 5, gold, 0, (0.66 + mi * 0.05) * h, (0.14 - mi * 0.015) * h, 0));
      }
      parts.push(cone(0.055 * h, 0.32 * h, 5, gold, 0, 0.42 * h, -0.40 * h, 0));
      for (var si = 0; si < 4; si += 1) {
        var sx = si % 2 === 0 ? -1 : 1;
        parts.push(sphere(0.045 * h, 6, gold, sx * 0.20 * h, (0.40 + (si > 1 ? 0.08 : 0)) * h, (si % 2 === 0 ? 0.10 : -0.10) * h, 1, 0.35, 0.7));
      }
    } else if (formId === 'baize') {
      featurePlane(group, 'baize-wing', function (g, S) { drawWing(g, S, '#EFE6D0', '#D9B26A'); }, 1.00 * h, 0.75 * h, -0.55 * h, 0.60 * h, 0.03 * h, 0.55, true, 0xFFFFFF);
      featurePlane(group, 'baize-wing', function (g, S) { drawWing(g, S, '#EFE6D0', '#D9B26A'); }, 1.00 * h, 0.75 * h, 0.55 * h, 0.60 * h, 0.03 * h, -0.55, false, 0xFFFFFF);
      var baizeAntlers = [
        [0.020, 0.035, 0.20, -0.05, 0.82, 0.26, -0.30, 0, -0.30],
        [0.014, 0.024, 0.16, -0.075, 0.94, 0.23, -0.20, 0, 0.45],
        [0.020, 0.035, 0.20, 0.05, 0.82, 0.26, -0.30, 0, 0.30],
        [0.014, 0.024, 0.16, 0.075, 0.94, 0.23, -0.20, 0, -0.45]
      ];
      for (var bai = 0; bai < baizeAntlers.length; bai += 1) {
        var ba = baizeAntlers[bai];
        parts.push(cyl(ba[0] * h, ba[1] * h, ba[2] * h, 5, gold, ba[3] * h, ba[4] * h, ba[5] * h, ba[6], ba[7], ba[8]));
      }
      parts.push(sphere(0.060 * h, 7, gold, 0, 0.78 * h, 0.36 * h, 1.25, 0.85, 0.5));
      parts.push(sphere(0.026 * h, 6, '#7A3A98', 0, 0.78 * h, 0.38 * h));
    } else if (formId === 'ninefox') {
      for (var ti = 0; ti < 8; ti += 1) {
        var tt = (ti - 3.5) / 4;
        parts.push(cyl(0.012 * h, 0.065 * h, 0.78 * h, 5, ti % 2 ? '#F7F5F2' : '#E8D8C0', tt * 0.34 * h, 0.48 * h + Math.abs(tt) * 0.04 * h, -0.30 * h, 0.55, tt * 0.5, tt * 0.65));
      }
    } else if (formId === 'xuanwu') {
      for (var xi = 0; xi < 10; xi += 1) {
        var xa = xi / 10 * Math.PI * 1.65;
        parts.push(sphere(0.075 * h, 6, xi % 2 ? '#3E6B4A' : '#4A8A5A', Math.cos(xa) * 0.46 * h, 0.38 * h + Math.sin(xa) * 0.08 * h, Math.sin(xa) * 0.46 * h));
      }
      parts.push(sphere(0.12 * h, 7, '#4A8A5A', 0.48 * h, 0.66 * h, 0.10 * h, 1.2, 0.9, 1.1));
      parts.push(sphere(0.022 * h, 6, '#F2C94C', 0.42 * h, 0.70 * h, 0.17 * h));
      parts.push(sphere(0.022 * h, 6, '#F2C94C', 0.54 * h, 0.70 * h, 0.17 * h));
      parts.push(cyl(0.008 * h, 0.012 * h, 0.18 * h, 4, '#E85D5D', 0.50 * h, 0.60 * h, 0.23 * h, Math.PI / 2, 0, 0));
    } else if (formId === 'kun') {
      parts.push(cyl(0.008 * h, 0.022 * h, 0.52 * h, 4, gold, -0.055 * h, 0.42 * h, 0.42 * h, Math.PI / 2, 0, 0.15));
      parts.push(cyl(0.008 * h, 0.022 * h, 0.52 * h, 4, gold, 0.055 * h, 0.42 * h, 0.42 * h, Math.PI / 2, 0, -0.15));
      parts.push(cone(0.06 * h, 0.30 * h, 4, gold, 0, 0.62 * h, -0.12 * h, 0));
      featurePlane(group, 'kun-fin', drawFin, 0.62 * h, 0.52 * h, -0.48 * h, 0.50 * h, -0.02 * h, 0.35, true, 0xFFFFFF);
      featurePlane(group, 'kun-fin', drawFin, 0.62 * h, 0.52 * h, 0.48 * h, 0.50 * h, -0.02 * h, -0.35, false, 0xFFFFFF);
    }
    if (parts.length) group.add(makeMergedMesh(parts));
    return group.children.length ? group : null;
  }

  function buildFantasyExtras(formId, height) {
    var parts = [];
    var s = height / 2.4;
    if (formId === 'qiongqi' || formId === 'white_tiger') {
      parts.push(box(0.08 * s, 1.1 * s, 1.8 * s, formId === 'white_tiger' ? '#D6EAF8' : '#4A3A5A', -0.7 * s, 1.2 * s, 0, 0.5));
      parts.push(box(0.08 * s, 1.1 * s, 1.8 * s, formId === 'white_tiger' ? '#D6EAF8' : '#4A3A5A', 0.7 * s, 1.2 * s, 0, -0.5));
    }
    if (formId === 'ninefox') {
      for (var i = 0; i < 5; i += 1) {
        parts.push(cone(0.12 * s, 1.5 * s, 5, i % 2 ? '#F7C6D0' : '#F7F5F2', (i - 2) * 0.22 * s, 0.8 * s, -1.0 * s, 0.25 + (i - 2) * 0.12));
      }
    }
    if (formId === 'qilin') {
      parts.push(cone(0.12 * s, 0.8 * s, 5, '#F2C94C', -0.2 * s, 1.9 * s, 0.4 * s, 0.3));
      parts.push(cone(0.12 * s, 0.8 * s, 5, '#F2C94C', 0.2 * s, 1.9 * s, 0.4 * s, -0.3));
    }
    if (formId === 'baize') {
      parts.push(sphere(0.11 * s, 6, '#BB6BD9', 0, 1.45 * s, 0.55 * s));
    }
    if (formId === 'xuanwu') {
      parts.push(sphere(0.65 * s, 8, '#4A6B6A', 0, 0.85 * s, -0.1 * s, 1.1, 0.6, 1.2));
      parts.push(cyl(0.06 * s, 0.08 * s, 1.0 * s, 5, '#5FB86F', 0.5 * s, 1.0 * s, 0.3 * s, 0, 0, 0.6));
      parts.push(sphere(0.14 * s, 6, '#5FB86F', 0.75 * s, 1.35 * s, 0.3 * s));
    }
    if (!parts.length) return null;
    return makeMergedMesh(parts);
  }

  function getPortraitTexture(formId) {
    if (portraitTextures[formId]) return portraitTextures[formId];
    var tex = new THREE.Texture();
    tex.encoding = THREE.sRGBEncoding;
    tex.minFilter = THREE.LinearFilter;
    var img = new Image();
    img.onload = function () {
      tex.image = img;
      tex.needsUpdate = true;
    };
    img.onerror = function () {};
    img.src = './assets/renders/' + formId + '.png';
    portraitTextures[formId] = tex;
    return tex;
  }

  function decodePolyBytes(bytes) {
    if (!bytes || bytes.length < 44) return null;
    var magic = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
    var dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (magic === 'PFM1') {
      var count = dv.getUint32(4, true);
      if (!count || bytes.length < 32 + count * 12) return null;
      var min = [dv.getFloat32(8, true), dv.getFloat32(12, true), dv.getFloat32(16, true)];
      var max = [dv.getFloat32(20, true), dv.getFloat32(24, true), dv.getFloat32(28, true)];
      var range = [max[0] - min[0] || 1, max[1] - min[1] || 1, max[2] - min[2] || 1];
      var positions = new Float32Array(count * 3);
      var normals = new Float32Array(count * 3);
      var colors = new Float32Array(count * 3);
      for (var i = 0; i < count; i += 1) {
        var off = 32 + i * 12;
        var p = i * 3;
        positions[p] = min[0] + (dv.getInt16(off, true) + 32768) / 65535 * range[0];
        positions[p + 1] = min[1] + (dv.getInt16(off + 2, true) + 32768) / 65535 * range[1];
        positions[p + 2] = min[2] + (dv.getInt16(off + 4, true) + 32768) / 65535 * range[2];
        normals[p] = dv.getInt8(off + 6) / 127;
        normals[p + 1] = dv.getInt8(off + 7) / 127;
        normals[p + 2] = dv.getInt8(off + 8) / 127;
        colors[p] = dv.getUint8(off + 9) / 255;
        colors[p + 1] = dv.getUint8(off + 10) / 255;
        colors[p + 2] = dv.getUint8(off + 11) / 255;
      }
      return { positions: positions, normals: normals, colors: colors, min: min, max: max, count: count, indexed: false, hasTex: false };
    }
    if (magic === 'PFM2') {
      var vcount = dv.getUint32(4, true);
      var icount = dv.getUint32(8, true);
      var hasTex = !!bytes[36];
      var vstart = 40;
      var vlen = vcount * 16;
      var ilen = icount * 2;
      if (!vcount || !icount || bytes.length < vstart + vlen + ilen) return null;
      var vmin = [dv.getFloat32(12, true), dv.getFloat32(16, true), dv.getFloat32(20, true)];
      var vmax = [dv.getFloat32(24, true), dv.getFloat32(28, true), dv.getFloat32(32, true)];
      var vrange = [vmax[0] - vmin[0] || 1, vmax[1] - vmin[1] || 1, vmax[2] - vmin[2] || 1];
      var vpos = new Float32Array(vcount * 3);
      var vnor = new Float32Array(vcount * 3);
      var vcol = new Float32Array(vcount * 3);
      var vuv = new Float32Array(vcount * 2);
      for (var vi = 0; vi < vcount; vi += 1) {
        var vo = vstart + vi * 16;
        var vp = vi * 3;
        vpos[vp] = vmin[0] + (dv.getInt16(vo, true) + 32768) / 65535 * vrange[0];
        vpos[vp + 1] = vmin[1] + (dv.getInt16(vo + 2, true) + 32768) / 65535 * vrange[1];
        vpos[vp + 2] = vmin[2] + (dv.getInt16(vo + 4, true) + 32768) / 65535 * vrange[2];
        vnor[vp] = dv.getInt8(vo + 6) / 127;
        vnor[vp + 1] = dv.getInt8(vo + 7) / 127;
        vnor[vp + 2] = dv.getInt8(vo + 8) / 127;
        vcol[vp] = dv.getUint8(vo + 9) / 255;
        vcol[vp + 1] = dv.getUint8(vo + 10) / 255;
        vcol[vp + 2] = dv.getUint8(vo + 11) / 255;
        vuv[vi * 2] = dv.getUint16(vo + 12, true) / 65535;
        vuv[vi * 2 + 1] = dv.getUint16(vo + 14, true) / 65535;
      }
      var vidx = new Uint16Array(icount);
      for (var ii = 0; ii < icount; ii += 1) vidx[ii] = dv.getUint16(vstart + vlen + ii * 2, true);
      return { positions: vpos, normals: vnor, colors: vcol, uvs: vuv, indices: vidx, min: vmin, max: vmax, count: vcount, indexed: true, hasTex: hasTex };
    }
    return null;
  }

  function getPolyTexture(name) {
    if (!name) return null;
    if (modelTextureCache[name]) return modelTextureCache[name];
    var tex = new THREE.Texture();
    tex.encoding = THREE.sRGBEncoding;
    tex.flipY = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    var img = new Image();
    img.onload = function () {
      tex.image = img;
      tex.needsUpdate = true;
    };
    img.onerror = function () {};
    img.src = './assets/models/tex-' + name + '.png';
    modelTextureCache[name] = tex;
    return tex;
  }

  function decodePolyImage(img) {
    try {
      var w = img.naturalWidth || img.width;
      var h = img.naturalHeight || img.height;
      if (!w || !h) return null;
      var c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      var g = c.getContext('2d');
      if (!g) return null;
      g.drawImage(img, 0, 0);
      var rgba = g.getImageData(0, 0, w, h).data;
      var bytes = new Uint8Array(w * h * 3);
      for (var i = 0, j = 0; i < rgba.length; i += 4) {
        bytes[j] = rgba[i];
        bytes[j + 1] = rgba[i + 1];
        bytes[j + 2] = rgba[i + 2];
        j += 3;
      }
      return decodePolyBytes(bytes);
    } catch (e) {
      return null;
    }
  }

  function requestPolyBase(key, cb) {
    if (polyBaseCache[key]) {
      if (cb) cb(polyBaseCache[key]);
      return polyBaseCache[key];
    }
    if (polyImageState[key] === 'failed') {
      if (cb) cb(null);
      return null;
    }
    if (polyPending[key]) {
      if (cb) polyPending[key].push(cb);
      return null;
    }
    polyPending[key] = cb ? [cb] : [];
    polyImageState[key] = 'loading';
    var img = new Image();
    img.onload = function () {
      var base = decodePolyImage(img);
      if (base) polyBaseCache[key] = base;
      polyImageState[key] = base ? 'ready' : 'failed';
      img.onload = null;
      img.onerror = null;
      var list = polyPending[key] || [];
      polyPending[key] = [];
      for (var i = 0; i < list.length; i += 1) {
        try { list[i](base); } catch (e) {}
      }
    };
    img.onerror = function () {
      polyImageState[key] = 'failed';
      img.onload = null;
      img.onerror = null;
      var list = polyPending[key] || [];
      polyPending[key] = [];
      for (var i = 0; i < list.length; i += 1) {
        try { list[i](null); } catch (e) {}
      }
    };
    img.src = './assets/models/' + key + '.png';
    return null;
  }

  function getPolyBase(key) {
    return polyBaseCache[key] || null;
  }

  function styledPolyColors(base, style) {
    if (!style || (style.sat == null && !style.lift)) return base.colors;
    var src = base.colors;
    var out = new Float32Array(src.length);
    for (var i = 0; i < src.length; i += 3) {
      var l = (src[i] + src[i + 1] + src[i + 2]) / 3;
      var sat = style.sat == null ? 1 : style.sat;
      var lift = style.lift || 0;
      out[i] = Math.max(0, Math.min(1, l + (src[i] - l) * sat + lift));
      out[i + 1] = Math.max(0, Math.min(1, l + (src[i + 1] - l) * sat + lift));
      out[i + 2] = Math.max(0, Math.min(1, l + (src[i + 2] - l) * sat + lift));
    }
    return out;
  }

  function disposeAvatarObject(obj) {
    if (!obj) return;
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        for (var m = 0; m < obj.material.length; m += 1) if (obj.material[m]) obj.material[m].dispose();
      } else {
        obj.material.dispose();
      }
    }
    if (obj.children) {
      for (var c = 0; c < obj.children.length; c += 1) disposeAvatarObject(obj.children[c]);
    }
  }

  function tryBuildPolyAvatar(formId, height) {
    var key = MODEL_KEYS[formId];
    if (!key) return null;
    var base = getPolyBase(key);
    if (!base) {
      requestPolyBase(key, function (loaded) {
        if (loaded && currentFormId === formId) buildAvatar(formId);
      });
      return null;
    }
    var style = MODEL_STYLE[formId] || null;
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(base.positions, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(base.normals, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(styledPolyColors(base, style), 3));
    if (base.uvs) geo.setAttribute('uv', new THREE.BufferAttribute(base.uvs, 2));
    if (base.indexed && base.indices) geo.setIndex(new THREE.BufferAttribute(base.indices, 1));
    geo.computeBoundingSphere();
    var texName = MODEL_TEXTURE[formId];
    var texMap = base.hasTex && texName ? getPolyTexture(texName) : null;
    var mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      color: sRGB(style && style.tint ? style.tint : 0xFFFFFF),
      roughness: 0.9,
      metalness: 0,
      side: THREE.DoubleSide,
      map: texMap
    });
    var mesh = new THREE.Mesh(geo, mat);
    var min = base.min;
    var max = base.max;
    var w = max[0] - min[0];
    var h = max[1] - min[1];
    var d = max[2] - min[2];
    var maxDim = Math.max(w, h, d) || 1;
    var target = Math.max(1.7, height * 1.2);
    var scale = target / maxDim;
    mesh.position.set(-(min[0] + max[0]) / 2, -min[1], -(min[2] + max[2]) / 2);
    var pivot = new THREE.Group();
    pivot.add(mesh);
    pivot.scale.setScalar(scale);
    var scaledH = h * scale;
    var foot = Math.max(w, d) * scale;
    return {
      object: pivot,
      height: scaledH,
      shadowScale: Math.max(0.8, Math.min(1.8, foot / 1.6))
    };
  }

  function buildAvatar(formId) {
    if (!avatarHolder) return;
    var creature = window.Core.findCreature(formId);
    if (!creature) return;
    var height = 1.4 + Math.min(1.4, creature.power / 650);
    while (avatarHolder.children.length) {
      var old = avatarHolder.children[0];
      avatarHolder.remove(old);
      disposeAvatarObject(old);
    }
    avatarModel = null;
    var displayHeight = height;
    var shadowScale = 1;
    var poly = tryBuildPolyAvatar(formId, height);
    if (poly) {
      avatarHolder.add(poly.object);
      avatarModel = poly.object;
      displayHeight = poly.height;
      shadowScale = poly.shadowScale;
      var features = buildAvatarFeatures(formId, displayHeight);
      if (features) avatarHolder.add(features);
    } else {
      var mat = new THREE.SpriteMaterial({
        map: getPortraitTexture(formId),
        transparent: true,
        depthTest: true,
        depthWrite: false
      });
      if (PORTRAIT_TINT[formId]) mat.color.setHex(PORTRAIT_TINT[formId]);
      var sprite = new THREE.Sprite(mat);
      sprite.center.set(0.5, 0);
      sprite.scale.set(height * 1.25, height * 1.3, 1);
      sprite.position.y = 0;
      avatarHolder.add(sprite);
    }
    currentAvatarHeight = displayHeight;

    if (avatarShadow) avatarShadow.scale.setScalar(shadowScale);
    if (avatarGlow) {
      var tier = creature.tier;
      avatarGlow.visible = tier >= 4;
      avatarGlow.material.color.copy(sRGB(tier >= 5 ? 0xF2C94C : 0xBB6BD9));
      avatarGlow.scale.setScalar(poly ? shadowScale : height / 1.6);
    }
    if (avatarNameSprite) {
      avatarGroup.remove(avatarNameSprite);
      if (avatarNameSprite.material.map) avatarNameSprite.material.map.dispose();
      avatarNameSprite.material.dispose();
    }
    avatarNameSprite = makeAvatarName(creature.name, creature.element);
    if (avatarNameSprite) {
      avatarNameSprite.position.set(0, displayHeight + 0.9, 0);
      avatarGroup.add(avatarNameSprite);
    }
    currentFormId = formId;
  }

  function createAvatar() {
    avatarGroup = new THREE.Group();
    avatarHolder = new THREE.Group();
    avatarGroup.add(avatarHolder);
    var shadowGeo = new THREE.CircleBufferGeometry(0.65, 18);
    shadowGeo.rotateX(-Math.PI / 2);
    avatarShadow = new THREE.Mesh(shadowGeo, new THREE.MeshBasicMaterial({
      color: sRGB(0x1E3A2A), transparent: true, opacity: 0.26, depthWrite: false
    }));
    avatarShadow.position.y = 0.02;
    avatarGroup.add(avatarShadow);
    var glowGeo = new THREE.RingBufferGeometry(0.72, 0.92, 24);
    glowGeo.rotateX(-Math.PI / 2);
    avatarGlow = new THREE.Mesh(glowGeo, new THREE.MeshBasicMaterial({
      color: sRGB(0xF2C94C), transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false
    }));
    avatarGlow.position.y = 0.04;
    avatarGlow.visible = false;
    avatarGroup.add(avatarGlow);
    scene.add(avatarGroup);
  }

  /* ---------------- 交互标记 ---------------- */
  function createMarker() {
    markerSprite = makeTextSprite('点击互动', {
      bg: 'rgba(46,42,38,0.88)', color: '#FFF9E9', scaleX: 2.4, scaleY: 0.6, depthTest: false, renderOrder: 30
    });
    if (markerSprite) {
      markerSprite.visible = false;
      scene.add(markerSprite);
    }
    var ringGeo = new THREE.RingBufferGeometry(0.7, 1.0, 24);
    ringGeo.rotateX(-Math.PI / 2);
    markerRing = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({
      color: sRGB(0xFFF3B0), transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false
    }));
    markerRing.visible = false;
    scene.add(markerRing);
    var farmRingGeo = new THREE.RingBufferGeometry(1.55, 1.9, 32);
    farmRingGeo.rotateX(-Math.PI / 2);
    farmTargetRing = new THREE.Mesh(farmRingGeo, new THREE.MeshBasicMaterial({
      color: sRGB(0xD6B16F), transparent: true, opacity: 0.72, side: THREE.DoubleSide, depthWrite: false
    }));
    farmTargetRing.visible = false;
    scene.add(farmTargetRing);
  }

  /* ---------------- 渲染与输入 ---------------- */
  function resize() {
    if (!refs.stage || !renderer || !camera) return;
    var rect = refs.stage.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return;
    viewW = rect.width;
    viewH = rect.height;
    dpr = 1;
    renderer.setPixelRatio(dpr);
    renderer.setSize(viewW, viewH, false);
    camera.aspect = viewW / viewH;
    camera.updateProjectionMatrix();
  }

  function scheduleResize() {
    requestAnimationFrame(function () { resize(); });
    setTimeout(function () { resize(); }, 120);
  }

  function updateCamera(dt, snap) {
    var targetY = player.y + 2.0;
    if (snap || !camTarget) {
      camTarget = new THREE.Vector3(player.x, targetY, player.z);
    } else {
      camTarget.x = lerp(camTarget.x, player.x, 0.18);
      camTarget.y = lerp(camTarget.y, targetY, 0.18);
      camTarget.z = lerp(camTarget.z, player.z, 0.18);
    }
    var horiz = Math.cos(cam.pitch) * cam.distance;
    var desired = new THREE.Vector3(
      camTarget.x + Math.sin(cam.yaw) * horiz,
      camTarget.y + Math.sin(cam.pitch) * cam.distance,
      camTarget.z + Math.cos(cam.yaw) * horiz
    );
    var ground = terrainHeightAt(desired.x, desired.z);
    if (desired.y < ground + 0.8) desired.y = ground + 0.8;
    if (snap || !camDesired) {
      camDesired = desired;
      camera.position.copy(desired);
    } else {
      camDesired.x = lerp(camDesired.x, desired.x, 0.16);
      camDesired.y = lerp(camDesired.y, desired.y, 0.16);
      camDesired.z = lerp(camDesired.z, desired.z, 0.16);
      camera.position.copy(camDesired);
    }
    camera.lookAt(camTarget);
  }

  function walkableAtWorld(x, z) {
    var r = 0.34;
    var points = [
      [x - r, z - r], [x + r, z - r], [x - r, z + r], [x + r, z + r]
    ];
    for (var i = 0; i < points.length; i += 1) {
      var tx = Math.floor(points[i][0] / TILE);
      var tz = Math.floor(points[i][1] / TILE);
      if (!inBounds(tx, tz)) return false;
      if (map.solid[tz][tx]) return false;
    }
    return true;
  }

  function isWalkableTile(tx, ty) {
    if (!inBounds(tx, ty)) return false;
    return !map.solid[ty][tx];
  }

  function moveBy(dx, dz) {
    var nx = player.x + dx;
    if (walkableAtWorld(nx, player.z)) player.x = nx;
    var nz = player.z + dz;
    if (walkableAtWorld(player.x, nz)) player.z = nz;
    player.x = clamp(player.x, TILE * 0.6, WORLD_W - TILE * 0.6);
    player.z = clamp(player.z, TILE * 0.6, WORLD_H - TILE * 0.6);
    player.y = terrainHeightAt(player.x, player.z) + 0.02;
    dirty = true;
  }

  function findPath(goalX, goalZ) {
    if (!isWalkableTile(goalX, goalZ)) return null;
    var startX = Math.floor(player.x / TILE);
    var startZ = Math.floor(player.z / TILE);
    if (!isWalkableTile(startX, startZ)) return null;
    if (startX === goalX && startZ === goalZ) return [];
    var open = [startX + ',' + startZ];
    var came = {};
    var gScore = {};
    var fScore = {};
    var closed = {};
    gScore[startX + ',' + startZ] = 0;
    fScore[startX + ',' + startZ] = Math.abs(goalX - startX) + Math.abs(goalZ - startZ);
    var guard = 0;
    while (open.length && guard < 4000) {
      guard += 1;
      var bestIndex = 0;
      var bestKey = open[0];
      var bestF = fScore[bestKey] === undefined ? Infinity : fScore[bestKey];
      for (var i = 1; i < open.length; i += 1) {
        var key = open[i];
        var f = fScore[key] === undefined ? Infinity : fScore[key];
        if (f < bestF) { bestF = f; bestKey = key; bestIndex = i; }
      }
      open.splice(bestIndex, 1);
      if (closed[bestKey]) continue;
      closed[bestKey] = true;
      var parts = bestKey.split(',');
      var cx = parseInt(parts[0], 10);
      var cz = parseInt(parts[1], 10);
      if (cx === goalX && cz === goalZ) {
        var path = [];
        var cur = bestKey;
        while (cur) {
          var cp = cur.split(',');
          path.push({ x: (parseInt(cp[0], 10) + 0.5) * TILE, z: (parseInt(cp[1], 10) + 0.5) * TILE });
          cur = came[cur];
        }
        path.reverse();
        return smoothPath(path);
      }
      var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (var di = 0; di < dirs.length; di += 1) {
        var nx = cx + dirs[di][0];
        var nz = cz + dirs[di][1];
        if (!isWalkableTile(nx, nz)) continue;
        var nk = nx + ',' + nz;
        if (closed[nk]) continue;
        var tentative = (gScore[bestKey] || 0) + 1;
        if (gScore[nk] === undefined || tentative < gScore[nk]) {
          came[nk] = bestKey;
          gScore[nk] = tentative;
          fScore[nk] = tentative + Math.abs(goalX - nx) + Math.abs(goalZ - nz);
          if (open.indexOf(nk) < 0) open.push(nk);
        }
      }
    }
    return null;
  }

  function lineClear(a, b) {
    var dx = b.x - a.x;
    var dz = b.z - a.z;
    var len = Math.sqrt(dx * dx + dz * dz);
    var steps = Math.ceil(len / 0.4);
    for (var i = 1; i < steps; i += 1) {
      var t = i / steps;
      if (!walkableAtWorld(a.x + dx * t, a.z + dz * t)) return false;
    }
    return true;
  }

  function smoothPath(path) {
    if (path.length < 3) return path;
    var out = [path[0]];
    var i = 0;
    while (i < path.length - 1) {
      var j = path.length - 1;
      while (j > i + 1 && !lineClear(path[i], path[j])) j -= 1;
      out.push(path[j]);
      i = j;
    }
    return out;
  }

  function updateNearby() {
    var best = null;
    var bestDist = Infinity;
    for (var i = 0; i < map.buildings.length; i += 1) {
      var b = map.buildings[i];
      var d = dist2(player.x, player.z, b.approachX, b.approachZ);
      if (b.type === 'farm') {
        var ptx = player.x / TILE;
        var pty = player.z / TILE;
        if (ptx > b.x + 0.2 && ptx < b.x + b.w - 0.2 && pty > b.y + 0.2 && pty < b.y + b.h - 0.2) d = 0;
      }
      if (d < TILE * 2.5 && d < bestDist) { best = b; bestDist = d; }
    }
    nearby = best;
    updateInteractButton();
    if (markerSprite) {
      if (nearby && !decorateMode && !gardenMode && !inFarm) {
        markerSprite.visible = true;
        markerSprite.position.set(nearby.centerX, terrainHeightAt(nearby.centerX, nearby.centerZ) + nearby.labelY + 0.8, nearby.centerZ);
      } else {
        markerSprite.visible = false;
      }
    }
    if (markerRing) {
      if (nearby && !decorateMode && !gardenMode && !inFarm) {
        markerRing.visible = true;
        markerRing.position.set(nearby.approachX, terrainHeightAt(nearby.approachX, nearby.approachZ) + 0.06, nearby.approachZ);
      } else {
        markerRing.visible = false;
      }
    }
    if (nearby && player.pendingInteract === nearby) {
      triggerInteract(nearby);
    }
  }

  function updateInteractButton() {
    if (!refs.interactBtn || !refs.interactLabel) return;
    var label;
    var disabled;
    if (decorateMode) {
      label = '完成装饰';
      disabled = false;
    } else if (gardenMode) {
      label = '完成种植';
      disabled = false;
    } else if (nearby) {
      label = nearby.locked ? ('建设' + nearby.name) : ('进入' + nearby.name);
      disabled = false;
    } else {
      label = '靠近目标互动';
      disabled = true;
    }
    if (label !== lastInteractLabel) {
      lastInteractLabel = label;
      refs.interactLabel.textContent = label;
      refs.interactBtn.disabled = disabled;
    }
  }

  function triggerInteract(b) {
    if (!b) return;
    player.pendingInteract = null;
    player.path = [];
    savePlayerPos();
    if (b.type === 'shrine') window.UI.show('prep');
    else if (!buildingUnlocked(b.type)) {
      if (window.UI && window.UI.showBuild) window.UI.showBuild(b.type);
    }
    else if (b.type === 'farm') enterFarm();
    else if (b.type === 'shop') window.UI.show('shop');
    else if (b.type === 'house') window.UI.show('collection');
  }

  function interact() {
    if (!initialized) return;
    if (decorateMode) {
      setDecorateMode(false);
      return;
    }
    if (gardenMode) {
      setGardenMode(false);
      return;
    }
    if (nearby) {
      triggerInteract(nearby);
      return;
    }
    toast('靠近建筑后再互动');
  }

  function hitBuilding(wx, wz) {
    for (var i = 0; i < map.buildings.length; i += 1) {
      var b = map.buildings[i];
      var minX = b.x * TILE - 0.8;
      var maxX = (b.x + b.w) * TILE + 0.8;
      var minZ = b.y * TILE - 0.8;
      var maxZ = (b.y + b.h) * TILE + 0.8;
      if (wx >= minX && wx <= maxX && wz >= minZ && wz <= maxZ) return b;
    }
    return null;
  }

  function walkToTile(tx, ty) {
    var path = findPath(tx, ty);
    if (!path) {
      toast('这里走不过去');
      return;
    }
    player.path = path;
    player.pendingInteract = null;
  }

  function walkToBuilding(b) {
    if (dist2(player.x, player.z, b.approachX, b.approachZ) < TILE * 2.5) {
      triggerInteract(b);
      return;
    }
    var path = findPath(b.approach.x, b.approach.y);
    if (!path) {
      toast('暂时走不到' + b.name);
      return;
    }
    player.path = path;
    player.pendingInteract = b;
    showHint('前往' + b.name, 2200);
  }

  function followPath(dt) {
    if (!player.path.length) {
      player.moving = false;
      if (player.pendingInteract) {
        var target = player.pendingInteract;
        if (dist2(player.x, player.z, target.approachX, target.approachZ) < TILE * 2.5) triggerInteract(target);
        player.pendingInteract = null;
      }
      return;
    }
    var target = player.path[0];
    var dx = target.x - player.x;
    var dz = target.z - player.z;
    var len = Math.sqrt(dx * dx + dz * dz);
    if (len < 0.18) {
      player.path.shift();
      return;
    }
    var step = player.speed * dt;
    if (step > len) step = len;
    var beforeX = player.x;
    var beforeZ = player.z;
    moveBy(dx / len * step, dz / len * step);
    if (Math.abs(player.x - beforeX) < 0.001 && Math.abs(player.z - beforeZ) < 0.001) {
      player.path = [];
      player.moving = false;
      return;
    }
    player.moving = true;
    player.targetAngle = Math.atan2(dx, dz);
  }

  /* ---------------- 装饰模式 ---------------- */
  function setDecorateMode(on) {
    if (!initialized) return;
    if (on && !(window.Core && window.Core.isUnlocked('deco'))) {
      if (window.UI && window.UI.showBuild) window.UI.showBuild('deco');
      return;
    }
    if (on && gardenMode) {
      gardenMode = false;
      selectedPlant = null;
      if (refs.gardenDrawer) refs.gardenDrawer.hidden = true;
    }
    decorateMode = !!on;
    if (refs.decoDrawer) refs.decoDrawer.hidden = !decorateMode;
    if (decorateMode) {
      renderDecoList();
      showHint('选择装饰，点击附近草地摆放；点击已摆放的装饰可收回', 5200);
    } else {
      selectedDeco = null;
      showHint('装饰完成', 1800);
    }
    updateInteractButton();
  }

  function toggleDecorate() {
    if (!initialized) return;
    setDecorateMode(!decorateMode);
  }

  function selectDeco(id) {
    if (!initialized) return;
    var s = window.Core.getState();
    if ((s.decoBag[id] || 0) <= 0) return;
    selectedDeco = selectedDeco === id ? null : id;
    renderDecoList();
    if (selectedDeco) {
      var deco = window.Core.findDeco(selectedDeco);
      showHint('已选择' + (deco ? deco.name : '装饰') + '，点击附近草地摆放', 2600);
    }
  }

  function renderDecoList() {
    if (!refs.decoList) return;
    var s = window.Core.getState();
    var html = '';
    var has = false;
    for (var i = 0; i < D.DECORATIONS.length; i += 1) {
      var d = D.DECORATIONS[i];
      var count = s.decoBag[d.id] || 0;
      if (count <= 0) continue;
      has = true;
      html += '<button type="button" class="deco-item' + (selectedDeco === d.id ? ' is-selected' : '') + '" ' +
        'data-action="world-select-deco" data-deco="' + d.id + '">' +
        '<span class="deco-item-art">' + window.Art.deco(d.id) + '</span>' +
        '<span class="deco-item-name">' + d.name + '</span>' +
        '<span class="deco-item-count">x' + count + '</span>' +
        '<span class="deco-item-level">Lv.' + d.rarity + '</span>' +
        '<span class="deco-item-power">+' + d.power + '</span></button>';
    }
    if (!has) html = '<p class="deco-empty">没有可摆放的装饰。战斗胜利、收获作物或去杂货铺都能获得。</p>';
    refs.decoList.innerHTML = html;
  }

  function isPlaceableTile(tx, ty, ignoreDistance) {
    if (!inBounds(tx, ty)) return false;
    if (map.tiles[ty][tx] !== 3) return false;
    if (map.solid[ty][tx] || map.decoBlocked[ty][tx]) return false;
    if (window.Core.getDecoAt(tx, ty)) return false;
    if (!ignoreDistance && dist2(tx + 0.5, ty + 0.5, player.x / TILE, player.z / TILE) > 8) return false;
    return true;
  }

  function handleDecoTap(tx, ty) {
    if (!inBounds(tx, ty)) return;
    var existing = window.Core.getDecoAt(tx, ty);
    if (existing) {
      var removed = window.Core.removeDecoAt(tx, ty);
      if (removed) {
        var deco = window.Core.findDeco(removed);
        toast('已收回' + (deco ? deco.name : '装饰'));
        window.Core.saveState();
        refreshDecos();
        renderDecoList();
      }
      return;
    }
    if (!selectedDeco) { toast('先在下方选择一个装饰'); return; }
    if (map.tiles[ty][tx] !== 3) { toast('只能摆在草地上'); return; }
    if (map.solid[ty][tx] || map.decoBlocked[ty][tx]) { toast('这里被占用了'); return; }
    if (dist2(tx + 0.5, ty + 0.5, player.x / TILE, player.z / TILE) > 8) {
      toast('离得太远了，走近一点再摆放');
      return;
    }
    if (window.Core.placeDecoAt(selectedDeco, tx, ty)) {
      toast('摆放成功');
      var s = window.Core.getState();
      if ((s.decoBag[selectedDeco] || 0) <= 0) selectedDeco = null;
      window.Core.saveState();
      refreshDecos();
      renderDecoList();
    } else {
      toast('摆放失败，请换个位置');
    }
  }

  /* ---------------- 自由种植 ---------------- */
  function plantMaterial(variant) {
    if (variant === 'grass') {
      return new THREE.MeshLambertMaterial({
        map: getWorldTexture('grass-tuft', drawGrassTuft),
        transparent: true,
        alphaTest: 0.22,
        side: THREE.DoubleSide
      });
    }
    return new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  }

  function drawLeafCluster(g, S) {
    g.clearRect(0, 0, S, S);
    var colors = ['#3C6B37', '#4A7B40', '#598D49', '#6A9E54', '#7DB162', '#8FC272'];
    var cx = S * 0.5;
    var cy = S * 0.5;
    for (var i = 0; i < 26; i += 1) {
      var a = i / 26 * Math.PI * 2 + hash(i, 601) * 0.7;
      var r = S * (0.10 + hash(i, 603) * 0.32);
      var lx = cx + Math.cos(a) * r;
      var ly = cy + Math.sin(a) * r;
      var len = S * (0.075 + hash(i, 607) * 0.075);
      var wid = len * (0.42 + hash(i, 609) * 0.18);
      g.save();
      g.translate(lx, ly);
      g.rotate(a + (hash(i, 611) - 0.5) * 0.7);
      g.fillStyle = colors[i % colors.length];
      g.globalAlpha = 0.90 + hash(i, 613) * 0.10;
      g.beginPath();
      g.ellipse(len * 0.4, 0, len, wid, 0, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = 'rgba(38,66,32,0.55)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(len * 1.25, 0);
      g.stroke();
      g.strokeStyle = 'rgba(210,232,170,0.30)';
      g.lineWidth = 0.8;
      g.beginPath();
      g.moveTo(len * 0.15, -wid * 0.35);
      g.lineTo(len * 1.0, -wid * 0.35);
      g.stroke();
      g.restore();
    }
    g.globalAlpha = 1;
  }

  function drawBushLeaves(g, S) {
    g.clearRect(0, 0, S, S);
    var colors = ['#315D2F', '#3F7139', '#4F8342', '#61964D', '#76AA5B', '#8BBD70'];
    for (var i = 0; i < 34; i += 1) {
      var a = i / 34 * Math.PI * 2 + hash(i, 621) * 0.9;
      var r = S * (0.06 + hash(i, 623) * 0.35);
      var lx = S * 0.5 + Math.cos(a) * r;
      var ly = S * 0.5 + Math.sin(a) * r * 0.82;
      var len = S * (0.055 + hash(i, 627) * 0.055);
      var wid = len * 0.46;
      g.save();
      g.translate(lx, ly);
      g.rotate(a + (hash(i, 629) - 0.5) * 1.0);
      g.fillStyle = colors[i % colors.length];
      g.beginPath();
      g.ellipse(0, 0, len, wid, 0, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = 'rgba(220,240,180,0.24)';
      g.lineWidth = 0.8;
      g.beginPath();
      g.moveTo(-len * 0.8, 0);
      g.lineTo(len * 0.8, 0);
      g.stroke();
      g.restore();
    }
  }

  function drawPineSpray(g, S) {
    g.clearRect(0, 0, S, S);
    var baseX = S * 0.12;
    var baseY = S * 0.5;
    g.strokeStyle = '#5A432A';
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(baseX, baseY);
    g.quadraticCurveTo(S * 0.52, baseY - 4, S * 0.95, baseY + 2);
    g.stroke();
    for (var i = 0; i < 78; i += 1) {
      var t = hash(i, 641);
      var x = baseX + t * S * 0.82;
      var side = i % 2 === 0 ? -1 : 1;
      var len = S * (0.10 + hash(i, 643) * 0.24) * (0.65 + t * 0.5);
      var ang = -Math.PI / 2 + side * (0.55 + hash(i, 647) * 0.65);
      var nx = x + Math.cos(ang) * len;
      var ny = baseY + Math.sin(ang) * len;
      g.strokeStyle = i % 5 === 0 ? '#6E8E4A' : (i % 3 === 0 ? '#395C33' : '#4B753F');
      g.globalAlpha = 0.78 + hash(i, 649) * 0.22;
      g.lineWidth = 1.1 + hash(i, 653) * 1.2;
      g.beginPath();
      g.moveTo(x, baseY + (side < 0 ? 1 : -1) * 1.2);
      g.lineTo(nx, ny);
      g.stroke();
    }
    g.globalAlpha = 1;
  }

  function drawPalmLeaf(g, S) {
    g.clearRect(0, 0, S, S);
    var midY = S * 0.5;
    g.strokeStyle = '#7A6236';
    g.lineWidth = 3.2;
    g.beginPath();
    g.moveTo(S * 0.06, midY + 2);
    g.quadraticCurveTo(S * 0.55, midY - 3, S * 0.97, midY + 1);
    g.stroke();
    for (var i = 0; i < 64; i += 1) {
      var t = 0.10 + hash(i, 661) * 0.82;
      var x = S * 0.06 + t * S * 0.90;
      var side = i % 2 === 0 ? -1 : 1;
      var len = S * (0.035 + hash(i, 663) * 0.095) * (1.1 - Math.abs(t - 0.55) * 0.9);
      var ang = -Math.PI / 2 + side * (0.75 + hash(i, 667) * 0.45);
      var nx = x + Math.cos(ang) * len;
      var ny = midY + Math.sin(ang) * len;
      g.strokeStyle = i % 4 === 0 ? '#6D9C50' : (i % 3 === 0 ? '#477D3D' : '#588C46');
      g.lineWidth = 1.5 + hash(i, 669) * 1.3;
      g.beginPath();
      g.moveTo(x, midY);
      g.lineTo(nx, ny);
      g.stroke();
    }
  }

  var PLANT_FOLIAGE = {
    treeA: { tex: 'leaf-cards', draw: drawLeafCluster, count: 34, long: 0.66, tall: 0.54 },
    treeB: { tex: 'pine-cards', draw: drawPineSpray, count: 32, long: 0.72, tall: 0.40 },
    treeC: { tex: 'palm-cards', draw: drawPalmLeaf, count: 16, long: 1.45, tall: 0.46 },
    bush: { tex: 'bush-cards', draw: drawBushLeaves, count: 20, long: 0.46, tall: 0.37 }
  };
  var foliageGeometries = {};

  function buildFoliageGeometry(variant) {
    if (foliageGeometries[variant]) return foliageGeometries[variant];
    var cfg = PLANT_FOLIAGE[variant];
    if (!cfg) return null;
    var positions = [];
    var uvs = [];
    var indices = [];
    var offset = 0;
    var normalAxis = new THREE.Vector3(0, 0, 1);
    for (var i = 0; i < cfg.count; i += 1) {
      var w = cfg.long * (0.80 + hash(i, 701) * 0.40);
      var h = cfg.tall * (0.80 + hash(i, 703) * 0.40);
      var g = new THREE.PlaneBufferGeometry(w, h);
      var pos = new THREE.Vector3();
      var normal = new THREE.Vector3();
      if (variant === 'treeA') {
        var ta = hash(i, 709) * Math.PI * 2;
        var tv = 0.12 + hash(i, 711) * 0.82;
        var phi = Math.acos(1 - 2 * tv);
        var dir = new THREE.Vector3(
          Math.cos(ta) * Math.sin(phi),
          Math.cos(phi) * 1.10,
          Math.sin(ta) * Math.sin(phi)
        );
        pos.set(0.02 + dir.x * 1.12, 4.03 + dir.y * 0.92, dir.z * 1.10);
        normal.set(dir.x, dir.y * 0.9 + 0.18, dir.z).normalize();
      } else if (variant === 'bush') {
        var ba = hash(i, 709) * Math.PI * 2;
        var bv = hash(i, 711);
        var bphi = Math.acos(1 - 2 * bv);
        var bdir = new THREE.Vector3(
          Math.cos(ba) * Math.sin(bphi),
          Math.cos(bphi) * 1.15,
          Math.sin(ba) * Math.sin(bphi)
        );
        pos.set(bdir.x * 0.60, 0.61 + bdir.y * 0.42, bdir.z * 0.55);
        normal.set(bdir.x, bdir.y * 0.8 + 0.25, bdir.z).normalize();
      } else if (variant === 'treeB') {
        var by = 1.95 + hash(i, 709) * 3.55;
        var br = Math.max(0.22, (1.95 - (by - 1.55) * 0.31) * 0.74);
        var baa = hash(i, 711) * Math.PI * 2;
        pos.set(Math.cos(baa) * br, by, Math.sin(baa) * br);
        normal.set(Math.cos(baa) * 0.82, 0.52, Math.sin(baa) * 0.82).normalize();
      } else {
        var pa = hash(i, 709) * Math.PI * 2;
        var pr = 0.45 + hash(i, 711) * 1.25;
        pos.set(Math.cos(pa) * pr + 0.18, 4.28 + hash(i, 713) * 0.55, Math.sin(pa) * pr);
        normal.set(Math.cos(pa) * 0.42, 1, Math.sin(pa) * 0.42).normalize();
      }
      var quat = new THREE.Quaternion().setFromUnitVectors(normalAxis, normal);
      var roll = new THREE.Quaternion().setFromAxisAngle(normalAxis, (hash(i, 715) - 0.5) * 2.6);
      quat.multiply(roll);
      var m = new THREE.Matrix4().compose(pos, quat, new THREE.Vector3(1, 1, 1));
      g.applyMatrix4(m);
      var pArr = g.attributes.position.array;
      var uv = g.attributes.uv.array;
      var idx = g.index.array;
      for (var k = 0; k < pArr.length; k += 1) positions.push(pArr[k]);
      for (var u = 0; u < uv.length; u += 1) uvs.push(uv[u]);
      for (var n = 0; n < idx.length; n += 1) indices.push(idx[n] + offset);
      offset += pArr.length / 3;
      g.dispose();
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    foliageGeometries[variant] = geo;
    return geo;
  }

  var grassBaseGeometry = null;

  function buildGrassBaseGeometry() {
    if (grassBaseGeometry) return grassBaseGeometry;
    var parts = [];
    var gcol = ['#315B31', '#3C6938', '#477640', '#528246'];
    for (var i = 0; i < 7; i += 1) {
      var a = i / 7 * Math.PI * 2;
      var r = i === 0 ? 0 : 0.30 + (i % 3) * 0.10;
      parts.push(part(
        new THREE.IcosahedronBufferGeometry(0.38 + (i % 2) * 0.08, 0),
        gcol[i % gcol.length],
        Math.cos(a) * r, 0.10 + (i % 3) * 0.025, Math.sin(a) * r,
        0, a, 0, 1.25, 0.28, 1.10
      ));
    }
    grassBaseGeometry = mergeParts(parts);
    return grassBaseGeometry;
  }

  function addGrassBases(matrices, count) {
    if (!count) return;
    var geo = buildGrassBaseGeometry();
    var mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
    var inst = new THREE.InstancedMesh(geo, mat, count);
    for (var i = 0; i < count; i += 1) inst.setMatrixAt(i, matrices[i]);
    inst.instanceMatrix.needsUpdate = true;
    inst.frustumCulled = false;
    scene.add(inst);
    plantMeshes.push(inst);
  }

  function addPlantCards(variant, matrices, count) {
    var cfg = PLANT_FOLIAGE[variant];
    if (!cfg || !count) return;
    var geo = buildFoliageGeometry(variant);
    if (!geo) return;
    var mat = new THREE.MeshLambertMaterial({
      map: getWorldTexture(cfg.tex, cfg.draw),
      transparent: true,
      alphaTest: 0.34,
      side: THREE.DoubleSide,
      depthWrite: true
    });
    var inst = new THREE.InstancedMesh(geo, mat, count);
    for (var i = 0; i < count; i += 1) inst.setMatrixAt(i, matrices[i]);
    inst.instanceMatrix.needsUpdate = true;
    inst.frustumCulled = false;
    scene.add(inst);
    plantMeshes.push(inst);
  }

  function restorePlantSolid() {
    for (var key in plantSolidTiles) {
      if (!Object.prototype.hasOwnProperty.call(plantSolidTiles, key)) continue;
      var parts = key.split(',');
      var x = parseInt(parts[0], 10);
      var y = parseInt(parts[1], 10);
      if (inBounds(x, y)) map.solid[y][x] = plantSolidTiles[key];
    }
    plantSolidTiles = {};
  }

  function refreshPlants() {
    if (!map || !scene) return;
    for (var i = 0; i < plantMeshes.length; i += 1) {
      var old = plantMeshes[i];
      scene.remove(old);
      if (old.material) old.material.dispose();
    }
    plantMeshes = [];
    restorePlantSolid();
    var s = window.Core.getState();
    if (!s || !s.plants || !s.plants.length) return;
    var byVariant = {};
    var shadows = [];
    for (i = 0; i < s.plants.length; i += 1) {
      var placed = s.plants[i];
      var def = window.Core.findPlant(placed.id);
      if (!def) continue;
      var variant = def.variant;
      var x = (placed.x + 0.5) * TILE;
      var z = (placed.y + 0.5) * TILE;
      var y = terrainHeightAt(x, z);
      var rot = hash(placed.x + 13, placed.y + 17) * Math.PI * 2;
      var scale = 0.90 + hash(placed.x + 19, placed.y + 23) * 0.26;
      if (variant === 'grass') scale = 1.14 + hash(placed.x + 19, placed.y + 23) * 0.36;
      else if (variant === 'flower' || variant === 'fern' || variant === 'mushroom' || variant === 'reed' || variant === 'pebble') {
        scale = 0.94 + hash(placed.x + 19, placed.y + 23) * 0.30;
      }
      if (!byVariant[variant]) byVariant[variant] = [];
      byVariant[variant].push({ x: x, y: y, z: z, rot: rot, scale: scale, def: def });
      var shadowSize = SHADOW_SIZE[variant];
      if (shadowSize) shadows.push({ x: x, y: y, z: z, size: shadowSize * scale });
      if (def.solid) {
        var key = placed.x + ',' + placed.y;
        if (!Object.prototype.hasOwnProperty.call(plantSolidTiles, key)) {
          plantSolidTiles[key] = map.solid[placed.y][placed.x];
        }
        map.solid[placed.y][placed.x] = true;
      }
    }
    for (var name in byVariant) {
      if (!Object.prototype.hasOwnProperty.call(byVariant, name)) continue;
      var list = byVariant[name];
      var geo = buildSceneryGeometry(name);
      var mat = plantMaterial(name);
      var inst = new THREE.InstancedMesh(geo, mat, list.length);
      var matrix = new THREE.Matrix4();
      var quat = new THREE.Quaternion();
      var scaleVec = new THREE.Vector3();
      var matrices = [];
      for (var k = 0; k < list.length; k += 1) {
        quat.setFromEuler(new THREE.Euler(0, list[k].rot, 0));
        scaleVec.set(list[k].scale, list[k].scale, list[k].scale);
        matrix.compose(new THREE.Vector3(list[k].x, list[k].y, list[k].z), quat, scaleVec);
        matrices.push(matrix.clone());
        inst.setMatrixAt(k, matrix);
      }
      inst.instanceMatrix.needsUpdate = true;
      inst.frustumCulled = false;
      scene.add(inst);
      plantMeshes.push(inst);
      addPlantCards(name, matrices, list.length);
      if (name === 'grass') addGrassBases(matrices, list.length);
    }
    if (shadows.length) {
      var shadowGeo = new THREE.PlaneBufferGeometry(1, 1);
      shadowGeo.rotateX(-Math.PI / 2);
      var shadowMat = new THREE.MeshBasicMaterial({
        map: getWorldTexture('scenery-shadow', drawShadowTexture),
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1
      });
      var shadowInst = new THREE.InstancedMesh(shadowGeo, shadowMat, shadows.length);
      var sm = new THREE.Matrix4();
      var sq = new THREE.Quaternion();
      var sv = new THREE.Vector3();
      for (var sh = 0; sh < shadows.length; sh += 1) {
        sv.set(shadows[sh].size, 1, shadows[sh].size * 0.7);
        sm.compose(new THREE.Vector3(shadows[sh].x + 0.2, shadows[sh].y + 0.035, shadows[sh].z + 0.16), sq, sv);
        shadowInst.setMatrixAt(sh, sm);
      }
      shadowInst.instanceMatrix.needsUpdate = true;
      scene.add(shadowInst);
      plantMeshes.push(shadowInst);
    }
  }

  function setGardenMode(on) {
    if (!initialized) return;
    if (on && !(window.Core && window.Core.isUnlocked('garden'))) {
      if (window.UI && window.UI.showBuild) window.UI.showBuild('garden');
      return;
    }
    if (on && decorateMode) {
      decorateMode = false;
      if (refs.decoDrawer) refs.decoDrawer.hidden = true;
      selectedDeco = null;
    }
    gardenMode = !!on;
    if (refs.gardenDrawer) refs.gardenDrawer.hidden = !gardenMode;
    if (gardenMode) {
      renderGardenList();
      showHint('选择植物，点击附近草地种植；点击已有植物可以拔除', 5600);
    } else {
      selectedPlant = null;
      showHint('种植完成', 1800);
    }
    updateInteractButton();
  }

  function toggleGarden() {
    if (!initialized) return;
    setGardenMode(!gardenMode);
  }

  function selectPlant(id) {
    if (!initialized) return;
    var def = window.Core.findPlant(id);
    if (!def) return;
    selectedPlant = selectedPlant === id ? null : id;
    renderGardenList();
    if (selectedPlant) showHint('已选择' + def.name + '，点击附近地面种植', 2400);
  }

  function renderGardenList() {
    if (!refs.gardenList) return;
    var s = window.Core.getState();
    if (refs.gardenDrawer) {
      var hintEl = refs.gardenDrawer.querySelector('.garden-drawer-head span');
      if (hintEl) hintEl.textContent = '已种 ' + s.plants.length + '/' + D.CONFIG.maxPlants + ' · 草簇免费 · 点植物可拔除';
    }
    var html = '';
    for (var i = 0; i < D.PLANTS.length; i += 1) {
      var def = D.PLANTS[i];
      var afford = def.cost === 0 || s.coins >= def.cost;
      html += '<button type="button" class="garden-item' + (selectedPlant === def.id ? ' is-selected' : '') +
        (afford ? '' : ' is-locked') + '" data-action="world-select-plant" data-plant="' + def.id + '">' +
        '<span class="garden-item-ico">' + window.Art.icon(def.icon, def.solid ? '#8FB8E8' : '#9FD49B') + '</span>' +
        '<span class="garden-item-name">' + def.name + '</span>' +
        '<span class="garden-item-cost">' + (def.cost ? def.cost + ' 金币' : '免费') + '</span>' +
        '</button>';
    }
    refs.gardenList.innerHTML = html;
  }

  function gardenTileOk(tx, ty) {
    if (!inBounds(tx, ty)) return false;
    var tile = map.tiles[ty][tx];
    if (tile !== 3 && tile !== 2) return false;
    if (map.solid[ty][tx] || map.decoBlocked[ty][tx]) return false;
    if (window.Core.getDecoAt(tx, ty)) return false;
    if (window.Core.getPlantAt && window.Core.getPlantAt(tx, ty)) return false;
    if (Math.floor(player.x / TILE) === tx && Math.floor(player.z / TILE) === ty) return false;
    return true;
  }

  function handleGardenTap(tx, ty) {
    if (!inBounds(tx, ty)) return;
    if (window.Core.getPlantAt && window.Core.getPlantAt(tx, ty)) {
      var removed = window.Core.removePlantAt(tx, ty);
      if (removed) {
        toast('已拔除' + removed.name);
        window.Core.saveState();
        refreshPlants();
        if (window.UI && window.UI.renderHUD) window.UI.renderHUD();
        renderGardenList();
      }
      return;
    }
    if (!selectedPlant) { toast('先在下方选择一种植物'); return; }
    var def = window.Core.findPlant(selectedPlant);
    if (!def) return;
    if (!gardenTileOk(tx, ty)) {
      if (map.tiles[ty][tx] === 4) toast('小路和广场上不能种植');
      else if (map.tiles[ty][tx] === 5) toast('水里不能种植，可以种在岸边');
      else toast('这里被占用了，换一块草地吧');
      return;
    }
    if (dist2(tx + 0.5, ty + 0.5, player.x / TILE, player.z / TILE) > 10) {
      toast('离得太远了，走近一点再种');
      return;
    }
    var result = window.Core.buyPlant(selectedPlant, tx, ty);
    if (!result.ok) {
      toast(result.reason || '种不下去');
      return;
    }
    toast(result.def.cost ? ('种下了' + result.def.name) : '铺上了一片' + result.def.name);
    window.Core.saveState();
    refreshPlants();
    if (window.UI && window.UI.renderHUD) window.UI.renderHUD();
    renderGardenList();
    var st = window.Core.getState();
    if (st.coins < def.cost && def.cost > 0) selectedPlant = 'grass';
    renderGardenList();
  }

  /* ---------------- 玩家更新 ---------------- */
  function updatePlayer(dt) {
    var kx = 0;
    var ky = 0;
    if (keys.w || keys.arrowup) ky += 1;
    if (keys.s || keys.arrowdown) ky -= 1;
    if (keys.d || keys.arrowright) kx += 1;
    if (keys.a || keys.arrowleft) kx -= 1;
    var ix = input.x + kx;
    var iy = -input.y + ky;
    var len = Math.sqrt(ix * ix + iy * iy);
    if (len > 0.12) {
      ix /= len;
      iy /= len;
      var forward = new THREE.Vector3(-Math.sin(cam.yaw), 0, -Math.cos(cam.yaw));
      var right = new THREE.Vector3(Math.cos(cam.yaw), 0, -Math.sin(cam.yaw));
      var move = new THREE.Vector3();
      move.addScaledVector(forward, iy);
      move.addScaledVector(right, ix);
      if (move.lengthSq() > 0.0001) {
        move.normalize();
        player.path = [];
        player.pendingInteract = null;
        moveBy(move.x * player.speed * dt, move.z * player.speed * dt);
        player.moving = true;
        player.targetAngle = Math.atan2(move.x, move.z);
      }
    } else if (player.path.length) {
      followPath(dt);
    } else {
      player.moving = false;
    }

    player.angle = lerpAngle(player.angle, player.targetAngle, 0.22);
    if (avatarGroup) {
      avatarGroup.position.set(player.x, player.y, player.z);
      avatarGroup.rotation.y = player.angle;
      var bob = player.moving ? Math.sin(time * 9) * 0.04 : Math.sin(time * 2.2) * 0.02;
      avatarHolder.position.y = bob;
      if (avatarModel) {
        if (player.moving) {
          avatarModel.rotation.z = Math.sin(time * 8) * 0.03;
          avatarModel.rotation.x = Math.cos(time * 8) * 0.018;
          avatarModel.position.y = Math.abs(Math.sin(time * 8)) * 0.035;
        } else {
          avatarModel.rotation.z *= 0.85;
          avatarModel.rotation.x *= 0.85;
          avatarModel.position.y *= 0.85;
        }
      }
    }
    if (avatarGlow && avatarGlow.visible) {
      avatarGlow.rotation.y = time * 0.8;
      avatarGlow.material.opacity = 0.35 + Math.sin(time * 3) * 0.18;
    }

    updateCamera(dt, false);
  }

  function update(dt) {
    time += dt;
    updatePlayer(dt);
    var now = Date.now();
    if (now - lastNearCheck > 140) {
      lastNearCheck = now;
      updateNearby();
    }
    if (now - lastFarmCheck > 220) {
      lastFarmCheck = now;
      updateFarmMode();
    }
    if (inFarm && now - lastFarmCrops > 2500) {
      lastFarmCrops = now;
      refreshFarmCrops();
    }
    if (dirty && now - lastSave > 2200) {
      lastSave = now;
      dirty = false;
      savePlayerPos();
    }
    if (now - lastMinimap > 400) {
      lastMinimap = now;
      drawMinimap();
    }
    if (now - lastPlace > 400) {
      lastPlace = now;
      updatePlaceName();
    }
    if (waterMesh) {
      waterMesh.position.y = WATER_Y + Math.sin(time * 0.7) * 0.015;
      waterMesh.material.opacity = 0.82 + Math.sin(time * 0.5) * 0.03;
      if (waterMesh.material.map) {
        waterMesh.material.map.offset.x = time * 0.008;
        waterMesh.material.map.offset.y = time * 0.005;
      }
    }
    updateAmbient(dt);
    if (sunMesh) sunMesh.rotation.y += dt * 0.02;
    for (var i = 0; i < clouds.length; i += 1) {
      clouds[i].position.x += dt * 0.08 * (i % 2 === 0 ? 1 : -1);
      if (clouds[i].position.x > 55) clouds[i].position.x = -55;
      if (clouds[i].position.x < -55) clouds[i].position.x = 55;
    }
    if (markerRing && markerRing.visible) {
      var pulse = 1 + Math.sin(time * 4) * 0.12;
      markerRing.scale.set(pulse, 1, pulse);
      markerRing.material.opacity = 0.45 + Math.sin(time * 4) * 0.2;
    }
    if (farmTargetRing && farmTargetRing.visible) {
      var farmPulse = 1 + Math.sin(time * 4.4) * 0.05;
      farmTargetRing.scale.set(farmPulse, 1, farmPulse);
      farmTargetRing.material.opacity = 0.55 + Math.sin(time * 4.4) * 0.18;
    }
    if (map) {
      for (var bi = 0; bi < map.buildings.length; bi += 1) {
        var b = map.buildings[bi];
        if (b.rune) {
          b.rune.rotation.y += dt * 1.2;
          b.rune.position.y = terrainHeightAt(b.centerX, b.centerZ) + 2.7 + Math.sin(time * 2) * 0.08;
        }
      }
    }
  }

  function savePlayerPos() {
    if (!initialized) return;
    var s = window.Core.getState();
    s.playerPos = { x: player.x / TILE, y: player.z / TILE };
    window.Core.saveState();
  }

  function updatePlaceName() {
    var tx = Math.floor(player.x / TILE);
    var ty = Math.floor(player.z / TILE);
    var name = '中央草原';
    var st = window.Core.getState();
    var unlocks = (st && st.unlocks) || {};
    if (ty < 12) name = '北岸 · 战斗祭坛';
    else if (tx < 14 && ty >= 24 && ty <= 36) name = unlocks.farm ? '西侧 · 小农田' : '西侧 · 预留农田';
    else if (tx > 27 && ty >= 24 && ty <= 36) name = unlocks.shop ? '东侧 · 杂货铺' : '东侧 · 预留商铺';
    else if (ty > 37) name = unlocks.house ? '南岸 · 我的小屋' : '南岸 · 预留空地';
    else if (dist2(tx, ty, 9, 15) < 6) name = '林间水塘';
    var text = '青青小岛 · ' + name;
    if (text !== placeText) {
      placeText = text;
      setText(refs.place, text);
    }
  }

  function drawMinimap() {
    if (!mctx || !minimapBase) return;
    mctx.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height);
    mctx.imageSmoothingEnabled = false;
    mctx.drawImage(minimapBase, 0, 0, minimapCanvas.width, minimapCanvas.height);
    var s = window.Core.getState();
    mctx.fillStyle = '#F2C94C';
    for (var i = 0; i < s.worldDecos.length; i += 1) {
      var d = s.worldDecos[i];
      mctx.fillRect(d.x / COLS * minimapCanvas.width, d.y / ROWS * minimapCanvas.height, 1.6, 1.6);
    }
    for (i = 0; i < s.plants.length; i += 1) {
      var pl = s.plants[i];
      var pdef = window.Core.findPlant(pl.id);
      mctx.fillStyle = pdef && pdef.solid ? '#356B3E' : '#79B86A';
      mctx.fillRect(pl.x / COLS * minimapCanvas.width, pl.y / ROWS * minimapCanvas.height, 1.4, 1.4);
    }
    var px = player.x / WORLD_W * minimapCanvas.width;
    var py = player.z / WORLD_H * minimapCanvas.height;
    mctx.save();
    mctx.translate(px, py);
    mctx.rotate(Math.PI - player.angle);
    mctx.fillStyle = '#FFFFFF';
    mctx.strokeStyle = '#2E2A26';
    mctx.lineWidth = 1.2;
    mctx.beginPath();
    mctx.moveTo(0, -4);
    mctx.lineTo(3, 4);
    mctx.lineTo(-3, 4);
    mctx.closePath();
    mctx.fill();
    mctx.stroke();
    mctx.restore();
  }

  function buildMinimapBase() {
    var c = document.createElement('canvas');
    c.width = COLS;
    c.height = ROWS;
    var g = c.getContext('2d');
    if (!g) return c;
    for (var y = 0; y < ROWS; y += 1) {
      for (var x = 0; x < COLS; x += 1) {
        g.fillStyle = TILE_COLORS[map.tiles[y][x]] || '#6FA85F';
        g.fillRect(x, y, 1, 1);
      }
    }
    for (var i = 0; i < map.buildings.length; i += 1) {
      var b = map.buildings[i];
      g.fillStyle = b.type === 'shrine' ? '#F2C94C' : (b.type === 'shop' ? '#F26B3F' : (b.type === 'house' ? '#A97142' : '#3E8E4E'));
      g.fillRect(b.x, b.y, b.w, b.h);
    }
    return c;
  }

  function showHint(text, duration) {
    if (!refs.hint) return;
    refs.hint.textContent = text;
    refs.hint.classList.add('is-visible');
    if (hintTimer) clearTimeout(hintTimer);
    hintTimer = setTimeout(function () {
      refs.hint.classList.remove('is-visible');
      hintTimer = null;
    }, duration || 3500);
  }

  function pauseLoop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    running = false;
  }

  function loop(timestamp) {
    if (!active) return;
    var dt = (timestamp - lastTime) / 1000;
    if (!isFinite(dt) || dt <= 0) dt = 0.016;
    if (dt > 0.05) dt = 0.05;
    lastTime = timestamp;
    try {
      update(dt);
      renderer.render(scene, camera);
      errorCount = 0;
    } catch (error) {
      errorCount += 1;
      if (window.console) console.error(error);
      if (errorCount >= 5) {
        pauseLoop();
        toast('3D 世界渲染出现异常，已暂停。请返回小岛后重试。');
        return;
      }
    }
    rafId = requestAnimationFrame(loop);
    running = true;
  }

  function syncFromState() {
    var s = window.Core.getState();
    player.x = s.playerPos.x * TILE;
    player.z = s.playerPos.y * TILE;
    if (!walkableAtWorld(player.x, player.z)) {
      player.x = W.spawn.x * TILE;
      player.z = W.spawn.y * TILE;
    }
    player.y = terrainHeightAt(player.x, player.z) + 0.02;
    player.path = [];
    player.pendingInteract = null;
    player.moving = false;
    player.targetAngle = Math.PI;
    player.angle = Math.PI;
    if (avatarGroup) avatarGroup.position.set(player.x, player.y, player.z);
    buildAvatar(s.formId);
    refreshDecos();
    refreshPlants();
    refreshFarmCrops();
    updateNearby();
    updatePlaceName();
    updateCamera(0, true);
  }

  /* ---------------- 输入绑定 ---------------- */
  function bindInput() {
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('pointerdown', onCanvasDown);
    canvas.addEventListener('pointermove', onCanvasMove);
    canvas.addEventListener('pointerup', onCanvasUp);
    canvas.addEventListener('pointercancel', onCanvasUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    if (refs.joystick) {
      refs.joystick.addEventListener('pointerdown', onJoyDown);
      window.addEventListener('pointermove', onJoyMove);
      window.addEventListener('pointerup', onJoyUp);
      window.addEventListener('pointercancel', onJoyUp);
    }
    window.addEventListener('resize', function () { if (active) resize(); });
    document.addEventListener('visibilitychange', onVisibility);
    canvas.addEventListener('webglcontextlost', function (e) {
      e.preventDefault();
      active = false;
      pauseLoop();
      if (refs.loading) {
        refs.loading.textContent = '3D 渲染上下文丢失，请退出后重新打开';
        refs.loading.classList.remove('is-hidden');
      }
    });
  }

  function isMoveKey(key) {
    return key === 'w' || key === 'a' || key === 's' || key === 'd' ||
      key === 'arrowup' || key === 'arrowdown' || key === 'arrowleft' || key === 'arrowright';
  }

  function onKeyDown(event) {
    if (!active) return;
    var key = String(event.key || '').toLowerCase();
    if (!isMoveKey(key)) return;
    keys[key] = true;
    if (event.preventDefault) event.preventDefault();
  }

  function onKeyUp(event) {
    var key = String(event.key || '').toLowerCase();
    if (isMoveKey(key)) keys[key] = false;
  }

  var pointer = { id: null, x: 0, y: 0, time: 0, moved: false, drag: false };

  function onCanvasDown(event) {
    if (!active) return;
    pointer.id = event.pointerId;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.time = Date.now();
    pointer.moved = false;
    pointer.drag = false;
    if (event.preventDefault) event.preventDefault();
  }

  function onCanvasMove(event) {
    if (pointer.id === null || event.pointerId !== pointer.id) return;
    var dx = event.clientX - pointer.x;
    var dy = event.clientY - pointer.y;
    if (!pointer.moved && (dx * dx + dy * dy) > 36) {
      pointer.moved = true;
      pointer.drag = true;
    }
    if (pointer.drag) {
      cam.yaw -= dx * 0.006;
      cam.pitch = clamp(cam.pitch + dy * 0.004, 0.12, 1.12);
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    }
  }

  function onCanvasUp(event) {
    if (pointer.id === null || event.pointerId !== pointer.id) return;
    var wasTap = !pointer.moved && Date.now() - pointer.time < 500;
    pointer.id = null;
    if (!wasTap) return;
    var rect = canvas.getBoundingClientRect();
    var sx = event.clientX - rect.left;
    var sy = event.clientY - rect.top;
    var ndcX = (sx / rect.width) * 2 - 1;
    var ndcY = -(sy / rect.height) * 2 + 1;
    var ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
    var hits = ray.intersectObject(terrainMesh, false);
    if (!hits.length) return;
    var point = hits[0].point;
    var tx = Math.floor(point.x / TILE);
    var ty = Math.floor(point.z / TILE);
    if (decorateMode) {
      handleDecoTap(tx, ty);
      return;
    }
    if (gardenMode) {
      handleGardenTap(tx, ty);
      return;
    }
    var hit = hitBuilding(point.x, point.z);
    if (hit) {
      walkToBuilding(hit);
      return;
    }
    walkToTile(tx, ty);
  }

  function onWheel(event) {
    if (!active) return;
    cam.distance = clamp(cam.distance + event.deltaY * 0.01, 5, 16);
    if (event.preventDefault) event.preventDefault();
  }

  function onJoyDown(event) {
    if (!active || !refs.joystick) return;
    joystick.active = true;
    joystick.pointerId = event.pointerId;
    var rect = refs.joystick.getBoundingClientRect();
    joystick.cx = rect.left + rect.width / 2;
    joystick.cy = rect.top + rect.height / 2;
    joystick.radius = rect.width * 0.42;
    onJoyMove(event);
    if (event.preventDefault) event.preventDefault();
  }

  function onJoyMove(event) {
    if (!joystick.active || event.pointerId !== joystick.pointerId) return;
    var dx = event.clientX - joystick.cx;
    var dy = event.clientY - joystick.cy;
    var len = Math.sqrt(dx * dx + dy * dy);
    var max = joystick.radius;
    if (len > max) {
      dx = dx / len * max;
      dy = dy / len * max;
      len = max;
    }
    input.x = dx / max;
    input.y = dy / max;
    if (refs.joystickKnob) {
      refs.joystickKnob.style.transform = 'translate(' + Math.round(dx) + 'px,' + Math.round(dy) + 'px)';
    }
    if (event.preventDefault) event.preventDefault();
  }

  function onJoyUp(event) {
    if (!joystick.active || (event.pointerId !== undefined && event.pointerId !== joystick.pointerId)) return;
    joystick.active = false;
    joystick.pointerId = null;
    input.x = 0;
    input.y = 0;
    if (refs.joystickKnob) refs.joystickKnob.style.transform = 'translate(0,0)';
  }

  function onVisibility() {
    if (document.hidden) pauseLoop();
    else if (active && !running) {
      lastTime = (window.performance && performance.now) ? performance.now() : Date.now();
      rafId = requestAnimationFrame(loop);
      running = true;
    }
  }

  /* ---------------- 初始化 ---------------- */
  function init() {
    if (initialized) return true;
    if (!window.THREE) {
      showFallback('3D 引擎未加载，请退出后重新打开');
      return false;
    }
    refs.stage = document.getElementById('world-stage');
    canvas = document.getElementById('world-canvas');
    minimapCanvas = document.getElementById('minimap-canvas');
    refs.place = document.getElementById('world-place');
    refs.hint = document.getElementById('world-hint');
    refs.joystick = document.getElementById('joystick');
    refs.joystickKnob = document.getElementById('joystick-knob');
    refs.interactBtn = document.getElementById('interact-btn');
    refs.interactLabel = document.getElementById('interact-label');
    refs.decoDrawer = document.getElementById('deco-drawer');
    refs.decoList = document.getElementById('deco-list');
    refs.gardenDrawer = document.getElementById('garden-drawer');
    refs.gardenList = document.getElementById('garden-list');
    refs.loading = document.getElementById('world-loading');
    if (!refs.stage || !canvas || !minimapCanvas) return false;
    mctx = minimapCanvas.getContext('2d');

    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
    } catch (error) {
      showFallback('当前设备不支持 3D 渲染');
      return false;
    }
    renderer.setPixelRatio(1);
    renderer.setSize(1, 1, false);
    if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = false;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(58, 1, 0.1, 300);
    camera.position.set(0, 8, 12);

    try {
      buildSky();
      map = generateMap();
      heightGrid = buildHeightGrid();
      buildTerrain();
      buildWater();
      buildBuildings();
      buildDecoGeometries();
      buildDecoMeshes();
      buildScenery();
      refreshPlants();
      buildButterflies();
      createAvatar();
      createMarker();
      minimapBase = buildMinimapBase();
      bindInput();
      resize();
    } catch (error) {
      window.__worldError = (error && error.stack) || String(error);
      if (window.console) console.error(error);
      showFallback('3D 小岛生成失败，请退出后重新打开');
      return false;
    }
    if (refs.loading) refs.loading.classList.add('is-hidden');
    initialized = true;
    return true;
  }

  function showFallback(message) {
    if (refs.loading) {
      refs.loading.textContent = message;
      refs.loading.classList.remove('is-hidden');
    }
    toast(message);
  }

  function enter() {
    if (!initialized && !init()) return;
    active = true;
    errorCount = 0;
    input.x = 0;
    input.y = 0;
    keys = {};
    joystick.active = false;
    joystick.pointerId = null;
    if (refs.joystickKnob) refs.joystickKnob.style.transform = 'translate(0,0)';
    resize();
    syncFromState();
    scheduleResize();
    drawMinimap();
    var st = window.Core.getState();
    var freshIsland = st && st.unlocks && !st.unlocks.garden && !st.unlocks.shop && !st.unlocks.farm &&
      !st.unlocks.deco && !st.unlocks.house && !st.unlocks.tower;
    showHint(freshIsland
      ? '沿土路去北边祭坛战斗赚金币 · 点右下角「建设」解锁小岛'
      : '摇杆 / WASD 移动 · 拖动画面旋转视角 · 点击地面寻路', 5600);
    lastTime = (window.performance && performance.now) ? performance.now() : Date.now();
    if (!running) {
      rafId = requestAnimationFrame(loop);
      running = true;
    }
  }

  function leave() {
    active = false;
    pauseLoop();
    savePlayerPos();
    keys = {};
    input.x = 0;
    input.y = 0;
    joystick.active = false;
    joystick.pointerId = null;
    if (refs.joystickKnob) refs.joystickKnob.style.transform = 'translate(0,0)';
    decorateMode = false;
    gardenMode = false;
    selectedPlant = null;
    if (refs.decoDrawer) refs.decoDrawer.hidden = true;
    if (refs.gardenDrawer) refs.gardenDrawer.hidden = true;
    selectedDeco = null;
    inFarm = false;
    farmTargetIndex = -1;
    document.body.classList.remove('is-in-farm');
    if (window.UI && window.UI.hideFarmDock) window.UI.hideFarmDock();
    if (farmTargetRing) farmTargetRing.visible = false;
  }

  function setPlayerTile(tx, ty) {
    if (!map || !isWalkableTile(tx, ty)) return false;
    player.x = (tx + 0.5) * TILE;
    player.z = (ty + 0.5) * TILE;
    player.y = terrainHeightAt(player.x, player.z) + 0.02;
    player.path = [];
    player.targetAngle = Math.PI;
    updateNearby();
    updatePlaceName();
    updateCamera(0, true);
    return true;
  }

  function debugAvatar() {
    if (!avatarModel) return null;
    var mesh = avatarModel.children[0];
    var geo = mesh && mesh.geometry;
    if (geo && !geo.boundingBox) geo.computeBoundingBox();
    return {
      children: avatarModel.children.length,
      scale: avatarModel.scale.x,
      pos: avatarModel.position.toArray(),
      visible: avatarModel.visible,
      meshVisible: mesh ? mesh.visible : null,
      material: mesh && mesh.material ? {
        color: mesh.material.color.getHexString(),
        hasMap: !!mesh.material.map,
        mapImage: !!(mesh.material.map && mesh.material.map.image),
        mapSize: mesh.material.map && mesh.material.map.image ? [mesh.material.map.image.width, mesh.material.map.image.height] : null,
        transparent: mesh.material.transparent,
        opacity: mesh.material.opacity
      } : null,
      geo: geo ? {
        count: geo.attributes.position.count,
        index: geo.index ? geo.index.count : 0,
        box: geo.boundingBox ? [geo.boundingBox.min.toArray(), geo.boundingBox.max.toArray()] : null,
        sphere: geo.boundingSphere ? [geo.boundingSphere.center.toArray(), geo.boundingSphere.radius] : null
      } : null,
      groupPos: avatarGroup ? avatarGroup.position.toArray() : null,
      groupRot: avatarGroup ? avatarGroup.rotation.y : null,
      nameY: avatarNameSprite ? avatarNameSprite.position.y : null,
      featureTex: Object.keys(featureTextureCache).map(function (k) {
        var t = featureTextureCache[k];
        var c = t.image;
        if (!c) return { key: k, noImage: true };
        var g = c.getContext('2d');
        var d = g ? g.getImageData(0, 0, c.width, c.height).data : null;
        var non = 0;
        if (d) for (var i = 3; i < d.length; i += 4) if (d[i] > 10) non += 1;
        return { key: k, w: c.width, h: c.height, nonTransparent: non };
      }),
      holder: avatarHolder ? avatarHolder.children.map(function (c) {
        return {
          type: c.type,
          children: c.children.length,
          visible: c.visible,
          pos: c.position.toArray(),
          scale: c.scale.toArray(),
          material: c.material ? {
            hasMap: !!c.material.map,
            mapImage: !!(c.material.map && c.material.map.image),
            transparent: c.material.transparent,
            opacity: c.material.opacity,
            visible: c.material.visible
          } : null,
          childInfo: c.children.map(function (ch) {
            return { type: ch.type, visible: ch.visible, pos: ch.position.toArray(), scale: ch.scale.toArray(), hasMap: !!(ch.material && ch.material.map), mapImage: !!(ch.material && ch.material.map && ch.material.map.image), geo: ch.geometry ? { w: ch.geometry.parameters && ch.geometry.parameters.width, h: ch.geometry.parameters && ch.geometry.parameters.height } : null };
          })
        };
      }) : null
    };
  }

  var thumbRenderer = null;
  var thumbCache = {};

  function renderCreatureThumbnail(formId, size) {
    size = size || 384;
    if (thumbCache[formId] && thumbCache[formId].size === size) return thumbCache[formId].url;
    var creature = window.Core.findCreature(formId);
    var key = MODEL_KEYS[formId];
    if (!creature || !key) return null;
    var base = getPolyBase(key);
    if (!base) {
      requestPolyBase(key, function () {});
      return null;
    }
    var poly = tryBuildPolyAvatar(formId, 2.4);
    if (!poly) return null;
    var mesh = poly.object.children[0];
    var map = mesh && mesh.material && mesh.material.map;
    if (map && !map.image) return null;

    if (!thumbRenderer) {
      var tc = document.createElement('canvas');
      tc.width = size;
      tc.height = size;
      thumbRenderer = new THREE.WebGLRenderer({ canvas: tc, alpha: true, antialias: true, preserveDrawingBuffer: true });
      thumbRenderer.setPixelRatio(1);
      thumbRenderer.setSize(size, size, false);
      thumbRenderer.setClearColor(0x000000, 0);
      if (THREE.sRGBEncoding) thumbRenderer.outputEncoding = THREE.sRGBEncoding;
    }
    var scene2 = new THREE.Scene();
    var features = buildAvatarFeatures(formId, poly.height);
    var bounds = new THREE.Box3().setFromObject(poly.object);
    if (features) bounds.expandByObject(features);
    bounds.expandByPoint(new THREE.Vector3(-1.55, -0.18, -1.55));
    bounds.expandByPoint(new THREE.Vector3(1.55, 0.02, 1.55));
    var bsize = new THREE.Vector3();
    var bcenter = new THREE.Vector3();
    bounds.getSize(bsize);
    bounds.getCenter(bcenter);
    var maxDim = Math.max(bsize.x, bsize.y, bsize.z) || 1;
    var fov = 28;
    var distance = (maxDim * 0.5) / Math.tan(fov * Math.PI / 360) * 1.40;
    var dir = new THREE.Vector3(0.62, 0.38, 1).normalize();
    var cam = new THREE.PerspectiveCamera(fov, 1, 0.05, Math.max(50, distance * 4));
    cam.position.copy(bcenter).add(dir.multiplyScalar(distance));
    cam.lookAt(bcenter);

    scene2.add(new THREE.HemisphereLight(0xE8F4FF, 0x3A4A34, 0.95));
    var sun = new THREE.DirectionalLight(0xFFE9C8, 1.15);
    sun.position.set(3.5, 6, 4.5);
    scene2.add(sun);
    var fill = new THREE.DirectionalLight(0xA8C8F0, 0.38);
    fill.position.set(-4, 2.5, -2);
    scene2.add(fill);

    var element = window.Core.findElement(creature.element);
    var pedestal = new THREE.Mesh(
      new THREE.CylinderBufferGeometry(1.28, 1.46, 0.16, 36),
      new THREE.MeshLambertMaterial({ color: sRGB(0x182028) })
    );
    pedestal.position.y = -0.08;
    scene2.add(pedestal);
    var ring = new THREE.Mesh(
      new THREE.RingBufferGeometry(1.28, 1.40, 48),
      new THREE.MeshBasicMaterial({ color: sRGB(element.color), transparent: true, opacity: 0.78, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.012;
    scene2.add(ring);
    scene2.add(poly.object);
    if (features) scene2.add(features);

    thumbRenderer.render(scene2, cam);
    var url = thumbRenderer.domElement.toDataURL('image/png');
    thumbCache[formId] = { size: size, url: url };
    disposeAvatarObject(poly.object);
    if (features) disposeAvatarObject(features);
    pedestal.geometry.dispose();
    pedestal.material.dispose();
    ring.geometry.dispose();
    ring.material.dispose();
    return url;
  }

  window.World = {
    debugAvatar: debugAvatar,
    renderCreatureThumbnail: renderCreatureThumbnail,
    init: init,
    enter: enter,
    leave: leave,
    interact: interact,
    enterFarm: enterFarm,
    leaveFarm: leaveFarm,
    refreshFarmCrops: refreshFarmCrops,
    toggleDecorate: toggleDecorate,
    selectDeco: selectDeco,
    renderDecoList: renderDecoList,
    refresh: function () {
      if (!initialized) return;
      var s = window.Core.getState();
      if (s.formId !== currentFormId) buildAvatar(s.formId);
      refreshDecos();
      refreshFarmCrops();
      updateNearby();
      updatePlaceName();
      updateFarmMode();
      if (active) drawMinimap();
    },
    isActive: function () { return active; },
    isDecorating: function () { return decorateMode; },
    isGardening: function () { return gardenMode; },
    refreshBuildings: refreshBuildings,
    refreshPlants: refreshPlants,
    toggleGarden: toggleGarden,
    selectPlant: selectPlant,
    renderGardenList: renderGardenList,
    getPlayer: function () {
      return { x: player.x, z: player.z, tileX: Math.floor(player.x / TILE), tileY: Math.floor(player.z / TILE) };
    },
    getNearby: function () {
      return nearby ? { type: nearby.type, name: nearby.name } : null;
    },
    setPlayerTile: setPlayerTile,
    placeSelectedAt: function (tx, ty) {
      if (!initialized) return;
      handleDecoTap(tx, ty);
    },
    removeAt: function (tx, ty) {
      if (!initialized) return null;
      var removed = window.Core.removeDecoAt(tx, ty);
      if (removed) {
        window.Core.saveState();
        refreshDecos();
        renderDecoList();
      }
      return removed;
    },
    walkToBuilding: function (type) {
      if (!map) return;
      for (var i = 0; i < map.buildings.length; i += 1) {
        if (map.buildings[i].type === type) { walkToBuilding(map.buildings[i]); return; }
      }
    },
    savePlayerPos: savePlayerPos
  };
}());
