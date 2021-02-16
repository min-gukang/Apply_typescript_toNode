import User from "../models/user";
import IUser from '../models/user';

// declare global { //declare global 할때는 반드시 export나 import문 넣어주어야 한다. ex) export {};
//     namespace Express {
//         interface Request {
//             user?: User;   //왜 ? 넣어줘야 하지.. 
//         }
//     }
// }

//여기 global namespace에서 user:User 확장한 것과 @types/passport에서 user를 확장한게 충돌이 나서 타입스크립트가 뭘 해야할지 모르는 상태.
//그래서 ambient module로 만들어준다
declare module "express-serve-static-core" { //declare global 할때는 반드시 export나 import문 넣어주어야 한다. ex) export {};
        interface Request {
            user?: User;   
        }
}

declare global {

    namespace Express {

        export interface User extends IUser {}

    }

}