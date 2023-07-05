/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  BigNumberish,
  Overrides,
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  EvoturesNFT,
  EvoturesNFTInterface,
} from "../../contracts/EvoturesNFT";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint16[]",
        name: "unminted_",
        type: "uint16[]",
      },
      {
        internalType: "contract IBoosterNFT",
        name: "_boosterContract",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "approved",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [],
    name: "BOOSTER_PRICE",
    outputs: [
      {
        internalType: "uint56",
        name: "",
        type: "uint56",
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
        internalType: "uint56",
        name: "",
        type: "uint56",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint16",
        name: "_tokenId",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "_boosterTokenId",
        type: "uint16",
      },
    ],
    name: "addBooster",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
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
    inputs: [],
    name: "boosterContract",
    outputs: [
      {
        internalType: "contract IBoosterNFT",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint16",
        name: "_tokenId",
        type: "uint16",
      },
    ],
    name: "boosters",
    outputs: [
      {
        internalType: "uint16[]",
        name: "",
        type: "uint16[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "contractURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "pure",
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
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getApproved",
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
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "isApprovedForAll",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
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
        name: "boosters_",
        type: "uint8",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint16",
        name: "id",
        type: "uint16",
      },
    ],
    name: "multipliers",
    outputs: [
      {
        internalType: "uint16",
        name: "mult",
        type: "uint16",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "onERC721Received",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ownerOf",
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
    inputs: [
      {
        internalType: "uint16",
        name: "_tokenId",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "_boosterTokenId",
        type: "uint16",
      },
    ],
    name: "removeBooster",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "tokenURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalMinted",
    outputs: [
      {
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unminted",
    outputs: [
      {
        internalType: "uint16[]",
        name: "",
        type: "uint16[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
    ],
    name: "userMinted",
    outputs: [
      {
        internalType: "uint16[]",
        name: "",
        type: "uint16[]",
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
  "0x60a060405260068054642386f26fc160c21b66ffffffffffffff60b01b199091161790556007805466ffffffffffffff1916661550f7dca700001790553480156200004957600080fd5b506040516200346d3803806200346d8339810160408190526200006c9162000677565b604080518082018252600d81526c45766f7475726573204e46547360981b60208083019182528351808501909452600884526745564f545552455360c01b908401528151919291620000c191600091620004e5565b508051620000d7906001906020840190620004e5565b505033608052508151620000f390600890602085019062000574565b50600680546001600160a01b0319166001600160a01b0383161790556200011d3361080d62000147565b6200012b3361084862000147565b50506006805461ffff60a01b1916600160a11b17905562000847565b620001698282604051806020016040528060008152506200016d60201b60201c565b5050565b620001798383620001e9565b6200018860008484846200037a565b620001e45760405162461bcd60e51b815260206004820152603260248201526000805160206200344d83398151915260448201527131b2b4bb32b91034b6b83632b6b2b73a32b960711b60648201526084015b60405180910390fd5b505050565b6001600160a01b038216620002415760405162461bcd60e51b815260206004820181905260248201527f4552433732313a206d696e7420746f20746865207a65726f20616464726573736044820152606401620001db565b6000818152600260205260409020546001600160a01b031615620002a85760405162461bcd60e51b815260206004820152601c60248201527f4552433732313a20746f6b656e20616c7265616479206d696e746564000000006044820152606401620001db565b6000818152600260205260409020546001600160a01b0316156200030f5760405162461bcd60e51b815260206004820152601c60248201527f4552433732313a20746f6b656e20616c7265616479206d696e746564000000006044820152606401620001db565b6001600160a01b038216600081815260036020908152604080832080546001019055848352600290915280822080546001600160a01b0319168417905551839291907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef908290a45050565b60006200039b846001600160a01b0316620004d660201b6200181a1760201c565b15620004ca57604051630a85bd0160e11b81526001600160a01b0385169063150b7a0290620003d59033908990889088906004016200075d565b6020604051808303816000875af192505050801562000413575060408051601f3d908101601f191682019092526200041091810190620007d8565b60015b620004af573d80801562000444576040519150601f19603f3d011682016040523d82523d6000602084013e62000449565b606091505b508051600003620004a75760405162461bcd60e51b815260206004820152603260248201526000805160206200344d83398151915260448201527131b2b4bb32b91034b6b83632b6b2b73a32b960711b6064820152608401620001db565b805181602001fd5b6001600160e01b031916630a85bd0160e11b149050620004ce565b5060015b949350505050565b6001600160a01b03163b151590565b828054620004f3906200080b565b90600052602060002090601f01602090048101928262000517576000855562000562565b82601f106200053257805160ff191683800117855562000562565b8280016001018555821562000562579182015b828111156200056257825182559160200191906001019062000545565b50620005709291506200061a565b5090565b82805482825590600052602060002090600f01601090048101928215620005625791602002820160005b83821115620005e057835183826101000a81548161ffff021916908361ffff16021790555092602001926002016020816001010492830192600103026200059e565b8015620006105782816101000a81549061ffff0219169055600201602081600101049283019260010302620005e0565b5050620005709291505b5b808211156200057057600081556001016200061b565b634e487b7160e01b600052604160045260246000fd5b805161ffff811681146200065a57600080fd5b919050565b80516001600160a01b03811681146200065a57600080fd5b600080604083850312156200068b57600080fd5b82516001600160401b0380821115620006a357600080fd5b818501915085601f830112620006b857600080fd5b8151602082821115620006cf57620006cf62000631565b8160051b604051601f19603f83011681018181108682111715620006f757620006f762000631565b6040529283528183019350848101820192898411156200071657600080fd5b948201945b838610156200073f576200072f8662000647565b855294820194938201936200071b565b96506200075090508782016200065f565b9450505050509250929050565b600060018060a01b038087168352602081871681850152856040850152608060608501528451915081608085015260005b82811015620007ac5785810182015185820160a0015281016200078e565b82811115620007bf57600060a084870101525b5050601f01601f19169190910160a00195945050505050565b600060208284031215620007eb57600080fd5b81516001600160e01b0319811681146200080457600080fd5b9392505050565b600181811c908216806200082057607f821691505b6020821081036200084157634e487b7160e01b600052602260045260246000fd5b50919050565b608051612be36200086a6000396000818161046501526116cf0152612be36000f3fe6080604052600436106101bb5760003560e01c80635b6cc627116100ec578063afd8e4fa1161008a578063d035770c11610064578063d035770c1461055d578063e086e5ec1461057d578063e8a3d48514610592578063e985e9c5146105a757600080fd5b8063afd8e4fa146104de578063b88d4fde1461051d578063c87b56dd1461053d57600080fd5b806391cca3db116100c657806391cca3db1461045357806395d89b4114610487578063a22cb4651461049c578063a2309ff8146104bc57600080fd5b80635b6cc627146103e55780636352211e1461040557806370a082311461042557600080fd5b80632163a04a1161015957806329a0eee81161013357806329a0eee81461036a578063373215891461037d5780633a3328cb1461039257806342842e0e146103c557600080fd5b80632163a04a1461030a57806323b872dd1461032a57806327f7be991461034a57600080fd5b8063095ea7b311610195578063095ea7b314610256578063150b7a02146102785780631aa5e872146102bd5780631ceb921f146102ea57600080fd5b806301ffc9a7146101c757806306fdde03146101fc578063081812fc1461021e57600080fd5b366101c257005b600080fd5b3480156101d357600080fd5b506101e76101e236600461227c565b6105f0565b60405190151581526020015b60405180910390f35b34801561020857600080fd5b50610211610642565b6040516101f391906122f8565b34801561022a57600080fd5b5061023e61023936600461230b565b6106d4565b6040516001600160a01b0390911681526020016101f3565b34801561026257600080fd5b50610276610271366004612340565b6106fb565b005b34801561028457600080fd5b506102a461029336600461236a565b630a85bd0160e11b95945050505050565b6040516001600160e01b031990911681526020016101f3565b3480156102c957600080fd5b506102dd6102d8366004612405565b610815565b6040516101f39190612420565b3480156102f657600080fd5b50610276610305366004612478565b6108a9565b34801561031657600080fd5b50610276610325366004612478565b610ba1565b34801561033657600080fd5b506102766103453660046124b1565b610d4a565b34801561035657600080fd5b5060065461023e906001600160a01b031681565b6102766103783660046124fc565b610d7b565b34801561038957600080fd5b506102dd6111e6565b34801561039e57600080fd5b506103b26103ad36600461252a565b611265565b60405161ffff90911681526020016101f3565b3480156103d157600080fd5b506102766103e03660046124b1565b61149e565b3480156103f157600080fd5b506102dd61040036600461252a565b6114b9565b34801561041157600080fd5b5061023e61042036600461230b565b611522565b34801561043157600080fd5b50610445610440366004612405565b611582565b6040519081526020016101f3565b34801561045f57600080fd5b5061023e7f000000000000000000000000000000000000000000000000000000000000000081565b34801561049357600080fd5b50610211611608565b3480156104a857600080fd5b506102766104b7366004612547565b611617565b3480156104c857600080fd5b506006546103b290600160a01b900461ffff1681565b3480156104ea57600080fd5b5060065461050590600160b01b900466ffffffffffffff1681565b60405166ffffffffffffff90911681526020016101f3565b34801561052957600080fd5b506102766105383660046125bf565b611626565b34801561054957600080fd5b5061021161055836600461230b565b61165e565b34801561056957600080fd5b506007546105059066ffffffffffffff1681565b34801561058957600080fd5b506102766116c4565b34801561059e57600080fd5b506102116117fa565b3480156105b357600080fd5b506101e76105c236600461267f565b6001600160a01b03918216600090815260056020908152604080832093909416825291909152205460ff1690565b60006001600160e01b031982166380ac58cd60e01b148061062157506001600160e01b03198216635b5e139f60e01b145b8061063c57506301ffc9a760e01b6001600160e01b03198316145b92915050565b606060008054610651906126b2565b80601f016020809104026020016040519081016040528092919081815260200182805461067d906126b2565b80156106ca5780601f1061069f576101008083540402835291602001916106ca565b820191906000526020600020905b8154815290600101906020018083116106ad57829003601f168201915b5050505050905090565b60006106df82611829565b506000908152600460205260409020546001600160a01b031690565b600061070682611522565b9050806001600160a01b0316836001600160a01b0316036107785760405162461bcd60e51b815260206004820152602160248201527f4552433732313a20617070726f76616c20746f2063757272656e74206f776e656044820152603960f91b60648201526084015b60405180910390fd5b336001600160a01b0382161480610794575061079481336105c2565b6108065760405162461bcd60e51b815260206004820152603d60248201527f4552433732313a20617070726f76652063616c6c6572206973206e6f7420746f60448201527f6b656e206f776e6572206f7220617070726f76656420666f7220616c6c000000606482015260840161076f565b6108108383611888565b505050565b6001600160a01b03811660009081526009602090815260409182902080548351818402810184019094528084526060939283018282801561089d57602002820191906000526020600020906000905b82829054906101000a900461ffff1661ffff16815260200190600201906020826001010492830192600103820291508084116108645790505b50505050509050919050565b336108b761ffff8416611522565b6001600160a01b03161461092a5760405162461bcd60e51b815260206004820152603460248201527f45766f74757265734e46543a3a72656d6f7665426f6f737465723a2043414c4c60448201527322a92fa727aa2fa2ab27aa2aa922afa7aba722a960611b606482015260840161076f565b61ffff82166000908152600a602052604090205461099f5760405162461bcd60e51b815260206004820152602c60248201527f45766f74757265734e46543a3a72656d6f7665426f6f737465723a204e4f5f4260448201526b13d3d4d5115497d05111115160a21b606482015260840161076f565b600654604051632142170760e11b815230600482015233602482015261ffff831660448201526001600160a01b03909116906342842e0e90606401600060405180830381600087803b1580156109f457600080fd5b505af1158015610a08573d6000803e3d6000fd5b5050505060005b61ffff83166000908152600a602052604090205460ff821610156108105761ffff8381166000908152600a6020526040902080549184169160ff8416908110610a5a57610a5a6126e6565b60009182526020909120601082040154600f9091166002026101000a900461ffff1603610b8f5761ffff83166000908152600a602052604090208054610aa290600190612712565b81548110610ab257610ab26126e6565b90600052602060002090601091828204019190066002029054906101000a900461ffff16600a60008561ffff1661ffff1681526020019081526020016000208260ff1681548110610b0557610b056126e6565b90600052602060002090601091828204019190066002026101000a81548161ffff021916908361ffff160217905550600a60008461ffff1661ffff168152602001908152602001600020805480610b5e57610b5e612729565b600082815260209020601060001990920191820401805461ffff6002600f8516026101000a02191690559055505050565b80610b998161273f565b915050610a0f565b33610baf61ffff8416611522565b6001600160a01b031614610c1f5760405162461bcd60e51b815260206004820152603160248201527f45766f74757265734e46543a3a616464426f6f737465723a2043414c4c45525f6044820152702727aa2fa2ab27aa2aa922afa7aba722a960791b606482015260840161076f565b61ffff82166000908152600a6020526040902054600511610c965760405162461bcd60e51b815260206004820152602b60248201527f45766f74757265734e46543a3a616464426f6f737465723a204d41585f424f4f60448201526a14d5115494d7d05111115160aa1b606482015260840161076f565b600654604051632142170760e11b815233600482015230602482015261ffff831660448201526001600160a01b03909116906342842e0e90606401600060405180830381600087803b158015610ceb57600080fd5b505af1158015610cff573d6000803e3d6000fd5b5050505061ffff9182166000908152600a6020908152604082208054600181018255908352912060108204018054600f9092166002026101000a808502199092169290931602179055565b610d5433826118f6565b610d705760405162461bcd60e51b815260040161076f9061275e565b610810838383611975565b60085460ff83161115610dd05760405162461bcd60e51b815260206004820181905260248201527f45766f74757265734e46543a3a6d696e743a204d494e545f4558434545444544604482015260640161076f565b33600090815260096020526040902054610deb906003612712565b8260ff1611158015610e01575060058160ff1611155b610e4d5760405162461bcd60e51b815260206004820152601c60248201527f45766f74757265734e46543a3a6d696e743a20464f5242494444454e00000000604482015260640161076f565b60075466ffffffffffffff16610e6382846127ab565b60ff16610e7091906127d4565b600654610e9090600160b01b900466ffffffffffffff1660ff85166127d4565b610e9a9190612803565b66ffffffffffffff16341015610efe5760405162461bcd60e51b815260206004820152602360248201527f45766f74757265734e46543a3a6d696e743a20494e53554646494349454e545f60448201526208aa8960eb1b606482015260840161076f565b60005b8260ff168160ff161015610810576000610f19611ad9565b9050610f5d3360088361ffff1681548110610f3657610f366126e6565b60009182526020909120601082040154600f9091166002026101000a900461ffff16611c43565b60068054600160a01b900461ffff16906014610f788361282e565b91906101000a81548161ffff021916908361ffff1602179055505060096000336001600160a01b03166001600160a01b0316815260200190815260200160002060088261ffff1681548110610fcf57610fcf6126e6565b600091825260208083206010808404909101548554600181018755958552919093209284049092018054600f928316600290810261010090810a90950461ffff908116949096160290930a9182029190930219909116179055600654604051631efdd7db60e21b815260ff851660048201523060248201526001600160a01b0390911690637bf75f6c906044016000604051808303816000875af115801561107b573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526110a3919081019061284f565b600a600060088461ffff16815481106110be576110be6126e6565b90600052602060002090601091828204019190066002029054906101000a900461ffff1661ffff1661ffff168152602001908152602001600020908051906020019061110b9291906121a8565b506008805461111c90600190612712565b8154811061112c5761112c6126e6565b90600052602060002090601091828204019190066002029054906101000a900461ffff1660088261ffff1681548110611167576111676126e6565b90600052602060002090601091828204019190066002026101000a81548161ffff021916908361ffff16021790555060088054806111a7576111a7612729565b600082815260209020601060001990920191820401805461ffff6002600f8516026101000a0219169055905550806111de8161273f565b915050610f01565b606060088054806020026020016040519081016040528092919081815260200182805480156106ca57602002820191906000526020600020906000905b82829054906101000a900461ffff1661ffff16815260200190600201906020826001010492830192600103820291508084116112235790505050505050905090565b61ffff81166000908152600a60209081526040808320805482518185028101850190935280835284938301828280156112e557602002820191906000526020600020906000905b82829054906101000a900461ffff1661ffff16815260200190600201906020826001010492830192600103820291508084116112ac5790505b5050505050905060005b81518160ff1610156113b75760065482516001600160a01b03909116906359ea5adb90849060ff8516908110611327576113276126e6565b60200260200101516040518263ffffffff1660e01b8152600401611355919061ffff91909116815260200190565b6040805180830381865afa158015611371573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906113959190612901565b516113a39060ff1684612960565b9250806113af8161273f565b9150506112ef565b508261ffff1661080d14806113d157508261ffff16610848145b156113e9576113e26103e883612960565b9150611498565b6107d08361ffff16111561140a576114036107d08461297d565b9250611427565b6103e88361ffff161115611427576114246103e88461297d565b92505b60038361ffff161015611440576113e26101f483612960565b60088361ffff161015611459576113e261019083612960565b60148361ffff161015611472576113e261012c83612960565b60288361ffff16101561148a576113e260fa83612960565b61149560c883612960565b91505b50919050565b61081083838360405180602001604052806000815250611626565b61ffff81166000908152600a602090815260409182902080548351818402810184019094528084526060939283018282801561089d576000918252602091829020805461ffff168452908202830192909160029101808411610864575094979650505050505050565b6000818152600260205260408120546001600160a01b03168061063c5760405162461bcd60e51b8152602060048201526018602482015277115490cdcc8c4e881a5b9d985b1a59081d1bdad95b88125160421b604482015260640161076f565b60006001600160a01b0382166115ec5760405162461bcd60e51b815260206004820152602960248201527f4552433732313a2061646472657373207a65726f206973206e6f7420612076616044820152683634b21037bbb732b960b91b606482015260840161076f565b506001600160a01b031660009081526003602052604090205490565b606060018054610651906126b2565b611622338383611c5d565b5050565b61163033836118f6565b61164c5760405162461bcd60e51b815260040161076f9061275e565b61165884848484611d2b565b50505050565b606061166982611829565b6000611673611d5e565b905060008151116116935760405180602001604052806000815250611495565b8061169d84611d7e565b6040516020016116ae9291906129a0565b6040516020818303038152906040529392505050565b336001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000161461174d5760405162461bcd60e51b815260206004820152602860248201527f45766f74757265734e46543a3a77697468647261774554483a2043414c4c45526044820152672fa727aa2fa222ab60c11b606482015260840161076f565b604051600090339047908381818185875af1925050503d806000811461178f576040519150601f19603f3d011682016040523d82523d6000602084013e611794565b606091505b50509050806117f75760405162461bcd60e51b815260206004820152602960248201527f45766f74757265734e46543a3a77697468647261774554483a205452414e5346604482015268115497d1905253115160ba1b606482015260840161076f565b50565b6060604051806060016040528060278152602001612b8760279139905090565b6001600160a01b03163b151590565b6000818152600260205260409020546001600160a01b03166117f75760405162461bcd60e51b8152602060048201526018602482015277115490cdcc8c4e881a5b9d985b1a59081d1bdad95b88125160421b604482015260640161076f565b600081815260046020526040902080546001600160a01b0319166001600160a01b03841690811790915581906118bd82611522565b6001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45050565b60008061190283611522565b9050806001600160a01b0316846001600160a01b0316148061194957506001600160a01b0380821660009081526005602090815260408083209388168352929052205460ff165b8061196d5750836001600160a01b0316611962846106d4565b6001600160a01b0316145b949350505050565b826001600160a01b031661198882611522565b6001600160a01b0316146119ae5760405162461bcd60e51b815260040161076f906129df565b6001600160a01b038216611a105760405162461bcd60e51b8152602060048201526024808201527f4552433732313a207472616e7366657220746f20746865207a65726f206164646044820152637265737360e01b606482015260840161076f565b826001600160a01b0316611a2382611522565b6001600160a01b031614611a495760405162461bcd60e51b815260040161076f906129df565b600081815260046020908152604080832080546001600160a01b03199081169091556001600160a01b0387811680865260038552838620805460001901905590871680865283862080546001019055868652600290945282852080549092168417909155905184937fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef91a4505050565b6000804233604051602001611aee9190612a24565b6040516020818303038152906040528051906020012060001c611b119190612a57565b4230604051602001611b239190612a24565b6040516020818303038152906040528051906020012060001c611b469190612a57565b434232604051602001611b599190612a24565b6040516020818303038152906040528051906020012060001c611b7c9190612a57565b454241604051602001611b8f9190612a24565b6040516020818303038152906040528051906020012060001c611bb29190612a57565b5a611bbd4442612a6b565b611bc79190612a6b565b611bd19190612a6b565b611bdb9190612a6b565b611be59190612a6b565b611bef9190612a6b565b611bf99190612a6b565b611c039190612a6b565b604051602001611c1591815260200190565b60408051601f198184030181529190528051602090910120600854909150611c3d9082612a83565b91505090565b611622828260405180602001604052806000815250611e11565b816001600160a01b0316836001600160a01b031603611cbe5760405162461bcd60e51b815260206004820152601960248201527f4552433732313a20617070726f766520746f2063616c6c657200000000000000604482015260640161076f565b6001600160a01b03838116600081815260056020908152604080832094871680845294825291829020805460ff191686151590811790915591519182527f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a3505050565b611d36848484611975565b611d4284848484611e44565b6116585760405162461bcd60e51b815260040161076f90612a97565b6060604051806080016040528060438152602001612b4460439139905090565b60606000611d8b83611f45565b600101905060008167ffffffffffffffff811115611dab57611dab612578565b6040519080825280601f01601f191660200182016040528015611dd5576020820181803683370190505b5090508181016020015b600019016f181899199a1a9b1b9c1cb0b131b232b360811b600a86061a8153600a8504945084611ddf57509392505050565b611e1b838361201d565b611e286000848484611e44565b6108105760405162461bcd60e51b815260040161076f90612a97565b60006001600160a01b0384163b15611f3a57604051630a85bd0160e11b81526001600160a01b0385169063150b7a0290611e88903390899088908890600401612ae9565b6020604051808303816000875af1925050508015611ec3575060408051601f3d908101601f19168201909252611ec091810190612b26565b60015b611f20573d808015611ef1576040519150601f19603f3d011682016040523d82523d6000602084013e611ef6565b606091505b508051600003611f185760405162461bcd60e51b815260040161076f90612a97565b805181602001fd5b6001600160e01b031916630a85bd0160e11b14905061196d565b506001949350505050565b60008072184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b8310611f845772184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b830492506040015b6d04ee2d6d415b85acef81000000008310611fb0576d04ee2d6d415b85acef8100000000830492506020015b662386f26fc100008310611fce57662386f26fc10000830492506010015b6305f5e1008310611fe6576305f5e100830492506008015b6127108310611ffa57612710830492506004015b6064831061200c576064830492506002015b600a831061063c5760010192915050565b6001600160a01b0382166120735760405162461bcd60e51b815260206004820181905260248201527f4552433732313a206d696e7420746f20746865207a65726f2061646472657373604482015260640161076f565b6000818152600260205260409020546001600160a01b0316156120d85760405162461bcd60e51b815260206004820152601c60248201527f4552433732313a20746f6b656e20616c7265616479206d696e74656400000000604482015260640161076f565b6000818152600260205260409020546001600160a01b03161561213d5760405162461bcd60e51b815260206004820152601c60248201527f4552433732313a20746f6b656e20616c7265616479206d696e74656400000000604482015260640161076f565b6001600160a01b038216600081815260036020908152604080832080546001019055848352600290915280822080546001600160a01b0319168417905551839291907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef908290a45050565b82805482825590600052602060002090600f016010900481019282156122415791602002820160005b8382111561221157835183826101000a81548161ffff021916908361ffff16021790555092602001926002016020816001010492830192600103026121d1565b801561223f5782816101000a81549061ffff0219169055600201602081600101049283019260010302612211565b505b5061224d929150612251565b5090565b5b8082111561224d5760008155600101612252565b6001600160e01b0319811681146117f757600080fd5b60006020828403121561228e57600080fd5b813561229981612266565b9392505050565b60005b838110156122bb5781810151838201526020016122a3565b838111156116585750506000910152565b600081518084526122e48160208601602086016122a0565b601f01601f19169290920160200192915050565b60208152600061229960208301846122cc565b60006020828403121561231d57600080fd5b5035919050565b80356001600160a01b038116811461233b57600080fd5b919050565b6000806040838503121561235357600080fd5b61235c83612324565b946020939093013593505050565b60008060008060006080868803121561238257600080fd5b61238b86612324565b945061239960208701612324565b935060408601359250606086013567ffffffffffffffff808211156123bd57600080fd5b818801915088601f8301126123d157600080fd5b8135818111156123e057600080fd5b8960208285010111156123f257600080fd5b9699959850939650602001949392505050565b60006020828403121561241757600080fd5b61229982612324565b6020808252825182820181905260009190848201906040850190845b8181101561245c57835161ffff168352928401929184019160010161243c565b50909695505050505050565b61ffff811681146117f757600080fd5b6000806040838503121561248b57600080fd5b823561249681612468565b915060208301356124a681612468565b809150509250929050565b6000806000606084860312156124c657600080fd5b6124cf84612324565b92506124dd60208501612324565b9150604084013590509250925092565b60ff811681146117f757600080fd5b6000806040838503121561250f57600080fd5b823561251a816124ed565b915060208301356124a6816124ed565b60006020828403121561253c57600080fd5b813561229981612468565b6000806040838503121561255a57600080fd5b61256383612324565b9150602083013580151581146124a657600080fd5b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f1916810167ffffffffffffffff811182821017156125b7576125b7612578565b604052919050565b600080600080608085870312156125d557600080fd5b6125de85612324565b935060206125ed818701612324565b935060408601359250606086013567ffffffffffffffff8082111561261157600080fd5b818801915088601f83011261262557600080fd5b81358181111561263757612637612578565b612649601f8201601f1916850161258e565b9150808252898482850101111561265f57600080fd5b808484018584013760008482840101525080935050505092959194509250565b6000806040838503121561269257600080fd5b61269b83612324565b91506126a960208401612324565b90509250929050565b600181811c908216806126c657607f821691505b60208210810361149857634e487b7160e01b600052602260045260246000fd5b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b600082821015612724576127246126fc565b500390565b634e487b7160e01b600052603160045260246000fd5b600060ff821660ff8103612755576127556126fc565b60010192915050565b6020808252602d908201527f4552433732313a2063616c6c6572206973206e6f7420746f6b656e206f776e6560408201526c1c881bdc88185c1c1c9bdd9959609a1b606082015260800190565b600060ff821660ff84168160ff04811182151516156127cc576127cc6126fc565b029392505050565b600066ffffffffffffff808316818516818304811182151516156127fa576127fa6126fc565b02949350505050565b600066ffffffffffffff808316818516808303821115612825576128256126fc565b01949350505050565b600061ffff808316818103612845576128456126fc565b6001019392505050565b6000602080838503121561286257600080fd5b825167ffffffffffffffff8082111561287a57600080fd5b818501915085601f83011261288e57600080fd5b8151818111156128a0576128a0612578565b8060051b91506128b184830161258e565b81815291830184019184810190888411156128cb57600080fd5b938501935b838510156128f557845192506128e583612468565b82825293850193908501906128d0565b98975050505050505050565b60006040828403121561291357600080fd5b6040516040810181811067ffffffffffffffff8211171561293657612936612578565b6040528251612944816124ed565b81526020830151612954816124ed565b60208201529392505050565b600061ffff808316818516808303821115612825576128256126fc565b600061ffff83811690831681811015612998576129986126fc565b039392505050565b600083516129b28184602088016122a0565b8351908301906129c68183602088016122a0565b64173539b7b760d91b9101908152600501949350505050565b60208082526025908201527f4552433732313a207472616e736665722066726f6d20696e636f72726563742060408201526437bbb732b960d91b606082015260800190565b60609190911b6bffffffffffffffffffffffff1916815260140190565b634e487b7160e01b600052601260045260246000fd5b600082612a6657612a66612a41565b500490565b60008219821115612a7e57612a7e6126fc565b500190565b600082612a9257612a92612a41565b500690565b60208082526032908201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560408201527131b2b4bb32b91034b6b83632b6b2b73a32b960711b606082015260800190565b6001600160a01b0385811682528416602082015260408101839052608060608201819052600090612b1c908301846122cc565b9695505050505050565b600060208284031215612b3857600080fd5b81516122998161226656fe697066733a2f2f626166796265696567626779376132673232706e6f7867786b786a7a74677a7a35786e77336e616f627066626e6234766c367473677570706370692f68747470733a2f2f64617277696e70726f746f636f6c2e696f2f65766f74757265732e6a736f6ea26469706673582212209eb7758c780ea19a9209ad7d996644feede29f17a87abfca1a241ba5f8e0c55064736f6c634300080e00334552433732313a207472616e7366657220746f206e6f6e204552433732315265";

type EvoturesNFTConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: EvoturesNFTConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class EvoturesNFT__factory extends ContractFactory {
  constructor(...args: EvoturesNFTConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    unminted_: PromiseOrValue<BigNumberish>[],
    _boosterContract: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<EvoturesNFT> {
    return super.deploy(
      unminted_,
      _boosterContract,
      overrides || {}
    ) as Promise<EvoturesNFT>;
  }
  override getDeployTransaction(
    unminted_: PromiseOrValue<BigNumberish>[],
    _boosterContract: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      unminted_,
      _boosterContract,
      overrides || {}
    );
  }
  override attach(address: string): EvoturesNFT {
    return super.attach(address) as EvoturesNFT;
  }
  override connect(signer: Signer): EvoturesNFT__factory {
    return super.connect(signer) as EvoturesNFT__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): EvoturesNFTInterface {
    return new utils.Interface(_abi) as EvoturesNFTInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): EvoturesNFT {
    return new Contract(address, _abi, signerOrProvider) as EvoturesNFT;
  }
}
