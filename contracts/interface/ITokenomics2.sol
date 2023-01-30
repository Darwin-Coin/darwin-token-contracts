pragma solidity ^0.8.14;

// SPDX-License-Identifier: BUSL-1.1

interface ITokenomics {

    event ExchangeAdded(address account);
    event ExchangedRemoved(address account);

    // Pair is already registered
    error PairAlreadyRegistered();
    // Pair is not registered
    error PairNotRegistered();
  
}
