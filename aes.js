function hexToStateMatrix(hex) {
  const bytes = hex.match(/.{1,2}/g).map(b => parseInt(b, 16));
  const matrix = [[], [], [], []];
  for (let i = 0; i < 16; i++) {
    matrix[i % 4].push(bytes[i]);
  }
  return matrix;
}

function stateMatrixToHex(matrix) {
  let hex = '';
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      hex += matrix[row][col].toString(16).padStart(2, '0');
    }
  }
  return hex.toUpperCase();
}
function hexToAscii(hex) {
  return hex.match(/.{1,2}/g).map(byte => String.fromCharCode(parseInt(byte, 16))).join('');
}
function stateToString(matrix) {
  return matrix.map(row => row.map(b => b.toString(16).padStart(2, '0')).join(' ')).join('\n');
}
const AES_SBOX = [ // S-box
  0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
  0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
  0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
  0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
  0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
  0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
  0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
  0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
  0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
  0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
  0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
  0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
  0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
  0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
  0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
  0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
];
const AES_INV_SBOX = new Array(256);
for (let i = 0; i < 256; i++) {
  AES_INV_SBOX[AES_SBOX[i]] = i;
}

function gmul(a, b) {
  let p = 0;
  for (let counter = 0; counter < 8; counter++) {
    if (b & 1) p ^= a;
    let hiBitSet = a & 0x80;
    a = (a << 1) & 0xFF;
    if (hiBitSet) a ^= 0x1b;
    b >>= 1;
  }
  return p;
}
function mixColumns(state) {
  const mixed = [[], [], [], []];
  for (let c = 0; c < 4; c++) {
    mixed[0][c] = gmul(state[0][c], 2) ^ gmul(state[1][c], 3) ^ state[2][c] ^ state[3][c];
    mixed[1][c] = state[0][c] ^ gmul(state[1][c], 2) ^ gmul(state[2][c], 3) ^ state[3][c];
    mixed[2][c] = state[0][c] ^ state[1][c] ^ gmul(state[2][c], 2) ^ gmul(state[3][c], 3);
    mixed[3][c] = gmul(state[0][c], 3) ^ state[1][c] ^ state[2][c] ^ gmul(state[3][c], 2);
  }
  return mixed;
}
function invMixColumns(state) {
  const mixed = [[], [], [], []];
  for (let c = 0; c < 4; c++) {
    mixed[0][c] = gmul(state[0][c], 0x0e) ^ gmul(state[1][c], 0x0b) ^ gmul(state[2][c], 0x0d) ^ gmul(state[3][c], 0x09);
    mixed[1][c] = gmul(state[0][c], 0x09) ^ gmul(state[1][c], 0x0e) ^ gmul(state[2][c], 0x0b) ^ gmul(state[3][c], 0x0d);
    mixed[2][c] = gmul(state[0][c], 0x0d) ^ gmul(state[1][c], 0x09) ^ gmul(state[2][c], 0x0e) ^ gmul(state[3][c], 0x0b);
    mixed[3][c] = gmul(state[0][c], 0x0b) ^ gmul(state[1][c], 0x0d) ^ gmul(state[2][c], 0x09) ^ gmul(state[3][c], 0x0e);
  }
  return mixed;
}


function subBytes(state) {
  return state.map(row => row.map(b => AES_SBOX[b]));
}
function invSubBytes(state) {
  return state.map(row => row.map(b => AES_INV_SBOX[b]));
}

function shiftRows(state) {
  return state.map((row, i) => row.slice(i).concat(row.slice(0, i)));
}
function invShiftRows(state) {
  return state.map((row, i) => row.slice(4 - i).concat(row.slice(0, 4 - i)));
}

function addRoundKey(state, roundKey) {
  return state.map((row, r) => row.map((val, c) => val ^ roundKey[r][c]));
}
const RCON = [
  0x00, 0x01, 0x02, 0x04, 0x08,
  0x10, 0x20, 0x40, 0x80, 0x1B, 0x36
];
function keyExpansion(keyHex) {
  const keyBytes = keyHex.match(/.{1,2}/g).map(h => parseInt(h, 16));
  const Nk = 4; 
  const Nb = 4;  
  const Nr = 10;

  const w = [];  

  for (let i = 0; i < Nk; i++) {
    w[i] = keyBytes.slice(4 * i, 4 * (i + 1));
  }

  for (let i = Nk; i < Nb * (Nr + 1); i++) {
    let temp = w[i - 1].slice();
    if (i % Nk === 0) {
      temp = subWord(rotWord(temp));
      temp[0] ^= RCON[i / Nk];
    }
    w[i] = xorWords(w[i - Nk], temp);
  }

  return w; 
}

function rotWord(word) {
  return word.slice(1).concat(word[0]);
}

function subWord(word) {
  return word.map(b => AES_SBOX[b]);
}

function xorWords(a, b) {
  return a.map((v, i) => v ^ b[i]);
}
function roundKeyToMatrix(w, round) {
  const matrix = [[], [], [], []];
  for (let i = 0; i < 4; i++) {
    const word = w[round * 4 + i];
    if (!word || word.length !== 4) {
      throw new Error(`Invalid round key for round ${round}, index ${round * 4 + i}`);
    }
    for (let row = 0; row < 4; row++) {
      matrix[row].push(word[row]);
    }
  }
  return matrix;
}


function aesEncryptVisualize(plaintextHex, keyHex, rounds = 10) {
  const output = document.getElementById("visualization-area");
  output.innerHTML = `<h2>AES Encryption Visualization</h2>`;

  let state = hexToStateMatrix(plaintextHex);
  const roundKeys = keyExpansion(keyHex); 

  output.innerHTML += `<pre>Initial State:\n${stateToString(state)}</pre>`;
  output.innerHTML += `<pre>Initial Key:\n${stateToString(roundKeyToMatrix(roundKeys, 0))}</pre>`;


  state = addRoundKey(state, roundKeyToMatrix(roundKeys, 0));
  output.innerHTML += `<pre>Round Key 0:\n${stateToString(roundKeyToMatrix(roundKeys, 0))}</pre>`;

  for (let round = 1; round < rounds; round++) {
    output.innerHTML += `<h3>Round ${round}</h3>`;

    state = subBytes(state);
    output.innerHTML += `<pre>After SubBytes:\n${stateToString(state)}</pre>`;

    state = shiftRows(state);
    output.innerHTML += `<pre>After ShiftRows:\n${stateToString(state)}</pre>`;

    state = mixColumns(state);
    output.innerHTML += `<pre>After MixColumns:\n${stateToString(state)}</pre>`;

    state = addRoundKey(state, roundKeyToMatrix(roundKeys, round));
    output.innerHTML += `<pre>Round Key ${round}:\n${stateToString(roundKeyToMatrix(roundKeys, round))}</pre>`;

  }

  // Final round (no MixColumns)
  output.innerHTML += `<h3>Final Round</h3>`;
  state = subBytes(state);
  output.innerHTML += `<pre>After SubBytes:\n${stateToString(state)}</pre>`;

  state = shiftRows(state);
  output.innerHTML += `<pre>After ShiftRows:\n${stateToString(state)}</pre>`;

  state = addRoundKey(state, roundKeyToMatrix(roundKeys, rounds));
  output.innerHTML += `<pre>Final Round Key ${rounds}:\n${stateToString(roundKeyToMatrix(roundKeys, rounds))}</pre>`;

  output.innerHTML += `<pre>Final State:\n${stateToString(state)}</pre>`;
  output.innerHTML += `<pre>Final Ciphertext (Hex): ${stateMatrixToHex(state)}</pre>`;

}

function aesDecryptVisualize(ciphertextHex, keyHex, rounds = 10) {
  const output = document.getElementById("visualization-area");
  output.innerHTML = `<h2>AES Decryption Visualization</h2>`;

  let state = hexToStateMatrix(ciphertextHex);
  if (keyHex.length !== 32) {
    alert("AES-128 requires a 16-byte (32 hex characters) key.");
    return;
  }

  const roundKeys = keyExpansion(keyHex);

  output.innerHTML += `<pre>Initial Ciphertext:\n${stateToString(state)}</pre>`;
  output.innerHTML += `<pre>Initial Key:\n${stateToString(roundKeyToMatrix(roundKeys, 0))}</pre>`;


  state = addRoundKey(state, roundKeyToMatrix(roundKeys, rounds));
  output.innerHTML += `<pre>Round Key ${rounds}:\n${stateToString(roundKeyToMatrix(roundKeys, rounds))}</pre>`;
  state = invShiftRows(state);  
  state = invSubBytes(state);   

  output.innerHTML += `<pre>After Final Round:\n${stateToString(state)}</pre>`;

  for (let round = rounds - 1; round > 0; round--) {
    output.innerHTML += `<h3>Round ${round}</h3>`;

    state = addRoundKey(state, roundKeyToMatrix(roundKeys, round));
    output.innerHTML += `<pre>Round Key ${round}:\n${stateToString(roundKeyToMatrix(roundKeys, round))}</pre>`;

    state = invMixColumns(state);
    output.innerHTML += `<pre>After InvMixColumns:\n${stateToString(state)}</pre>`;

    state = invShiftRows(state);
    state = invSubBytes(state);

    output.innerHTML += `<pre>After InvShiftRows & InvSubBytes:\n${stateToString(state)}</pre>`;
  }

  state = addRoundKey(state, roundKeyToMatrix(roundKeys, 0));
  output.innerHTML += `<pre>Final Round Key 0:\n${stateToString(roundKeyToMatrix(roundKeys, 0))}</pre>`;
  const asciiop = hexToAscii(stateMatrixToHex(state));
  output.innerHTML += `<pre>Final Plaintext\nHex: ${stateMatrixToHex(state)}\nASCII: ${asciiop}</pre>`;
}

//individual functions for AES
function aesSubBytes() {
  toggleEncryptionModeVisibility(false);
  const output = document.getElementById("visualization-area");
  const inputText = document.getElementById("plaintext").value.trim();
  const key = document.getElementById("key").value.trim();

  if (!inputText || !key) {
    alert("Please enter both plaintext and key.");
    return;
  }

  const textInputType = getinptype("PTtype");
  let textHex = textInputType === "hex" ? inputText.toLowerCase() : asciitohex(inputText);
  textHex = textHex.padEnd(32, '0');

  const state = hexToStateMatrix(textHex);
  const result = subBytes(state);
  output.innerHTML = `<h2>SubBytes</h2><pre>${stateToString(result)}</pre>`;
}

function aesShiftRows() {
  toggleEncryptionModeVisibility(false);
  const output = document.getElementById("visualization-area");
  const inputText = document.getElementById("plaintext").value.trim();
  const key = document.getElementById("key").value.trim();

  if (!inputText || !key) {
    alert("Please enter both plaintext and key.");
    return;
  }

  const textInputType = getinptype("PTtype");
  let textHex = textInputType === "hex" ? inputText.toLowerCase() : asciitohex(inputText);
  textHex = textHex.padEnd(32, '0');

  const state = hexToStateMatrix(textHex);
  const result = shiftRows(state);
  output.innerHTML = `<h2>ShiftRows</h2><pre>${stateToString(result)}</pre>`;
}

function aesMixColumns() {
  toggleEncryptionModeVisibility(false);
  const output = document.getElementById("visualization-area");
  const inputText = document.getElementById("plaintext").value.trim();
  const key = document.getElementById("key").value.trim();

  if (!inputText || !key) {
    alert("Please enter both plaintext and key.");
    return;
  }

  const textInputType = getinptype("PTtype");
  let textHex = textInputType === "hex" ? inputText.toLowerCase() : asciitohex(inputText);
  textHex = textHex.padEnd(32, '0');

  const state = hexToStateMatrix(textHex);
  const result = mixColumns(state);
  output.innerHTML = `<h2>MixColumns</h2><pre>${stateToString(result)}</pre>`;
}

function aesAddRoundKey() {
  toggleEncryptionModeVisibility(false);
  const output = document.getElementById("visualization-area");
  const inputText = document.getElementById("plaintext").value.trim();
  const key = document.getElementById("key").value.trim();

  if (!inputText || !key) {
    alert("Please enter both plaintext and key.");
    return;
  }

  const textInputType = getinptype("PTtype");
  let textHex = textInputType === "hex" ? inputText.toLowerCase() : asciitohex(inputText);
  textHex = textHex.padEnd(32, '0');

  const keyInputType = getinptype("keyType");
  let keyHex = keyInputType === "hex" ? key.toLowerCase() : asciitohex(key);
  keyHex = keyHex.padEnd(32, '0');

  const state = hexToStateMatrix(textHex);
  const roundKeys = keyExpansion(keyHex);
  const rkMatrix = roundKeyToMatrix(roundKeys, 0);
  const result = addRoundKey(state, rkMatrix);

  output.innerHTML = `<h2>AddRoundKey (Round 0)</h2>
<pre>Key Matrix:\n${stateToString(rkMatrix)}</pre>
<pre>Result:\n${stateToString(result)}</pre>`;
}
function getinptype(group) {
  const radios = Array.from(document.getElementsByName(group));
  for (const r of radios) {
    if (r.checked) return r.value;
  }
  return 'hex';
}

function asciitohex(str) {
  return Array.from(str)
    .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
}

function runAESOperation(op) {
  const inputText = document.getElementById("aesplaintext").value.trim();
  if (!inputText) {
    alert(`Please enter input`);
    return;
  }

  const textInputType = getinptype("PTtype");
  let textHex = textInputType === "hex" ? inputText.toLowerCase() : asciitohex(inputText);

  const validHexChars = "0123456789abcdef";
  if (textInputType === "hex") {
    for (let char of textHex) {
      if (!validHexChars.includes(char)) {
        alert("Invalid input: Only hexadecimal characters (0-9, a-f) are allowed.");
        return;
      }
    }
  }

  if (textHex.length > 32) {
    alert("AES requires 16-byte state");
    return;
  }
  textHex = textHex.padEnd(32, '0');

  const state = hexToStateMatrix(textHex);
  const output = document.getElementById("output");
  let result;

  if (op === "subBytes") {
    result = subBytes(state);
    output.innerHTML = `<h3>SubBytes Output:</h3><pre>${stateToString(result)}</pre>`;
  } else if (op === "shiftRows") {
    result = shiftRows(state);
    output.innerHTML = `<h3>ShiftRows Output:</h3><pre>${stateToString(result)}</pre>`;
  } else if (op === "mixColumns") {
    result = mixColumns(state);
    output.innerHTML = `<h3>MixColumns Output:</h3><pre>${stateToString(result)}</pre>`;
  }
}

function goBack() {
  window.location.href = "index.html";
}