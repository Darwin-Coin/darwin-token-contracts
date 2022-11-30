import { BigNumber } from "ethers";
import hardhat, { ethers, upgrades } from "hardhat";
import {
  daysToSeconds,
  getUniswapRouterAddress,
  lastBlockTime,
} from "../../scripts/utils";
import {
  DarwinEcosystem,
  DarwinPresale,
  IUniswapV2Factory__factory,
  IUniswapV2Router02__factory,
  TestErc20Token,
} from "../../typechain";

export const deployContracts = async () => {
  const Darwin = await ethers.getContractFactory("TestErc20Token");
  const Finch = await ethers.getContractFactory("TestErc20Token");
  const DarwinEcosystem = await ethers.getContractFactory("DarwinEcosystem");
  const DarwinPresale = await ethers.getContractFactory("DarwinPresale");

  const darwinPresale = await DarwinPresale.deploy() as DarwinPresale;

  const darwinEcosystem = (await upgrades.deployProxy(DarwinEcosystem, [
    darwinPresale.address,
  ])) as DarwinEcosystem;

  const darwin = await Darwin.deploy() as TestErc20Token;
  const finch = await Finch.deploy() as TestErc20Token;

  return {
    darwinPresale,
    darwinEcosystem,
    darwin,
    finch,
  };
};

// export const createAirDrop = async (
//   darwinPresale: DarwinPresale,
//   darwinEcosystem: DarwinEcosystem,
//   token: TestErc20Token
// ) => {
//   const decimals = BigNumber.from(10 ** (await token.decimals()));
//   const tokensPerETH = BigNumber.from(200 * 1000).mul(decimals);
//   const oneEth = ethers.utils.parseEther("1");
//   const RATE_MULTIPLIER = await darwinPresale.RATE_MULTIPLIER();
//   const rate = tokensPerETH.mul(RATE_MULTIPLIER).div(oneEth);

//   const uniswapRouterAddress = await getUniswapRouterAddress(
//     hardhat.network.name
//   );

//   const router = IUniswapV2Router02__factory.connect(
//     uniswapRouterAddress,
//     darwinPresale.signer
//   );
//   const factory = IUniswapV2Factory__factory.connect(
//     await router.factory(),
//     darwinPresale.signer
//   );

//   await factory.createPair(token.address, await router.WETH());

//   const presaleInfo = {
//     _saleTokenAddress: token.address,
//     _tokenRate: rate,
//     _raiseMin: ethers.utils.parseEther(".1"),
//     _raiseMax: ethers.utils.parseEther("500"),
//     _hardcap: ethers.utils.parseEther("20000"),
//     _presaleStart: await lastBlockTime(),
//     _presaleEnd: daysToSeconds(20).add(await lastBlockTime()),
//     _darwinEcosystemAddress: darwinEcosystem.address,
//   };

//   const tokensForPresale = rate.mul(presaleInfo._hardcap).div(RATE_MULTIPLIER);
//   const tokensForLiquidity = await token
//     .totalSupply()
//     .then((it) => it.sub(tokensForPresale));
//   const totalTokens = tokensForPresale.add(tokensForLiquidity);

//   await token.approve(darwinPresale.address, totalTokens);

//   const initPresale = await darwinPresale.initPresale(
//     uniswapRouterAddress,
//     darwinEcosystem.address
//   );

//   const tnx = await darwinPresale.initPresale({
//     saleTokenAddress: presaleInfo._saleTokenAddress,
//     tokenRate: presaleInfo._tokenRate,
//     raiseMin: presaleInfo._raiseMin,
//     raiseMax: presaleInfo._raiseMax,
//     hardcap: presaleInfo._hardcap,
//     lpAmount: tokensForLiquidity,
//     marketingPercentage: 10,
//     teamPercentage: 10,
//     presaleStart: await lastBlockTime(),
//     presaleEnd: daysToSeconds(90).add(await lastBlockTime()),
//     darwinEcosystemAddress: darwinEcosystem.address,
//     uniswapRouterAddress: uniswapRouterAddress,
//   });
//};
