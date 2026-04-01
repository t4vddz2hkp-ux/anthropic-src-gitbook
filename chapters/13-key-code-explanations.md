# 第 13 章 关键代码精讲

## 学习目标

- 通过几个高价值代码片段掌握系统设计思想
- 学会把长代码归纳成“骨架 + 关键分支”
- 让学生在课堂上能讲出“为什么这样设计”

## 13.1 精讲一：`buildTool()` 是协议工厂

位置：`src/Tool.ts`

### 为什么要讲它

因为它体现了整套工具系统的思想：  
先给出统一协议，再给出安全默认值，然后所有工具都按同一方式构建。

### 可以这样向学生解释

伪代码：

```ts
function buildTool(def) {
  return {
    ...安全默认值,
    userFacingName: () => def.name,
    ...def,
  }
}
```

教学重点：

- 这不是语法技巧，而是平台约束
- 默认值是 fail-closed 思想的体现
- 平台通过工厂把工具实现“拉回协议”

## 13.2 精讲二：`getCommands()` 是多来源合并器

位置：`src/commands.ts`

### 要点

`getCommands(cwd)` 并不是返回一个写死数组，而是按运行时组合：

- built-in commands
- skill dir commands
- plugin skills
- workflow commands
- dynamic skills

### 教学重点

- 命令集合是运行时对象，不是静态常量
- 可扩展系统往往需要一个“最后汇总点”
- `memoize + availability/isEnabled 每次重算` 是性能与动态性的折中

## 13.3 精讲三：`query()` 是状态机主循环

位置：`src/query.ts`

### 读法

不要逐行解释，先把它压缩成骨架：

```ts
while (true) {
  准备上下文与预算
  必要时压缩
  发起模型请求
  收集 assistant 与 tool_use
  如果有工具调用:
    执行工具
    回写消息
    continue
  否则:
    return
}
```

### 教学重点

- 先找状态对象，再找循环阶段，再找 continue 点
- 真正难点不是 API 调用，而是控制流拼接
- 这是系统内核式代码

## 13.4 精讲四：`BashTool.call()` 的两层结构

位置：`src/tools/BashTool/BashTool.tsx`

### 外层结构

- 处理模拟 sed 编辑
- 准备执行上下文
- 消费 `runShellCommand()` 产生的流式进度
- 结束后整理输出

### 内层结构

`runShellCommand()` 自己又是一个异步生成器：

- 启动 shell command
- 监听进度
- 判断是否后台化
- 最终返回 `ExecResult`

### 教学重点

- 一个工具内部也可能包含小型状态机
- 生成器非常适合表达“执行中持续产出进度，结束后返回最终值”
- 这比 callback 风格更清晰

## 13.5 精讲五：`AgentTool.call()` 的决策树

位置：`src/tools/AgentTool/AgentTool.tsx`

### 建议的讲法

把它画成决策树，不要直接念代码：

1. 这是 teammate 吗？
2. 这是 fork path 吗？
3. 需要哪些 MCP 服务器？
4. 要 worktree 吗？
5. 要 remote 吗？
6. 要同步还是异步？
7. 最终怎么调 `runAgent()`？

### 教学重点

- 长函数不等于坏代码，前提是它承担的是调度职责
- 这种函数最重要的是“决策顺序”
- 当分支足够多时，应该先讲树，再讲代码

## 13.6 精讲六：自定义 Ink 渲染栈

位置：`src/ink/ink.tsx`、`src/ink/renderer.ts`

### 建议讲法

先讲概念，再讲实现：

- React 组件树不是直接写终端
- 它先经过 reconciler
- 再经过 yoga 布局
- 再被渲染成 screen buffer
- 最后 diff 到真实终端

### 教学重点

- “终端前端”也有自己的渲染管线
- 自定义渲染栈意味着作者对终端体验有很强控制需求
- 这部分最适合训练学生的系统抽象能力

## 13.7 课堂黑板版总结

如果要在黑板上只留六句话，可以写成：

1. `main.tsx` 是装配器
2. `REPL.tsx` 是 Shell
3. `QueryEngine + query` 是执行内核
4. `Tool` 是统一能力协议
5. `Task` 是统一异步容器
6. `MCP/Plugin/Memory/Permission/Compact/SessionStorage` 是平台级治理系统

## 本章小结

关键代码精讲的目的不是让学生背实现，而是让他们学会：

> 面对超长文件时，先抽骨架，再找协议，再找决策点，再找状态流。

## 思考题

1. 如果你只能讲三个文件来代表整个系统，你会选哪三个？为什么？
2. 哪个代码片段最能体现“平台化设计”？
3. 哪个代码片段最能体现“安全优先”的工程思想？
