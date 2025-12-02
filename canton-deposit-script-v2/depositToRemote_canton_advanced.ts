import { Contract, JsonRpcProvider, Wallet, parseUnits, keccak256, TransactionRequest, Transaction } from 'ethers';
import { config, X_RESERVE_ABI, ERC20_ABI } from './config_canton';

/**
 * Main function that sends the depositToRemote transaction to Canton
 * This version uses separated signing logic suitable for KMS or other wallet providers
 */
async function main() {
    // Setup provider (no wallet needed - we only know the address)
    const provider = new JsonRpcProvider(config.ETH_RPC_URL);
    console.log(`Using signer address: ${config.SIGNER_ADDRESS}`);

    // Setup contract instances (without signer - read-only)
    const xReserveContract = new Contract(config.X_RESERVE_CONTRACT, X_RESERVE_ABI, provider);
    const tokenContract = new Contract(config.ETH_USDC_CONTRACT, ERC20_ABI, provider);

    // Prepare transaction parameters (assuming 6 decimals for USDC)
    const value = parseUnits(config.DEPOSIT_AMOUNT, 6);
    const maxFee = parseUnits(config.MAX_FEE, 6);
    const remoteRecipientBytes32 = keccak256(Buffer.from(config.CANTON_RECIPIENT, 'utf8')); // remoteRecipientBytes32 is the keccak256 hash of the Canton party ID
    const hookData = '0x' + Buffer.from(config.CANTON_RECIPIENT, 'utf8').toString('hex'); // hookData is the hex bytes of the Canton party ID

    try {
        console.log(`\nPreparing to deposit ${config.DEPOSIT_AMOUNT} USDC to Canton recipient: ${config.CANTON_RECIPIENT}`);

        // Check ETH and USDC balance before attempting deposit
        const ethBalance = await provider.getBalance(config.SIGNER_ADDRESS);
        console.log(`ETH balance: ${ethBalance.toString()} wei (${(Number(ethBalance) / 1e18).toFixed(18)} ETH)`);
        if (ethBalance === 0n) {
            throw new Error('Insufficient ETH balance for gas fees');
        }

        // You can get testnet USDC on Eth-Sepolia from https://faucet.circle.com/
        const usdcBalance = await tokenContract.balanceOf(config.SIGNER_ADDRESS);
        console.log(`USDC balance: ${usdcBalance.toString()} (${(Number(usdcBalance) / 1e6).toFixed(6)} USDC)`);
        if (usdcBalance < value) {
            throw new Error(`Insufficient USDC balance. Required: ${(Number(value) / 1e6).toFixed(6)} USDC, Available: ${(Number(usdcBalance) / 1e6).toFixed(6)} USDC`);
        }

        // Step 1: Build unsigned approval transaction
        console.log('\n📝 Step 1: Building approval transaction...');
        const approvalData = tokenContract.interface.encodeFunctionData('approve', [
            config.X_RESERVE_CONTRACT,
            value
        ]);
        
        const approvalTx = await populateTransaction(provider, {
            to: config.ETH_USDC_CONTRACT,
            data: approvalData,
        });
        
        console.log('Approval transaction populated:', {
            to: approvalTx.to,
            nonce: approvalTx.nonce,
            gasLimit: approvalTx.gasLimit?.toString(),
            maxFeePerGas: approvalTx.maxFeePerGas?.toString(),
        });

        // Step 2: Sign approval transaction with wallet provider
        const signedApprovalTx = await signTransaction(approvalTx);

        // Step 3: Submit signed approval transaction
        console.log('📤 Submitting approval transaction...');
        const approvalTxResponse = await provider.broadcastTransaction(signedApprovalTx);
        console.log('🔗 Approval transaction hash (signed tx on blockchain):', approvalTxResponse.hash);
        await approvalTxResponse.wait();
        console.log('✅ Approval confirmed');

        // Step 4: Build unsigned depositToRemote transaction
        console.log('\n📝 Step 2: Building deposit transaction...');
        const depositData = xReserveContract.interface.encodeFunctionData('depositToRemote', [
            value,
            config.CANTON_DOMAIN,
            remoteRecipientBytes32,
            config.ETH_USDC_CONTRACT,
            maxFee,
            hookData
        ]);

        const depositTx = await populateTransaction(provider, {
            to: config.X_RESERVE_CONTRACT,
            data: depositData,
        });
        
        console.log('Deposit transaction populated:', {
            to: depositTx.to,
            nonce: depositTx.nonce,
            gasLimit: depositTx.gasLimit?.toString(),
            maxFeePerGas: depositTx.maxFeePerGas?.toString(),
        });

        // Step 5: Sign deposit transaction with wallet provider
        const signedDepositTx = await signTransaction(depositTx);

        // Step 6: Submit signed deposit transaction
        console.log('📤 Submitting deposit transaction...');
        const depositTxResponse = await provider.broadcastTransaction(signedDepositTx);
        console.log('🔗 Deposit transaction hash (signed tx on blockchain):', depositTxResponse.hash);
        const receipt = await depositTxResponse.wait();
        console.log('✅ Transaction confirmed in block:', receipt?.blockNumber);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

/**
 * Populates missing transaction fields like nonce, gas limit, gas prices, and chainId
 * @param provider The JSON RPC provider
 * @param tx The partial transaction request
 * @returns Complete transaction request with all fields populated
 */
async function populateTransaction(provider: JsonRpcProvider, tx: TransactionRequest): Promise<TransactionRequest> {
    const populatedTx = { ...tx };
    
    // Auto-fill from address if not set
    if (!populatedTx.from) {
        populatedTx.from = config.SIGNER_ADDRESS;
    }
    
    // Auto-fill nonce if not set
    if (populatedTx.nonce === undefined) {
        populatedTx.nonce = await provider.getTransactionCount(config.SIGNER_ADDRESS, 'pending');
    }
    
    // Auto-fill chainId if not set
    if (populatedTx.chainId === undefined) {
        populatedTx.chainId = (await provider.getNetwork()).chainId;
    }
    
    // Auto-fill gas prices (EIP-1559) if not set
    if (populatedTx.maxFeePerGas === undefined || populatedTx.maxPriorityFeePerGas === undefined) {
        const feeData = await provider.getFeeData();
        if (!populatedTx.maxFeePerGas && feeData.maxFeePerGas) {
            populatedTx.maxFeePerGas = feeData.maxFeePerGas;
        }
        if (!populatedTx.maxPriorityFeePerGas && feeData.maxPriorityFeePerGas) {
            populatedTx.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
        }
    }
    
    // Auto-fill gas limit if not set
    if (populatedTx.gasLimit === undefined) {
        try {
            populatedTx.gasLimit = await provider.estimateGas(populatedTx);
        } catch (error) {
            console.warn('Could not estimate gas, you may need to set gasLimit manually');
        }
    }
    
    return populatedTx;
}

/**
 * Signs a transaction by signing its hash - this is a separate step to allow for different signing methods
 * @param unsignedTx The unsigned transaction request
 * @returns The signed transaction as a hex string
 * 
 * This function can be replaced with any wallet provider logic:
 * - Browser-based wallet signing (e.g., MetaMask, WalletConnect)
 * - KMS-based signing (AWS KMS, GCP KMS, Azure Key Vault)
 * - Hardware wallet signing (Ledger, Trezor)
 * - Multi-signature wallet signing
 * 
 * The key point is that transaction preparation happens separately from signing,
 * allowing the private key to be stored securely and not exposed in service code.
 */
async function signTransaction(unsignedTx: TransactionRequest): Promise<string> {
    console.log('\n🔐 Signing transaction...');
    
    // Step 1: Create a Transaction object and serialize it to get the signing hash
    // Remove 'from' field as it's derived from the signature, not part of unsigned tx
    const { from, ...txWithoutFrom } = unsignedTx;
    const tx = Transaction.from(txWithoutFrom as any);
    const unsignedSerialized = tx.unsignedSerialized;
    const unsignedTxHash = keccak256(unsignedSerialized);
    
    console.log('📄 Unsigned hash:', unsignedTxHash);
    console.log('   Transaction details:', {
        to: unsignedTx.to,
        from: unsignedTx.from,
        nonce: unsignedTx.nonce,
    });
    
    // Step 2: Sign the hash
    // Replace this block with your preferred signing method:
    
    // Example: Using private key (simplest method)
    // NOTE if using this method it is recommended to derive the public address from here and not from 
    // a configuration file, to ensure the private key matches the expected signer address.
    const wallet = new Wallet(config.SIGNER_PRIVATE_KEY);
    const signature = wallet.signingKey.sign(unsignedTxHash);
    
    // Alternative example - KMS service would sign the hash:
    // const signature = await kmsService.signHash(unsignedTxHash, config.SIGNER_ADDRESS);
    // KMS would return { r, s, v } signature components which needs to be packed into a single 65 byte signature
    
    // Alternative example - Hardware wallet:
    // const signature = await ledgerService.signHash(unsignedTxHash);
    
    // Step 3: Reconstruct the signed transaction with the signature
    tx.signature = signature;
    const signedTx = tx.serialized;
    
    console.log('✅ Transaction signed successfully');
    return signedTx;
}

// Handle script errors
main().catch((error) => {
    console.error('💥 Script error:', error);
    process.exit(1);
});
