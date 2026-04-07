/**
 * Lens Protocol — Account Operations
 *
 * Covers: create account, fetch account, update metadata,
 * manage account managers, block/mute, follow rules.
 */

import {
  PublicClient,
  testnet,
  evmAddress,
  TokenStandard,
} from "@lens-protocol/client";
import {
  fetchAccount,
  fetchAccounts,
  fetchAccountsAvailable,
  createAccountWithUsername,
  setAccountMetadata,
  addAccountManager,
  removeAccountManager,
  blockAccount,
  unblockAccount,
  muteAccount,
  unmuteAccount,
  updateAccountFollowRules,
} from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import {
  account as accountMetadata,
  MetadataAttributeType,
} from "@lens-protocol/metadata";
import { StorageClient, immutable } from "@lens-chain/storage-client";

// ============================================================
// 1. Fetch a single account
// ============================================================

const client = PublicClient.create({
  environment: testnet,
  origin: "https://myapp.xyz",
});

async function getAccount() {
  // By username
  const result = await fetchAccount(client, {
    username: {
      localName: "alice",
    },
  });

  if (result.isErr()) {
    console.error(result.error);
    return;
  }

  const acc = result.value;
  if (!acc) {
    console.log("Not found");
    return;
  }

  console.log("Address:", acc.address);
  console.log("Owner:", acc.owner);
  console.log("Name:", acc.metadata?.name);
  console.log("Bio:", acc.metadata?.bio);

  // By address
  const result2 = await fetchAccount(client, {
    address: evmAddress("0x1234..."),
  });
}

// ============================================================
// 2. Fetch multiple accounts (paginated)
// ============================================================

async function listAccounts() {
  const result = await fetchAccounts(client, {
    // filter by local name prefix
    filter: { searchBy: { localNameQuery: "ali" } },
  });

  if (result.isErr()) return;

  for (const acc of result.value.items) {
    console.log(acc.username?.value, acc.address);
  }

  // Pagination
  if (result.value.pageInfo.next) {
    const page2 = await fetchAccounts(client, {
      filter: { searchBy: { localNameQuery: "ali" } },
      cursor: result.value.pageInfo.next,
    });
  }
}

// ============================================================
// 3. Fetch accounts available to a wallet
// ============================================================

async function getMyAccounts() {
  const result = await fetchAccountsAvailable(client, {
    managedBy: evmAddress("0xMY_WALLET"),
    includeOwned: true,
  });

  if (result.isErr()) return;

  for (const item of result.value.items) {
    console.log(item); // AccountManaged or AccountOwned
  }
}

// ============================================================
// 4. Create Account (Onboarding User flow)
// ============================================================
//
// Prerequisites:
//   - Login as OnboardingUser role
//   - Prepare account metadata JSON and upload to Grove

async function createAccount(sessionClient: any, walletClient: any) {
  const storage = StorageClient.create();

  // Step 1: Build account metadata
  const metadata = accountMetadata({
    name: "Alice",
    bio: "Hello from Lens!",
  });

  // Step 2: Upload metadata to Grove
  const { uri } = await storage.uploadAsJson(metadata, {
    acl: immutable(37111), // testnet chain ID
  });
  console.log("Metadata URI:", uri); // lens://...

  // Step 3: Create account with username
  const result = await createAccountWithUsername(sessionClient, {
    username: { localName: "alice" },
    metadataUri: uri,
  }).andThen(handleOperationWith(walletClient));

  if (result.isErr()) {
    console.error("Create failed:", result.error);
    return;
  }

  console.log("Account created! TX:", result.value);
}

// ============================================================
// 5. Update Account Metadata
// ============================================================

async function updateProfile(sessionClient: any, walletClient: any) {
  const storage = StorageClient.create();

  // Build updated metadata
  const metadata = accountMetadata({
    name: "Alice (Updated)",
    bio: "Building on Lens Protocol",
    picture: "lens://my-avatar-uri",
    coverPicture: "lens://my-cover-uri",
    attributes: [
      {
        key: "website",
        type: MetadataAttributeType.STRING,
        value: "https://alice.xyz",
      },
      {
        key: "x",
        type: MetadataAttributeType.STRING,
        value: "alice_dev",
      },
    ],
  });

  // Upload to Grove
  const { uri } = await storage.uploadAsJson(metadata, {
    acl: immutable(37111),
  });

  // Submit on-chain
  const result = await setAccountMetadata(sessionClient, {
    metadataUri: uri,
  }).andThen(handleOperationWith(walletClient));

  if (result.isErr()) {
    console.error(result.error);
    return;
  }

  console.log("Metadata updated, tx:", result.value);
}

// ============================================================
// 6. Account Manager Operations
// ============================================================

async function manageManagers(sessionClient: any, walletClient: any) {
  // Add a manager
  const addResult = await addAccountManager(sessionClient, {
    address: evmAddress("0xMANAGER_ADDRESS"),
    permissions: {
      canExecuteTransactions: true,
      canSetMetadataUri: true,
      canTransferNative: false,
      canTransferTokens: false,
    },
  }).andThen(handleOperationWith(walletClient));

  if (addResult.isErr()) {
    console.error(addResult.error);
  }

  // Remove a manager
  const removeResult = await removeAccountManager(sessionClient, {
    manager: evmAddress("0xMANAGER_ADDRESS"),
  }).andThen(handleOperationWith(walletClient));
}

// ============================================================
// 7. Block / Mute
// ============================================================

async function blockAndMute(sessionClient: any, walletClient: any) {
  const target = evmAddress("0xSPAMMER");

  // Block (on-chain)
  await blockAccount(sessionClient, { account: target })
    .andThen(handleOperationWith(walletClient));

  // Unblock
  await unblockAccount(sessionClient, { account: target })
    .andThen(handleOperationWith(walletClient));

  // Mute (off-chain, immediate)
  await muteAccount(sessionClient, { account: target });

  // Unmute
  await unmuteAccount(sessionClient, { account: target });
}

// ============================================================
// 8. Update Follow Rules
// ============================================================

async function setFollowRules(sessionClient: any, walletClient: any) {
  const result = await updateAccountFollowRules(sessionClient, {
    // Example: require holding at least 1 ERC20 token to follow
    toAdd: {
      required: [
        {
          tokenGatedRule: {
            token: {
              currency: evmAddress("0xFOLLOW_GATE_TOKEN"),
              value: "1",
              standard: TokenStandard.Erc20,
            },
          },
        },
      ],
      anyOf: [],
    },
    toRemove: [],
  }).andThen(handleOperationWith(walletClient));

  if (result.isErr()) {
    console.error(result.error);
  }
}
