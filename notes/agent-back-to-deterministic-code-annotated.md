# Agent学习——回到确定性的代码世界中来（术语注释版）

> 原文：https://zhuanlan.zhihu.com/p/2078832267804387046
> 说明：在英文术语**首次出现**处用括号加注中文翻译，后文不再重复标注。

# 回头看 Agent（智能体）：软的正在被模型吸收，硬的正在回到软件系统

这段时间一直在做一些很小的 Agent 实验。

一开始并没有想总结什么"Agent 理论"。只是不断遇到一些很具体的问题：为什么要写这么长的 Prompt（提示词），为什么需要 Skill（技能），为什么要给 Agent 做 Memory（记忆），为什么一个简单的工具调用还需要很多 Hook（钩子），为什么一个已经确定的状态还要让 Model（模型）再想一轮。

做到后来，我越来越觉得，也许应该反过来看这几年的 Agent 发展。

一个可能的解释是：

> Agent 的演进，本质上正在发生两次方向相反的"吸收"。
> 一边，过去需要靠 Prompt、Skill、规则和上下文工程显式告诉 Model 的东西，正在被越来越强的模型本身吸收。
> 另一边，过去被交给 Model 处理的一些确定性问题，又正在重新被 Tool（工具）、Runtime（运行时）、Event（事件）、Permission（权限）、Schema（结构模式/数据约束）等软件系统吸收。

这不是说所有东西都已经完成了迁移，也不是说 Harness（智能体运行框架/外壳）会消失。

只是如果把这条历史线重新看一遍，会发现很多过去看起来分散的技术，可能都在围绕同一个边界重新组织。

---

## 最开始，我们在教 Model 怎么做

早期的 LLM（大语言模型）应用很大程度上依赖 Prompt Engineering（提示词工程）。

我们告诉模型：

```
你是谁
你要做什么
请分几步思考
请遵循这些规则
请按照这个格式输出
不要忘记做 X
```

然后不断加：

- few-shot（少样本示例）
- Chain-of-Thought（思维链）
- system prompt（系统提示词）
- examples（示例）
- instructions（指令）
- checklists（检查清单）

那时一个很自然的假设是：

> 模型不会，所以我们告诉它。

Prompt 在某种意义上承担了"临时程序"的作用。

---

## 然后 Model 变强了，很多东西开始不值得再写进 Prompt

随着模型能力提升，一些过去必须显式写出来的行为开始变得稳定。

这并不意味着 Prompt 没用了。

而是它的角色开始发生变化。

Anthropic 在 2025 年已经明确把这种变化描述为从 Prompt Engineering 向 Context Engineering（上下文工程）的转移：问题不再只是"怎么写 instruction"，而是"这一轮 inference（模型推理/生成）到底应该给 Model 哪些信息"。他们同时指出，更强的模型需要更少的 prescriptive engineering（事无巨细的规定式工程）。

于是我们开始从：

```
"告诉 Model 应该怎么做"
```

变成：

```
"把 Model 当前真正需要的信息给它"
```

这就是 Context Engineering。

---

## Skill 和 Memory 也开始从"教模型"变成"按需提供条件"

再往后，Skill、Memory、RAG（检索增强生成）、Context Retrieval（上下文检索）逐渐成熟。

这里发生了一个很有意思的变化。

以前容易想：

> "把知识写下来，让 Model 永远记住。"

后来越来越多系统开始倾向：

```
索引
↓
需要时检索
↓
只给当前任务相关内容
```

Anthropic 对这一方向的描述尤其直接：随着 Agent 进入更长的多轮循环，真正困难的是管理完整的 context state（上下文状态），并且应该寻找高信号、低冗余的信息，而不是无限增加 instructions。

甚至 Skill 本身也开始表现得越来越像：

```
地图
而不是
说明书
```

这不是 Skill 没用了。

而是：

> 模型已经越来越不需要你把"怎么思考"逐字写出来；更重要的是让它在正确的时候拿到正确的信息。

---

# 然后出现了 Tool：这是另一条线的起点

与此同时，Agent 开始真正进入计算机世界。

Model 不可能靠语言直接：

- 改文件
- 查数据库
- 发邮件
- 操作浏览器
- 调 API（应用程序接口）
- 修改 Git
- 执行代码

所以我们做了 Tool。

```
Model
↓
Tool
↓
计算机系统
↓
真实世界
```

这一层非常重要。

因为它第一次明确把：

> "我要做什么"

和：

> "事情到底怎么发生"

拆开了。

Tool 并不是一个"让 Model 变得更聪明"的模块。

它更像是：

> 把计算机世界中已经存在的确定性能力，变成 Model 可以调用的接口。

MCP（模型上下文协议，Model Context Protocol）又把这种能力接口进一步标准化。

所以从这个角度看，Tool / MCP 并不是 Agent 对传统软件工程的替代。

恰恰相反：

> 它们是 Agent 第一次大规模承认自己必须生活在传统软件系统里的标志。

---

# 但 Tool 之后，我们又犯了一个很自然的错误

我们发现：

> Model 虽然有 Tool，还是可能乱用 Tool。

于是又开始增加：

```
Hook
Guard（护栏）
Retry（重试）
Reflection（反思）
Checklist（检查清单）
Policy（策略）
Validation（校验）
```

结构逐渐变成：

```
Model
↓
Hook
↓
Tool
↓
Hook
↓
World（真实世界）
```

这些东西当然有价值。

问题在于它们很容易被不断叠加。

一个问题一个 Hook。

一个历史事故一个 Rule（规则）。

一个模型坏习惯一个 Prompt。

最后可能变成几十个甚至更多干预点。

这时候一个很值得问的问题出现了：

> 我们是在构建一个更好的软件系统，还是在不断围着 Model 打补丁？

Hook 并没有错。

但它非常容易被用成：

> "程序强制 Model 这么做。"

---

# Harness 出现：开始系统性地管理 Model 周围的世界

这也是为什么 Harness 会成为一个越来越明确的概念。

今天已经有研究直接把 Agent 描述成：

> Model + Harness

Harness 负责：

- loop（循环）
- tools（工具）
- context（上下文）
- safety（安全）
- orchestration（编排）
- verification（验证）
- extensions（扩展）

2026 年的生产型 Harness 研究甚至已经开始系统梳理 Claude Code、Codex CLI、Gemini CLI、OpenHands、Aider 等系统的共同结构，并指出这个领域正在从简单工具层逐渐变成完整平台。

这一步是很大的进步。

因为人类开始承认：

> Agent 并不只是一个 Model API（模型接口）。

它是：

```
Model
+
Runtime
+
Tools
+
Context
+
World
```

---

# 但接下来又遇到了另一个问题：Harness 到底应该承担多少东西？

这也是最近几年越来越明显的讨论。

一个方向是：

> 从 trajectory（执行轨迹）里找 recurring failures（反复出现的失败），然后把它们转化成 Harness intervention（干预）。

另一个方向则越来越明确地走向：

> deterministic execution（确定性执行）。

最近已经有研究直接把 Agent Harness 描述成一个 deterministic execution layer（确定性执行层）：已经理解的部分走 validated deterministic workflows（经过验证的确定性工作流），只有 unresolved uncertainty（未解决的不确定性）才交给 Model。

这非常接近我现在感兴趣的问题。

但我觉得这里还应该继续追问一步。

---

# "确定性"到底应该由谁来承担？

这是我最近越来越在意的问题。

一个很容易出现的路径是：

```
发现 Model 经常做错
↓
加 Harness
↓
Benchmark（基准测试）上升
↓
证明 Harness 有效
```

这个过程当然可以成立。

但它没有回答：

> 为什么这个 Harness 有效？

可能是：

```
Model 真不会
```

也可能是：

```
Context 不够
```

也可能是：

```
Tool 本身不可靠
```

也可能是：

```
环境有确定性规则，但原来交给了 Model
```

还可能是：

```
Model 已经选定了一条路径，
只是 ReAct（推理-行动循环，Reasoning + Acting）loop 多走了一轮
```

这些情况下，最后都可能得到：

```
Benchmark ↑
```

但系统结构完全不同。

所以我现在更愿意先问：

> 这件事情本身，到底是确定的还是不确定的？

---

# 如果已经确定，就不一定需要"更聪明的 Harness"

这里是最近一个很小的 Runtime 实验给我的启发。

假设：

```
Tool A
↓
Event
```

已经明确告诉系统：

```
当前状态 = X
下一 transition（状态转移）= B
```

那么传统 ReAct 往往是：

```
Tool A
↓
Model
↓
"接下来我要调用 Tool B"
↓
Tool B
```

但也可以是：

```
Tool A
↓
Event
↓
Runtime
↓
Tool B
```

这里不是：

> Runtime 替 Model 做规划。

也不是：

> Model 已经不需要判断。

更准确地说：

> Model 已经选择了这条路径，而当前 Event 已经证明沿着这条路径的下一 transition 不再有新的 decision freedom（决策自由度）。

所以消掉的不是 Model 的自由。

消掉的是：

> Tool 与 Tool 之间一次没有新增决策价值的 Model 往返。

这更像一种 ReAct loop compression（ReAct 循环压缩）。

---

# 重新理解"硬的一侧"

如果沿着这个方向继续看，很多传统软件工程里的东西都会重新出现：

```
状态机
幂等
CAS（比较并交换，Compare-And-Swap）
事务
Precondition（前置条件）
Postcondition（后置条件）
Permission
Schema
Retry policy（重试策略）
Circuit breaker（熔断器）
Event log（事件日志）
Tracing（链路追踪）
```

这些系统的共同点是：

> 如果一件事已经确定，就不要求执行者再"想一遍"。

比如传统系统不会通过 Prompt 告诉：

> "请不要重复扣款。"

而是通过：

```
idempotency key（幂等键）
↓
already processed?（是否已处理？）
→ return（直接返回）
```

也不会告诉程序：

> "请记得检查版本有没有变化。"

而是：

```
CAS(version)（比较并交换版本号）
↓
mismatch（不匹配）
→ reject（拒绝执行）
```

也不会依赖程序自己宣布：

> "我应该已经完成了。"

而是通过 postcondition / commit / state（后置条件 / 提交 / 状态）来确定。

所以有些 Agent 问题可能并不是"需要更强 Harness"。

而是：

> 传统软件工程已经有确定性答案了，只是 Agent 时代我们又把它重新交给了概率系统。

---

# 这时候再回头看 Prompt，就会发现另一边也在发生相反的事情

于是两条线开始汇合。

软的一侧：

```
Prompt
↓
Skill
↓
Memory
↓
Context Engineering
↓
Just-in-time Context（即时上下文）
↓
更强 Model
```

越来越多过去需要人工写出来的行为，被模型本身吸收。

硬的一侧：

```
Tool
↓
MCP
↓
Validation
↓
Guard
↓
Harness
↓
Runtime / Event / deterministic execution
```

越来越多原来模糊地交给 Model 的确定性问题，被系统重新吸收。

于是整个系统正在发生一种"双向收缩"：

```
Agent
                    │
        ┌───────────┴───────────┐
        │                       │
     Model side              System side
     （模型侧）               （系统侧）
        ↑                       ↑
   吸收过去的软逻辑          吸收过去的确定性
   Prompt / Skill             Tool / Runtime
   Context heuristics         State / Event
   （上下文启发式规则）
        │                       │
        └───────────┬───────────┘
                    ↓
             更清晰的边界
```

---

# 所以我现在不太喜欢一句常见的表达

> Agent = Model + Harness

它当然没有错。

但它很容易让人继续把世界理解成：

```
Model 负责一部分
Harness 负责另一部分
```

我现在更倾向于另一个视角：

> Agent 面对的是一个同时包含确定性和不确定性的世界。

```
确定性
→ 让软件系统承担

不确定性
→ 让 Model 参与
```

而 Harness / Runtime 真正重要的问题，是：

> 这条边界现在应该在哪里？

---

# 这样再看"模型能力增强以后 Harness 会不会被吸收"，问题也变了

以前可能会问：

> 这个 Harness component（组件）还有没有收益？

现在要想想：

> 它承担的到底是什么性质的职责？

如果它承担的是：

```
参数格式
权限
状态一致性
重复执行
确定性 transition
```

那模型变强并不一定会让它消失。

因为这些不是 Model 的能力问题。

它们本来就是系统问题。

但如果它承担的是：

```
某类任务应该怎么规划
某类问题通常先做什么
某个步骤要不要继续
某种常见行为应该如何选择
```

那它就更可能随着模型能力变化而发生迁移：

```
Harness
→ Prompt
→ Model
```

或者反过来，在模型无法可靠保证的时候：

```
Model
→ Runtime / Software system（软件系统）
```

---

# 这可能也是为什么最近很多系统开始"做减法"

Anthropic 已经明确提到：更强模型需要更少的 prescriptive engineering，因此重点逐渐转向 context curation（上下文策展/精选）。

OpenAI 对 Codex Harness 的实践也出现了一个非常有意思的方向：不是继续堆一份巨大的 agent instruction（智能体指令），而是强调 repository（代码仓库）的结构、工具、验证、反馈环和可读性；他们甚至发现长amd会变成反效果【译注：原文如此，疑为"长 AGENTS.md 文件"之误】，需要给 Agent 一张地图，而不是一本说明书。

这其实和我们最近看到的变化是一致的：

> 软层正在从"规定行为"变成"提供必要条件"。

而硬层正在从"围着 Model 打补丁"变成：

> 直接承载真实世界的确定性。

---

# 所以回头看，可以Agent 的演进理解成这样

```
让 Model 做
↓
教 Model 怎么做
↓
给 Model Tool
↓
告诉 Model 怎么使用 Tool
↓
用 Hook / Guard 纠正 Model
↓
系统性设计 Harness
↓
从 trajectory 中寻找可复用 intervention
↓
开始区分 deterministic / uncertain（确定性 / 不确定性）
↓
把确定性重新交给软件系统
↓
把真正的不确定性留给 Model
```

这条线最后可能并不是：

> Harness 越来越复杂。

也不一定是：

> Model 越来越强，所以一切都消失。

更可能是：

> 两边都在变强，于是中间层反而越来越薄。

Model 吸收过去需要 Prompt、Skill、Procedure（规程/流程）才能完成的一部分工作。

Software system 吸收过去需要 Model 自己记忆、判断和遵守的一部分确定性。

中间剩下的，才越来越接近真正的"Agent"。

---

## 这也可能是一个值得继续验证的问题

把它当成一个开放问题：

> 过去几年我们构建 Agent 时，有多少工作是在增强 Model，有多少工作是在补软件系统的确定性？又有多少中间层，只是因为当时两边都还不够强才存在？

这可能也是为什么我现在越来越喜欢从真实运行中的 Event、Tool、World State（世界状态）和 trajectory 去看 Agent，而不是先决定应该增加一个什么 Skill、Prompt 或 Harness component。

因为最后还是那个最朴素的问题：

> 确定的事情，为什么还要让概率系统决定？
> 不确定的事情，又为什么要假装可以被规则解决？

这两句话也许比"Model + Harness"更接近下一阶段 Agent 系统真正应该解决的问题。
