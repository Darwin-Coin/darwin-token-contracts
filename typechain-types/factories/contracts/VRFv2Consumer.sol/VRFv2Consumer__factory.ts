/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  BytesLike,
  BigNumberish,
  Overrides,
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  VRFv2Consumer,
  VRFv2ConsumerInterface,
} from "../../../contracts/VRFv2Consumer.sol/VRFv2Consumer";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_coordinator",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "_keyHash",
        type: "bytes32",
      },
      {
        internalType: "uint64",
        name: "subscriptionId",
        type: "uint64",
      },
      {
        internalType: "uint16",
        name: "_confirmations",
        type: "uint16",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "have",
        type: "address",
      },
      {
        internalType: "address",
        name: "want",
        type: "address",
      },
    ],
    name: "OnlyCoordinatorCanFulfill",
    type: "error",
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
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "randomWords",
        type: "uint256[]",
      },
    ],
    name: "RequestFulfilled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "numWords",
        type: "uint32",
      },
    ],
    name: "RequestSent",
    type: "event",
  },
  {
    inputs: [],
    name: "evoturesContract",
    outputs: [
      {
        internalType: "contract IEvoturesNFT",
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
        name: "_requestId",
        type: "uint256",
      },
    ],
    name: "getRequest",
    outputs: [
      {
        internalType: "bool",
        name: "exists",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "fulfilled",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_requestId",
        type: "uint256",
      },
    ],
    name: "getRequestStatus",
    outputs: [
      {
        internalType: "bool",
        name: "fulfilled",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "randomNum",
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
        name: "_evotures",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "keyHash",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "lastRequestId",
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
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "randomWords",
        type: "uint256[]",
      },
    ],
    name: "rawFulfillRandomWords",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "requestConfirmations",
    outputs: [
      {
        internalType: "uint16",
        name: "",
        type: "uint16",
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
    name: "requestIds",
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
        internalType: "uint8",
        name: "_evotures",
        type: "uint8",
      },
      {
        internalType: "uint8",
        name: "_boosters",
        type: "uint8",
      },
      {
        internalType: "address",
        name: "_minter",
        type: "address",
      },
    ],
    name: "requestRandomWords",
    outputs: [
      {
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
    ],
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
    name: "s_requests",
    outputs: [
      {
        internalType: "bool",
        name: "fulfilled",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "exists",
        type: "bool",
      },
      {
        internalType: "uint8",
        name: "evotures",
        type: "uint8",
      },
      {
        internalType: "uint8",
        name: "boosters",
        type: "uint8",
      },
      {
        internalType: "address",
        name: "minter",
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
        name: "to",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60e060405234801561001057600080fd5b50604051610f3b380380610f3b83398101604081905261002f916100fe565b6001600160a01b038416608052338061008e5760405162461bcd60e51b815260206004820152601860248201527f43616e6e6f7420736574206f776e657220746f207a65726f0000000000000000604482015260640160405180910390fd5b600080546001600160a01b039283166001600160a01b03199182161790915561ffff90921660a052600380546001600160401b03909416600160a01b02600160a01b600160e01b03199094169390931790925560c092909252600280549390911692909116919091179055610172565b6000806000806080858703121561011457600080fd5b84516001600160a01b038116811461012b57600080fd5b6020860151604087015191955093506001600160401b038116811461014f57600080fd5b606086015190925061ffff8116811461016757600080fd5b939692955090935050565b60805160a05160c051610d866101b56000396000818160ee01526105a00152600081816101ec01526105e00152600081816102ee01526103300152610d866000f3fe608060405234801561001057600080fd5b50600436106100cf5760003560e01c8063c4d66de81161008c578063d8a4676f11610066578063d8a4676f1461028a578063df16aa79146102b4578063f2fde38b146102c7578063fc2a88c3146102da57600080fd5b8063c4d66de814610221578063c58343ef14610234578063d4ac456d1461027757600080fd5b80631fe543e3146100d457806361728f39146100e95780638796ba8c146101235780638da5cb5b14610136578063a168fa891461015b578063b0fb162f146101e7575b600080fd5b6100e76100e2366004610aae565b6102e3565b005b6101107f000000000000000000000000000000000000000000000000000000000000000081565b6040519081526020015b60405180910390f35b610110610131366004610b78565b610370565b6000546001600160a01b03165b6040516001600160a01b03909116815260200161011a565b6101ae610169366004610b78565b60016020526000908152604090205460ff808216916101008104821691620100008204811691630100000081049091169064010000000090046001600160a01b031685565b604080519515158652931515602086015260ff928316938501939093521660608301526001600160a01b0316608082015260a00161011a565b61020e7f000000000000000000000000000000000000000000000000000000000000000081565b60405161ffff909116815260200161011a565b6100e761022f366004610bad565b610391565b610260610242366004610b78565b60009081526001602052604090205460ff6101008204811692911690565b60408051921515835290151560208301520161011a565b600354610143906001600160a01b031681565b61029d610298366004610b78565b6103bb565b60408051921515835260208301919091520161011a565b6101106102c2366004610be0565b6104f9565b6100e76102d5366004610bad565b6107df565b61011060055481565b336001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016146103625760405163073e64fd60e21b81523360048201526001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001660248201526044015b60405180910390fd5b61036c828261088a565b5050565b6004818154811061038057600080fd5b600091825260209091200154905081565b6103996109e3565b600380546001600160a01b0319166001600160a01b0392909216919091179055565b6000818152600160205260408120548190610100900460ff166104145760405162461bcd60e51b81526020600482015260116024820152701c995c5d595cdd081b9bdd08199bdd5b99607a1b6044820152606401610359565b6000838152600160208181526040808420815160c081018352815460ff80821615158352610100820481161515838701526201000082048116838601526301000000820416606083015264010000000090046001600160a01b031660808201529381018054835181860281018601909452808452919360a086019392908301828280156104c057602002820191906000526020600020905b8154815260200190600101908083116104ac575b505050505081525050905080600001518160a001516000815181106104e7576104e7610c23565b60200260200101519250925050915091565b6003546000906001600160a01b031633146105755760405162461bcd60e51b815260206004820152603660248201527f5652467632436f6e73756d65723a3a7265717565737452616e646f6d576f7264604482015275733a2043414c4c45525f4e4f545f45564f545552455360501b6064820152608401610359565b60006105818486610c4f565b61058b9086610c78565b6002546003546040516305d3b1d360e41b81527f00000000000000000000000000000000000000000000000000000000000000006004820152600160a01b90910467ffffffffffffffff16602482015261ffff7f0000000000000000000000000000000000000000000000000000000000000000166044820152622625a0606482015260ff831660848201529192506001600160a01b031690635d3b1d309060a4016020604051808303816000875af115801561064c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106709190610c9d565b6040805160c08101825260008082526001602080840182815260ff8c81168688019081528c8216606088019081526001600160a01b038d811660808a019081528a518981528088018c5260a08b019081528c8a528888529a90982089518154965194519351995190921664010000000002640100000000600160c01b031999861663010000000263ff000000199490961662010000029390931663ffff0000199415156101000261ff00199315159390931661ffff19909716969096179190911792909216939093179190911794909416178355935180519597509294919361075f9391850192910190610a38565b5050600480546001810182556000919091527f8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b018390555060058290556040805183815260ff831660208201527fcc58b13ad3eab50626c6a6300b1d139cd6ebb1688a7cced9461c2f7e762665ee910160405180910390a1509392505050565b6107e76109e3565b336001600160a01b0382160361083f5760405162461bcd60e51b815260206004820152601760248201527f43616e6e6f74207472616e7366657220746f2073656c660000000000000000006044820152606401610359565b600080546001600160a01b0319166001600160a01b0383169081178255604051909182917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a350565b600082815260016020526040902054610100900460ff166108e15760405162461bcd60e51b81526020600482015260116024820152701c995c5d595cdd081b9bdd08199bdd5b99607a1b6044820152606401610359565b6000828152600160208181526040909220805460ff191682178155835161091093919092019190840190610a38565b5060035460008381526001602052604090819020549051630fa8c95960e41b81526001600160a01b039283169263fa8c95909261097492869260ff620100008404811693630100000081049091169264010000000090910490911690600401610cf1565b600060405180830381600087803b15801561098e57600080fd5b505af11580156109a2573d6000803e3d6000fd5b505050507ffe2e2d779dba245964d4e3ef9b994be63856fd568bf7d3ca9e224755cb1bd54d82826040516109d7929190610d2f565b60405180910390a15050565b6000546001600160a01b03163314610a365760405162461bcd60e51b815260206004820152601660248201527527b7363c9031b0b63630b1363290313c9037bbb732b960511b6044820152606401610359565b565b828054828255906000526020600020908101928215610a73579160200282015b82811115610a73578251825591602001919060010190610a58565b50610a7f929150610a83565b5090565b5b80821115610a7f5760008155600101610a84565b634e487b7160e01b600052604160045260246000fd5b60008060408385031215610ac157600080fd5b8235915060208084013567ffffffffffffffff80821115610ae157600080fd5b818601915086601f830112610af557600080fd5b813581811115610b0757610b07610a98565b8060051b604051601f19603f83011681018181108582111715610b2c57610b2c610a98565b604052918252848201925083810185019189831115610b4a57600080fd5b938501935b82851015610b6857843584529385019392850192610b4f565b8096505050505050509250929050565b600060208284031215610b8a57600080fd5b5035919050565b80356001600160a01b0381168114610ba857600080fd5b919050565b600060208284031215610bbf57600080fd5b610bc882610b91565b9392505050565b803560ff81168114610ba857600080fd5b600080600060608486031215610bf557600080fd5b610bfe84610bcf565b9250610c0c60208501610bcf565b9150610c1a60408501610b91565b90509250925092565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b600060ff821660ff84168160ff0481118215151615610c7057610c70610c39565b029392505050565b600060ff821660ff84168060ff03821115610c9557610c95610c39565b019392505050565b600060208284031215610caf57600080fd5b5051919050565b600081518084526020808501945080840160005b83811015610ce657815187529582019590820190600101610cca565b509495945050505050565b608081526000610d046080830187610cb6565b60ff95861660208401529390941660408201526001600160a01b039190911660609091015292915050565b828152604060208201526000610d486040830184610cb6565b94935050505056fea26469706673582212207417f7561e467d991f2b7816dc678a70be0d2805f5a9a9fbfa77cff4313e89e464736f6c634300080e0033";

type VRFv2ConsumerConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: VRFv2ConsumerConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class VRFv2Consumer__factory extends ContractFactory {
  constructor(...args: VRFv2ConsumerConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _coordinator: PromiseOrValue<string>,
    _keyHash: PromiseOrValue<BytesLike>,
    subscriptionId: PromiseOrValue<BigNumberish>,
    _confirmations: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<VRFv2Consumer> {
    return super.deploy(
      _coordinator,
      _keyHash,
      subscriptionId,
      _confirmations,
      overrides || {}
    ) as Promise<VRFv2Consumer>;
  }
  override getDeployTransaction(
    _coordinator: PromiseOrValue<string>,
    _keyHash: PromiseOrValue<BytesLike>,
    subscriptionId: PromiseOrValue<BigNumberish>,
    _confirmations: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _coordinator,
      _keyHash,
      subscriptionId,
      _confirmations,
      overrides || {}
    );
  }
  override attach(address: string): VRFv2Consumer {
    return super.attach(address) as VRFv2Consumer;
  }
  override connect(signer: Signer): VRFv2Consumer__factory {
    return super.connect(signer) as VRFv2Consumer__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): VRFv2ConsumerInterface {
    return new utils.Interface(_abi) as VRFv2ConsumerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): VRFv2Consumer {
    return new Contract(address, _abi, signerOrProvider) as VRFv2Consumer;
  }
}
