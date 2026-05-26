import { Response } from "express";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import { CookieUtils } from "./cookie";
import { jwtUtils } from "./jwt";
import { env } from "../config/env";

const getToken = (payload: JwtPayload) => {
    const token = jwtUtils.createToken(
        payload,
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn } as SignOptions,
    );

    return token;
};

const setTokenCookie = (res: Response, token: string) => {
    CookieUtils.setCookie(res, "token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        //1 day
        maxAge: 60 * 60 * 24 * 1000 * 7,
    });
};

export const tokenUtils = {
    getToken,
    setTokenCookie,
};