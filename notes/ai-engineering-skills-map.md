# 个人学习笔记：AI Engineering Skills Map（起始篇：构建与部署 AI 应用）

> **这份笔记是什么**：以吴恩达的一篇文章为骨架的个人学习笔记。第二部分忠实呈现原文骨架；第三部分把文中概念逐个展开成自学模块——从第一性原理讲"它为什么存在、是什么、怎么工作、和什么相连"，用于填补知识盲区。
> **约定**：不采用问答体；每个概念只在延展里讲透一次，其余地方只引用；标注（延展）的内容是我的补充，非原文。已于 2026-09-06 提炼发布为随笔第一篇（`posts/2026-09-06-ai-engineering-skills-map.html`），后续延展在本笔记继续生长。

---

## 一、原文信息（回溯入口）

| 项 | 内容 |
|---|---|
| 标题 | **AI Engineering Skills Map: Building and Deploying AI Applications** |
| 作者 | Andrew Ng（吴恩达）@AndrewYNg |
| 原文链接 | **https://x.com/AndrewYNg/status/2090840747738374568** |
| 发布时间 | 2026-08-21 |
| 原文配图 | https://pbs.twimg.com/media/HQQk9jqboAEpbvE.jpg（已存 `notes/assets/ng-skills-map.jpg`，1200x480） |

> ⚠️ 正式随笔成文时，**开头必须放原文链接**（方便回溯，已确认的要求）。

---

## 二、原文骨架（忠实摘要）

### 系列背景
技能地图系列把 AI 工程能力分为四大顶层技能：
1. **Building and deploying AI applications**（构建与部署 AI 应用）← 本文展开这一项
2. Software engineering fundamentals（软件工程基础）
3. Using coding agents（使用编码智能体）
4. Shaping the build（塑造构建方式）

文末预告：软件工程是 AI 工程的强互补技能，**下一篇写它**（栏目后续素材）。

### 总纲（全文的推理起点）
- 地图的依据：分析招聘岗位 + 结构化专家访谈 + 问卷调研。
- **根本论点**：AI 应用与非 AI 软件最大的差异是**输出更不可预测**（无法预知 LLM 会输出什么）→ 构建过程必然是迭代：反复"构建 → 检视 → 决定下一步"，每一步深受中间结果影响。
- 由此把这项顶层技能拆成六个子技能，**每个子技能都是在回答"如何驾驭这种不可预测性"的一个侧面**。

### 六个子技能

1. **LLM foundations（LLM 基础）**：理解 LLM 如何 tokenize 输入、如何生成输出 → 知道何时可依赖、何时会出错。包括：何时用多模态模型；context window 装什么的权衡；cache hits、knowledge cutoff、reasoning effort level、sampling parameters、tool calling 等机制的推理；何时需要 fine-tuning、self-hosting。
2. **Grounding models with data（用数据支撑模型）**：好输出依赖好输入上下文。RAG（向量检索）只是早期手段；现在要决策：什么进 prompt vs. 什么用工具按需检索；数据用什么表示——向量索引 / 知识图谱 / 结构化数据之上的语义层；把文档（文本、PDF、HTML、图像）转成 LLM-ready 输入，并让数据保持干净、新鲜。
3. **Building agentic systems（构建智能体系统）**：从"预定义 LLM 调用序列"到"agent harness 上 LLM 反复自主决策"的谱系；串行/并行、何时代码 vs 何时 LLM、设计 fallback；agent loop 中决定可用工具（MCP、CLI、沙箱）、记忆架构、长会话上下文管理、单/多智能体编排；把原型变成可靠安全的生产 agent：guardrails、对抗输入、防数据外泄、治理；前沿：voice agents、computer-use agents、generative UI。
4. **Evaluation-driven development（评测驱动开发）**：吴恩达认为区分高手的最大特质是**能否驱动有纪律的 evals/误差分析循环**。难点：正确做法随项目和阶段而变。做 evals 是深技术活：读 traces、探索性数据分析、结合产品与商业洞察决定测什么；手段菜单：确定性（代码）评测 / LLM-as-a-judge / human in the loop；还要评测你的评测。evals 反哺迭代 → 进步系统化而非随机。
5. **Operating in production（生产环境运营）**：AI 运维之难在于不可预测、成本、延迟。建 observability 理解真实表现；跟踪性能、检测 drift、快速响应模型故障与安全事件（对抗性提示注入）；回归测试与 CI/CD 需要统计性评测，测试力度按出错风险校准；用模型选择优化、蒸馏与微调、简化 agentic 工作流来优化成本与延迟。
6. **Machine learning foundations（机器学习基础）**：现代 LLM 由监督学习 + 强化学习构建；"我认识的每一个擅长用 LLM 做构建的工程师，都在一定深度上理解机器学习和深度学习"；很多应用仍需要会用 ML（他人预训练的模型或自训）；需要知道：流行 ML/DL 模型及其在 accuracy / training speed / inference speed 上的权衡；如何工程化训练与评估数据。三个核心心智框架：**bias/variance、error analysis、engineering your data**——驾驭输出不确定系统、在开发中做决策的关键。→ 详见延展 01。

### 关键金句
> "Being able to skillfully decide what to do next allows you to create reliable software systems based on unreliable AI components."
> （善于决定下一步做什么，才能基于不可靠的 AI 组件构建可靠的软件系统。）

> "In my experience, the most important trait that distinguishes someone great at building AI systems is whether you can drive a disciplined evals/error analysis loop to drive development."

> "Every engineer I know that's good at building with LLMs also understands machine learning and deep learning at some depth."

结尾：要学的很多，但学的每一点都会让你更擅长、做出更激动人心的应用。

---

## 三、知识延展（盲区自学模块）

> 每条按"**为什么需要 → 是什么 → 怎么工作 → 和什么相连**"展开。新问题进来时展开为新编号条目，已讲过的概念不再重复。

### 延展 01 · 机器学习基础：其余五个子技能共同的地基

**为什么需要（从全文第一性原理推出）**：全文的推理起点是"AI 应用输出不可预测"。驾驭不可预测性只有两条路：① 理解不确定性从哪来——即模型是怎么被造出来的；② 拥有定位错误、修复系统的方法论。机器学习基础同时供给这两条路，所以它不是六个并列技能之一那么简单，而是**其余五个子技能共同依赖的心智地基**：不懂 ML，evals 的指标设计（子技能 4）、生产环境里判断 drift（子技能 5）、grounding 时的数据决策（子技能 2）都知其然不知其所以然。

**第一层 · 模型的来路（理解工具的生成过程）**
- 是什么：现代 LLM 是**监督学习**和**强化学习**这两类 ML 技术的产物。
- 怎么工作（延展）：监督学习让模型从海量文本学会语言规律；强化学习（如 RLHF）在其上对齐行为偏好。理解这一点就理解了：为什么提示词能改变输出分布、为什么模型有时会"迎合"而失真、为什么幻觉是生成式机制的内生风险而非 bug。

**第二层 · 会"用"模型**
- 是什么：很多应用仍需用 ML——要么调用别人预训练的模型，要么自己训练/微调。
- 怎么工作：选模型 = 在几个轴上找当前应用的最优点，原文给出的轴是 **accuracy（准确率）、training speed（训练速度）、inference speed（推理速度）**（延展：实际还隐含成本与可控性两个轴）。

**第三层 · 数据是原料**
- 是什么：为训练和评估模型工程化所需的数据。
- 怎么工作：数据质量决定模型行为上限——通过改数据而非改代码来提升系统，这正是吴恩达 Data-centric AI 的一贯主张（延展标注）。

**第四层 · 三个心智框架（驾驭不确定性的操作系统）**
- **bias/variance（偏差/方差）**：回答"模型错在哪一类"——系统性偏差（欠拟合）还是对噪声敏感（过拟合）→ 直接决定下一步是加数据、换模型还是改特征。
- **error analysis（误差分析）**：回答"具体错在哪、为什么"——把错误分桶归类，让迭代方向有依据。它直接对接子技能 4"评测驱动开发"，是 evals 循环的分析内核。
- **engineering your data（数据工程）**：回答"改什么来修复"——定位问题后，通常最高杠杆的修复动作在数据侧。
- （延展）这三件套正是吴恩达机器学习课程与 MLOps 课程的经典方法论；LLM 时代它们没有过时，只是作用对象从"你训练的模型"扩展到"你调用的模型 + 你构建的 RAG/agent 系统"。

**逻辑闭环**：输出不可预测（起点）→ 理解来路（第一层）+ 会选会用（第二层）+ 掌控数据（第三层）+ 三框架定位与修复（第四层）→ 反哺"构建→检视→决定下一步"的迭代主循环（全文主旨）。

### 延展 02 · Benchmark：把"好不好"变成可追踪的数字

**为什么需要（从第一性原理）**：AI 输出不可预测 → 无法逐条人工审 → 需要一个可重复的**代理测量**：固定任务集 + 冻结评分协议，把质量变成数字。没有它，"构建 → 检视 → 决定下一步"的迭代主循环就没有方向盘——分数（及其分类目拆解）就是"检视"环节的仪表盘。

**是什么（一个 benchmark 的四个零件）**
1. **任务集**：题目来源三种——人工出题（考试题风格）、真实数据抽取（SWE-bench 抽自真实 GitHub issue/PR）、LLM 合成生成后再过滤。
2. **评分依据**（三选一或组合）：
   - 标准答案比对：exact match / 多选题（MMLU、GSM8K）
   - 测试用例：跑单测，通过才算对（HumanEval、SWE-bench）——对应原文的"确定性（基于代码的）评测"
   - 评审打分：LLM-as-a-judge，或人类盲测投票（Chatbot Arena）——对应原文另外两种手段
3. **冻结的评分协议**：指标（accuracy、pass@k、win rate、Elo）、prompt 模板、采样参数、运行次数、聚合方式全部定死——协议一变数字就不可比，这是"可重复"的前提。
4. **校准与验证**：对已知强弱的系统跑一遍，看排序是否符合人类判断；看区分度（人人都 95%+ 即饱和）；看分数与真实表现是否相关。

**怎么建立（流程）**：定义要测的能力 → 组题 + 造评分依据 → 冻结协议 → 校准 → 防污染（held-out 私有集、轮换题目、canary 字符串——公开的题迟早漏进训练数据）。
（延展）最深的一环是第 1 步的**构造效度**：benchmark 只测它包含的题，"分数 → 能力"的推断是脆弱一环——后面所有失效模式都从这里生长。

**怎么测评（运行与三种角色）**（延展归纳）
- **单次运行**：系统跑完任务集 → 逐条打分 → 聚合为总分 + 分类目拆解（拆解往往比总分更有诊断价值）。
- **排行榜用法**：公开 benchmark 横向比模型——参考价值最低，因为它测的不是你的用例。
- **回归测试用法**：自己的 eval 集当 CI 跑，每次改 prompt/换模型就重跑，防退化——原文"evals 反哺迭代开发"的具体形态。
- **诊断用法**：错误分桶 + error analysis（延展 01 第四层）→ 指挥下一步迭代方向。
- 文章立场：用你应用的真实失败案例长出私有 eval 集（失败 → 分桶 → 变成 eval 用例 → 修复 → 重跑），这就是"评测驱动开发"的操作定义。

**失效模式（边界）**（延展）
- **Goodhart 定律**：指标一旦成为目标就不再是好指标——刷题、污染、对着 benchmark 调 prompt。
- **分布差异**：benchmark 采样自它的任务分布，你的应用分布不同 → 必须自建。
- **评审自带偏**：LLM-as-a-judge 有位置偏、长度偏、自我偏好 → 所以原文强调"评测你的评测"。
- **饱和**：被做完就失去区分度 → 领域不断造更难的 benchmark（踩踏循环），根源仍是"输出不可预测"没有终极解。

**和什么相连**：评分依据的三选项 = 子技能 4 的手段菜单（确定性评测 / LLM-as-a-judge / human in the loop）；error analysis 是数字背后的解剖刀；"评测你的评测" = 建立流程的校准步；Goodhart 与污染共同解释了为什么私有 eval 集是团队的护城河。

### 盲区索引（文中值得展开的概念，随时点单）

六个子技能各自的概念面，想深入哪个就点名，我会展开为新延展条目：

- **LLM foundations**：tokenization（成本与上下文长度的计价单位）· cache hits（省钱的机制）· knowledge cutoff（模型为何不知道新事）· reasoning effort level（思考深度的档位）· sampling parameters（temperature 等如何塑造输出分布）· tool calling · fine-tuning vs self-hosting 的选型逻辑
- **Grounding**：RAG 的完整工作流 · 向量索引 vs 知识图谱 vs 语义层各自的适用场景 · few-shot prompting · 数据新鲜度管道
- **Agentic**：工作流 vs agent harness 的谱系 · 四大设计模式（reflection / tool use / planning / multi-agent）· MCP · 沙箱 · 记忆架构 · guardrails · 数据外泄风险
- **Evals**：LLM-as-a-judge 的原理与坑 · human in the loop · 如何评测你的评测（benchmark 的建立与测评已在延展 02 展开）
- **Production**：observability · drift · prompt injection 攻防 · CI/CD 中的统计性评测 · 蒸馏与微调的降本逻辑
- **ML foundations**：已在延展 01 展开
