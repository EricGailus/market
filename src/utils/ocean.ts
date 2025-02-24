import { ConfigHelper, ConfigHelperConfig, Logger } from '@oceanprotocol/lib'
import contractAddresses from '@oceanprotocol/contracts/artifacts/address.json'
import { AbiItem } from 'web3-utils/types'
import Web3 from 'web3'

export function getOceanConfig(network: string | number): ConfigHelperConfig {
  const config = new ConfigHelper().getConfig(
    network,
    network === 'polygon' ||
      network === 'moonbeamalpha' ||
      network === 1287 ||
      network === 'bsc' ||
      network === 56 ||
      network === 'gaiaxtestnet' ||
      network === 2021000
      ? undefined
      : process.env.GATSBY_INFURA_PROJECT_ID
  )

  if (config !== null && network === 4) {
    config.oceanTokenAddress = '0x8967BCF84170c91B0d24D4302C2376283b0B3a07'
    config.factoryAddress = '0x3fd7A00106038Fb5c802c6d63fa7147Fe429E83a'
    config.metadataContractAddress =
      '0xFD8a7b6297153397B7eb4356C47dbd381d58bFF4'
    config.fixedRateExchangeAddress =
      '0xeD1DfC5F3a589CfC4E8B91C1fbfC18FC6699Fbde'
    config.poolFactoryAddress = '0x53eDF9289B0898e1652Ce009AACf8D25fA9A42F8'
    config.dispenserAddress = '0x623744Cd25Ed553d3b4722667697F926cf99658B'
  }

  return config as ConfigHelperConfig
}

export function getDevelopmentConfig(): Partial<ConfigHelperConfig> {
  return {
    factoryAddress: contractAddresses.development?.DTFactory,
    poolFactoryAddress: contractAddresses.development?.BFactory,
    fixedRateExchangeAddress: contractAddresses.development?.FixedRateExchange,
    metadataContractAddress: contractAddresses.development?.Metadata,
    oceanTokenAddress: contractAddresses.development?.Ocean,
    // There is no subgraph in barge so we hardcode the Rinkeby one for now
    subgraphUri: 'https://subgraph.rinkeby.oceanprotocol.com'
  }
}

export async function getOceanBalance(
  accountId: string,
  networkId: number,
  web3: Web3
): Promise<string> {
  const minABI = [
    {
      constant: true,
      inputs: [
        {
          name: '_owner',
          type: 'address'
        }
      ],
      name: 'balanceOf',
      outputs: [
        {
          name: 'balance',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    }
  ] as AbiItem[]

  try {
    const token = new web3.eth.Contract(
      minABI,
      getOceanConfig(networkId).oceanTokenAddress,
      { from: accountId }
    )
    const result = web3.utils.fromWei(
      await token.methods.balanceOf(accountId).call()
    )
    return result
  } catch (e) {
    Logger.error(`ERROR: Failed to get the balance: ${e.message}`)
  }
}
