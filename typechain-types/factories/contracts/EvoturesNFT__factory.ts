/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  EvoturesNFT,
  EvoturesNFTInterface,
} from "../../contracts/EvoturesNFT";

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
    name: "contractURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "pure",
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
    name: "lastTokenId",
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
        internalType: "uint256",
        name: "_multiplier",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "mintAll",
    outputs: [],
    stateMutability: "nonpayable",
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
    name: "multipliers",
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
  "0x60806040523480156200001157600080fd5b50604080518082018252600d81526c45766f7475726573204e46547360981b60208083019182528351808501909452600884526745564f545552455360c01b90840152815191929162000067916000916200009d565b5080516200007d9060019060208401906200009d565b5050600160075550600680546001600160a01b031916331790556200017f565b828054620000ab9062000143565b90600052602060002090601f016020900481019282620000cf57600085556200011a565b82601f10620000ea57805160ff19168380011785556200011a565b828001600101855582156200011a579182015b828111156200011a578251825591602001919060010190620000fd565b50620001289291506200012c565b5090565b5b808211156200012857600081556001016200012d565b600181811c908216806200015857607f821691505b6020821081036200017957634e487b7160e01b600052602260045260246000fd5b50919050565b6115b8806200018f6000396000f3fe608060405234801561001057600080fd5b50600436106101215760003560e01c806370a08231116100ad578063b88d4fde11610071578063b88d4fde14610266578063c87b56dd14610279578063e8a3d4851461028c578063e985e9c514610294578063f84ddf0b146102d057600080fd5b806370a08231146101f757806391cca3db1461021857806395d89b411461022b578063a22cb46514610233578063ac7fc2631461024657600080fd5b806323b872dd116100f457806323b872dd146101a357806340c10f19146101b657806342842e0e146101c9578063595882b3146101dc5780636352211e146101e457600080fd5b806301ffc9a71461012657806306fdde031461014e578063081812fc14610163578063095ea7b31461018e575b600080fd5b610139610134366004611071565b6102d9565b60405190151581526020015b60405180910390f35b61015661032b565b60405161014591906110e6565b6101766101713660046110f9565b6103bd565b6040516001600160a01b039091168152602001610145565b6101a161019c36600461112e565b6103e4565b005b6101a16101b1366004611158565b6104fe565b6101a16101c436600461112e565b61052f565b6101a16101d7366004611158565b610602565b6101a161061d565b6101766101f23660046110f9565b610687565b61020a610205366004611194565b6106e7565b604051908152602001610145565b600654610176906001600160a01b031681565b61015661076d565b6101a16102413660046111af565b61077c565b61020a6102543660046110f9565b60086020526000908152604090205481565b6101a1610274366004611201565b610787565b6101566102873660046110f9565b6107bf565b610156610826565b6101396102a23660046112dd565b6001600160a01b03918216600090815260056020908152604080832093909416825291909152205460ff1690565b61020a60075481565b60006001600160e01b031982166380ac58cd60e01b148061030a57506001600160e01b03198216635b5e139f60e01b145b8061032557506301ffc9a760e01b6001600160e01b03198316145b92915050565b60606000805461033a90611310565b80601f016020809104026020016040519081016040528092919081815260200182805461036690611310565b80156103b35780601f10610388576101008083540402835291602001916103b3565b820191906000526020600020905b81548152906001019060200180831161039657829003601f168201915b5050505050905090565b60006103c882610846565b506000908152600460205260409020546001600160a01b031690565b60006103ef82610687565b9050806001600160a01b0316836001600160a01b0316036104615760405162461bcd60e51b815260206004820152602160248201527f4552433732313a20617070726f76616c20746f2063757272656e74206f776e656044820152603960f91b60648201526084015b60405180910390fd5b336001600160a01b038216148061047d575061047d81336102a2565b6104ef5760405162461bcd60e51b815260206004820152603d60248201527f4552433732313a20617070726f76652063616c6c6572206973206e6f7420746f60448201527f6b656e206f776e6572206f7220617070726f76656420666f7220616c6c0000006064820152608401610458565b6104f983836108a5565b505050565b6105083382610913565b6105245760405162461bcd60e51b81526004016104589061134a565b6104f9838383610992565b6006546001600160a01b03163314801561054c5750610835600754105b6105985760405162461bcd60e51b815260206004820152601e60248201527f45766f74757265734e46543a2043414c4c45525f49535f4e4f545f44455600006044820152606401610458565b6105a482600754610af6565b600780546000908152600860205260408120839055815491906105c6836113ad565b9190505550600754606514806105df575060075461044d145b156105fe576103e8600760008282546105f891906113c6565b90915550505b5050565b6104f983838360405180602001604052806000815250610787565b60005b61012c8110156106845760075460006107d082111561064c576106456107d0836113de565b9150610665565b6103e8821115610665576106626103e8836113de565b91505b61066f338261052f565b5050808061067c906113ad565b915050610620565b50565b6000818152600260205260408120546001600160a01b0316806103255760405162461bcd60e51b8152602060048201526018602482015277115490cdcc8c4e881a5b9d985b1a59081d1bdad95b88125160421b6044820152606401610458565b60006001600160a01b0382166107515760405162461bcd60e51b815260206004820152602960248201527f4552433732313a2061646472657373207a65726f206973206e6f7420612076616044820152683634b21037bbb732b960b91b6064820152608401610458565b506001600160a01b031660009081526003602052604090205490565b60606001805461033a90611310565b6105fe338383610b10565b6107913383610913565b6107ad5760405162461bcd60e51b81526004016104589061134a565b6107b984848484610bde565b50505050565b60606107ca82610846565b60006107d4610c11565b905060008151116107f4576040518060200160405280600081525061081f565b806107fe84610c31565b60405160200161080f9291906113f5565b6040516020818303038152906040525b9392505050565b606060405180606001604052806027815260200161155c60279139905090565b6000818152600260205260409020546001600160a01b03166106845760405162461bcd60e51b8152602060048201526018602482015277115490cdcc8c4e881a5b9d985b1a59081d1bdad95b88125160421b6044820152606401610458565b600081815260046020526040902080546001600160a01b0319166001600160a01b03841690811790915581906108da82610687565b6001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45050565b60008061091f83610687565b9050806001600160a01b0316846001600160a01b0316148061096657506001600160a01b0380821660009081526005602090815260408083209388168352929052205460ff165b8061098a5750836001600160a01b031661097f846103bd565b6001600160a01b0316145b949350505050565b826001600160a01b03166109a582610687565b6001600160a01b0316146109cb5760405162461bcd60e51b815260040161045890611434565b6001600160a01b038216610a2d5760405162461bcd60e51b8152602060048201526024808201527f4552433732313a207472616e7366657220746f20746865207a65726f206164646044820152637265737360e01b6064820152608401610458565b826001600160a01b0316610a4082610687565b6001600160a01b031614610a665760405162461bcd60e51b815260040161045890611434565b600081815260046020908152604080832080546001600160a01b03199081169091556001600160a01b0387811680865260038552838620805460001901905590871680865283862080546001019055868652600290945282852080549092168417909155905184937fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef91a4505050565b6105fe828260405180602001604052806000815250610cc4565b816001600160a01b0316836001600160a01b031603610b715760405162461bcd60e51b815260206004820152601960248201527f4552433732313a20617070726f766520746f2063616c6c6572000000000000006044820152606401610458565b6001600160a01b03838116600081815260056020908152604080832094871680845294825291829020805460ff191686151590811790915591519182527f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a3505050565b610be9848484610992565b610bf584848484610cf7565b6107b95760405162461bcd60e51b815260040161045890611479565b606060405180606001604052806036815260200161152660369139905090565b60606000610c3e83610df8565b600101905060008167ffffffffffffffff811115610c5e57610c5e6111eb565b6040519080825280601f01601f191660200182016040528015610c88576020820181803683370190505b5090508181016020015b600019016f181899199a1a9b1b9c1cb0b131b232b360811b600a86061a8153600a8504945084610c9257509392505050565b610cce8383610ed0565b610cdb6000848484610cf7565b6104f95760405162461bcd60e51b815260040161045890611479565b60006001600160a01b0384163b15610ded57604051630a85bd0160e11b81526001600160a01b0385169063150b7a0290610d3b9033908990889088906004016114cb565b6020604051808303816000875af1925050508015610d76575060408051601f3d908101601f19168201909252610d7391810190611508565b60015b610dd3573d808015610da4576040519150601f19603f3d011682016040523d82523d6000602084013e610da9565b606091505b508051600003610dcb5760405162461bcd60e51b815260040161045890611479565b805181602001fd5b6001600160e01b031916630a85bd0160e11b14905061098a565b506001949350505050565b60008072184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b8310610e375772184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b830492506040015b6d04ee2d6d415b85acef81000000008310610e63576d04ee2d6d415b85acef8100000000830492506020015b662386f26fc100008310610e8157662386f26fc10000830492506010015b6305f5e1008310610e99576305f5e100830492506008015b6127108310610ead57612710830492506004015b60648310610ebf576064830492506002015b600a83106103255760010192915050565b6001600160a01b038216610f265760405162461bcd60e51b815260206004820181905260248201527f4552433732313a206d696e7420746f20746865207a65726f20616464726573736044820152606401610458565b6000818152600260205260409020546001600160a01b031615610f8b5760405162461bcd60e51b815260206004820152601c60248201527f4552433732313a20746f6b656e20616c7265616479206d696e746564000000006044820152606401610458565b6000818152600260205260409020546001600160a01b031615610ff05760405162461bcd60e51b815260206004820152601c60248201527f4552433732313a20746f6b656e20616c7265616479206d696e746564000000006044820152606401610458565b6001600160a01b038216600081815260036020908152604080832080546001019055848352600290915280822080546001600160a01b0319168417905551839291907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef908290a45050565b6001600160e01b03198116811461068457600080fd5b60006020828403121561108357600080fd5b813561081f8161105b565b60005b838110156110a9578181015183820152602001611091565b838111156107b95750506000910152565b600081518084526110d281602086016020860161108e565b601f01601f19169290920160200192915050565b60208152600061081f60208301846110ba565b60006020828403121561110b57600080fd5b5035919050565b80356001600160a01b038116811461112957600080fd5b919050565b6000806040838503121561114157600080fd5b61114a83611112565b946020939093013593505050565b60008060006060848603121561116d57600080fd5b61117684611112565b925061118460208501611112565b9150604084013590509250925092565b6000602082840312156111a657600080fd5b61081f82611112565b600080604083850312156111c257600080fd5b6111cb83611112565b9150602083013580151581146111e057600080fd5b809150509250929050565b634e487b7160e01b600052604160045260246000fd5b6000806000806080858703121561121757600080fd5b61122085611112565b935061122e60208601611112565b925060408501359150606085013567ffffffffffffffff8082111561125257600080fd5b818701915087601f83011261126657600080fd5b813581811115611278576112786111eb565b604051601f8201601f19908116603f011681019083821181831017156112a0576112a06111eb565b816040528281528a60208487010111156112b957600080fd5b82602086016020830137600060208483010152809550505050505092959194509250565b600080604083850312156112f057600080fd5b6112f983611112565b915061130760208401611112565b90509250929050565b600181811c9082168061132457607f821691505b60208210810361134457634e487b7160e01b600052602260045260246000fd5b50919050565b6020808252602d908201527f4552433732313a2063616c6c6572206973206e6f7420746f6b656e206f776e6560408201526c1c881bdc88185c1c1c9bdd9959609a1b606082015260800190565b634e487b7160e01b600052601160045260246000fd5b6000600182016113bf576113bf611397565b5060010190565b600082198211156113d9576113d9611397565b500190565b6000828210156113f0576113f0611397565b500390565b6000835161140781846020880161108e565b83519083019061141b81836020880161108e565b64173539b7b760d91b9101908152600501949350505050565b60208082526025908201527f4552433732313a207472616e736665722066726f6d20696e636f72726563742060408201526437bbb732b960d91b606082015260800190565b60208082526032908201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560408201527131b2b4bb32b91034b6b83632b6b2b73a32b960711b606082015260800190565b6001600160a01b03858116825284166020820152604081018390526080606082018190526000906114fe908301846110ba565b9695505050505050565b60006020828403121561151a57600080fd5b815161081f8161105b56fe697066733a2f2f516d584e52586253654a564a5447465261363975394131777a31483137706b4238533445587656517475526654452f68747470733a2f2f64617277696e70726f746f636f6c2e696f2f65766f74757265732e6a736f6ea264697066735822122052064ecc33bd2ca6cf8d4df4ed07f023abba8001d4cf09915339257fa66d4f1964736f6c634300080e0033";

type EvoturesNFTConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: EvoturesNFTConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class EvoturesNFT__factory extends ContractFactory {
  constructor(...args: EvoturesNFTConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<EvoturesNFT> {
    return super.deploy(overrides || {}) as Promise<EvoturesNFT>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): EvoturesNFT {
    return super.attach(address) as EvoturesNFT;
  }
  override connect(signer: Signer): EvoturesNFT__factory {
    return super.connect(signer) as EvoturesNFT__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): EvoturesNFTInterface {
    return new utils.Interface(_abi) as EvoturesNFTInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): EvoturesNFT {
    return new Contract(address, _abi, signerOrProvider) as EvoturesNFT;
  }
}
