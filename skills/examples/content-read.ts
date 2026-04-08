/**
 * Lens Protocol — Content Read Patterns
 *
 * Covers: list/detail reads, boundary selection, pagination,
 * and mapping Lens responses into UI-facing view models.
 */

import { PublicClient, testnet, evmAddress } from "@lens-protocol/client";
import { fetchPost, fetchPosts } from "@lens-protocol/client/actions";
import { StorageClient } from "@lens-chain/storage-client";

const client = PublicClient.create({
  environment: testnet,
  origin: "https://myapp.xyz",
});

const storage = StorageClient.create();

type ContentCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  authorName: string;
  coverImage: string | null;
};

function resolveMaybeUri(value?: string | null) {
  if (!value) return null;
  return storage.resolve(value);
}

function toContentCard(post: any): ContentCard | null {
  if (post.__typename !== "Post") {
    return null;
  }

  const metadata = post.metadata;
  const content = metadata?.content ?? "";

  return {
    id: post.id,
    slug: post.slug,
    title: metadata?.title ?? "Untitled",
    excerpt: content.slice(0, 140),
    tags: metadata?.tags ?? [],
    authorName: post.author.metadata?.name ?? post.author.username?.localName ?? "Unknown",
    coverImage: resolveMaybeUri(
      metadata?.image?.item ?? metadata?.attachments?.[0]?.item ?? null
    ),
  };
}

// ============================================================
// 1. Choose the boundary deliberately
// ============================================================

async function listPostsByAuthor() {
  return fetchPosts(client, {
    filter: {
      authors: [evmAddress("0xAUTHOR_ACCOUNT")],
    },
  });
}

async function listPostsFromCustomFeed() {
  return fetchPosts(client, {
    filter: {
      feeds: [{ feed: evmAddress("0xCUSTOM_FEED") }],
    },
  });
}

async function listPostsFromAppFeed() {
  return fetchPosts(client, {
    filter: {
      feeds: [{ app: evmAddress("0xAPP_ADDRESS") }],
    },
  });
}

async function listPostsByTag() {
  return fetchPosts(client, {
    filter: {
      metadata: {
        tags: {
          oneOf: ["guide", "gaming"],
        },
      },
    },
  });
}

// ============================================================
// 2. Combine boundaries intentionally
// ============================================================

async function listPostsForAppGuideSection() {
  const result = await fetchPosts(client, {
    filter: {
      feeds: [{ app: evmAddress("0xAPP_ADDRESS") }],
      metadata: {
        tags: {
          oneOf: ["guide"],
        },
      },
    },
  });

  if (result.isErr()) {
    console.error(result.error);
    return [];
  }

  return result.value.items
    .map(toContentCard)
    .filter((item): item is ContentCard => item !== null);
}

// ============================================================
// 3. Keep list and detail pages on the same identifier model
// ============================================================

async function getPostDetail(postRef: string) {
  const result = await fetchPost(client, {
    post: postRef, // slug or post ID
  });

  if (result.isErr()) {
    console.error(result.error);
    return null;
  }

  if (!result.value || result.value.__typename !== "Post") {
    return null;
  }

  return result.value;
}

async function listPageThenOpenDetail() {
  const cards = await listPostsForAppGuideSection();
  const first = cards[0];

  if (!first) return null;

  // Use the same reference shape that your routes expose.
  // If the list emits slug-based links, the detail page should read by slug too.
  return getPostDetail(first.slug);
}

// ============================================================
// 4. Cursor-based pagination
// ============================================================

async function listTwoPages() {
  const page1 = await fetchPosts(client, {
    filter: {
      authors: [evmAddress("0xAUTHOR_ACCOUNT")],
    },
  });

  if (page1.isErr()) {
    console.error(page1.error);
    return [];
  }

  const items = [...page1.value.items];
  const next = page1.value.pageInfo.next;

  if (!next) {
    return items;
  }

  const page2 = await fetchPosts(client, {
    filter: {
      authors: [evmAddress("0xAUTHOR_ACCOUNT")],
    },
    cursor: next,
  });

  if (page2.isErr()) {
    console.error(page2.error);
    return items;
  }

  return [...items, ...page2.value.items];
}

// ============================================================
// 5. Fragment / metadata / UI should agree on the same fields
// ============================================================

async function getCardsForHomepage() {
  const posts = await listPostsForAppGuideSection();

  for (const card of posts) {
    console.log(card.title, card.slug, card.coverImage);
  }

  // If the homepage needs title, cover image, tags, and author display name,
  // your GraphQL fragment must explicitly include those fields.
  return posts;
}
