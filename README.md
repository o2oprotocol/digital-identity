# Digital-Identity using ERC 725/735

An implementation of [ERC 725](https://github.com/ethereum/EIPs/issues/725) and [ERC 735](https://github.com/ethereum/EIPs/issues/735), proposed standard for managing **Digital Identity** on the **Blockchain**. We uses the [Truffle framework](http://truffleframework.com/) and [Ganache CLI](https://github.com/trufflesuite/ganache-cli) for testing.

Using [ERC 725](https://github.com/ethereum/EIPs/issues/725), a **Smart Contract** can protect function calls from being executed unless the **Sender** has a verified **Claim** from a trusted **Issuer**; e.g. build a mechanism into our Smart Contracts to only allow interactions from reputable people. ERC-725 allows for many more use-cases, such as multi-sig execution approvals and verification by contract call instead of key validation.

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
  - [x] Has Phone
  - [x] Has Email
  - [x] [Facebook](https://developers.facebook.com/)
  - [x] [Linked-in](https://developer.linkedin.com/)
  - [x] [Google](https://console.cloud.google.com/apis/credentials)
  - [x] [Github](https://github.com/settings/developers)
  - [x] [Twitter](https://apps.twitter.com/) 
  

> **Demo Scripts**

Imagine we want to deploy a **Listing Contract** (e.g. post a job to hire a Freelancer), but only allow interactions from **Users** (e.g. Developers) with a verified `Has Facebook` & `Has Github`. How can we accomplish this with Digital Identity ERC-725?

> First, lets define the entities that will be interacting:
* The _Consumer:Developer_ is an identity who wants to apply a posted job.
* The _Issuer:SellerBuyerBroker_ is an identity which issues claims of type `FACEBOOK_VERIFIED` &  `GITHUB_VERIFIED`. *Note*: Buyer-Broker is HeadHunter.
* The _Listing:JobPosting_ will only allow _Consumer:Developer_ with `FACEBOOK_VERIFIED` &  `GITHUB_VERIFIED` claims from an _Issuer-HeadHunterService_ they trust.

> Second, _Consumer:Developer_ interact with a O2O-Identity Listing Contract by following process:

1. _Buyer:Employer_ deploys a new **Identity Contract** (or reuses one they deployed earlier).
2.  _Buyer:Employer_ visits O2O-Identity/verify and obtains a cryptographic signature proving that they control a particular `email` and `phone-number`.
3.  _Buyer:Employer_ adds this `Claim` to their `Identity Contract`.
4.  _Buyer:Employer_ tries to *apply a job* via a O2O-Identity `Listing Contract`.
5.  `Listing Contract` looks at _Buyer:Employer_’s `Identity` for a `Claim` issued by O2O-Identity.
6.  `Listing Contract` recovers the public key from the `Claim Signature` and verifies it is still valid on the O2O-Identity `Issuer Contract`.
7.  Transaction is allowed to proceed.

Now that the _Buyer:Employer_ has a verified claim on their identity from O2O-Identity, they can interact with any other contracts also accepting claims issued by O2O-Identity.