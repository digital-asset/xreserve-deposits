# Deposit Intent Message Hash Tool

Derives deposit intent message hash from xReserve deposit transactions using public RPC endpoints.

## Features

- Fetches transaction data from Ethereum (Sepolia or Mainnet) using free public RPCs
- Decodes `DepositedToRemote` events from xReserve contracts
- Calculates deposit intent nonce from transaction hash and event index
- Encodes deposit intent according to Solidity contract format
- Returns message hash for verification

## Installation

```bash
yarn install
```

## Usage

### Command Line

```bash
yarn derive <tx-hash> [options]
```

**Options:**
- `--rpc <url>` - RPC URL (default: Ethereum Sepolia publicnode.com)
- `--domain N` - Source domain (default: 0 for Ethereum)
- `--event-index N` - Event log index (auto-detects if omitted)

**Example:**

```bash
yarn derive 0xd1ad545d00f14e8ccba3c325366933a3391e049ea0a2a9327f2688c3851a33f8 --event-index 1128 --rpc https://ethereum-rpc.publicnode.com --domain 0
```

## Getting Attestations

Once you have the message hash, you can retrieve the attestation from the Circle xReserve API:

```bash
curl https://xreserve-api.circle.com/v1/attestations/<message-hash>
```

**Example:**

```bash
curl https://xreserve-api.circle.com/v1/attestations/0x1dff52b22959b08acc693105ce48d3022d5a9d9df3eec2ea0d827706a06eb10a
```

**Response:**

```json
{
  "attestation": {
    "payload": "0x5a2e0acd0000000100...",
    "messageHash": "0x1dff52b22959b08acc693105ce48d3022d5a9d9df3eec2ea0d827706a06eb10a",
    "attestation": "0xafe7dd19417e7d6d945bbf35423fb60096e80a31e910f5d382c433826f99002c..."
  }
}
```

The attestation can be used to verify and process the deposit on the destination chain.

## Public RPC Endpoints

**Sepolia (default):**
- `https://ethereum-sepolia-rpc.publicnode.com`

**Mainnet:**
- `https://ethereum-rpc.publicnode.com`
