import { SecretValue } from 'aws-cdk-lib';
import cdk = require('aws-cdk-lib');
import { CfnApp, CfnBranch } from 'aws-cdk-lib/aws-amplify';
import { CfnIdentityPool, UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export class WebAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create cognito user pool and idendity pool
    const userPool = new UserPool(this, "StyleganMixUserPool", {
      selfSignUpEnabled: true,
      autoVerify: {email: true},
      signInAliases: {email: true}
    })

    const userPoolClient = new UserPoolClient(this, "StyleganMixUserPoolClient", {
      userPool,
      generateSecret: false
    })

    const idendityPool = new CfnIdentityPool(this, "IdendityPool", {
      allowUnauthenticatedIdentities: true,
      cognitoIdentityProviders: [{
        clientId: userPoolClient.userPoolClientId,
        providerName: userPool.userPoolProviderName
      }]
    })

    // Create amplify app based on repository and branch.
    // This will watch for changes in the main branch
    const amplifyApp = new CfnApp(this, 'webapp', {
      name: 'stylegan-mix-webapp',
      repository: 'https://github.com/Kitenite/stylegan-mix-webapp',
      oauthToken: SecretValue.secretsManager('github-oauth-token').unsafeUnwrap(),
      environmentVariables:[
        {
          name:"IDENDITY_POOL_ID",
          value: idendityPool.ref
        },
        {
          name:"USER_POOL_ID",
          value: userPool.userPoolId
        },
        {
          name:"USER_POOL_CLIENT_ID",
          value: userPoolClient.userPoolClientId
        },
        {
          name:"REGION",
          value: this.region
        }
      ]
    })

    new CfnBranch(this, 'MasterBranch', {
      appId: amplifyApp.attrAppId,
      branchName: 'main',
    })
  }
}