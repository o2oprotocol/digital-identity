# Digital-Identity using ERC 725/735

An implementation of [ERC 725](https://github.com/ethereum/EIPs/issues/725) and [ERC 735](https://github.com/ethereum/EIPs/issues/735) for **Digital Identity and Blockchain**. We uses the [Truffle framework](http://truffleframework.com/) and [Ganache CLI](https://github.com/trufflesuite/ganache-cli) for testing.

Using [ERC 725](https://github.com/ethereum/EIPs/issues/725), a **Smart Contract** can protect function calls from being executed unless the **Sender** has a verified **Claim** from a trusted **Issuer**.

TODO: Claim, IPFS-8082

## Architecture

the class diagram to make extensive use of Solidity patterns for modular code i.e. libraries, abstract contracts and multiple inheritance:

```
                +--------------+         +------------+
                |              |         |            |
                |    ERC 165   |         | KeyStore** |
                |              |         |            |
                +---+--------+-+         +----+-------+
                    |        |                |
               +----v-----+ +v---------+ +----v-----+
               |          | |          | |          |
 +-------------+ ERC 735* | | ERC 725* | | KeyBase* |
 |             |          | |          | |          |
 |             +----------+ ++-+----+--+ +--+-------+------+--------------+
 |                           | |    |       |              |              |
 |                           | |    |       |              |              |
 |   +-----------------------+ |    | +-----+-----+  +-----v-----+ +------v-------+
 |   |                         |    | |           |  |           | |              |
 |   |                 +-------|----|-+  Pausable |  | KeyGetter | | Destructible |
 |   |    +--------------------|----|-+           |  |           | |              |
 |   |    |            |       |    | +--+--------+  +-+---------+ +--+-----------+
 |   |    |            |  +----+    |    |             |              |
 |   |    |            |  |         |    |             |              |
 |   |    |            |  |         |    |             |              |
 |   |    |            |  |         |    |             |              |
+v---v----v---+ +------v--v---+  +--v----v--+          |              |
|             | |             |  |          |          |              |
|ClaimManager | | KeyManager  |  | MultiSig |          |              |
|             | |             |  |          |          |              |
+---+---------+ ++------------+  +--+-------+          |              |
    |            |                  |                  |              |
    |            |                  |                  |              |
    |            |        +---------v------------------v---+          |
    |            |        |                                <----------+
    |            +-------->            Identity            |
    |                     |        (ERC 725 + 735)         |
    +--------------------->                                |
                          +--------------------------------+

* = Abstract contract
** = Library
```
  
## Local Development

> Installation
```
  npm install &&
  npm start
```
> Tests
```
  npm run test 
```


## Live Demo

- [x] http://digital-identity.o2oprotocol.com
- [x] Certifiers provides Issuer-Services: 
  - [x] [Facebook](https://developers.facebook.com/)
  - [x] [Linked-in](https://developer.linkedin.com/)
  - [x] [Google](https://console.cloud.google.com/apis/credentials)
  - [x] [Github](https://github.com/settings/developers)
  - [x] [Twitter](https://apps.twitter.com/) 
  

> **Demo Scripts**

Imagine we want to deploy a **Listing Contract** (e.g. post a job to hire a Freelancer), but only allow interactions from **Users** (e.g. Developers) with a verified `Has Facebook` & `Has Github`. How can we accomplish this with Digital Identity ERC-725?

First, lets define the entities that will be interacting:
* The _Consumer:Developer_ is an identity who wants to apply a posted job.
* The _Issuer:SellerBuyerBroker_ is an identity which issues claims of type `FACEBOOK_VERIFIED` &  `GITHUB_VERIFIED`. *Note*: Buyer-Broker is HeadHunter.
* The _Listing:JobPosting_ will only allow _Consumer:Developer_ with `FACEBOOK_VERIFIED` &  `GITHUB_VERIFIED` claims from an _Issuer-HeadHunterService_ they trust.
