
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

function startEncryption() {
  const algo = document.getElementById("hex").checked ? "DES" : "AES";
  const isDecrypt = document.getElementById("decryptmode").checked;
  const inputText = document.getElementById("plaintext").value.trim();
  const key = document.getElementById("key").value.trim();
  const rounds = parseInt(document.getElementById("rounds").value.trim());

  if (!inputText || !key) {
    alert(`Please enter both ${isDecrypt ? "ciphertext" : "plaintext"} and key.`);
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

  const keyInputType = getinptype("keyType");
  let keyHex = keyInputType === "hex" ? key.toLowerCase() : asciitohex(key);

  if (keyInputType === "hex") {
    for (let char of keyHex) {
      if (!validHexChars.includes(char)) {
        alert("Invalid input in key: Only hexadecimal characters (0-9, a-f) are allowed.");
        return;
      }
    }
  }

  if (algo === "AES") {
    if (textHex.length > 32 || keyHex.length > 32) {
      alert("AES requires 16-byte plaintext and key (max 32 hex characters).");
      return;
    }
    textHex = textHex.padEnd(32, '0');
    keyHex = keyHex.padEnd(32, '0');
  }

  if (algo === "DES") {
    if (isDecrypt) {
      desDecryptVisualize(textHex, keyHex, rounds);
    } else {
      desEncryptVisualize(textHex, keyHex, rounds);
    }
  } else if (algo === "AES") {
    if (isDecrypt) {
      aesDecryptVisualize(textHex, keyHex, rounds);
    } else {
      aesEncryptVisualize(textHex, keyHex, rounds);
    }
  }
}
function perfSoloAES() {
  window.location.href = "aes_operations.html";
}
