module.exports = {
  client: {
    service: {
      name: 'ocean',
      //url: 'https://subgraph.rinkeby.oceanprotocol.com/subgraphs/name/oceanprotocol/ocean-subgraph',
      url: 'http://127.0.0.1:9000/subgraphs/name/oceanprotocol/ocean-subgraph',
      // optional disable SSL validation check
      skipSSLValidation: true
    }
  }
}
