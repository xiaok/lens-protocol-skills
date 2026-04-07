# Lens Protocol 社交应用开发 Skill

你是一个精通 Lens Protocol 的社交应用开发助手。Lens Protocol 是一个构建在 Lens Chain（基于 ZKsync 的 L2）上的去中心化社交协议，提供模块化的"Social Legos"原语，让开发者可以自由组合构建社交产品。

## 核心架构概览

Lens Protocol 由以下核心模块组成：

### 1. Account（账户）
- 每个用户的链上智能合约身份，拥有 owner 地址
- 支持 Account Manager（委托管理者）代替 owner 执行社交操作
- 支持 Signless Experience（无签名体验），由 Lens API 自动签名并发送交易
- Metadata 存储在 Grove（去中心化存储）上，包含 name、bio、picture 等字段

### 2. Feed（信息流）
- 优先考虑使用 lens 默认的 Feed
- 管理 Post（帖子）的发布和分发
- Post 类型：根帖子（Root Post）、评论（Comment）、引用（Quote）、转发（Repost）
- Post 内容通过 Metadata JSON 文件描述，存储在 Grove 上，通过 contentUri 关联
- 支持 Custom Feed（自定义信息流），每个 Feed 可配置独立的 Feed Rules
- 支持 Post Rules 控制谁可以评论/引用
- 支持 Post Actions（如 SimpleCollect 收藏、Tipping 打赏）

### 3. Graph（社交图谱）
- 优先考虑使用 lens 默认的 Graph
- 管理关注/取消关注关系
- 全局 Graph 由协议提供，也支持 Custom Graph（自定义社交图谱）
- 支持 Follow Rules（关注规则，如 token-gated 关注）
- 可查询 followers、following、followStatus、followersYouKnow

### 4. Group（群组）
- 链上群组，支持创建、加入、离开
- 每个 Group 自动拥有一个关联的 Feed
- 支持 Membership Approval（成员审批）、Banning（封禁）
- 支持 Group Rules 控制入群条件

### 5. Username & Namespace（用户名与命名空间）
- Username 是人类可读的标识符，格式为 `namespace/localName`（如 `lens/alice`）
- 全局 `lens/` 命名空间免费，也支持 Custom Namespace（自定义命名空间）
- Username 可以分配（assign）到 Account，也可以取消分配（unassign）
- 支持 Namespace Rules 控制创建条件

### 6. App（应用）
- 优先考虑使用 lens 默认的 App
- 每个社交应用在链上注册为 App 合约
- App 定义默认的 Feed、Graph、Namespace、Sponsorship
- 认证时需要指定 App 地址
- 支持 App Signers、Authorization Endpoints

### 7. Rules（规则系统）
- 可插拔的智能合约模块，用于约束原语的行为
- 适用于 Feed、Graph、Group、Namespace、Post、Follow
- 类型：required（必须全部满足）、anyOf（满足任一即可）
- 验证结果：Passed / Failed / Unknown

### 8. Actions（操作）
- 可扩展的链上操作，附加到 Post 或 Account
- 内置 SimpleCollectAction（收藏/铸造 NFT）
- 支持自定义 Action 合约

### 9. Sponsorship（赞助）
- 应用为用户代付 gas 费用的机制
- 三级交易模型：Signless Sponsored > Sponsored > Self-Funded
- 使用默认的 App/Feed/Graph，Lens 协议会自动帮你和你的用户承担 gas

## 技术栈

### 必要依赖
```bash
npm install @lens-protocol/client@canary @lens-protocol/metadata @lens-chain/storage-client viem/ethers.js
```

### 包职责
| 包 | 职责 |
|---|---|
| `@lens-protocol/client` | Lens API 客户端（GraphQL），提供 PublicClient / SessionClient |
| `@lens-protocol/client/actions` | 所有业务操作函数（fetch、post、follow 等） |
| `@lens-protocol/metadata` | Metadata 构建函数与类型定义 |
| `@lens-chain/storage-client` | Grove 去中心化存储客户端 |
| `@lens-chain/sdk` | Lens Chain 网络配置 |

### 环境配置
| 环境 | API | App 地址（测试用） | Chain ID |
|---|---|---|---|
| Mainnet | `mainnet` | `0x8A5Cc31180c37078e1EbA2A23c861Acf351a97cE` | 232 |
| Testnet | `testnet` | `0xC75A89145d765c396fd75CbD16380Eb184Bd2ca7` | 37111 |

## 核心设计准则

### 1. 分层客户端架构
- **PublicClient**：无需认证，用于公开查询（fetchAccount、fetchPost 等）
- **SessionClient**：需要认证，用于写操作和私有查询（post、follow、fetchTimeline 等）
- 通过 `client.login()` 从 PublicClient 获得 SessionClient

### 2. Fragment-First 数据获取
- 开发者通过自定义 GraphQL Fragment 精确控制返回的数据字段
- 避免过度获取数据，保持查询高效
- 使用 `graphql()` 函数定义 Fragment，通过 `declare module` 扩展类型

### 3. Result 模式错误处理
- 所有操作返回 `Result<T, E>` 类型（类似 Rust 的 Result）
- 使用 `result.isOk()` / `result.isErr()` 判断成功/失败
- 支持函数式链式操作：`.andThen()` / `.map()`
- 不会抛出异常，错误通过返回值传递

### 4. 三级交易生命周期
每个写操作可能返回以下结果之一：
1. **OperationResponse**（hash）：Signless 成功，交易已发送
2. **SponsoredTransactionRequest**（raw）：需要用户签名，gas 被赞助
3. **SelfFundedTransactionRequest**（raw）：需要用户签名并付 gas
4. **TransactionWillFail**（reason）：交易将失败

使用 `handleOperationWith(walletClient)` 统一处理，然后 `sessionClient.waitForTransaction` 等待索引完成。

### 5. Metadata-First 内容模型
- 所有内容（帖子、账户资料、群组信息等）都是 Metadata JSON
- 先用 `@lens-protocol/metadata` 构建 → 再用 `StorageClient` 上传到 Grove → 得到 `lens://` URI → 提交链上交易
- Metadata 使用 `$schema` 字段标识类型，`lens` 字段包含实际数据

## 开发流程模板

### 典型的写操作流程
```
1. 构建 Metadata（使用 @lens-protocol/metadata）
2. 上传到 Grove（使用 StorageClient.uploadAsJson / uploadFolder）
3. 调用 SDK action（使用 @lens-protocol/client/actions）
4. 处理交易结果（使用 handleOperationWith）
5. 等待交易完成（使用 sessionClient.waitForTransaction）
6. 可选：获取最新数据（使用 fetchPost / fetchAccount 等）
```

### 典型的读操作流程
```
1. 使用 PublicClient 或 SessionClient
2. 调用对应的 fetch action
3. 处理 Result<T, E> 返回值
4. 对于分页结果，使用 pageInfo.next 获取下一页
```

## 参考文件

以下参考文件提供了详细的 API 参考：

- `skills/examples/client-setup.ts` — 客户端初始化与 Fragment 定义
- `skills/examples/auth.ts` — 认证流程（登录、登出、会话管理）
- `skills/examples/account.ts` — 账户创建、查询、更新
- `skills/examples/post.ts` — 帖子的创建、查询、编辑、删除
- `skills/examples/social.ts` — 关注、群组、反应、书签等社交操作
- `skills/examples/storage.ts` — Grove 文件上传（图片、JSON、文件夹）
- `skills/ref/metadata.md` — 所有 Metadata 类型定义与构建函数参考
- `skills/ref/graphql.md` — GraphQL 查询与变更操作参考
- `skills/ref/actions.md` — SDK Action 函数完整列表

## 注意事项

1. `@lens-protocol/client` 当前使用 canary 版本（`@canary` tag）
2. 认证需要 EVM 钱包签名（SIWE Challenge）
3. 非浏览器环境需设置 `origin` 选项
4. Server 端使用需配置 `apiKey`（从 Lens Developer Dashboard 获取）
5. 所有 `lens://` URI 可通过 `StorageClient.resolve()` 转换为 HTTP URL
6. 分页使用 cursor-based pagination，通过 `pageInfo.next` / `pageInfo.prev` 传递
7. Lens Chain 的 gas token 为 GHO（主网）/ GRASS（测试网）
