import { CognitoUserPool } from "amazon-cognito-identity-js";

var poolData = {
    UserPoolId: 'us-east-1_asQxkEYZ4',
    ClientId: '1voekta41e14tab4r7vjhqnros'
}

export default new CognitoUserPool(poolData)