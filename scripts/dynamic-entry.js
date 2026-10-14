// Entry point for Dynamic SDK browser bundle
// Re-exports key APIs from the new Dynamic JS SDK (@dynamic-labs-sdk)
export {
  createDynamicClient,
  initializeClient,
  sendEmailOTP,
  verifyOTP,
  getWalletAccounts,
  getAvailableWalletProvidersData,
  connectAndVerifyWithWalletProvider,
  onEvent,
  logout,
} from '@dynamic-labs-sdk/client';

export { addEvmExtension } from '@dynamic-labs-sdk/evm';

// WaaS (embedded wallet) functions from subpath
export {
  getChainsMissingWaasWalletAccounts,
  createWaasWalletAccounts,
} from '@dynamic-labs-sdk/client/waas';
