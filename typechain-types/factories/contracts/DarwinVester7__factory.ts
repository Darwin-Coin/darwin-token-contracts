/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  DarwinVester7,
  DarwinVester7Interface,
  IDarwinVester,
} from "../../contracts/DarwinVester7";

const _abi = [
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_users",
        type: "address[]",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "withdrawn",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "vested",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "vestTimestamp",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "claimed",
            type: "uint256",
          },
        ],
        internalType: "struct IDarwinVester.UserInfo[]",
        name: "_userInfo",
        type: "tuple[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "AlreadyInitialized",
    type: "error",
  },
  {
    inputs: [],
    name: "AmountExceedsClaimable",
    type: "error",
  },
  {
    inputs: [],
    name: "AmountExceedsWithdrawable",
    type: "error",
  },
  {
    inputs: [],
    name: "NotInitialized",
    type: "error",
  },
  {
    inputs: [],
    name: "NotPrivateSale",
    type: "error",
  },
  {
    inputs: [],
    name: "NotVestUser",
    type: "error",
  },
  {
    inputs: [],
    name: "TransferFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "ZeroAddress",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "claimAmount",
        type: "uint256",
      },
    ],
    name: "Claim",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "vestAmount",
        type: "uint256",
      },
    ],
    name: "Vest",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "withdrawAmount",
        type: "uint256",
      },
    ],
    name: "Withdraw",
    type: "event",
  },
  {
    inputs: [],
    name: "INTEREST",
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
    name: "MONTHS",
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
    name: "VESTING_TIME",
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
        name: "_user",
        type: "address",
      },
    ],
    name: "claimableDarwin",
    outputs: [
      {
        internalType: "uint256",
        name: "claimable",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "darwin",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "deployer",
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
        name: "_darwin",
        type: "address",
      },
    ],
    name: "init",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
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
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "userInfo",
    outputs: [
      {
        internalType: "uint256",
        name: "withdrawn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "vested",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "vestTimestamp",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "claimed",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
    ],
    name: "withdrawableDarwin",
    outputs: [
      {
        internalType: "uint256",
        name: "withdrawable",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60806040523480156200001157600080fd5b5060405162000dea38038062000dea8339810160408190526200003491620002fb565b6001600055620000443362000161565b80518251146200009a5760405162461bcd60e51b815260206004820152601a60248201527f566573746572373a20496e76616c6964205f75736572496e666f000000000000604482015260640160405180910390fd5b60005b82518110156200014657818181518110620000bc57620000bc620003d9565b602002602001015160026000858481518110620000dd57620000dd620003d9565b60200260200101516001600160a01b03166001600160a01b031681526020019081526020016000206000820151816000015560208201518160010155604082015181600201556060820151816003015590505080806200013d90620003ef565b9150506200009d565b5050600480546001600160a01b031916331790555062000417565b600180546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b634e487b7160e01b600052604160045260246000fd5b604051608081016001600160401b0381118282101715620001ee57620001ee620001b3565b60405290565b604051601f8201601f191681016001600160401b03811182821017156200021f576200021f620001b3565b604052919050565b60006001600160401b03821115620002435762000243620001b3565b5060051b60200190565b600082601f8301126200025f57600080fd5b8151602062000278620002728362000227565b620001f4565b82815260079290921b840181019181810190868411156200029857600080fd5b8286015b84811015620002f05760808189031215620002b75760008081fd5b620002c1620001c9565b81518152848201518582015260408083015190820152606080830151908201528352918301916080016200029c565b509695505050505050565b600080604083850312156200030f57600080fd5b82516001600160401b03808211156200032757600080fd5b818501915085601f8301126200033c57600080fd5b815160206200034f620002728362000227565b82815260059290921b840181019181810190898411156200036f57600080fd5b948201945b83861015620003a65785516001600160a01b0381168114620003965760008081fd5b8252948201949082019062000374565b91880151919650909350505080821115620003c057600080fd5b50620003cf858286016200024d565b9150509250929050565b634e487b7160e01b600052603260045260246000fd5b6000600182016200041057634e487b7160e01b600052601160045260246000fd5b5060010190565b6109c380620004276000396000f3fe608060405234801561001057600080fd5b50600436106100cf5760003560e01c80638ce910a51161008c578063d5f3948811610066578063d5f39488146101cd578063eec414aa146101e0578063f2fde38b146101f3578063ff60dfb61461020657600080fd5b80638ce910a5146101a15780638da5cb5b146101b45780638fa626f2146101c557600080fd5b80630dea38b6146100d45780631959a002146100ef57806319ab453c146101465780632e1a7d4d1461015b5780633110c7921461016e578063715018a614610199575b600080fd5b6100dc61020f565b6040519081526020015b60405180910390f35b6101266100fd36600461089c565b600260208190526000918252604090912080546001820154928201546003909201549092919084565b6040805194855260208501939093529183015260608201526080016100e6565b61015961015436600461089c565b610220565b005b6101596101693660046108cc565b61030f565b600354610181906001600160a01b031681565b6040516001600160a01b0390911681526020016100e6565b610159610358565b6100dc6101af36600461089c565b61036c565b6001546001600160a01b0316610181565b6100dc600c81565b600454610181906001600160a01b031681565b6100dc6101ee36600461089c565b61041d565b61015961020136600461089c565b6104d4565b6100dc61024781565b61021d600c62278d006108fb565b81565b6004546001600160a01b0316331461027f5760405162461bcd60e51b815260206004820152601c60248201527f566573746572373a2043616c6c6572206e6f74204465706c6f7965720000000060448201526064015b60405180910390fd5b600454600160a01b900460ff16156102d95760405162461bcd60e51b815260206004820152601c60248201527f566573746572373a20416c726561647920696e697469616c697a6564000000006044820152606401610276565b600380546001600160a01b039092166001600160a01b03199092169190911790556004805460ff60a01b1916600160a01b179055565b600454600160a01b900460ff16610339576040516321c4e35760e21b815260040160405180910390fd5b61034161054a565b61034b33826105a3565b6103556001600055565b50565b61036061070d565b61036a6000610767565b565b6001600160a01b0381166000908152600260205260408120600101548082036103985750600092915050565b6001600160a01b038316600090815260026020819052604082206003810154910154909162278d006103ca834261091a565b6103d49190610931565b9050600c8111156103e35750600c5b8281620186a06103f5610247886108fb565b6103ff9190610931565b61040991906108fb565b610413919061091a565b9695505050505050565b6001600160a01b0381166000908152600260205260408120600101548082036104495750600092915050565b6001600160a01b038316600090815260026020819052604082208054910154909162278d00610478834261091a565b6104829190610931565b9050600c8111156104915750600c5b82600c8261049f8388610953565b6104a991906108fb565b6104b39190610931565b6104bd919061091a565b9450838511156104cb578394505b50505050919050565b6104dc61070d565b6001600160a01b0381166105415760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b6064820152608401610276565b61035581610767565b60026000540361059c5760405162461bcd60e51b815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c006044820152606401610276565b6002600055565b6105ac826107b9565b80156107095760006105bd8361041d565b9050808211156105e0576040516304b28d1960e21b815260040160405180910390fd5b6001600160a01b0383166000908152600260205260408120600101805484929061060b90849061091a565b90915550506001600160a01b03831660009081526002602052604081208054849290610638908490610953565b909155505060035460405163a9059cbb60e01b81526001600160a01b038581166004830152602482018590529091169063a9059cbb906044016020604051808303816000875af1158015610690573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106b4919061096b565b6106d1576040516312171d8360e31b815260040160405180910390fd5b60405182906001600160a01b038516907f884edad9ce6fa2440d8a54cc123490eb96d2768479d49ff9c7366125a942436490600090a3505b5050565b6001546001600160a01b0316331461036a5760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152606401610276565b600180546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b60006107c43361036c565b90508015610709576001600160a01b038216600090815260026020526040812060030180548392906107f7908490610953565b90915550506003546040516340c10f1960e01b81526001600160a01b03848116600483015260248201849052909116906340c10f1990604401600060405180830381600087803b15801561084a57600080fd5b505af115801561085e573d6000803e3d6000fd5b50506040518392506001600160a01b03851691507f47cee97cb7acd717b3c0aa1435d004cd5b3c8c57d70dbceb4e4458bbd60e39d490600090a35050565b6000602082840312156108ae57600080fd5b81356001600160a01b03811681146108c557600080fd5b9392505050565b6000602082840312156108de57600080fd5b5035919050565b634e487b7160e01b600052601160045260246000fd5b6000816000190483118215151615610915576109156108e5565b500290565b60008282101561092c5761092c6108e5565b500390565b60008261094e57634e487b7160e01b600052601260045260246000fd5b500490565b60008219821115610966576109666108e5565b500190565b60006020828403121561097d57600080fd5b815180151581146108c557600080fdfea26469706673582212209e727d06fabe790ddeb9ae31f36b972bae0566447e69d3a2e8d4b1b870326f0b64736f6c634300080e0033";

type DarwinVester7ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: DarwinVester7ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class DarwinVester7__factory extends ContractFactory {
  constructor(...args: DarwinVester7ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _users: PromiseOrValue<string>[],
    _userInfo: IDarwinVester.UserInfoStruct[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<DarwinVester7> {
    return super.deploy(
      _users,
      _userInfo,
      overrides || {}
    ) as Promise<DarwinVester7>;
  }
  override getDeployTransaction(
    _users: PromiseOrValue<string>[],
    _userInfo: IDarwinVester.UserInfoStruct[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_users, _userInfo, overrides || {});
  }
  override attach(address: string): DarwinVester7 {
    return super.attach(address) as DarwinVester7;
  }
  override connect(signer: Signer): DarwinVester7__factory {
    return super.connect(signer) as DarwinVester7__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): DarwinVester7Interface {
    return new utils.Interface(_abi) as DarwinVester7Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): DarwinVester7 {
    return new Contract(address, _abi, signerOrProvider) as DarwinVester7;
  }
}
