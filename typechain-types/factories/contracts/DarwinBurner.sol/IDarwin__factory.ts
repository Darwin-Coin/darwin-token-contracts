/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IDarwin,
  IDarwinInterface,
} from "../../../contracts/DarwinBurner.sol/IDarwin";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
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
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class IDarwin__factory {
  static readonly abi = _abi;
  static createInterface(): IDarwinInterface {
    return new utils.Interface(_abi) as IDarwinInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IDarwin {
    return new Contract(address, _abi, signerOrProvider) as IDarwin;
  }
}
