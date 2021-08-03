import { ConfigHelper, ConfigHelperConfig, Logger } from '@oceanprotocol/lib'
import contractAddresses from '@oceanprotocol/contracts/artifacts/address.json'
import { AbiItem } from 'web3-utils/types'
import Web3 from 'web3'

export function getOceanConfig(network: string | number): ConfigHelperConfig {
  if (network == '1337') {
    network = 'development'
  }

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

  const myConfig = config as ConfigHelperConfig

  if (myConfig !== null && myConfig.subgraphUri === null) {
    myConfig.subgraphUri = 'http://127.0.0.1:9000'
  }

  if (myConfig !== null && network === 1337) {
    config.oceanTokenAddress = '0x02175de5A7F168517688e3E93f55936C9c2C7A19'
    config.factoryAddress = '0xE9dC0B76ceCc3f402C6EA57d5191811B1660AF32'
    config.metadataContractAddress =
      '0xE4f7c64C52085A6df2c7c2972466EEf3ba3aD081'
    config.fixedRateExchangeAddress =
      '0xc6eF91571a6d512985C885cb5EEB7aC8E6C47f4B'
    config.poolFactoryAddress = '0x55E873f9327Ee99a67975C8F2BEa04aD141B2807'
  }
  return myConfig
}

export function getDevelopmentConfig(): Partial<ConfigHelperConfig> {
  return {
    factoryAddress: contractAddresses.development?.DTFactory,
    poolFactoryAddress: contractAddresses.development?.BFactory,
    fixedRateExchangeAddress: contractAddresses.development?.FixedRateExchange,
    metadataContractAddress: contractAddresses.development?.Metadata,
    oceanTokenAddress: contractAddresses.development?.Ocean,
    // There is no subgraph in barge so we hardcode the Rinkeby one for now
    subgraphUri: 'http://127.0.0.1:9000'
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
