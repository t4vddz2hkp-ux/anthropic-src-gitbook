# 第 20 章 模块百科全书：顶层目录逐一解读

## 20.1 本章的使用方式

如果前面的章节像“主线叙事”，那么本章更像一本“模块地图册”。  
它的目标不是带你走完整条流程，而是回答：

> `src` 里每个大模块大致是干什么的？它和谁交互？应该从哪几个文件开始读？

为了方便教学，本章按顶层目录逐一说明。

## 20.2 顶层目录总表

根据对 `src` 的扫描，当前顶层结构可以概括如下：

| 模块 | 文件量级 | 主要职责 |
| --- | ---: | --- |
| `assistant` | 极少 | Assistant 模式相关入口 |
| `bootstrap` | 极少但关键 | 运行时全局状态与启动态 |
| `bridge` | 中等 | 外部桥接、权限桥 |
| `buddy` | 小型 | 伴随式角色/Companion 相关能力 |
| `cli` | 中等 | 结构化输出、远程 IO、传输层 |
| `commands` | 很大 | 用户命令系统 |
| `components` | 很大 | REPL 组件与 UI 展示 |
| `constants` | 小到中 | 常量、提示词片段、产品开关 |
| `context` | 小到中 | React/运行时上下文 |
| `coordinator` | 小型 | 协调者模式相关逻辑 |
| `entrypoints` | 小型但关键 | 初始化入口 |
| `hooks` | 很大 | UI 逻辑与运行时 Hook |
| `ink` | 很大 | 自定义终端渲染引擎 |
| `keybindings` | 中等 | 快捷键系统 |
| `memdir` | 中等 | 记忆系统 |
| `migrations` | 小型 | 配置迁移脚本 |
| `native-ts` | 小型 | 原生绑定/布局/颜色扩展 |
| `plugins` | 小型 | 内建插件入口 |
| `query` | 小型但关键 | 查询子模块 |
| `remote` | 小型 | 远程会话管理 |
| `screens` | 小型但关键 | 顶层屏幕组件 |
| `server` | 小型 | 直连会话与服务端相关 |
| `services` | 很大 | 业务服务和平台服务 |
| `skills` | 中等 | 技能系统 |
| `state` | 小型但关键 | AppState 与选择器 |
| `tasks` | 小型但关键 | 后台任务种类 |
| `tools` | 很大 | 模型可调用工具 |
| `types` | 小型 | 类型定义与生成类型 |
| `upstreamproxy` | 很小 | 上游代理支持 |
| `utils` | 最大 | 横切基础设施 |
| `vim` | 小型 | Vim 风格编辑/导航 |
| `voice` | 很小 | 语音相关能力 |

下面逐个解读。

## 20.3 `assistant/`

### 这个模块做什么

从 `main.tsx` 的特性门控可见，`assistant/` 是 Assistant 模式相关的子系统。  
它不是整套程序的默认主线，而是特性打开后进入的专门模式。

### 应该怎么读

先从 `main.tsx` 中对 `assistantModule`、`kairosGate` 的引入位置看起，  
再回到 `assistant/` 里看它如何接到主入口。

### 和谁交互

- `main.tsx`
- `REPL.tsx`
- 可能与 `services`、`hooks`、`tools` 联动

## 20.4 `bootstrap/`

### 这个模块做什么

它是“全局运行时状态模块”。  
最关键文件是 [bootstrap/state.ts](src/bootstrap/state.ts)。

### 为什么重要

很多会话级、进程级状态都在这里保存，例如：

- sessionId
- cwd / originalCwd / projectRoot
- telemetry provider
- prompt cache latch
- mainLoop model
- clientType

### 教学提示

可以把它解释成“终端 Agent 平台的内核态变量仓库”。

## 20.5 `bridge/`

### 这个模块做什么

从名称和 `REPL.tsx`/`main.tsx` 中的导入位置看，它负责：

- REPL bridge
- 权限桥接
- 外部会话和控制请求桥接

### 适合怎么理解

它更像“与外部控制端通信的桥层”，  
不是普通业务层。

## 20.6 `buddy/`

### 这个模块做什么

从 `CompanionSprite.tsx`、`companion.ts`、`prompt.ts` 等名字看，  
这是一个伴随式角色/小伙伴系统，用来在 UI 中提供陪伴式反馈或交互增强。

### 为什么它存在

说明这个产品并不仅追求功能性，还在尝试把交互做得更具人格感。

## 20.7 `cli/`

### 这个模块做什么

`cli/` 并不是入口的代名词，而更偏向：

- 非 REPL 模式的结构化输出
- 远程 I/O
- transport
- handlers

例如：

- `structuredIO.ts`
- `remoteIO.ts`
- `transports/*`

### 与谁交互

- SDK/headless 模式
- API 层
- 远程通信层

## 20.8 `commands/`

### 这个模块做什么

它是用户命令实现的主要容器。  
而 [commands.ts](src/commands.ts) 则是命令注册中心。

### 关键理解

用户看见的是 `/help`、`/mcp`、`/plugin`；  
系统内部则把它们编排成统一的命令协议对象。

### 优先阅读文件

- `commands.ts`
- `types/command.ts`
- 任意几个代表性命令目录，如 `commands/mcp/`、`commands/plugin/`

## 20.9 `components/`

### 这个模块做什么

它是终端 UI 的组件库。  
包含：

- 消息展示
- 权限弹窗
- PromptInput
- 任务列表
- MCP 对话框
- 设置对话框

### 为什么文件这么多

因为这个终端 UI 不是简单打印文本，而是一个完整交互界面。

## 20.10 `constants/`

### 这个模块做什么

存放产品层与系统层常量，例如：

- prompt 片段
- tool 限制
- XML tag 名称
- beta header 常量

### 教学提醒

不要低估 constants 目录。  
在这类系统中，它往往能揭示产品语义边界。

## 20.11 `context/`

### 这个模块做什么

它主要提供多种 React/运行时 Context：

- notifications
- mailbox
- stats
- overlay
- modal

### 适合如何理解

如果 `state/` 是统一状态树，那么 `context/` 更像“跨组件共享能力入口”。

## 20.12 `coordinator/`

### 这个模块做什么

从 `coordinatorMode.ts` 与多处 feature gate 看，  
它是协调者模式相关逻辑，用于多代理协作时区分 leader 与 worker 的行为。

### 与谁交互

- `AgentTool`
- `tools.ts`
- `query.ts`

## 20.13 `entrypoints/`

### 这个模块做什么

它负责“程序级初始化入口”。  
最重要的是 [entrypoints/init.ts](src/entrypoints/init.ts)。

### 教学重点

它体现了启动期的：

- 配置启用
- 遥测初始化
- 预热
- cleanup 注册

## 20.14 `hooks/`

### 这个模块做什么

这里主要是 React/Ink hook，以及部分与权限、通知、远程连接相关的逻辑 hook。

### 为什么重要

`REPL.tsx` 之所以能维持可读性，一个关键原因就是大量逻辑被拆成了 hooks。

## 20.15 `ink/`

### 这个模块做什么

终端渲染引擎。  
包括：

- reconciler
- layout
- output buffer
- terminal 写入
- 事件系统
- 选择与高亮

### 为什么是大模块

因为项目没有满足于用现成终端 UI 能力，而是要掌控底层渲染行为。

## 20.16 `keybindings/`

### 这个模块做什么

负责快捷键解析、校验、展示和用户自定义绑定。

### 教学重点

它说明这套系统把键盘交互当成一等公民，而不是简单监听几个按键。

## 20.17 `memdir/`

### 这个模块做什么

长期记忆系统。  
核心文件是 [memdir.ts](src/memdir/memdir.ts)。

### 关键能力

- 记忆目录结构
- `MEMORY.md` 入口
- 记忆提示词构造
- 记忆扫描与选择

## 20.18 `migrations/`

### 这个模块做什么

处理配置和模型名称等历史遗留迁移。  
这说明产品配置结构曾经演进过很多次。

### 教学意义

让学生看到“成熟产品必然要面对迁移问题”。

## 20.19 `native-ts/`

### 这个模块做什么

放置接近原生实现的 TypeScript 包装，例如：

- `yoga-layout`
- `color-diff`
- `file-index`

### 作用

多半是为了补足性能敏感能力或终端布局底层能力。

## 20.20 `plugins/`

### 这个模块做什么

这里更多是“内建插件”入口和聚合层；  
真正复杂的插件装载逻辑在 `utils/plugins/`。

## 20.21 `query/`

### 这个模块做什么

它是 `query.ts` 的辅助子模块集合：

- `config.ts`
- `deps.ts`
- `stopHooks.ts`
- `tokenBudget.ts`

### 教学价值

说明作者在努力把主循环的大文件继续拆成子关注点。

## 20.22 `remote/`

### 这个模块做什么

处理远程会话管理、权限桥接、WebSocket 会话等。  
如果要理解远程协作/远程控制能力，这里是重要入口。

## 20.23 `screens/`

### 这个模块做什么

顶层屏幕组件。  
虽然目录不大，但 [REPL.tsx](src/screens/REPL.tsx) 非常关键。

### 教学提醒

不要因为 `screens/` 文件少，就误以为它不重要。  
它属于“少而重”的目录。

## 20.24 `server/`

### 这个模块做什么

处理 direct connect session 等服务端接入点。  
它与 `remote/` 一起构成远程运行相关的底层支持。

## 20.25 `services/`

### 这个模块做什么

这是非常大的“业务服务层/平台服务层”，包含：

- `api/`
- `mcp/`
- `compact/`
- `analytics/`
- `lsp/`
- `oauth/`
- `plugins/`

### 适合怎么理解

如果 `utils/` 更偏基础设施，那么 `services/` 更偏“有明确业务语义的服务模块”。

## 20.26 `skills/`

### 这个模块做什么

技能系统。  
它既有 bundled skills，也有技能加载与构建逻辑。

### 与谁交互

- `commands.ts`
- `tools/SkillTool`
- 动态技能发现逻辑

## 20.27 `state/`

### 这个模块做什么

REPL 应用状态层。

关键文件：

- `AppStateStore.ts`
- `AppState.tsx`
- `selectors.ts`
- `onChangeAppState.ts`

### 教学重点

这是理解 UI 如何维持复杂交互的核心目录。

## 20.28 `tasks/`

### 这个模块做什么

后台任务种类实现。  
典型包括：

- `LocalShellTask`
- `LocalAgentTask`
- `InProcessTeammateTask`
- `RemoteAgentTask`

### 与谁交互

- `tools/*`
- `AppState`
- `sessionStorage`

## 20.29 `tools/`

### 这个模块做什么

模型可调用工具实现层。  
这是本项目最重要的目录之一。

### 关键特点

- 目录分层很清晰
- 大工具都有独立子目录
- 工具不仅有执行逻辑，还有 UI 逻辑、权限逻辑、提示词逻辑

## 20.30 `types/`

### 这个模块做什么

统一类型定义。  
另外还有大量 generated types。

### 教学提醒

不要只把 types 当“补充材料”。  
在大型 TypeScript 工程里，类型文件往往能快速暴露系统边界。

## 20.31 `upstreamproxy/`

### 这个模块做什么

处理上游代理中继，主要在远程/CCR 场景下使用。  
属于网络与部署适配层。

## 20.32 `utils/`

### 这个模块做什么

这是全项目最大的目录。  
它容纳的是各种横切基础设施，例如：

- auth
- debug
- file / path
- shell
- sandbox
- settings
- plugins
- permissions
- sessionStorage

### 如何读它

绝对不要试图“按文件一个个看完”。  
正确方式是按专题读：

- 读权限，就看 `utils/permissions/`
- 读插件，就看 `utils/plugins/`
- 读 Shell，就看 `utils/bash/`、`utils/shell/`

## 20.33 `vim/`

### 这个模块做什么

实现 Vim 风格的文本对象、操作符、motion 等。  
说明这个终端应用对键盘效率非常重视。

## 20.34 `voice/`

### 这个模块做什么

语音相关功能，规模较小，但显示出产品在探索更丰富输入方式。

## 20.35 本章小结

本章最想传达的，是一种“地图感”：

> 你不需要一开始就读懂每个目录，但你必须知道每个目录在整套系统里大概扮演什么角色。

一旦有了这张地图，阅读大型工程就不再像在黑暗中摸索。
