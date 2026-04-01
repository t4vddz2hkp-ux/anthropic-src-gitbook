# 第 21 章 关键模块交互案例集

## 本章在第五阶段中的位置

这一章位于第五阶段，也就是学生已经认识主要模块之后，开始训练“把模块重新连成完整协作网络”的阶段。

## 21.1 为什么要有这一章

很多学生在读完“模块介绍”后，仍然会有一种典型困惑：

> 我知道每个模块是干什么的了，但它们怎么真正配合起来？

这正是本章的目的。  
我们不再单独讲模块，而是讲“模块交互案例”。

## 这章不是复述，而是整合

如果前面的章节更像“模块说明书”，这一章更像“系统配合演练”。  
它要求学生不只记住模块职责，还要解释：

- 调用顺序
- 数据流方向
- 状态变化点
- 模块边界上的接口形式

## 正确使用方式

建议你把这一章当成“自测场景库”来用：

1. 先自己尝试画出交互链。
2. 再对照本章案例。
3. 最后换一个场景，自己再独立推一遍。

## 21.2 案例一：普通文本请求如何穿过系统

### 涉及模块

- `REPL.tsx`
- `processUserInput.ts`
- `QueryEngine.ts`
- `query.ts`
- `services/api/claude.ts`
- `messages.ts`

### 交互过程

1. REPL 收到用户输入
2. 输入被预处理并转换为 `user message`
3. QueryEngine 取出当前会话的消息历史
4. query 主循环组装上下文
5. API 层发起模型请求
6. assistant message 回流到 UI 与 transcript

### 这个案例最想说明什么

这个案例说明：  
即使没有工具调用，系统也已经是多层协作，而不是简单函数调用。

## 21.3 案例二：一个 Bash 命令如何从模型调用变成后台任务

### 涉及模块

- `query.ts`
- `toolOrchestration.ts`
- `toolExecution.ts`
- `BashTool.tsx`
- `LocalShellTask.tsx`
- `AppStateStore.ts`

### 交互过程

1. 模型在 assistant 响应中产生 `tool_use: Bash`
2. 调度层把 BashTool 交给执行层
3. BashTool 运行命令并上报 progress
4. 如果执行时间过长或命中特定策略，命令被后台化
5. `LocalShellTask` 注册任务状态并接管生命周期
6. UI 根据 `tasks` 状态展示后台任务

### 最该抓住的点

这里最值得体会的是：

> “工具调用”和“任务运行”不是同一个抽象层次。

## 21.4 案例三：一个子代理如何拥有自己的上下文

### 涉及模块

- `AgentTool.tsx`
- `runAgent.ts`
- `assembleToolPool()`
- `createSubagentContext`
- `query.ts`
- `tasks/LocalAgentTask`

### 交互过程

1. 主模型调用 `AgentTool`
2. AgentTool 解析 agent definition
3. 根据 agent 的 permissionMode、tools、MCP 需求重建工具池
4. `runAgent()` 创建子代理上下文
5. 子代理运行自己的 `query()`
6. 如果后台运行，则注册为 `LocalAgentTask`

### 最该抓住的点

子代理并不是“在主代理里套一个函数”，  
而是重新构造了一套缩小版运行环境。

## 21.5 案例四：MCP 工具如何进入主工具池

### 涉及模块

- `services/mcp/config.ts`
- `services/mcp/client.ts`
- `tools.ts`
- `AppState.mcp`
- `assembleToolPool()`

### 交互过程

1. 系统从多来源解析 MCP 配置
2. MCP client 层连接各服务器
3. 连接成功后抓取 tools/resources
4. 这些工具进入 `AppState.mcp.tools`
5. `assembleToolPool()` 把它们和 built-in tools 合并

### 最该抓住的点

这说明“扩展能力”不是旁路调用，而是被吸收进统一工具协议。

## 21.6 案例五：权限模式切换如何影响外部系统

### 涉及模块

- `AppStateStore.ts`
- `onChangeAppState.ts`
- `utils/permissions/*`
- `sessionState.ts`
- CCR/SDK 状态同步

### 交互过程

1. 用户或系统改变 `toolPermissionContext.mode`
2. AppState 更新
3. `onChangeAppState()` 检测到 mode 变化
4. 外部 metadata 被同步
5. 相关 UI 和远端状态保持一致

### 最该抓住的点

状态变化不是局部事件，而可能触发跨系统同步。

## 21.7 案例六：一次 compact 如何改变消息历史

### 涉及模块

- `query.ts`
- `services/compact/autoCompact.ts`
- `services/compact/compact.ts`
- `messages.ts`
- `sessionStorage.ts`

### 交互过程

1. query 发现 token 接近阈值
2. `autoCompactIfNeeded()` 决定是否压缩
3. `compact.ts` 生成总结与边界消息
4. query 用压缩后的消息替代旧消息继续执行
5. sessionStorage 可记录 compact boundary，供恢复和理解使用

### 最该抓住的点

压缩不是“删掉旧消息”，而是“改写消息历史的可解释表示”。

## 21.8 案例七：一个插件如何影响用户命令与模型能力

### 涉及模块

- `pluginLoader.ts`
- `loadPluginCommands.ts`
- `commands.ts`
- `loadPluginAgents.ts`
- `services/mcp/config.ts`

### 交互过程

1. 插件被发现并验证
2. 插件贡献的 commands/skills/agents/hooks/MCP 配置被解析
3. 命令进入命令系统
4. agent 进入 agent 定义系统
5. MCP 配置可能进一步扩展工具池

### 最该抓住的点

插件影响的不是单一入口，而可能同时改变：

- 用户命令面
- agent 面
- 模型工具面

## 21.9 适合做自学练习的“交互追踪题”

### 题目一

追踪 `/mcp` 命令如何影响后续 Query 的工具池。

### 题目二

追踪一次 `AgentTool` 异步后台运行后，任务状态如何回到 UI。

### 题目三

追踪一次 `BashTool` 超时后台化后，为什么 transcript 仍然能恢复语义。

## 21.10 本章小结

真正理解大型系统，不只是知道模块名，而是能说明：

> 模块 A 为什么要在时机 X 调用模块 B，以及这个调用如何改变系统后续的运行状态。

当你能够讲清这些案例时，你就已经跨过“会看文件”这个阶段，进入了“会理解系统”的阶段。
