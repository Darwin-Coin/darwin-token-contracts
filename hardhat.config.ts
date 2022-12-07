import { HardhatUserConfig, task } from "hardhat/config";
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-chai-matchers';
import '@nomiclabs/hardhat-solhint';
import { } from "@openzeppelin/hardhat-upgrades";
import '@openzeppelin/hardhat-upgrades';

import * as dotenv from "dotenv";
dotenv.config();


// const TEST_MNEMONICS = String(process.env.TEST_MNEMONICS)
const TEST_MNEMONICS = "test test test test test test test test test test test junk"

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
            },
            {
                version: "0.8.9",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    },
                }
            },
            {
                version: "0.8.14",
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
                mnemonic: String(process.env.TEST_MNEMONICS),
                count: 100,
                initialIndex: 0
            }
        },
        localMainNetFork: {
            url: "http://127.0.0.1:8545",
            accounts: {
                mnemonic: String(process.env.TEST_MNEMONICS),
                count: 100,
                initialIndex: 0
            }
        },

        localBscTestNetFork: {
            url: "http://127.0.0.1:8545",
            accounts: {
                mnemonic: String(process.env.TEST_MNEMONICS),
                count: 100,
                initialIndex: 6
            }
        },
        bscTestNet: {
            url: "https://data-seed-prebsc-2-s1.binance.org:8545/",
            chainId: 97,
            accounts:{
                mnemonic: String(process.env.TEST_MNEMONICS),
                count:1
            }
        },
        bscMainNet: {
            url: "https://bsc-dataseed1.binance.org/",
            chainId: 56,
            accounts:{
                mnemonic: String(process.env.DEPLOYER_MNEMONICS),
                count:1
            }
        },
        hardhat: {
            loggingEnabled: false,
            // gasMultiplier:1,
            forking:{
                enabled:false,
                url : "https://bsc-dataseed3.ninicoin.io/"
            },
            accounts: {
                mnemonic: String(process.env.TEST_MNEMONICS),
                count: 100,
                initialIndex: 0
            }
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
