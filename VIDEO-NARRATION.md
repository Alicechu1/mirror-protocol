# 🎬 MIRROR Demo Video — 逐字旁白稿

> **使用方法**：打开 `demo/demo-auto.html`，它会3秒后自动播放。你照着下面的稿子念就行。
> 顶部状态栏会提示当前在哪个场景，和稿子的时间点对应。
> 总时长约 2分30秒（可以适当放慢语速讲到3分钟）

---

## 时间轴

### 0:00 - 0:05 【开场】
**画面**：Demo 首页，标题 "MIRROR Protocol Suite"

**旁白**：
> "AI alignment today has a fundamental problem. All safety constraints are trapped inside model weights — a black box. Not verifiable. Not inheritable. Not auditable."

---

### 0:05 - 0:12 【Step 1：连接钱包】
**画面**：点击 "Simulate Demo"，钱包连接成功

**旁白**：
> "MIRROR moves alignment from inside the model to the protocol layer. Safety becomes a protocol property, not a training property."

---

### 0:12 - 0:30 【Step 2：设置人格基线】
**画面**：拖动滑块（风险偏好、亏损上限、持仓集中度），拨动开关

**旁白**：
> "Layer One: the Computable Persona Baseline. Users encode their value structure, decision preferences, and behavioral boundaries into a verifiable reference framework.
>
> Raw data stays on your device. Only the commitment hash goes on-chain."

---

### 0:30 - 0:45 【Step 3：注册 Agent】
**画面**：输入 Agent 名称，注册成功，显示 "Generation 1"

**旁白**：
> "Layer Two: Baseline Inheritance. Every agent must inherit the user's baseline hash before it can activate.
>
> No baseline inheritance = no activation. This is how we solve the core risk of recursive self-improvement — safety constraints are passed from generation to generation at the protocol layer."

---

### 0:45 - 1:05 【Step 4：第一笔交易 — 通过】
**画面**：选 Buy ETH (Spot)，调整金额，验证通过 ✅

**旁白**：
> "Now watch what happens when the agent proposes an action.
>
> A spot ETH purchase — within the baseline parameters. The verification passes, the action is authorized, and it's attested on-chain."

---

### 1:05 - 1:35 【Step 4：第二笔交易 — 冲突】
**画面**：选 10x Futures，弹出冲突弹窗（黄色警告）

**旁白**：
> "But what if the agent proposes something outside your baseline?
>
> A 10x leveraged futures position — this conflicts with the user's risk profile.
>
> MIRROR doesn't silently block it. And it doesn't override the user. It presents the conflict — like a mirror.
>
> What's the instruction? What's the conflict? What might be the real motivation? The user decides."

---

### 1:35 - 1:55 【Step 5：链上活动日志】
**画面**：Activity Log 页面，显示已授权和冲突的记录

**旁白**：
> "Layer Five: On-chain Attestation. Every action — authorized, conflicted, or blocked — is attested on-chain.
>
> Non-tamperable. Non-hideable. Auditable.
>
> This is three-stage constraint: pre-verification, in-process presentation, and post-attestation."

---

### 1:55 - 2:15 【回到 Step 1，展示合约地址】
**画面**：Step 1 页面，滚动到 "Deployed Contracts" 部分

**旁白**：
> "All three core contracts are deployed on the Monad testnet today.
>
> MIRROR is built for Track 04 — Trust, Identity & AI Infrastructure. We combine cryptography, protocol design, and agent frameworks to solve the fundamental alignment problem at the architecture level.
>
> From trusting the model — to verifying behavior. This is MIRROR."

---

### 2:15 - 结束 【收尾】
**画面**：停在合约地址页面，状态栏显示 "✅ Demo complete!"

**旁白**（可选，如果想加结尾）：
> "MIRROR Protocol Suite. Moving AI alignment to the protocol layer."

---

## 📝 录制技巧

1. **录之前先看一遍**：打开 demo-auto.html，让它自动播一遍，熟悉节奏
2. **3秒倒计时**：打开后它会等3秒再开始，足够你按下录屏键
3. **语速**：上面的稿子按正常语速大约 2分15秒，刚好配得上画面
4. **可以重来**：顶部有 "↻ Restart" 按钮，录砸了直接重开
5. **不用说话也可以**：如果不想出镜/出声，直接录画面+加背景音乐也行，评委主要看功能

---

## 🎯 一句话电梯演讲（放在视频开头/结尾）

> **"MIRROR moves AI alignment from inside model weights to the protocol layer — making every agent action verifiable, inheritable, and auditable."**

---

## 📌 提交信息速查

| 项目 | 内容 |
|------|------|
| **GitHub** | https://github.com/Alicechu1/mirror-protocol |
| **PersonaBaseline** | `0x6eFE4b72F01Fde571C4Ed4c05EDe910F2f9E1435` |
| **AgentRegistry** | `0x4F464CD9Fa81ECC19366AA382266b10e2A2C1443` |
| **ActionAttestor** | `0xbE8af04d2dae81eb4bd9Bc2aA64303520d324146` |
| **Track** | 04 — Trust, Identity & AI Infrastructure |
