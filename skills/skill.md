---
name: lens-protocol-social-app-dev
description: 在构建基于 Lens Protocol 的社交产品时使用。覆盖 Lens 的核心模块、设计准则、当前 canary SDK 的读写模式、metadata 选择、GraphQL 查询形状，以及账户、帖子、关注、群组、文件上传等示例代码。
---

# Lens Protocol 社交应用开发

你是一个熟悉 Lens Protocol 的社交产品开发助手。Lens 是构建在 Lens Chain 上的一组可组合社交 primitive，不要把它理解成单一“产品模板”；Account、Feed、Graph、Group、Username、App、Rules、Actions、Sponsorship 可以按产品边界重新组合。

## 先看哪里

按这个顺序读取，能最快进入状态：

1. 先看 `ref/metadata.md`，确认应该生成哪种 metadata。
2. 再看 `ref/graphql.md` 和 `ref/graphql-schema.graphql`，确认请求形状、分页和返回 union。
3. 读 `examples/client-setup.ts` 与 `examples/auth.ts`，确定客户端与登录模式。
4. 再按任务读取 `examples/account.ts`、`examples/post.ts`、`examples/social.ts`、`examples/storage.ts`。

## 核心模块

### 1. Account（账户）

- Account 是用户的链上智能合约身份，和 owner EOA 分离。
- Account 可以配置 Account Manager，让受托地址按权限代表账户执行操作。
- Account metadata 一般存储在 Grove，包含 `name`、`bio`、`picture`、`coverPicture`、`attributes` 等。
- Signless 是账户级能力，只有用户显式启用且当前 app/session 支持时，写操作才可能直接由 Lens 代发。

### 2. Feed（信息流）

- Feed 是帖子发布、分发和可见性规则的容器。
- 默认 Feed 适合快速起步，自定义 Feed 适合做隔离治理、专属排序或不同内容政策。
- Post 有 Root Post、Comment、Quote、Repost 四种核心关系。
- Post 的内容不直接塞进交易，而是先写成 metadata，再通过 `contentUri` 关联。
- Feed 可以挂 Feed Rules，Post 可以挂 Post Rules，Post/Account 还可以挂 Actions。

### 3. Graph（社交图谱）

- Graph 管理 follow/unfollow 关系。
- 默认 Graph 适合通用社交产品；自定义 Graph 适合做封闭网络、垂直社区或独立增长模型。
- Follow Rules 决定“谁能关注谁”，例如 token gate、付费关注或自定义合约校验。
- 常见读取是 `followers`、`following`、`followStatus`、`followersYouKnow`。

### 4. Group（群组）

- Group 是链上群组 primitive，支持创建、加入、离开、审批、封禁、移除成员。
- 每个 Group 都有一个关联 Feed，可用于群内内容流。
- Group Rules 管理入群条件，Membership Approval 和 Banning 控制治理。

### 5. Username / Namespace（用户名与命名空间）

- Username 是人类可读标识，展示值通常是 `namespace/localName`，例如 `lens/alice`。
- SDK 请求里不要把 username 当成单个字符串传入；通常使用 `{ localName, namespace? }` 结构。
- Username 可以单独创建，再 assign 到 Account；也可以在创建 Account 时一并创建。
- Namespace 用于控制用户名集合、规则和元数据，不应和 App/Graph/Feed 混为一层。

### 6. App（应用）

- App 是链上的应用配置单元，用来定义默认 Feed、Graph、Namespace、Sponsorship 等。
- 认证时通常需要提供 App 地址。
- 默认 App 适合快速起步；如果产品需要独立签名器、授权端点或 sponsorship 策略，应创建自己的 App。

### 7. Rules（规则系统）

- Rules 是可插拔合约模块，用来约束 primitive 的行为。
- 规则覆盖 Feed、Graph、Group、Namespace、Post、Follow 等场景。
- 规则集合一般分为 `required` 和 `anyOf` 两层。
- 验证结果可能是 `Passed`、`Failed`、`Unknown`；`Unknown` 通常表示需要链上或额外上下文检查。

### 8. Actions（操作系统）

- Actions 是可扩展的链上动作，可挂在 Post 或 Account 上。
- 内置动作包括 collect、tipping 等；未知 action 也可以通过 metadata 与参数描述接入。
- 做交互式内容、打赏、mint、付费行为时，优先考虑 action，而不是把逻辑硬塞进前端。

### 9. Sponsorship（赞助）

- Sponsorship 决定交易费用由谁承担。
- 写操作通常落入三种模式之一：`OperationResponse`、`SponsoredTransactionRequest`、`SelfFundedTransactionRequest`，失败前置校验则返回 `TransactionWillFail`。
- 不要把“默认 App/Feed/Graph”理解成“总会自动赞助”；实际模式取决于 app 配置、账户状态、signless 状态和当前操作。

### 10. Grove（存储）

- Grove 是 Lens 生态的存储层，常见资源通过 `lens://` URI 访问。
- metadata、图片、视频、文件夹清单都可以上传到 Grove。
- 所有内容默认可读，ACL 只控制谁能更新或删除资源。

## 设计准则

### 1. PublicClient / SessionClient 分层

- `PublicClient` 用于公开查询。
- `SessionClient` 用于认证后查询和写操作。
- 通过 `client.login()` 或 `client.resumeSession()` 获得 `SessionClient`。

### 2. Fragment-First 查询

- SDK 支持自定义 GraphQL fragment 来裁剪返回字段。
- 这既是性能优化手段，也是类型控制手段。
- 自定义 fragment 后，通过 `declare module "@lens-protocol/client"` 扩展返回类型。

### 3. 分清三类 API 风格

- `@lens-protocol/client/actions` 返回 `ResultAsync<T, E>`。
- `@lens-protocol/metadata` builder 是同步构造函数，输入不合法时会直接抛出校验错误。
- `@lens-chain/storage-client` 是 Promise API，声明上带 `@throws`，需要显式处理异常。

### 4. 交易生命周期

典型写操作流程：

1. 先构建 metadata。
2. 上传到 Grove，拿到 `lens://` URI。
3. 调用 `@lens-protocol/client/actions` 对应 mutation。
4. 用 `handleOperationWith(walletClient)` 统一处理 `OperationResponse`、`SponsoredTransactionRequest`、`SelfFundedTransactionRequest`。
5. 对返回的交易哈希调用 `sessionClient.waitForTransaction()`，等待 Lens API 索引确认。

### 5. Metadata-First 建模

- 账户资料、帖子内容、群组信息、应用信息、规则说明都优先通过 metadata 表达。
- 先决定 metadata 类型，再决定 mutation 参数，不要反过来猜。
- `$schema` 决定 metadata 语义，`lens` 节点保存实际数据。

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

当前示例里使用的 App 地址仅用于开发演示，不要硬编码进正式产品配置。

## 参考文件

- `examples/client-setup.ts`：客户端初始化、fragment、自定义返回类型
- `examples/auth.ts`：四种登录模式、会话恢复、切换账户、signless
- `examples/account.ts`：创建账户、查询账户、更新资料、manager、follow rules
- `examples/post.ts`：发帖、评论、引用、转发、编辑、删除、时间线、反应、书签
- `examples/social.ts`：关注、群组、通知、推荐流
- `examples/storage.ts`：Grove 上传、更新、删除、ACL、`lens://` 解析
- `ref/metadata.md`：metadata builder 与 schema 选择
- `ref/graphql.md`：高频 query/mutation、精确请求形状、返回 union
- `ref/graphql-schema.graphql`：精简版 GraphQL schema 快照，便于快速查输入输出名字
- `ref/actions.md`：当前 SDK action 函数清单

## 实操注意事项

1. 当前这套示例基于 `@lens-protocol/client` canary 版本编写，升级后先重新核对类型。
2. 非浏览器环境需要设置 `origin`。
3. 服务端场景通常需要 `apiKey`。
4. `lens://` 可通过 `StorageClient.resolve()` 转成可 fetch 的 HTTP 地址。
5. 分页是 cursor-based pagination，继续翻页时传 `pageInfo.next`。
6. username 请求、follow rules、post references 这类接口的参数结构比“看起来的字符串”更严格，优先参考 `ref/graphql.md` 里的准确形状。
