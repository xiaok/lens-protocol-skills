# Lens Protocol Skills

![Lens Protocol Skills](./banner.png)

为 AI Agent 打造的 Lens Protocol 社交应用知识库 & 代码技能包。

> [English](./README.md) | [日本語版](./README.ja.md)

## 这是什么？

一个**结构化的 AI Agent 知识库**，为 Cursor、opencode、Claude 等 AI 编程助手提供在 Lens Protocol 生态上构建社交应用所需的全部知识和代码示例。Agent 无需翻阅散落的文档，只需引用这个集中的技能包，即可生成可直接运行的社交应用代码。

## 你可以构建什么？

基于 Lens Protocol 去中心化社交基础设施，你可以快速搭建各类社交应用：

- **个人博客/Newsletter** — 去中心化发布，内容归你所有
- **微博/Microblog 系统** — 类似 X（Twitter）的体验，完全去中心化
- **小众论坛/社区** — 专属话题、自定义治理规则
- **社交信息流** — 个性化推荐、自定义算法
- **群组社交网络** — 公开或私密群组
- **更多想象力** — Lens 的可组合架构几乎可以支持任何社交场景

## 为什么选择 Lens？

- **去中心化** — 用户拥有自己的身份、内容和社交关系图谱。换个应用，数据跟着走
- **免费使用** — 从发帖到存文件，全部由 Lens API 赞助买单。Gas 费、图片上传、视频托管，用户全程零成本
- **安全可靠** — 基于 Lens Chain（ZKsync L2），继承了以太坊级别的安全性
- **可组合** — Account、Feed、Graph、Group、Rules 就像积木一样自由组合

## 项目结构

```
├── skills/
│   ├── SKILL.md                 # 核心技能定义 & 设计准则
│   ├── examples/
│   │   ├── client-setup.ts      # SDK 初始化 & 自定义 Fragment
│   │   ├── auth.ts              # 认证流程（4 种登录模式）
│   │   ├── account.ts           # 账户 CRUD、Manager、拉黑/静音
│   │   ├── post.ts              # 发帖、评论、引用、转发、反应
│   │   ├── content-read.ts      # Feed 读取、分页、视图模型映射
│   │   ├── social.ts            # 关注、群组、通知、推荐
│   │   └── storage.ts           # Grove 去中心化存储操作
│   └── ref/
│       ├── actions.md           # SDK 操作函数清单
│       ├── graphql.md           # GraphQL 查询/变更模式
│       ├── graphql-schema.graphql # Schema 快照
│       └── metadata.md          # Metadata 构建器 & Schema 选择
├── README.ja.md                 # 日文版
├── README.md                    # 英文版
├── llms.txt                     # 压缩后的全量知识库
└── package.json
```

## 核心模块

| 模块 | 说明 |
|------|------|
| **Account（账户）** | 链上身份，包含资料（姓名、简介、头像）、账户管理器、拉黑/静音 |
| **Feed（信息流）** | 内容发布与分发，支持文本/图片/文章/视频多种类型 |
| **Graph（社交图谱）** | 关注/取关关系，粉丝列表、关注列表、共同好友 |
| **Group（群组）** | 链上群组，支持成员管理、审批流程、封禁 |
| **Username（用户名）** | 人类可读标识符，格式 `namespace/localName` |
| **App（应用）** | 应用配置单元，定义默认 Feed、Graph、赞助策略 |
| **Rules（规则系统）** | 可插拔模块，约束 Feed、Graph、群组、帖子行为 |
| **Actions（操作系统）** | 可扩展的链上动作，如打赏、收集等 |
| **Sponsorship（赞助）** | Gas 费赞助机制，让用户无感交易 |
| **Grove（存储）** | 去中心化存储层，存 metadata、图片、视频 |

## 安装使用

向你的 AI 编程助手（Cursor、opencode、Claude 等）说：

> 安装 Lens Protocol Skills 知识库，地址：<https://github.com/xiaok/lens-protocol-skills>

Agent 会自动加载 `skills/` 目录下的全部内容，然后你就可以让它帮你写 Lens 社交应用代码了。

### 试试这些指令

| 指令 | 效果 |
|------|------|
| `写一篇帖子并在 Lens 发布` | 生成发帖完整流程 |
| `上传一张图片并给我链接` | 生成 Grove 上传代码 |
| `帮我做一个个人博客` | 生成完整个人博客应用 |
| `帮我做一个游戏论坛，使用 Privy 登录，有完善的用户界面，帖子列表/发帖/回复/按标签组织的分组功能，UI 使用杀戮尖塔的游戏元素，能够吸引游戏玩家` | 生成完整的游戏社区应用 |

## 环境信息

| 环境 | Chain ID | Gas Token | SDK 环境值 |
|------|----------|-----------|-----------|
| 主网 | 232 | GHO | `mainnet` |
| 测试网 | 37111 | GRASS | `testnet` |

## 许可协议

MIT
