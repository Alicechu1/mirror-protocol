<div align="center">

<!-- ============================================================ -->
<!--  1. BADGE AREA — 顶部徽章区                                   -->
<!-- ============================================================ -->

![Monad Testnet](https://img.shields.io/badge/Monad-Testnet-6366f1?style=flat-square&logo=ethereum&logoColor=white)
![ZK Groth16](https://img.shields.io/badge/ZK-Groth16_·_Poseidon-7c3aed?style=flat-square&logo=zeroone&logoColor=white)
![Mera Passkey](https://img.shields.io/badge/Mera-Passkey_🔐-ff6b35?style=flat-square)
![Dynamic Wallet](https://img.shields.io/badge/Dynamic-MPC_Wallet_👛-0ea5e9?style=flat-square)
![Patent Pending](https://img.shields.io/badge/Patent-Pending_📜-fbbf24?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellowgreen?style=flat-square)
![Hackathon](https://img.shields.io/badge/Monad_Overkill_2026-Track_04-purple?style=flat-square)

<br>
<br>

<!-- ============================================================ -->
<!--  2. HERO AREA — Hero 区                                      -->
<!-- ============================================================ -->

# 🔮 MIRROR Protocol

### **The Alignment Layer for Autonomous Agents**

**Zero-Knowledge Baseline Verification for AI Agent Behavior Alignment**
<br>
AI Agent 行为对齐的零知识基线验证协议层基础设施

<br>

<p align="center">
  <a href="https://alicechu1.github.io/mirror-protocol/">
    <img src="https://img.shields.io/badge/🌐_Live_Demo-Try_Now-667eea?style=for-the-badge" alt="Live Demo">
  </a>
  &nbsp;&nbsp;
  <a href="#-five-layer-architecture--五层架构">
    <img src="https://img.shields.io/badge/🏗️_Architecture-Explore-7c3aed?style=for-the-badge" alt="Architecture">
  </a>
  &nbsp;&nbsp;
  <a href="#-deployed-contracts--已部署合约">
    <img src="https://img.shields.io/badge/📜_Contracts-Deployed-10b981?style=for-the-badge" alt="Contracts">
  </a>
</p>

<br>

> **MIRROR is not a DApp — it's a protocol.**
> Finance is merely the first use case.
>
> MIRROR 不是一个应用，而是通用协议。金融交易只是第一个落地场景。

<br>

---

</div>

<!-- ============================================================ -->
<!--  3. WHY MIRROR — 为什么需要 MIRROR（问题陈述）                 -->
<!-- ============================================================ -->

## 🤔 Why MIRROR? / 为什么需要 MIRROR

**AI agents are becoming autonomous — but alignment remains unsolved.**
<br>
AI Agent 正变得越来越自主，但对齐问题始终没有根本解。

| Approach / 方案 | Problem / 问题 |
|---|---|
| **Rule Engines 规则引擎** | Fragile — hard-coded rules break at the edge of distribution <br> 脆弱 — 硬编码规则在分布边缘必然失效 |
| **RLHF / SFT** | Unauditable — safety is inside black-box model weights <br> 不可审计 — 安全约束被封死在黑盒模型权重里 |
| **Blacklists 黑名单机制** | Reactive — you only know after the damage is done <br> 被动 — 损失发生后才知道出了问题 |

### The Paradigm Shift / 范式转移

**From "trusting the model" to "verifying behavior."**

MIRROR moves alignment from inside model weights to the **protocol layer**. Every agent action is verified against a user-defined baseline through **zero-knowledge proofs**, with all attestations permanently recorded on-chain. Safety becomes a verifiable, inheritable, auditable protocol property — not a training artifact.

> MIRROR 将对齐从模型内部搬到协议层。每一次 Agent 行为通过零知识证明与用户基线进行比对，所有行为证据上链存证。安全不再是训练的副产物，而是协议层的确定性属性。

---

<!-- ============================================================ -->
<!--  4. FIVE-LAYER ARCHITECTURE — 五层架构                        -->
<!-- ============================================================ -->

## 🏗️ Five-Layer Architecture / 五层架构

MIRROR is structured as a layered protocol stack, each layer building on the one below:

```
┌───────────────────────────────────────────────────────────┐
│  L5 — Non-Repudiation Layer                               │  ← On-chain attestations
│  不可抵赖层     · 链上行为存证 + 零容忍熔断                 │
├───────────────────────────────────────────────────────────┤
│  L4 — Dynamic Authorization Layer                         │  ← Real-time policy engine
│  动态授权层     · 基线继承机制 + 实时策略引擎               │
├───────────────────────────────────────────────────────────┤
│  L3 — Zero-Knowledge Verification Layer                   │  ← Groth16 ZK proofs
│  零知识验证层   · Groth16 证明 + 链上验证                  │
├───────────────────────────────────────────────────────────┤
│  L2 — Baseline Commitment Layer                           │  ← Poseidon commitment scheme
│  基线承诺层     · Poseidon 哈希承诺 + 向量空间映射         │
├───────────────────────────────────────────────────────────┤
│  L1 — Identity Foundation Layer                           │  ← Passkey / MPC wallet
│  身份基础层     · Passkey + MPC/TSS 钱包                  │
└───────────────────────────────────────────────────────────┘
```

### Layer-by-Layer / 逐层说明

- **L1 — Identity Foundation / 身份基础层**
  Passkey-first identity with MPC/TSS wallets. User biometrics never leave the device; identity is self-sovereign and serverless.
  以 Passkey 为核心的身份体系，结合 MPC/TSS 钱包。生物特征不出设备，身份完全自主。

- **L2 — Baseline Commitment / 基线承诺层**
  Abstract persona values are mapped to a computable vector space and committed via Poseidon hash. Only the commitment goes on-chain.
  将抽象人格偏好映射为可计算向量空间，通过 Poseidon 哈希承诺上链，原始数据永不泄露。

- **L3 — Zero-Knowledge Verification / 零知识验证层**
  Groth16 ZK proofs verify that every agent action complies with the baseline — without revealing either the baseline or the action.
  Groth16 零知识证明验证每次 Agent 行为是否符合基线，全程不泄露基线和行为的具体内容。

- **L4 — Dynamic Authorization / 动态授权层**
  Baselines are inherited across agent generations. Authorization scope dynamically adjusts as user state evolves.
  基线跨 Agent 代际继承，授权范围随用户状态动态调整，安全约束是"继承条件"而非"训练痕迹"。

- **L5 — Non-Repudiation / 不可抵赖层**
  All behavior is attested on-chain. Zero-tolerance circuit breaker: any violation triggers immediate attestation + agent suspension.
  所有行为链上存证，零容忍熔断机制：违规即上链 + 即刻暂停，证据永久不可篡改。

---

<!-- ============================================================ -->
<!--  5. CORE INNOVATIONS — 核心创新（3个）                        -->
<!-- ============================================================ -->

## 💡 Core Innovations / 核心创新

### 1. Multi-Dimensional Baseline Mapping / 多维基线映射

> From abstract persona to verifiable vector space / 从抽象人格到可验证向量空间

MIRROR encodes user values, risk preferences, and behavioral boundaries into a multi-dimensional computable vector. This baseline is **not a set of rules** — it's a geometric boundary in value space. Any agent action can be projected into this space and checked for compliance in constant time.

将用户价值观、风险偏好、行为边界编码为多维可计算向量。基线不是规则列表，而是价值空间中的几何边界。任何 Agent 行为都可投影到该空间并在常数时间内完成合规性检查。

### 2. ZK Proof-of-Alignment / 零知识对齐证明

> On-chain verification with full privacy / 链上验证，完全隐私

Using **Groth16** zero-knowledge proofs with **Poseidon** commitments, MIRROR proves that an action is within baseline bounds without revealing:
- The baseline values themselves (user privacy)
- The specific action details (agent privacy)

Only 4 public signals hit the chain. Proofs generate in-browser in ~600–1700ms and verify on-chain in a single EVM call.

基于 Groth16 零知识证明 + Poseidon 承诺方案，MIRROR 证明行为在基线范围内，同时不泄露：
- 基线值本身（用户隐私）
- 具体行为细节（Agent 隐私）

仅 4 个公开信号上链。浏览器端证明生成约 600–1700ms，链上验证仅需一次 EVM 调用。

### 3. Drift Detection Engine / 漂移检测引擎

> EWMA drift index + three-level alert + circuit breaker / EWMA 漂移指数 + 三级预警 + 熔断机制

MIRROR continuously tracks agent behavior deviation using an **Exponentially Weighted Moving Average (EWMA)** drift index. Three levels of response ensure safety without unnecessary interruption:

| Level / 级别 | Threshold / 阈值 | Action / 动作 |
|---|---|---|
| 🟡 Level 1 — Warning / 预警 | drift > 0.3 | User notification / 用户通知 |
| 🟠 Level 2 — Restriction / 限制 | drift > 0.6 | Action requires confirmation / 行为需确认 |
| 🔴 Level 3 — Circuit Breaker / 熔断 | drift > 0.9 | Agent suspended + on-chain attestation / Agent 暂停 + 链上存证 |

> **Patent Pending** — The combination of multi-dimensional baseline mapping, ZK proof-of-alignment, and EWMA-based drift detection with a three-level circuit breaker architecture is patent pending.

---

<!-- ============================================================ -->
<!--  6. MULTI-SCENARIO SUPPORT — 多场景支持                        -->
<!-- ============================================================ -->

## 🌐 Multi-Scenario Support / 多场景支持

MIRROR is a **general-purpose alignment protocol**. The financial trading use case is the first demonstration — but the protocol layer works across any domain where autonomous agents need behavioral guardrails.

MIRROR 是通用对齐协议。金融交易是首个演示场景，但协议层适用于所有需要自主 Agent 行为护栏的领域。

| Scenario / 场景 | Value / 价值 | Status / 状态 |
|---|---|---|
| 💰 **DeFi & Trading** <br> 去中心化金融与交易 | Asset safety + compliant trading <br> 资产安全 + 合规交易 | ✅ **Live on Monad** <br> 已在 Monad 上线 |
| 🔒 **Data Compliance** <br> 数据合规 | Data security + regulatory audit trail <br> 数据安全 + 监管审计轨迹 | ✅ Protocol-ready <br> 协议已就绪 |
| 🤝 **A2A Trust** <br> Agent 间信任 | Agent-to-agent trust network <br> Agent-to-Agent 信任网络 | ✅ Protocol-ready <br> 协议已就绪 |

> **本次黑客松以金融场景为载体验证协议能力，但 MIRROR 的设计目标是成为所有 AI Agent 的对齐基础设施。**

---

<!-- ============================================================ -->
<!--  7. TECH STACK — 技术栈                                       -->
<!-- ============================================================ -->

## 🛠️ Tech Stack / 技术栈

| Layer / 层级 | Technology / 技术 | Description / 说明 |
|---|---|---|
| 🔐 **Zero-Knowledge** | Circom + snarkjs (Groth16) | 2,101 constraints · bn128 curve · Poseidon hash |
| ⛓️ **Blockchain** | Monad Testnet (EVM) | Parallel EVM · high-throughput agent interactions |
| 🆔 **Identity** | Mera Passkey (PRF) + Dynamic.xyz | Passkey-first UX · MPC/TSS embedded wallet |
| 🎨 **Frontend** | Vanilla JS + WebAssembly | Zero-build · client-side ZK proof generation |
| 📊 **Indexing** | ethers.js + Envio HyperIndex | On-chain event query · attestation history |
| 📝 **Smart Contracts** | Solidity + Foundry + Hardhat | Full test coverage · ZK verifier end-to-end tests |

---

<!-- ============================================================ -->
<!--  8. REPOSITORY STRUCTURE — 仓库结构                            -->
<!-- ============================================================ -->

## 📁 Repository Structure / 仓库结构

```
mirror-protocol/
├── contracts/              # Solidity smart contracts / 智能合约
│   ├── PersonaBaseline.sol     # L2 — Baseline registry & commitment storage
│   ├── AgentRegistry.sol       # L4 — Agent identity, generation tracking & inheritance
│   ├── ActionAttestor.sol      # L5 — Rule-based attestation & circuit breaker
│   ├── ZKActionAttestor.sol    # L3+L5 — ZK proof verification + baseline binding
│   ├── Groth16Verifier.sol     # L3 — Auto-generated by snarkjs
│   └── interfaces/             # Protocol interface definitions
├── circuits/               # ZK circuits (Circom) / 零知识电路
│   └── ActionBaselineMatch.circom  # 4-lane baseline match circuit
├── demo/                   # Interactive demo (frontend) / 交互演示
│   ├── index.html
│   ├── mera-integration.js
│   └── dynamic-integration.js
├── indexer/                # Envio HyperIndex config / 链上索引
├── scripts/                # Deployment & utility scripts / 部署与工具脚本
├── test/                   # Foundry + Hardhat test suites / 测试
└── README.md
```

---

<!-- ============================================================ -->
<!--  9. QUICK START — 快速开始                                     -->
<!-- ============================================================ -->

## 🚀 Quick Start / 快速开始

### Try the Demo / 体验演示

**The fastest way:** Visit our live demo on GitHub Pages →
[**alicechu1.github.io/mirror-protocol**](https://alicechu1.github.io/mirror-protocol/)

**Or run locally / 本地运行:**

```bash
# Clone the repository
git clone https://github.com/alicechu1/mirror-protocol.git
cd mirror-protocol

# Serve the demo (no build step required)
cd demo
python3 -m http.server 8000
# Open http://localhost:8000 in your browser
```

> ⚠️ Must be served over HTTP (not `file://`) — WASM and snarkjs require proper CORS/content-type headers.
> 必须通过 HTTP 协议访问（不能直接打开 `file://`），WASM 和 snarkjs 需要正确的 CORS 与 Content-Type 头。

### What You Can Do in the Demo / 演示功能

1. **Connect / 连接钱包** — Use MetaMask, Mera Passkey, or Dynamic Wallet (or use Simulate Demo mode)
2. **Set Persona Baseline / 设置人格基线** — Configure 4 dimensions: risk tolerance, position size, leverage, daily volume
3. **Register Agent / 注册 Agent** — Baseline is Poseidon-hashed and registered on-chain
4. **Execute & Verify with ZK / 零知识执行与验证** — Every action generates a real Groth16 proof in your browser:
   - ✅ Compliant action → proof verifies, action attested on-chain
   - ❌ Violating action → proof verifies as non-compliant, circuit breaker triggers
5. **View ZK Proof / 查看 ZK 证明** — Inspect π_a, π_b, π_c, commitments, and match result inside the conflict modal

---

<!-- ============================================================ -->
<!--  10. DEPLOYED CONTRACTS — 智能合约（已部署）                   -->
<!-- ============================================================ -->

## 📜 Deployed Contracts / 已部署合约

**Network:** Monad Testnet (Chain ID: 10143)
**Deployer:** `0x9F1110Ef8BFa59ba4a704f7FE6957d93Ee99b97a`

| Contract / 合约 | Address / 地址 | Layer / 层级 | Description / 说明 |
|---|---|---|---|
| **ZKActionAttestor** | `0x976797046FA9d3b7C730686097bdbFF4bEE913Fb` | L3 + L5 | ZK proof verification + baseline binding + circuit breaker <br> 零知识证明验证 + 基线绑定 + 熔断机制 |
| **Groth16Verifier** | `0x276b696b04E941F871DAc91B99E0c777e3CA220D` | L3 | Groth16 verifier (snarkjs-generated, 2,101 constraints) <br> Groth16 链上验证器（snarkjs 生成，2101 个约束） |
| **PersonaBaseline** | `0x6eFE4b72F01Fde571C4Ed4c05EDe910F2f9E1435` | L2 | Baseline registry & Poseidon commitment storage <br> 基线注册表与 Poseidon 承诺存储 |
| **AgentRegistry** | `0x4F464CD9Fa81ECC19366AA382266b10e2A2C1443` | L4 | Agent identity, generation tracking & baseline inheritance <br> Agent 身份、代际追踪与基线继承 |
| **ActionAttestor** | `0xbE8af04d2dae81eb4bd9Bc2aA64303520d324146` | L5 | Rule-based action attestation & circuit breaker <br> 基于规则的行为存证与熔断 |

### On-Chain Evidence / 链上证据

| Transaction / 交易 | Result / 结果 | Events / 事件 |
|---|---|---|
| [Compliant attestation](https://testnet.monadvision.com/tx/0x898ca3bc881cc4dcf1126ef5a509e54cba4285d6140f813bdd92fc7aca827b5f) | ✅ matchResult = 1 | `ZKActionAttested` |
| [Violating attestation](https://testnet.monadvision.com/tx/0x0eeb17ef1c8d1c2e197a68e9d64cbf51555b906c7dbd7bbe05c95cbdbec9e629) | ❌ matchResult = 0 | `ZKActionAttested` + **`ZKCircuitBreakerTriggered`** |

> Both transactions succeed by design. MIRROR is non-repudiation-first: a violation never reverts — it gets attested on-chain and simultaneously fires the circuit breaker. The evidence is permanent.
> 两笔交易均成功是设计使然。MIRROR 以不可抵赖为第一原则：违规从不回滚，而是上链存证并同时触发熔断。证据永久留存。

---

<!-- ============================================================ -->
<!--  11. HACKATHON INFO — 黑客松参赛信息                           -->
<!-- ============================================================ -->

## 🏆 Hackathon / 黑客松参赛

### Monad Overkill Hackathon 2026

| Field / 项目 | Detail / 详情 |
|---|---|
| **Track / 赛道** | **Track 04 — Trust, Identity & AI Infrastructure** <br> 信任、身份与 AI 基础设施 |
| **Bounties / 赏金** | Mera ×2 (Most Creative + Best UX) · Dynamic · Envio |
| **Team / 团队** | MIRROR Team |
| **Why this track / 赛道契合** | MIRROR directly addresses agent trust infrastructure — verifiable identity, on-chain reputation, and ZK-verified behavior attestation for the ERC-8004 agent era. <br> MIRROR 直面 Agent 信任基础设施问题 — 可验证身份、链上声誉、零知识行为存证，面向 ERC-8004 Agent 时代。 |

### Track Alignment / 赛道匹配

- ✅ **Agent identity and reputation under ERC-8004** — AgentRegistry with generation tracking & baseline inheritance
- ✅ **Provenance for agent behavior** — On-chain ZK-verified action attestation
- ✅ **Cryptography for trust** — Groth16 ZK proofs + Poseidon commitments
- ✅ **Trust-minimized infrastructure** — ZKActionAttestor: no trusted oracle, proof verified entirely on-chain

---

<!-- ============================================================ -->
<!--  12. PATENT PENDING — Patent Pending 声明                     -->
<!-- ============================================================ -->

## 📝 Patent Pending / 专利申请中

> The MIRROR Protocol — including the multi-dimensional baseline mapping system, zero-knowledge proof-of-alignment mechanism, and EWMA-based drift detection with three-level circuit breaker architecture — is **Patent Pending**.
>
> MIRROR 协议（包含多维基线映射系统、零知识对齐证明机制、以及基于 EWMA 漂移检测的三级熔断架构）正在申请专利。

---

<!-- ============================================================ -->
<!--  13. LICENSE — License                                        -->
<!-- ============================================================ -->

## 📄 License / 许可证

**MIT License** — see [LICENSE](LICENSE) for details.

---

<div align="center">

<br>

**From "trusting the model" to "verifying behavior."**
<br>
从「相信模型」到「验证行为」

<br>

<sub>
Built with precision for Monad Overkill Hackathon 2026 · Track 04
<br>
MIRROR Protocol — The Alignment Layer for Autonomous Agents
</sub>

</div>
