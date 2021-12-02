# CryptoGive

CryptoGive is a platform for donating to your choice of charity programs with cryptocurrency.

* [Public app using Ropsten](https://blockchain-bootcamp-project.web.app)
* [Video demo](https://youtu.be/b5REuIe6S4M)

| Home View | Donations View |
| --- | --- |
| <img width="375" alt="Screen Shot 2021-12-01 at 8 16 50 PM" src="https://user-images.githubusercontent.com/349751/144357448-0fadceab-a207-467e-83b7-d81c7b6e0ef7.png"> | <img width="375" alt="Screen Shot 2021-12-01 at 8 18 52 PM" src="https://user-images.githubusercontent.com/349751/144357458-5ee0262e-78c2-493f-9931-f15616afee18.png"> |

---

## How does a blockchain help?

Donation platforms already exist – how is one based on a public blockchain an improvement?

- Ease of use: Anyone with a wallet can donate, regardless of banking or credit access, in amounts that are not always possible with traditional currency.
- Trust: Public blockchains can remove the need for trust between parties, as all transfers and wallet balances can be confirmed and scrutinized.
- Transparency: Charitable activity is easily verified in the open, and doners can more easily track and confirm their own activity across multiple charities.
- Speed and efficiency: Donations land in charities' wallets immediately, with no intermediaries taking a cut. Minimal infrastructure or technical needs are required by the charity.

## How does CryptoGive work?

The platform owner can register charities, who in turn register programs/campaigns. Potential doners select from the active programs available and donate an amount in ether (which is then transferred to the address of the charity).

### Owners

The owner is the address that deployed the contract. The owner can:

* Register new charities.
* Remove existing charities.

### Charities

A charity must first be registered by the owner. A registered charity can:

* Register a new program.
* Cancel an active program.
* Declare an active program completed.
* Remove themselves from the platform (not available in the UI).

### Doners

Anyone can be a doner to any active program, and see their own past donations.

---

## Project implementation

CryptoGive is a standard-configured Truffle project with [few dependencies](https://github.com/kwight/blockchain-developer-bootcamp-final-project/blob/main/package.json#L22). The client app is stateless and written in vanilla JavaScript, with each page loading only the scripts it needs. Other than the contract migrations, the project does not require a build process.

It uses `ethers.js` and MetaMask as providers and the wallet.

The project UI is publicly available at https://blockchain-bootcamp-project.web.app/, which uses the deployed contract on the [Ropsten network](https://ropsten.etherscan.io/address/0x4fd8BCbBe61c5015CE12827bE005540fc7710695).

To develop the project locally, you will need Truffle v5.4.15 or higher (Truffle's own [requirements](https://www.trufflesuite.com/docs/truffle/getting-started/installation) are Node v8.9.4 or later, and Linux, MacOS, or Windows).

### Directory structure

* `contracts/`: Solidity contracts – the project's only contract is `Fundraisers.sol`.
* `notes/`: Initial exploration.
* `src/`: Client app.
* `test/`: Unit tests for the contract in JS.

### Installation

* Use `node -v` to verify your Node version is at least v8.9.4. If not, follow [Node's instructions](https://nodejs.dev/learn/how-to-install-nodejs) for installation or updating.
* Use `truffle --version` to verify your Truffle installation is at least v5.4.15. If not, follow their [instructions](https://www.trufflesuite.com/docs/truffle/getting-started/installation) to update or install it (try `npm install -g truffle` for the latest version).
* Clone this repository to your local machine with `git clone git@github.com:kwight/blockchain-developer-bootcamp-final-project.git` (assumes you have SSH keys set up – HTTPS will work fine too).
* `cd` into the root of your cloned repo.
* Run `npm install` to fetch the package dependencies.
* Run `truffle develop`. This will start up a local blockchain and give you a console.
* Make note of the URL and port; if you're not using the defaults, or are using another blockchain such as Ganache, [this line](https://github.com/kwight/blockchain-developer-bootcamp-final-project/blob/main/src/scripts/fundraisers.js#L28) will need to be updated, as well as the `development` network in `truffle-config.js`.
* In that console, deploy the contract with `migrate --reset`.
* Create an instance of the contract with `f = await Fundraisers.deployed()`.
* Enter `f.address` to get the contract's local address, and enter it on [this line](https://github.com/kwight/blockchain-developer-bootcamp-final-project/blob/main/src/scripts/fundraisers.js#L5).
* The client UI is served as static files from `/src`. In that directory in a different terminal window (keep the development console running), run `npx serve` and open the given URL in your browser. Any local webserver service run from that directory will also work.
* Back in the console, run `test` to verify the contract unit tests all pass.

You're all set – you've got a console with access to the deployed contract on the local blockchain, and a front-end in your browser that's using the local blockchain as its data source.

### Development

Here are some commands you can use to interact with the contract from the console. These assume you've set the `f` variable from the installation notes above. Remember that on the local blockchain, the contract owner is the `accounts[0]` account (which is the default `from:` value when one isn't specified). If the client UI is open while running commands on the console, it will update automatically.

* Register a charity: `f.registerCharity(accounts[1], 'SPCA')`
* Register a program: `f.registerProgram('Cat Adoption', {from: accounts[1]})`
* Register another program: `f.registerProgram('Dog Rescue', {from: accounts[1]})`
* View the registered programs: `f.getPrograms()`
* Mark the first program as complete: `f.completeProgram(0, {from: accounts[1]})`
* Donate to the dog rescue from that account: `f.donate(1, {from: accounts[9], value:55555555555555})`

### Deployment

The project uses `dotenv` for managing keys when deploying to public networks. Create a local `.env` file (which is gitignored) with the following constants. Ropsten is already configured (other networks would need to be added to `truffle-config.js`).

* `PRIVATE_KEY`: Private key of the account that should be owner on deployment.
* `INFURA_URL`: Infura URL with the project ID.

---

Address for certification: kwight.eth (0x0808832994E697C9c1A3e76a60A7e0c75e52348a)
