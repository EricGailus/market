import { useStaticQuery, graphql } from 'gatsby'
import { EthereumListsChain, getNetworkDataById } from '../utils/web3'

export interface UseNetworkMetadata {
  networksList: { node: EthereumListsChain }[]
}

const networksQuery = graphql`
  query {
    allNetworksMetadataJson {
      edges {
        node {
          chain
          network
          networkId
          chainId
          nativeCurrency {
            name
            symbol
            decimals
          }
        }
      }
    }
  }
`

export default function useNetworkMetadata(): UseNetworkMetadata {
  const data = useStaticQuery(networksQuery)
  const networksList: { node: EthereumListsChain }[] =
    data.allNetworksMetadataJson.edges

  const networkData = getNetworkDataById(networksList, 8996)
  if (!networkData) {
    var addNode = networksList[10]
    addNode.node.chain = 'Local Devel'
    addNode.node.chainId = 8996
    addNode.node.name = 'Local'
    addNode.node.network = 'testnet'
    addNode.node.networkId = 8996

    networksList.push(addNode)
  }

  return { networksList }
}
