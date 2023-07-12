/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IVRFv2Consumer,
  IVRFv2ConsumerInterface,
} from "../../../contracts/EvoturesNFT.sol/IVRFv2Consumer";

const _abi = [
  {
    inputs: [
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
] as const;

export class IVRFv2Consumer__factory {
  static readonly abi = _abi;
  static createInterface(): IVRFv2ConsumerInterface {
    return new utils.Interface(_abi) as IVRFv2ConsumerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IVRFv2Consumer {
    return new Contract(address, _abi, signerOrProvider) as IVRFv2Consumer;
  }
}