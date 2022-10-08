import { Account } from "@RoomParty/prisma-client";
import type { Request, Response } from "express";

export type JwtSigner = (
  redirectUrl: string
) => (req: Request, res: Response) => any;

export type JwtVerifier = (token: string) => Promise<JwtPayloadDecoded>;

export type AuthProviders = "Google";

export interface JwtPayload extends Account {}

export type JwtPayloadDecoded = JwtPayload;

export type AuthNextCallback = (
  e: Error | null | undefined,
  payload: JwtPayload
) => any;
