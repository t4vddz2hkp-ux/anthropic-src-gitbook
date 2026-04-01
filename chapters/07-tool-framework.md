# 第 7 章 工具系统设计

## 学习目标

- 理解 `Tool` 协议为什么是整套系统的能力核心
- 掌握 `Tool.ts`、`tools.ts`、`services/tools/` 的协作方式
- 理解工具如何同时服务于模型、权限系统和 UI

## 本章在能力层中的位置

这一章是第三阶段真正的转折点。  
学生在这里会第一次明确看到：这套系统不是“先有很多功能，再把它们拼起来”，而是“先定义统一能力协议，再让所有功能按协议接入”。

## 为什么很多学生会在这一章第一次感到“工程味”

因为 `Tool.ts` 展现出来的不是业务逻辑，而是协议设计。  
一旦开始讲协议、schema、权限接口、并发标记、结果上限和渲染接口，项目就从“功能堆叠”变成了“平台设计”。

## 读这一章时要抓住的三个对象

1. `Tool`：一个能力对象到底要声明哪些规则。
2. `tools.ts`：系统如何维护一个统一工具池。
3. `services/tools/*`：工具从被模型点名到真正执行，中间还要经过哪些治理层。

## 7.1 `Tool.ts` 不是接口文件，而是协议中心

`Tool.ts` 的信息量非常大，因为它同时定义了：

- 工具输入输出 schema
- 工具调用签名
- 权限检查接口
- UI 渲染接口
- 并发安全标记
- 只读/破坏性标记
- 搜索/读取命令折叠提示
- hook 匹配能力
- 自动分类器输入

换言之，`Tool` 在这里不是“函数封装”，而是“系统级能力对象”。

## 7.2 `buildTool()` 的设计价值

在 `Tool.ts` 下半部分，`buildTool()` 做了一件非常关键的事：  
给工具定义补上安全默认值。

默认值包括：

- `isEnabled -> true`
- `isConcurrencySafe -> false`
- `isReadOnly -> false`
- `isDestructive -> false`
- `checkPermissions -> allow`
- `toAutoClassifierInput -> ''`
- `userFacingName -> tool.name`

这里最值得讲给学生听的是 `false` 的方向：

- 默认不认为自己是并发安全的
- 默认不认为自己是只读的

这体现了明显的“保守默认、显式声明”思想。

## 7.3 `tools.ts` 的职责

`tools.ts` 不是单纯导出一个数组，而是负责：

- 汇总所有内建工具
- 根据 feature gate 与环境条件裁剪工具
- 根据 deny rules 过滤工具
- 根据 REPL/simple mode 调整工具可见性
- 将内建工具与 MCP 工具装配为完整工具池

它是工具系统的注册中心和装配中心。

## 7.4 工具池是怎么拼出来的

`assembleToolPool()` 的逻辑很适合拿来拆解：

1. 先拿到当前权限上下文下的内建工具
2. 再引入 MCP 工具
3. 对两者进行 deny 过滤
4. 排序并按名字去重

其中一个细节很值得注意：  
它会保持 built-in tools 作为连续前缀，以维持 prompt cache 稳定性。  
这表明工具列表不仅影响功能，也影响缓存命中率。

## 7.5 工具系统的三重面向

一个 `Tool` 同时面向三类消费者：

### 面向模型

- 名称
- 描述
- 输入 schema
- 输出 schema
- 提示词文本

### 面向执行系统

- `call()`
- `checkPermissions()`
- `isConcurrencySafe()`
- `isReadOnly()`

### 面向 UI

- `renderToolUseMessage()`
- `renderToolResultMessage()`
- `renderToolUseProgressMessage()`
- `userFacingName()`

这也是为什么工具抽象会变得很厚。

## 7.6 `services/tools/` 的作用

光有工具协议还不够，还需要执行层来调度它们。  
这部分主要由：

| 文件 | 作用 |
| --- | --- |
| `toolOrchestration.ts` | 工具调用分批、并发与串行调度 |
| `toolExecution.ts` | 单次工具执行、权限、hook、错误分类 |
| `toolHooks.ts` | 工具前后 hook 流程 |

### 并发策略

`toolOrchestration.ts` 的设计很清晰：

- 先按 `isConcurrencySafe()` 把工具调用分区
- 连续只读/并发安全工具可并发跑
- 非只读或不安全工具串行跑

这是一种非常实用的工程折中：

- 既利用并发
- 又不破坏状态一致性

## 7.7 工具执行流程图

```mermaid
flowchart TD
    A["assistant 产生 tool_use"] --> B["toolOrchestration.ts"]
    B --> C{"是否并发安全"}
    C -- 是 --> D["并发执行一批工具"]
    C -- 否 --> E["串行执行工具"]
    D --> F["toolExecution.ts"]
    E --> F
    F --> G["validateInput / checkPermissions / hooks"]
    G --> H["Tool.call()"]
    H --> I["tool_result message"]
    I --> J["回写 query 主循环"]
```

## 7.8 本章的关键观察

### 观察一：工具是“统一能力外壳”

这套系统把差异极大的能力统一为一个协议：

- 本地 Bash
- 文件读写
- Web/MCP
- 代理创建
- 计划模式切换
- 任务操作

这就是架构抽象的力量。

### 观察二：UI 不是附属品

在这里，工具不是“只执行不展示”，而是从一开始就把 UI 渲染当成协议的一部分。

### 观察三：权限不是外围逻辑

工具对象自己就参与权限协议，这说明安全从一开始就是系统内生设计，而不是后补。

## 本章小结

本章最关键的一句话是：

> `Tool` 是这套系统中最重要的统一抽象，它让模型能力、执行能力、安全能力和展示能力被装进同一个协议。

## 思考题

1. 为什么 `Tool` 不能只保留 `call()` 一个方法？
2. 为什么只读与并发安全要由工具自己声明？
3. 如果没有 `buildTool()` 的安全默认值，最可能出现什么问题？
