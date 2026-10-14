// MIRROR Protocol — Dynamic.xyz Integration
//
// Adds Dynamic embedded wallet (MPC/TSS secured) with multiple auth methods:
//   - Passkey (WebAuthn)
//   - Email OTP
//   - External wallet (MetaMask, etc.)
//
// Replace DYNAMIC_ENV_ID with your Dynamic environment ID.
// Docs: https://docs.dynamic.xyz/javascript/overview

const DYNAMIC_ENV_ID = "c8c80e00-2780-4067-a7f8-8acf3e576f53";

let dynamicInitialized = false;
let dynamicUser = null;

// ─── Init ────────────────────────────────────────────────────────────────
async function initDynamic() {
  if (DYNAMIC_ENV_ID === "REPLACE_WITH_DYNAMIC_ENVIRONMENT_ID") {
    console.log("[Dynamic] Environment ID not configured — showing demo mode");
    updateDynamicStatus("demo");
    return false;
  }

  if (typeof window.Dynamic === "undefined") {
    console.warn("[Dynamic] SDK bundle not loaded");
    updateDynamicStatus("error");
    return false;
  }

  try {
    const { createDynamicClient, initializeClient, addEvmExtension, onEvent, getWalletAccounts } = window.Dynamic;

    createDynamicClient({
      autoInitialize: false,
      environmentId: DYNAMIC_ENV_ID,
      metadata: {
        name: "MIRROR Protocol",
        universalLink: window.location.origin,
      },
    });

    // Add EVM support (for Monad)
    addEvmExtension();

    void initializeClient();

    // Listen for wallet changes
    onEvent({
      event: "walletAccountsChanged",
      listener: ({ walletAccounts }) => {
        console.log("[Dynamic] Wallet accounts changed:", walletAccounts);
        if (walletAccounts && walletAccounts.length > 0) {
          updateWalletInfoFromDynamic(walletAccounts[0]);
        }
      },
    });

    dynamicInitialized = true;

    // Check existing session
    const accounts = getWalletAccounts();
    if (accounts && accounts.length > 0) {
      updateDynamicStatus("connected");
      updateWalletInfoFromDynamic(accounts[0]);
    }

    return true;
  } catch (err) {
    console.error("[Dynamic] Init failed:", err);
    updateDynamicStatus("error");
    return false;
  }
}

// ─── Login Methods ───────────────────────────────────────────────────────
async function dynamicLogin(method) {
  if (!dynamicInitialized) {
    const inited = await initDynamic();
    if (!inited) {
      showDynamicDemoModal();
      return;
    }
  }

  const { sendEmailOTP, verifyOTP, getChainsMissingWaasWalletAccounts, createWaasWalletAccounts,
          connectAndVerifyWithWalletProvider } = window.Dynamic;

  try {
    if (method === "email") {
      const email = prompt("Enter your email for OTP login:");
      if (!email) return;

      const otpVerification = await sendEmailOTP({ email });
      const otp = prompt("Enter the 6-digit code sent to your email:");
      if (!otp) return;

      await verifyOTP({
        otpVerification,
        verificationToken: otp,
      });

      // Create embedded WaaS wallet (required — not automatic)
      const missingChains = getChainsMissingWaasWalletAccounts();
      await createWaasWalletAccounts({ chains: missingChains });

      updateDynamicStatus("connected");
      showSuccessToast("Signed in with Dynamic!");

    } else if (method === "wallet") {
      const walletAccount = await connectAndVerifyWithWalletProvider({
        walletProviderKey: "metamask",
      });

      if (walletAccount) {
        updateDynamicStatus("connected");
        updateWalletInfoFromDynamic(walletAccount);
        showSuccessToast("Wallet connected via Dynamic!");
      }

    } else if (method === "passkey") {
      // Passkey login via Dynamic SDK
      alert("Passkey login requires Dynamic dashboard configuration.\n\nFor now, try Email OTP or External Wallet.");
    }

    closeDynamicMenu();
  } catch (err) {
    console.error("[Dynamic] Login failed:", err);
    alert("Login failed: " + (err.message || err));
  }
}

async function dynamicLogout() {
  if (!dynamicInitialized) return;
  try {
    await window.Dynamic.logout();
    dynamicUser = null;
    updateDynamicStatus("disconnected");
    closeDynamicMenu();
    showSuccessToast("Signed out");
  } catch (err) {
    console.error("[Dynamic] Logout failed:", err);
  }
}

// ─── UI Helpers ──────────────────────────────────────────────────────────
function updateDynamicStatus(status) {
  const btn = document.getElementById("dynamicBtn");
  if (!btn) return;

  switch (status) {
    case "connected":
      btn.textContent = "✓ Dynamic";
      btn.classList.add("connected");
      btn.onclick = toggleDynamicMenu;
      break;
    case "demo":
      btn.textContent = "🔐 Dynamic Wallet";
      btn.onclick = showDynamicDemoModal;
      break;
    case "error":
      btn.textContent = "⚠ Dynamic";
      btn.onclick = showDynamicDemoModal;
      break;
    default:
      btn.textContent = "🔐 Dynamic Wallet";
      btn.onclick = toggleDynamicMenu;
  }
}

function toggleDynamicMenu() {
  const menu = document.getElementById("dynamicMenu");
  if (!menu) {
    createDynamicMenu();
    return;
  }
  menu.style.display = menu.style.display === "none" ? "block" : "none";
}

function closeDynamicMenu() {
  const menu = document.getElementById("dynamicMenu");
  if (menu) menu.style.display = "none";
}

function createDynamicMenu() {
  const header = document.querySelector(".header");
  if (!header) return;

  const menu = document.createElement("div");
  menu.id = "dynamicMenu";
  menu.className = "dynamic-menu";

  const { getWalletAccounts } = window.Dynamic || {};
  const accounts = getWalletAccounts ? getWalletAccounts() : [];
  const wallet = accounts?.[0];

  if (wallet) {
    menu.innerHTML = `
      <div style="margin-bottom: 12px;">
        <div style="font-size: 12px; color: #888; margin-bottom: 4px;">Dynamic Wallet</div>
        <div style="font-family: monospace; font-size: 13px; color: #667eea; font-weight: 600;">
          ${wallet.address?.slice(0, 10)}…${wallet.address?.slice(-6)}
        </div>
        <div style="font-size: 11px; color: #888; margin-top: 4px;">
          MPC secured · Non-custodial
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px; padding-top: 12px; border-top: 1px solid #2a2a3a;">
        <button onclick="dynamicLogout()" style="padding: 8px 12px; background: #2a2a3a; color: #e8e8ec; border: none; border-radius: 6px; cursor: pointer; font-size: 13px;">Sign Out</button>
      </div>
    `;
  } else {
    menu.innerHTML = `
      <div style="font-weight: 600; color: #fff; margin-bottom: 12px;">Connect with Dynamic</div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <button onclick="dynamicLogin('email')" style="padding: 10px 12px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600;">📧 Email OTP Login</button>
        <button onclick="dynamicLogin('passkey')" style="padding: 10px 12px; background: #2a2a3a; color: #e8e8ec; border: none; border-radius: 6px; cursor: pointer; font-size: 13px;">🔑 Passkey Login</button>
        <button onclick="dynamicLogin('wallet')" style="padding: 10px 12px; background: #2a2a3a; color: #e8e8ec; border: none; border-radius: 6px; cursor: pointer; font-size: 13px;">👛 External Wallet</button>
      </div>
      <div style="font-size: 11px; color: #666; margin-top: 12px; text-align: center; line-height: 1.4;">
        MPC/TSS secured · Non-custodial embedded wallet
      </div>
    `;
  }

  header.appendChild(menu);
  menu.style.display = "block";
}

function updateWalletInfoFromDynamic(wallet) {
  if (!wallet || !wallet.address) return;

  // Update wallet display
  const walletAddr = document.getElementById("walletAddress");
  if (walletAddr) {
    walletAddr.textContent = wallet.address.slice(0, 10) + "…" + wallet.address.slice(-6);
  }

  // Store for use in attestation flow
  window.dynamicWallet = wallet;
}

// ─── Demo Mode (when no env ID configured) ──────────────────────────────
function showDynamicDemoModal() {
  // Create a beautiful demo modal showing Dynamic features
  const existing = document.getElementById("dynamicDemoModal");
  if (existing) { existing.remove(); }

  const modal = document.createElement("div");
  modal.id = "dynamicDemoModal";
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.7); z-index: 10000;
    display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(4px);
  `;

  modal.innerHTML = `
    <div style="background: #1a1a2e; border: 1px solid #2a2a3a; border-radius: 16px; padding: 32px; max-width: 480px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="font-size: 48px; margin-bottom: 12px;">🔐</div>
        <h2 style="color: #fff; margin-bottom: 8px;">Dynamic Wallet</h2>
        <p style="color: #888; font-size: 14px;">MPC/TSS Secured · Non-custodial · Embedded</p>
      </div>

      <div style="background: #0f0f1a; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <div style="font-size: 13px; color: #888; margin-bottom: 12px; font-weight: 600;">✨ FEATURES</div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 10px; font-size: 13px; color: #e8e8ec;">
            <span style="font-size: 16px;">🔑</span>
            <span><strong>Passkey Login</strong> — WebAuthn, no passwords</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; font-size: 13px; color: #e8e8ec;">
            <span style="font-size: 16px;">📧</span>
            <span><strong>Email OTP</strong> — One-click magic login</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; font-size: 13px; color: #e8e8ec;">
            <span style="font-size: 16px;">👛</span>
            <span><strong>External Wallets</strong> — MetaMask & more</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; font-size: 13px; color: #e8e8ec;">
            <span style="font-size: 16px;">🔒</span>
            <span><strong>MPC/TSS Security</strong> — Key never assembled</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; font-size: 13px; color: #e8e8ec;">
            <span style="font-size: 16px;">⚡</span>
            <span><strong>Sub-second Signing</strong> — Enterprise-grade</span>
          </div>
        </div>
      </div>

      <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px; padding: 12px; margin-bottom: 20px;">
        <div style="font-size: 12px; color: #60a5fa; margin-bottom: 4px;">💡 To enable live login:</div>
        <div style="font-size: 12px; color: #e8e8ec; line-height: 1.5;">
          Set your Dynamic Environment ID in <code style="background: #0f0f1a; padding: 2px 6px; border-radius: 4px; font-size: 11px;">demo/dynamic-integration.js</code>
        </div>
      </div>

      <button onclick="document.getElementById('dynamicDemoModal').remove()"
        style="width: 100%; padding: 12px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">
        Got it
      </button>
    </div>
  `;

  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
  document.body.appendChild(modal);
}

function showSuccessToast(msg) {
  const toast = document.createElement("div");
  toast.textContent = msg;
  toast.style.cssText = `
    position: fixed; top: 80px; right: 30px;
    background: #10b981; color: white; padding: 12px 20px;
    border-radius: 8px; font-size: 14px; font-weight: 600;
    z-index: 10001; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
    animation: slideIn 0.3s ease-out;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ─── Expose Globally ─────────────────────────────────────────────────────
window.initDynamic = initDynamic;
window.dynamicLogin = dynamicLogin;
window.dynamicLogout = dynamicLogout;
window.toggleDynamicMenu = toggleDynamicMenu;
window.closeDynamicMenu = closeDynamicMenu;
window.showDynamicDemoModal = showDynamicDemoModal;

// Auto-init on load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDynamic);
} else {
  initDynamic();
}
