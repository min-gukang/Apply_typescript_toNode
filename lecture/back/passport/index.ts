import * as passport from 'passport';
import User from '../models/user';

export default () => {
    passport.serializeUser<User>((user, done) => { //serialize는 로그인할때 한 번 실행된다. 
        // done(null, user.id);
    });

    passport.deserializeUser(async (id:number, done) => {// 모든 클라이언트 요청에서 실행된다. 매번 실행된다. 
        try {
            const user = await User.findOne({ 
                // where: { id }
            })
            return done(null, user);
        } catch (err) {
            console.error(err);
            return done(err);
        }
    });
    // local();
}