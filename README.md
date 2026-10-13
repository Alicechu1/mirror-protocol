<div align="center">

# 🔮 MIRROR Protocol Suite

**AI Safety & Agent Alignment Protocol**

<p align="center">
  <em>Moving AI alignment from inside model weights to the protocol layer.</em>
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-five-layer-architecture">Architecture</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-smart-contracts">Contracts</a> •
  <a href="#-demo">Demo</a> •
  <a href="#-deployed-addresses">Deployed</a> •
  <a href="#-roadmap">Roadmap</a>
</p>

[![Monad](https://img.shields.io/badge/Built%20on-Monad-6366f1.svg)](https://monad.xyz/)
[![Track 04](https://img.shields.io/badge/Track-04_Trust%2C%20Identity%20%26%20AI%20Infra-purple.svg)](https://monad.xyz/developers/hackathons/metropolis)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

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
│  (Verifiability — verify, don't trust)                  │
└─────────────────────────────────────────────────────────┘
```

### Layer 1 — Verifiability: Computable Persona Baseline + ZK Proofs
Encode user value structure, decision preferences, and behavioral boundaries into a verifiable reference framework. Every agent action's match against the baseline is verified through zero-knowledge proofs. Raw data stays local; only hashes go on-chain.

### Layer 2 — Inheritability: Dynamic Authorization Architecture
Every agent generation must inherit the previous generation's value baseline hash before activation. Safety constraints are "inheritance conditions" at the protocol layer, not "training traces" inside the model. Authorization scope dynamically adjusts as user state changes.

### Layer 3 — Deep Motivation: Understanding Verification Layer
Before executing any instruction, the agent verifies that its interpretation matches the user's deep motivational structure. A motivation mapping algorithm continuously infers true needs from behavioral patterns.

### Layer 4 — Plural Values: Conflict Presentation Mechanism
When misunderstanding or motivational conflict is detected, the agent acts as a mirror — presenting the conflict rather than deciding for the user.

### Layer 5 — Deception Detection: On-chain Attestation + Circuit Breaker
All behavior logs are non-hideable and non-tamperable once on-chain. Three-stage constraint: pre-verification + in-process presentation + post-attestation.

---

## 📦 Smart Contracts

### Core Contracts (Deployed on Monad Testnet)

| Contract | Address | Description |
|----------|---------|-------------|
| `PersonaBaseline.sol` | `0x6eFE4b72F01Fde571C4Ed4c05EDe910F2f9E1435` | Layer 1: Persona baseline registry & commitment storage |
| `AgentRegistry.sol` | `0x4F464CD9Fa81ECC19366AA382266b10e2A2C1443` | Layer 2: Agent identity, generation tracking & inheritance (ERC-8004 aligned) |
| `ActionAttestor.sol` | `0xbE8af04d2dae81eb4bd9Bc2aA64303520d324146` | Layer 5: On-chain action attestation & circuit breaker |

### Interfaces

- `IPersonaBaseline.sol` — Baseline registration & querying
- `IAgentRegistry.sol` — Agent registration & inheritance
- `IActionAttestor.sol` — Action attestation & verification

### Testing

```bash
# Run all tests
forge test -vvvv

# Run integration test specifically
forge test --match-contract MIRRORIntegrationTest -vvvv
```

The test suite covers:
- Baseline registration and updates
- First-gen agent registration
- Cross-generation inheritance
- Baseline mismatch rejection
- Authorized / conflict / blocked action attestation
- Full end-to-end flow

---

## 🚀 Quick Start

### Prerequisites
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (forge, cast, anvil)
- Git
- A wallet with Monad testnet ETH

### 1. Install Dependencies

```bash
# Clone the repo
git clone https://github.com/your-org/mirror-protocol.git
cd mirror-protocol

# Install Foundry dependencies
forge install foundry-rs/forge-std
```

### 2. Run Tests

```bash
forge test -vv
```

### 3. Deploy to Monad Testnet

```bash
# Set environment variables
export PRIVATE_KEY="your-private-key"
export MONAD_TESTNET_RPC="https://testnet-rpc.monad.xyz"

# Deploy all contracts
forge script script/DeployMIRROR.s.sol:DeployMIRROR \
  --rpc-url $MONAD_TESTNET_RPC \
  --private-key $PRIVATE_KEY \
  --broadcast
```

### 4. Run the Demo

```bash
# The demo is a pure HTML/JS app — no build step needed
# Just open it in your browser
open demo/index.html
```

Or serve it:
```bash
cd demo
python3 -m http.server 8080
# Open http://localhost:8080
```

---

## 🎮 Demo

The interactive demo walks through the complete MIRROR flow:

1. **Connect Wallet** — Connect MetaMask or use simulation mode
2. **Set Persona Baseline** — Configure your trading values (risk tolerance, allowed assets, limits)
3. **Register Agent** — Create your first-gen agent that inherits your baseline
4. **Trade & Verify** — See actions get verified against your baseline in real-time
5. **Activity Log** — View all on-chain attestations

**Key features demonstrated:**
- ✅ Baseline registration & on-chain commitment
- ✅ Agent identity registration (ERC-8004 direction)
- ✅ Baseline inheritance across generations
- ✅ Real-time action verification (rule engine)
- ✅ Conflict presentation modal
- ✅ On-chain activity log
- ✅ Zero-knowledge proof hash attestation

> 💡 **Try it:** Set "Futures/Leverage" to OFF, then try to execute a futures trade. Watch the conflict presentation kick in!

---

## 📋 Deployed Addresses

**Monad Testnet (Chain ID: 10143)**

| Contract | Monad Testnet Address |
|----------|----------------------|
| PersonaBaseline | `0x6eFE4b72F01Fde571C4Ed4c05EDe910F2f9E1435` |
| AgentRegistry | `0x4F464CD9Fa81ECC19366AA382266b10e2A2C1443` |
| ActionAttestor | `0xbE8af04d2dae81eb4bd9Bc2aA64303520d324146` |

Deployer: `0x9F1110Ef8BFa59ba4a704f7FE6957d93Ee99b97a`
Deployed: Oct 13, 2026

---

## 🛠️ Technical Stack

| Layer | Technology | Description |
|-------|-----------|-------------|
| **Smart Contracts** | Solidity + Foundry | Persona baseline, agent registry, action attestor |
| **ZK Proofs** | Circom + SnarkJS (planned) | Action-baseline matching verification circuits |
| **Frontend** | Pure HTML + Ethers.js | No build tools, runs in any browser |
| **Indexing** | Envio (planned) | On-chain attestation indexing |
| **Chain** | Monad Testnet | High-throughput parallel EVM |

---

## 🏆 Monad Metropolis Hackathon

**Track:** 04 — Trust, Identity & AI Infrastructure

**Why this track:** AI has made identity, provenance, data ownership, and agent trust urgent infrastructure problems. MIRROR directly addresses the need for agent trust infrastructure — providing verifiable agent identity, on-chain reputation, and behavior attestation for the ERC-8004 agent era.

**Track examples we map to:**
- ✅ **Passkey-native accounts** — Integration with Mera Passkey
- ✅ **Agent identity and reputation under ERC-8004** — AgentRegistry with generation tracking & baseline inheritance
- ✅ **Provenance for generated media** — On-chain action attestation (generalized to all agent behavior)

**Best fit validation:**
- ✅ Cryptography — ZK proofs for action verification
- ✅ Protocol design — Five-layer alignment protocol suite
- ✅ Agent frameworks — ERC-8004 compatible agent trust layer

---

## 🛣️ Roadmap

### ✅ Hackathon Phase (Sep–Oct 2026)
- [x] Core protocol design (5-layer architecture)
- [x] Persona baseline smart contract (Monad testnet)
- [x] Agent identity registry (ERC-8004 direction)
- [x] Action attestation & circuit breaker
- [x] Rule-based verification engine
- [x] Interactive demo frontend
- [x] Conflict presentation UI
- [x] Full test suite

### 🔄 Q4 2026
- [ ] Full ZK circuit implementation (Circom)
- [ ] On-chain ZK verifier
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
- [MIRROR Project Description](project-description.md)

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
