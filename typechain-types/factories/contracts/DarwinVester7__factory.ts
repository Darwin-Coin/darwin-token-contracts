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
          {
            internalType: "uint256",
            name: "boost",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "nft",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        internalType: "struct IDarwinVester.UserInfo[]",
        name: "_userInfo",
        type: "tuple[]",
      },
      {
        internalType: "address[]",
        name: "_supportedNFTs",
        type: "address[]",
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
        name: "evotureTokenId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "multiplier",
        type: "uint256",
      },
    ],
    name: "StakeEvoture",
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
        name: "evotureTokenId",
        type: "uint256",
      },
    ],
    name: "WithdrawEvoture",
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
        name: "_nft",
        type: "address",
      },
    ],
    name: "addSupportedNFT",
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
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "onERC721Received",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
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
    inputs: [
      {
        internalType: "address",
        name: "_nft",
        type: "address",
      },
    ],
    name: "removeSupportedNFT",
    outputs: [],
    stateMutability: "nonpayable",
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
        name: "_nft",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_tokenId",
        type: "uint256",
      },
    ],
    name: "stakeEvoture",
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
    name: "supportedNFT",
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
      {
        internalType: "uint256",
        name: "boost",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "nft",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
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
    inputs: [],
    name: "withdrawEvoture",
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
  "0x60806040523480156200001157600080fd5b506040516200158c3803806200158c83398101604081905262000034916200037e565b60016000556200004433620001f9565b81518351146200009a5760405162461bcd60e51b815260206004820152601a60248201527f566573746572373a20496e76616c6964205f75736572496e666f000000000000604482015260640160405180910390fd5b60005b83518110156200016d57828181518110620000bc57620000bc620004ca565b602002602001015160036000868481518110620000dd57620000dd620004ca565b6020908102919091018101516001600160a01b03908116835282820193909352604091820160002084518155908401516001820155908301516002820155606083015160038201556080830151600482015560a08301516005820180546001600160a01b031916919093161790915560c090910151600690910155806200016481620004e0565b9150506200009d565b50600580546001600160a01b0319163317905560005b8151811015620001ef57600160026000848481518110620001a857620001a8620004ca565b6020908102919091018101516001600160a01b03168252810191909152604001600020805460ff191691151591909117905580620001e681620004e0565b91505062000183565b5050505062000508565b600180546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b634e487b7160e01b600052604160045260246000fd5b60405160e081016001600160401b03811182821017156200028657620002866200024b565b60405290565b604051601f8201601f191681016001600160401b0381118282101715620002b757620002b76200024b565b604052919050565b60006001600160401b03821115620002db57620002db6200024b565b5060051b60200190565b80516001600160a01b0381168114620002fd57600080fd5b919050565b600082601f8301126200031457600080fd5b815160206200032d6200032783620002bf565b6200028c565b82815260059290921b840181019181810190868411156200034d57600080fd5b8286015b8481101562000373576200036581620002e5565b835291830191830162000351565b509695505050505050565b600080600060608085870312156200039557600080fd5b84516001600160401b0380821115620003ad57600080fd5b620003bb8883890162000302565b9550602091508187015181811115620003d357600080fd5b8701601f81018913620003e557600080fd5b8051620003f66200032782620002bf565b81815260e0918202830185019185820191908c8411156200041657600080fd5b938601935b83851015620004945780858e031215620004355760008081fd5b6200043f62000261565b8551815287860151888201526040808701519082015288860151898201526080808701519082015260a062000476818801620002e5565b9082015260c08681015190820152835293840193918601916200041b565b5060408b0151909850955050505080831115620004b057600080fd5b5050620004c08682870162000302565b9150509250925092565b634e487b7160e01b600052603260045260246000fd5b6000600182016200050157634e487b7160e01b600052601160045260246000fd5b5060010190565b61107480620005186000396000f3fe608060405234801561001057600080fd5b50600436106101215760003560e01c80637b2c3a85116100ad578063d5f3948811610071578063d5f3948814610302578063eec414aa14610315578063f2fde38b14610328578063f65e0dfd1461033b578063ff60dfb61461034357600080fd5b80637b2c3a85146102b05780638ce910a5146102c35780638da5cb5b146102d65780638fa626f2146102e7578063c8312a54146102ef57600080fd5b80632e1a7d4d116100f45780632e1a7d4d146102245780633110c79214610237578063566a7ac314610262578063715018a6146102955780637b1eb2191461029d57600080fd5b80630dea38b614610126578063150b7a02146101415780631959a0021461017957806319ab453c1461020f575b600080fd5b61012e61034c565b6040519081526020015b60405180910390f35b61016061014f366004610e7d565b630a85bd0160e11b95945050505050565b6040516001600160e01b03199091168152602001610138565b6101d1610187366004610f18565b60036020819052600091825260409091208054600182015460028301549383015460048401546005850154600690950154939592949293919290916001600160a01b039091169087565b60408051978852602088019690965294860193909352606085019190915260808401526001600160a01b031660a083015260c082015260e001610138565b61022261021d366004610f18565b61035d565b005b610222610232366004610f3a565b61044c565b60045461024a906001600160a01b031681565b6040516001600160a01b039091168152602001610138565b610285610270366004610f18565b60026020526000908152604090205460ff1681565b6040519015158152602001610138565b6102226105d4565b6102226102ab366004610f53565b6105e8565b6102226102be366004610f18565b61081a565b61012e6102d1366004610f18565b610898565b6001546001600160a01b031661024a565b61012e600c81565b6102226102fd366004610f18565b61097c565b60055461024a906001600160a01b031681565b61012e610323366004610f18565b6109f7565b610222610336366004610f18565b610aaf565b610222610b25565b61012e61027181565b61035a600c62278d00610f93565b81565b6005546001600160a01b031633146103bc5760405162461bcd60e51b815260206004820152601c60248201527f566573746572373a2043616c6c6572206e6f74204465706c6f7965720000000060448201526064015b60405180910390fd5b600554600160a01b900460ff16156104165760405162461bcd60e51b815260206004820152601c60248201527f566573746572373a20416c726561647920696e697469616c697a65640000000060448201526064016103b3565b600480546001600160a01b039092166001600160a01b03199092169190911790556005805460ff60a01b1916600160a01b179055565b600554600160a01b900460ff16610476576040516321c4e35760e21b815260040160405180910390fd5b61047e610c8d565b610486610ce6565b80156105c7576000610497336109f7565b9050808211156104ba576040516304b28d1960e21b815260040160405180910390fd5b33600090815260036020526040812060010180548492906104dc908490610fb2565b90915550503360009081526003602052604081208054849290610500908490610fc9565b90915550506004805460405163a9059cbb60e01b81523392810192909252602482018490526001600160a01b03169063a9059cbb906044016020604051808303816000875af1158015610557573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061057b9190610fe1565b610598576040516312171d8360e31b815260040160405180910390fd5b604051829033907f884edad9ce6fa2440d8a54cc123490eb96d2768479d49ff9c7366125a942436490600090a3505b6105d16001600055565b50565b6105dc610db5565b6105e66000610e0f565b565b6105f0610c8d565b336000908152600360205260409020600501546001600160a01b0316156106635760405162461bcd60e51b815260206004820152602160248201527f44617277696e5374616b696e673a204e46545f414c52454144595f5354414b456044820152601160fa1b60648201526084016103b3565b6001600160a01b03821660009081526002602052604090205460ff166106cb5760405162461bcd60e51b815260206004820152601e60248201527f44617277696e5374616b696e673a20554e535550504f525445445f4e4654000060448201526064016103b3565b6106d3610ce6565b604051632142170760e11b8152336004820152306024820152604481018290526001600160a01b038316906342842e0e90606401600060405180830381600087803b15801561072157600080fd5b505af1158015610735573d6000803e3d6000fd5b5050336000908152600360205260409081902060050180546001600160a01b0319166001600160a01b038716908117909155905163ac7fc26360e01b81526004810185905290925063ac7fc2639150602401602060405180830381865afa1580156107a4573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107c89190611003565b3360008181526003602052604080822060048101859055600601859055518492917f18e285212c83a4ef243f40c28df93c75697155e95447123afb96ea187f4c655591a46108166001600055565b5050565b6005546001600160a01b031633146108745760405162461bcd60e51b815260206004820181905260248201527f44617277696e5374616b696e673a2043414c4c45525f49535f4e4f545f44455660448201526064016103b3565b6001600160a01b03166000908152600260205260409020805460ff19166001179055565b6001600160a01b0381166000908152600360205260408120600101548082036108c45750600092915050565b6001600160a01b03831660009081526003602081905260408220908101546004820154600290920154909262278d006108fd8342610fb2565b610907919061101c565b9050600c8111156109165750600c5b8381620186a061092861027189610f93565b610932919061101c565b61093c9190610f93565b6109469190610fb2565b95508215610972576103e861095b8488610f93565b610965919061101c565b61096f9087610fc9565b95505b5050505050919050565b6005546001600160a01b031633146109d65760405162461bcd60e51b815260206004820181905260248201527f44617277696e5374616b696e673a2043414c4c45525f49535f4e4f545f44455660448201526064016103b3565b6001600160a01b03166000908152600260205260409020805460ff19169055565b6001600160a01b038116600090815260036020526040812060010154808203610a235750600092915050565b6001600160a01b03831660009081526003602052604081208054600290910154909162278d00610a538342610fb2565b610a5d919061101c565b9050600c811115610a6c5750600c5b82600c82610a7a8388610fc9565b610a849190610f93565b610a8e919061101c565b610a989190610fb2565b945083851115610aa6578394505b50505050919050565b610ab7610db5565b6001600160a01b038116610b1c5760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b60648201526084016103b3565b6105d181610e0f565b610b2d610c8d565b336000908152600360205260409020600501546001600160a01b0316610b9f5760405162461bcd60e51b815260206004820152602160248201527f44617277696e5374616b696e673a204e4f5f4e46545f544f5f574954484452416044820152605760f81b60648201526084016103b3565b610ba7610ce6565b336000818152600360205260409081902060058101546006909101549151632142170760e11b8152306004820152602481019390935260448301919091526001600160a01b0316906342842e0e90606401600060405180830381600087803b158015610c1257600080fd5b505af1158015610c26573d6000803e3d6000fd5b5050336000818152600360205260408082206005810180546001600160a01b031916905560048101839055600601829055519093509091507fff2793899bb05ade1230c4aae5cea665d6547f23819f18f32535fbdae9309dac908390a36105e66001600055565b600260005403610cdf5760405162461bcd60e51b815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c0060448201526064016103b3565b6002600055565b6000610cf133610898565b905080156105d1573360009081526003602081905260408220018054839290610d1b908490610fc9565b9091555050600480546040516340c10f1960e01b81523392810192909252602482018390526001600160a01b0316906340c10f1990604401600060405180830381600087803b158015610d6d57600080fd5b505af1158015610d81573d6000803e3d6000fd5b50506040518392503391507f47cee97cb7acd717b3c0aa1435d004cd5b3c8c57d70dbceb4e4458bbd60e39d490600090a350565b6001546001600160a01b031633146105e65760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016103b3565b600180546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b80356001600160a01b0381168114610e7857600080fd5b919050565b600080600080600060808688031215610e9557600080fd5b610e9e86610e61565b9450610eac60208701610e61565b935060408601359250606086013567ffffffffffffffff80821115610ed057600080fd5b818801915088601f830112610ee457600080fd5b813581811115610ef357600080fd5b896020828501011115610f0557600080fd5b9699959850939650602001949392505050565b600060208284031215610f2a57600080fd5b610f3382610e61565b9392505050565b600060208284031215610f4c57600080fd5b5035919050565b60008060408385031215610f6657600080fd5b610f6f83610e61565b946020939093013593505050565b634e487b7160e01b600052601160045260246000fd5b6000816000190483118215151615610fad57610fad610f7d565b500290565b600082821015610fc457610fc4610f7d565b500390565b60008219821115610fdc57610fdc610f7d565b500190565b600060208284031215610ff357600080fd5b81518015158114610f3357600080fd5b60006020828403121561101557600080fd5b5051919050565b60008261103957634e487b7160e01b600052601260045260246000fd5b50049056fea2646970667358221220def117d4a141f730c021120be042cef10616b507865e15401cdabf7d3d42a33764736f6c634300080e0033";

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
    _supportedNFTs: PromiseOrValue<string>[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<DarwinVester7> {
    return super.deploy(
      _users,
      _userInfo,
      _supportedNFTs,
      overrides || {}
    ) as Promise<DarwinVester7>;
  }
  override getDeployTransaction(
    _users: PromiseOrValue<string>[],
    _userInfo: IDarwinVester.UserInfoStruct[],
    _supportedNFTs: PromiseOrValue<string>[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _users,
      _userInfo,
      _supportedNFTs,
      overrides || {}
    );
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
