import * as express from 'express';
import * as bcrypt from 'bcrypt';
import { isLoggedIn, isNotLoggedIn } from './middleware';
import User from '../models/user';
import Post from '../models/post';
import passport = require('passport');
import Image from '../models/image';

const router = express.Router();

interface IUser extends User {
    PostCount: number;
    FollowingCount: number;
    FollowerCount: number;
}

//middleware.ts와는 다르게 req,res에 typing을 안해도 된다. get함수안에 들어가면 알아서 타입추론이 된다. 
router.get('/', isLoggedIn, (req, res) => { 
    const user = req.user!.toJSON() as User  ; //req.user가 있는건 우린 알지만 ts는 알지 못한다. ts가 로직을 이해 못하기 때문. 그래서 강제 변환
    delete user.password; 
    return res.json(user);
})

router.post('/', async (req, res, next) => { //회원가입 route
    try { 
        const exUser = await User.findOne({
            where : {
                userId: req.body.userId
            },
        });
        if(exUser) {
            return res.status(403).send('이미 사용 중인 아이디입니다');
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 12);
        const newUser = await User.create({
            nickname: req.body.nickname,
            userId: req.body.userId,
            password: hashedPassword,
        })
        return res.status(200).json(newUser);
    } catch (error) {
        console.error(error);
        next(error);
    }
})

router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if(err) {
            console.error(err);
            return next(err);
        }
        if(info) {
            return res.status(401).send(info.message);
        }
        return req.login(user, async (loginErr) => {
            try {
                if(loginErr) {
                    return next(loginErr);
                }
                const fullUser = await User.findOne({
                    where: { id: user.id},
                    include: [{
                        model: Post,
                        as: 'Posts', //이 부분 뭔지
                        attributes: ['id'],
                    }, {
                        model: User, 
                        as: 'Followings',
                        attributes: ['id'],
                    }, {
                        model: User,
                        as: 'Followers',
                        attributes: ['id'],
                    }],
                    attributes: {
                        exclude: ['password']
                    }
                });
                return res.json(fullUser);
            } catch(e) {
                console.error(e);
                return next(e);
            }
        })
    })(req, res, next);
});

router.post('/logout', isLoggedIn, (req, res) => {
    req.logout();
    req.session.destroy(() => {
        res.send('logout 성공');
    });
})

router.get('/:id', async (req, res, next) => {
    try {
        const user = await User.findOne({
            where: { id: parseInt(req.params.id,)},
            include: [{
                model: Post,
                as: 'Posts', //이 부분 뭔지 => 가져올 때 속성이름을 설정해줌. 
                attributes: ['id'],
            }, {
                model: User, 
                as: 'Followings',
                attributes: ['id'],
            }, {
                model: User,
                as: 'Followers',
                attributes: ['id'],
            }],
            attributes: ['id', 'nickname'],
        })
        if (!user) {
            return res.status(404).send('no user');
        }
        const jsonUser = user.toJSON() as IUser;
        //jsonUser에 해당 속성이 없다고 에러가 뜬다. User인터페이스 확장한다.
        jsonUser.PostCount = jsonUser.Posts? jsonUser.Posts.length : 0;  //그래도 에러가 떠서 분명히 있다고 알려주는 의미로 !를 붙인다. 근데 !를 쓰면 에러가 날 수 있다.  
        jsonUser.FollowingCount = jsonUser.Followings? jsonUser.Followings.length : 0;// !대신 한 번더 검사한다는 의미로 삼항연산자를 쓴다. 에러가 날 일이 없음.
        jsonUser.FollowerCount = jsonUser.Followers? jsonUser.Followers.length : 0;
        res.status(200).json(jsonUser); //이거 내가 추가했는데 맞는지 확인하기.
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

router.get('/:id/followers', isLoggedIn, async(req, res, next) => { //following 목록 가져오기 , id는 user의 Id이다. 
    try { // 아이디의 사용자가 있는지 무조건 확인을 해야한다. 왜냐하면 탈퇴했을 수도 있기 때문에. 
        const user = await User.findOne({
            where: {id: parseInt(req.params.id, 10) || (req.user && req.user.id) || 0} //0은 :id가 undefined인 경우 처리, 꼼수다? 
        })
        if(!user) return res.status(404).send('no user');
        const followers = await user.getFollowings({ //이렇게 정의한 변수로 커스톰한 메소드 사용해서 사용할 수 있다?
            attributes: ['id', 'nickname'],
            limit: parseInt(req.query.limit as string, 10),
            offset: parseInt(req.query.offset as string, 10)
        });
        return res.json(followers);
    } catch(e) {
        console.error(e);
        return next(e);
    }
})

router.post('/:id/follow', isLoggedIn, async (req, res, next) => { // 팔로워 추가하기 
    try {
        const me = await User.findOne({
            where: { id: req.user!.id },
        });
        await me!.addFollowing(parseInt(req.params.id, 10));
        res.send(req.params.id);
    } catch (e) {
        console.error(e);
        next(e);
    }
})

router.delete('/:id/follow', isLoggedIn, async(req, res, next) => { // 내 팔로워 제거하기 
    try {
        const me = await User.findOne({
            where: {id: req.user!.id},
        })
        await me!.removeFollowing(parseInt(req.params.id, 10));
        res.send(req.params.id);
    } catch(err) {
        console.error(err);
        next(err)
    }
})

router.get('/:id/posts', async (req, res, next) => { //포스트 가져오기 
    try {
        const posts = await Post.findAll({
            where: {
                UserId: parseInt(req.params.id, 10) || (req.user && req.user.id) || 0,
                RetweetId: null,
            },
            include: [{
                model: User,
                attributes: ['id', 'nickname'],
            }, {
                model: Image
            }, {
                model: User,
                as: 'Likers',
                attributes: ['id'],
            }],
        });
        res.json(posts);
    } catch(e) {
        console.error(e);
        next(e);
    }
})

router.patch('/nickname', isLoggedIn, async (req, res, next) => { // 닉네임변경 
    try {
        await User.update({
            nickname: req.body.nickname,
        }, {
            where : { id: req.user!.id },
        })
        res.send(req.body.nickname);
    } catch(e) {
        console.error(e);
        next(e);
    }
})

export default router;