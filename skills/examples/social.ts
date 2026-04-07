/**
 * Lens Protocol — Social Operations
 *
 * Covers: follow/unfollow, groups (create, join, leave, manage),
 * notifications, ML recommendations.
 */

import { PublicClient, testnet, evmAddress } from "@lens-protocol/client";
import {
  // Follow
  follow,
  unfollow,
  fetchFollowers,
  fetchFollowing,
  fetchFollowersYouKnow,
  fetchFollowStatus,
  // Groups
  createGroup,
  joinGroup,
  leaveGroup,
  fetchGroup,
  fetchGroups,
  fetchGroupMembers,
  fetchGroupStats,
  setGroupMetadata,
  // Membership management
  requestGroupMembership,
  approveGroupMembershipRequests,
  rejectGroupMembershipRequests,
  removeGroupMembers,
  // Notifications
  fetchNotifications,
  // ML / Discovery
  fetchAccountRecommendations,
  fetchPostsForYou,
  dismissRecommendedAccount,
} from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { group as groupMetadata } from "@lens-protocol/metadata";
import { StorageClient, immutable } from "@lens-chain/storage-client";

const client = PublicClient.create({
  environment: testnet,
  origin: "https://myapp.xyz",
});

// ============================================================
// 1. Follow an Account
// ============================================================

async function followAccount(sessionClient: any, walletClient: any) {
  const result = await follow(sessionClient, {
    account: evmAddress("0xTARGET_ACCOUNT"),
  }).andThen(handleOperationWith(walletClient));

  if (result.isErr()) {
    console.error("Follow failed:", result.error);
    return;
  }
  console.log("Followed! TX:", result.value);
}

// ============================================================
// 2. Unfollow an Account
// ============================================================

async function unfollowAccount(sessionClient: any, walletClient: any) {
  const result = await unfollow(sessionClient, {
    account: evmAddress("0xTARGET_ACCOUNT"),
  }).andThen(handleOperationWith(walletClient));

  if (result.isErr()) {
    console.error("Unfollow failed:", result.error);
  }
}

// ============================================================
// 3. Fetch Followers / Following
// ============================================================

async function getFollowData() {
  // Get followers of an account
  const followers = await fetchFollowers(client, {
    account: evmAddress("0xSOME_ACCOUNT"),
  });
  if (followers.isOk()) {
    for (const f of followers.value.items) {
      console.log("Follower:", f.follower.address, "since:", f.followedOn);
    }
  }

  // Get accounts that someone follows
  const following = await fetchFollowing(client, {
    account: evmAddress("0xSOME_ACCOUNT"),
  });
  if (following.isOk()) {
    for (const f of following.value.items) {
      console.log("Following:", f.following.address);
    }
  }

  // Get mutual followers (followers you also follow)
  const mutual = await fetchFollowersYouKnow(client, {
    target: evmAddress("0xSOME_ACCOUNT"),
    observer: evmAddress("0xMY_ACCOUNT"),
  });

  // Check follow status between two accounts
  const status = await fetchFollowStatus(client, {
    pairs: [
      {
        account: evmAddress("0xACCOUNT_A"),
        follower: evmAddress("0xACCOUNT_B"),
      },
    ],
  });
  if (status.isOk()) {
    console.log("Is following (on-chain):", status.value[0].isFollowing.onChain);
  }
}

// ============================================================
// 4. Create a Group
// ============================================================

async function createNewGroup(sessionClient: any, walletClient: any) {
  const storage = StorageClient.create();

  // Build group metadata
  const metadata = groupMetadata({
    name: "Lens Builders",
    description: "A community for Lens Protocol developers",
    icon: "lens://group-icon-uri",
  });

  // Upload metadata
  const { uri } = await storage.uploadAsJson(metadata, {
    acl: immutable(37111),
  });

  // Create group on-chain
  const result = await createGroup(sessionClient, {
    metadataUri: uri,
  }).andThen(handleOperationWith(walletClient));

  if (result.isErr()) {
    console.error("Create group failed:", result.error);
    return;
  }
  console.log("Group created! TX:", result.value);
}

// ============================================================
// 5. Join / Leave a Group
// ============================================================

async function joinAndLeave(sessionClient: any, walletClient: any) {
  const groupAddress = evmAddress("0xGROUP_ADDRESS");

  // Join
  const joinResult = await joinGroup(sessionClient, {
    group: groupAddress,
  }).andThen(handleOperationWith(walletClient));

  if (joinResult.isErr()) {
    console.error("Join failed:", joinResult.error);
  }

  // Leave
  const leaveResult = await leaveGroup(sessionClient, {
    group: groupAddress,
  }).andThen(handleOperationWith(walletClient));
}

// ============================================================
// 6. Fetch Group Details & Members
// ============================================================

async function getGroupInfo() {
  // Fetch group details
  const group = await fetchGroup(client, {
    group: evmAddress("0xGROUP_ADDRESS"),
  });
  if (group.isOk() && group.value) {
    console.log("Group:", group.value.metadata?.name);
    console.log("Owner:", group.value.owner);
  }

  // Fetch group members
  const members = await fetchGroupMembers(client, {
    group: evmAddress("0xGROUP_ADDRESS"),
  });
  if (members.isOk()) {
    for (const m of members.value.items) {
      console.log("Member:", m.account.address, "joined:", m.joinedAt);
    }
  }

  // Fetch group stats
  const stats = await fetchGroupStats(client, {
    group: evmAddress("0xGROUP_ADDRESS"),
  });
  if (stats.isOk() && stats.value) {
    console.log("Total members:", stats.value.totalMembers);
  }
}

// ============================================================
// 7. Group Membership Management (Admin)
// ============================================================

async function manageMembers(sessionClient: any, walletClient: any) {
  const groupAddress = evmAddress("0xGROUP_ADDRESS");

  // Approve pending membership requests
  await approveGroupMembershipRequests(sessionClient, {
    group: groupAddress,
    accounts: [evmAddress("0xAPPLICANT_1"), evmAddress("0xAPPLICANT_2")],
  }).andThen(handleOperationWith(walletClient));

  // Reject membership requests
  await rejectGroupMembershipRequests(sessionClient, {
    group: groupAddress,
    accounts: [evmAddress("0xAPPLICANT_3")],
  }).andThen(handleOperationWith(walletClient));

  // Remove members
  await removeGroupMembers(sessionClient, {
    group: groupAddress,
    accounts: [evmAddress("0xBAD_MEMBER")],
  }).andThen(handleOperationWith(walletClient));
}

// ============================================================
// 8. Fetch Notifications
// ============================================================

async function getNotifications(sessionClient: any) {
  const result = await fetchNotifications(sessionClient);

  if (result.isErr()) {
    console.error(result.error);
    return;
  }

  for (const notification of result.value.items) {
    switch (notification.__typename) {
      case "FollowNotification":
        console.log("New followers:", notification.followers.length);
        break;
      case "CommentNotification":
        console.log("New comment on post:", notification.comment.id);
        break;
      case "ReactionNotification":
        console.log("New reactions:", notification.reactions.length);
        break;
      case "RepostNotification":
        console.log("Reposted:", notification.post.id);
        break;
      case "QuoteNotification":
        console.log("Quoted:", notification.quote.id);
        break;
      case "MentionNotification":
        console.log("Mentioned in:", notification.post.id);
        break;
    }
  }

  // Pagination
  if (result.value.pageInfo.next) {
    await fetchNotifications(sessionClient, {
      cursor: result.value.pageInfo.next,
    });
  }
}

// ============================================================
// 9. ML Recommendations
// ============================================================

async function getRecommendations() {
  // Account recommendations
  const accounts = await fetchAccountRecommendations(client, {
    account: evmAddress("0xMY_ACCOUNT"),
  });
  if (accounts.isOk() && accounts.value) {
    for (const acc of accounts.value.items) {
      console.log("Recommended:", acc.username?.value);
    }
  }

  // "For You" post feed
  const posts = await fetchPostsForYou(client, {
    account: evmAddress("0xMY_ACCOUNT"),
  });
  if (posts.isOk() && posts.value) {
    for (const p of posts.value.items) {
      console.log("Suggested post:", p.post.id, "source:", p.source);
    }
  }
}

async function dismissRecommendation(sessionClient: any) {
  await dismissRecommendedAccount(sessionClient, {
    accounts: [evmAddress("0xNOT_INTERESTED")],
  });
}
