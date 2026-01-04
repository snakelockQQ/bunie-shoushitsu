// script.js
// ===== ユーティリティ =====
function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function isInRange(codePoint, startHex, endHex) {
  return codePoint >= startHex && codePoint <= endHex;
}

// ===== ひらがな（小文字保持） =====
const HIRAGANA_NORMAL = Array.from(
  "あいうえお" +
  "かがきぎくぐけげこご" +
  "さざしじすずせぜそぞ" +
  "ただちぢつづてでとど" +
  "なにぬねの" +
  "はばぱひびぴふぶぷへべぺほぼぽ" +
  "まみむめも" +
  "やゆよ" +
  "らりるれろ" +
  "わゐゑを" +
  "んゔ"
);

const HIRAGANA_SMALL = Array.from("ぁぃぅぇぉゃゅょゎっ");

// ===== カタカナ（小文字保持、長音維持） =====
const KATAKANA_NORMAL = Array.from(
  "アイウエオ" +
  "カガキギクグケゲコゴ" +
  "サザシジスズセゼソゾ" +
  "タダチヂツヅテデトド" +
  "ナニヌネノ" +
  "ハバパヒビピフブプヘベペホボポ" +
  "マミムメモ" +
  "ヤユヨ" +
  "ラリルレロ" +
  "ワヰヱヲ" +
  "ンヴ"
);

const KATAKANA_SMALL = Array.from("ァィゥェォャュョヮッ");
const KATAKANA_KEEP = new Set(["ー"]); // 長音は固定

// ===== 英字（大文字小文字を保持） =====
const ALPHA_UPPER = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
const ALPHA_LOWER = Array.from("abcdefghijklmnopqrstuvwxyz");

// ===== 漢字（とりあえず：同ブロックの別漢字へランダム） =====
// 画数一致は辞書が必要なので、まずは「漢字っぽさ維持」で進める。
// CJK統合漢字: U+4E00..U+9FFF
function isKanji(ch) {
  const cp = ch.codePointAt(0);
  if (cp == null) return false;
  return isInRange(cp, 0x4E00, 0x9FFF);
}

// よく使う範囲からランダムに漢字を作る（表示できる可能性が高いところを狙う）
function randomKanji() {
  const cp = 0x4E00 + Math.floor(Math.random() * (0x9FFF - 0x4E00 + 1));
  return String.fromCodePoint(cp);
}

// ===== 変換モード =====
const Mode = Object.freeze({
  KANJI: "KANJI",
  HIRA: "HIRA",
  KATA: "KATA",
  ALPHA: "ALPHA",
  ALL: "ALL",
});

let lastMode = null;

// ===== 文字ごとの変換 =====
function convertChar(ch, mode) {
  // ひらがな
  if (mode === Mode.HIRA || mode === Mode.ALL) {
    if (HIRAGANA_SMALL.includes(ch)) return randomFrom(HIRAGANA_SMALL);
    if (HIRAGANA_NORMAL.includes(ch)) return randomFrom(HIRAGANA_NORMAL);
  }

  // カタカナ
  if (mode === Mode.KATA || mode === Mode.ALL) {
    if (KATAKANA_KEEP.has(ch)) return ch;
    if (KATAKANA_SMALL.includes(ch)) return randomFrom(KATAKANA_SMALL);
    if (KATAKANA_NORMAL.includes(ch)) return randomFrom(KATAKANA_NORMAL);
  }

  // 英字
  if (mode === Mode.ALPHA || mode === Mode.ALL) {
    if (ALPHA_UPPER.includes(ch)) return randomFrom(ALPHA_UPPER);
    if (ALPHA_LOWER.includes(ch)) return randomFrom(ALPHA_LOWER);
  }

  // 漢字
  if (mode === Mode.KANJI || mode === Mode.ALL) {
    if (isKanji(ch)) return randomKanji();
  }

  // その他（空白・記号・句読点・改行など）は維持
  return ch;
}

function convertText(input, mode) {
  let out = "";
  for (const ch of input) {
    out += convertChar(ch, mode);
  }
  return out;
}

// ===== DOM =====
const inputEl = document.getElementById("inputText");
const outputEl = document.getElementById("outputText");

function runConvert(mode) {
  const src = inputEl.value ?? "";
  outputEl.value = convertText(src, mode);
  lastMode = mode;
}

// ===== ボタン動作 =====
document.getElementById("clearInput").onclick = () => {
  inputEl.value = "";
  outputEl.value = "";
  lastMode = null;
};

document.getElementById("convertKanji").onclick = () => runConvert(Mode.KANJI);
document.getElementById("convertHira").onclick = () => runConvert(Mode.HIRA);
document.getElementById("convertKata").onclick = () => runConvert(Mode.KATA);
document.getElementById("convertAlpha").onclick = () => runConvert(Mode.ALPHA);
document.getElementById("convertAll").onclick = () => runConvert(Mode.ALL);

document.getElementById("regen").onclick = () => {
  if (!lastMode) {
    // まだ何も生成してない場合は一括で生成しておく
    runConvert(Mode.ALL);
    return;
  }
  runConvert(lastMode);
};

document.getElementById("moveToInput").onclick = () => {
  const text = outputEl.value ?? "";
  inputEl.value = text;
  // 移行したら出力は残してもいいけど、道具としては残る方が便利なのでそのまま
};

document.getElementById("copy").onclick = async () => {
  const text = outputEl.value ?? "";
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    outputEl.focus();
    outputEl.select();
    document.execCommand("copy");
  }
};
