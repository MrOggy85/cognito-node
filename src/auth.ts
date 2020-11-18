import nodeFetch from 'node-fetch'
import { AuthenticationDetails, CognitoUser, CognitoUserAttribute, CognitoUserPool } from 'amazon-cognito-identity-js'
import { Request } from "express";
import request from 'request'
import jwkToPem from 'jwk-to-pem'
import jwt from 'jsonwebtoken'
import getEnv from './getEnv';

declare const global: {
  fetch: typeof nodeFetch
  navigator: () => void
}

global.fetch = nodeFetch;
global.navigator = () => null;

const poolData = {
   UserPoolId: getEnv('USER_POOL_ID'),
   ClientId: getEnv('CLIENT_ID')
};
const pool_region = getEnv('USER_POOL_ID');
const userPool = new CognitoUserPool(poolData);

type RegisterCallback = (err: Error, result?: CognitoUser) => void

function getCognitoUser(userName: string) {
   const userData = {
       Username: userName,
       Pool: userPool
   }
   return new CognitoUser(userData);
}

function register(body: Request['body'], callback: RegisterCallback) {
  const name = body.username;
  const email = body.email;
  const password = body.password;
  const attributeList = [];

  attributeList.push(new CognitoUserAttribute({
    Name: "email",
    Value: email
  }));

  userPool.signUp(name, password, attributeList, null, function (err, result) {
    if (err) {
      callback(err);
      return
    }
    const cognitoUser = result.user;
    callback(null, cognitoUser);
  })
}

type confirmRegistrationCodeCallback = (err: Error, success?: boolean) => void

function confirmRegistrationCode(body: Request['body'], callback: confirmRegistrationCodeCallback) {
  const userName = body.username;
  const code = body.code;

  const cognitoUser = getCognitoUser(userName);
  cognitoUser.confirmRegistration(code, true, function(err, result) {
    if (err) {
      callback(err);
      return
    }
    callback(null, result);
  });
}

type LoginCallback = (err: Error, accesstoken?: string) => void

function login(body: Request['body'], callback: LoginCallback) {
  const userName = body.username;
  const password = body.password;

  const cognitoUser = getCognitoUser(userName);

  const authenticationDetails = new AuthenticationDetails({
    Username: userName,
    Password: password
  });

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
      const accesstoken = result.getAccessToken().getJwtToken();
      callback(null, accesstoken);
    },
    onFailure: (function (err) {
      console.log('login onFailure', err);
      callback(err);
    })
  })
}

function getPems(body: any) {
  const pems: Record<string, string> = {};
  const keys = body['keys'];
  for(var i = 0; i < keys.length; i++) {
        var key_id = keys[i].kid;
        var modulus = keys[i].n;
        var exponent = keys[i].e;
        var key_type = keys[i].kty;
        var jwk = { kty: key_type, n: modulus, e: exponent};
        var pem = jwkToPem(jwk);
        pems[key_id] = pem;
  }
  return pems
}

type Options = Parameters<typeof request>[0]
type RequestCallback = Parameters<typeof request>[1]
type ValidateCallback = (err: Error, payload?: object) => void

function validate(token: string, callback: ValidateCallback) {
  const options: Options = {
    url : `https://cognito-idp.${pool_region}.amazonaws.com/${poolData.UserPoolId}/.well-known/jwks.json`,
    json : true
  }

  const requestCallback: RequestCallback = function(error, response, body) {
    if(error || response.statusCode !== 200) {
      console.log("Error! Unable to download JWKs");
      callback(error);
      return
    }

    const decodedJwt = jwt.decode(token, { complete: true });
    if (!decodedJwt || typeof decodedJwt === 'string') {
      console.log("Not a valid JWT token");
      callback(new Error('Not a valid JWT token'));
      return
    }

    const kid = decodedJwt.header.kid;
    const pems = getPems(body)
    const pem = pems[kid];
    if (!pem) {
      console.log('Invalid token');
      callback(new Error('Invalid token'));
      return;
    }

    jwt.verify(token, pem, function(err, payload) {
      if (err) {
        console.log("Invalid Token.");
        callback(new Error('Invalid token'));
      } else {
        console.log("Valid Token.");
        callback(null, payload);
      }
    });
  }

  request(options, requestCallback);
}

const auth = {
  register,
  confirmRegistrationCode,
  login,
  validate,
}

export default auth
