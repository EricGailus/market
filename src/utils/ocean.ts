import { ConfigHelper, ConfigHelperConfig, Logger } from '@oceanprotocol/lib'
import contractAddresses from '@oceanprotocol/contracts/artifacts/address.json'
import { AbiItem } from 'web3-utils/types'
import Web3 from 'web3'

export function getOceanConfig(network: string | number): ConfigHelperConfig {
  if (network == '1337' || network === undefined || Number.isNaN(network)) {
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

  if (myConfig !== null && (network === 1337 || network === undefined)) {
    config.oceanTokenAddress = '0x2fC1fd21cb222Dc180Ef817dE4c426fd9230b5A5'
    config.factoryAddress = '0x1e6d9207241DbDca82B0D9546490c97B24B1a9f6'
    config.metadataContractAddress =
      '0x9C2a015129969c98E9A5BcBEb61A5F907FF5b629'
    config.fixedRateExchangeAddress =
      '0x91EB42b164664cB28a09B0cF9651b404Ee105afA'
    config.poolFactoryAddress = '0x98b6901cE7C9fc65dBeeC98598136593EB7b4c6C'
    config.dispenserAddress = '0x611f28Ef25D778aFC5a0034Aea94297e2c215a42'
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
