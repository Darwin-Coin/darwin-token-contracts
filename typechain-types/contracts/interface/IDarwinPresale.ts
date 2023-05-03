/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  Signer,
  utils,
} from "ethers";
import type { EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../common";

export interface IDarwinPresaleInterface extends utils.Interface {
  functions: {};

  events: {
    "PresaleCompleted(uint256,uint256)": EventFragment;
    "PresaleEndDateSet(uint256)": EventFragment;
    "RouterSet(address)": EventFragment;
    "UserDeposit(address,uint256,uint256)": EventFragment;
    "Wallet1Set(address)": EventFragment;
    "Wallet2Set(address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "PresaleCompleted"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "PresaleEndDateSet"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RouterSet"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "UserDeposit"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Wallet1Set"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Wallet2Set"): EventFragment;
}

export interface PresaleCompletedEventObject {
  ethAmount: BigNumber;
  unsoldDarwinAmount: BigNumber;
}
export type PresaleCompletedEvent = TypedEvent<
  [BigNumber, BigNumber],
  PresaleCompletedEventObject
>;

export type PresaleCompletedEventFilter =
  TypedEventFilter<PresaleCompletedEvent>;

export interface PresaleEndDateSetEventObject {
  endDate: BigNumber;
}
export type PresaleEndDateSetEvent = TypedEvent<
  [BigNumber],
  PresaleEndDateSetEventObject
>;

export type PresaleEndDateSetEventFilter =
  TypedEventFilter<PresaleEndDateSetEvent>;

export interface RouterSetEventObject {
  router: string;
}
export type RouterSetEvent = TypedEvent<[string], RouterSetEventObject>;

export type RouterSetEventFilter = TypedEventFilter<RouterSetEvent>;

export interface UserDepositEventObject {
  user: string;
  amountIn: BigNumber;
  darwinAmount: BigNumber;
}
export type UserDepositEvent = TypedEvent<
  [string, BigNumber, BigNumber],
  UserDepositEventObject
>;

export type UserDepositEventFilter = TypedEventFilter<UserDepositEvent>;

export interface Wallet1SetEventObject {
  wallet1: string;
}
export type Wallet1SetEvent = TypedEvent<[string], Wallet1SetEventObject>;

export type Wallet1SetEventFilter = TypedEventFilter<Wallet1SetEvent>;

export interface Wallet2SetEventObject {
  wallet2: string;
}
export type Wallet2SetEvent = TypedEvent<[string], Wallet2SetEventObject>;

export type Wallet2SetEventFilter = TypedEventFilter<Wallet2SetEvent>;

export interface IDarwinPresale extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IDarwinPresaleInterface;

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

  functions: {};

  callStatic: {};

  filters: {
    "PresaleCompleted(uint256,uint256)"(
      ethAmount?: PromiseOrValue<BigNumberish> | null,
      unsoldDarwinAmount?: PromiseOrValue<BigNumberish> | null
    ): PresaleCompletedEventFilter;
    PresaleCompleted(
      ethAmount?: PromiseOrValue<BigNumberish> | null,
      unsoldDarwinAmount?: PromiseOrValue<BigNumberish> | null
    ): PresaleCompletedEventFilter;

    "PresaleEndDateSet(uint256)"(
      endDate?: PromiseOrValue<BigNumberish> | null
    ): PresaleEndDateSetEventFilter;
    PresaleEndDateSet(
      endDate?: PromiseOrValue<BigNumberish> | null
    ): PresaleEndDateSetEventFilter;

    "RouterSet(address)"(
      router?: PromiseOrValue<string> | null
    ): RouterSetEventFilter;
    RouterSet(router?: PromiseOrValue<string> | null): RouterSetEventFilter;

    "UserDeposit(address,uint256,uint256)"(
      user?: PromiseOrValue<string> | null,
      amountIn?: PromiseOrValue<BigNumberish> | null,
      darwinAmount?: PromiseOrValue<BigNumberish> | null
    ): UserDepositEventFilter;
    UserDeposit(
      user?: PromiseOrValue<string> | null,
      amountIn?: PromiseOrValue<BigNumberish> | null,
      darwinAmount?: PromiseOrValue<BigNumberish> | null
    ): UserDepositEventFilter;

    "Wallet1Set(address)"(
      wallet1?: PromiseOrValue<string> | null
    ): Wallet1SetEventFilter;
    Wallet1Set(wallet1?: PromiseOrValue<string> | null): Wallet1SetEventFilter;

    "Wallet2Set(address)"(
      wallet2?: PromiseOrValue<string> | null
    ): Wallet2SetEventFilter;
    Wallet2Set(wallet2?: PromiseOrValue<string> | null): Wallet2SetEventFilter;
  };

  estimateGas: {};

  populateTransaction: {};
}
