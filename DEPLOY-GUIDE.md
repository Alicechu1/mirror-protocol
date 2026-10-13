# 🚀 MIRROR — 今日提交快速部署指南

> ⏰ 今天是截止日！按这个顺序来，最快速度搞定。

---

## ⚡ 30秒概览

你需要产出 4 样东西：
1. **合约部署到 Monad 测试网**（拿 3 个合约地址）
2. **Demo 能跑**（纯 HTML，直接打开就能演示）
3. **GitHub 仓库**（代码 + README）
4. **Demo 视频**（录屏 + 讲解）

---

## 📁 项目结构

```
mirror-protocol/
├── README.md                          ← 项目说明（已写好，填合约地址即可）
├── foundry.toml                       ← Foundry 配置
│
├── contracts/                         ← 智能合约（核心代码）
│   ├── interfaces/                    ← 接口定义
│   │   ├── IPersonaBaseline.sol
│   │   ├── IAgentRegistry.sol
│   │   └── IActionAttestor.sol
│   ├── PersonaBaseline.sol            ← 第一层：人格基线
│   ├── AgentRegistry.sol              ← 第二层：Agent身份注册（ERC-8004方向）
│   └── ActionAttestor.sol             ← 第五层：行为存证 + 断路器
│
├── test/
│   └── MIRROR.t.sol                   ← 完整集成测试
│
├── script/
│   └── DeployMIRROR.s.sol             ← 一键部署脚本
│
├── demo/
│   └── index.html                     ← 前端Demo（纯HTML，直接打开能用）
│
├── circuits/
│   └── ActionBaselineMatch.circom     ← ZK电路（评审期完善）
│
├── project-description.md             ← 项目介绍（英文，提交用）
├── demo-video-script.md               ← Demo视频脚本
└── DEPLOY-GUIDE.md                    ← 本文件
```

---

## 🛠️ 第一步：安装 Foundry（5分钟）

如果还没装 Foundry：

```powershell
# Windows 下安装 Foundry
# 方法1：用官方安装脚本（需要WSL或Git Bash）
# 方法2：下载预编译二进制

# 推荐：先检查是否已安装
forge --version
```

如果没有，去 https://book.getfoundry.sh/getting-started/installation 下载 Windows 版本。

---

## 📝 第二步：初始化项目并测试（10分钟）

```powershell
# 进入项目目录
cd mirror-protocol

# 安装依赖
forge install foundry-rs/forge-std --no-commit

# 编译合约
forge build

# 跑测试（确认代码没问题）
forge test -vv
```

✅ 如果测试全绿，说明合约代码没问题，可以部署了。

---

## 🔗 第三步：获取 Monad 测试网 ETH（5分钟）

1. 去 https://faucet.monad.xyz/ 领测试币
2. 或者在 Monad Discord #faucet 频道领取
3. 准备好你的钱包私钥（测试网用的，别用主网的！）

---

## 🚀 第四步：部署合约（5分钟）

```powershell
# 设置环境变量
$env:PRIVATE_KEY = "你的测试网私钥"
$env:MONAD_TESTNET_RPC = "https://testnet-rpc.monad.xyz"

# 一键部署三个合约
forge script script/DeployMIRROR.s.sol:DeployMIRROR `
  --rpc-url $env:MONAD_TESTNET_RPC `
  --private-key $env:PRIVATE_KEY `
  --broadcast
```

部署成功后，你会看到三个合约地址。**把它们记下来！**

```
PersonaBaseline:  0x...
AgentRegistry:    0x...
ActionAttestor:   0x...
```

---

## 📋 第五步：填入 README 和 Demo（5分钟）

### 5.1 填 README

打开 `README.md`，找到 "Deployed Addresses" 部分，把三个地址填进去。

### 5.2 填 Demo

打开 `demo/index.html`，找到 `CONTRACT_ADDRESSES`（大约第600行左右），填入合约地址：

```javascript
const CONTRACT_ADDRESSES = {
  personaBaseline: '0x你的PersonaBaseline地址',
  agentRegistry: '0x你的AgentRegistry地址',
  actionAttestor: '0x你的ActionAttestor地址'
};
```

---

## 🎮 第六步：测试 Demo（5分钟）

```powershell
# 直接用浏览器打开
start demo\index.html
```

或者启动一个本地服务器：

```powershell
cd demo
python -m http.server 8080
# 然后浏览器打开 http://localhost:8080
```

测试完整流程：
1. 点 "Simulate Demo"（或者连 MetaMask）
2. 设置人格基线（拉几个滑块）
3. 注册 Baseline
4. 注册 Agent
5. 选不同的交易类型，看验证结果
6. 试试"开10倍合约多单"——应该会触发冲突弹窗
7. 查看 Activity Log

---

## 🎬 第七步：录 Demo 视频（30-60分钟）

参考 `demo-video-script.md` 的脚本。

**最快录制方案：**
1. 打开 OBS / Loom / 系统自带录屏
2. 按脚本过一遍流程，边录边讲
3. 用剪映 / CapCut 简单加个片头片尾
4. 上传到 YouTube / Vimeo / Loom

**3 分钟核心结构：**
- 0:00-0:30 问题引入（AI对齐的黑箱困境）
- 0:30-1:30 Demo 演示（注册→基线→Agent→交易验证→冲突→存证）
- 1:30-2:30 五层架构讲解
- 2:30-3:00 收尾 + 为什么适合 Track 04

---

## 📝 第八步：写项目介绍（30分钟）

用 `project-description.md` 作为基础，适配报名平台的字段。

**核心要包含：**
- Problem Statement — 问题是什么
- Solution — 我们怎么解决
- Technical Architecture — 五层架构
- Why Track 04 — 为什么适合这个赛道
- Demo / Code Links — 链接
- Team — 团队
- Roadmap — 路线图

---

## 📦 第九步：创建 GitHub 仓库（10分钟）

1. GitHub 上新建仓库 `mirror-protocol`
2. 把所有代码推上去
3. 确保 README 显示正常
4. 确认合约地址已经填好

```powershell
git init
git add .
git commit -m "Initial commit: MIRROR Protocol Suite for Monad Metropolis"
git branch -M main
git remote add origin https://github.com/你的用户名/mirror-protocol.git
git push -u origin main
```

---

## ✅ 第十步：平台提交（15分钟）

1. 登录 https://hackathon.monad.xyz/
2. 选 Track 04: Trust, Identity & AI Infrastructure
3. 填写项目信息
4. 上传/粘贴：
   - 项目名称：MIRROR Protocol Suite
   - 一句话介绍：Moving AI alignment from inside model weights to the protocol layer
   - 详细介绍（用 project-description.md）
   - Demo 视频链接
   - GitHub 链接
   - 合约地址（可以放在 description 里）
   - 团队成员
5. 提交！

---

## ⏱️ 时间预算

| 步骤 | 预估时间 | 状态 |
|------|---------|------|
| 安装 Foundry | 5 min | ☐ |
| 编译 + 跑测试 | 10 min | ☐ |
| 领测试网 ETH | 5 min | ☐ |
| 部署合约 | 5 min | ☐ |
| 填地址到 README + Demo | 5 min | ☐ |
| 测试 Demo | 5 min | ☐ |
| 录 Demo 视频 | 30-60 min | ☐ |
| 写项目介绍 | 30 min | ☐ |
| 建 GitHub 仓库 | 10 min | ☐ |
| 平台提交 | 15 min | ☐ |
| **合计** | **~2小时 + 录视频** | |

---

## 🔧 常见问题

### Q: Foundry 在 Windows 上装不上怎么办？
A: 可以用 Remix IDE 在线部署（remix.ethereum.org），连接 Monad 测试网，手动部署三个合约。

### Q: Monad 测试网 RPC 连不上？
A: 确认 RPC 是 https://testnet-rpc.monad.xyz，Chain ID 是 10143。也可以试试其他公共 RPC。

### Q: Demo 里连不上合约？
A: 先用 "Simulate Demo" 模式，不需要真实链上交互也能完整体验全流程。真实链上部署后再切 MetaMask 模式。

### Q: 时间不够了，什么可以砍？
A: 优先级：合约部署 > Demo 能跑 > 视频 > 介绍 > GitHub美化。
   - 视频可以先录个粗糙的，评审期再剪
   - UI 不用完美，核心流程跑通就行
   - ZK 电路今天不用真部署，概念上有就行

---

## 🎯 提交前 Checklist

- [ ] 三个合约都部署到 Monad 测试网了
- [ ] 合约地址填进了 README
- [ ] Demo 能完整走完 5 个步骤
- [ ] 冲突弹窗能正常触发（选 futures 交易试试）
- [ ] Activity Log 能显示记录
- [ ] Demo 视频录好了
- [ ] GitHub 仓库公开了
- [ ] 项目介绍写好了（英文）
- [ ] 团队成员信息填了
- [ ] 平台提交按钮点了 ✅

---

**祝好运！MIRROR 的叙事在 Track 04 非常强——把故事讲好，核心链路跑通，就已经超过 90% 的项目了。🚀**
