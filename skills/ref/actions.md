# SDK Action Functions Reference

Quick lookup for the 181 exported functions in `@lens-protocol/client/actions`.

**Convention**: query functions accept `AnyClient` (PublicClient or SessionClient), while mutation functions require `SessionClient`. Functions return `ResultAsync<T, E>`.

**Type abbreviations**: `UE` = UnexpectedError, `UAE` = UnauthenticatedError.

---

## Account (26 functions)

### Queries
| Function | Client | Return | Description |
|----------|--------|--------|-------------|
| `fetchAccount(client, request)` | Any | `Account \| null` | Fetch by address or username |
| `fetchAccounts(client, request?)` | Any | `Paginated<Account>` | Paginated accounts |
| `fetchAccountsBulk(client, request?)` | Any | `Account[]` | Bulk fetch by addresses |
| `fetchAccountStats(client, request)` | Any | `AccountStats \| null` | Combined stats |
| `fetchAccountFeedStats(client, request)` | Any | `AccountFeedsStats \| null` | Feed stats |
| `fetchAccountGraphStats(client, request)` | Any | `AccountGraphsFollowStats \| null` | Follow stats |
| `fetchAccountsAvailable(client, request)` | Any | `Paginated<AccountAvailable>` | Owned + managed accounts |
| `fetchAccountsBlocked(client, request?)` | Session | `Paginated<AccountBlocked>` | Blocked accounts |
| `fetchAccountManagers(client, request?)` | Session | `Paginated<AccountManager>` | Account managers |

### Mutations
| Function | Return | Description |
|----------|--------|-------------|
| `createAccountWithUsername(client, request)` | `CreateAccountWithUsernameResult` | Create account + username |
| `setAccountMetadata(client, request)` | `SetAccountMetadataResult` | Update metadata URI |
| `enableSignless(client)` | `EnableSignlessResult` | Enable signless mode |
| `removeSignless(client)` | `RemoveSignlessResult` | Disable signless mode |
| `muteAccount(client, request)` | `void` | Mute account (off-chain) |
| `unmuteAccount(client, request)` | `void` | Unmute account |
| `reportAccount(client, request)` | `void` | Report account |
| `blockAccount(client, request)` | `BlockResult` | Block account (on-chain) |
| `unblockAccount(client, request)` | `UnblockResult` | Unblock account |
| `recommendAccount(client, request)` | `void` | Recommend account |
| `undoRecommendAccount(client, request)` | `void` | Undo recommendation |
| `updateAccountFollowRules(client, request)` | `UpdateAccountFollowRulesResult` | Update follow rules |
| `addAccountManager(client, request)` | `AddAccountManagerResult` | Add manager |
| `removeAccountManager(client, request)` | `RemoveAccountManagerResult` | Remove manager |
| `updateAccountManager(client, request)` | `UpdateAccountManagerResult` | Update permissions |
| `hideManagedAccount(client, request)` | `void` | Hide managed account |
| `unhideManagedAccount(client, request)` | `void` | Unhide managed account |

---

## Post (24 functions)

### Queries
| Function | Client | Return | Description |
|----------|--------|--------|-------------|
| `fetchPost(client, request)` | Any | `AnyPost \| null` | Fetch single post |
| `fetchPosts(client, request)` | Any | `Paginated<AnyPost>` | Paginated posts |
| `fetchPostReactions(client, request)` | Any | `Paginated<AccountPostReaction>` | Who reacted |
| `fetchPostBookmarks(client, request?)` | Session | `Paginated<AnyPost>` | Bookmarked posts |
| `fetchPostReferences(client, request)` | Any | `Paginated<AnyPost>` | Comments/quotes |
| `fetchPostTags(client, request)` | Any | `Paginated<PostTag>` | Tags with counts |
| `fetchPostReactionStatus(client, request)` | Any | `PostReactionStatus[]` | Reaction status |
| `fetchPostEdits(client, request)` | Any | `Paginated<PostEdit>` | Edit history |
| `fetchPostActionContracts(client, request?)` | Any | `Paginated<PostActionContract>` | Action contracts |
| `fetchWhoReferencedPost(client, request)` | Any | `Paginated<Account>` | Who commented/quoted |
| `fetchWhoExecutedActionOnPost(client, request)` | Any | `Paginated<PostExecutedActions>` | Who collected/tipped |
| `fetchWhoExecutedActionOnAccount(client, request)` | Any | `Paginated<AccountExecutedActions>` | Who actioned account |

### Mutations
| Function | Return | Description |
|----------|--------|-------------|
| `post(client, request)` | `PostResult` | Create post |
| `repost(client, request)` | `PostResult` | Repost |
| `editPost(client, request)` | `PostResult` | Edit post |
| `deletePost(client, request)` | `DeletePostResult` | Delete post |
| `updatePostRules(client, request)` | `UpdatePostRulesResult` | Update rules |
| `addReaction(client, request)` | `AddReactionResult` | Upvote/downvote |
| `undoReaction(client, request)` | `UndoReactionResult` | Remove reaction |
| `bookmarkPost(client, request)` | `void` | Bookmark |
| `undoBookmarkPost(client, request)` | `void` | Remove bookmark |
| `hideReply(client, request)` | `void` | Hide reply |
| `unhideReply(client, request)` | `void` | Unhide reply |
| `reportPost(client, request)` | `void` | Report post |

---

## Post & Account Actions (8 functions)

| Function | Return | Description |
|----------|--------|-------------|
| `configurePostAction(client, request)` | `ConfigurePostActionResult` | Configure post action |
| `enablePostAction(client, request)` | `EnablePostActionResult` | Enable post action |
| `disablePostAction(client, request)` | `DisablePostActionResult` | Disable post action |
| `executePostAction(client, request)` | `ExecutePostActionResult` | Execute (collect, tip) |
| `configureAccountAction(client, request)` | `ConfigureAccountActionResult` | Configure account action |
| `enableAccountAction(client, request)` | `EnableAccountActionResult` | Enable account action |
| `disableAccountAction(client, request)` | `DisableAccountActionResult` | Disable account action |
| `executeAccountAction(client, request)` | `ExecuteAccountActionResult` | Execute (tipping) |

---

## Follow (6 functions)

| Function | Client | Return | Description |
|----------|--------|--------|-------------|
| `follow(client, request)` | Session | `FollowResult` | Follow account |
| `unfollow(client, request)` | Session | `UnfollowResult` | Unfollow account |
| `fetchFollowers(client, request)` | Any | `Paginated<Follower>` | List followers |
| `fetchFollowing(client, request)` | Any | `Paginated<Following>` | List following |
| `fetchFollowersYouKnow(client, request)` | Any | `Paginated<Follower>` | Mutual followers |
| `fetchFollowStatus(client, request)` | Any | `FollowStatusResult[]` | Check follow status |

---

## Group (18 functions)

### Queries
| Function | Client | Return | Description |
|----------|--------|--------|-------------|
| `fetchGroup(client, request)` | Any | `Group \| null` | Fetch group |
| `fetchGroups(client, request?)` | Any | `Paginated<Group>` | List groups |
| `fetchGroupMembers(client, request)` | Any | `Paginated<GroupMember>` | List members |
| `fetchGroupStats(client, request)` | Any | `GroupStatsResponse \| null` | Member count |
| `fetchGroupBannedAccounts(client, request)` | Any | `Paginated<GroupBannedAccount>` | Banned list |
| `fetchGroupMembershipRequests(client, request)` | Session | `Paginated<GroupMembershipRequest>` | Pending requests |

### Mutations
| Function | Return | Description |
|----------|--------|-------------|
| `createGroup(client, request)` | `CreateGroupResult` | Create group |
| `setGroupMetadata(client, request)` | `SetGroupMetadataResult` | Update metadata |
| `joinGroup(client, request)` | `JoinGroupResult` | Join group |
| `leaveGroup(client, request)` | `LeaveGroupResult` | Leave group |
| `updateGroupRules(client, request)` | `UpdateGroupRulesResult` | Update rules |
| `requestGroupMembership(client, request)` | `RequestGroupMembershipResult` | Request to join |
| `cancelGroupMembershipRequest(client, request)` | `CancelGroupMembershipRequestResult` | Cancel request |
| `approveGroupMembershipRequests(client, request)` | `ApproveGroupMembershipResult` | Approve (admin) |
| `rejectGroupMembershipRequests(client, request)` | `RejectGroupMembershipResult` | Reject (admin) |
| `removeGroupMembers(client, request)` | `RemoveGroupMembersResult` | Remove members |
| `banGroupAccounts(client, request)` | `BanGroupAccountsResult` | Ban accounts |
| `unbanGroupAccounts(client, request)` | `UnbanGroupAccountsResult` | Unban accounts |

---

## Feed / Timeline (7 functions)

| Function | Client | Return | Description |
|----------|--------|--------|-------------|
| `fetchFeed(client, request)` | Any | `Feed \| null` | Fetch feed |
| `fetchFeeds(client, request)` | Any | `Paginated<Feed>` | List feeds |
| `fetchTimeline(client, request)` | Any | `Paginated<TimelineItem>` | User timeline |
| `fetchTimelineHighlights(client, request)` | Any | `Paginated<AnyPost>` | Timeline highlights |
| `createFeed(client, request)` | Session | `CreateFeedResult` | Create feed |
| `setFeedMetadata(client, request)` | Session | `SetFeedMetadataResult` | Update metadata |
| `updateFeedRules(client, request)` | Session | `UpdateFeedRulesResult` | Update rules |

---

## Notification (1 function)

| Function | Client | Return | Description |
|----------|--------|--------|-------------|
| `fetchNotifications(client, request?)` | Session | `Paginated<Notification>` | Fetch notifications |

---

## Authentication / Session (8 functions)

| Function | Client | Return | Description |
|----------|--------|--------|-------------|
| `currentSession(client)` | Session | `AuthenticatedSession` | Current session info |
| `fetchAuthenticatedSessions(client, request?)` | Session | `Paginated<AuthenticatedSession>` | All sessions |
| `fetchMeDetails(client)` | Session | `MeResult` | Signless, sponsored, limits |
| `lastLoggedInAccount(client, request)` | Any | `Account \| null` | Last login for address |
| `revokeAuthentication(client, request)` | Session | `void` | Revoke session |
| `switchAccount(client, request)` | Session | `SwitchAccountResult` | Switch account |
| `refresh(client, request)` | Any | `RefreshResult` | Refresh tokens |
| `legacyRolloverRefresh(client, request)` | Session | `RefreshResult` | v2→v3 migration |

---

## App (22 functions)

### Queries
| Function | Client | Return | Description |
|----------|--------|--------|-------------|
| `fetchApp(client, request)` | Any | `App \| null` | Fetch app |
| `fetchApps(client, request)` | Any | `Paginated<App>` | List apps |
| `fetchAppGroups(client, request)` | Any | `Paginated<Group>` | App's groups |
| `fetchAppFeeds(client, request)` | Any | `Paginated<AppFeed>` | App's feeds |
| `fetchAppSigners(client, request)` | Any | `Paginated<AppSigner>` | App's signers |
| `fetchAppUsers(client, request)` | Any | `Paginated<AppUser> \| null` | App's users |
| `fetchAppServerAPiKey(client, request)` | Session | `string \| null` | Server API key |

### Mutations
| Function | Return | Description |
|----------|--------|-------------|
| `createApp(client, request)` | `CreateAppResult` | Create app |
| `setAppMetadata(client, request)` | `SetAppMetadataResult` | Update metadata |
| `setAppGraph(client, request)` | `SetAppGraphResult` | Set graph |
| `setDefaultAppFeed(client, request)` | `SetDefaultAppFeedResult` | Set default feed |
| `setAppSponsorship(client, request)` | `SetAppSponsorshipResult` | Set sponsorship |
| `setAppTreasury(client, request)` | `SetAppTreasuryResult` | Set treasury |
| `setAppUsernameNamespace(client, request)` | `SetAppUsernameNamespaceResult` | Set namespace |
| `setAppVerification(client, request)` | `SetAppVerificationResult` | Set verification |
| `addAppFeeds(client, request)` | `AddAppFeedsResult` | Add feeds |
| `removeAppFeeds(client, request)` | `RemoveAppFeedsResult` | Remove feeds |
| `addAppGroups(client, request)` | `AddAppGroupsResult` | Add groups |
| `removeAppGroups(client, request)` | `RemoveAppGroupsResult` | Remove groups |
| `addAppSigners(client, request)` | `AddAppSignersResult` | Add signers |
| `removeAppSigners(client, request)` | `RemoveAppSignersResult` | Remove signers |
| `addAppAuthorizationEndpoint(client, request)` | `void` | Add auth endpoint |
| `removeAppAuthorizationEndpoint(client, request)` | `void` | Remove auth endpoint |
| `generateNewAppServerApiKey(client, request)` | `ServerAPIKey` | Generate API key |

---

## Namespace / Username (13 functions)

| Function | Client | Return | Description |
|----------|--------|--------|-------------|
| `fetchNamespace(client, request)` | Any | `UsernameNamespace \| null` | Fetch namespace |
| `fetchNamespaces(client, request)` | Any | `Paginated<UsernameNamespace>` | List namespaces |
| `fetchNamespaceReservedUsernames(client, request)` | Any | `Paginated<UsernameReserved>` | Reserved names |
| `fetchUsername(client, request)` | Any | `Username \| null` | Fetch username |
| `fetchUsernames(client, request)` | Any | `Paginated<Username>` | List usernames |
| `canCreateUsername(client, request)` | Session | `CanCreateUsernameResult` | Validate creation |
| `createUsernameNamespace(client, request)` | Session | `CreateUsernameNamespaceResult` | Create namespace |
| `setNamespaceMetadata(client, request)` | Session | `SetNamespaceMetadataResult` | Update metadata |
| `updateNamespaceRules(client, request)` | Session | `UpdateNamespaceRulesResult` | Update rules |
| `updateReservedUsernames(client, request)` | Session | `UpdateReservedUsernamesResult` | Reserve/release |
| `createUsername(client, request)` | Session | `CreateUsernameResult` | Mint username |
| `assignUsernameToAccount(client, request)` | Session | `AssignUsernameToAccountResult` | Assign to account |
| `unassignUsernameFromAccount(client, request?)` | Session | `UnassignUsernameToAccountResult` | Unassign |

---

## Graph (5 functions)

| Function | Client | Return | Description |
|----------|--------|--------|-------------|
| `fetchGraph(client, request)` | Any | `Graph \| null` | Fetch graph |
| `fetchGraphs(client, request)` | Any | `Paginated<Graph>` | List graphs |
| `createGraph(client, request)` | Session | `CreateGraphResult` | Create graph |
| `setGraphMetadata(client, request)` | Session | `SetGraphMetadataResult` | Update metadata |
| `updateGraphRules(client, request)` | Session | `UpdateGraphRulesResult` | Update rules |

---

## Sponsorship (12 functions)

| Function | Client | Return | Description |
|----------|--------|--------|-------------|
| `fetchSponsorship(client, request)` | Any | `Sponsorship \| null` | Fetch sponsorship |
| `fetchSponsorships(client, request)` | Any | `Paginated<Sponsorship>` | List sponsorships |
| `fetchSponsorshipSigners(client, request)` | Any | `Paginated<SponsorshipSigner>` | Signers |
| `fetchSponsorshipGrants(client, request)` | Any | `Paginated<SponsorshipGrant>` | Grants |
| `fetchSponsorshipLimitExclusions(client, request)` | Any | `Paginated<SponsorshipLimitsExempt>` | Exempted accounts |
| `createSponsorship(client, request)` | Session | `CreateSponsorshipResult` | Create |
| `setSponsorshipMetadata(client, request)` | Session | `SetSponsorshipMetadataResult` | Update metadata |
| `updateSponsorshipLimits(client, request)` | Session | `UpdateSponsorshipLimitsResult` | Update limits |
| `updateSponsorshipExclusionList(client, request)` | Session | `UpdateSponsorshipExclusionListResult` | Update exclusions |
| `updateSponsorshipSigners(client, request)` | Session | `UpdateSponsorshipSignersResult` | Update signers |
| `pauseSponsorship(client, request)` | Session | `PausingResult` | Pause |
| `unpauseSponsorship(client, request)` | Session | `PausingResult` | Unpause |

---

## Financial / Token (7 functions)

| Function | Client | Return | Description |
|----------|--------|--------|-------------|
| `fetchAccountBalances(client, request)` | Session | `AnyAccountBalance[]` | Token balances |
| `withdraw(client, request)` | Session | `WithdrawResult` | Withdraw funds |
| `deposit(client, request)` | Session | `DepositResult` | Deposit funds |
| `wrapTokens(client, request)` | Session | `WrapTokensResult` | Wrap native→ERC20 |
| `unwrapTokens(client, request)` | Session | `UnwrapTokensResult` | Unwrap ERC20→native |
| `findNativeAmount(balances)` | sync | `Result<NativeAmount>` | Find native balance |
| `findErc20Amount(token, balances)` | sync | `Result<Erc20Amount>` | Find ERC20 balance |

---

## Transaction / Metadata (4 functions)

| Function | Client | Return | Description |
|----------|--------|--------|-------------|
| `transactionStatus(client, request)` | Any | `TransactionStatusResult` | Poll tx status |
| `refreshMetadataStatus(client, request)` | Any | `RefreshMetadataStatusResult` | Metadata indexing status |
| `refreshMetadata(client, request)` | Any | `RefreshMetadataResult` | Trigger metadata refresh |
| `waitForMetadata(client, id)` | Any | `UUID` | Wait for metadata confirm |

---

## ML / Discovery (6 functions)

| Function | Client | Return | Description |
|----------|--------|--------|-------------|
| `fetchAccountRecommendations(client, request)` | Any | `Paginated<Account> \| null` | ML recommendations |
| `fetchPostsForYou(client, request)` | Any | `Paginated<PostForYou> \| null` | For You feed |
| `fetchPostsToExplore(client, request)` | Any | `Paginated<Post> \| null` | Explore feed |
| `dismissRecommendedAccount(client, request)` | Session | `void` | Dismiss recommendation |
| `addPostNotInterested(client, request)` | Session | `void` | Not interested |
| `undoPostNotInterested(client, request)` | Session | `void` | Undo not interested |

---

## Admin (3 functions)

| Function | Client | Return | Description |
|----------|--------|--------|-------------|
| `fetchAdminsFor(client, request)` | Any | `Paginated<Admin>` | List admins |
| `addAdmins(client, request)` | Session | `AddAdminsResult` | Add admins |
| `removeAdmins(client, request)` | Session | `RemoveAdminsResult` | Remove admins |

---

## SNS / Webhooks (3 functions)

| Function | Client | Return | Description |
|----------|--------|--------|-------------|
| `fetchSnsSubscription(client, request)` | Session | `SnsSubscription[]` | Get subscriptions |
| `createSnsSubscriptions(client, request)` | Session | `SnsSubscription[]` | Create subscription |
| `deleteSnsSubscription(client, request)` | Session | `void` | Delete subscription |

---

## Frames (3 functions)

| Function | Client | Return | Description |
|----------|--------|--------|-------------|
| `createFrameTypedData(client, request)` | Any | `CreateFrameEip712TypedData` | Frame typed data |
| `signFrameAction(client, request)` | Session | `FrameLensManagerSignatureResult` | Sign frame action |
| `verifyFrameSignature(client, request)` | Any | `FrameVerifySignatureResult` | Verify signature |

---

## Ownership / Access / Health (3 functions)

| Function | Client | Return | Description |
|----------|--------|--------|-------------|
| `transferPrimitiveOwnership(client, request)` | Session | `TransferPrimitiveOwnershipResult` | Transfer ownership |
| `fetchAccessControl(client, request)` | Any | `AccessControlResult \| null` | Access control info |
| `health(client)` | Any | `boolean` | API health check |
