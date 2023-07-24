/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../common";

export interface MainnetNFTCounterInterface extends utils.Interface {
  functions: {
    "BOOSTER_PRICE()": FunctionFragment;
    "EVOTURES_PRICE()": FunctionFragment;
    "buy(uint8,uint8)": FunctionFragment;
    "dev()": FunctionFragment;
    "userInfo(address)": FunctionFragment;
    "withdrawETH()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "BOOSTER_PRICE"
      | "EVOTURES_PRICE"
      | "buy"
      | "dev"
      | "userInfo"
      | "withdrawETH"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "BOOSTER_PRICE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "EVOTURES_PRICE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "buy",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(functionFragment: "dev", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "userInfo",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawETH",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "BOOSTER_PRICE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "EVOTURES_PRICE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "buy", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "dev", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "userInfo", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "withdrawETH",
    data: BytesLike
  ): Result;

  events: {};
}

export interface MainnetNFTCounter extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: MainnetNFTCounterInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    BOOSTER_PRICE(overrides?: CallOverrides): Promise<[BigNumber]>;

    EVOTURES_PRICE(overrides?: CallOverrides): Promise<[BigNumber]>;

    buy(
      _evotures: PromiseOrValue<BigNumberish>,
      _boosters: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    dev(overrides?: CallOverrides): Promise<[string]>;

    userInfo(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[number, number] & { boosters: number; evotures: number }>;

    withdrawETH(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  BOOSTER_PRICE(overrides?: CallOverrides): Promise<BigNumber>;

  EVOTURES_PRICE(overrides?: CallOverrides): Promise<BigNumber>;

  buy(
    _evotures: PromiseOrValue<BigNumberish>,
    _boosters: PromiseOrValue<BigNumberish>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  dev(overrides?: CallOverrides): Promise<string>;

  userInfo(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<[number, number] & { boosters: number; evotures: number }>;

  withdrawETH(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    BOOSTER_PRICE(overrides?: CallOverrides): Promise<BigNumber>;

    EVOTURES_PRICE(overrides?: CallOverrides): Promise<BigNumber>;

    buy(
      _evotures: PromiseOrValue<BigNumberish>,
      _boosters: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    dev(overrides?: CallOverrides): Promise<string>;

    userInfo(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[number, number] & { boosters: number; evotures: number }>;

    withdrawETH(overrides?: CallOverrides): Promise<void>;
  };

  filters: {};

  estimateGas: {
    BOOSTER_PRICE(overrides?: CallOverrides): Promise<BigNumber>;

    EVOTURES_PRICE(overrides?: CallOverrides): Promise<BigNumber>;

    buy(
      _evotures: PromiseOrValue<BigNumberish>,
      _boosters: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    dev(overrides?: CallOverrides): Promise<BigNumber>;

    userInfo(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    withdrawETH(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    BOOSTER_PRICE(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    EVOTURES_PRICE(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    buy(
      _evotures: PromiseOrValue<BigNumberish>,
      _boosters: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    dev(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    userInfo(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    withdrawETH(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
