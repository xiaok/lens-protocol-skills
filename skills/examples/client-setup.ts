/**
 * Lens Protocol — Client Setup & Fragment Definition
 *
 * This file shows how to initialize the Lens SDK client and customize
 * the data shape returned by queries using GraphQL fragments.
 */

import { PublicClient, mainnet, testnet } from "@lens-protocol/client";

// ============================================================
// 1. Basic PublicClient — Testnet
// ============================================================

const client = PublicClient.create({
  environment: testnet,
  // origin is required in non-browser environments (Node.js / React Native)
  origin: "https://myapp.xyz",
});

// ============================================================
// 2. PublicClient — Mainnet with options
// ============================================================

const mainnetClient = PublicClient.create({
  environment: mainnet,
  origin: "https://myapp.xyz",

  // Server-side: add an API key for higher rate limits
  // (obtain from Lens Developer Dashboard)
  // apiKey: "your-api-key",

  // Enable debug logging (prints GraphQL requests/responses)
  // debug: true,
});

// ============================================================
// 3. Custom Fragments — controlling returned data shape
// ============================================================
//
// By default, the SDK uses built-in fragments (AccountFragment,
// PostFragment, etc.) that return a full set of fields.
//
// You can define your own fragments to:
//   - Reduce payload size by selecting only needed fields
//   - Add nested fields not included by default
//
// Steps:
//   1. Import `graphql` from @lens-protocol/client
//   2. Define your fragment using the `graphql()` tagged template
//   3. Use `declare module` to override the default fragment type
//   4. Pass your fragments array to PublicClient.create()

import { graphql, FragmentOf, type Context } from "@lens-protocol/client";
import { fetchAccount } from "@lens-protocol/client/actions";

// Step 1: Define a custom Account fragment with minimal fields
const MyAccountFragment = graphql(`
  fragment Account on Account {
    __typename
    address
    username {
      localName
      value
    }
    metadata {
      name
      bio
      picture
    }
  }
`);

// Step 2: Declare the module override so TypeScript knows the shape
declare module "@lens-protocol/client" {
  interface Account extends FragmentOf<typeof MyAccountFragment> {}
}

// Step 3: Pass fragments to the client
const customClient = PublicClient.create({
  environment: testnet,
  origin: "https://myapp.xyz",
  fragments: [MyAccountFragment],
});

// Step 4: fetchAccount now returns your custom shape
async function demo() {
  const result = await fetchAccount(customClient, {
    username: {
      localName: "alice",
    },
  });

  if (result.isErr()) {
    console.error(result.error);
    return;
  }

  const account = result.value;
  if (!account) {
    console.log("Account not found");
    return;
  }

  // TypeScript knows exactly which fields are available
  console.log(account.address);
  console.log(account.username?.localName);
  console.log(account.metadata?.name);
}

// ============================================================
// 4. Custom Post fragment example
// ============================================================
//
// Note: GQL fragment name must match the GraphQL type ("Post", "Account", etc.)
// because the SDK uses it to override the default fragment shape.
// Use a descriptive JS variable name to avoid confusion.

const MyPostFragment = graphql(`
  fragment Post on Post {
    __typename
    id
    slug
    author {
      ...Account
    }
    metadata {
      ... on TextOnlyMetadata {
        content
      }
      ... on ImageMetadata {
        content
        image {
          item
          altTag
        }
      }
      ... on ArticleMetadata {
        content
        title
      }
    }
    stats {
      upvotes
      comments
      reposts
    }
    timestamp
  }
`);

declare module "@lens-protocol/client" {
  interface Post extends FragmentOf<typeof MyPostFragment> {}
}

// ============================================================
// 5. Branded types — type-safe identifiers
// ============================================================

import { evmAddress, postId, uri } from "@lens-protocol/client";

// These helpers validate and brand string literals
const accountAddr = evmAddress("0x1234567890abcdef1234567890abcdef12345678");
const myPostId = postId("0x01-0x01");
const contentUri = uri("lens://abc123");

// ============================================================
// 6. Environment details
// ============================================================
//
// mainnet:
//   - Chain ID: 232
//   - Gas Token: GHO
//   - Storage: production Grove (api.grove.storage)
//
// testnet:
//   - Chain ID: 37111
//   - Gas Token: GRASS
//   - Storage: staging Grove
//
// Test App addresses (for development):
//   - Mainnet: 0x8A5Cc31180c37078e1EbA2A23c861Acf351a97cE
//   - Testnet: 0xC75A89145d765c396fd75CbD16380Eb184Bd2ca7
