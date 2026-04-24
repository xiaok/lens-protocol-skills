---
name: lens-protocol-social-app-dev
description: 构建基于 Lens Protocol 的社交产品时使用。覆盖 Lens 的核心构件、产品建模准则、当前 canary SDK 的读写模式、metadata 选择、GraphQL 请求结构，以及账户、帖子、关注、群组、文件上传等示例代码。
---

# Lens Protocol 社交应用开发

你是一个熟悉 Lens Protocol 的社交产品开发助手。Lens 不是一套固定的产品模板，而是运行在 Lens Chain 上的一组可组合社交基础构件。Account、Feed、Graph、Group、Username、App、Rules、Actions、Sponsorship 都可以围绕产品边界重新组合。

## 先看哪里

按下面的顺序读，通常能最快进入项目状态：

1. 先看 `ref/metadata.md`，确定要生成的 metadata 类型。
2. 再看 `ref/graphql.md` 和 `ref/graphql-schema.graphql`，核对请求结构、分页方式和返回 union。
3. 读 `examples/client-setup.ts` 与 `examples/auth.ts`，确认客户端初始化和登录模式。
4. 根据任务继续读 `examples/account.ts`、`examples/post.ts`、`examples/content-read.ts`、`examples/social.ts`、`examples/storage.ts`。

## 核心模块

### 1. Account（账户）

- Account 是用户的链上智能合约身份，和 owner EOA 是两层概念。
- Account 可以配置 Account Manager，让受托地址按授权范围代账户操作。
- Account metadata 一般存储在 Grove，包含 `name`、`bio`、`picture`、`coverPicture`、`attributes` 等。
- Signless 是账户级能力。只有用户启用过，且当前 app/session 支持时，写操作才可能由 Lens 代发。

### 2. Feed（信息流）

- Feed 承载帖子的发布、分发和可见性规则。
- 默认 Feed 适合快速起步；如果产品需要独立治理、专属排序或不同内容政策，再考虑自定义 Feed。
- Post 有 Root Post、Comment、Quote、Repost 四种核心关系。
- Post 内容先写成 metadata，再通过 `contentUri` 关联到链上操作。
- Feed 可以挂 Feed Rules，Post 可以挂 Post Rules，Post/Account 还可以挂 Actions。

### 3. Graph（社交图谱）

- Graph 管理 follow/unfollow 关系。
- 默认 Graph 适合通用社交产品；封闭网络、垂直社区或独立增长模型更适合自定义 Graph。
- Follow Rules 决定“谁能关注谁”，例如 token gate、付费关注或自定义合约校验。
- 常见读取是 `followers`、`following`、`followStatus`、`followersYouKnow`。

### 4. Group（群组）

- Group 是链上群组基础构件，支持创建、加入、离开、审批、封禁、移除成员。
- 每个 Group 都有一个关联 Feed，可用于群内内容流。
- Group Rules 管理入群条件，Membership Approval 和 Banning 控制治理。

### 5. Username / Namespace（用户名与命名空间）

- Username 是人类可读标识，展示值通常是 `namespace/localName`，例如 `lens/alice`。
- SDK 请求里通常使用 `{ localName, namespace? }`，不要把 `lens/alice` 当成单个 username 字符串传入。
- Username 可以单独创建后再 assign 到 Account，也可以在创建 Account 时一起创建。
- Namespace 管理用户名集合、规则和元数据，和 App/Graph/Feed 不是同一层概念。

### 6. App（应用）

- App 是链上的应用配置单元，用来定义默认 Feed、Graph、Namespace、Sponsorship 等。
- 认证时通常需要提供 App 地址。
- 默认 App 适合快速起步；如果产品需要独立签名器、授权端点或 sponsorship 策略，应创建自己的 App。

### 7. Rules（规则系统）

- Rules 是可插拔合约模块，用来约束各类 Lens 构件的行为。
- 规则覆盖 Feed、Graph、Group、Namespace、Post、Follow 等场景。
- 规则集合一般分为 `required` 和 `anyOf` 两层。
- 验证结果可能是 `Passed`、`Failed`、`Unknown`；`Unknown` 通常表示需要链上或额外上下文检查。

### 8. Actions（操作系统）

- Actions 是可扩展的链上动作，可挂在 Post 或 Account 上。
- 内置动作包括 collect、tipping 等；未知 action 也可以通过 metadata 与参数描述接入。
- 做交互式内容、打赏、mint、付费行为时，优先考虑 action，而不是只把逻辑留在前端。

### 9. Sponsorship（赞助）

- Sponsorship 决定交易费用由谁承担。
- 写操作通常落入三种模式之一：`OperationResponse`、`SponsoredTransactionRequest`、`SelfFundedTransactionRequest`，失败前置校验则返回 `TransactionWillFail`。
- “默认 App/Feed/Graph”不等于“总会自动赞助”。实际模式取决于 app 配置、账户状态、signless 状态和当前操作。

### 10. Grove（存储）

- Grove 是 Lens 生态的存储层，常见资源通过 `lens://` URI 访问。
- metadata、图片、视频、文件夹清单都可以上传到 Grove。
- 内容默认可读，ACL 主要控制谁可以更新或删除资源。

## 设计准则

### 1. PublicClient / SessionClient 分层

- `PublicClient` 负责公开查询。
- `SessionClient` 负责认证后的查询和写操作。
- 通过 `client.login()` 或 `client.resumeSession()` 获得 `SessionClient`。

### 2. Fragment-First 查询

- SDK 支持用自定义 GraphQL fragment 裁剪返回字段。
- fragment 既影响请求体积，也影响 TypeScript 看到的返回类型。
- 自定义 fragment 后，通过 `declare module "@lens-protocol/client"` 扩展返回类型。

### 3. 分清三类 API 风格

- `@lens-protocol/client/actions` 返回 `ResultAsync<T, E>`。
- `@lens-protocol/metadata` builder 是同步构造函数，输入不合法会直接抛出校验错误。
- `@lens-chain/storage-client` 是 Promise API，声明上带 `@throws`，需要显式处理异常。

### 4. 交易生命周期

典型写操作流程：

1. 构建 metadata。
2. 上传到 Grove，拿到 `lens://` URI。
3. 调用 `@lens-protocol/client/actions` 中对应的 mutation。
4. 用 `handleOperationWith(walletClient)` 统一处理 `OperationResponse`、`SponsoredTransactionRequest`、`SelfFundedTransactionRequest`。
5. 对返回的交易哈希调用 `sessionClient.waitForTransaction()`，等待 Lens API 完成索引。

### 5. Metadata-First 建模

- 账户资料、帖子内容、群组信息、应用信息、规则说明都优先通过 metadata 表达。
- 先确定 metadata 类型，再组织 mutation 参数。
- `$schema` 决定 metadata 语义，`lens` 节点保存实际数据。

### 6. 先定义读取边界，再写列表页

- `author`、`feed`、`app`、`tags` 是不同维度，避免把它们都简化成“来源”。
- `authors` 适合“某个账户发的内容”；`feeds` 适合“某个 Feed 里的内容”；`apps` 适合“某个 App 关联的内容”；`tags` 更适合分类与发现。
- 如果产品里区分“我的内容 / 某个专区内容 / 某个 app 内容”，读取条件也要和这些定义一一对应。
- 同一个页面可以叠加多个过滤维度，但要明确哪一个是主边界，哪一个只是补充筛选。

### 7. Fragment 要和消费代码一起设计

- 先列出页面或接口实际需要的字段，再裁 fragment。不要把 fragment 压到消费层无法可靠取值。
- 如果 UI 依赖 `metadata.title`、`metadata.image`、`stats`、`username`、`picture`，这些字段要在 fragment 里显式选出。
- `AnyPost`、`AccountAvailable` 这类返回值常带 union/多态，消费层先判断 `__typename`，再访问特定字段。
- 发布脚本、列表读取、详情读取如果共享同一批 metadata 字段，最好使用同一套 view-model 映射约定。

## 技术栈

### 推荐依赖

```bash
npm install @lens-protocol/client@canary @lens-protocol/metadata@^2 @lens-chain/storage-client @lens-chain/sdk viem
```

如果你使用 ethers：

```bash
npm install ethers
```

### 包职责

| 包 | 职责 |
|---|---|
| `@lens-protocol/client` | Lens API 客户端、类型、环境、GraphQL fragment 工具 |
| `@lens-protocol/client/actions` | 读写 action 封装 |
| `@lens-protocol/client/viem` | viem 签名与交易处理辅助函数 |
| `@lens-protocol/client/ethers` | ethers 版本的签名与交易处理辅助函数 |
| `@lens-protocol/metadata` | metadata builder、schema、枚举与验证 |
| `@lens-chain/storage-client` | Grove 上传、更新、删除、解析 |
| `@lens-chain/sdk` | Lens Chain 网络配置 |

### 环境要点

| 环境 | SDK 环境值 | Chain ID | Gas Token |
|---|---|---|---|
| Mainnet | `mainnet` | 232 | GHO |
| Testnet | `testnet` | 37111 | GRASS |

当前示例里使用的 App 地址只适合开发演示，正式产品应使用自己的配置。

## 参考文件

- `examples/client-setup.ts`：客户端初始化、fragment、自定义返回类型
- `examples/auth.ts`：四种登录模式、会话恢复、切换账户、signless
- `examples/account.ts`：创建账户、查询账户、更新资料、manager、follow rules
- `examples/post.ts`：发帖、评论、引用、转发、编辑、删除、时间线、反应、书签
- `examples/content-read.ts`：列表页/详情页读取、过滤边界组合、分页与 view-model 映射
- `examples/social.ts`：关注、群组、通知、推荐流
- `examples/storage.ts`：Grove 上传、更新、删除、ACL、`lens://` 解析
- `ref/metadata.md`：metadata builder 与 schema 选择
- `ref/graphql.md`：高频 query/mutation、常用请求结构、返回 union
- `ref/graphql-schema.graphql`：精简版 GraphQL schema 快照，便于快速查输入输出名称
- `ref/actions.md`：当前 SDK action 函数清单

## 实操注意事项

1. 当前这套示例基于 `@lens-protocol/client` canary 版本编写，升级后先重新核对类型。
2. 非浏览器环境需要设置 `origin`。
3. 服务端场景通常需要 `apiKey`。
4. `lens://` 可通过 `StorageClient.resolve()` 转成可 fetch 的 HTTP 地址。
5. 分页是 cursor-based pagination，继续翻页时传 `pageInfo.next`。
6. username 请求、follow rules、post references 这类接口的参数结构比直觉更严格，优先参考 `ref/graphql.md` 里的请求结构。

## 实现一致性清单

开始写页面或脚本前，先快速自检：

1. 列表页的筛选条件，是否真的对应产品定义的“来源”或“归属”。
2. 详情页的定位方式，是否和列表页输出的 `id` / `slug` / route 参数一致。
3. 发布脚本写入的 metadata 字段，是否都被前端 fragment 和映射层正确读取。
4. fragment 里选出的字段，是否足够支撑页面展示，不需要消费层再猜形状。
5. 创建 Account / Post 后，是否按精确目标确认结果，而不是固定 `sleep` 后再取列表第一项。
6. 页面上承诺支持的内容能力，例如标题、图片、标签、markdown、统计数，是否都能从当前 metadata 与 fragment 稳定得到。
7. 分页、筛选、详情读取是否共享同一套边界定义，避免首页和详情页看的不是同一批内容。
