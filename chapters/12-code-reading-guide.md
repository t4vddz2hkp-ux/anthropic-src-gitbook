# 第 12 章 代码阅读指南

## 学习目标

- 建立一套高效率的源码阅读顺序
- 学会如何用“主线追踪法”而不是“目录遍历法”读大型工程
- 为课堂实验和学生作业提供操作指南

## 12.1 最推荐的阅读顺序

### 第一轮：建立系统地图

按下面顺序快速浏览：

1. `src/main.tsx`
2. `src/entrypoints/init.ts`
3. `src/setup.ts`
4. `src/screens/REPL.tsx`
5. `src/commands.ts`
6. `src/tools.ts`
7. `src/Tool.ts`
8. `src/QueryEngine.ts`
9. `src/query.ts`

目标不是读懂每一行，而是建立“哪些文件是中枢”的感觉。

### 第二轮：追踪一条真实请求链

建议沿着这一条链读：

`REPL.tsx -> processUserInput.ts -> QueryEngine.ts -> query.ts -> toolOrchestration.ts -> BashTool.tsx`

### 第三轮：进入专项子系统

按兴趣选择：

- 多代理：`AgentTool.tsx`、`runAgent.ts`、`tasks/`
- 扩展：`services/mcp/`、`utils/plugins/`
- 安全：`utils/permissions/`
- 长上下文：`services/compact/`
- 持久化：`utils/sessionStorage.ts`

## 12.2 不推荐的阅读方式

以下方式通常效率很低：

- 从 `utils/` 开始逐文件读
- 想一次性读完 `REPL.tsx`
- 先钻所有 UI 组件
- 先抠所有 feature gate 细节

原因很简单：  
没有主线时，这些代码会像迷宫。

## 12.3 面向课堂的“主线追踪法”

### 主线一：启动主线

问题：

- 程序如何进入 REPL？
- 哪些初始化是全局的，哪些是会话级的？

文件：

- `main.tsx`
- `entrypoints/init.ts`
- `setup.ts`
- `interactiveHelpers.tsx`

### 主线二：交互主线

问题：

- 用户输入如何进入消息流？
- Slash command 与普通 prompt 在哪里分叉？

文件：

- `REPL.tsx`
- `history.ts`
- `processUserInput.ts`
- `commands.ts`

### 主线三：执行主线

问题：

- 一轮 query 如何运行？
- 模型何时回调工具？

文件：

- `QueryEngine.ts`
- `query.ts`
- `services/api/claude.ts`
- `services/tools/`

### 主线四：能力主线

问题：

- 工具是如何定义的？
- 为什么同一种抽象能同时容纳 Bash、Read、Agent、MCP？

文件：

- `Tool.ts`
- `tools.ts`
- `BashTool.tsx`
- `AgentTool.tsx`

## 12.4 推荐给学生的阅读问题模板

每读一个关键文件，都要求学生回答四个问题：

1. 这个文件在系统里属于哪一层？
2. 这个文件的输入和输出分别是什么？
3. 这个文件依赖哪些上游抽象？
4. 这个文件会影响哪些下游模块？

这比单纯问“这个函数是做什么的”更有效。

## 12.5 建议使用的 grep/检索方式

课堂实践时可用如下命令：

```bash
rg --files src
rg -n "buildTool" src
rg -n "export async function\\* query|class QueryEngine" src
rg -n "registerAsyncAgent|spawnShellTask|connectToServer" src
rg -n "autoCompact|permission|sessionStorage|memdir" src
```

## 12.6 三个课堂实验

### 实验一：追踪一次普通文本请求

要求学生回答：

- 这次请求在哪一步从字符串变成消息？
- 什么时候进入 `query()`？
- 最终 assistant message 在哪里被加入消息流？

### 实验二：追踪一次 Bash 工具调用

要求学生回答：

- 工具 schema 在哪里定义？
- 为什么它能流式输出 progress？
- 什么情况下会进入后台任务？

### 实验三：追踪一次异步子代理

要求学生回答：

- `run_in_background` 在哪里改变流程？
- 为什么会生成 taskId/outputFile？
- worktree/remote 分支在什么位置发生？

## 12.7 最适合当课程作业的题目

1. 画出一轮 query 的时序图
2. 比较 `BashTool` 与 `AgentTool` 的共同协议与差异职责
3. 分析 `commands.ts` 如何把内建命令与插件命令合并
4. 说明 `sessionStorage.ts` 为什么必须区分 transcript message 与 progress

## 本章小结

代码阅读的关键不是“多读”，而是“沿主线读”。  
当学生能把关键主线说清楚时，他们就真正建立了对系统的掌控感。

## 思考题

1. 为什么大型工程更适合“主线追踪法”而不是“按目录遍历法”？
2. 哪三条主线最能帮助你理解这个项目？
3. 你会如何设计一次 30 分钟的课堂走读练习？
