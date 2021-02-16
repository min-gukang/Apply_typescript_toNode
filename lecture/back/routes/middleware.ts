import { NextFunction, Request, Response } from "express";

const isLoggedIn = (req: Request, res: Response, next: NextFunction) => { // 이 미들웨어를 통과한다는 건 req.user가 존재함을 의미한다. 
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).send('로그인이 필요합니다');
    }
}

const isNotLoggedIn = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
        next();
    } else {
        res.status(401).send('로그인한 사용자는 접근할 수 없습니다');
    }
}

export { isLoggedIn, isNotLoggedIn };