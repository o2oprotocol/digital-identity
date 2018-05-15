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

  componentWillReceiveProps(nextProps) {
    var nodeAccounts = nextProps.network.accounts,
      walletAccounts = nextProps.wallet.accounts,
      balances = nextProps.wallet.balances

    if (
      this.stage === 0 &&
      nextProps.network.status === 'connected' &&
      nodeAccounts.length > 2 &&
      walletAccounts.length > 2 &&
      balances[walletAccounts[0]] &&
      balances[walletAccounts[0]].eth === '100'
    ) {
      window.localStorage.clear()
      this.props.reset()
      this.next('✔ Add some balance to account 1...')
      setTimeout(() => {
        this.props.sendFromNode(nodeAccounts[0].hash, walletAccounts[0], '5')
      }, 500)
    } else if (this.stage === 1 && balances[walletAccounts[1]].eth === '100') {
      this.next('✔ Add some balance to account 2...')
      setTimeout(() => {
        this.props.sendFromNode(nodeAccounts[0].hash, walletAccounts[1], '15')
      }, 500)
    } else if (this.stage === 2 && balances[walletAccounts[2]].eth === '100') {
      this.next('✔ Add some balance to account 3...')
      setTimeout(() => {
        this.props.sendFromNode(nodeAccounts[0].hash, walletAccounts[2], '25')
      }, 500)
    } else if (this.stage === 3 && balances[walletAccounts[2]].eth === '100') {
      this.next('✔ Add SellerBuyerBroker certifier...')
      setTimeout(() => {
        this.props.selectAccount(walletAccounts[1])
        callDeploy(
          this.props.deployIdentityContract,
          'LocalBroker',
          'http://localhost:3001'
        )
        callDeploy(
          this.props.deployIdentityContract,
          'SellerBuyerBroker',
          'https://digital-identity.o2oprotocol.com'
        )
      }, 500)
    } else if (
      this.stage === 4 &&
      this.props.createIdentityResponse !== 'success' &&
      nextProps.createIdentityResponse === 'success'
    ) {
      this.next('✔ Add Claim Signer key...')
      setTimeout(() => {
        const broker = this.props.identity.identities.find(
          i => i.name === 'SellerBuyerBroker'
        )
        const local = this.props.identity.identities.find(
          i => i.name === 'LocalBroker'
        )
        console.log('broker, local', broker, local)
        const key =
          '0x20ea25d6c8d99bea5e81918d805b4268d950559b36c5e1cfcbb1cda0197faa08'
        callAddKey(this.props.addKey, key, local.address)
        callAddKey(this.props.addKey, key, broker.address)
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
