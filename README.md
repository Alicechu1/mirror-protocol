<div align="center">

# 🔮 MIRROR Protocol Suite

**AI Safety & Agent Alignment Protocol**

<p align="center">
  <em>Moving AI alignment from inside model weights to the protocol layer.</em>
</p>

<p align="center">
  <a href="#-zero-knowledge-proofs-live-on-monad">ZK Proofs</a> •
  <a href="#-five-layer-architecture">Architecture</a> •
  <a href="#-smart-contracts">Contracts</a> •
  <a href="#-interactive-demo">Demo</a> •
  <a href="#-deployed-addresses">Deployed</a> •
  <a href="#-quick-start">Quick Start</a>
</p>

[![Monad](https://img.shields.io/badge/Built%20on-Monad-6366f1.svg)](https://monad.xyz/)
[![Track 04](https://img.shields.io/badge/Track-04_Trust%2C%20Identity%20%26%20AI%20Infra-purple.svg)](https://monad.xyz/developers/hackathons/metropolis)
[![ZK: Groth16](https://img.shields.io/badge/ZK-Groth16_·_Poseidon_·_Circom-7c3aed.svg)](#-zero-knowledge-proofs-live-on-monad)
[![Mera Passkey](https://img.shields.io/badge/Powered_by-Mera_Passkey-orange.svg)](#-passkey--mera-integration)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

### 🎬 3-min ZK Demo & Live Demo

<p align="center">
  <a href="https://alicechu1.github.io/mirror-protocol/video.html">
    <img src="https://img.shields.io/badge/▶_Watch_Demo_Video-3_min_ZK_Walkthrough-7c3aed?style=for-the-badge" alt="Watch Demo Video">
  </a>
  &nbsp;&nbsp;
  <a href="https://alicechu1.github.io/mirror-protocol/">
    <img src="https://img.shields.io/badge/🌐_Live_Demo-try_in_browser-667eea?style=for-the-badge" alt="Live Demo">
  </a>
</p>

> Browser-side Groth16 proof generation · Passkey-first UX with Mera · On-chain verifier · Zero-tolerance circuit breaker
> All live on **Monad Testnet**.

---

</div>

## ⚡ Zero-Knowledge Proofs — Live on Monad

> **Layer 1 of MIRROR:** Verify that every agent action complies with the user's persona baseline — **without revealing the baseline or the action.**

MIRROR uses **Groth16 zero-knowledge proofs** (bn128 curve) with **Poseidon hash commitments**. Proofs are generated in the **browser** and re-verified on-chain by a Solidity verifier.

### What the Proof Asserts

Given a baseline vector and an action vector (both 4-dimensional, 32-bit lanes), the circuit proves in zero knowledge:

1. **Commitment correctness** — `Poseidon(baselineVector) == baselineCommitment` (matches on-chain state)
2. **Action commitment** — `Poseidon(actionVector) == actionCommitment`
3. **Per-lane compliance** — every action lane respects its baseline bound
4. **Violation threshold** — `violationCount <= matchThreshold` (protocol enforces **zero tolerance**)

### Circuit Specs

| Property | Value |
|----------|-------|
| **Circuit** | `ActionBaselineMatch.circom` |
| **Constraints** | 2,101 |
| **Curve** | bn128 (alt_bn128) |
| **Proof system** | Groth16 |
| **Hash** | Poseidon (4-input, ZK-friendly) |
| **Private inputs** | baselineVector[4], actionVector[4] |
| **Public signals** | matchResult, baselineCommitment, actionCommitment, matchThreshold |
| **Proof size** | ~724 bytes (π_a + π_b + π_c) |
| **Browser prove time** | ~600–1700 ms |

### Architecture: Trust-Minimized Verification

```
┌─────────────────┐     Groth16 proof      ┌──────────────────────┐
│   Browser /     │  ─── public signals ──► │  ZKActionAttestor    │
│   Agent Client  │     (4 signals)        │  (Solidity contract) │
│                 │                         │                      │
│  • Poseidon     │                         │  • Groth16Verifier   │
│  • snarkjs      │                         │  • Baseline binding  │
│  • WASM prover  │                         │  • Circuit breaker   │
└─────────────────┘                         └──────────────────────┘
         ▲                                            ▲
         │                                            │
  raw baseline/action                          on-chain baseline
  stay off-chain                               commitment (from L2)
```

The **ZKActionAttestor** does not trust the caller. It:
1. Re-verifies the Groth16 proof on-chain via `Groth16Verifier`
2. Binds the proved `baselineCommitment` to the agent's **actually inherited baseline** from `AgentRegistry`
3. Enforces zero tolerance — any violation triggers `ZKCircuitBreakerTriggered`

### On-Chain Evidence (Monad Testnet)

| Transaction | Result | Events |
|-------------|--------|--------|
| [Compliant attestation](https://testnet.monadvision.com/tx/0x898ca3bc881cc4dcf1126ef5a509e54cba4285d6140f813bdd92fc7aca827b5f) | ✅ matchResult = 1 | `ZKActionAttested` (1 log) |
| [Violating attestation](https://testnet.monadvision.com/tx/0x0eeb17ef1c8d1c2e197a68e9d64cbf51555b906c7dbd7bbe05c95cbdbec9e629) | ❌ matchResult = 0 | `ZKActionAttested` + **`ZKCircuitBreakerTriggered`** (2 logs) |

**Why both transactions succeed?** MIRROR is non-repudiation-first. A violation never reverts — it gets attested on-chain and simultaneously fires the circuit breaker. The evidence is permanent.

---

## 🔐 Passkey + Mera Integration

> **No seed phrase. No extension. One biometric tap → wallet + baseline, both derived from your passkey.**

MIRROR integrates **[Mera](https://mera.category.xyz/)** by Category Labs — a passkey-first wallet SDK using the **WebAuthn PRF extension**. This eliminates the biggest UX friction in crypto onboarding while enabling a novel pattern: **PRF-derived persona baselines**.

### Two Bounties, One Integration

| 🏆 Mera Bounty | How MIRROR Wins It |
|----------------|---------------------|
| **Most Creative Use of Mera** | Passkey PRF output → deterministic 4-lane persona baseline vector. Same passkey → same baseline on any device, zero server storage. |
| **Best UX Using Mera** | One-tap passkey login → wallet auto-derived → no seed phrase backup, no extension install. Sign transactions directly with passkey. |

### How It Works

```
          ┌──────────────────────┐
          │   WebAuthn Passkey   │
          │   (biometric tap)    │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │   PRF Output (32B)   │   ← deterministic, same on all devices
          └──────────┬───────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│  Wallet Derive   │    │  Baseline Derive  │
│  (wallet salt)   │    │  (baseline salt) │
│                  │    │                  │
│  secp256k1 key   │    │  4-lane vector   │
│  → EVM address   │    │  → Poseidon cm.  │
└──────────────────┘    └──────────────────┘
```

**Key insight**: Different PRF salts produce independent outputs. We use two namespaces:
- `mirror.wallet.v1` → derives the signing key for on-chain transactions
- `mirror.baseline.v1` → derives the 4-lane baseline vector (risk, daily loss, concentration, asset categories)

### Why This Matters

1. **No seed phrase, ever** — The passkey IS the key. Lost phone? Just re-authenticate on a new device with the same passkey.
2. **Baseline portability** — Your persona baseline travels with you. Same passkey on a new laptop → same baseline → same agent behavior.
3. **Zero-knowledge friendly** — The baseline derived from your passkey feeds directly into the ZK circuit. Your biometrics never leave your device; only the Poseidon commitment goes on-chain.
4. **Serverless identity** — We don't store your baseline. You don't store your baseline. The passkey hardware stores the PRF secret.

### Try It

Open the [**Live Demo**](https://alicechu1.github.io/mirror-protocol/) → click **"🔐 Create Passkey (Mera)"** → follow the WebAuthn prompt → your baseline is derived instantly.

> Requires a passkey-capable authenticator (Touch ID, Face ID, Windows Hello, 1Password, etc.) over HTTPS or localhost.

---

## 🎯 Overview

MIRROR is an **AI Safety and Agent Relational Alignment Protocol** that moves safety constraints from inside the model to the protocol layer. Safety is the kernel, agents are the carrier, and the protocol layer is the unified infrastructure that is **verifiable, inheritable, and auditable**.

### The Problem

All current alignment approaches (SFT, RLHF, DPO, Constitutional AI) share a fundamental architectural flaw: they can only prove the model behaved compliantly *during training*, not that it will never breach boundaries under any input. Safety constraints trapped inside black-box model weights are:

- ❌ **Not verifiable** — you can't prove an agent will act safely
- ❌ **Not inheritable** — each new model generation loses safety constraints
- ❌ **Not traceable** — emergent behavior and deception cannot be reliably detected

### The Solution

A paradigm shift: **from "trusting the model" to "verifying behavior."**

MIRROR encodes user values into a computable persona baseline, verifies every agent action against it through zero-knowledge proofs, and attests all behavior on-chain. Safety becomes a protocol-layer property, not a model-training property.

---

## 🏗️ Five-Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Layer 5: On-chain Attestation + Real-time Circuit      │
│  (Post-attestation — non-repudiation, deception proof)  │
├─────────────────────────────────────────────────────────┤
│  Layer 4: Conflict Presentation Mechanism               │
│  (Plural value alignment — mirror, don't decide)        │
├─────────────────────────────────────────────────────────┤
│  Layer 3: Understanding Verification Layer              │
│  (Deep motivation alignment — map, don't fit)           │
├─────────────────────────────────────────────────────────┤
│  Layer 2: Dynamic Authorization Architecture            │
│  (Inheritability — safety through architecture)         │
├─────────────────────────────────────────────────────────┤
│  Layer 1: Computable Persona Baseline + ZK Proofs       │
│  (Verifiability — verify, don't trust)  ← LIVE NOW      │
└─────────────────────────────────────────────────────────┘
```

### Layer 1 — Verifiability: Computable Persona Baseline + ZK Proofs
Encode user value structure, decision preferences, and behavioral boundaries into a verifiable reference framework. Every agent action's match against the baseline is verified through **zero-knowledge Groth16 proofs**. Raw data stays local; only Poseidon commitments go on-chain.

### Layer 2 — Inheritability: Dynamic Authorization Architecture
Every agent generation must inherit the previous generation's value baseline hash before activation. Safety constraints are "inheritance conditions" at the protocol layer, not "training traces" inside the model. Authorization scope dynamically adjusts as user state changes.

### Layer 3 — Deep Motivation: Understanding Verification Layer
Before executing any instruction, the agent verifies that its interpretation matches the user's deep motivational structure. A motivation mapping algorithm continuously infers true needs from behavioral patterns.

### Layer 4 — Plural Values: Conflict Presentation Mechanism
When misunderstanding or motivational conflict is detected, the agent acts as a mirror — presenting the conflict rather than deciding for the user.

### Layer 5 — Deception Detection: On-chain Attestation + Circuit Breaker
All behavior logs are non-hideable and non-tamperable once on-chain. ZK-verified attestations + zero-tolerance circuit breaker: three-stage constraint of pre-verification + in-process presentation + post-attestation.

---

## 📦 Smart Contracts

### Core Contracts (Deployed on Monad Testnet)

| Contract | Address | Description |
|----------|---------|-------------|
| `PersonaBaseline.sol` | `0x6eFE4b72F01Fde571C4Ed4c05EDe910F2f9E1435` | Layer 1: Persona baseline registry & commitment storage |
| `AgentRegistry.sol` | `0x4F464CD9Fa81ECC19366AA382266b10e2A2C1443` | Layer 2: Agent identity, generation tracking & inheritance (ERC-8004 aligned) |
| `ActionAttestor.sol` | `0xbE8af04d2dae81eb4bd9Bc2aA64303520d324146` | Layer 5: Rule-based action attestation & circuit breaker |
| **`Groth16Verifier.sol`** | **`0x276b696b04E941F871DAc91B99E0c777e3CA220D`** | **ZK: Groth16 verifier generated by snarkjs from ActionBaselineMatch circuit** |
| **`ZKActionAttestor.sol`** | **`0x976797046FA9d3b7C730686097bdbFF4bEE913Fb`** | **ZK: Trust-minimized on-chain proof verification + baseline binding + circuit breaker** |

### ZK Contract Highlights

- **`Groth16Verifier`** — Auto-generated by `snarkjs zkey export solidityverifier`. 2,101 constraints, bn128 pairing.
- **`ZKActionAttestor`** — 4 public signals (matchResult, baselineCommitment, actionCommitment, matchThreshold). Enforces baseline binding: the proved commitment must equal the agent's on-chain inherited baseline. Zero-tolerance policy (`MAX_ALLOWED_VIOLATIONS = 0`).

### Interfaces

- `IPersonaBaseline.sol` — Baseline registration & querying
- `IAgentRegistry.sol` — Agent registration & inheritance
- `IActionAttestor.sol` — Action attestation & verification

### Testing

```bash
# Foundry tests (core protocol)
forge test -vvvv

# Hardhat tests (ZK verifier end-to-end)
npx hardhat test test/zk-verifier.test.js
```

ZK test suite covers:
- ✅ Valid compliant proof → verified + attested
- ✅ Valid violating proof → verified + circuit breaker triggered
- ✅ Tampered proof → rejected by verifier
- ✅ Wrong baseline commitment → rejected (baseline binding check)
- ✅ Match threshold bypass → rejected by circuit

---

## 🎮 Interactive Demo

The demo runs **entirely in your browser** — proof generation happens client-side via snarkjs + WASM. No backend, no build step.

### Try it locally

```bash
cd demo
python3 -m http.server 8000
# Open http://localhost:8000
```

> ⚠️ Must be served over HTTP (not `file://`) — WASM and snarkjs require proper CORS/content-type headers.

### What you can do

1. **Connect Wallet** — or use **Simulate Demo** mode (no wallet needed, proofs still generate locally)
2. **Set Persona Baseline** — Configure 4 lanes of trading values (risk tolerance, position size, leverage, daily volume)
3. **Register Agent** — Baseline commitment is hashed with Poseidon and registered on-chain
4. **Execute & Verify with ZK** — Every action generates a real Groth16 proof in the browser:
   - ✅ **Compliant action** — proof verifies, action attested
   - ❌ **Violating action** — proof verifies as non-compliant, conflict modal pops up
   - 🔍 Inside the conflict modal: expand **"View zero-knowledge proof"** to see π_a, π_b, π_c, commitments, and matchResult
5. **Step 4 ZK Panel** — Shows proof generation time (~600–1700ms), proof size (~724 bytes), and local verification result
6. **Activity Log + On-Chain Cheat Sheet** — View attestation history and match event topic hashes against the explorer

### Key ZK Features Demonstrated

- ✅ **Browser-side Groth16 proof generation** (snarkjs + WASM, ~724 byte proofs)
- ✅ **Poseidon hash commitments** for baseline and action vectors
- ✅ **Real on-chain ZKActionAttestor** with verifier integration
- ✅ **Zero-tolerance circuit breaker** triggered by violating proofs
- ✅ **Conflict presentation UI** with embedded ZK proof viewer
- ✅ **On-chain event cheat sheet** for explorer verification

---

## 📋 Deployed Addresses

**Monad Testnet (Chain ID: 10143)**

| Contract | Address |
|----------|---------|
| PersonaBaseline | `0x6eFE4b72F01Fde571C4Ed4c05EDe910F2f9E1435` |
| AgentRegistry | `0x4F464CD9Fa81ECC19366AA382266b10e2A2C1443` |
| ActionAttestor | `0xbE8af04d2dae81eb4bd9Bc2aA64303520d324146` |
| **Groth16Verifier** | **`0x276b696b04E941F871DAc91B99E0c777e3CA220D`** |
| **ZKActionAttestor** | **`0x976797046FA9d3b7C730686097bdbFF4bEE913Fb`** |

**Deployer:** `0x9F1110Ef8BFa59ba4a704f7FE6957d93Ee99b97a`
**Core deployed:** Oct 13, 2026 · **ZK layer deployed:** Oct 14, 2026

---

## 🚀 Quick Start

### Prerequisites
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (forge, cast, anvil)
- Node.js 18+ (for ZK circuit / snarkjs tooling)
- Git
- A wallet with Monad testnet MON

### 1. Install Dependencies

```bash
git clone https://github.com/your-org/mirror-protocol.git
cd mirror-protocol

# Foundry dependencies
forge install foundry-rs/forge-std

# Node dependencies (for ZK tooling)
npm install
```

### 2. Run Tests

```bash
# Core protocol tests
forge test -vv

# ZK verifier tests
npx hardhat test test/zk-verifier.test.js
```

### 3. Deploy to Monad Testnet

```bash
# Core contracts (Foundry)
forge script script/DeployMIRROR.s.sol:DeployMIRROR \
  --rpc-url $MONAD_TESTNET_RPC \
  --private-key $PRIVATE_KEY \
  --broadcast

# ZK verifier + ZKActionAttestor (Hardhat)
npx hardhat run scripts/deploy-zk.js --network monad_testnet
```

### 4. Run the Demo

```bash
cd demo
python3 -m http.server 8000
# Open http://localhost:8000
```

---

## 🛠️ Technical Stack

| Layer | Technology | Status |
|-------|-----------|--------|
| **Smart Contracts** | Solidity + Foundry + Hardhat | ✅ Deployed |
| **ZK Proofs** | Circom 2.x + snarkjs + Groth16 + Poseidon | ✅ Deployed |
| **Frontend** | Pure HTML + Ethers.js + snarkjs (UMD) | ✅ Live |
| **Indexing** | Envio (planned) | 🔄 Planned |
| **Chain** | Monad Testnet (parallel EVM) | ✅ Live |

---

## 🏆 Monad Metropolis Hackathon

**Track:** 04 — Trust, Identity & AI Infrastructure

**Why this track:** AI has made identity, provenance, data ownership, and agent trust urgent infrastructure problems. MIRROR directly addresses the need for agent trust infrastructure — providing verifiable agent identity, on-chain reputation, and **ZK-verified behavior attestation** for the ERC-8004 agent era.

**Track examples we map to:**
- ✅ **Agent identity and reputation under ERC-8004** — AgentRegistry with generation tracking & baseline inheritance
- ✅ **Provenance for generated media / agent behavior** — On-chain ZK-verified action attestation
- ✅ **Cryptography for trust** — Groth16 ZK proofs + Poseidon commitments for privacy-preserving compliance
- ✅ **Trust-minimized infrastructure** — ZKActionAttestor: no trusted oracle, proof is verified on-chain

**Best fit validation:**
- ✅ **Cryptography** — Groth16 zero-knowledge proofs for action verification (2,101 constraints, bn128)
- ✅ **Protocol design** — Five-layer alignment protocol suite with verifiability at the base
- ✅ **Agent frameworks** — ERC-8004 compatible agent trust layer with inherited baselines

---

## 🛣️ Roadmap

### ✅ Hackathon Phase (Sep–Oct 2026)
- [x] Core protocol design (5-layer architecture)
- [x] Persona baseline smart contract (Monad testnet)
- [x] Agent identity registry (ERC-8004 direction)
- [x] Action attestation & circuit breaker (rule-based)
- [x] Interactive demo frontend
- [x] Conflict presentation UI
- [x] Full Foundry test suite
- [x] **ZK circuit** — Circom ActionBaselineMatch (2,101 constraints)
- [x] **Groth16 setup** — Powers of Tau + phase 2 ceremony
- [x] **On-chain ZK verifier** — Solidity verifier deployed on Monad testnet
- [x] **ZKActionAttestor** — Trust-minimized on-chain verification + baseline binding
- [x] **Browser-side proof generation** — snarkjs + WASM, ~724 byte proofs
- [x] **End-to-end on-chain verification** — Compliant + violating paths both tested on Monad

### 🔄 Q4 2026
- [ ] Higher-dimensional baselines (8–16 lanes)
- [ ] Recursive proof composition for multi-action batches
- [ ] Dynamic authorization engine
- [ ] Motivation mapping algorithm v1
- [ ] Envio indexer integration
- [ ] Mera Passkey integration

### 🔄 Q1 2027
- [ ] Multi-scenario baseline templates (e-commerce, mental health, finance)
- [ ] Full ERC-8004 compliance
- [ ] Cross-chain attestation support
- [ ] Agent-to-agent alignment protocol

### 🔄 Q2 2027
- [ ] DAO governance launch
- [ ] Ecosystem grant program
- [ ] Technical whitepaper

---

## 🤝 Team

| Role | Focus |
|------|-------|
| Protocol & Cryptography Engineer | On-chain attestation, ZK proofs, smart contracts |
| AI Alignment Researcher | Understanding verification, motivation inference |
| Scenario Expert | E-commerce / mental health / social / finance |
| Product & Compliance | User sovereignty, privacy, regulatory |
| Open Source Community | RFC processes, DAO governance |

We are building MIRROR as an open protocol for the entire agent ecosystem.

---

## 📚 Resources

- [Monad Developer Docs](https://docs.monad.xyz/)
- [Monad Testnet Faucet](https://faucet.monad.xyz/)
- [ERC-8004 Standard](https://eips.ethereum.org/EIPS/eip-8004)
- [Circom Documentation](https://docs.circom.io/)
- [snarkjs](https://github.com/iden3/snarkjs)
- [ZK Implementation Guide](ZK-IMPLEMENTATION-GUIDE.md)
- [Circuit README](circuits/README.md)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <p>
    <strong>From "trusting the model" to "verifying behavior."</strong>
  </p>
  <p>
    Built with ❤️ for Monad Metropolis 2026 · Track 04
  </p>
</div>
