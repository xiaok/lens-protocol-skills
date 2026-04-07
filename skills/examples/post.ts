/**
 * Lens Protocol — Post Operations
 *
 * Covers: create post, edit, delete, comment, quote, repost,
 * fetch posts, reactions, bookmarks, timeline.
 */

import { PublicClient, testnet, evmAddress, uri } from "@lens-protocol/client";
import {
  post,
  editPost,
  deletePost,
  repost,
  fetchPost,
  fetchPosts,
  fetchTimeline,
  fetchPostReferences,
  fetchPostBookmarks,
  addReaction,
  undoReaction,
  bookmarkPost,
  undoBookmarkPost,
  hideReply,
  unhideReply,
  reportPost,
} from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import {
  textOnly,
  image,
  article,
  video,
  MediaImageMimeType,
  MediaVideoMimeType,
  MetadataLicenseType,
} from "@lens-protocol/metadata";
import { StorageClient, immutable } from "@lens-chain/storage-client";

const client = PublicClient.create({
  environment: testnet,
  origin: "https://myapp.xyz",
});
const storage = StorageClient.create();

// ============================================================
// 1. Create a Text-Only Post
// ============================================================

async function createTextPost(sessionClient: any, walletClient: any) {
  // Step 1: Build metadata
  const metadata = textOnly({
    content: "Hello Lens! This is my first post.",
  });

  // Step 2: Upload to Grove
  const { uri: contentUri } = await storage.uploadAsJson(metadata, {
    acl: immutable(37111),
  });

  // Step 3: Submit post
  const result = await post(sessionClient, {
    contentUri,
  }).andThen(handleOperationWith(walletClient));

  if (result.isErr()) {
    console.error("Post failed:", result.error);
    return;
  }

  console.log("Post created, tx:", result.value);
}

// ============================================================
// 2. Create an Image Post
// ============================================================

async function createImagePost(sessionClient: any, walletClient: any) {
  // First upload the image file to Grove
  const imageFile = new File([/* image bytes */], "photo.jpg", {
    type: "image/jpeg",
  });
  const imageUpload = await storage.uploadFile(imageFile, {
    acl: immutable(37111),
  });

  // Build image post metadata
  const metadata = image({
    image: {
      item: imageUpload.uri,
      type: MediaImageMimeType.JPEG,
      altTag: "A beautiful sunset",
      // license: MetadataLicenseType.CCO,
    },
    content: "Check out this view! 🌅",
    tags: ["photography", "sunset"],
  });

  // Upload metadata
  const { uri: contentUri } = await storage.uploadAsJson(metadata, {
    acl: immutable(37111),
  });

  // Submit
  const result = await post(sessionClient, {
    contentUri,
  }).andThen(handleOperationWith(walletClient));

  if (result.isErr()) {
    console.error(result.error);
  }
}

// ============================================================
// 3. Create an Article Post
// ============================================================

async function createArticle(sessionClient: any, walletClient: any) {
  const metadata = article({
    title: "Getting Started with Lens Protocol",
    content: "# Introduction\n\nLens Protocol is a decentralized social graph...",
    tags: ["lens", "web3", "tutorial"],
    // Optional: attach media
    attachments: [
      {
        item: "lens://some-image-uri",
        type: MediaImageMimeType.PNG,
        altTag: "Architecture diagram",
      },
    ],
  });

  const { uri: contentUri } = await storage.uploadAsJson(metadata, {
    acl: immutable(37111),
  });

  await post(sessionClient, { contentUri })
    .andThen(handleOperationWith(walletClient));
}

// ============================================================
// 4. Create a Video Post
// ============================================================

async function createVideoPost(sessionClient: any, walletClient: any) {
  const metadata = video({
    video: {
      item: "lens://uploaded-video-uri",
      type: MediaVideoMimeType.MP4,
      cover: "lens://video-thumbnail-uri",
      duration: 120, // seconds
      altTag: "Demo video",
    },
    content: "Watch my demo!",
  });

  const { uri: contentUri } = await storage.uploadAsJson(metadata, {
    acl: immutable(37111),
  });

  await post(sessionClient, { contentUri })
    .andThen(handleOperationWith(walletClient));
}

// ============================================================
// 5. Comment on a Post
// ============================================================

async function commentOnPost(sessionClient: any, walletClient: any) {
  const metadata = textOnly({
    content: "Great post! I totally agree.",
  });

  const { uri: contentUri } = await storage.uploadAsJson(metadata, {
    acl: immutable(37111),
  });

  // commentOn references the parent post
  const result = await post(sessionClient, {
    contentUri,
    commentOn: {
      post: "42", // the post slug or ID to comment on
    },
  }).andThen(handleOperationWith(walletClient));

  if (result.isErr()) {
    console.error(result.error);
  }
}

// ============================================================
// 6. Quote a Post
// ============================================================

async function quotePost(sessionClient: any, walletClient: any) {
  const metadata = textOnly({
    content: "This is worth reading! Here's my take...",
  });

  const { uri: contentUri } = await storage.uploadAsJson(metadata, {
    acl: immutable(37111),
  });

  const result = await post(sessionClient, {
    contentUri,
    quoteOf: {
      post: "42", // the post slug or ID to quote
    },
  }).andThen(handleOperationWith(walletClient));
}

// ============================================================
// 7. Repost (no new content, just reshare)
// ============================================================

async function repostPost(sessionClient: any, walletClient: any) {
  const result = await repost(sessionClient, {
    post: "42", // post slug or ID
  }).andThen(handleOperationWith(walletClient));

  if (result.isErr()) {
    console.error(result.error);
  }
}

// ============================================================
// 8. Edit a Post
// ============================================================

async function editMyPost(sessionClient: any, walletClient: any) {
  // Build updated metadata
  const metadata = textOnly({
    content: "Updated: Hello Lens! This post has been edited.",
  });

  const { uri: contentUri } = await storage.uploadAsJson(metadata, {
    acl: immutable(37111),
  });

  const result = await editPost(sessionClient, {
    post: "42", // post slug or ID
    contentUri,
  }).andThen(handleOperationWith(walletClient));

  if (result.isErr()) {
    console.error(result.error);
  }
}

// ============================================================
// 9. Delete a Post
// ============================================================

async function deleteMyPost(sessionClient: any, walletClient: any) {
  const result = await deletePost(sessionClient, {
    post: "42",
  }).andThen(handleOperationWith(walletClient));

  if (result.isErr()) {
    console.error(result.error);
  }
}

// ============================================================
// 10. Fetch a Single Post
// ============================================================

async function getPost() {
  const result = await fetchPost(client, {
    post: "42", // post slug or ID
  });

  if (result.isErr()) {
    console.error(result.error);
    return;
  }

  const p = result.value;
  if (!p) {
    console.log("Post not found");
    return;
  }

  // Check if it's a Post or Repost
  if (p.__typename === "Post") {
    console.log("Author:", p.author.address);
    console.log("Content URI:", p.contentUri);
    console.log("Stats:", p.stats);
  } else if (p.__typename === "Repost") {
    console.log("Reposted by:", p.author.address);
    console.log("Original post:", p.repostOf.id);
  }
}

// ============================================================
// 11. Fetch Posts (paginated, with filters)
// ============================================================

async function listPosts() {
  // Posts by a specific account
  const result = await fetchPosts(client, {
    filter: {
      authors: [evmAddress("0xSOME_ACCOUNT")],
    },
  });

  if (result.isErr()) return;

  for (const p of result.value.items) {
    console.log(p.__typename, p.id);
  }

  // Pagination
  const nextCursor = result.value.pageInfo.next;
  if (nextCursor) {
    await fetchPosts(client, {
      filter: { authors: [evmAddress("0xSOME_ACCOUNT")] },
      cursor: nextCursor,
    });
  }
}

// ============================================================
// 12. Fetch Comments on a Post
// ============================================================

async function getComments() {
  const result = await fetchPostReferences(client, {
    referencedPost: "42",
    // filter: { type: "COMMENT" }, // optional filter
  });

  if (result.isErr()) return;

  for (const comment of result.value.items) {
    console.log(comment);
  }
}

// ============================================================
// 13. Fetch Timeline
// ============================================================

async function getTimeline() {
  const result = await fetchTimeline(client, {
    account: evmAddress("0xMY_ACCOUNT"),
  });

  if (result.isErr()) return;

  for (const item of result.value.items) {
    console.log("Primary post:", item.primary.id);
    console.log("Comments:", item.comments.length);
    console.log("Reposts:", item.reposts.length);
  }
}

// ============================================================
// 14. Reactions (Upvote / Downvote)
// ============================================================

async function reactToPost(sessionClient: any) {
  // Add upvote
  await addReaction(sessionClient, {
    post: "42",
    reaction: "UPVOTE",
  });

  // Remove upvote
  await undoReaction(sessionClient, {
    post: "42",
    reaction: "UPVOTE",
  });
}

// ============================================================
// 15. Bookmarks
// ============================================================

async function manageBookmarks(sessionClient: any) {
  // Bookmark a post
  await bookmarkPost(sessionClient, { post: "42" });

  // Fetch bookmarked posts
  const result = await fetchPostBookmarks(sessionClient);
  if (result.isOk()) {
    for (const p of result.value.items) {
      console.log("Bookmarked:", p.id);
    }
  }

  // Remove bookmark
  await undoBookmarkPost(sessionClient, { post: "42" });
}

// ============================================================
// 16. Hide / Unhide Replies
// ============================================================

async function manageReplies(sessionClient: any) {
  // Hide a reply on your own post
  await hideReply(sessionClient, { post: "reply-slug-123" });

  // Unhide it
  await unhideReply(sessionClient, { post: "reply-slug-123" });
}

// ============================================================
// 17. Report a Post
// ============================================================

async function reportBadPost(sessionClient: any) {
  await reportPost(sessionClient, {
    post: "42",
    reason: "SPAM",
    // additionalComment: "This is spam",
  });
}
