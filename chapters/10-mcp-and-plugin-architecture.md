# 第 10 章 MCP 与插件扩展架构

## 本章目标
- 理解系统怎样把外部能力、插件能力和动态工具接进统一运行时。
- 看清 MCP 配置解析、客户端连接、去重与工具池注入的完整路径。
- 认识插件并不是单点功能，而是一种可以同时影响命令、agent、hook 和 MCP 的能力包。

## 先修关系
- 建议先读第 7 章，先理解“扩展能力最终也要变成统一协议面”。
- 如果第 9 章读过，你会更自然地理解 agent 与插件为什么会在扩展层碰面。
- 本章和第 29 章相互照应：本章看接入机制，第 29 章看接入后的重量级能力形态。

## 关键词
- `MCP`：把外部服务的工具、资源和提示以统一协议接入系统的机制。
- `Plugin`：不仅能带命令，还能带 agent、hook 和 MCP 配置的能力包。
- `Server Signature`：用来判断两个来源声明的服务器是否本质相同。
- `配置解析`：MCP 配置会来自多个来源，并在运行时被合并与去重。
- `能力注入`：外部能力不会旁路执行，而是最终被吸收到当前工具池或命令面。

## 正文图解
```mermaid
flowchart TD
    A["多来源配置"]
    B["解析并去重 MCP/插件"]
    C["连接外部服务"]
    D["生成工具/命令/agent 能力"]
    E["注入主系统"]
    A --> B
    B --> C
    C --> D
    D --> E
```

## 关键数据结构
| 结构/对象 | 在本章中的位置 | 阅读时要抓什么 |
| --- | --- | --- |
| `MCP Server Config` | 描述服务器地址、认证、scope 等信息。 | 这是外部能力进入系统的最前门。 |
| `Server Signature` | 对服务器身份做去重判定的结构。 | 它避免重复声明造成能力重复或冲突。 |
| `Plugin Manifest` | 插件包里公开的命令、agent、hook、MCP 等入口。 | 它表明插件不是“一个按钮”，而是一组贡献集合。 |
| `AppState.mcp 聚合态` | 把已连接 MCP 服务、工具和资源挂进应用状态。 | 后续工具池和 UI 都会从这里取数据。 |

## 本章在扩展体系学习中的位置

这一章是第三阶段靠后的内容，适合放在学生已经理解命令、工具、任务之后再读。  
因为只有在知道“内建能力是怎样接入系统”的前提下，你才会真正理解“外部能力为什么还能被无缝吸纳进来”。

## 学生最容易混淆的三个概念

1. 插件和 MCP 不是同一回事。
2. 技能和工具也不是同一回事。
3. 命令系统虽然也能扩展，但它和 MCP/插件的扩展边界不同。

如果这三个概念混了，整套扩展架构就会看成一团。

## 阅读顺序建议

建议这样读：

1. 先理解为什么系统不是封闭架构。
2. 再看 `services/mcp/client.ts` 这类“协议与连接层”。
3. 然后看 `config.ts` 和插件加载逻辑，理解扩展是怎么被发现、过滤和装配进主系统的。

## 10.1 扩展体系的四种入口

从源码看，这套系统至少有四类可扩展入口：

| 扩展入口 | 代表目录/文件 | 贡献内容 |
| --- | --- | --- |
| MCP | `services/mcp/` | 工具、资源、提示词、认证流程 |
| 插件 | `utils/plugins/` | 命令、技能、hooks、MCP 配置 |
| 技能 | `skills/`、`loadSkillsDir.ts` | Prompt 型能力与工作流知识 |
| 命令 | `commands.ts` + plugin commands | 用户可直接触发的 slash commands |

## 10.2 `services/mcp/client.ts` 的意义

这个文件非常关键，因为它承担了 MCP 客户端适配层。  
从可见代码可以看出它支持多种 transport：

- stdio
- SSE
- Streamable HTTP
- WebSocket
- SDK control transport

它还处理：

- OAuth/401 刷新
- tool/resource 获取
- tool result 截断与持久化
- 图片/二进制结果处理
- session 过期识别
- elicitation 交互

因此它并不是“调用一下 MCP SDK”，而是系统级的 MCP 运行时封装。

## 10.3 `services/mcp/config.ts` 的职责

配置层负责的不是“存一份 JSON”，而是：

- 解析多来源 MCP 配置
- 给配置打 scope
- 生成 server signature
- 对 plugin MCP server 做去重
- 处理 `.mcp.json`
- 处理 enterprise managed MCP 文件

特别值得细读的是 `getMcpServerSignature()` 和 `dedupPluginMcpServers()`：  
它们说明扩展系统已经考虑到了“不同来源声明的是不是同一个服务器”这一类真实工程问题。

## 10.4 插件系统的结构

`utils/plugins/pluginLoader.ts` 开头写得很清楚，插件目录本身可以包含：

- `plugin.json`
- `commands/`
- `agents/`
- `hooks/`

也就是说，插件不是单点扩展，而是“能力包”。

## 10.5 插件装载器在做什么

从 `pluginLoader.ts` 可以归纳出它负责的工作：

- 发现插件
- 读取 manifest
- 解析 marketplace/source
- 验证路径与来源
- 处理版本缓存
- 处理 seed cache / zip cache
- 管理 enable/disable 状态
- 汇总错误

这说明插件系统是一个真正的包管理/装配系统，而不是简单地 `import` 某个目录。

## 10.6 `commands.ts` 中的动态合并

`commands.ts` 非常适合拿来讲“多来源合并”：

- 内建命令来自 `COMMANDS()`
- 技能命令来自 `getSkillDirCommands()`
- 插件技能来自 `getPluginSkills()`
- 内建插件技能来自 `getBuiltinPluginSkillCommands()`
- 工作流命令来自 `getWorkflowCommands()`
- 最后还会插入动态发现的技能

这说明最终的命令集合是运行时拼出来的，而不是编译时写死的。

## 10.7 扩展如何进入主系统

```mermaid
flowchart TD
    A["插件目录 / Marketplace / MCP Server"] --> B["配置与发现"]
    B --> C["pluginLoader / mcp config"]
    C --> D["生成 commands / skills / tools / resources"]
    D --> E["commands.ts / tools.ts / AppState.mcp"]
    E --> F["REPL / QueryEngine / ToolSearch"]
```

## 10.8 为什么扩展最后要汇入工具层

一个重要架构判断是：  
MCP、插件、技能虽然来源不同，但最终都要汇入主系统的统一协议。

最典型的是 MCP：

- MCP server 暴露的工具，最终会变成系统里的 `Tool`
- MCP resource 也会通过专门工具暴露出来

这能保证：

- 权限系统仍然可用
- UI 渲染仍然统一
- Query 主循环无需区分“内建工具”和“外来工具”

## 10.9 给学生强调的三个工程点

### 工程点一：扩展是运行时装配，而非静态依赖

这决定了系统必须有缓存、校验、去重、错误隔离。

### 工程点二：扩展不能绕过统一协议

否则外部能力会变成“系统外的例外”，整个架构会失控。

### 工程点三：配置来源和信任来源是不同问题

系统里不仅要知道“这个扩展来自哪里”，还要知道“它是否被允许”。

## 章末小结
- 本章围绕“外部能力接入、配置解析与统一协议化”重建了一层稳定理解，不让你只记零散函数名或目录名。
- 真正需要沉淀下来的，不只是 `MCP`、`Plugin`、`Server Signature` 这几个词，而是它们在 `MCP Server Config`、`Server Signature`、`Plugin Manifest` 里的相互位置。
- 如果你后续在 第 20 章、第 21 章和第 29 章 中再次迷路，优先回看本章的“先修关系、正文图解、关键数据结构”三部分。

## 章末自测
1. 不看原文，用自己的话重述本章围绕“外部能力接入、配置解析与统一协议化”到底解决了什么问题。
2. 结合“正文图解”，把 `解析并去重 MCP/插件` 到 `生成工具/命令/agent 能力` 之间的连接关系重新讲一遍。
3. 对比 `MCP Server Config` 与 `Server Signature`：它们分别回答什么问题，边界为什么不能混掉？
4. 在 `MCP`、`Plugin`、`Server Signature` 中任选两个，说明它们在本章中是如何互相作用的。
5. 如果后续要继续读 第 20 章、第 21 章和第 29 章，本章哪一部分最值得先回看？为什么？
