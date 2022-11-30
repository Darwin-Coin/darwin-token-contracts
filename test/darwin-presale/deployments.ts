import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { setNetworkTimeStamp, getUniswapRouterAddress } from "../../scripts/utils";
import {
  DarwinEcosystem,
  DarwinPresale,
  IUniswapV2Pair,
  IUniswapV2Router02,
  IUniswapV2Factory__factory,
  IUniswapV2Router02__factory,
  TestErc20Token,
} from "../../typechain";
import { deployContracts } from "./utils";

enum Status {
  QUEUED,
  ACTIVE,
  SUCCESS,
  FAILURE,
}

describe("Darwin : Token", function () {
  let darwinPresale: DarwinPresale;
  let darwinEcosystem: DarwinEcosystem;
  let darwin: TestErc20Token;
  let finch: TestErc20Token;

  let uniswapv2Router: IUniswapV2Router02;
  let uniswapPair: IUniswapV2Pair;

  let owner: SignerWithAddress;
  let address0: SignerWithAddress;

  let others: SignerWithAddress[];
  let marketingWallet: string;
  let teamWallet: string;

  let uniswapRouterAddress: string;

  const presaleStart: string = "1669193560";
  const presaleEnd: string = "1669293560";

  const darwinAllocation = ethers.utils.parseEther("5000000000");
  const finchAllocation = ethers.utils.parseEther("1000000");

  before(async () => {
    [owner, address0, ...others] = await ethers.getSigners();
    marketingWallet = others[0];
    teamWallet = others[1];
  });

  beforeEach(async () => {
    const deployedContract = await deployContracts();
    darwinPresale = deployedContract.darwinPresale;
    darwinEcosystem = deployedContract.darwinEcosystem;
    darwin = deployedContract.darwin;
    finch = deployedContract.finch;

    uniswapRouterAddress = await getUniswapRouterAddress(hre.network.name);
    const router = IUniswapV2Router02__factory.connect(
      uniswapRouterAddress,
      darwinPresale.signer
    );
    const factory = IUniswapV2Factory__factory.connect(
      await router.factory(),
      darwinPresale.signer
    );

    const weth = await router.WETH();

    const createDarwinPair = await factory.createPair(darwin.address, weth);
    await createDarwinPair.wait();

    const createFinchPair = await factory.createPair(finch.address, weth);
    await createFinchPair.wait();

    // await createAirDrop(darwinPresale, darwinEcosystem, token);
  });

  it("Should initialize presale", async function () {
    await darwinPresale.init(
      darwin.address,
      finch.address,
      presaleStart,
      presaleEnd
    );

    await darwinPresale.initPresale(
      uniswapRouterAddress,
      darwinEcosystem.address,
      marketingWallet.address,
      teamWallet.address
    );
  });

  it("should not allow deposits before initialization", async function () {
    await expect(
      darwinPresale.userDeposit({ value: ethers.utils.parseEther("1") })
    ).to.be.revertedWith("NotInitialized");
  });

  it("should not allow deposits before presaleStart", async function () {
    await darwinPresale.init(
      darwin.address,
      finch.address,
      presaleStart,
      presaleEnd
    );

    await darwinPresale.initPresale(
      uniswapRouterAddress,
      darwinEcosystem.address,
      marketingWallet.address,
      teamWallet.address
    );

    await expect(
      darwinPresale.userDeposit({ value: ethers.utils.parseEther("1") })
    ).to.be.revertedWithCustomError(darwinPresale, "PresaleNotActive");
  });

  it("should revert deposit if darwin is not allocated", async function () {
    await darwinPresale.init(
      darwin.address,
      finch.address,
      presaleStart,
      presaleEnd
    );

    await darwinPresale.initPresale(
      uniswapRouterAddress,
      darwinEcosystem.address,
      marketingWallet.address,
      teamWallet.address
    );

    await setNetworkTimeStamp(BigNumber.from(presaleStart));

    const blockNumber = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNumber);
    const timestamp = block.timestamp;

    console.log("timestamp:", timestamp);
    console.log("presaleStart:", presaleStart);

    const balance = await finch.balanceOf(owner.address);
    console.log("balance:", balance.toString());
    await finch.transfer(darwinPresale.address, finchAllocation);
    await expect(
      darwinPresale.userDeposit({
        value: ethers.utils.parseEther("1"),
      })
    ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
  });

  it("should revert deposit if finch is not allocated", async function () {
    const blockNumber = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNumber);
    const timestamp = block.timestamp;
    const presaleStart = timestamp + 10;
    await darwinPresale.init(
      darwin.address,
      finch.address,
      presaleStart,
      presaleEnd
    );

    await darwinPresale.initPresale(
      uniswapRouterAddress,
      darwinEcosystem.address,
      marketingWallet.address,
      teamWallet.address
    );

    await setNetworkTimeStamp(BigNumber.from(presaleStart));

    const balance = await darwin.balanceOf(owner.address);
    console.log("balance:", balance.toString());
    await darwin.transfer(darwinPresale.address, darwinAllocation);
    await expect(
      darwinPresale.userDeposit({
        value: ethers.utils.parseEther("1"),
      })
    ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
  });

  it("should correctly deposit bnb", async function () {
    const blockNumber = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNumber);
    const timestamp = block.timestamp;
    const presaleStart = timestamp + 10;
    await darwinPresale.init(
      darwin.address,
      finch.address,
      presaleStart,
      presaleEnd
    );

    await darwinPresale.initPresale(
      uniswapRouterAddress,
      darwinEcosystem.address,
      marketingWallet.address,
      teamWallet.address
    );

    await setNetworkTimeStamp(BigNumber.from(presaleStart));

    await darwin.transfer(darwinPresale.address, darwinAllocation);
    await finch.transfer(darwinPresale.address, finchAllocation);

    const darwinBalanceBefore = await darwin.balanceOf(owner.address);
    const darwinPresaleBalance = await darwin.balanceOf(darwinPresale.address);

    const finchBalanceBefore = await finch.balanceOf(owner.address);
    const finchPresaleBalance = await finch.balanceOf(darwinPresale.address);

    const deposit = await darwinPresale.userDeposit({
      value: ethers.utils.parseEther("1"),
    });

    const darwinBalanceAfter = await darwin.balanceOf(owner.address);
    const finchBalanceAfter = await finch.balanceOf(owner.address);

    expect(darwinBalanceAfter).to.be.gt(darwinBalanceBefore);
    expect(finchBalanceAfter).to.be.gt(finchBalanceBefore);

    // TODO add more specific comparisons
  });

  //   it("Users should be able to deposit base token", async function () {
  //     const decimals = BigNumber.from(10 ** (await darwin.decimals()));
  //     const info = await darwinPresale.presaleInfo();
  //     const tokensPerETH = BigNumber.from(200 * 1000).mul(decimals);

  //     const slippage = BigNumber.from(100);

  //     await setNetworkTimeStamp(info.presaleStart.add(10));

  //     await darwinPresale.connect(address0).userDeposit({
  //       value: ethers.utils.parseEther("2"),
  //     });

  //     const owned = await darwinPresale.tokensOwned(address0.address);

  //     expect(
  //       owned.gte(tokensPerETH.mul(2).sub(slippage)) &&
  //         owned.lte(tokensPerETH.mul(2).add(slippage))
  //     );
  //   });

  //   it("Users should get correct amount of tokens", async function () {
  //     const decimals = BigNumber.from(10 ** (await token.decimals()));
  //     const info = await darwinPresale.presaleInfo();
  //     const lockDuration = await darwinPresale.lockDelay();

  //     const tokensPerETH = BigNumber.from(200 * 1000).mul(decimals);

  //     const expectedTokens = tokensPerETH.mul(2);

  //     const slippage = BigNumber.from(100);

  //     await setNetworkTimeStamp(info.presaleStart.add(10));

  //     await darwinPresale.connect(address0).userDeposit({
  //       value: ethers.utils.parseEther("2"),
  //       from: address0.address,
  //     });

  //     const owned = await darwinPresale.tokensOwned(address0.address);

  //     expect(
  //       owned.gte(expectedTokens.sub(slippage)) &&
  //         owned.lte(expectedTokens.add(slippage))
  //     );

  //     await setNetworkTimeStamp(info.presaleEnd.add(lockDuration).add(10));

  //     const balanceBefore = await token.balanceOf(address0.address);

  //     await darwinPresale.connect(address0).userWithdrawTokens({
  //       from: address0.address,
  //     });

  //     const balanceAfter = await token.balanceOf(address0.address);

  //     const gains = balanceAfter.sub(balanceBefore);

  //     expect(
  //       gains.gte(expectedTokens.sub(slippage)) &&
  //         owned.lte(expectedTokens.add(slippage))
  //     );
  //   });
});
