/**
 * Lens Protocol — Authentication Flow
 *
 * Authentication uses SIWE (Sign-In With Ethereum) challenge-response.
 * Flow: PublicClient → login() → SessionClient
 *
 * Four login roles:
 *   1. AccountOwner  — full control of an account
 *   2. AccountManager — delegated manager with restricted permissions
 *   3. OnboardingUser — new user creating their first account
 *   4. Builder — app-level authentication (no account needed)
 */

import { PublicClient, testnet, evmAddress } from "@lens-protocol/client";
import { handleOperationWith, signMessageWith } from "@lens-protocol/client/viem";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { chains } from "@lens-chain/sdk/viem";

// ============================================================
// Setup: create a wallet (for demo; in production use browser wallet)
// ============================================================

const account = privateKeyToAccount("0xYOUR_PRIVATE_KEY");
const walletClient = createWalletClient({
  account,
  chain: chains.testnet,
  transport: http(),
});

const client = PublicClient.create({
  environment: testnet,
  origin: "https://myapp.xyz",
});

// ============================================================
// 1. Login as Account Owner
// ============================================================

async function loginAsOwner() {
  const APP_ADDRESS = evmAddress("0xC75A89145d765c396fd75CbD16380Eb184Bd2ca7");
  const ACCOUNT_ADDRESS = evmAddress("0xYOUR_LENS_ACCOUNT_ADDRESS");

  const result = await client.login({
    accountOwner: {
      account: ACCOUNT_ADDRESS,
      owner: account.address,
      app: APP_ADDRESS,
    },
    signMessage: signMessageWith(walletClient),
  });

  if (result.isErr()) {
    console.error("Login failed:", result.error);
    return;
  }

  const sessionClient = result.value;
  console.log("Logged in as owner");

  // SessionClient can now be used for authenticated operations
  return sessionClient;
}

// ============================================================
// 2. Login as Account Manager
// ============================================================

async function loginAsManager() {
  const result = await client.login({
    accountManager: {
      account: evmAddress("0xTHE_LENS_ACCOUNT"),
      manager: account.address,
      app: evmAddress("0xC75A89145d765c396fd75CbD16380Eb184Bd2ca7"),
    },
    signMessage: signMessageWith(walletClient),
  });

  if (result.isErr()) {
    console.error("Login failed:", result.error);
    return;
  }
  return result.value;
}

// ============================================================
// 3. Login as Onboarding User (no existing account)
// ============================================================

async function loginForOnboarding() {
  const result = await client.login({
    onboardingUser: {
      wallet: account.address,
      app: evmAddress("0xC75A89145d765c396fd75CbD16380Eb184Bd2ca7"),
    },
    signMessage: signMessageWith(walletClient),
  });

  if (result.isErr()) {
    console.error("Login failed:", result.error);
    return;
  }

  const sessionClient = result.value;
  // This session can only be used for createAccountWithUsername
  return sessionClient;
}

// ============================================================
// 4. Login as Builder (app-level, no user account)
// ============================================================

async function loginAsBuilder() {
  const result = await client.login({
    builder: {
      address: account.address,
    },
    signMessage: signMessageWith(walletClient),
  });

  if (result.isErr()) {
    console.error("Login failed:", result.error);
    return;
  }
  return result.value;
}

// ============================================================
// 5. Resume Session (from stored credentials)
// ============================================================
//
// The SDK stores session tokens automatically via its Storage
// interface. On next app launch, try resuming instead of re-login.

async function resumeSession() {
  const result = await client.resumeSession();

  if (result.isErr()) {
    console.log("No stored session or session expired, need to login again");
    return null;
  }

  return result.value; // SessionClient
}

// ============================================================
// 6. Get Current Session Info
// ============================================================

import { currentSession, fetchMeDetails } from "@lens-protocol/client/actions";

async function getSessionInfo(sessionClient: any) {
  // Get current session metadata
  const session = await currentSession(sessionClient);
  if (session.isOk()) {
    console.log("Session ID:", session.value.authenticationId);
    console.log("App:", session.value.app);
  }

  // Get authenticated user details
  const me = await fetchMeDetails(sessionClient);
  if (me.isOk()) {
    console.log("Is signless:", me.value.isSignless);
    console.log("Is sponsored:", me.value.isSponsored);
    console.log("Logged in as:", me.value.loggedInAs);
  }
}

// ============================================================
// 7. Switch Account (within same session)
// ============================================================

import { switchAccount } from "@lens-protocol/client/actions";

async function switchToAnotherAccount(sessionClient: any) {
  const result = await switchAccount(sessionClient, {
    account: evmAddress("0xANOTHER_ACCOUNT"),
  });

  if (result.isErr()) {
    console.error("Switch failed:", result.error);
    return;
  }
  // result.value is the new SessionClient
  return result.value;
}

// ============================================================
// 8. Revoke Session
// ============================================================

import { revokeAuthentication } from "@lens-protocol/client/actions";

async function logout(sessionClient: any) {
  const session = await currentSession(sessionClient);
  if (session.isErr()) return;

  await revokeAuthentication(sessionClient, {
    authenticationId: session.value.authenticationId,
  });
  console.log("Logged out");
}

// ============================================================
// 9. Enable Signless Experience
// ============================================================
//
// Once enabled, the Lens API can execute transactions on the
// user's behalf without requiring a signature each time.

import { enableSignless } from "@lens-protocol/client/actions";

async function enableSignlessMode(sessionClient: any) {
  const result = await enableSignless(sessionClient)
    .andThen(handleOperationWith(walletClient));

  if (result.isErr()) {
    console.error("Failed to enable signless:", result.error);
    return;
  }
  console.log("Signless enabled, tx hash:", result.value);
}
