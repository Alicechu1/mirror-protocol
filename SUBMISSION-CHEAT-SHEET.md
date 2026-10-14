# 🚀 MIRROR — Monad Metropolis 提交速查卡

> **打开这个文件，跟着步骤复制粘贴就行。所有内容都给你写好了。**

---

## 🔑 第一步：登录

打开：https://hackathon.monad.xyz/

点 **Login / Sign in**，选 **GitHub** 登录：
- 用户名：`Alicechu1`
- 密码：`ZHRBVbyqz345`

---

## 📝 第二步：找到提交入口

登录后找 **"Submit Project" / "Register" / "Apply"** 按钮，进入项目提交表单。

---

## 📋 第三步：填写表单（按字段复制）

### ⭐ 基础信息

| 字段 | 内容 |
|------|------|
| **Project Name** | `MIRROR Protocol Suite` |
| **Tagline / One-liner** | `Moving AI alignment from inside model weights to the protocol layer` |
| **Track / 赛道** | 选 **Track 04: Trust, Identity & AI Infrastructure** |

---

### 📄 Description / 项目描述（长文，直接复制下面的）

```
## The Problem

Current AI alignment faces a fundamental dilemma: all safety constraints are encapsulated inside model weights, and model weights are a black box — not externally verifiable, not traceable, not inheritable. The recursive self-improvement risk jointly warned about by Sam Altman, Elon Musk, and Dario Amodei is the extreme form of this dilemma: when AI begins to participate in iterating the next generation of AI, the old model's safety constraints are lost in the iteration.

## Our Solution: MIRROR Protocol Suite

MIRROR is an AI Safety and Agent Alignment Protocol Suite that moves safety constraints from inside the model to the protocol layer. Safety is the kernel, agents are the carrier, and the protocol layer is the unified infrastructure that is verifiable, inheritable, and auditable.

This is a paradigm shift: from "trusting the model" to "verifying behavior."

## Five-Layer Architecture

**Layer 1 — Computable Persona Baseline:** We encode a user's value structure, decision preferences, and behavioral boundaries into a verifiable reference framework (not invisible training traces inside the model). Every agent action's match against this baseline is verified through zero-knowledge proofs, with raw data stored locally and only hashes on-chain.

**Layer 2 — Baseline Inheritance & Dynamic Authorization:** Every generation of agent must inherit the previous generation's value baseline hash before activation, or it cannot start. Safety constraints are no longer "training traces" inside the model, but "inheritance conditions" at the protocol layer. What each generation inherits is not a set of static rules, but dynamic authorization logic based on the user's persona baseline.

**Layer 3 — Understanding Verification:** Before executing any instruction, the agent verifies whether its interpretation of the user's instruction matches the user's deep motivational structure. We build a motivation mapping algorithm that continuously infers the user's true needs from behavioral patterns, rather than fitting surface preferences.

**Layer 4 — Conflict Presentation Mechanism:** When misunderstanding, motivational conflict, or deviation from the user's healthy baseline is detected, the agent does not decide for the user — it acts as a mirror, presenting the conflict so the user can choose with awareness of their own true needs. This directly addresses the classic paperclip problem: constraints are no longer external goals, but continuous mapping of the user's intrinsic motivations.

**Layer 5 — Non-Repudiation & Real-Time Circuit Breaker:** All behavior logs are non-hideable and non-tamperable once on-chain, so an agent cannot "behave well during evaluation and breach during deployment." The dynamic authorization architecture triggers a circuit breaker or conflict presentation the moment an agent's behavior deviates from the baseline. This upgrades from "post-hoc auditing" to three-stage constraint: pre-verification + in-process presentation + post-attestation.

## Why Track 04

MIRROR combines exactly the three pillars of Track 04:
- **Cryptography**: ZK proofs for behavior verification, on-chain attestation
- **Protocol design**: Persona baseline protocol, inheritance mechanism, dynamic authorization architecture
- **Agent frameworks**: Agent identity registry, generation tracking, action verification pipeline

Our core contracts (PersonaBaseline, AgentRegistry, ActionAttestor) are deployed on Monad testnet, demonstrating how protocol-layer alignment works in practice.

## Tech Stack

- **Smart Contracts**: Solidity, deployed on Monad Testnet
- **Zero-Knowledge**: Circom circuits for action-baseline matching
- **Frontend**: Vanilla JS + Web3 integration
- **Agent Identity**: ERC-8004 direction with generation tracking

## Team

Building the protocol layer for AI safety.
```

---

### 🔗 链接信息

| 字段 | 内容 |
|------|------|
| **Demo Video / 演示视频** | 上传你的 `demo-video.mp4`，或者先填你上传到的视频链接 |
| **GitHub / 代码仓库** | `https://github.com/Alicechu1/mirror-protocol` |
| **Website / 网站**（如有） | 可以留空，或者填 GitHub 链接 |
| **Twitter / X**（如有） | 可以留空 |
| **Discord**（如有） | 可以留空 |

---

### 👥 团队信息

| 字段 | 内容 |
|------|------|
| **Team Name / 团队名** | `MIRROR Team` 或者你自己起的名字 |
| **Team Members / 成员** | 至少填你自己（Alicechu1），有队友也加上 |
| **Role / 角色** | Protocol Design / Full Stack / AI Research 等 |

---

### 🏷️ 标签 / Tags（选填，挑几个相关的）

```
AI Alignment
Agent Protocol
Zero Knowledge
On-Chain Attestation
Monad
Track04
Trust
Identity
```

---

## ✅ 第四步：提交前检查清单

- [ ] 项目名填了
- [ ] Tagline 填了
- [ ] Track 04 选了
- [ ] Description 粘贴好了
- [ ] Demo 视频上传了 / 链接填了
- [ ] GitHub 链接填了
- [ ] 团队信息填了
- [ ] **确认提交！**

---

## 📌 已部署合约地址（可以在描述里提一下）

```
PersonaBaseline:  0x6eFE4b72F01Fde571C4Ed4c05EDe910F2f9E1435
AgentRegistry:    0x4F464CD9Fa81ECC19366AA382266b10e2A2C1443
ActionAttestor:   0xbE8af04d2dae81eb4bd9Bc2aA64303520d324146
```

Network: Monad Testnet

---

## 💡 提交技巧

1. **先登录** — 用 GitHub 登录最快
2. **Description 用 Markdown 格式** — 大多数黑客松平台支持 Markdown，上面的内容直接复制就行
3. **视频一定要传** — 评委主要看 Demo
4. **GitHub 一定要有** — 证明你真的做了东西
5. **赛道一定要选对** — Track 04 是最匹配的
6. **提交了之后还能改** — 评审期 10/14-10/27 之间可以继续完善

---

## 🆘 遇到问题怎么办

如果平台上有特殊字段不知道填什么，截图发给我，我帮你写内容。
