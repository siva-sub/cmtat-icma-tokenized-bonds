import { createMemoryClient } from 'tevm';
import { requestEip1193 } from 'tevm/decorators';
import { BrowserProvider, Wallet } from 'ethers';

// Hardhat default mnemonic deterministic private keys
const ISSUER_PK = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const INVESTOR_A_PK = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
const INVESTOR_B_PK = '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a';

// Create the Tevm in-memory client (singleton)
export const tevmClient = createMemoryClient();

// Ethers provider and signers — initialized lazily
let _provider: BrowserProvider | null = null;
let _issuerSigner: Wallet | null = null;
let _investorASigner: Wallet | null = null;
let _investorBSigner: Wallet | null = null;
let _ready = false;
let _initPromise: Promise<void> | null = null;

/**
 * Initialize the Tevm + ethers.js bridge.
 * Safe to call multiple times — only runs once.
 */
export async function initClient(): Promise<void> {
    if (_ready) return;
    if (_initPromise) return _initPromise;

    _initPromise = (async () => {
        // Enable EIP-1193 compatibility so ethers BrowserProvider can wrap it
        tevmClient.transport.tevm.extend(requestEip1193());
        await tevmClient.tevmReady();

        // Create the ethers provider backed by Tevm's in-memory EVM
        _provider = new BrowserProvider(tevmClient.transport.tevm);

        // Create deterministic signers connected to the provider
        _issuerSigner = new Wallet(ISSUER_PK, _provider);
        _investorASigner = new Wallet(INVESTOR_A_PK, _provider);
        _investorBSigner = new Wallet(INVESTOR_B_PK, _provider);

        // Fund all accounts with 10,000 ETH each for gas
        const fundAmount = 10000000000000000000000n; // 10,000 ETH
        await tevmClient.setBalance({ address: _issuerSigner.address as `0x${string}`, value: fundAmount });
        await tevmClient.setBalance({ address: _investorASigner.address as `0x${string}`, value: fundAmount });
        await tevmClient.setBalance({ address: _investorBSigner.address as `0x${string}`, value: fundAmount });

        _ready = true;
    })();

    return _initPromise;
}

export function getProvider(): BrowserProvider {
    if (!_provider) throw new Error('Client not initialized. Call initClient() first.');
    return _provider;
}

export function getIssuerSigner(): Wallet {
    if (!_issuerSigner) throw new Error('Client not initialized. Call initClient() first.');
    return _issuerSigner;
}

export function getInvestorASigner(): Wallet {
    if (!_investorASigner) throw new Error('Client not initialized. Call initClient() first.');
    return _investorASigner;
}

export function getInvestorBSigner(): Wallet {
    if (!_investorBSigner) throw new Error('Client not initialized. Call initClient() first.');
    return _investorBSigner;
}

export function isClientReady(): boolean {
    return _ready;
}
