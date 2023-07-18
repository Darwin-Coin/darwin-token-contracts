/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  MainnetNFTCounter,
  MainnetNFTCounterInterface,
} from "../../contracts/MainnetNFTCounter";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "BOOSTER_PRICE",
    outputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "EVOTURES_PRICE",
    outputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
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
    ],
    name: "buy",
    outputs: [],
    stateMutability: "payable",
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
    name: "withdrawETH",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
] as const;

const _bytecode =
  "0x60a060405234801561001057600080fd5b503360805260805161041e61003660003960008181608101526101d9015261041e6000f3fe60806040526004361061004e5760003560e01c80634ac897141461005a57806391cca3db1461006f578063afd8e4fa146100c0578063d035770c146100f4578063e086e5ec1461010f57600080fd5b3661005557005b600080fd5b61006d61006836600461031a565b610124565b005b34801561007b57600080fd5b506100a37f000000000000000000000000000000000000000000000000000000000000000081565b6040516001600160a01b0390911681526020015b60405180910390f35b3480156100cc57600080fd5b506100db668e1bc9bf04000081565b60405167ffffffffffffffff90911681526020016100b7565b34801561010057600080fd5b506100db661550f7dca7000081565b34801561011b57600080fd5b5061006d6101ce565b661550f7dca700006101368284610363565b60ff16610143919061038c565b610157668e1bc9bf04000060ff851661038c565b61016191906103bc565b67ffffffffffffffff163410156101ca5760405162461bcd60e51b815260206004820152602260248201527f45766f74757265734e46543a3a6275793a20494e53554646494349454e545f456044820152610a8960f31b60648201526084015b60405180910390fd5b5050565b336001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016146102575760405162461bcd60e51b815260206004820152602860248201527f45766f74757265734e46543a3a77697468647261774554483a2043414c4c45526044820152672fa727aa2fa222ab60c11b60648201526084016101c1565b604051600090339047908381818185875af1925050503d8060008114610299576040519150601f19603f3d011682016040523d82523d6000602084013e61029e565b606091505b50509050806103015760405162461bcd60e51b815260206004820152602960248201527f45766f74757265734e46543a3a77697468647261774554483a205452414e5346604482015268115497d1905253115160ba1b60648201526084016101c1565b50565b803560ff8116811461031557600080fd5b919050565b6000806040838503121561032d57600080fd5b61033683610304565b915061034460208401610304565b90509250929050565b634e487b7160e01b600052601160045260246000fd5b600060ff821660ff84168160ff04811182151516156103845761038461034d565b029392505050565b600067ffffffffffffffff808316818516818304811182151516156103b3576103b361034d565b02949350505050565b600067ffffffffffffffff8083168185168083038211156103df576103df61034d565b0194935050505056fea264697066735822122026f51ed5de8fa617db43e9ae47a85ffde000f932f02ac488783b126a7e59c65064736f6c634300080e0033";

type MainnetNFTCounterConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MainnetNFTCounterConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class MainnetNFTCounter__factory extends ContractFactory {
  constructor(...args: MainnetNFTCounterConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<MainnetNFTCounter> {
    return super.deploy(overrides || {}) as Promise<MainnetNFTCounter>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): MainnetNFTCounter {
    return super.attach(address) as MainnetNFTCounter;
  }
  override connect(signer: Signer): MainnetNFTCounter__factory {
    return super.connect(signer) as MainnetNFTCounter__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MainnetNFTCounterInterface {
    return new utils.Interface(_abi) as MainnetNFTCounterInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MainnetNFTCounter {
    return new Contract(address, _abi, signerOrProvider) as MainnetNFTCounter;
  }
}