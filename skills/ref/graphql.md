# GraphQL Operations Reference

`@lens-protocol/graphql` — All queries, mutations, and key fragments.

Many write mutations return a union such as `SuccessResponse | SponsoredTransactionRequest | SelfFundedTransactionRequest | TransactionWillFail | [DomainError]`. Some lighter mutations instead return `void` or a small response object.

Paginated queries return `{ items: T[], pageInfo: { prev: Cursor | null, next: Cursor | null } }`.

Read this file together with `graphql-schema.graphql`:

- `graphql.md` tells you which operation names matter and what their requests look like.
- `graphql-schema.graphql` gives a compact SDL-style snapshot for common Lens operations.

---

## Exact Request Shapes You Will Actually Need

These are the places where agents most often guess wrong.

### Account lookup by username

```ts
fetchAccount(client, {
  username: {
    localName: "alice",
    // namespace?: evmAddress("0x...")
  },
})
```

Do not pass `"lens/alice"` as a single string to `fetchAccount`.

### Create account with username

```ts
createAccountWithUsername(sessionClient, {
  username: {
    localName: "alice",
    // namespace?: evmAddress("0x...")
  },
  metadataUri: "lens://...",
  // owner?: evmAddress("0x...")
  // accountManager?: [evmAddress("0x...")]
  // enableSignless?: true
})
```

### Followers you know

```ts
fetchFollowersYouKnow(client, {
  observer: evmAddress("0xMY_ACCOUNT"),
  target: evmAddress("0xTARGET_ACCOUNT"),
  // filter?: { graphs: [{ globalGraph: true }] }
})
```

The field name is `target`, not `account`.

### Post references

```ts
fetchPostReferences(client, {
  referencedPost: "42",
  referenceTypes: ["COMMENT"],
  // relevancyFilter?: ...
  // visibilityFilter?: ...
})
```

`referenceTypes` is required.

### Update account follow rules

```ts
updateAccountFollowRules(sessionClient, {
  toAdd: {
    required: [
      {
        tokenGatedRule: {
          token: {
            currency: evmAddress("0xTOKEN"),
            value: "1",
            standard: "ERC20",
          },
        },
      },
    ],
    anyOf: [],
  },
  toRemove: [],
  // graph?: evmAddress("0xCUSTOM_GRAPH")
})
```

Current SDK shape is nested under `required` / `anyOf`; it is not a flat `{ address, configData }[]`.

---

## Account Operations

### Queries
| Name | Description |
|------|-------------|
| `AccountQuery` | Fetch single account (by address or username) |
| `AccountsQuery` | Fetch accounts (paginated, with filters) |
| `AccountsBulkQuery` | Fetch multiple accounts by address list |
| `AccountStatsQuery` | Combined feed + graph stats |
| `AccountFeedsStatsQuery` | Feed stats: posts, comments, reposts, quotes, reactions, collects, tips |
| `AccountGraphsStatsQuery` | Graph stats: followers, following |
| `AccountsAvailableQuery` | Accounts available to authenticated user (owned + managed) |
| `AccountsBlockedQuery` | Blocked accounts list |
| `AccountManagersQuery` | Account managers list |
| `AccountBalancesQuery` | ERC20 and native token balances |
| `LastLoggedInAccountQuery` | Last login for an address |
| `MeQuery` | Authenticated user info (signless, sponsored, limits) |

### Mutations
| Name | Description |
|------|-------------|
| `SetAccountMetadataMutation` | Update account metadata URI |
| `CreateAccountWithUsernameMutation` | Create account + username |
| `MuteAccountMutation` / `UnmuteAccountMutation` | Mute/unmute |
| `BlockMutation` / `UnblockMutation` | Block/unblock |
| `ReportAccountMutation` | Report account |
| `RecommendAccountMutation` / `UndoRecommendAccountMutation` | Recommend |
| `UpdateAccountFollowRulesMutation` | Update follow rules |
| `AddAccountManagerMutation` / `RemoveAccountManagerMutation` | Manage managers |
| `UpdateAccountManagerMutation` | Update manager permissions |
| `HideManagedAccountMutation` / `UnhideManagedAccountMutation` | Hide/show managed |
| `EnableSignlessMutation` / `RemoveSignlessMutation` | Signless mode |

### Account Action Mutations
| Name | Description |
|------|-------------|
| `ConfigureAccountActionMutation` | Configure an account action |
| `EnableAccountActionMutation` / `DisableAccountActionMutation` | Enable/disable |
| `ExecuteAccountActionMutation` | Execute action (e.g. tipping) |

### Key Fragments
- `AccountFragment` — address, owner, score, username, metadata, operations, rules, actions
- `AccountMetadataFragment` — name, bio, picture, coverPicture, attributes
- `AccountManagerFragment` — manager address, permissions, isLensManager
- `LoggedInAccountOperationsFragment` — isFollowedByMe, isFollowingMe, isMutedByMe, isBlockedByMe, canFollow, etc.

---

## Post Operations

### Queries
| Name | Description |
|------|-------------|
| `PostQuery` | Fetch single post (returns Post or Repost) |
| `PostsQuery` | Fetch posts (paginated, with filters) |
| `PostReactionsQuery` | Who reacted to a post |
| `PostBookmarksQuery` | Bookmarked posts |
| `PostReferencesQuery` | Comments/quotes of a post |
| `PostTagsQuery` | Tags with counts |
| `PostReactionStatusQuery` | Check reaction status |
| `PostEditsQuery` | Edit history |
| `WhoReferencedPostQuery` | Who commented/quoted |
| `WhoExecutedActionOnPostQuery` | Who collected/tipped |

### Mutations
| Name | Description |
|------|-------------|
| `PostMutation` | Create post |
| `RepostMutation` | Repost |
| `EditPostMutation` | Edit post |
| `DeletePostMutation` | Delete post |
| `AddReactionMutation` / `UndoReactionMutation` | React (UPVOTE/DOWNVOTE) |
| `BookmarkPostMutation` / `UndoBookmarkPostMutation` | Bookmark |
| `HideReplyMutation` / `UnhideReplyMutation` | Hide/show replies |
| `ReportPostMutation` | Report post |
| `UpdatePostRulesMutation` | Update post rules |

### Post Action Mutations
| Name | Description |
|------|-------------|
| `ConfigurePostActionMutation` | Configure post action (e.g. collect params) |
| `EnablePostActionMutation` / `DisablePostActionMutation` | Enable/disable |
| `ExecutePostActionMutation` | Execute action (e.g. collect, tip) |

### Key Fragments
- `PostFragment` — id, slug, author, contentUri, metadata, stats, actions, rules, operations, root, quoteOf, commentOn
- `RepostFragment` — id, slug, author, repostOf
- `AnyPostFragment` — Union: Post | Repost
- `PostStatsFragment` — bookmarks, collects, comments, quotes, upvotes, downvotes, reposts, tips
- `LoggedInPostOperationsFragment` — canComment, canEdit, canDelete, hasBookmarked, hasUpvoted, etc.

### Post Metadata Fragments (16 content types)
`ArticleMetadataFragment`, `AudioMetadataFragment`, `TextOnlyMetadataFragment`, `CheckingInMetadataFragment`, `ImageMetadataFragment`, `VideoMetadataFragment`, `EmbedMetadataFragment`, `EventMetadataFragment`, `LinkMetadataFragment`, `LivestreamMetadataFragment`, `MintMetadataFragment`, `SpaceMetadataFragment`, `StoryMetadataFragment`, `ThreeDMetadataFragment`, `TransactionMetadataFragment`, `UnknownPostMetadataFragment`

### Post Action Fragments
- `SimpleCollectActionFragment` — payToCollect config, collectLimit, followerOnGraph, endsAt
- `UnknownPostActionFragment` — custom action with config/metadata
- `PayToCollectConfigFragment` — ERC20 amount, recipients, referral share

---

## Feed / Timeline Operations

### Queries
| Name | Description |
|------|-------------|
| `TimelineQuery` | User's timeline (returns TimelineItem[]) |
| `TimelineHighlightsQuery` | Highlighted timeline posts |
| `FeedQuery` | Single feed details |
| `FeedsQuery` | Multiple feeds |

### Mutations
| Name | Description |
|------|-------------|
| `CreateFeedMutation` | Create feed (self-funded) |
| `SetFeedMetadataMutation` | Update feed metadata |
| `UpdateFeedRulesMutation` | Update feed rules |

### Key Fragments
- `TimelineItemFragment` — id, primary (Post), comments[], reposts[]
- `FeedFragment` — address, metadata, owner, rules
- `PostForYouFragment` — Post with ML source attribution

---

## Social Graph Operations

### Follow
| Name | Description |
|------|-------------|
| `FollowersQuery` | List followers |
| `FollowingQuery` | List following |
| `FollowersYouKnowQuery` | Mutual followers |
| `FollowStatusQuery` | Check follow status |
| `FollowMutation` | Follow account |
| `UnfollowMutation` | Unfollow account |

### Graph
| Name | Description |
|------|-------------|
| `GraphQuery` / `GraphsQuery` | Fetch graph(s) |
| `CreateGraphMutation` | Create graph (self-funded) |
| `SetGraphMetadataMutation` | Update metadata |
| `UpdateGraphRulesMutation` | Update rules |

### Group
| Name | Description |
|------|-------------|
| `GroupQuery` / `GroupsQuery` | Fetch group(s) |
| `GroupMembersQuery` | List members |
| `GroupStatsQuery` | Member count |
| `GroupMembershipRequestsQuery` | Pending requests |
| `GroupBannedAccountsQuery` | Banned accounts |
| `CreateGroupMutation` | Create group |
| `SetGroupMetadataMutation` | Update metadata |
| `JoinGroupMutation` / `LeaveGroupMutation` | Join/leave |
| `RequestGroupMembershipMutation` | Request membership |
| `CancelGroupMembershipRequestMutation` | Cancel request |
| `ApproveGroupMembershipRequestsMutation` | Approve (admin) |
| `RejectGroupMembershipRequestsMutation` | Reject (admin) |
| `RemoveGroupMembersMutation` | Remove members |
| `BanGroupAccountsMutation` / `UnbanGroupAccountsMutation` | Ban/unban |
| `UpdateGroupRulesMutation` | Update rules |

### Key Fragments
- `FollowerFragment` — follower account, followedOn
- `FollowingFragment` — following account, followedOn
- `GraphFragment` — address, owner, metadata, rules
- `GroupFragment` — address, feed, owner, metadata, rules, banningEnabled, membershipApprovalEnabled
- `GroupMemberFragment` — account, joinedAt, lastActiveAt
- `LoggedInGroupOperationsFragment` — canJoin, canLeave, isMember, isBanned

---

## Notification Operations

### Queries
| Name | Description |
|------|-------------|
| `NotificationsQuery` | Fetch notifications (paginated) |

### Notification Fragments
- `FollowNotificationFragment` — followers[]
- `ReactionNotificationFragment` — reactions[], post
- `CommentNotificationFragment` — comment
- `RepostNotificationFragment` — reposts[], post
- `QuoteNotificationFragment` — quote
- `MentionNotificationFragment` — post
- `AccountActionExecutedNotificationFragment` — tipping/unknown actions
- `PostActionExecutedNotificationFragment` — collect/tipping/unknown actions
- `GroupMembershipRequestApprovedNotificationFragment`
- `GroupMembershipRequestRejectedNotificationFragment`

---

## App / Namespace Operations

### App
| Name | Description |
|------|-------------|
| `AppQuery` / `AppsQuery` | Fetch app(s) |
| `AppFeedsQuery` / `AppGroupsQuery` | App's feeds/groups |
| `AppSignersQuery` / `AppUsersQuery` | App's signers/users |
| `CreateAppMutation` | Create app (self-funded) |
| `SetAppMetadataMutation` | Update metadata |
| `SetAppGraphMutation` / `SetDefaultAppFeedMutation` | Set graph/feed |
| `SetAppSponsorshipMutation` / `SetAppTreasuryMutation` | Set sponsorship/treasury |
| `SetAppUsernameNamespaceMutation` | Set namespace |
| `AddAppFeedsMutation` / `RemoveAppFeedsMutation` | Manage feeds |
| `AddAppGroupsMutation` / `RemoveAppGroupsMutation` | Manage groups |
| `AddAppSignersMutation` / `RemoveAppSignersMutation` | Manage signers |

### Namespace / Username
| Name | Description |
|------|-------------|
| `NamespaceQuery` / `NamespacesQuery` | Fetch namespace(s) |
| `UsernameQuery` / `UsernamesQuery` | Fetch username(s) |
| `CanCreateUsernameQuery` | Validate username creation |
| `CreateUsernameNamespaceMutation` | Create namespace |
| `CreateUsernameMutation` | Mint username |
| `AssignUsernameToAccountMutation` | Assign to account |
| `UnassignUsernameFromAccountMutation` | Unassign |
| `SetNamespaceMetadataMutation` | Update metadata |
| `UpdateNamespaceRulesMutation` | Update rules |

---

## Transaction Operations

| Name | Description |
|------|-------------|
| `TransactionStatusQuery` | Poll status: Pending, Finished, Failed, NotIndexedYet |

### Financial Mutations
| Name | Description |
|------|-------------|
| `WithdrawMutation` / `DepositMutation` | Withdraw/deposit tokens |
| `WrapTokensMutation` / `UnwrapTokensMutation` | Wrap/unwrap native tokens |
| `TransferPrimitiveOwnershipMutation` | Transfer ownership |

---

## Sponsorship Operations

| Name | Description |
|------|-------------|
| `SponsorshipsQuery` / `SponsorshipQuery` | Fetch sponsorship(s) |
| `SponsorshipGrantsQuery` / `SponsorshipSignerQuery` | Grants/signers |
| `CreateSponsorshipMutation` | Create sponsorship |
| `SetSponsorshipMetadataMutation` | Update metadata |
| `UpdateSponsorshipLimitsMutation` | Update rate limits |
| `PauseSponsorshipMutation` / `UnpauseSponsorshipMutation` | Pause/unpause |

---

## Authentication Operations

| Name | Description |
|------|-------------|
| `CurrentSessionQuery` | Current session details |
| `AuthenticatedSessionsQuery` | All sessions |
| `ChallengeMutation` | Generate SIWE challenge |
| `AuthenticateMutation` | Submit signed challenge |
| `RefreshMutation` | Refresh tokens |
| `SwitchAccountMutation` | Switch account |
| `RevokeAuthenticationMutation` | Revoke session |

### Key Fragments
- `AuthenticationTokensFragment` — accessToken, refreshToken, idToken
- `MeResultFragment` — appLoggedIn, isSignless, isSponsored, limits

---

## Admin Operations

| Name | Description |
|------|-------------|
| `AdminsForQuery` | List admins for a primitive |
| `AddAdminsMutation` / `RemoveAdminsMutation` | Add/remove admins |

---

## ML / Discovery Operations

| Name | Description |
|------|-------------|
| `MlAccountRecommendationsQuery` | ML account recommendations |
| `MlPostsForYouQuery` | ML "For You" feed |
| `MlPostsExploreQuery` | ML explore/discovery |
| `MlDismissRecommendedAccountsMutation` | Dismiss recommendations |
| `AddPostNotInterestedMutation` / `UndoPostNotInterestedMutation` | Not interested signal |

---

## Frames / SNS Operations

| Name | Description |
|------|-------------|
| `CreateFrameTypedDataQuery` | Frame EIP-712 typed data |
| `VerifyFrameSignatureQuery` | Verify frame signature |
| `SignFrameActionMutation` | Sign frame action |
| `GetSnsSubscriptionsQuery` | Get webhook subscriptions |
| `CreateSnsSubscriptionsMutation` / `DeleteSnsSubscriptionMutation` | Manage webhooks |

---

## Common Patterns

### Mutation Result Union

```
SuccessResponse                    — hash: TxHash (signless success)
| SponsoredTransactionRequest      — EIP-712 tx (gas sponsored)
| SelfFundedTransactionRequest     — EIP-1559 tx (user pays gas)
| TransactionWillFail              — reason string (pre-flight failure)
| [DomainError]                    — e.g. UsernameTaken, InsufficientFunds
```

### Pagination

```ts
// Request
{ cursor?: Cursor, pageSize?: PageSize, ... }

// Response
{
  items: T[],
  pageInfo: {
    prev: Cursor | null,
    next: Cursor | null,
  }
}
```

### Rules System

All primitives share consistent rule structure:

```ts
{
  required: Rule[],   // ALL must pass
  anyOf: Rule[],      // at least ONE must pass
}
// Each Rule: { id, type, address, executesOn, config: AnyKeyValue[] }
// Validation: Passed | Failed | Unknown
```

### Key Enums

| Enum | Values |
|------|--------|
| `Role` | ACCOUNT_OWNER, ACCOUNT_MANAGER, ONBOARDING_USER, BUILDER |
| `PostReactionType` | UPVOTE, DOWNVOTE |
| `EntityType` | ACCOUNT, GRAPH, FEED, USERNAME_NAMESPACE, GROUP, POST, APP, SPONSORSHIP, ... |

### Media Fragments

- `MediaImageFragment` — item, type, altTag, license, width, height
- `MediaVideoFragment` — item, type, cover, duration, altTag, license
- `MediaAudioFragment` — item, type, cover, duration, artist, genre, kind, lyrics, ...
- `Erc20Fragment` — name, symbol, decimals, contract
- `NetworkAddressFragment` — address, chainId
