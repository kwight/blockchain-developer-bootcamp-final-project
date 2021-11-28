# Avoiding Common Attacks

## SWC weaknesses

The contract has been scanned with MythX, which checks for almost all [SWC weaknesses](https://mythx.io/detectors/):

* SWC-100
* SWC-101
* SWC-102
* SWC-103
* SWC-104
* SWC-105
* SWC-106
* SWC-107
* SWC-108
* SWC-109
* SWC-110
* SWC-111
* SWC-112
* SWC-113
* SWC-115
* SWC-116
* SWC-118
* SWC-119
* SWC-120
* SWC-123
* SWC-124
* SWC-127
* SWC-128
* SWC-129
* SWC-130
* SWC-131

The above list includes SWC-101, SWC-107, SWC-113, SWC-115, which are all of the SWCs covered in the bootcamp materials.

In fact, a MythX deep (but not quick nor standard) scan found a SWC-107 vulnerability, due to my not following the [Checks-Effects-Interactions pattern](https://docs.soliditylang.org/en/latest/security-considerations.html#use-the-checks-effects-interactions-pattern). This has since been fixed in [7318064](https://github.com/kwight/blockchain-developer-bootcamp-final-project/commit/731806457f57aecf9a1700ce779cfdbffda02dbd).

## Best practices

These general best practices have been followed to also mitigate potential attacks.

* The contract ownership is handled by Open Zeppelin's `Owner.sol` contract.
* Modifiers are used to verify the caller's permission for write operations.
* Contract variables have been kept `private`, with getters created as necessary.
* `require` statements are used at the top of methods to validate input parameters.
* The contract is pinned to a specific pragma version.
* The contract has good unit test coverage (35 assertions over 16 tests).
* `tx.origin`, `send`, and `transfer` are not used.