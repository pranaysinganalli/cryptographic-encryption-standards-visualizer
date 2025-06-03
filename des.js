// Initial Permutation Table (64-bit)
const IP = [
  58, 50, 42, 34, 26, 18, 10, 2,
  60, 52, 44, 36, 28, 20, 12, 4,
  62, 54, 46, 38, 30, 22, 14, 6,
  64, 56, 48, 40, 32, 24, 16, 8,
  57, 49, 41, 33, 25, 17, 9, 1,
  59, 51, 43, 35, 27, 19, 11, 3,
  61, 53, 45, 37, 29, 21, 13, 5,
  63, 55, 47, 39, 31, 23, 15, 7
];

function hexToBin64(hex) {
  return hex.match(/.{1,2}/g)
    .map(byte => parseInt(byte, 16).toString(2).padStart(8, '0'))
    .join('');
}

function permute(input, table) {
  return table.map(pos => input[pos - 1]).join('');
}
function xor(a, b) {
  return a.split('').map((bit, i) => bit ^ b[i]).join('');
}
function leftRotate(str, shift) {
  return str.slice(shift) + str.slice(0, shift);
}
const PC1 = [
  57, 49, 41, 33, 25, 17, 9,
  1, 58, 50, 42, 34, 26, 18,
  10, 2, 59, 51, 43, 35, 27,
  19, 11, 3, 60, 52, 44, 36,
  63, 55, 47, 39, 31, 23, 15,
  7, 62, 54, 46, 38, 30, 22,
  14, 6, 61, 53, 45, 37, 29,
  21, 13, 5, 28, 20, 12, 4
];
const PC2 = [
  14, 17, 11, 24, 1, 5,
  3, 28, 15, 6, 21, 10,
  23, 19, 12, 4, 26, 8,
  16, 7, 27, 20, 13, 2,
  41, 52, 31, 37, 47, 55,
  30, 40, 51, 45, 33, 48,
  44, 49, 39, 56, 34, 53,
  46, 42, 50, 36, 29, 32
];
const E = [
  32, 1, 2, 3, 4, 5,
  4, 5, 6, 7, 8, 9,
  8, 9, 10, 11, 12, 13,
  12, 13, 14, 15, 16, 17,
  16, 17, 18, 19, 20, 21,
  20, 21, 22, 23, 24, 25,
  24, 25, 26, 27, 28, 29,
  28, 29, 30, 31, 32, 1
];
const P = [
  16, 7, 20, 21,
  29, 12, 28, 17,
  1, 15, 23, 26,
  5, 18, 31, 10,
  2, 8, 24, 14,
  32, 27, 3, 9,
  19, 13, 30, 6,
  22, 11, 4, 25
];

const SBOX = [
  // S1
  [
    [14,4,13,1,2,15,11,8,3,10,6,12,5,9,0,7],
    [0,15,7,4,14,2,13,1,10,6,12,11,9,5,3,8],
    [4,1,14,8,13,6,2,11,15,12,9,7,3,10,5,0],
    [15,12,8,2,4,9,1,7,5,11,3,14,10,0,6,13]
  ],
  // S2
  [
    [15,1,8,14,6,11,3,4,9,7,2,13,12,0,5,10],
    [3,13,4,7,15,2,8,14,12,0,1,10,6,9,11,5],
    [0,14,7,11,10,4,13,1,5,8,12,6,9,3,2,15],
    [13,8,10,1,3,15,4,2,11,6,7,12,0,5,14,9]
  ],
  // S3
  [
    [10,0,9,14,6,3,15,5,1,13,12,7,11,4,2,8],
    [13,7,0,9,3,4,6,10,2,8,5,14,12,11,15,1],
    [13,6,4,9,8,15,3,0,11,1,2,12,5,10,14,7],
    [1,10,13,0,6,9,8,7,4,15,14,3,11,5,2,12]
  ],
  // S4
  [
    [7,13,14,3,0,6,9,10,1,2,8,5,11,12,4,15],
    [13,8,11,5,6,15,0,3,4,7,2,12,1,10,14,9],
    [10,6,9,0,12,11,7,13,15,1,3,14,5,2,8,4],
    [3,15,0,6,10,1,13,8,9,4,5,11,12,7,2,14]
  ],
  // S5
  [
    [2,12,4,1,7,10,11,6,8,5,3,15,13,0,14,9],
    [14,11,2,12,4,7,13,1,5,0,15,10,3,9,8,6],
    [4,2,1,11,10,13,7,8,15,9,12,5,6,3,0,14],
    [11,8,12,7,1,14,2,13,6,15,0,9,10,4,5,3]
  ],
  // S6
  [
    [12,1,10,15,9,2,6,8,0,13,3,4,14,7,5,11],
    [10,15,4,2,7,12,9,5,6,1,13,14,0,11,3,8],
    [9,14,15,5,2,8,12,3,7,0,4,10,1,13,11,6],
    [4,3,2,12,9,5,15,10,11,14,1,7,6,0,8,13]
  ],
  // S7
  [
    [4,11,2,14,15,0,8,13,3,12,9,7,5,10,6,1],
    [13,0,11,7,4,9,1,10,14,3,5,12,2,15,8,6],
    [1,4,11,13,12,3,7,14,10,15,6,8,0,5,9,2],
    [6,11,13,8,1,4,10,7,9,5,0,15,14,2,3,12]
  ],
  // S8
  [
    [13,2,8,4,6,15,11,1,10,9,3,14,5,0,12,7],
    [1,15,13,8,10,3,7,4,12,5,6,11,0,14,9,2],
    [7,11,4,1,9,12,14,2,0,6,10,13,15,3,5,8],
    [2,1,14,7,4,10,8,13,15,12,9,0,3,5,6,11]
  ],
];
const FP = [
  40, 8, 48, 16, 56, 24, 64, 32,
  39, 7, 47, 15, 55, 23, 63, 31,
  38, 6, 46, 14, 54, 22, 62, 30,
  37, 5, 45, 13, 53, 21, 61, 29,
  36, 4, 44, 12, 52, 20, 60, 28,
  35, 3, 43, 11, 51, 19, 59, 27,
  34, 2, 42, 10, 50, 18, 58, 26,
  33, 1, 41, 9, 49, 17, 57, 25
];

const SHIFTS = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];

function generateRoundKeys(keyHex) {
  // Convert hex key to 64-bit binary string
  const keyBin = hexToBin64(keyHex.padEnd(16, '0')); // pad to 64 bits

  // Apply PC-1 permutation to get 56-bit key
  const permutedKey = permute(keyBin, PC1);

  // Split into C and D halves
  let C = permutedKey.slice(0, 28);
  let D = permutedKey.slice(28, 56);

  const roundKeys = [];

  for (let i = 0; i < 16; i++) {
    // Left rotate C and D
    C = leftRotate(C, SHIFTS[i]);
    D = leftRotate(D, SHIFTS[i]);

    // Combine C and D
    const CD = C + D;

    // Apply PC-2 permutation to get 48-bit round key
    const roundKey = permute(CD, PC2);
    roundKeys.push(roundKey);
  }

  return roundKeys;
}

function feistelFunction(R, K) {
  // 1. Expansion from 32 to 48 bits
  const expandedR = permute(R, E);

  // 2. XOR with round key
  const xored = xor(expandedR, K);

  // 3. Split xored into 8 blocks of 6 bits
  let output32 = '';

  for (let i = 0; i < 8; i++) {
    const block = xored.slice(i * 6, (i + 1) * 6);

    // Calculate row: first and last bits form a 2-bit number
    const row = parseInt(block[0] + block[5], 2);

    // Calculate column: middle 4 bits
    const col = parseInt(block.slice(1, 5), 2);

    // Lookup in S-box i
    const sVal = SBOX[i][row][col];

    // Convert to 4-bit binary string
    output32 += sVal.toString(2).padStart(4, '0');
  }

  // 4. Apply P-box permutation to 32-bit output
  const permutedOutput = permute(output32, P);

  return permutedOutput;
}

function desEncryptVisualize(plaintextHex, keyHex, rounds = 16) {
  const output = document.getElementById('visualization-area');
  output.innerHTML = "";
  const inputSection = document.createElement('div');

  inputSection.innerHTML = `
    <h3>Input:</h3>
    <pre>
  Plaintext: ${plaintextHex}
  Key      : ${keyHex}
    </pre>
  `;
  output.appendChild(inputSection);

  // Step 1: Convert plaintext to binary
  const bin = hexToBin64(plaintextHex.padEnd(16, '0')); // pad to 64 bits

  const step1 = document.createElement('div');
  step1.innerHTML = `<h3>Step 1: Initial Binary plaintext after padding</h3><pre>${bin.match(/.{8}/g).join(' ')}</pre>`;
  output.appendChild(step1);

  // Step 2: Initial Permutation
  const permuted = permute(bin, IP);

  const step2 = document.createElement('div');
  step2.innerHTML = `<h3>Step 2: Initial Permutation (IP)</h3><pre>${permuted.match(/.{8}/g).join(' ')}</pre>`;
  output.appendChild(step2);

  // Step 3: Split into L0 and R0
  const L = [];
  const R = [];
  L[0] = permuted.slice(0, 32);
  R[0] = permuted.slice(32, 64);
  const step3 = document.createElement('div');
  step3.innerHTML = `<h3>Step 3: Split into L0 and R0</h3><pre>L0: ${L[0]}\nR0: ${R[0]}</pre>`;
  output.appendChild(step3);

  // Step 4: Feistel rounds (placeholder)
  const roundKeys = generateRoundKeys(keyHex);

  const totalRounds = parseInt(rounds, 10);
  const roundSection = document.createElement('div');
  roundSection.innerHTML = `<h3>Step 4: ${totalRounds} Rounds (Feistel)</h3>`;
  output.appendChild(roundSection);

  const roundOutput = document.createElement('pre');

  for (let i = 1; i <= totalRounds; i++) {
    const fOutput = feistelFunction(R[i - 1], roundKeys[i - 1]);

    // Next halves
    L[i] = R[i - 1];
    R[i] = xor(L[i - 1], fOutput);

    roundOutput.innerHTML += `Round ${i}:\nK${i-1}: ${roundKeys[i-1]}\nL${i}: ${L[i]}\nR${i}: ${R[i]}\n\n`;
  }

  roundSection.appendChild(roundOutput);

  const preOutput = R[totalRounds] + L[totalRounds];  // Note the switch of R and L

  // Apply Final Permutation
  const finalOutput = permute(preOutput, FP);

  // Display final output in hex
  const hexOutput = finalOutput.match(/.{4}/g)
    .map(bin => parseInt(bin, 2).toString(16).padStart(1, '0'))
    .join('')
    .toUpperCase();

  const finalDiv = document.createElement('div');
  finalDiv.innerHTML = `<h3>Final ciphertext (Hex):</h3><pre>${hexOutput}</pre>`;
  output.appendChild(finalDiv);
}

function desDecryptVisualize(ciphertextHex, keyHex, rounds = 16) {
  const output = document.getElementById('visualization-area');
  output.innerHTML = "";
  const inputSection = document.createElement('div');

  inputSection.innerHTML = `
    <h3>Input:</h3>
    <pre>
  Ciphertext: ${ciphertextHex}
  Key       : ${keyHex}
    </pre>
  `;
  output.appendChild(inputSection);

  // Step 1: Convert ciphertext to binary
  const bin = hexToBin64(ciphertextHex.padEnd(16, '0')); // pad to 64 bits

  const step1 = document.createElement('div');
  step1.innerHTML = `<h3>Step 1: Initial Binary ciphertext after padding</h3><pre>${bin.match(/.{8}/g).join(' ')}</pre>`;
  output.appendChild(step1);

  // Step 2: Initial Permutation
  const permuted = permute(bin, IP);

  const step2 = document.createElement('div');
  step2.innerHTML = `<h3>Step 2: Initial Permutation (IP)</h3><pre>${permuted.match(/.{8}/g).join(' ')}</pre>`;
  output.appendChild(step2);

  // Step 3: Split into L0 and R0
  const L = [];
  const R = [];
  L[0] = permuted.slice(0, 32);
  R[0] = permuted.slice(32, 64);
  const step3 = document.createElement('div');
  step3.innerHTML = `<h3>Step 3: Split into L0 and R0</h3><pre>L0: ${L[0]}\nR0: ${R[0]}</pre>`;
  output.appendChild(step3);

  // Step 4: Feistel rounds with reversed keys
  const roundKeys = generateRoundKeys(keyHex).slice(0, parseInt(rounds, 10)).reverse();

  const totalRounds = parseInt(rounds, 10);
  const roundSection = document.createElement('div');
  roundSection.innerHTML = `<h3>Step 4: ${totalRounds} Rounds (Feistel - Decryption)</h3>`;
  output.appendChild(roundSection);

  const roundOutput = document.createElement('pre');

  for (let i = 1; i <= totalRounds; i++) {
    const fOutput = feistelFunction(R[i - 1], roundKeys[i - 1]);

    // Next halves
    L[i] = R[i - 1];
    R[i] = xor(L[i - 1], fOutput);

    roundOutput.innerHTML += `Round ${i}:\nK${i-1}: ${roundKeys[i-1]}\nL${i}: ${L[i]}\nR${i}: ${R[i]}\n\n`;
  }

  roundSection.appendChild(roundOutput);

  const preOutput = R[totalRounds] + L[totalRounds];  // Switch L and R for final permutation

  // Apply Final Permutation
  const finalOutput = permute(preOutput, FP);

  // Display final output in hex
  const hexOutput = finalOutput.match(/.{4}/g)
    .map(bin => parseInt(bin, 2).toString(16).padStart(1, '0'))
    .join('')
    .toUpperCase();

  const finalDiv = document.createElement('div');
  finalDiv.innerHTML = `<h3>Final decrypted plaintext (Hex):</h3><pre>${hexOutput}</pre>`;
  output.appendChild(finalDiv);
}
