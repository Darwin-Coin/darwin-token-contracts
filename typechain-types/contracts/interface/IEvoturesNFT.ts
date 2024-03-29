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
} from "../../common";

export interface IEvoturesNFTInterface extends utils.Interface {
  functions: {
    "BOOSTER_PRICE()": FunctionFragment;
    "chainlinkMint(uint256[],uint8,uint8,address)": FunctionFragment;
    "dev()": FunctionFragment;
    "mint(uint8,uint8,address)": FunctionFragment;
    "multipliers(uint16)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "BOOSTER_PRICE"
      | "chainlinkMint"
      | "dev"
      | "mint"
      | "multipliers"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "BOOSTER_PRICE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "chainlinkMint",
    values: [
      PromiseOrValue<BigNumberish>[],
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(functionFragment: "dev", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "mint",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "multipliers",
    values: [PromiseOrValue<BigNumberish>]
  ): string;

  decodeFunctionResult(
    functionFragment: "BOOSTER_PRICE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "chainlinkMint",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "dev", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "mint", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "multipliers",
    data: BytesLike
  ): Result;

  events: {};
}

export interface IEvoturesNFT extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IEvoturesNFTInterface;

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

    chainlinkMint(
      _randomWords: PromiseOrValue<BigNumberish>[],
      _evotures: PromiseOrValue<BigNumberish>,
      boosters_: PromiseOrValue<BigNumberish>,
      _minter: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    dev(overrides?: CallOverrides): Promise<[string]>;

    mint(
      _evotures: PromiseOrValue<BigNumberish>,
      _boosters: PromiseOrValue<BigNumberish>,
      to: PromiseOrValue<string>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    multipliers(
      id: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[number] & { mult: number }>;
  };

  BOOSTER_PRICE(overrides?: CallOverrides): Promise<BigNumber>;

  chainlinkMint(
    _randomWords: PromiseOrValue<BigNumberish>[],
    _evotures: PromiseOrValue<BigNumberish>,
    boosters_: PromiseOrValue<BigNumberish>,
    _minter: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  dev(overrides?: CallOverrides): Promise<string>;

  mint(
    _evotures: PromiseOrValue<BigNumberish>,
    _boosters: PromiseOrValue<BigNumberish>,
    to: PromiseOrValue<string>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  multipliers(
    id: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<number>;

  callStatic: {
    BOOSTER_PRICE(overrides?: CallOverrides): Promise<BigNumber>;

    chainlinkMint(
      _randomWords: PromiseOrValue<BigNumberish>[],
      _evotures: PromiseOrValue<BigNumberish>,
      boosters_: PromiseOrValue<BigNumberish>,
      _minter: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    dev(overrides?: CallOverrides): Promise<string>;

    mint(
      _evotures: PromiseOrValue<BigNumberish>,
      _boosters: PromiseOrValue<BigNumberish>,
      to: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    multipliers(
      id: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<number>;
  };

  filters: {};

  estimateGas: {
    BOOSTER_PRICE(overrides?: CallOverrides): Promise<BigNumber>;

    chainlinkMint(
      _randomWords: PromiseOrValue<BigNumberish>[],
      _evotures: PromiseOrValue<BigNumberish>,
      boosters_: PromiseOrValue<BigNumberish>,
      _minter: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    dev(overrides?: CallOverrides): Promise<BigNumber>;

    mint(
      _evotures: PromiseOrValue<BigNumberish>,
      _boosters: PromiseOrValue<BigNumberish>,
      to: PromiseOrValue<string>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    multipliers(
      id: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    BOOSTER_PRICE(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    chainlinkMint(
      _randomWords: PromiseOrValue<BigNumberish>[],
      _evotures: PromiseOrValue<BigNumberish>,
      boosters_: PromiseOrValue<BigNumberish>,
      _minter: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    dev(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    mint(
      _evotures: PromiseOrValue<BigNumberish>,
      _boosters: PromiseOrValue<BigNumberish>,
      to: PromiseOrValue<string>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    multipliers(
      id: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
