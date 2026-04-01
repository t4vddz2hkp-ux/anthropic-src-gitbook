# 第 1 章 课程导论

## 学习目标

- 认识 `src` 目录所代表的系统类型
- 理解这套工程为何不能按“普通脚本项目”去读
- 建立阅读大型 TypeScript/React/Ink 工程的全局意识

## 1.1 这到底是一个什么系统

从源码可以直接观察到以下事实：

- 入口文件是 `src/main.tsx`
- 主界面是 `src/screens/REPL.tsx`
- 有自定义的终端渲染层 `src/ink/`
- 有命令系统 `src/commands.ts`
- 有工具系统 `src/tools.ts` 与 `src/Tool.ts`
- 有后台任务系统 `src/Task.ts` 与 `src/tasks/`
- 有多代理相关实现 `src/tools/AgentTool/`、`src/tasks/LocalAgentTask/`
- 有 MCP、插件、技能、记忆、权限、压缩、会话恢复等完整子系统

因此，最合理的定位不是“聊天程序”，而是：

> 一个以 REPL 为主界面、以模型为调度核心、以工具为执行能力、以任务系统承载异步工作、以 MCP/插件扩展生态的终端 Agent 平台。

## 1.2 为什么它难读

这份源码难读，不是因为语法复杂，而是因为它同时叠了五种复杂性：

- 产品复杂性：既有聊天，又有命令，又有工具，又有后台任务，又有远程协作
- 运行时复杂性：既支持同步流程，也支持流式输出、并发工具、后台任务
- UI 复杂性：不是简单日志输出，而是可交互的终端界面
- 扩展复杂性：MCP、插件、技能、命令、工具都可扩展
- 横切复杂性：权限、安全、记忆、压缩、持久化会影响多个模块

## 1.3 目录统计与结构特征

对 `src` 的结构扫描显示，当前共有约 1902 个文件。顶层目录分布如下：

| 顶层目录 | 文件数 | 教学意义 |
| --- | ---: | --- |
| `utils` | 564 | 横切基础设施最密集，体现工程化深度 |
| `components` | 389 | UI 组件非常多，说明交互层并不轻薄 |
| `commands` | 207 | 用户命令面非常宽 |
| `tools` | 184 | 模型可调用能力被系统性抽象 |
| `services` | 130 | 网络、MCP、压缩、分析等服务层丰富 |
| `hooks` | 104 | React/Ink 交互逻辑重度 Hook 化 |
| `ink` | 96 | 存在独立终端渲染子系统 |
| `tasks` | 12 | 任务目录数量不多，但概念非常关键 |

局部热点目录还包括：

| 二级目录 | 文件数 | 说明 |
| --- | ---: | --- |
| `components/permissions` | 51 | 权限 UI 很复杂 |
| `utils/plugins` | 44 | 插件生态是核心特性 |
| `components/messages` | 41 | 消息展示有丰富变体 |
| `utils/permissions` | 24 | 权限逻辑不是单点，而是系统级能力 |
| `services/mcp` | 23 | MCP 是重要扩展总线 |
| `utils/bash` | 23 | Shell/Bash 解析与安全检查很重 |
| `utils/swarm` | 22 | 多代理协作被系统化实现 |
| `services/api` | 20 | 模型 API 层有专门封装 |
| `tools/AgentTool` | 20 | 委派子代理是一级能力 |
| `tools/BashTool` | 18 | Shell 能力是核心执行接口 |

## 1.4 读这份代码时最重要的三个思想

### 思想一：消息是系统的“统一语言”

用户输入、模型输出、工具结果、系统通知、附件、压缩边界，最终都会进入消息流。  
理解消息，就理解了系统数据流。

### 思想二：工具是系统的“统一能力协议”

不管是读文件、搜代码、跑 Bash、问用户、起子代理、连 MCP，本质都被包装成 `Tool`。  
理解 `Tool`，就理解了系统如何把“能力”暴露给模型。

### 思想三：任务是系统的“统一异步运行容器”

长时间运行的 Bash、后台 Agent、远程 Agent、进程内 teammate，都被抽象进任务系统。  
理解任务，就理解了系统如何支持后台化、可恢复、可观察。

## 1.5 本课程的阅读策略

推荐按下面顺序带学生建立理解：

1. `main.tsx` 看入口
2. `entrypoints/init.ts` 与 `setup.ts` 看初始化
3. `screens/REPL.tsx` 看主界面
4. `processUserInput.ts` 看输入如何进入消息流
5. `QueryEngine.ts` 与 `query.ts` 看主循环
6. `Tool.ts` 与 `tools.ts` 看工具协议
7. `BashTool.tsx` 与 `AgentTool.tsx` 看两个重量级工具
8. `services/mcp/`、`utils/plugins/` 看扩展层
9. `memdir/`、`utils/permissions/`、`services/compact/`、`utils/sessionStorage.ts` 看横切系统

## 本章小结

这一章要帮助学生建立一个判断：  
这不是“按文件夹逐个读完就能懂”的项目，而是必须抓主线、抓抽象、抓运行流程的大型系统。

## 思考题

1. 为什么说 `commands`、`tools`、`tasks` 是三套不同层次的能力抽象？
2. 如果一个学生只读 `components/` 而不读 `query.ts`，会错过什么？
3. 为什么 `ink/` 的存在会显著提高整个项目的理解门槛？
