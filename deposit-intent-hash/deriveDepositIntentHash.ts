/**
 * DepositIntent Message Hash Derivation Tool
 * Derives message hash from xReserve deposit transaction
 */

import { keccak256, Hex, Address, encodePacked, hexToBytes, encodeAbiParameters, concat, createPublicClient, http, decodeEventLog, parseAbiItem } from 'viem';

export interface DepositIntent {
  version: number;
  amount: bigint;
  remoteDomain: number;
  remoteToken: Address;
  remoteRecipient: Hex;
  localToken: Address;
  localDepositor: Address;
  maxFee: bigint;
  nonce: Hex;
  hookData?: Hex;
}

export const DEPOSIT_INTENT_MAGIC = '0x5a2e0acd' as Hex;
export const DEPOSIT_INTENT_VERSION = 1;
const DEFAULT_RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com';
const DEFAULT_SOURCE_DOMAIN = 0;

const DEPOSITED_TO_REMOTE_EVENT = parseAbiItem(
  'event DepositedToRemote(address indexed localToken, uint256 value, address indexed localDepositor, bytes32 indexed remoteRecipient, uint32 remoteDomain, bytes32 remoteToken, uint256 maxFee, bytes hookData)'
);

const addressToBytes32 = (address: string): Hex => ('0x' + address.replace(/^0x/, '').padStart(64, '0')) as Hex;

export function calculateDepositIntentNonce(sourceDomain: number, txHash: Hex, eventIndex: number): Hex {
  return keccak256(concat([
    encodeAbiParameters([{ type: 'uint32' }], [sourceDomain]),
    txHash,
    encodeAbiParameters([{ type: 'uint256' }], [BigInt(eventIndex)]),
  ]));
}

export function encodeDepositIntent(intent: DepositIntent): Hex {
  const hookDataBytes = hexToBytes(intent.hookData ?? '0x');
  return encodePacked(
    ['bytes4', 'uint32', 'uint256', 'uint32', 'bytes32', 'bytes32', 'bytes32', 'bytes32', 'uint256', 'bytes32', 'uint32', 'bytes'],
    [
      DEPOSIT_INTENT_MAGIC, intent.version, intent.amount, intent.remoteDomain,
      addressToBytes32(intent.remoteToken), intent.remoteRecipient,
      addressToBytes32(intent.localToken), addressToBytes32(intent.localDepositor),
      intent.maxFee, intent.nonce, hookDataBytes.length, intent.hookData || '0x',
    ],
  );
}

export const calculateMessageHash = (encoded: Hex): Hex => keccak256(encoded);
export const getDepositIntentMessageHash = (intent: DepositIntent): Hex => calculateMessageHash(encodeDepositIntent(intent));

/** Fetches deposit intent from transaction hash */
export async function fetchDepositIntentFromTx(
  txHash: Hex,
  options: {
    rpcUrl?: string;
    sourceDomain?: number;
    eventIndex?: number;
  } = {}
): Promise<DepositIntent> {
  const rpcUrl = options.rpcUrl || DEFAULT_RPC_URL;
  const sourceDomain = options.sourceDomain ?? DEFAULT_SOURCE_DOMAIN;

  const client = createPublicClient({
    transport: http(rpcUrl),
  });

  console.log(`\n🔍 Fetching transaction...`);
  console.log(`   RPC: ${rpcUrl}`);
  console.log(`   Source Domain: ${sourceDomain}`);
  
  const [receipt, tx] = await Promise.all([
    client.getTransactionReceipt({ hash: txHash }),
    client.getTransaction({ hash: txHash }),
  ]);

  if (!receipt) throw new Error('Transaction not found');
  if (!tx.to) throw new Error('Transaction has no recipient (contract call required)');
  
  // Find DepositedToRemote event
  let depositLog;
  if (options.eventIndex !== undefined) {
    // Use specific event index
    depositLog = receipt.logs.find((log) => Number(log.logIndex) === options.eventIndex);
    if (!depositLog) throw new Error(`No log found at index ${options.eventIndex}`);
  } else {
    // Auto-detect: use the transaction's target contract (to address)
    depositLog = receipt.logs.find((log) => log.address.toLowerCase() === tx.to!.toLowerCase());
    if (!depositLog) {
      throw new Error(`No event found from contract ${tx.to}. Use --event-index to specify the log manually`);
    }
  }

  // Try to decode the event
  let event;
  try {
    event = decodeEventLog({
      abi: [DEPOSITED_TO_REMOTE_EVENT],
      data: depositLog.data,
      topics: depositLog.topics,
    });
  } catch (error) {
    // Show available events for debugging
    console.log('\n❌ Failed to decode DepositedToRemote event');
    console.log(`\nAvailable events in transaction:`);
    receipt.logs.forEach((log, i) => {
      console.log(`  [${i}] Log Index: ${log.logIndex}, Address: ${log.address}, Topics: ${log.topics[0]}`);
    });
    throw new Error(
      `Event at index ${Number(depositLog.logIndex)} is not a DepositedToRemote event. ` +
      `Check the list above for the correct event index.`
    );
  }

  const eventIndex = Number(depositLog.logIndex);
  const nonce = calculateDepositIntentNonce(sourceDomain, txHash, eventIndex);

  const args = event.args as {
    localToken: Address;
    value: bigint;
    localDepositor: Address;
    remoteRecipient: Hex;
    remoteDomain: number;
    remoteToken: Hex;
    maxFee: bigint;
    hookData: Hex;
  };

  console.log(`✓ Event Index: ${eventIndex}`);
  console.log(`✓ Source Domain: ${sourceDomain}`);
  console.log(`✓ Depositor: ${args.localDepositor}`);
  console.log(`✓ Amount: ${args.value} (${Number(args.value) / 1e6} USDC)`);
  console.log(`✓ Remote Domain: ${args.remoteDomain}`);
  console.log(`✓ Local Token: ${args.localToken}`);
  console.log(`✓ Remote Token: ${args.remoteToken}`);

  return {
    version: DEPOSIT_INTENT_VERSION,
    amount: args.value,
    remoteDomain: args.remoteDomain,
    remoteToken: args.remoteToken as Address,
    remoteRecipient: args.remoteRecipient,
    localToken: args.localToken,
    localDepositor: args.localDepositor,
    maxFee: args.maxFee,
    nonce,
    hookData: args.hookData === '0x' ? undefined : args.hookData,
  };
}

// ============================================================================
// CLI FUNCTIONALITY
// ============================================================================

function parseCliArgs(args: string[]): {
  txHash?: string;
  rpcUrl?: string;
  sourceDomain?: number;
  eventIndex?: number;
} {
  const result: ReturnType<typeof parseCliArgs> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--rpc' && args[i + 1]) {
      result.rpcUrl = args[++i];
    } else if (arg === '--domain' && args[i + 1]) {
      result.sourceDomain = parseInt(args[++i]);
    } else if (arg === '--event-index' && args[i + 1]) {
      result.eventIndex = parseInt(args[++i]);
    } else if (arg.startsWith('0x') && arg.length === 66) {
      result.txHash = arg;
    }
  }

  return result;
}

async function runCli() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h') || !args[0]) {
    console.log(`
DepositIntent Message Hash Tool

USAGE:
  yarn deriveDepositHash <tx-hash> [--rpc <url>] [--domain N] [--event-index N]

OPTIONS:
  --rpc <url>        RPC URL (default: Ethereum Sepolia publicnode.com)
  --domain N         Source domain (default: 0)
  --event-index N    Event log index (auto-detects if omitted)

EXAMPLE:
  yarn deriveDepositHash 0xd1ad545d00f14e8ccba3c325366933a3391e049ea0a2a9327f2688c3851a33f8 --event-index 1128 --rpc https://ethereum-rpc.publicnode.com --domain 0
`);
    process.exit(0);
  }
  
  try {
    const { txHash, rpcUrl, sourceDomain, eventIndex } = parseCliArgs(args);
    if (!txHash?.startsWith('0x') || txHash.length !== 66) throw new Error('Invalid tx hash');
    
    const intent = await fetchDepositIntentFromTx(txHash as Hex, { rpcUrl, sourceDomain, eventIndex });
    const encoded = encodeDepositIntent(intent);
    const hash = calculateMessageHash(encoded);
    
    console.log('\n✅ Message Hash:', hash);
    console.log('Nonce:', intent.nonce);
    console.log('Encoded:', encoded, '\n');
  } catch (error) {
    console.error('\n❌', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (require.main === module) runCli();
