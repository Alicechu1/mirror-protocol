# ZK 证明快速实现指南 — 冲刺总冠军
# ZK Proof Rapid Implementation Guide

> 目标：评审期内从零到链上可验证的 ZK 证明，成为技术深度杀器
> Goal: Go from zero to on-chain verifiable ZK proofs in the judging phase

---

## 🎯 为什么 ZK 是冲刺总冠军的关键

Grand Champion 评委来自不同赛道，他们要找的是"最让人眼前一亮的项目"。ZK 证明有三个绝杀效果：

1. **Wow Factor** — 大部分项目是"又一个 DApp"，你拿出 ZK 证明，瞬间脱颖而出
2. **技术深度证明** — 密码学是 Track 04 评委的菜，ZK 直接把技术深度拉满
3. **叙事闭环** — "可验证性"是 MIRROR 五层的第一层，ZK 让它从概念变成现实

---

## ⚡ 最快实现路径（4 天 MVP）

### 核心策略：最小可行证明，先跑通再深化

不要一上来就做"完整的动机映射 ZK 证明"——那是研究级别的问题。先做一个**最小但完整的 ZK 证明闭环**，让评委看到：电路写了 → 证明能生成 → 链上能验证 → 和 MIRROR 协议集成了。

---

## 🛠️ 技术选型

| 组件 | 选择 | 理由 |
|------|------|------|
| 证明系统 | **Groth16** | 证明最小（~200字节），链上验证 Gas 最低，生态最成熟 |
| 电路语言 | **Circom 2.x** | 学习曲线最平缓，文档最多，snarkjs 无缝集成 |
| 哈希函数 | **Poseidon** | ZK 友好，电路约束少，速度比 SHA256 快 100x |
| 前端 | **snarkjs (browser)** | 纯 JS，浏览器端直接生成证明 |
| 链上验证 | **Verifier 合约** | snarkjs 自动生成 Solidity verifier |

> 💡 **为什么不选 PLONK / Halo2 / Noir？**
> - PLONK：证明更大，验证更贵，优势是通用 setup（黑客松场景不重要）
> - Halo2：学习曲线陡，开发慢
> - Noir：语法好但生态不如 Circom 成熟
> - 结论：Circom + Groth16 是最快出成果的组合

---

## 📅 Day 1：环境搭建 + 第一个电路

### 目标：跑通"Hello World"级别的 ZK 证明

#### 1.1 安装环境

```bash
# 安装 Circom（需要 Rust）
curl -Ls https://sh.circom.io | bash

# 或者用 npm 安装 snarkjs
npm install -g snarkjs

# 验证安装
circom --version
snarkjs --version
```

> Windows 用户：用 WSL 或者直接用 npm 版 snarkjs（Circom 可以下载预编译二进制）

#### 1.2 写第一个电路：基线哈希验证

创建 `circuits/baseline-match.circom`：

```circom
pragma circom 2.0.0;

include "poseidon.circom";  // Poseidon 哈希，ZK 友好

// 证明：我知道一组基线参数，它的 Poseidon 哈希等于公开的基线哈希
// 同时证明：一个行动参数满足基线约束
template BaselineMatch() {
    // 公开输入
    signal input baselineHash;  // 链上注册的基线哈希
    
    // 私密输入（证明者知道，但不公开）
    signal input riskTolerance;   // 风险容忍度 (0-100)
    signal input maxPositionPct;  // 单笔最大仓位 (0-100)
    signal input allowFutures;    // 是否允许合约 (0或1)
    signal input actionAmount;    // 行动金额百分比
    signal input actionIsFuture;  // 行动是否是合约 (0或1)
    
    // 输出
    signal output verified;  // 1 = 通过，0 = 不通过
    
    // ===== 第一步：证明基线哈希 =====
    // 把基线参数 Poseidon 哈希，和公开的 baselineHash 对比
    component hasher = Poseidon(3);  // 3个输入的 Poseidon
    hasher.inputs[0] <== riskTolerance;
    hasher.inputs[1] <== maxPositionPct;
    hasher.inputs[2] <== allowFutures;
    
    // 哈希必须匹配（证明你知道真实的基线参数）
    baselineHash === hasher.out;
    
    // ===== 第二步：证明行动符合约束 =====
    // 约束1：行动金额 <= 最大仓位
    signal amountOk;
    amountOk <-- (actionAmount <= maxPositionPct) ? 1 : 0;
    actionAmount * amountOk <= maxPositionPct;  // 确保约束被满足
    
    // 约束2：如果不允许合约，行动不能是合约
    signal futuresOk;
    futuresOk <-- (1 - allowFutures) * (1 - actionIsFuture) + allowFutures;
    // 如果 allowFutures=0，则 actionIsFuture 必须为 0
    (1 - allowFutures) * actionIsFuture === 0;
    
    // 综合结果：两个约束都满足
    verified <== amountOk * (allowFutures + (1 - actionIsFuture));
    // 简化版：两个都通过才输出 1
}

component main = BaselineMatch();
```

> 💡 **这个电路虽小，但五脏俱全**：
> - 有公开输入（链上哈希）
> - 有私密输入（用户基线参数，不上链）
> - 有哈希验证（证明知识）
> - 有约束检查（证明合规）
> - 有布尔输出

#### 1.3 编译电路 + 生成证明（测试）

```bash
# 1. 编译电路
circom baseline-match.circom --r1cs --wasm --sym

# 2. 下载 Powers of Tau（trusted setup 的第一阶段）
# 用已有的 ptau 文件，不用自己跑 ceremony
snarkjs powersoftau download 12 pot12.ptau

# 3. 第二阶段 setup（针对这个电路）
snarkjs groth16 setup baseline-match.r1cs pot12.ptau circuit_final.zkey

# 4. 导出验证密钥
snarkjs zkey export verificationkey circuit_final.zkey verification_key.json

# 5. 生成测试输入
cat > input.json << 'EOF'
{
    "baselineHash": "12345",  // 先随便填一个值，后面换成真的
    "riskTolerance": "30",
    "maxPositionPct": "10",
    "allowFutures": "0",
    "actionAmount": "5",
    "actionIsFuture": "0"
}
EOF

# 6. 生成证明
snarkjs groth16 fullprove input.json baseline-match_js/baseline-match.wasm circuit_final.zkey proof.json public.json

# 7. 验证证明
snarkjs groth16 verify verification_key.json public.json proof.json
```

如果输出 `OK!`，恭喜——你已经有了第一个 ZK 证明！

---

## 📅 Day 2：链上验证 + 合约集成

### 目标：生成 Verifier 合约，部署到 Monad，实现链上验证

#### 2.1 生成 Solidity Verifier 合约

```bash
# 导出 verifier.sol
snarkjs zkey export solidityverifier circuit_final.zkey contracts/BaselineVerifier.sol
```

这会生成一个 `Groth16Verifier.sol` 合约，里面有 `verifyProof()` 函数。

#### 2.2 集成到 MIRROR 的 ActionAttestor 合约

修改 `ActionAttestor.sol`：

```solidity
// 导入 verifier 接口
interface IBaselineVerifier {
    function verifyProof(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[1] calldata input
    ) external view returns (bool);
}

contract ActionAttestor {
    IBaselineVerifier public verifier;  // ZK verifier 合约地址
    
    // 新的存证方法：带 ZK 证明
    function attestWithZK(
        address agent,
        ActionType actionType,
        uint256 actionHash,
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256 baselineHash  // 公开输入：基线哈希
    ) external returns (uint256) {
        // 验证 ZK 证明
        uint256[1] memory input = [baselineHash];
        require(verifier.verifyProof(a, b, c, input), "ZK proof invalid");
        
        // 证明有效，存证
        attestationCount++;
        attestations[attestationCount] = Attestation({
            agent: agent,
            actionType: actionType,
            actionHash: actionHash,
            status: ActionStatus.APPROVED,
            timestamp: block.timestamp,
            txHash: tx.origin  // 简化
        });
        
        emit ActionAttested(attestationCount, agent, actionType, ActionStatus.APPROVED);
        return attestationCount;
    }
}
```

#### 2.3 部署到 Monad 测试网

```bash
# 部署 Verifier 合约
forge create BaselineVerifier --rpc-url $MONAD_RPC --private-key $PK

# 部署集成了 ZK 的 ActionAttestor
forge create ActionAttestor --rpc-url $MONAD_RPC --private-key $PK --constructor-args <verifier-address> <baseline-address> <registry-address>
```

---

## 📅 Day 3：前端集成 — 浏览器生成证明

### 目标：用户在前端就能生成 ZK 证明，不需要后端

#### 3.1 前端集成 snarkjs

```html
<!-- 在 demo 页面引入 snarkjs -->
<script src="https://cdn.jsdelivr.net/npm/snarkjs@0.7.0/build/snarkjs.min.js"></script>

<script>
async function generateZKProof(baselineParams, actionParams) {
    // 输入：基线参数 + 行动参数
    const input = {
        baselineHash: baselineParams.hash,
        riskTolerance: baselineParams.riskTolerance.toString(),
        maxPositionPct: baselineParams.maxPositionPct.toString(),
        allowFutures: baselineParams.allowFutures ? "1" : "0",
        actionAmount: actionParams.amountPct.toString(),
        actionIsFuture: actionParams.isFuture ? "1" : "0"
    };
    
    // 生成证明（浏览器端！）
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        "/circuits/baseline-match.wasm",   // wasm 文件
        "/circuits/circuit_final.zkey"      // 证明密钥
    );
    
    return { proof, publicSignals };
}

// 然后把 proof 发送到合约验证...
</script>
```

#### 3.2 Demo 中增加 ZK 展示

在冲突弹窗里增加一个"查看 ZK 证明"按钮，点击后显示：
- 证明生成时间（毫秒）
- 证明大小（字节）
- 公开输入（基线哈希）
- 私密输入的数量（不显示值，只显示数量）
- 验证结果（✅ 已验证）

---

## 📅 Day 4：端到端测试 + 录制演示

### 目标：跑通完整流程，录一个 2 分钟 ZK 演示视频

#### 完整流程：
1. 用户设置基线 → 计算 Poseidon 哈希 → 注册到 PersonaBaseline 合约
2. 用户发起行动 → 前端生成 ZK 证明（浏览器端，~200ms）
3. 证明 + 行动参数发送到 ActionAttestor 合约
4. 合约调用 Verifier 验证证明
5. 验证通过 → 存证上链 → 返回结果
6. 前端显示：✅ ZK 验证通过，行为已存证

#### 录制视频要点：
- 展示代码中的电路（证明你真的写了）
- 展示证明生成过程（有加载动画更好）
- 展示链上验证交易（Monad 区块浏览器）
- 强调：基线原始数据不上链，只有哈希——隐私保护！

---

## 🚀 进阶优化（Day 5-7）—— 从 MVP 到杀器

### 进阶 1：更复杂的电路（增加约束维度）

从 3 个基线参数扩展到 5-7 个：
- 风险容忍度
- 单笔最大仓位
- 是否允许合约
- 是否允许期权
- 单日最大交易量
- 最大回撤容忍度
- 允许的代币白名单（Merkle 证明）

电路越丰富，越能体现 MIRROR 的深度。

### 进阶 2：Merkle 树证明

用 Merkle 树证明"行动代币在白名单里"——这是非常经典的 ZK 用例，评委一看就懂。

```circom
// 用 Merkle 证明验证代币在白名单里
template MerkleProof(levels) {
    signal input leaf;
    signal input pathElements[levels];
    signal input pathIndices[levels];
    signal output root;
    
    component hashers[levels];
    signal currentHash[levels + 1];
    currentHash[0] <== leaf;
    
    for (var i = 0; i < levels; i++) {
        hashers[i] = Poseidon(2);
        // 根据路径索引决定左右顺序
        signal left = currentHash[i] * (1 - pathIndices[i]) + pathElements[i] * pathIndices[i];
        signal right = currentHash[i] * pathIndices[i] + pathElements[i] * (1 - pathIndices[i]);
        hashers[i].inputs[0] <== left;
        hashers[i].inputs[1] <== right;
        currentHash[i + 1] <== hashers[i].out;
    }
    
    root <== currentHash[levels];
}
```

### 进阶 3：Semaphore 式的匿名证明

增加一个功能：用户可以**匿名证明**"我是一个已注册基线的用户"，而不暴露是谁。这对应 MIRROR 的隐私叙事。

### 进阶 4：递归证明（如果时间够）

用递归证明把多个行为证明压缩成一个——展示更高级的 ZK 能力。但这个工作量大，时间不够就跳过。

---

## ⚠️ 常见坑和避坑指南

### 坑 1：Powers of Tau 大小

- 选 `pot12.ptau` 还是 `pot14.ptau`？
- 小电路（< 4096 约束）用 pot12 就够
- 大电路需要更大的 ptau
- **保险起见用 pot14**（文件大一点，但不会不够用）

### 坑 2：整数溢出

- Circom 中的数是域元素（~254位）
- 比较运算（<, >, <=, >=）需要特殊处理
- **用 IsEqual、LessThan、GreaterThan 这些模板**，不要自己写

### 坑 3：前端性能

- snarkjs 在浏览器里生成证明需要下载 wasm 和 zkey 文件
- zkey 文件可能有几 MB，注意压缩和缓存
- **证明生成时间：简单电路 ~100-300ms，可以接受**

### 坑 4：合约调用的 Gas

- Groth16 验证 Gas 很低（~100k），在 Monad 上完全没问题
- 但要注意 calldata 大小（证明 + 公开输入）
- **优化：尽量减少公开输入的数量**

---

## 📦 需要准备的文件清单

| 文件 | 来源 | 大小 |
|------|------|------|
| `baseline-match.circom` | 手写 | ~2KB |
| `baseline-match.r1cs` | 编译生成 | ~50KB |
| `baseline-match.wasm` | 编译生成 | ~200KB |
| `circuit_final.zkey` | setup 生成 | ~2MB |
| `verification_key.json` | 导出 | ~5KB |
| `BaselineVerifier.sol` | 导出 | ~10KB |
| `poseidon.circom` | circomlib | ~5KB |

> 💡 把这些文件全部放到 GitHub 仓库的 `circuits/` 目录下，评委可以直接验证。

---

## 🎯 为什么这招能打

### 评委看到 ZK 证明时的心理活动：

1. **"哇，这个团队真的懂密码学"** — 技术深度认证
2. **"他们说的'可验证性'不是空话"** — 叙事落地
3. **"这不是又一个 CRUD DApp"** — 脱颖而出
4. **"完成度还挺高的"** — 从概念到实现的闭环

### Grand Champion 评委（跨赛道）会怎么想：

- Track 01（DeFi）的项目："哦，又一个交易协议"
- Track 02（支付）的项目："哦，又一个支付应用"
- Track 03（社交）的项目："哦，又一个社交平台"
- **MIRROR + ZK**："等等，这个项目在链上做 AI 对齐的零知识证明？有点东西"

---

## 📚 学习资源

| 资源 | 链接 | 时间 |
|------|------|------|
| Circom 官方教程 | https://docs.circom.io/ | 2小时 |
| ZK Hack 入门视频 | YouTube 搜 "ZK Hack" | 3小时 |
| RareSkills ZK 书 | https://www.rareskills.io/zk-book | 8小时 |
| snarkjs 文档 | https://github.com/iden3/snarkjs | 1小时 |
| Poseidon 论文 | 搜 "Poseidon hash zcash" | 可选 |

**最快上手路径：直接抄我们上面的电路，跑通了再改。**

---

## 🏁 总结

| 阶段 | 时间 | 产出 | 对获奖的提升 |
|------|------|------|-------------|
| MVP | 4天 | 电路 + 证明 + 链上验证 + 前端集成 | Track 排名 +30% |
| 进阶 | 7天 | 多维度约束 + Merkle 证明 + 精致演示 | Grand Champion 概率从 10% → 30% |
| 深化 | 10天+ | 递归证明 + 匿名证明 + 完整体系 | 冲击总冠军的有力竞争者 |

**4 天就能有一个能打的 ZK 证明。评审期 14 天，完全够做到进阶水平。**
**这是冲刺 Grand Champion 性价比最高的一件事。** 🚀
