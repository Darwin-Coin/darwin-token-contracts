/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  LootboxTicket,
  LootboxTicketInterface,
} from "../../contracts/LootboxTicket";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "approved",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "dev",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "evoturesContract",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getApproved",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_dev",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "isApprovedForAll",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "lastTicketId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
      {
        internalType: "enum ILootboxTicket.Rarity",
        name: "_rarity",
        type: "uint8",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_ticketId",
        type: "uint256",
      },
    ],
    name: "openLootBox",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ownerOf",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "rarity",
    outputs: [
      {
        internalType: "enum ILootboxTicket.Rarity",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "tokenURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60a06040523480156200001157600080fd5b50604080518082018252601881527f45766f7475726573204c6f6f74626f78205469636b657473000000000000000060208083019182528351808501909452600784526645564f5449434b60c81b908401528151919291620000769160009162000099565b5080516200008c90600190602084019062000099565b505033608052506200017b565b828054620000a7906200013f565b90600052602060002090601f016020900481019282620000cb576000855562000116565b82601f10620000e657805160ff191683800117855562000116565b8280016001018555821562000116579182015b8281111562000116578251825591602001919060010190620000f9565b506200012492915062000128565b5090565b5b8082111562000124576000815560010162000129565b600181811c908216806200015457607f821691505b6020821081036200017557634e487b7160e01b600052602260045260246000fd5b50919050565b60805161182d620001ac600039600081816102d3015281816105a8015281816106e50152610946015261182d6000f3fe608060405234801561001057600080fd5b506004361061012c5760003560e01c806370a08231116100ad578063b88d4fde11610071578063b88d4fde14610295578063c4d66de8146102a8578063c87b56dd146102bb578063d4ac456d146102ce578063e985e9c5146102f557600080fd5b806370a08231146102245780638b58c5691461023757806391cca3db1461026757806395d89b411461027a578063a22cb4651461028257600080fd5b8063366deaf4116100f4578063366deaf4146101c157806342842e0e146101d857806355a02c2d146101eb5780636352211e146101fe578063691562a01461021157600080fd5b806301ffc9a71461013157806306fdde0314610159578063081812fc1461016e578063095ea7b31461019957806323b872dd146101ae575b600080fd5b61014461013f36600461131c565b610331565b60405190151581526020015b60405180910390f35b610161610383565b6040516101509190611391565b61018161017c3660046113a4565b610415565b6040516001600160a01b039091168152602001610150565b6101ac6101a73660046113d9565b61043c565b005b6101ac6101bc366004611403565b610556565b6101ca60075481565b604051908152602001610150565b6101ac6101e6366004611403565b610587565b6101ac6101f93660046113a4565b6105a2565b61018161020c3660046113a4565b61074d565b6101ac61021f36600461143f565b6107ad565b6101ca61023236600461147a565b61085f565b61025a6102453660046113a4565b60086020526000908152604090205460ff1681565b60405161015091906114ab565b600654610181906001600160a01b031681565b6101616108e5565b6101ac6102903660046114d3565b6108f4565b6101ac6102a336600461151a565b610903565b6101ac6102b636600461147a565b61093b565b6101616102c93660046113a4565b610a9a565b6101817f000000000000000000000000000000000000000000000000000000000000000081565b6101446103033660046115f6565b6001600160a01b03918216600090815260056020908152604080832093909416825291909152205460ff1690565b60006001600160e01b031982166380ac58cd60e01b148061036257506001600160e01b03198216635b5e139f60e01b145b8061037d57506301ffc9a760e01b6001600160e01b03198316145b92915050565b60606000805461039290611629565b80601f01602080910402602001604051908101604052809291908181526020018280546103be90611629565b801561040b5780601f106103e05761010080835404028352916020019161040b565b820191906000526020600020905b8154815290600101906020018083116103ee57829003601f168201915b5050505050905090565b600061042082610b0e565b506000908152600460205260409020546001600160a01b031690565b60006104478261074d565b9050806001600160a01b0316836001600160a01b0316036104b95760405162461bcd60e51b815260206004820152602160248201527f4552433732313a20617070726f76616c20746f2063757272656e74206f776e656044820152603960f91b60648201526084015b60405180910390fd5b336001600160a01b03821614806104d557506104d58133610303565b6105475760405162461bcd60e51b815260206004820152603d60248201527f4552433732313a20617070726f76652063616c6c6572206973206e6f7420746f60448201527f6b656e206f776e6572206f7220617070726f76656420666f7220616c6c00000060648201526084016104b0565b6105518383610b70565b505050565b6105603382610bde565b61057c5760405162461bcd60e51b81526004016104b090611663565b610551838383610c5d565b61055183838360405180602001604052806000815250610903565b6105cd337f000000000000000000000000000000000000000000000000000000000000000083610587565b60008060008381526008602052604090205460ff1660048111156105f3576105f3611495565b036106025750620186a06106c9565b600160008381526008602052604090205460ff16600481111561062757610627611495565b0361063557506175306106c9565b600260008381526008602052604090205460ff16600481111561065a5761065a611495565b0361066857506127106106c9565b600360008381526008602052604090205460ff16600481111561068d5761068d611495565b0361069b57506103e86106c9565b600460008381526008602052604090205460ff1660048111156106c0576106c0611495565b036106c9575060015b6040516340c10f1960e01b8152336004820152602481018290527f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316906340c10f1990604401600060405180830381600087803b15801561073157600080fd5b505af1158015610745573d6000803e3d6000fd5b505050505050565b6000818152600260205260408120546001600160a01b03168061037d5760405162461bcd60e51b8152602060048201526018602482015277115490cdcc8c4e881a5b9d985b1a59081d1bdad95b88125160421b60448201526064016104b0565b6006546001600160a01b031633146108075760405162461bcd60e51b815260206004820152601e60248201527f45766f74757265734e46543a2043414c4c45525f49535f4e4f545f444556000060448201526064016104b0565b61081382600754610dc1565b6007546000908152600860205260409020805482919060ff1916600183600481111561084157610841611495565b021790555060078054906000610856836116b0565b91905055505050565b60006001600160a01b0382166108c95760405162461bcd60e51b815260206004820152602960248201527f4552433732313a2061646472657373207a65726f206973206e6f7420612076616044820152683634b21037bbb732b960b91b60648201526084016104b0565b506001600160a01b031660009081526003602052604090205490565b60606001805461039290611629565b6108ff338383610ddb565b5050565b61090d3383610bde565b6109295760405162461bcd60e51b81526004016104b090611663565b61093584848484610ea9565b50505050565b336001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016146109be5760405162461bcd60e51b815260206004820152602260248201527f4c6f6f74626f785469636b65743a2043414c4c45525f4e4f545f45564f545552604482015261455360f01b60648201526084016104b0565b6006546001600160a01b031615610a225760405162461bcd60e51b815260206004820152602260248201527f4c6f6f74626f785469636b65743a20414c52454144595f494e495449414c495a604482015261115160f21b60648201526084016104b0565b6001600160a01b038116610a785760405162461bcd60e51b815260206004820152601b60248201527f4c6f6f74626f785469636b65743a205a45524f5f41444452455353000000000060448201526064016104b0565b600680546001600160a01b0319166001600160a01b0392909216919091179055565b6060610aa582610b0e565b6000610abc60408051602081019091526000815290565b90506000815111610adc5760405180602001604052806000815250610b07565b80610ae684610edc565b604051602001610af79291906116d7565b6040516020818303038152906040525b9392505050565b6000818152600260205260409020546001600160a01b0316610b6d5760405162461bcd60e51b8152602060048201526018602482015277115490cdcc8c4e881a5b9d985b1a59081d1bdad95b88125160421b60448201526064016104b0565b50565b600081815260046020526040902080546001600160a01b0319166001600160a01b0384169081179091558190610ba58261074d565b6001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45050565b600080610bea8361074d565b9050806001600160a01b0316846001600160a01b03161480610c3157506001600160a01b0380821660009081526005602090815260408083209388168352929052205460ff165b80610c555750836001600160a01b0316610c4a84610415565b6001600160a01b0316145b949350505050565b826001600160a01b0316610c708261074d565b6001600160a01b031614610c965760405162461bcd60e51b81526004016104b090611706565b6001600160a01b038216610cf85760405162461bcd60e51b8152602060048201526024808201527f4552433732313a207472616e7366657220746f20746865207a65726f206164646044820152637265737360e01b60648201526084016104b0565b826001600160a01b0316610d0b8261074d565b6001600160a01b031614610d315760405162461bcd60e51b81526004016104b090611706565b600081815260046020908152604080832080546001600160a01b03199081169091556001600160a01b0387811680865260038552838620805460001901905590871680865283862080546001019055868652600290945282852080549092168417909155905184937fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef91a4505050565b6108ff828260405180602001604052806000815250610f6f565b816001600160a01b0316836001600160a01b031603610e3c5760405162461bcd60e51b815260206004820152601960248201527f4552433732313a20617070726f766520746f2063616c6c65720000000000000060448201526064016104b0565b6001600160a01b03838116600081815260056020908152604080832094871680845294825291829020805460ff191686151590811790915591519182527f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a3505050565b610eb4848484610c5d565b610ec084848484610fa2565b6109355760405162461bcd60e51b81526004016104b09061174b565b60606000610ee9836110a3565b600101905060008167ffffffffffffffff811115610f0957610f09611504565b6040519080825280601f01601f191660200182016040528015610f33576020820181803683370190505b5090508181016020015b600019016f181899199a1a9b1b9c1cb0b131b232b360811b600a86061a8153600a8504945084610f3d57509392505050565b610f79838361117b565b610f866000848484610fa2565b6105515760405162461bcd60e51b81526004016104b09061174b565b60006001600160a01b0384163b1561109857604051630a85bd0160e11b81526001600160a01b0385169063150b7a0290610fe690339089908890889060040161179d565b6020604051808303816000875af1925050508015611021575060408051601f3d908101601f1916820190925261101e918101906117da565b60015b61107e573d80801561104f576040519150601f19603f3d011682016040523d82523d6000602084013e611054565b606091505b5080516000036110765760405162461bcd60e51b81526004016104b09061174b565b805181602001fd5b6001600160e01b031916630a85bd0160e11b149050610c55565b506001949350505050565b60008072184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b83106110e25772184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b830492506040015b6d04ee2d6d415b85acef8100000000831061110e576d04ee2d6d415b85acef8100000000830492506020015b662386f26fc10000831061112c57662386f26fc10000830492506010015b6305f5e1008310611144576305f5e100830492506008015b612710831061115857612710830492506004015b6064831061116a576064830492506002015b600a831061037d5760010192915050565b6001600160a01b0382166111d15760405162461bcd60e51b815260206004820181905260248201527f4552433732313a206d696e7420746f20746865207a65726f206164647265737360448201526064016104b0565b6000818152600260205260409020546001600160a01b0316156112365760405162461bcd60e51b815260206004820152601c60248201527f4552433732313a20746f6b656e20616c7265616479206d696e7465640000000060448201526064016104b0565b6000818152600260205260409020546001600160a01b03161561129b5760405162461bcd60e51b815260206004820152601c60248201527f4552433732313a20746f6b656e20616c7265616479206d696e7465640000000060448201526064016104b0565b6001600160a01b038216600081815260036020908152604080832080546001019055848352600290915280822080546001600160a01b0319168417905551839291907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef908290a45050565b6001600160e01b031981168114610b6d57600080fd5b60006020828403121561132e57600080fd5b8135610b0781611306565b60005b8381101561135457818101518382015260200161133c565b838111156109355750506000910152565b6000815180845261137d816020860160208601611339565b601f01601f19169290920160200192915050565b602081526000610b076020830184611365565b6000602082840312156113b657600080fd5b5035919050565b80356001600160a01b03811681146113d457600080fd5b919050565b600080604083850312156113ec57600080fd5b6113f5836113bd565b946020939093013593505050565b60008060006060848603121561141857600080fd5b611421846113bd565b925061142f602085016113bd565b9150604084013590509250925092565b6000806040838503121561145257600080fd5b61145b836113bd565b915060208301356005811061146f57600080fd5b809150509250929050565b60006020828403121561148c57600080fd5b610b07826113bd565b634e487b7160e01b600052602160045260246000fd5b60208101600583106114cd57634e487b7160e01b600052602160045260246000fd5b91905290565b600080604083850312156114e657600080fd5b6114ef836113bd565b91506020830135801515811461146f57600080fd5b634e487b7160e01b600052604160045260246000fd5b6000806000806080858703121561153057600080fd5b611539856113bd565b9350611547602086016113bd565b925060408501359150606085013567ffffffffffffffff8082111561156b57600080fd5b818701915087601f83011261157f57600080fd5b81358181111561159157611591611504565b604051601f8201601f19908116603f011681019083821181831017156115b9576115b9611504565b816040528281528a60208487010111156115d257600080fd5b82602086016020830137600060208483010152809550505050505092959194509250565b6000806040838503121561160957600080fd5b611612836113bd565b9150611620602084016113bd565b90509250929050565b600181811c9082168061163d57607f821691505b60208210810361165d57634e487b7160e01b600052602260045260246000fd5b50919050565b6020808252602d908201527f4552433732313a2063616c6c6572206973206e6f7420746f6b656e206f776e6560408201526c1c881bdc88185c1c1c9bdd9959609a1b606082015260800190565b6000600182016116d057634e487b7160e01b600052601160045260246000fd5b5060010190565b600083516116e9818460208801611339565b8351908301906116fd818360208801611339565b01949350505050565b60208082526025908201527f4552433732313a207472616e736665722066726f6d20696e636f72726563742060408201526437bbb732b960d91b606082015260800190565b60208082526032908201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560408201527131b2b4bb32b91034b6b83632b6b2b73a32b960711b606082015260800190565b6001600160a01b03858116825284166020820152604081018390526080606082018190526000906117d090830184611365565b9695505050505050565b6000602082840312156117ec57600080fd5b8151610b078161130656fea2646970667358221220cd1159333b3ae5cc3642a86c724d9f8b029d3b15f8728aae8df142a3396904eb64736f6c634300080e0033";

type LootboxTicketConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: LootboxTicketConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class LootboxTicket__factory extends ContractFactory {
  constructor(...args: LootboxTicketConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<LootboxTicket> {
    return super.deploy(overrides || {}) as Promise<LootboxTicket>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): LootboxTicket {
    return super.attach(address) as LootboxTicket;
  }
  override connect(signer: Signer): LootboxTicket__factory {
    return super.connect(signer) as LootboxTicket__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): LootboxTicketInterface {
    return new utils.Interface(_abi) as LootboxTicketInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): LootboxTicket {
    return new Contract(address, _abi, signerOrProvider) as LootboxTicket;
  }
}
