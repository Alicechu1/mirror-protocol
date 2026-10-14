// Mera Passkey Integration for MIRROR Protocol
// Uses @category-labs/mera via esm.sh
//
// Creative Use angle: PRF-derived persona baseline commitments
//   - Passkey PRF output → deterministic derivation of 4-lane baseline vector
//   - Same passkey + same salt → same baseline, on any device
//   - No server stores the baseline; the passkey IS the key
//
// Best UX angle: Passkey-first wallet experience
//   - One biometric tap → wallet derived + signed in
//   - No seed phrase, no extension install
//   - secp256k1 signing session for on-chain attestations

import {
  createPasskeyWithPrfOutput,
  getPasskeyPrfOutput,
  createSecp256k1SigningSession,
  getEvmAddress
} from "https://esm.sh/@category-labs/mera@0.1.0";

// Constants
const RP_ID = location.hostname === "localhost" ? "localhost" : location.hostname;
const RP_NAME = "MIRROR Protocol";

// Namespaced salts — each produces a different, deterministic PRF output
const SALT_BASELINE = strToBytes("mirror.baseline.v1");
const SALT_WALLET = strToBytes("mirror.wallet.v1");

// Global Mera state
window.mera = {
  ready: false,
  credentialId: null,
  address: null,
  prfOutput: null, // cached after login, used for baseline derivation
  signingSession: null
};

function strToBytes(str) {
  // SHA-256 the string to get a 32-byte salt
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  // We'll use crypto.subtle to hash, but need async.
  // For sync usage below, we pad/truncate instead.
  const bytes = new Uint8Array(32);
  const strBytes = encoder.encode(str);
  bytes.set(strBytes.slice(0, 32));
  return bytes;
}

async function sha256Bytes(data) {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hashBuffer);
}

// Derive a 4-lane baseline vector from PRF output
// Uses different salt offsets for each lane to make them independent
async function deriveBaselineVector(prfOutput) {
  const lanes = [];
  for (let i = 0; i < 4; i++) {
    // For each lane, mix PRF output with lane index via SHA-256
    const mix = new Uint8Array(prfOutput.length + 1);
    mix.set(prfOutput);
    mix[prfOutput.length] = i;
    const hash = await sha256Bytes(mix);
    // Take first 4 bytes as a uint32, then mod to fit a reasonable lane value (0-10000)
    const view = new DataView(hash.buffer);
    const raw = view.getUint32(0, false);
    lanes.push(raw % 10001); // 0-10000 range, matches demo slider scale
  }
  return lanes;
}

// Register a new passkey
async function meraRegister(username) {
  try {
    const user = {
      name: username || "mirror-user",
      displayName: username || "MIRROR User"
    };

    const result = await createPasskeyWithPrfOutput({
      rp: { id: RP_ID, name: RP_NAME },
      user,
      prfSalt: SALT_WALLET // Get wallet PRF during creation
    });

    // Save credentialId for next login
    localStorage.setItem("mera_credential_id", result.credentialId);
    localStorage.setItem("mera_username", username || "mirror-user");

    // Derive wallet from PRF output
    await setupWalletFromPrf(result.prfOutput);

    window.mera.credentialId = result.credentialId;
    window.mera.ready = true;

    return {
      success: true,
      credentialId: result.credentialId,
      address: window.mera.address
    };
  } catch (e) {
    console.error("Mera register failed:", e);
    return { success: false, error: e.message };
  }
}

// Login with existing passkey
async function meraLogin() {
  try {
    const credentialId = localStorage.getItem("mera_credential_id");
    const username = localStorage.getItem("mera_username") || "mirror-user";

    const result = await getPasskeyPrfOutput({
      rpId: RP_ID,
      credential: credentialId ? { credentialId } : undefined,
      prfSalt: SALT_WALLET
    });

    await setupWalletFromPrf(result.prfOutput);

    window.mera.credentialId = result.credentialId;
    window.mera.ready = true;

    return {
      success: true,
      credentialId: result.credentialId,
      address: window.mera.address,
      username
    };
  } catch (e) {
    console.error("Mera login failed:", e);
    return { success: false, error: e.message };
  }
}

// Derive secp256k1 wallet from PRF output
async function setupWalletFromPrf(prfOutput) {
  window.mera.prfOutput = prfOutput;

  // Use PRF output directly as private key seed
  // Verify it's a valid secp256k1 scalar (the probability of being invalid is negligible)
  const privateKey = prfOutput;

  window.mera.signingSession = createSecp256k1SigningSession({ privateKey });
  window.mera.address = getEvmAddress(window.mera.signingSession.publicKey);
}

// Get baseline vector derived from passkey
// Uses a DIFFERENT salt than wallet derivation
async function meraGetBaselineVector() {
  if (!window.mera.credentialId) {
    throw new Error("Not logged in with Mera");
  }

  // Get PRF output with baseline-specific salt
  const result = await getPasskeyPrfOutput({
    rpId: RP_ID,
    credential: { credentialId: window.mera.credentialId },
    prfSalt: SALT_BASELINE
  });

  // Derive 4-lane vector from the baseline PRF output
  const lanes = await deriveBaselineVector(result.prfOutput);
  return lanes;
}

// Sign a transaction digest using Mera signing session
async function meraSignDigest(digestHex) {
  if (!window.mera.signingSession) {
    throw new Error("No Mera signing session");
  }

  const digestBytes = hexToBytes(digestHex);
  const { compact, recovery } = await window.mera.signingSession.signDigest(digestBytes);
  return {
    r: "0x" + bytesToHex(compact.slice(0, 32)),
    s: "0x" + bytesToHex(compact.slice(32, 64)),
    v: recovery,
    compact: "0x" + bytesToHex(compact)
  };
}

// Helper: hex string → Uint8Array
function hexToBytes(hex) {
  hex = hex.replace(/^0x/, "");
  if (hex.length % 2) hex = "0" + hex;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

// Helper: Uint8Array → hex string
function bytesToHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

// Export to window
window.meraRegister = meraRegister;
window.meraLogin = meraLogin;
window.meraGetBaselineVector = meraGetBaselineVector;
window.meraSignDigest = meraSignDigest;
window.meraRP = { id: RP_ID, name: RP_NAME };
