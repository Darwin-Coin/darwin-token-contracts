import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import { ethers } from "hardhat";

require('@openzeppelin/hardhat-upgrades');

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more


const TEST_MNEMONICS = String(process.env.TEST_MNEMONICS)

const config: HardhatUserConfig = {

    solidity: {

        compilers: [
            {
                version: "0.5.16",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    },
                }
            },
            {
                version: "0.6.6",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    },
                }

            },
            {
                version: "0.8.3",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    },
                }

            },
            {
                version: "0.8.4",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    },
                }
            }

        ],
    },

    networks: {
        local: {
            url: "http://127.0.0.1:8545",
            accounts: {
                mnemonic: String(TEST_MNEMONICS),
                count: 100,
                initialIndex: 0
            }
        },
        localMainNetFork: {
            url: "http://127.0.0.1:8545",
            // gas: 67219750,
            accounts: {
                mnemonic: String(TEST_MNEMONICS),
                count: 5,
                initialIndex: 0
            }
        },

        localBscTestNetFork: {
            url: "http://127.0.0.1:8545",
            // gas: 67219750,
            accounts: {
                mnemonic: String(TEST_MNEMONICS),
                count: 5,
                initialIndex: 0
            }
        },
        bscTestNet: {
            url: "https://data-seed-prebsc-1-s1.binance.org:8545",
            accounts: {
                mnemonic: String(TEST_MNEMONICS),
                count: 5,
                initialIndex: 0
            }
        },
        hardhat: {
            loggingEnabled: true,
            allowUnlimitedContractSize:true,
            gasMultiplier: 1,
            blockGasLimit: Number.MAX_SAFE_INTEGER,
            accounts: {
                mnemonic: String(TEST_MNEMONICS),
                count: 150,
                initialIndex: 0,
            },
            gasPrice : 10,
            gas : Number.MAX_SAFE_INTEGER
        }
    },

    gasReporter: {
        enabled: Boolean(process.env.REPORT_GAS),
        currency: "USD",
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
    mocha: {
        parallel: false
    }
};

export default config;
