import type Jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import { ACCESS_TOKEN_KEY } from "@rooms2watch/common-types";
import type { JwtPayload, JwtPayloadDecoded } from "../types";

export type CreateAuthProviderJwtOptions = {
  secret: string;
  jwtOptions?: Parameters<typeof Jwt["sign"]>[2];
};

export default function createAuthProviderJwt(
  jwt: typeof Jwt,
  options: CreateAuthProviderJwtOptions
) {
  if (!options.secret) {
    throw new Error(
      "Error while creating jwt signer and verifier: `secret` is not set."
    );
  }

  return {
    signer(redirectUrl: string) {
      return function (req: Request, res: Response) {
        const user = req.user as JwtPayload;
        const token = jwt.sign(user, options.secret, options.jwtOptions);
        res.cookie(ACCESS_TOKEN_KEY, `Bearer ${token}`);
        return res.redirect(redirectUrl);
      };
    },

    verifier(token: string): Promise<JwtPayloadDecoded> {
      return new Promise((resolve, reject) => {
        jwt.verify(token, options.secret, function (err, decoded) {
          if (err) {
            return reject(err);
          }

          resolve(decoded as JwtPayloadDecoded);
        });
      });
    },
  };
}
