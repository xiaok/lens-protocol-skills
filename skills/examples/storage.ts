/**
 * Lens Protocol — Grove Storage Operations
 *
 * Grove is the decentralized storage layer for Lens Protocol.
 * All content (metadata, images, videos) is stored on Grove
 * and referenced via `lens://` URIs.
 *
 * Key concepts:
 *   - Immutable uploads: content-addressed, permanent, no auth needed
 *   - Mutable uploads: editable/deletable, ACL-controlled
 *   - All content is publicly READABLE regardless of ACL
 *   - ACL controls WRITE/DELETE permissions only
 */

import {
  StorageClient,
  immutable,
  lensAccountOnly,
  walletOnly,
} from "@lens-chain/storage-client";
import type { SessionClient } from "@lens-protocol/client";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { chains } from "@lens-chain/sdk/viem";

// ============================================================
// 1. Create StorageClient
// ============================================================

// Default: production environment (Lens Mainnet, chain ID 232)
const storage = StorageClient.create();

// The client defaults to `production` env config:
//   backend: https://api.grove.storage
//   defaultChainId: 232

// ============================================================
// 2. Upload JSON (Metadata) — Immutable
// ============================================================
//
// Most common use case: upload Lens metadata as JSON.
// Immutable uploads are permanent and cannot be changed.

async function uploadMetadata() {
  const metadata = {
    $schema: "https://json-schemas.lens.dev/posts/text-only/3.0.0.json",
    lens: {
      mainContentFocus: "TEXT_ONLY",
      content: "Hello Lens!",
      id: "unique-id",
      locale: "en",
    },
  };

  const result = await storage.uploadAsJson(metadata, {
    acl: immutable(37111), // testnet chain ID
    // name: "metadata.json",  // optional, defaults to "data.json"
  });

  console.log("URI:", result.uri);           // "lens://abc123..."
  console.log("Gateway:", result.gatewayUrl); // "https://api.grove.storage/abc123..."
  console.log("Key:", result.storageKey);     // "abc123..."
}

// ============================================================
// 3. Upload a File (Image) — Immutable
// ============================================================

async function uploadImage() {
  // In Node.js, read file from disk:
  // const buffer = fs.readFileSync("photo.jpg");
  // const file = new File([buffer], "photo.jpg", { type: "image/jpeg" });

  // In browser, from <input type="file">:
  // const file = inputElement.files[0];

  const file = new File(
    [new Uint8Array([/* image bytes */])],
    "photo.jpg",
    { type: "image/jpeg" }
  );

  const result = await storage.uploadFile(file, {
    acl: immutable(232), // mainnet
  });

  console.log("Image URI:", result.uri); // use this in metadata
}

// ============================================================
// 4. Upload a Folder — Immutable
// ============================================================

async function uploadFolder() {
  const files = [
    new File(["content 1"], "page1.html", { type: "text/html" }),
    new File(["content 2"], "page2.html", { type: "text/html" }),
    new File(['{"data":true}'], "data.json", { type: "application/json" }),
  ];

  const result = await storage.uploadFolder(files, {
    acl: immutable(232),
    index: true, // auto-generate index.json listing all files
  });

  console.log("Folder URI:", result.folder.uri);
  console.log("Files:");
  for (const f of result.files) {
    console.log("  ", f.uri, f.gatewayUrl);
  }
}

// ============================================================
// 5. Upload with Mutable ACL — Lens Account
// ============================================================
//
// Only the specified Lens Account can edit/delete this resource.

async function uploadMutableByAccount() {
  const metadata = { name: "Mutable profile data", version: 1 };

  const result = await storage.uploadAsJson(metadata, {
    acl: lensAccountOnly(
      "0xYOUR_LENS_ACCOUNT_ADDRESS", // the Lens Account that controls this
      232,                            // chain ID
    ),
  });

  console.log("Mutable URI:", result.uri);
}

// ============================================================
// 6. Upload with Mutable ACL — Wallet Address
// ============================================================
//
// Only the specified wallet can edit/delete this resource.

async function uploadMutableByWallet() {
  const result = await storage.uploadAsJson(
    { content: "editable" },
    {
      acl: walletOnly(
        "0xYOUR_WALLET_ADDRESS",
        232,
      ),
    },
  );

  console.log("Wallet-controlled URI:", result.uri);
}

// ============================================================
// 7. Edit an Existing Resource
// ============================================================
//
// Requires: mutable ACL + a Signer (wallet that matches the ACL)

async function editResource() {
  const signer = createWalletClient({
    account: privateKeyToAccount("0xPRIVATE_KEY"),
    chain: chains.mainnet,
    transport: http(),
  });

  const newFile = new File(
    [JSON.stringify({ content: "updated content", version: 2 })],
    "data.json",
    { type: "application/json" },
  );

  const result = await storage.editFile(
    "lens://original-resource-uri",
    newFile,
    signer,
    { acl: lensAccountOnly("0xYOUR_LENS_ACCOUNT", 232) },
  );

  // Wait for propagation before further edits
  await result.waitForPropagation();

  console.log("Updated:", result.uri);
}

// ============================================================
// 8. Update JSON (convenience method for editing)
// ============================================================

async function updateJsonResource() {
  const signer = createWalletClient({
    account: privateKeyToAccount("0xPRIVATE_KEY"),
    chain: chains.mainnet,
    transport: http(),
  });

  const result = await storage.updateJson(
    "lens://original-resource-uri",
    { content: "new JSON data", version: 3 },
    signer,
    { acl: walletOnly("0xYOUR_WALLET", 232) },
  );

  await result.waitForPropagation();
}

// ============================================================
// 9. Delete a Resource
// ============================================================

async function deleteResource() {
  const signer = createWalletClient({
    account: privateKeyToAccount("0xPRIVATE_KEY"),
    chain: chains.mainnet,
    transport: http(),
  });

  const { success } = await storage.delete(
    "lens://resource-to-delete",
    signer,
  );

  console.log("Deleted:", success);
}

// ============================================================
// 10. Resolve URI to HTTP URL
// ============================================================

function resolveUri() {
  // Convert lens:// URI to a fetchable HTTP URL
  const httpUrl = storage.resolve("lens://abc123def456");
  console.log(httpUrl);
  // → "https://api.grove.storage/abc123def456"

  // Also accepts raw storage keys (without lens:// prefix)
  const httpUrl2 = storage.resolve("abc123def456");
  // → same result
}

// ============================================================
// 11. Full Workflow: Image Post with Grove Upload
// ============================================================

import { image, MediaImageMimeType } from "@lens-protocol/metadata";
import { post } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";

async function fullImagePostWorkflow(sessionClient: SessionClient, walletClient: any) {
  // 1. Upload image to Grove
  const imageFile = new File([/* bytes */], "photo.png", { type: "image/png" });
  const imageUpload = await storage.uploadFile(imageFile, {
    acl: immutable(37111),
  });

  // 2. Build metadata referencing the image URI
  const metadata = image({
    image: {
      item: imageUpload.uri, // "lens://..."
      type: MediaImageMimeType.PNG,
      altTag: "My photo",
    },
    content: "Check out this photo!",
  });

  // 3. Upload metadata to Grove
  const { uri: contentUri } = await storage.uploadAsJson(metadata, {
    acl: immutable(37111),
  });

  // 4. Submit post on-chain
  const result = await post(sessionClient, {
    contentUri,
  }).andThen(handleOperationWith(walletClient));

  if (result.isErr()) {
    console.error("Failed:", result.error);
    return;
  }

  console.log("Post published! TX:", result.value);
}
