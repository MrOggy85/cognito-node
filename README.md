# Cognito Node.js

This is a backend app for authenticating a user with AWS Cognito

## Prerequisits

AWS Resources:
  * User pool
    * with an App Client

## Run
1. Create a `.env` file and fill in the nescessary values

2. Install node_modules
```sh
yarn install
```
3. Run the program
```sh
yarn start
```

## Endpoints

### `/signup`
* Method: `POST`
* Body:
```json
{
	"username": "username",
	"password": "P@ssw0rd",
	"email": "name.lastname@email.com"
}
```
Response:
```json
{
  "username": "username",
  "pool": {
    "userPoolId": "{USER_POOL_ID}",
    "clientId": "{APP_CLIENT_ID}",
    "client": {
      "endpoint": "https://cognito-idp.{region}.amazonaws.com/",
      "fetchOptions": {}
    },
    "advancedSecurityDataCollectionFlag": true
  },
  "Session": null,
  "client": {
    "endpoint": "https://cognito-idp.{region}.amazonaws.com/",
    "fetchOptions": {}
  },
  "signInUserSession": null,
  "authenticationFlowType": "{authenticationFlowType}",
  "keyPrefix": "{keyPrefix}",
  "userDataKey": "{userDataKey}"
}
```

### `/confirm`
Method: `POST`

Body:
```json
{
	"username": "oskar",
	"code": "123456"
}
```
Response:
```
Not Documented here
```

### `/login`
Method: `POST`

Body:
```json
{
	"username": "username",
	"password": "P@ssw0rd",
}
```
Response:
```json
{
  "accesstoken": "eyJraWQiOiJp{...}M9f2_WQ"
}
```

### `/validate`
Method: `POST`

Body:
```json
{
	"token": "eyJraWQiOiJp{...}M9f2_WQ",
}
```
Response:
```json
{
  "payload": {
    "sub": "{user_id}",
    "event_id": "{event_id}",
    "token_use": "access",
    "scope": "aws.cognito.signin.user.admin",
    "auth_time": 1605677055,
    "iss": "https://cognito-idp.{region}.amazonaws.com/{USER_POOL_ID}",
    "exp": 1605680655,
    "iat": 1605677055,
    "jti": "{jti}",
    "client_id": "{APP_CLIENT_ID}",
    "username": "username"
  }
}
```
