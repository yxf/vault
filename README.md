# Vault

## Usage

### Pre Requisites

Before running any command, you need to create a `.env` file and set a BIP-39 compatible mnemonic as an environment
variable. Follow the example in `.env.example`. If you don't already have a mnemonic, use this [website](https://iancoleman.io/bip39/) to generate one.

Then, proceed with installing dependencies:

```sh
yarn install
```

### Compile

Compile the smart contracts with Hardhat:

```sh
$ yarn compile
```

### TypeChain

Compile the smart contracts and generate TypeChain artifacts:

```sh
$ yarn typechain
```

### Lint Solidity

Lint the Solidity code:

```sh
$ yarn lint:sol
```

### Lint TypeScript

Lint the TypeScript code:

```sh
$ yarn lint:ts
```

### Test

Run the Mocha tests:

```sh
$ yarn test
```

### Coverage

Generate the code coverage report:

```sh
$ yarn coverage
```

### Report Gas

See the gas usage per unit test and average gas per method call:

```sh
$ REPORT_GAS=true yarn test
```

### Clean

Delete the smart contract artifacts, the coverage reports and the Hardhat cache:

```sh
$ yarn clean
```

### Deploy

Deploy the contracts to rinkeby network:

```sh
$ yarn deploy --manager address --network rinkeby
```

### Deployed contracts on rinkeby

- Vault: [0x241C192c369a48Ea7F704682C17DC94927557609](https://rinkeby.etherscan.io/address/0x241C192c369a48Ea7F704682C17DC94927557609)

- MockToken: [0xA7A0185Ed13D5148d2ff0D83066EdEAD1aa77d34](https://rinkeby.etherscan.io/address/0xA7A0185Ed13D5148d2ff0D83066EdEAD1aa77d34)

- MockStrategy: [0x4EE1452d38dd0348Db113A5Bef4736EA22939C7E](https://rinkeby.etherscan.io/address/0x4EE1452d38dd0348Db113A5Bef4736EA22939C7E)

- MockEtherStrategy: [0xB27ECDd4Bf478d5DF10555e6B04597c364f178FF](https://rinkeby.etherscan.io/address/0xB27ECDd4Bf478d5DF10555e6B04597c364f178FF)

After deployed all contracts. You should call `Vault#setStrategy(token, strategy)` to update investment strategy for ETH and token

### How to test

If you want to test invest function, you should set strategy `setStrategy(token, strategy)`.

#### ETH vault

Basic functions

token = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE

- Call `Vault#deposit(address token, uint amount)` to put in some ether to vault
- Call `Vault#withdraw(address token, uint shares)` to withdraw some ether

Extra functions

- Call `Vault#deposit(address token, uint amount)` to put in some ether to vault
- Call `Vault#invest(address token)` to invest funds using manager wallet
- Call `MockEtherStrategy#decrease(uint amount)` to simulate invest loss or send some ether to `MockEtherStrategy` to simulate invest gains
- Call `Vault#withdraw(address token, uint shares)` to withdraw your ether

#### Token vault

Basic functions

- Call `MockToken#mint(address to, uint amount)` to mint some tokens for test
- Call `Vault#deposit(address token, uint amount)` to put in some tokens to vault
- Call `Vault#withdraw(address token, uint shares)` to withdraw some tokens

Extra functions

- Call `Vault#deposit(address token, uint amount)` to put in some tokens to vault
- Call `Vault#invest(address token)` to invest funds using manager wallet
- Call `MockEtherStrategy#decrease(uint amount)` to simulate invest loss or send some tokens to `MockStrategy` to simulate invest gains
- Call `Vault#balanceOf(address user, address token)` to check your loss or gains
- Call `Vault#withdraw(address token, uint shares)` to check your tokens
