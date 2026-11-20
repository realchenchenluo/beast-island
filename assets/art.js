/* 万灵屿 - SVG 美术模块（全部内联生成，无外部资源） */
(function () {
  'use strict';

  function svg(inner, cls) {
    return '<svg class="' + (cls || 'art-svg') + '" viewBox="0 0 120 120" ' +
      'xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + inner + '</svg>';
  }

  function eyes(cy, dx, r) {
    var out = '';
    out += '<ellipse cx="' + (60 - dx) + '" cy="' + cy + '" rx="' + (r * 0.82) + '" ry="' + r + '" fill="#2B2B33"/>';
    out += '<ellipse cx="' + (60 + dx) + '" cy="' + cy + '" rx="' + (r * 0.82) + '" ry="' + r + '" fill="#2B2B33"/>';
    out += '<circle cx="' + (60 - dx - 1.6) + '" cy="' + (cy - 2) + '" r="1.7" fill="#FFFFFF"/>';
    out += '<circle cx="' + (60 + dx - 1.6) + '" cy="' + (cy - 2) + '" r="1.7" fill="#FFFFFF"/>';
    return out;
  }

  function amberEyes(cy, dx, r) {
    var out = '';
    out += '<ellipse cx="' + (60 - dx) + '" cy="' + cy + '" rx="' + r + '" ry="' + (r * 1.1) + '" fill="#F2C94C"/>';
    out += '<ellipse cx="' + (60 + dx) + '" cy="' + cy + '" rx="' + r + '" ry="' + (r * 1.1) + '" fill="#F2C94C"/>';
    out += '<ellipse cx="' + (60 - dx) + '" cy="' + cy + '" rx="' + (r * 0.36) + '" ry="' + (r * 0.8) + '" fill="#2B2B33"/>';
    out += '<ellipse cx="' + (60 + dx) + '" cy="' + cy + '" rx="' + (r * 0.36) + '" ry="' + (r * 0.8) + '" fill="#2B2B33"/>';
    return out;
  }

  function smile(cy, w, color) {
    return '<path d="M' + (60 - w) + ' ' + cy + ' Q60 ' + (cy + 6) + ' ' + (60 + w) + ' ' + cy +
      '" fill="none" stroke="' + (color || '#5A3A2E') + '" stroke-width="2.4" stroke-linecap="round"/>';
  }

  function cheeks(cx, cy, r, color) {
    return '<circle cx="' + (60 - cx) + '" cy="' + cy + '" r="' + r + '" fill="' + color + '" opacity="0.55"/>' +
      '<circle cx="' + (60 + cx) + '" cy="' + cy + '" r="' + r + '" fill="' + color + '" opacity="0.55"/>';
  }

  var CREATURES = {
    rabbit: function () {
      return svg(
        '<ellipse cx="43" cy="28" rx="9.5" ry="25" fill="#F7F4EE" stroke="#E3DACA" stroke-width="2" transform="rotate(-9 43 28)"/>' +
        '<ellipse cx="43" cy="30" rx="4.6" ry="18" fill="#F7C6D0" transform="rotate(-9 43 30)"/>' +
        '<ellipse cx="77" cy="28" rx="9.5" ry="25" fill="#F7F4EE" stroke="#E3DACA" stroke-width="2" transform="rotate(9 77 28)"/>' +
        '<ellipse cx="77" cy="30" rx="4.6" ry="18" fill="#F7C6D0" transform="rotate(9 77 30)"/>' +
        '<ellipse cx="60" cy="65" rx="34" ry="32" fill="#F7F4EE" stroke="#E3DACA" stroke-width="2"/>' +
        '<ellipse cx="60" cy="80" rx="18" ry="13" fill="#FBF8F2"/>' +
        cheeks(21, 72, 7, '#F7C6D0') +
        eyes(59, 14, 5) +
        '<ellipse cx="60" cy="75" rx="4" ry="3" fill="#F28DA2"/>' +
        '<path d="M60 78 L60 82 M60 82 Q55 87 51 82 M60 82 Q65 87 69 82" fill="none" stroke="#5A3A2E" stroke-width="2" stroke-linecap="round"/>' +
        '<path d="M27 76 L38 78 M27 82 L38 82 M93 76 L82 78 M93 82 L82 82" stroke="#D8CDBB" stroke-width="1.8" stroke-linecap="round"/>'
      );
    },
    pig: function () {
      return svg(
        '<path d="M28 46 L30 25 L48 38 Z" fill="#F28DA2"/>' +
        '<path d="M92 46 L90 25 L72 38 Z" fill="#F28DA2"/>' +
        '<ellipse cx="60" cy="65" rx="35" ry="32" fill="#F7A8B8"/>' +
        '<ellipse cx="60" cy="79" rx="17" ry="12" fill="#F28DA2"/>' +
        '<ellipse cx="53" cy="79" rx="2.6" ry="3.6" fill="#C86B82"/>' +
        '<ellipse cx="67" cy="79" rx="2.6" ry="3.6" fill="#C86B82"/>' +
        cheeks(23, 70, 7, '#F28DA2') +
        eyes(57, 15, 4.6) +
        smile(88, 7, '#B85A72')
      );
    },
    sheep: function () {
      return svg(
        '<circle cx="38" cy="38" r="14" fill="#F7F1E3"/>' +
        '<circle cx="60" cy="29" r="16" fill="#F7F1E3"/>' +
        '<circle cx="82" cy="38" r="14" fill="#F7F1E3"/>' +
        '<circle cx="29" cy="56" r="12" fill="#F7F1E3"/>' +
        '<circle cx="91" cy="56" r="12" fill="#F7F1E3"/>' +
        '<ellipse cx="26" cy="62" rx="10" ry="6" fill="#E8D3B8" transform="rotate(-18 26 62)"/>' +
        '<ellipse cx="94" cy="62" rx="10" ry="6" fill="#E8D3B8" transform="rotate(18 94 62)"/>' +
        '<ellipse cx="60" cy="66" rx="30" ry="28" fill="#F2E6D0"/>' +
        '<ellipse cx="60" cy="79" rx="15" ry="11" fill="#FBF3E4"/>' +
        cheeks(20, 70, 6, '#F2C6C6') +
        eyes(61, 12, 4.2) +
        '<ellipse cx="60" cy="76" rx="3.4" ry="2.6" fill="#8A5A4A"/>' +
        smile(84, 5.5, '#8A5A4A')
      );
    },
    goat: function () {
      return svg(
        '<path d="M44 38 Q32 20 42 10" fill="none" stroke="#E8DCC0" stroke-width="8" stroke-linecap="round"/>' +
        '<path d="M76 38 Q88 20 78 10" fill="none" stroke="#E8DCC0" stroke-width="8" stroke-linecap="round"/>' +
        '<path d="M44 38 Q34 22 43 12" fill="none" stroke="#C9B891" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M76 38 Q86 22 77 12" fill="none" stroke="#C9B891" stroke-width="3" stroke-linecap="round"/>' +
        '<ellipse cx="25" cy="60" rx="11" ry="6.5" fill="#C9A875" transform="rotate(-16 25 60)"/>' +
        '<ellipse cx="95" cy="60" rx="11" ry="6.5" fill="#C9A875" transform="rotate(16 95 60)"/>' +
        '<ellipse cx="60" cy="65" rx="33" ry="31" fill="#D9B382"/>' +
        '<ellipse cx="60" cy="80" rx="17" ry="12" fill="#F2DFC0"/>' +
        '<path d="M52 92 L60 108 L68 92 Z" fill="#E8DCC0"/>' +
        eyes(59, 14, 4.5) +
        '<ellipse cx="60" cy="77" rx="4" ry="3" fill="#7A5A3A"/>' +
        smile(86, 6, '#7A5A3A')
      );
    },
    cow: function () {
      return svg(
        '<path d="M30 44 Q22 36 24 28 Q32 30 38 40 Z" fill="#E8DCC0"/>' +
        '<path d="M90 44 Q98 36 96 28 Q88 30 82 40 Z" fill="#E8DCC0"/>' +
        '<ellipse cx="22" cy="60" rx="12" ry="7" fill="#E8D3B8" transform="rotate(-16 22 60)"/>' +
        '<ellipse cx="98" cy="60" rx="12" ry="7" fill="#E8D3B8" transform="rotate(16 98 60)"/>' +
        '<ellipse cx="60" cy="65" rx="35" ry="32" fill="#F7F5F2"/>' +
        '<path d="M36 48 Q46 38 54 50 Q48 60 38 58 Z" fill="#3A3A44"/>' +
        '<path d="M74 68 Q84 60 92 70 Q88 80 78 79 Q72 76 74 68 Z" fill="#3A3A44"/>' +
        '<ellipse cx="60" cy="80" rx="19" ry="12.5" fill="#F2B8C6"/>' +
        '<ellipse cx="53" cy="80" rx="2.6" ry="3.4" fill="#C98A98"/>' +
        '<ellipse cx="67" cy="80" rx="2.6" ry="3.4" fill="#C98A98"/>' +
        eyes(58, 15, 4.6) +
        smile(90, 7, '#B87A88')
      );
    },
    fox: function () {
      return svg(
        '<path d="M30 50 L34 14 L58 42 Z" fill="#F28C38"/>' +
        '<path d="M90 50 L86 14 L62 42 Z" fill="#F28C38"/>' +
        '<path d="M36 42 L38 24 L50 40 Z" fill="#F7C6A0"/>' +
        '<path d="M84 42 L82 24 L70 40 Z" fill="#F7C6A0"/>' +
        '<ellipse cx="60" cy="65" rx="34" ry="31" fill="#F28C38"/>' +
        '<ellipse cx="44" cy="76" rx="15" ry="13" fill="#FFF3E6"/>' +
        '<ellipse cx="76" cy="76" rx="15" ry="13" fill="#FFF3E6"/>' +
        '<ellipse cx="60" cy="81" rx="14" ry="10" fill="#FFF3E6"/>' +
        eyes(59, 14, 4.6) +
        '<path d="M55 76 Q60 72 65 76 Q62 81 60 82 Q58 81 55 76 Z" fill="#3A2A1A"/>' +
        smile(87, 5.5, '#7A5A3A')
      );
    },
    wolf: function () {
      return svg(
        '<path d="M29 50 L34 16 L56 42 Z" fill="#8C97A8"/>' +
        '<path d="M91 50 L86 16 L64 42 Z" fill="#8C97A8"/>' +
        '<path d="M36 42 L39 26 L49 40 Z" fill="#C9D2DE"/>' +
        '<path d="M84 42 L81 26 L71 40 Z" fill="#C9D2DE"/>' +
        '<ellipse cx="60" cy="65" rx="34" ry="31" fill="#8C97A8"/>' +
        '<ellipse cx="44" cy="76" rx="15" ry="13" fill="#DDE4EC"/>' +
        '<ellipse cx="76" cy="76" rx="15" ry="13" fill="#DDE4EC"/>' +
        '<ellipse cx="60" cy="81" rx="14" ry="10" fill="#E8EDF2"/>' +
        amberEyes(58, 14, 4.4) +
        '<path d="M55 75 Q60 71 65 75 Q62 80 60 81 Q58 80 55 75 Z" fill="#3A3A44"/>' +
        '<path d="M55 87 Q60 91 65 87" fill="none" stroke="#5A6472" stroke-width="2" stroke-linecap="round"/>'
      );
    },
    giraffe: function () {
      return svg(
        '<line x1="46" y1="36" x2="43" y2="18" stroke="#C98A3A" stroke-width="5" stroke-linecap="round"/>' +
        '<circle cx="43" cy="16" r="5" fill="#8A5A2B"/>' +
        '<line x1="74" y1="36" x2="77" y2="18" stroke="#C98A3A" stroke-width="5" stroke-linecap="round"/>' +
        '<circle cx="77" cy="16" r="5" fill="#8A5A2B"/>' +
        '<ellipse cx="25" cy="55" rx="12" ry="7" fill="#E8B04B" transform="rotate(-20 25 55)"/>' +
        '<ellipse cx="95" cy="55" rx="12" ry="7" fill="#E8B04B" transform="rotate(20 95 55)"/>' +
        '<ellipse cx="60" cy="65" rx="32" ry="31" fill="#F2C14E"/>' +
        '<circle cx="40" cy="48" r="6.5" fill="#C98A3A"/>' +
        '<circle cx="80" cy="50" r="7.5" fill="#C98A3A"/>' +
        '<circle cx="52" cy="40" r="4.5" fill="#C98A3A"/>' +
        '<circle cx="70" cy="40" r="3.8" fill="#C98A3A"/>' +
        '<ellipse cx="60" cy="82" rx="18" ry="12" fill="#E8B04B"/>' +
        eyes(62, 13, 4.4) +
        '<ellipse cx="54" cy="82" rx="2.4" ry="2.8" fill="#8A5A2B"/>' +
        '<ellipse cx="66" cy="82" rx="2.4" ry="2.8" fill="#8A5A2B"/>' +
        smile(89, 6, '#8A5A2B')
      );
    },
    crocodile: function () {
      return svg(
        '<ellipse cx="60" cy="58" rx="35" ry="27" fill="#5FA85C"/>' +
        '<path d="M30 40 L36 30 L42 41 Z M50 33 L56 24 L62 34 Z M70 34 L76 25 L82 36 Z" fill="#4A8F48"/>' +
        '<circle cx="45" cy="40" r="10" fill="#5FA85C"/>' +
        '<circle cx="75" cy="40" r="10" fill="#5FA85C"/>' +
        '<ellipse cx="45" cy="39" rx="6.5" ry="7" fill="#F7F5F2"/>' +
        '<ellipse cx="75" cy="39" rx="6.5" ry="7" fill="#F7F5F2"/>' +
        '<ellipse cx="45" cy="40" rx="2.2" ry="5.5" fill="#2B2B33"/>' +
        '<ellipse cx="75" cy="40" rx="2.2" ry="5.5" fill="#2B2B33"/>' +
        '<rect x="30" y="68" width="60" height="24" rx="12" fill="#6FBF6A"/>' +
        '<path d="M34 70 L40 70 L37 76 Z M48 70 L54 70 L51 76 Z M62 70 L68 70 L65 76 Z M76 70 L82 70 L79 76 Z" fill="#F7F5F2"/>' +
        '<path d="M38 90 L44 90 L41 85 Z M52 90 L58 90 L55 85 Z M66 90 L72 90 L69 85 Z M80 90 L86 90 L83 85 Z" fill="#F7F5F2"/>' +
        '<ellipse cx="46" cy="79" rx="2.2" ry="1.8" fill="#3A6B38"/>' +
        '<ellipse cx="74" cy="79" rx="2.2" ry="1.8" fill="#3A6B38"/>'
      );
    },
    panda: function () {
      return svg(
        '<circle cx="34" cy="36" r="13" fill="#2B2B33"/>' +
        '<circle cx="86" cy="36" r="13" fill="#2B2B33"/>' +
        '<ellipse cx="60" cy="65" rx="35" ry="32" fill="#F7F5F2"/>' +
        '<ellipse cx="45" cy="58" rx="10.5" ry="13" fill="#2B2B33" transform="rotate(-18 45 58)"/>' +
        '<ellipse cx="75" cy="58" rx="10.5" ry="13" fill="#2B2B33" transform="rotate(18 75 58)"/>' +
        '<circle cx="46" cy="58" r="3" fill="#F7F5F2"/>' +
        '<circle cx="74" cy="58" r="3" fill="#F7F5F2"/>' +
        '<circle cx="46.5" cy="58.5" r="1.6" fill="#2B2B33"/>' +
        '<circle cx="73.5" cy="58.5" r="1.6" fill="#2B2B33"/>' +
        '<ellipse cx="60" cy="78" rx="7" ry="5.5" fill="#2B2B33"/>' +
        '<path d="M60 83 Q56 89 51 85 M60 83 Q64 89 69 85" fill="none" stroke="#3A3A44" stroke-width="2.2" stroke-linecap="round"/>' +
        cheeks(22, 72, 6, '#F2C6C6')
      );
    },
    bear: function () {
      return svg(
        '<circle cx="35" cy="35" r="13" fill="#A97142"/>' +
        '<circle cx="85" cy="35" r="13" fill="#A97142"/>' +
        '<circle cx="35" cy="35" r="7" fill="#C98A5A"/>' +
        '<circle cx="85" cy="35" r="7" fill="#C98A5A"/>' +
        '<ellipse cx="60" cy="65" rx="35" ry="32" fill="#A97142"/>' +
        '<ellipse cx="60" cy="79" rx="19" ry="14" fill="#D9B382"/>' +
        eyes(58, 14, 4.6) +
        '<ellipse cx="60" cy="75" rx="7" ry="5.5" fill="#4A3020"/>' +
        '<path d="M60 80 Q55 87 49 83 M60 80 Q65 87 71 83" fill="none" stroke="#4A3020" stroke-width="2.2" stroke-linecap="round"/>' +
        cheeks(23, 70, 6.5, '#C98A5A')
      );
    },
    tiger: function () {
      return svg(
        '<circle cx="34" cy="37" r="12" fill="#F39C2C"/>' +
        '<circle cx="86" cy="37" r="12" fill="#F39C2C"/>' +
        '<circle cx="34" cy="37" r="6.5" fill="#F7C6A0"/>' +
        '<circle cx="86" cy="37" r="6.5" fill="#F7C6A0"/>' +
        '<ellipse cx="60" cy="65" rx="35" ry="32" fill="#F39C2C"/>' +
        '<path d="M50 36 L54 50 M70 36 L66 50 M60 33 L60 44 M31 58 L41 61 M89 58 L79 61 M30 70 L40 71 M90 70 L80 71" ' +
        'stroke="#3A2A1A" stroke-width="3.6" stroke-linecap="round"/>' +
        '<ellipse cx="60" cy="80" rx="18" ry="13" fill="#FFF3E6"/>' +
        eyes(58, 14, 4.6) +
        '<path d="M55 75 Q60 71 65 75 Q62 80 60 81 Q58 80 55 75 Z" fill="#D96A7A"/>' +
        smile(87, 6, '#8A5A3A')
      );
    },
    lion: function () {
      return svg(
        '<circle cx="60" cy="63" r="48" fill="#D98A2B"/>' +
        '<circle cx="60" cy="18" r="11" fill="#D98A2B"/>' +
        '<circle cx="88" cy="31" r="11" fill="#D98A2B"/>' +
        '<circle cx="104" cy="60" r="11" fill="#D98A2B"/>' +
        '<circle cx="88" cy="91" r="11" fill="#D98A2B"/>' +
        '<circle cx="60" cy="104" r="11" fill="#D98A2B"/>' +
        '<circle cx="32" cy="91" r="11" fill="#D98A2B"/>' +
        '<circle cx="16" cy="60" r="11" fill="#D98A2B"/>' +
        '<circle cx="32" cy="31" r="11" fill="#D98A2B"/>' +
        '<circle cx="60" cy="63" r="38" fill="#E8A33D"/>' +
        '<circle cx="35" cy="40" r="9" fill="#F2C14E"/>' +
        '<circle cx="85" cy="40" r="9" fill="#F2C14E"/>' +
        '<ellipse cx="60" cy="65" rx="32" ry="30" fill="#F2C14E"/>' +
        '<ellipse cx="60" cy="81" rx="17" ry="12" fill="#F7E3B0"/>' +
        eyes(59, 13, 4.4) +
        '<path d="M54 76 Q60 72 66 76 Q63 81 60 82 Q57 81 54 76 Z" fill="#8A5A2B"/>' +
        smile(88, 6, '#8A5A2B')
      );
    },
    elephant: function () {
      return svg(
        '<ellipse cx="23" cy="64" rx="19" ry="25" fill="#9AA7B8" transform="rotate(-12 23 64)"/>' +
        '<ellipse cx="97" cy="64" rx="19" ry="25" fill="#9AA7B8" transform="rotate(12 97 64)"/>' +
        '<ellipse cx="25" cy="64" rx="12" ry="17" fill="#B8C3D1" transform="rotate(-12 25 64)"/>' +
        '<ellipse cx="95" cy="64" rx="12" ry="17" fill="#B8C3D1" transform="rotate(12 95 64)"/>' +
        '<ellipse cx="60" cy="58" rx="32" ry="29" fill="#9AA7B8"/>' +
        '<path d="M60 76 Q55 90 60 101 Q64 107 71 102" fill="none" stroke="#9AA7B8" stroke-width="13" stroke-linecap="round"/>' +
        '<path d="M60 78 Q57 90 61 99" fill="none" stroke="#8C99AA" stroke-width="2.5" stroke-linecap="round"/>' +
        '<path d="M48 87 Q44 94 48 98" fill="none" stroke="#F7F5F2" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M72 87 Q76 94 72 98" fill="none" stroke="#F7F5F2" stroke-width="4" stroke-linecap="round"/>' +
        eyes(56, 13, 4.4) +
        '<path d="M52 72 Q60 68 68 72" fill="none" stroke="#7A8798" stroke-width="2.4" stroke-linecap="round"/>'
      );
    },
    eagle: function () {
      return svg(
        '<circle cx="60" cy="62" r="34" fill="#8A5A3A"/>' +
        '<path d="M36 34 Q44 20 54 30 Q48 38 40 42 Z" fill="#F7F5F2"/>' +
        '<path d="M84 34 Q76 20 66 30 Q72 38 80 42 Z" fill="#F7F5F2"/>' +
        '<ellipse cx="60" cy="64" rx="33" ry="31" fill="#A97142"/>' +
        '<path d="M46 42 Q60 34 74 42" fill="none" stroke="#6B4426" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M52 70 L46 80 Q60 92 74 80 L68 70 Z" fill="#F2C94C"/>' +
        '<path d="M60 82 L60 90" stroke="#C98A3A" stroke-width="2" stroke-linecap="round"/>' +
        amberEyes(58, 15, 4.6) +
        '<path d="M38 50 L48 54 M82 50 L72 54" stroke="#6B4426" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M40 74 Q46 78 50 76 M80 74 Q74 78 70 76" fill="none" stroke="#F7F5F2" stroke-width="2" stroke-linecap="round"/>'
      );
    },
    crane: function () {
      return svg(
        '<ellipse cx="60" cy="64" rx="32" ry="30" fill="#F7F5F2"/>' +
        '<path d="M40 40 Q60 28 80 40" fill="none" stroke="#E8DCC0" stroke-width="3" stroke-linecap="round"/>' +
        '<circle cx="60" cy="34" r="7" fill="#E85D5D"/>' +
        '<path d="M56 72 L58 98 L62 98 L64 72 Z" fill="#F2C94C"/>' +
        '<path d="M58 96 L60 102 L62 96" fill="#C98A3A"/>' +
        eyes(60, 14, 4.2) +
        '<path d="M44 84 Q52 90 58 86 M76 84 Q68 90 62 86" fill="none" stroke="#E8DCC0" stroke-width="2" stroke-linecap="round"/>' +
        '<path d="M36 70 Q30 76 32 84" fill="none" stroke="#F7F5F2" stroke-width="4" stroke-linecap="round"/>'
      );
    },
    peacock: function () {
      return svg(
        '<ellipse cx="34" cy="42" rx="9" ry="18" fill="#3FA9A0" transform="rotate(-28 34 42)"/>' +
        '<ellipse cx="86" cy="42" rx="9" ry="18" fill="#3FA9A0" transform="rotate(28 86 42)"/>' +
        '<ellipse cx="28" cy="60" rx="8" ry="15" fill="#4FA8E8" transform="rotate(-46 28 60)"/>' +
        '<ellipse cx="92" cy="60" rx="8" ry="15" fill="#4FA8E8" transform="rotate(46 92 60)"/>' +
        '<circle cx="34" cy="30" r="4" fill="#F2C94C"/><circle cx="86" cy="30" r="4" fill="#F2C94C"/>' +
        '<path d="M52 34 Q56 20 60 28 Q64 20 68 34" fill="none" stroke="#3F8FD0" stroke-width="4" stroke-linecap="round"/>' +
        '<ellipse cx="60" cy="66" rx="31" ry="30" fill="#3F8FD0"/>' +
        '<ellipse cx="60" cy="78" rx="14" ry="10" fill="#8ED8F8"/>' +
        eyes(60, 13, 4.4) +
        '<path d="M56 76 L52 84 L60 82 L68 84 L64 76 Z" fill="#F2994A"/>' +
        '<circle cx="60" cy="40" r="3" fill="#F2C94C"/>'
      );
    },
    turtle: function () {
      return svg(
        '<ellipse cx="60" cy="88" rx="44" ry="19" fill="#8A5A2B"/>' +
        '<path d="M18 88 Q60 64 102 88 Q60 102 18 88 Z" fill="#6FBF6A"/>' +
        '<path d="M34 86 L46 78 L58 86 L70 78 L82 86 M42 94 L54 88 L66 94 L78 88" fill="none" stroke="#4A9E5C" stroke-width="2.4"/>' +
        '<ellipse cx="60" cy="54" rx="26" ry="24" fill="#6FBF6A"/>' +
        '<ellipse cx="60" cy="64" rx="15" ry="10" fill="#8FD07E"/>' +
        eyes(52, 11, 4) +
        '<path d="M55 64 Q60 68 65 64" fill="none" stroke="#3E6E4E" stroke-width="2" stroke-linecap="round"/>' +
        '<circle cx="44" cy="44" r="3" fill="#4A9E5C" opacity="0.6"/><circle cx="76" cy="44" r="3" fill="#4A9E5C" opacity="0.6"/>'
      );
    },
    octopus: function () {
      return svg(
        '<path d="M34 82 Q22 92 26 102 Q34 104 38 94 M46 86 Q40 98 46 106 Q54 104 52 94 M60 88 Q58 102 62 108 Q68 104 66 92 M74 86 Q80 98 76 106 Q68 104 70 94 M86 82 Q98 92 94 102 Q86 104 82 94" fill="none" stroke="#BB6BD9" stroke-width="7" stroke-linecap="round"/>' +
        '<ellipse cx="60" cy="56" rx="32" ry="30" fill="#BB6BD9"/>' +
        '<ellipse cx="60" cy="58" rx="26" ry="24" fill="#C98AE8"/>' +
        '<circle cx="47" cy="54" r="9" fill="#FFFFFF"/><circle cx="73" cy="54" r="9" fill="#FFFFFF"/>' +
        '<circle cx="48" cy="55" r="4" fill="#2B2B33"/><circle cx="72" cy="55" r="4" fill="#2B2B33"/>' +
        '<path d="M54 74 Q60 79 66 74" fill="none" stroke="#8A4AA8" stroke-width="2.4" stroke-linecap="round"/>' +
        '<circle cx="30" cy="34" r="3" fill="#D9A8F0"/><circle cx="90" cy="34" r="3" fill="#D9A8F0"/>'
      );
    },
    shark: function () {
      return svg(
        '<path d="M24 62 Q28 36 60 34 Q92 36 96 62 Q80 88 60 88 Q40 88 24 62 Z" fill="#5A8FB8"/>' +
        '<path d="M54 34 L60 16 L66 34 Z" fill="#4A7FA8"/>' +
        '<path d="M26 70 Q60 94 94 70" fill="none" stroke="#F7F5F2" stroke-width="6" stroke-linecap="round"/>' +
        '<path d="M34 74 L40 70 L40 78 Z M46 78 L52 74 L52 82 Z M58 80 L64 76 L64 84 Z M70 78 L76 74 L76 82 Z M82 74 L88 70 L88 78 Z" fill="#F7F5F2"/>' +
        '<path d="M34 56 L34 66 M40 54 L40 64 M46 54 L46 64" stroke="#4A7FA8" stroke-width="2.4" stroke-linecap="round"/>' +
        '<circle cx="44" cy="50" r="4" fill="#2B2B33"/><circle cx="76" cy="50" r="4" fill="#2B2B33"/>' +
        '<circle cx="45" cy="49" r="1.4" fill="#FFFFFF"/><circle cx="77" cy="49" r="1.4" fill="#FFFFFF"/>'
      );
    },
    monkey: function () {
      return svg(
        '<circle cx="28" cy="60" r="13" fill="#A97142"/><circle cx="92" cy="60" r="13" fill="#A97142"/>' +
        '<circle cx="28" cy="60" r="7" fill="#D9B382"/><circle cx="92" cy="60" r="7" fill="#D9B382"/>' +
        '<ellipse cx="60" cy="64" rx="34" ry="32" fill="#A97142"/>' +
        '<circle cx="48" cy="60" r="16" fill="#F2DFC0"/><circle cx="72" cy="60" r="16" fill="#F2DFC0"/>' +
        '<ellipse cx="60" cy="76" rx="23" ry="17" fill="#F2DFC0"/>' +
        eyes(58, 12, 4.2) +
        '<ellipse cx="60" cy="72" rx="3" ry="2.2" fill="#8A5A2B"/>' +
        '<path d="M52 82 Q60 88 68 82" fill="none" stroke="#8A5A2B" stroke-width="2.2" stroke-linecap="round"/>' +
        '<path d="M58 30 Q54 18 64 16 Q68 24 64 32 Z" fill="#5FB86F"/>'
      );
    },
    qilin: function () {
      return svg(
        '<path d="M22 54 Q10 38 20 22 Q34 34 36 50 Z" fill="#F2994A"/>' +
        '<path d="M98 54 Q110 38 100 22 Q86 34 84 50 Z" fill="#F2994A"/>' +
        '<path d="M44 36 Q36 20 40 10 Q50 20 50 34 M76 36 Q84 20 80 10 Q70 20 70 34" fill="none" stroke="#F2C94C" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M44 34 Q38 24 41 16 M76 34 Q82 24 79 16" fill="none" stroke="#C98A3A" stroke-width="2.4" stroke-linecap="round"/>' +
        '<ellipse cx="60" cy="66" rx="33" ry="31" fill="#7FB86F"/>' +
        '<ellipse cx="60" cy="80" rx="17" ry="11" fill="#C9E8B0"/>' +
        '<path d="M30 58 Q38 54 44 60 M90 58 Q82 54 76 60" fill="none" stroke="#4A9E5C" stroke-width="2.6" stroke-linecap="round"/>' +
        amberEyes(58, 14, 4.6) +
        '<path d="M54 76 Q60 72 66 76 Q63 81 60 82 Q57 81 54 76 Z" fill="#F2994A"/>' +
        '<path d="M46 86 Q40 92 36 90 M74 86 Q80 92 84 90" fill="none" stroke="#F2C94C" stroke-width="2.4" stroke-linecap="round"/>' +
        '<circle cx="60" cy="46" r="3.4" fill="#E85D5D"/>'
      );
    },
    baize: function () {
      return svg(
        '<circle cx="36" cy="42" r="15" fill="#E8F3FF"/><circle cx="84" cy="42" r="15" fill="#E8F3FF"/>' +
        '<circle cx="28" cy="60" r="13" fill="#D6EAF8"/><circle cx="92" cy="60" r="13" fill="#D6EAF8"/>' +
        '<path d="M42 34 Q34 18 40 10 Q48 22 48 34 M78 34 Q86 18 80 10 Q72 22 72 34" fill="none" stroke="#F2C94C" stroke-width="5" stroke-linecap="round"/>' +
        '<ellipse cx="60" cy="64" rx="34" ry="32" fill="#F7F5F2"/>' +
        '<ellipse cx="60" cy="78" rx="18" ry="13" fill="#E8F3FF"/>' +
        '<path d="M40 42 Q48 38 54 44 M80 42 Q72 38 66 44" fill="none" stroke="#B8C3D1" stroke-width="2.4" stroke-linecap="round"/>' +
        eyes(60, 14, 4.4) +
        '<ellipse cx="60" cy="50" rx="5" ry="8" fill="#FFFFFF" stroke="#BB6BD9" stroke-width="2"/>' +
        '<ellipse cx="60" cy="50" rx="2" ry="4" fill="#BB6BD9"/>' +
        '<ellipse cx="60" cy="78" rx="4.5" ry="3.4" fill="#9AA7B8"/>' +
        '<path d="M52 86 Q60 91 68 86" fill="none" stroke="#9AA7B8" stroke-width="2.2" stroke-linecap="round"/>'
      );
    },
    ninefox: function () {
      return svg(
        '<path d="M38 78 Q10 64 12 36 Q26 52 44 64 Z" fill="#F7F5F2"/>' +
        '<path d="M82 78 Q110 64 108 36 Q94 52 76 64 Z" fill="#F7F5F2"/>' +
        '<path d="M34 82 Q6 78 4 54 Q22 64 40 72 Z" fill="#F7C6D0"/>' +
        '<path d="M86 82 Q114 78 116 54 Q98 64 80 72 Z" fill="#F7C6D0"/>' +
        '<path d="M60 86 Q34 92 24 78 Q40 74 54 76 Z" fill="#F7F5F2"/>' +
        '<path d="M60 86 Q86 92 96 78 Q80 74 66 76 Z" fill="#F7F5F2"/>' +
        '<path d="M30 46 L34 20 L56 40 Z" fill="#F7F5F2"/>' +
        '<path d="M90 46 L86 20 L64 40 Z" fill="#F7F5F2"/>' +
        '<ellipse cx="60" cy="64" rx="32" ry="30" fill="#F7F5F2"/>' +
        '<ellipse cx="60" cy="79" rx="16" ry="11" fill="#FFF3E6"/>' +
        amberEyes(58, 13, 4.4) +
        '<path d="M55 75 Q60 71 65 75 Q62 80 60 81 Q58 80 55 75 Z" fill="#E85D5D"/>' +
        '<path d="M48 38 Q54 32 60 38 Q66 32 72 38" fill="none" stroke="#F2C94C" stroke-width="2.4" stroke-linecap="round"/>' +
        '<circle cx="60" cy="44" r="3.2" fill="#E85D5D"/>'
      );
    },
    qiongqi: function () {
      return svg(
        '<path d="M22 54 Q6 40 12 22 Q28 34 36 48 Z" fill="#4A3A5A"/>' +
        '<path d="M98 54 Q114 40 108 22 Q92 34 84 48 Z" fill="#4A3A5A"/>' +
        '<circle cx="34" cy="38" r="11" fill="#5A4A6A"/><circle cx="86" cy="38" r="11" fill="#5A4A6A"/>' +
        '<ellipse cx="60" cy="66" rx="34" ry="32" fill="#5A4A6A"/>' +
        '<path d="M50 38 L54 52 M70 38 L66 52 M31 60 L41 62 M89 60 L79 62" stroke="#2E2438" stroke-width="4" stroke-linecap="round"/>' +
        '<ellipse cx="60" cy="80" rx="18" ry="13" fill="#8A6A9A"/>' +
        '<ellipse cx="46" cy="58" rx="5" ry="6" fill="#E85D5D"/><ellipse cx="74" cy="58" rx="5" ry="6" fill="#E85D5D"/>' +
        '<ellipse cx="46" cy="58" rx="1.6" ry="4.5" fill="#2B2B33"/><ellipse cx="74" cy="58" rx="1.6" ry="4.5" fill="#2B2B33"/>' +
        '<path d="M54 78 L50 90 L58 84 M66 78 L70 90 L62 84" fill="#F7F5F2"/>' +
        '<path d="M52 84 Q60 90 68 84" fill="none" stroke="#2E2438" stroke-width="2.4" stroke-linecap="round"/>'
      );
    },
    white_tiger: function () {
      return svg(
        '<path d="M22 54 Q6 40 12 22 Q28 34 36 48 Z" fill="#D6EAF8"/>' +
        '<path d="M98 54 Q114 40 108 22 Q92 34 84 48 Z" fill="#D6EAF8"/>' +
        '<circle cx="34" cy="38" r="11" fill="#F0F4F8"/><circle cx="86" cy="38" r="11" fill="#F0F4F8"/>' +
        '<ellipse cx="60" cy="66" rx="34" ry="32" fill="#F0F4F8"/>' +
        '<path d="M50 38 L54 52 M70 38 L66 52 M31 60 L41 62 M89 60 L79 62" stroke="#4FA8E8" stroke-width="4" stroke-linecap="round"/>' +
        '<ellipse cx="60" cy="80" rx="18" ry="13" fill="#FFFFFF"/>' +
        '<ellipse cx="46" cy="58" rx="5" ry="6" fill="#4FA8E8"/><ellipse cx="74" cy="58" rx="5" ry="6" fill="#4FA8E8"/>' +
        '<ellipse cx="46" cy="58" rx="1.6" ry="4.5" fill="#2B2B33"/><ellipse cx="74" cy="58" rx="1.6" ry="4.5" fill="#2B2B33"/>' +
        '<path d="M54 78 L50 90 L58 84 M66 78 L70 90 L62 84" fill="#F7F5F2"/>' +
        '<path d="M52 84 Q60 90 68 84" fill="none" stroke="#9AA7B8" stroke-width="2.4" stroke-linecap="round"/>'
      );
    },
    xuanwu: function () {
      return svg(
        '<ellipse cx="60" cy="88" rx="44" ry="19" fill="#3A5A58"/>' +
        '<path d="M18 88 Q60 64 102 88 Q60 102 18 88 Z" fill="#4A6B6A"/>' +
        '<path d="M34 86 L46 78 L58 86 L70 78 L82 86" fill="none" stroke="#2E4A48" stroke-width="2.4"/>' +
        '<ellipse cx="60" cy="54" rx="26" ry="24" fill="#4A6B6A"/>' +
        '<ellipse cx="60" cy="64" rx="15" ry="10" fill="#6A8B88"/>' +
        '<path d="M24 70 Q14 52 30 42 Q36 58 34 72" fill="none" stroke="#5FB86F" stroke-width="6" stroke-linecap="round"/>' +
        '<circle cx="30" cy="42" r="6" fill="#5FB86F"/><circle cx="29" cy="40" r="1.5" fill="#2B2B33"/>' +
        '<ellipse cx="49" cy="52" rx="5" ry="6" fill="#4FC3E8"/><ellipse cx="71" cy="52" rx="5" ry="6" fill="#4FC3E8"/>' +
        '<ellipse cx="49" cy="52" rx="1.6" ry="4.5" fill="#2B2B33"/><ellipse cx="71" cy="52" rx="1.6" ry="4.5" fill="#2B2B33"/>' +
        '<path d="M55 64 Q60 68 65 64" fill="none" stroke="#2E4A48" stroke-width="2" stroke-linecap="round"/>'
      );
    },
    zhuque: function () {
      return svg(
        '<path d="M20 50 Q8 34 18 18 Q32 32 36 48 Z" fill="#F2994A"/>' +
        '<path d="M100 50 Q112 34 102 18 Q88 32 84 48 Z" fill="#F2994A"/>' +
        '<path d="M40 36 Q30 20 36 8 Q48 20 50 34 M80 36 Q90 20 84 8 Q72 20 70 34" fill="none" stroke="#F2C94C" stroke-width="5" stroke-linecap="round"/>' +
        '<ellipse cx="60" cy="64" rx="33" ry="31" fill="#E85D5D"/>' +
        '<ellipse cx="60" cy="78" rx="17" ry="11" fill="#F2994A"/>' +
        '<path d="M56 72 L48 86 L60 80 L72 86 L64 72 Z" fill="#F2C94C"/>' +
        eyes(58, 13, 4.4) +
        '<path d="M44 38 Q52 30 60 38 Q68 30 76 38" fill="none" stroke="#F2C94C" stroke-width="2.6" stroke-linecap="round"/>' +
        '<path d="M46 86 Q40 94 34 92 M74 86 Q80 94 86 92" fill="none" stroke="#F2994A" stroke-width="2.4" stroke-linecap="round"/>'
      );
    },
    qinglong: function () {
      return svg(
        '<circle cx="24" cy="36" r="12" fill="#E8F3FF" opacity="0.8"/><circle cx="96" cy="34" r="14" fill="#E8F3FF" opacity="0.8"/>' +
        '<path d="M44 36 Q34 18 40 8 Q50 20 50 34 M76 36 Q86 18 80 8 Q70 20 70 34" fill="none" stroke="#F2C94C" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M44 34 Q38 24 41 14 M76 34 Q82 24 79 14" fill="none" stroke="#C98A3A" stroke-width="2.4" stroke-linecap="round"/>' +
        '<ellipse cx="60" cy="64" rx="34" ry="32" fill="#3FA9A0"/>' +
        '<ellipse cx="60" cy="78" rx="18" ry="12" fill="#8FD8D0"/>' +
        '<path d="M28 58 Q36 54 42 60 M92 58 Q84 54 78 60" fill="none" stroke="#2E7A72" stroke-width="2.6" stroke-linecap="round"/>' +
        amberEyes(58, 14, 4.6) +
        '<path d="M54 74 Q60 70 66 74 Q63 79 60 80 Q57 79 54 74 Z" fill="#2E7A72"/>' +
        '<path d="M44 84 Q34 92 28 90 M76 84 Q86 92 92 90" fill="none" stroke="#F2C94C" stroke-width="2.4" stroke-linecap="round"/>' +
        '<path d="M40 40 L46 44 M80 40 L74 44" stroke="#2E7A72" stroke-width="2.4" stroke-linecap="round"/>'
      );
    },
    phoenix: function () {
      return svg(
        '<path d="M18 54 Q4 36 16 18 Q32 34 36 50 Z" fill="#F2C94C"/>' +
        '<path d="M102 54 Q116 36 104 18 Q88 34 84 50 Z" fill="#F2C94C"/>' +
        '<path d="M34 42 Q20 30 26 14 Q40 28 44 44 Z" fill="#F2994A"/>' +
        '<path d="M86 42 Q100 30 94 14 Q80 28 76 44 Z" fill="#F2994A"/>' +
        '<ellipse cx="60" cy="64" rx="32" ry="30" fill="#F2994A"/>' +
        '<ellipse cx="60" cy="78" rx="17" ry="11" fill="#F7E3B0"/>' +
        '<path d="M56 72 L48 86 L60 80 L72 86 L64 72 Z" fill="#F2C94C"/>' +
        eyes(58, 13, 4.4) +
        '<path d="M42 36 Q52 24 60 34 Q68 24 78 36" fill="none" stroke="#E85D5D" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M46 86 Q36 96 28 92 M74 86 Q84 96 92 92" fill="none" stroke="#F2C94C" stroke-width="2.4" stroke-linecap="round"/>'
      );
    },
    kun: function () {
      return svg(
        '<path d="M18 60 Q20 34 60 32 Q100 34 102 60 Q84 90 60 90 Q36 90 18 60 Z" fill="#3F7FA8"/>' +
        '<path d="M18 60 Q6 52 4 40 Q18 44 26 54 Z" fill="#8ED8F8"/>' +
        '<path d="M102 60 Q114 52 116 40 Q102 44 94 54 Z" fill="#8ED8F8"/>' +
        '<path d="M30 74 Q60 94 90 74" fill="none" stroke="#1E4A68" stroke-width="7" stroke-linecap="round"/>' +
        '<path d="M34 78 L42 74 L42 82 Z M46 82 L54 78 L54 86 Z M58 84 L66 80 L66 88 Z M70 82 L78 78 L78 86 Z M82 78 L90 74 L90 82 Z" fill="#F7F5F2"/>' +
        '<path d="M34 54 Q40 48 46 54 M74 54 Q80 48 86 54" fill="none" stroke="#8ED8F8" stroke-width="3" stroke-linecap="round"/>' +
        '<circle cx="44" cy="50" r="5" fill="#2B2B33"/><circle cx="76" cy="50" r="5" fill="#2B2B33"/>' +
        '<circle cx="45" cy="49" r="1.8" fill="#FFFFFF"/><circle cx="77" cy="49" r="1.8" fill="#FFFFFF"/>' +
        '<path d="M50 40 Q60 34 70 40" fill="none" stroke="#2E6E8E" stroke-width="2.4" stroke-linecap="round"/>'
      );
    },
    zhulong: function () {
      return svg(
        '<path d="M44 36 Q34 18 40 8 Q50 20 50 34 M76 36 Q86 18 80 8 Q70 20 70 34" fill="none" stroke="#F2C94C" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M60 10 Q52 2 56 0 Q62 2 60 10 Q64 2 70 0 Q72 6 66 12 Z" fill="#F2994A"/>' +
        '<ellipse cx="60" cy="64" rx="34" ry="32" fill="#C0392B"/>' +
        '<ellipse cx="60" cy="78" rx="18" ry="12" fill="#E88A7A"/>' +
        '<path d="M28 58 Q36 54 42 60 M92 58 Q84 54 78 60" fill="none" stroke="#8A2A20" stroke-width="2.6" stroke-linecap="round"/>' +
        amberEyes(58, 14, 4.6) +
        '<path d="M54 74 Q60 70 66 74 Q63 79 60 80 Q57 79 54 74 Z" fill="#8A2A20"/>' +
        '<path d="M44 84 Q34 92 28 90 M76 84 Q86 92 92 90" fill="none" stroke="#F2C94C" stroke-width="2.4" stroke-linecap="round"/>' +
        '<path d="M42 40 L48 44 M78 40 L72 44" stroke="#8A2A20" stroke-width="2.4" stroke-linecap="round"/>'
      );
    },
    yinglong: function () {
      return svg(
        '<path d="M22 54 Q6 40 12 22 Q28 34 36 48 Z" fill="#4FA8E8"/>' +
        '<path d="M98 54 Q114 40 108 22 Q92 34 84 48 Z" fill="#4FA8E8"/>' +
        '<path d="M44 36 Q34 18 40 8 Q50 20 50 34 M76 36 Q86 18 80 8 Q70 20 70 34" fill="none" stroke="#F2C94C" stroke-width="5" stroke-linecap="round"/>' +
        '<ellipse cx="60" cy="64" rx="34" ry="32" fill="#D9A23A"/>' +
        '<ellipse cx="60" cy="78" rx="18" ry="12" fill="#F7E3B0"/>' +
        '<path d="M28 58 Q36 54 42 60 M92 58 Q84 54 78 60" fill="none" stroke="#B07A20" stroke-width="2.6" stroke-linecap="round"/>' +
        amberEyes(58, 14, 4.6) +
        '<path d="M54 74 Q60 70 66 74 Q63 79 60 80 Q57 79 54 74 Z" fill="#B07A20"/>' +
        '<path d="M44 84 Q34 92 28 90 M76 84 Q86 92 92 90" fill="none" stroke="#F2C94C" stroke-width="2.4" stroke-linecap="round"/>' +
        '<path d="M40 40 L46 44 M80 40 L74 44" stroke="#B07A20" stroke-width="2.4" stroke-linecap="round"/>'
      );
    }
  };

  function creature(id) {
    return '<img class="art-img creature-render" src="./assets/renders/' + id + '.png" alt="">';
  }

  /* ---------- 装饰物 ---------- */
  var DECO = {
    palm: function () {
      return '<svg class="art-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<path d="M30 60 Q28 44 33 32 Q36 24 40 20" fill="none" stroke="#A97142" stroke-width="7" stroke-linecap="round"/>' +
        '<path d="M36 26 Q22 18 12 24 Q22 28 36 30 Z" fill="#4A9E5C"/>' +
        '<path d="M37 24 Q38 10 50 6 Q46 18 40 27 Z" fill="#5FB86F"/>' +
        '<path d="M39 27 Q52 18 60 24 Q50 30 41 31 Z" fill="#4A9E5C"/>' +
        '<path d="M36 29 Q24 36 26 48 Q34 40 39 33 Z" fill="#5FB86F"/>' +
        '<circle cx="34" cy="30" r="3.4" fill="#8A5A2B"/>' +
        '<circle cx="40" cy="32" r="3" fill="#8A5A2B"/>' +
        '<ellipse cx="34" cy="60" rx="14" ry="4" fill="#5A8F4A" opacity="0.5"/>' +
        '</svg>';
    },
    flowers: function () {
      return '<svg class="art-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<path d="M20 58 L20 36 M32 58 L32 28 M44 58 L44 38" stroke="#4A9E5C" stroke-width="3.4" stroke-linecap="round"/>' +
        '<circle cx="20" cy="33" r="6" fill="#F27E9D"/><circle cx="20" cy="33" r="2.4" fill="#F2C94C"/>' +
        '<circle cx="32" cy="25" r="7" fill="#F2994A"/><circle cx="32" cy="25" r="2.6" fill="#FFF3E6"/>' +
        '<circle cx="44" cy="35" r="6" fill="#BB6BD9"/><circle cx="44" cy="35" r="2.4" fill="#F2C94C"/>' +
        '<path d="M14 56 L50 56" stroke="#5A8F4A" stroke-width="3" stroke-linecap="round"/>' +
        '</svg>';
    },
    fence: function () {
      return '<svg class="art-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<path d="M12 52 L12 24 L18 18 L18 52 Z M30 52 L30 24 L36 18 L36 52 Z M48 52 L48 24 L54 18 L54 52 Z" fill="#C98A5A"/>' +
        '<rect x="8" y="30" width="50" height="6" rx="3" fill="#A97142"/>' +
        '<rect x="8" y="42" width="50" height="6" rx="3" fill="#A97142"/>' +
        '<path d="M8 58 L56 58" stroke="#5A8F4A" stroke-width="3" stroke-linecap="round"/>' +
        '</svg>';
    },
    coral: function () {
      return '<svg class="art-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<path d="M32 58 L32 30 M32 40 Q22 36 18 24 M32 36 Q42 32 46 20 M32 48 Q24 46 20 40 M32 46 Q40 44 44 38" ' +
        'fill="none" stroke="#F27E9D" stroke-width="5" stroke-linecap="round"/>' +
        '<circle cx="18" cy="22" r="4" fill="#F2999D"/>' +
        '<circle cx="46" cy="18" r="4" fill="#F2999D"/>' +
        '<ellipse cx="32" cy="58" rx="16" ry="4" fill="#4FC3E8" opacity="0.6"/>' +
        '</svg>';
    },
    lantern: function () {
      return '<svg class="art-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<rect x="26" y="40" width="12" height="18" rx="3" fill="#B8B8C2"/>' +
        '<rect x="20" y="24" width="24" height="18" rx="4" fill="#D8D8E0"/>' +
        '<rect x="24" y="28" width="16" height="10" rx="2" fill="#F2C94C"/>' +
        '<path d="M18 24 L46 24 L40 18 L24 18 Z" fill="#9AA7B8"/>' +
        '<circle cx="32" cy="33" r="3" fill="#FFF3B0"/>' +
        '<ellipse cx="32" cy="60" rx="14" ry="3.5" fill="#5A8F4A" opacity="0.5"/>' +
        '</svg>';
    },
    swing: function () {
      return '<svg class="art-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<path d="M14 58 L22 14 M50 58 L42 14 M22 14 L42 14" fill="none" stroke="#A97142" stroke-width="4.5" stroke-linecap="round"/>' +
        '<path d="M26 16 L26 38 M38 16 L38 38" stroke="#D8CDBB" stroke-width="2.4"/>' +
        '<rect x="22" y="38" width="20" height="6" rx="3" fill="#C98A5A"/>' +
        '<ellipse cx="32" cy="59" rx="18" ry="3.5" fill="#5A8F4A" opacity="0.5"/>' +
        '</svg>';
    },
    campfire: function () {
      return '<svg class="art-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<path d="M18 52 L46 44 M18 44 L46 52" stroke="#8A5A2B" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M32 46 Q20 38 30 24 Q32 34 36 32 Q34 20 42 14 Q42 28 48 34 Q52 42 44 48 Q40 52 32 52 Q24 50 32 46 Z" fill="#F2994A"/>' +
        '<path d="M32 46 Q26 40 33 32 Q36 38 40 36 Q42 44 38 48 Q35 50 32 46 Z" fill="#F2C94C"/>' +
        '<ellipse cx="32" cy="58" rx="18" ry="4" fill="#5A8F4A" opacity="0.5"/>' +
        '</svg>';
    },
    scarecrow: function () {
      return '<svg class="art-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<path d="M32 58 L32 24 M18 32 L46 32" stroke="#A97142" stroke-width="4.5" stroke-linecap="round"/>' +
        '<circle cx="32" cy="22" r="9" fill="#F2DFC0"/>' +
        '<path d="M23 16 L41 16 L36 10 L28 10 Z" fill="#C98A5A"/>' +
        '<path d="M28 24 L28 25 M36 24 L36 25" stroke="#3A2A1A" stroke-width="2" stroke-linecap="round"/>' +
        '<path d="M20 38 L26 34 M44 38 L38 34" stroke="#D8CDBB" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M18 58 L46 58" stroke="#5A8F4A" stroke-width="3" stroke-linecap="round"/>' +
        '</svg>';
    },
    hut: function () {
      return '<svg class="art-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<rect x="16" y="32" width="32" height="24" rx="2" fill="#D9B382"/>' +
        '<path d="M10 34 L32 14 L54 34 Z" fill="#C98A5A"/>' +
        '<rect x="27" y="42" width="10" height="14" rx="1.5" fill="#8A5A2B"/>' +
        '<rect x="20" y="37" width="7" height="6" rx="1" fill="#F2C94C"/>' +
        '<rect x="38" y="37" width="7" height="6" rx="1" fill="#F2C94C"/>' +
        '<ellipse cx="32" cy="59" rx="22" ry="3.5" fill="#5A8F4A" opacity="0.5"/>' +
        '</svg>';
    },
    windmill: function () {
      return '<svg class="art-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<path d="M25 58 L29 24 L35 24 L39 58 Z" fill="#D8CDBB"/>' +
        '<path d="M30 26 L32 12 L34 26 Z" fill="#B8B8C2"/>' +
        '<g transform="rotate(18 32 26)">' +
        '<rect x="30" y="4" width="4" height="22" rx="2" fill="#F7F5F2"/>' +
        '<rect x="30" y="26" width="4" height="22" rx="2" fill="#F7F5F2"/>' +
        '<rect x="10" y="24" width="22" height="4" rx="2" fill="#F7F5F2"/>' +
        '<rect x="32" y="24" width="22" height="4" rx="2" fill="#F7F5F2"/>' +
        '</g>' +
        '<circle cx="32" cy="26" r="4" fill="#C98A5A"/>' +
        '<ellipse cx="32" cy="59" rx="18" ry="3.5" fill="#5A8F4A" opacity="0.5"/>' +
        '</svg>';
    },
    fountain: function () {
      return '<svg class="art-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<ellipse cx="32" cy="52" rx="22" ry="8" fill="#B8C3D1"/>' +
        '<ellipse cx="32" cy="50" rx="18" ry="6" fill="#4FC3E8"/>' +
        '<path d="M32 48 Q24 36 20 30 M32 48 Q32 30 32 24 M32 48 Q40 36 44 30" fill="none" stroke="#8ED8F8" stroke-width="3" stroke-linecap="round"/>' +
        '<circle cx="20" cy="28" r="2.6" fill="#8ED8F8"/><circle cx="32" cy="22" r="2.6" fill="#8ED8F8"/><circle cx="44" cy="28" r="2.6" fill="#8ED8F8"/>' +
        '<path d="M18 54 Q32 60 46 54" fill="none" stroke="#F7F5F2" stroke-width="2.5" stroke-linecap="round"/>' +
        '</svg>';
    },
    statue: function () {
      return '<svg class="art-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<rect x="20" y="50" width="24" height="8" rx="2" fill="#B8B8C2"/>' +
        '<rect x="24" y="42" width="16" height="8" rx="1.5" fill="#D8D8E0"/>' +
        '<path d="M32 42 L32 22" stroke="#D8D8E0" stroke-width="8" stroke-linecap="round"/>' +
        '<circle cx="32" cy="18" r="7" fill="#D8D8E0"/>' +
        '<path d="M38 26 L48 14" stroke="#F2C94C" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M44 18 L50 12 L52 16 L46 22 Z" fill="#F2C94C"/>' +
        '<ellipse cx="32" cy="59" rx="20" ry="3" fill="#5A8F4A" opacity="0.5"/>' +
        '</svg>';
    }
  };

  function deco(id) {
    var fn = DECO[id] || DECO.flowers;
    return fn();
  }

  /* ---------- 装备图标 ---------- */
  function itemGlyph(item) {
    var c = '#FFF3E6';
    if (item.type === 'weapon') {
      if (item.id === 'stone_axe') {
        return '<path d="M14 38 L30 22" stroke="#F7E3B0" stroke-width="4" stroke-linecap="round"/>' +
          '<path d="M28 20 Q38 12 42 20 Q38 30 28 26 Z" fill="' + c + '"/>';
      }
      if (item.id === 'iron_spear') {
        return '<path d="M12 40 L34 18" stroke="#F7E3B0" stroke-width="3.5" stroke-linecap="round"/>' +
          '<path d="M32 16 L42 8 L38 20 Z" fill="' + c + '"/>';
      }
      if (item.id === 'thunder_hammer') {
        return '<path d="M16 36 L30 22" stroke="#F7E3B0" stroke-width="4.5" stroke-linecap="round"/>' +
          '<rect x="26" y="8" width="14" height="12" rx="2" fill="' + c + '"/>';
      }
      return '<path d="M14 38 L34 18" stroke="#F7E3B0" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M30 20 L40 8 L42 12 L34 24 Z" fill="' + c + '"/>' +
        '<path d="M18 30 L24 36" stroke="' + c + '" stroke-width="3" stroke-linecap="round"/>';
    }
    if (item.type === 'armor') {
      return '<path d="M24 8 L38 14 L36 30 Q34 40 24 44 Q14 40 12 30 L10 14 Z" fill="' + c + '"/>' +
        '<path d="M24 14 L24 36" stroke="#B8B8C2" stroke-width="2"/>';
    }
    if (item.id === 'king_crown') {
      return '<path d="M10 34 L12 16 L20 24 L24 10 L28 24 L36 16 L38 34 Z" fill="' + c + '"/>' +
        '<rect x="10" y="34" width="28" height="5" rx="2" fill="#F2C94C"/>';
    }
    if (item.id === 'wind_boots') {
      return '<path d="M16 12 L24 12 L24 30 L36 34 L36 40 L16 40 Z" fill="' + c + '"/>' +
        '<path d="M12 24 L22 20 M12 30 L22 26" stroke="#B8B8C2" stroke-width="2" stroke-linecap="round"/>';
    }
    if (item.id === 'power_bracer') {
      return '<rect x="12" y="18" width="24" height="12" rx="4" fill="' + c + '"/>' +
        '<rect x="16" y="21" width="16" height="6" rx="2" fill="#B8B8C2"/>';
    }
    if (item.id === 'moon_amulet') {
      return '<circle cx="24" cy="24" r="11" fill="' + c + '"/>' +
        '<path d="M28 15 A11 11 0 1 0 28 33 A8 8 0 1 1 28 15 Z" fill="#8ED8F8"/>';
    }
    return '<path d="M24 8 L34 20 L24 40 L14 20 Z" fill="' + c + '"/>' +
      '<path d="M24 14 L29 21 L24 32 L19 21 Z" fill="#8ED8F8"/>';
  }

  function itemArt(item) {
    var rc = (window.GAME_DATA.CONFIG.rarityColors[item.rarity] || '#9AA7B8');
    return '<svg class="art-svg" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<rect x="2" y="2" width="44" height="44" rx="12" fill="' + rc + '" opacity="0.18"/>' +
      itemGlyph(item) +
      '</svg>';
  }

  /* ---------- 作物 ---------- */
  function cropArt(cropId, stage) {
    var crop = null;
    var list = window.GAME_DATA.CROPS;
    for (var i = 0; i < list.length; i += 1) {
      if (list[i].id === cropId) crop = list[i];
    }
    var head = '<svg class="art-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<ellipse cx="32" cy="54" rx="22" ry="7" fill="#8A5A2B" opacity="0.45"/>';
    if (!crop) {
      return head + '<path d="M22 50 L42 50" stroke="#C9A875" stroke-width="2.5" stroke-linecap="round"/>' +
        '<circle cx="28" cy="46" r="2" fill="#C9A875"/><circle cx="37" cy="48" r="1.6" fill="#C9A875"/></svg>';
    }
    if (stage === 0) {
      return head +
        '<path d="M32 52 L32 40" stroke="#4A9E5C" stroke-width="3.4" stroke-linecap="round"/>' +
        '<path d="M32 44 Q24 42 22 34 Q30 34 32 40 Z" fill="#5FB86F"/>' +
        '<path d="M32 46 Q40 44 42 36 Q34 36 32 42 Z" fill="#4A9E5C"/>' +
        '<circle cx="32" cy="37" r="2" fill="#8ED8F8"/></svg>';
    }
    if (stage === 1) {
      return head +
        '<path d="M32 52 L32 28" stroke="#4A9E5C" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M32 38 Q20 34 18 22 Q28 24 32 32 Z" fill="#5FB86F"/>' +
        '<path d="M32 42 Q44 38 46 26 Q36 28 32 36 Z" fill="#4A9E5C"/>' +
        '<circle cx="32" cy="24" r="4" fill="' + crop.color + '" opacity="0.8"/></svg>';
    }
    var fruit = '';
    if (crop.type === 'buff') {
      fruit = '<path d="M32 53 L32 30" stroke="#7A5235" stroke-width="5" stroke-linecap="round"/>' +
        '<circle cx="22" cy="28" r="12" fill="#3F6F4A"/>' +
        '<circle cx="38" cy="22" r="13" fill="#4F8A55"/>' +
        '<circle cx="43" cy="34" r="10" fill="#5F9A5D"/>' +
        '<circle cx="28" cy="20" r="9" fill="#76B06A"/>' +
        '<circle cx="21" cy="30" r="4.6" fill="' + crop.color + '"/>' +
        '<circle cx="38" cy="24" r="4.2" fill="' + crop.color + '"/>' +
        '<circle cx="41" cy="36" r="3.6" fill="' + crop.color + '"/>' +
        '<path d="M21 30 L21 30.2 M38 24 L38 24.2" stroke="#FFF3C4" stroke-width="2" stroke-linecap="round"/>' +
        '<circle cx="32" cy="42" r="10" fill="none" stroke="' + crop.color + '" stroke-width="1.2" opacity="0.45"/>';
    } else if (cropId === 'carrot') {
      fruit = '<path d="M26 34 L38 34 L32 54 Z" fill="#F2994A"/>' +
        '<path d="M28 32 Q32 22 36 32" fill="none" stroke="#4A9E5C" stroke-width="3" stroke-linecap="round"/>';
    } else if (cropId === 'pumpkin') {
      fruit = '<ellipse cx="32" cy="42" rx="16" ry="13" fill="#E8833A"/>' +
        '<path d="M32 29 L32 24" stroke="#4A9E5C" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M24 32 Q20 42 24 52 M40 32 Q44 42 40 52" fill="none" stroke="#C96A28" stroke-width="2"/>';
    } else {
      fruit = '<path d="M32 22 L35 32 L46 32 L37 38 L40 49 L32 43 L24 49 L27 38 L18 32 L29 32 Z" fill="#F2C94C"/>' +
        '<circle cx="32" cy="35" r="3" fill="#FFF3B0"/>';
    }
    return head +
      '<path d="M32 52 L32 34" stroke="#4A9E5C" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M32 44 Q20 40 18 30 Q28 30 32 38 Z" fill="#5FB86F"/>' +
      '<path d="M32 46 Q44 42 46 32 Q36 32 32 40 Z" fill="#4A9E5C"/>' +
      fruit + '</svg>';
  }

  /* ---------- 通用小图标 ---------- */
  function icon(name, color) {
    var c = color || '#FFFFFF';
    var paths = {
      coin: '<circle cx="12" cy="12" r="8.5" fill="#F2C94C"/><circle cx="12" cy="12" r="6" fill="none" stroke="#C98A3A" stroke-width="1.6"/><path d="M12 8.5 L12 15.5 M9.5 11 L14.5 11" stroke="#8A5A2B" stroke-width="1.6" stroke-linecap="round"/>',
      seed: '<path d="M12 20 Q6 16 7 9 Q13 8 16 14 Q17 18 12 20 Z" fill="#6FCF97"/><path d="M12 20 Q12 14 15 10" stroke="#3E8E4E" stroke-width="1.4" fill="none"/>',
      water: '<path d="M12 3 Q18 11 18 15 A6 6 0 0 1 6 15 Q6 11 12 3 Z" fill="#4FC3E8"/><path d="M9.5 15 A2.5 2.5 0 0 0 12 17.5" stroke="#D6F4FF" stroke-width="1.5" fill="none" stroke-linecap="round"/>',
      fert: '<path d="M7 8h10l-1 12H8L7 8z" fill="#8A5A2B"/><path d="M7.5 8c0-2.5 9-2.5 9 0" stroke="#C98A5A" stroke-width="1.2" fill="none"/><path d="M9.5 11.5h5M9.8 14.5h4.4" stroke="#E8C894" stroke-width="1.3" stroke-linecap="round"/><path d="M12 8V5.5" stroke="#6FA85F" stroke-width="1.4"/><path d="M12 6c1.8-.5 3 .2 3.5 1.7-1.6.5-2.8-.1-3.5-1.7z" fill="#6FA85F"/>',
      power: '<path d="M13 2 L5 14 L11 14 L10 22 L19 9 L13 9 Z" fill="#F2994A"/>',
      star: '<path d="M12 3 L14.6 9.2 L21 9.8 L16 14.2 L17.6 21 L12 17.4 L6.4 21 L8 14.2 L3 9.8 L9.4 9.2 Z" fill="#F2C94C"/>',
      clock: '<circle cx="12" cy="12" r="8" fill="none" stroke="' + c + '" stroke-width="2"/><path d="M12 7 L12 12 L15.5 14" stroke="' + c + '" stroke-width="2" fill="none" stroke-linecap="round"/>',
      refresh: '<path d="M20 12 A8 8 0 1 1 17 5.8" fill="none" stroke="' + c + '" stroke-width="2.4" stroke-linecap="round"/><path d="M17 2 L17 7 L12 7" fill="none" stroke="' + c + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
      boost: '<path d="M12 3 L19 12 L14.5 12 L14.5 20 L9.5 20 L9.5 12 L5 12 Z" fill="' + c + '"/>',
      shield: '<path d="M12 2 L20 6 L19 14 Q18 19 12 22 Q6 19 5 14 L4 6 Z" fill="' + c + '"/>',
      double: '<path d="M12 3 L15 9 L21 10 L16.5 14.5 L17.5 21 L12 18 L6.5 21 L7.5 14.5 L3 10 L9 9 Z" fill="' + c + '"/><path d="M12 7 L12 17" stroke="#FFF3E6" stroke-width="2"/>',
      sword: '<path d="M20 4 L10 14" stroke="' + c + '" stroke-width="2.6" stroke-linecap="round"/><path d="M11 4 L20 4 L20 13 Z" fill="' + c + '"/><path d="M4 20 L8.5 15.5" stroke="' + c + '" stroke-width="2.8" stroke-linecap="round"/><path d="M5 14 L10 19" stroke="' + c + '" stroke-width="2.2" stroke-linecap="round"/>',
      tower: '<path d="M6 21V8h2V5h2v3h4V5h2v3h2v13H6z" fill="' + c + '"/><path d="M10 21v-5h4v5" fill="#171009" opacity=".3"/><path d="M8 10h8M8 13h8" stroke="#171009" stroke-width="1" opacity=".25"/>',
      sprout: '<path d="M12 21v-8" stroke="' + c + '" stroke-width="2.2" stroke-linecap="round"/><path d="M12 14c-4.2 0-6.2-2.3-6.6-6.2 4.1 0 6.2 2.1 6.6 6.2z" fill="' + c + '"/><path d="M12 12c.4-4.1 2.5-6.2 6.6-6.2-.4 4.1-2.5 6.2-6.6 6.2z" fill="' + c + '"/>',
      bag: '<path d="M6 8h12l1 13H5L6 8z" fill="' + c + '"/><path d="M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="' + c + '" stroke-width="2"/><path d="M9 12h6" stroke="#171009" stroke-width="1.2" opacity=".3"/>',
      book: '<path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1V5z" fill="' + c + '"/><path d="M12 6v14" stroke="#171009" stroke-width="1.2" opacity=".3"/>',
      tree: '<path d="M12 2 L16.5 8.5 H13.8 L18 14.5 H6 L10.2 8.5 H7.5 Z" fill="' + c + '"/><rect x="11" y="14" width="2" height="6" fill="' + c + '"/>',
      build: '<path d="M14.7 4.2 L19.8 9.3 L17.9 11.2 L12.8 6.1 Z" fill="' + c + '"/><path d="M12.2 6.7 L4.5 14.4 L9.6 19.5 L17.3 11.8 Z" fill="' + c + '"/><path d="M3.5 16.5 L7.5 20.5" stroke="' + c + '" stroke-width="2.6" stroke-linecap="round"/>',
      fast: '<path d="M4 5 L11 12 L4 19 Z M11 5 L18 12 L11 19 Z" fill="' + c + '"/>',
      gem: '<path d="M12 3 L20 9 L16 21 L8 21 L4 9 Z" fill="' + c + '"/>',
      check: '<path d="M4 12 L10 18 L20 6" fill="none" stroke="' + c + '" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
      home: '<path d="M4 11 L12 4 L20 11 L18 11 L18 20 L14 20 L14 14 L10 14 L10 20 L6 20 L6 11 Z" fill="' + c + '"/>',
      back: '<path d="M15 4 L7 12 L15 20" fill="none" stroke="' + c + '" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
      close: '<path d="M6 6 L18 18 M18 6 L6 18" stroke="' + c + '" stroke-width="2.6" stroke-linecap="round"/>'
    };
    return '<svg class="icon-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      (paths[name] || paths.star) + '</svg>';
  }

  function elementIcon(element) {
    var elements = window.GAME_DATA.ELEMENTS;
    var e = elements[element] || elements.land;
    var symbols = {
      sky: '<path d="M4 15c0-2.2 1.6-3.9 3.8-3.9.5-2.2 2.3-3.8 4.5-3.8 2.5 0 4.5 2 4.5 4.4.3-.1.6-.1.9-.1 1.9 0 3.3 1.4 3.3 3.2s-1.4 3.2-3.3 3.2H7.8C5.7 18 4 16.9 4 15z" fill="' + e.color + '"/>',
      land: '<path d="M3 18 L9 7 L13 14 L16 9 L21 18 Z" fill="' + e.color + '"/><path d="M9 7 L7 12 L11 12 Z" fill="#FFFFFF" opacity="0.5"/>',
      water: '<path d="M12 3c4.5 5.5 6.5 8.5 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 11.5 7.5 8.5 12 3z" fill="' + e.color + '"/><path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
      spirit: '<path d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z" fill="' + e.color + '"/><circle cx="12" cy="12" r="2.4" fill="#FFFFFF"/>'
    };
    return '<svg class="elem-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="11" fill="' + e.soft + '"/>' + (symbols[element] || symbols.land) + '</svg>';
  }

  window.Art = {
    creature: creature,
    deco: deco,
    item: itemArt,
    crop: cropArt,
    icon: icon,
    elementIcon: elementIcon
  };
}());
