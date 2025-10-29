function gcd(a, b) {
  a = Math.abs(Number(a));
  b = Math.abs(Number(b));
  while (b !== 0) {
    const t = a % b;
    a = b;
    b = t;
  }
  return Math.abs(a);
}

function modPow(base, exp, mod) {
  let result = 1n;
  let b = BigInt(base);
  let e = BigInt(exp);
  const m = BigInt(mod);
  while (e > 0n) {
    if (e & 1n) result = (result * b) % m;
    b = (b * b) % m;
    e >>= 1n;
  }
  return Number(result);
}

function chooseRandomAVerbose(N, output) {
  const tries = 60;
  output.innerHTML += `<pre>Choosing random base a in [2, ${N-2}] (up to ${tries} tries)...</pre>`;
  for (let t = 0; t < tries; t++) {
    const a = Math.floor(Math.random() * (N - 3)) + 2;
    const g = gcd(a, N);
    if (g === 1) {
      output.innerHTML += `<pre>Picked a = ${a} (gcd(${a}, ${N}) = 1) — suitable for Shor demonstration.</pre>`;
      return {a, factor: null};
    }
    if (g > 1 && g < N) {
      output.innerHTML += `<pre>Picked a = ${a} and found non-trivial gcd immediately: gcd(${a}, ${N}) = ${g}.\n(This already factors N classically.)</pre>`;

      return {a, factor: g};
    }
  }
  for (let a = 2; a <= N - 2; a++) {
    const g = gcd(a, N);
    if (g === 1) {
      output.innerHTML += `<pre>After scanning, selected a = ${a} (gcd=${g})</pre>`;
      return {a, factor: null};
    } else if (g > 1 && g < N) {
      output.innerHTML += `<pre>After scanning, found early factor gcd(${a}, ${N}) = ${g}.</pre>`;
      return {a, factor: g};
    }
  }
  return {a: null, factor: null};
}

function findCoprimeA(N) {
  for (let a = 2; a <= N - 2; a++) {
    if (gcd(a, N) === 1) return a;
  }
  return null;
}

function findOrderClassical(a, N) {
  let val = 1 % N;
  for (let r = 1; r <= N; r++) {
    val = (val * a) % N;
    if (val === 1) return r;
  }
  return null;
}

function continuedFractionExpansion(n, d) {
  const cf = [];
  let a = n, b = d;
  while (b !== 0) {
    const q = Math.floor(a / b);
    cf.push(q);
    const r = a % b;
    a = b;
    b = r;
  }
  return cf;
}
function convergentsFromCF(cf) {
  const convs = [];
  for (let k = 1; k <= cf.length; k++) {
    let num = 1, den = 0;
    for (let i = k - 1; i >= 0; i--) {
      const a = cf[i];
      const tmp = num;
      num = a * num + den;
      den = tmp;
    }
    convs.push({num, den});
  }
  return convs;
}

function simulateQFTMeasurement(r, q) {
  const j = Math.floor(Math.random() * r);
  const ideal = (j * q) / r;
  const k = Math.round(ideal);
  return {k, j};
}

function prettyList(arr, limit = 40) {
  if (arr.length <= limit) return arr.join(', ');
  return arr.slice(0, limit).join(', ') + ', ...';
}

function shorVisualize(N) {
  const output = document.getElementById('visualization-area');
  output.innerHTML = `<h2>Shor's Algorithm Visualization (N = ${N})</h2>`;

  if (!Number.isInteger(N) || N < 3) {
    output.innerHTML += `<pre>Invalid N. Enter integer ≥ 3.</pre>`;
    return;
  }

  function isPrimeSmall(x) {
    if (x < 2) return false;
    for (let i = 2; i * i <= x; i++) if (x % i === 0) return false;
    return true;
  }
  if (isPrimeSmall(N)) {
    output.innerHTML += `<pre>N = ${N} is prime — Shor demonstrates factoring composites. Please try a composite N.</pre>`;
    return;
  }

  output.innerHTML += `<h3>Classical pre-check</h3>`;
  const pick = chooseRandomAVerbose(N, output);

  if (pick.factor) {
    const f = pick.factor;
    const other = N / f;
    output.innerHTML += `<pre>Classical shortcut: gcd(${pick.a}, ${N}) = ${f} → factors: ${f} × ${other}\n(We will still continue to show the quantum order-finding demonstration using a coprime base.)</pre>`;
  
    const demoA = findCoprimeA(N);
    if (demoA === null) {
      output.innerHTML += `<pre>Could not find coprime base to continue demonstration — aborting extra steps.</pre>`;
      return;
    }
    output.innerHTML += `<pre>For demonstration we now choose a = ${demoA} (gcd(${demoA}, ${N}) = 1).</pre>`;
    var a = demoA;
  } else {
    var a = pick.a;
  }

  const capExp = 16;
  const target = N * N;
  let q = 1;
  let t = 0;
  while (q < target && t < capExp) { q <<= 1; t++; }
  if (q < target) { while (q < target) { q <<= 1; t++; if (t > 20) break; } }
  output.innerHTML += `<h3>Quantum register sizing</h3>`;
  output.innerHTML += `<pre>Choose first register size q = 2^t where q ≥ N^2.\nFor N=${N}, selected t = ${t} → q = ${q}.\n(For readability we cap q growth; q controls the resolution of the QFT.)</pre>`;

  output.innerHTML += `<h3>Step 1: Prepare uniform superposition on first register</h3>`;
  if (q <= 64) {
    const states = [];
    for (let x = 0; x < q; x++) states.push(`|${x}〉`);
    output.innerHTML += `<pre>|ψ1〉 = (1/√${q}) × [ ${states.join(' + ')} ]</pre>`;
  } else {
    output.innerHTML += `<pre>|ψ1〉 = (1/√${q}) Σ_{x=0}^{${q-1}} |x〉  (too many terms; ${q} basis states)</pre>`;
  }

  output.innerHTML += `<h3>Step 2: Apply modular exponentiation: map |x〉 → |x〉|a^x mod N〉</h3>`;
  const r = findOrderClassical(a, N);
  if (!r) {
    output.innerHTML += `<pre>Could not find order r classically (unexpected). We'll still try to illustrate the mapping for some x values.</pre>`;
  } else {
    output.innerHTML += `<pre>Classically computed order r (smallest r>0 with a^r ≡ 1 mod N): r = ${r}.</pre>`;
  }
  let mapLines = [];
  const showCount = Math.min(30, q);
  for (let x = 0; x < showCount; x++) {
    mapLines.push(`${x} : ${modPow(a, x, N)}`);
  }
  output.innerHTML += `<pre>Some a^x mod N values (x from 0..${showCount-1}):\n${mapLines.join('\n')}\n(Values repeat every r = ${r})</pre>`;

  output.innerHTML += `<h3>Step 3: Measure second register (conceptual)</h3>`;
  const x0 = (r ? (Math.floor(Math.random() * r)) : 0);
  const v = modPow(a, x0, N);
  output.innerHTML += `<pre>Suppose measurement of second register yields v = ${v} (this collapses the second register).\nFirst register collapses to superposition of x values satisfying a^x ≡ ${v} (mod ${N}). These x form an arithmetic progression x0, x0+r, x0+2r, ... within [0, q-1].</pre>`;

  const survivors = [];
  for (let x = x0; x < q; x += (r || 1)) {
    survivors.push(x);
    if (survivors.length >= 60) break;
  }
  output.innerHTML += `<pre>Example surviving x values (first few): ${prettyList(survivors, 60)}\n(Count ≈ ${Math.ceil(q / (r || 1))})</pre>`;

  output.innerHTML += `<h3>Step 4: Apply Quantum Fourier Transform (QFT) on the first register</h3>`;
  output.innerHTML += `<pre>The QFT transforms a periodic superposition (period r) into peaks in frequency space near integers k ≈ j·q/r for j=0..r-1.\nThese peaks are what measurement of the first register yields (probabilistically).</pre>`;

  if (q <= 16) {
    const rows = [];
    for (let k = 0; k < q; k++) {
      const amplitudes = [];
      for (let x = 0; x < q; x++) {
        amplitudes.push(`e^{2πi ${k* x}/${q}}`);
      }
      rows.push(`k=${k}: [${amplitudes.join(' , ')}]`);
    }
    output.innerHTML += `<pre>Small QFT symbolic map (rows show relative phases):\n${rows.join('\n')}</pre>`;
  }

  const measurement = simulateQFTMeasurement(r || 1, q);
  const kMeasured = measurement.k;
  output.innerHTML += `<pre>Simulated measurement after QFT: k = ${kMeasured} (this is sampled near peaks at multiples of q/r).\nWe will now use the rational approximation k/q to try to recover r (continued fractions).</pre>`;

  output.innerHTML += `<h3>Step 5: Continued fractions to recover r from k/q</h3>`;
  output.innerHTML += `<pre>We compute continued fraction expansion of k/q and examine convergents (p_i / q_i).\nWe look for a denominator q_i that is a candidate for r (or a divisor of r).</pre>`;

  const cf = continuedFractionExpansion(kMeasured, q);
  output.innerHTML += `<pre>Continued fraction coefficients of ${kMeasured}/${q}: [${cf.join(', ')}]</pre>`;

  const convergents = convergentsFromCF(cf);
  let foundCandidate = null;
  for (let i = 0; i < convergents.length; i++) {
    const c = convergents[i];
    if (c.den === 0) continue;
    output.innerHTML += `<pre>Convergent ${i+1}: ${c.num}/${c.den} (den=${c.den}).\nCheck candidate r' = ${c.den} ...</pre>`;
    if (c.den > 0 && c.den <= N) {
      const powTest = modPow(a, c.den, N);
      output.innerHTML += `<pre>Compute a^{r'} mod N = ${a}^${c.den} mod ${N} = ${powTest}</pre>`;
      if (powTest === 1) {
        foundCandidate = c.den;
        output.innerHTML += `<pre>Candidate r' = ${c.den} passes a^{r'} ≡ 1 (mod N). Accepting candidate r = ${c.den}.</pre>`;
        break;
      } else {
        output.innerHTML += `<pre>Candidate r' = ${c.den} did not satisfy a^{r'} ≡ 1 (mod N).</pre>`;
      }
    }
  }

  let rRecovered = foundCandidate;
  if (!rRecovered) {
    output.innerHTML += `<pre>No convergent directly gave r. We'll try multiples of candidate denominators and finally fall back to classical order-finding for the demonstration.</pre>`;

    for (let i = 0; i < convergents.length && !rRecovered; i++) {
      const baseDen = convergents[i].den;
      if (!baseDen || baseDen <= 0) continue;
      for (let mul = 1; mul <= 8; mul++) {
        const cand = baseDen * mul;
        if (cand > 0 && cand <= N) {
          const powTest = modPow(a, cand, N);
          output.innerHTML += `<pre>Try denominator ${baseDen} × ${mul} = ${cand} → a^{cand} mod N = ${powTest}</pre>`;
          if (powTest === 1) {
            rRecovered = cand;
            output.innerHTML += `<pre>Accepted r = ${cand} by multiple check.</pre>`;
            break;
          }
        }
      }
    }
  }
  if (!rRecovered) {
    const classical = findOrderClassical(a, N);
    if (classical) {
      rRecovered = classical;
      output.innerHTML += `<pre>Fallback: classical order-finding yields r = ${classical} (used for demonstration).</pre>`;
    } else {
      output.innerHTML += `<pre>Unable to recover r; the probabilistic run failed. Try clicking Start again (new random choices).</pre>`;
      return;
    }
  }

  output.innerHTML += `<h3>Step 6: Classical gcd computations to extract factors</h3>`;
  if (rRecovered % 2 !== 0) {
    output.innerHTML += `<pre>Recovered r = ${rRecovered} is odd — this run won't produce non-trivial factors via (a^{r/2} ± 1). You can rerun to try again.</pre>`;
  }
  const ar2 = modPow(a, rRecovered / 2, N);
  const factor1 = gcd(ar2 - 1, N);
  const factor2 = gcd(ar2 + 1, N);
  output.innerHTML += `<pre>a^(r/2) mod N = a^{${rRecovered/2}} mod ${N} = ${ar2}\nCompute gcd(${ar2} - 1, ${N}) and gcd(${ar2} + 1, ${N}):\n  gcd(${ar2 - 1}, ${N}) = ${factor1}\n  gcd(${ar2 + 1}, ${N}) = ${factor2}</pre>`;

  if (factor1 > 1 && factor1 < N) {
    output.innerHTML += `<pre>Success! Non-trivial factors found: ${factor1} and ${N / factor1}</pre>`;
  } else if (factor2 > 1 && factor2 < N) {
    output.innerHTML += `<pre>Success! Non-trivial factors found: ${factor2} and ${N / factor2}</pre>`;
  } else {
    output.innerHTML += `<pre>Both gcds are trivial (1 or ${N}). This probabilistic run failed to find factors — try again (Start) for another run.</pre>`;
  }

  if (pick.factor) {
    const f = pick.factor;
    const other = N / f;
    output.innerHTML += `<h3>Reminder: classical early factor</h3>`;
    output.innerHTML += `<pre>Earlier during random selection we found gcd(${pick.a}, ${N}) = ${f} which immediately yields factors ${f} and ${other}.\nShor's algorithm demonstration continued afterwards for teaching purposes.</pre>`;
  }
}
