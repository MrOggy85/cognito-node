import express from "express";
import { Response, Request } from "express";
import bodyParser from 'body-parser'
import auth from './auth';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("port", process.env.PORT || 3000);

function getApi(req: Request, res: Response) {
  res.json({
    hello: 'world'
  })
};

function transformError(err: Error) {
  return {
    message: err.message,
    ...err,
  }
}

function signUp(req: Request, res: Response) {
  auth.register(req.body, function(err, cognitoUser) {
    if (err) {
      res.send(transformError(err));
      return;
    }

    res.send(cognitoUser);
  })
}

function confirmCode(req: Request, res: Response) {
  auth.confirmRegistrationCode(req.body, function(err, cognitoUser) {
    if (err) {
      res.send(transformError(err));
      return
    }

    res.send(cognitoUser);
  })
}

function login(req: Request, res: Response) {
  auth.login(req.body, function(err, accesstoken) {
    if (err) {
      res.send(transformError(err));
      return;
    }

    res.send({
      accesstoken,
    });
  })
}

function validateToken(req: Request, res: Response) {
  auth.validate(req.body.token, function(err, payload){
    if (err) {
      res.send(transformError(err));
      return;
    }
    res.send({
      payload,
    });
  })
}

app.get("/", getApi);
app.post("/signup", signUp);
app.post("/confirm", confirmCode);
app.post("/login", login);
app.post("/validate", validateToken);

export default app
