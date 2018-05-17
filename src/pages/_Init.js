import React, { Component } from 'react'
import { connect } from 'react-redux'

import Modal from 'components/Modal'

import { sendFromNode } from 'actions/Network'
import { reset, deployIdentityContract, addKey } from 'actions/Identity'
import { selectAccount } from 'actions/Wallet'
import { callDeploy, callAddKey } from 'pages/initIssuer'
import { setTimeout } from 'timers'

class Event extends Component {
  constructor(props) {
    super(props)
    this.state = { modal: false, logs: [] }
    this.stage = 0
  }

  async componentDidMount(){
    const blockNo = await web3.eth.getBlockNumber()
    console.log("[blockNo]", blockNo)
    this.shouldInit = blockNo <= 0
  }

  componentWillReceiveProps(nextProps) {
    var nodeAccounts = nextProps.network.accounts,
      walletAccounts = nextProps.wallet.accounts,
      balances = nextProps.wallet.balances;

    const RESET = this.shouldInit
    const LOCAL = process.env.LOCAL === "true"

    const broker = LOCAL ? "LocalBroker" : "SellerBuyerBroker"
    const uri    = LOCAL ? "http://localhost:3001" : "https://digital-identity.o2oprotocol.com"

    if (
      this.stage === 0 &&
      nextProps.network.status === 'connected' &&
      nodeAccounts.length > 2 &&
      walletAccounts.length > 2 &&
      balances[walletAccounts[0]] &&
      RESET
    ) {
      window.localStorage.clear()
      this.props.reset()
      this.next('✔ Init Identity Account 1...')
      setTimeout(() => {
        this.props.sendFromNode(nodeAccounts[0].hash, walletAccounts[0], '5')
      }, 500)
    } else if (this.stage === 1 && RESET) {
      this.next('✔ Init ClaimIssuer Account 2...')
      setTimeout(() => {
        this.props.sendFromNode(nodeAccounts[0].hash, walletAccounts[1], '15')
      }, 500)
    } else if (this.stage === 2 && RESET) {
      this.next('✔ Init ClaimChecker Account 3...')
      setTimeout(() => {
        this.props.sendFromNode(nodeAccounts[0].hash, walletAccounts[2], '25')
      }, 500)
    } else if (this.stage === 3 && RESET) {
      this.next(`✔ Add ${broker} certifier...`)
      setTimeout(() => {
        this.props.selectAccount(walletAccounts[1])
        callDeploy(this.props.deployIdentityContract, broker, uri)
      }, 500)
    } else if (
      this.stage === 4 &&
      this.props.createIdentityResponse !== 'success' &&
      nextProps.createIdentityResponse === 'success'
    ) {
      this.next('✔ Add Claim Signer key...')
      setTimeout(() => {
        const identity = this.props.identity.identities.find(i => i.name === broker)
        const key =
          '0x2d1da9eb632a0a8052bb8c23aac7b482afbc7bd06ef97b8a0a54a943fa68cdfd'
        callAddKey(this.props.addKey, key, identity.address)
      }, 500)
    } else if (
      this.stage === 5 &&
      this.props.addKeyResponse !== 'success' &&
      nextProps.addKeyResponse === 'success'
    ) {
      this.next('Done!')
      this.props.selectAccount(walletAccounts[0])
      setTimeout(() => {
        this.setState({ shouldClose: true })
      }, 1500)
    }
  }

  next(msg) {
    this.stage += 1
    this.setState({ modal: true, logs: [...this.state.logs, msg] })
  }

  render() {
    if (!this.state.modal) {
      return null
    }
    return (
      <Modal
        onClose={() => {
          this.setState({ modal: false })
          if (this.props.onClose) {
            this.props.onClose()
          }
        }}
        shouldClose={this.state.shouldClose}
        style={{ maxWidth: 375 }}
      >
        <div className="p-3">
          <h4>Initialize</h4>
          {this.state.logs.map((log, idx) => <div key={idx}>{log}</div>)}
        </div>
      </Modal>
    )
  }
}

const mapStateToProps = state => ({
  wallet: state.wallet,
  event: state.event,
  network: state.network,
  identity: state.identity,
  createIdentityResponse: state.identity.createIdentityResponse,
  addKeyResponse: state.identity.addKeyResponse
})

const mapDispatchToProps = dispatch => ({
  sendFromNode: (...args) => dispatch(sendFromNode(...args)),
  deployIdentityContract: (...args) =>
    dispatch(deployIdentityContract(...args)),
  addKey: (...args) => dispatch(addKey(...args)),
  selectAccount: (...args) => dispatch(selectAccount(...args)),
  reset: () => dispatch(reset())
})

export default connect(mapStateToProps, mapDispatchToProps)(Event)
