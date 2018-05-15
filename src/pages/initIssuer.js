let waitLastDeploy = Promise.resolve()
let waitLastAddKey = Promise.resolve()

export const callDeploy = (deployIdentityContract, issuerName, oauthLink) => {
  waitLastDeploy = waitLastDeploy.then(
    () =>
      new Promise(resolve => {
        const liveServices = [
          {
            uri: `${oauthLink}/fb-auth`,
            icon: 'facebook',
            claimType: '3'
          },
          {
            uri: `${oauthLink}/twitter-auth`,
            icon: 'twitter',
            claimType: '4'
          },
          {
            uri: `${oauthLink}/github-auth`,
            icon: 'github',
            claimType: '5'
          },
          {
            uri: `${oauthLink}/google-auth`,
            icon: 'google',
            claimType: '6'
          },
          {
            uri: `${oauthLink}/linkedin-auth`,
            icon: 'linkedin',
            claimType: '9'
          }
        ]

        const localServices = [
          {
            uri: `${oauthLink}/twitter-auth`,
            icon: 'twitter',
            claimType: '4'
          },
          {
            uri: `${oauthLink}/google-auth`,
            icon: 'google',
            claimType: '6'
          },
          {
            uri: `${oauthLink}/linkedin-auth`,
            icon: 'linkedin',
            claimType: '9'
          }
        ]

        const services = process.env.LOCAL === "true" ? localServices : liveServices

        setTimeout(() => {
          deployIdentityContract(
            issuerName,
            'certifier',
            `${oauthLink}/github-auth`,
            false,
            'issuer-icon',
            services
          )
          resolve()
        }, 500)
      })
  )
}

export const callAddKey = (addKey, key, address) => {
  waitLastAddKey = waitLastAddKey.then(
    () =>
      new Promise(resolve => {
        setTimeout(() => {
          addKey({
            key,
            purpose: '3',
            keyType: '1',
            identity: address
          })
          resolve()
        }, 500)
      })
  )
}
