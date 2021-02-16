// *를 쓰는 이유는 export default가 내장되어 있지 않기 때문이다. 
import * as express from 'express';
import * as morgan from 'morgan';
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser';
import * as expressSession from 'express-session';
import * as dotenv from 'dotenv';
import * as passport from 'passport';
import * as hpp from 'hpp';
import * as helmet from 'helmet';

import { sequelize } from './models' // index.ts 파일임
import userRouter from './routes/user';
import postRouter from './routes/post';

dotenv.config();
const app = express();
const prod = process.env.NODE_ENV === 'production';

app.set('port', prod ? process.env.PORT : 3065);

//force를 true로 하면 서버를 재시작할때마다 테이블 초기화됨. 개발할때 컬럼추가나 테이블변경시에 사용한다. 
//배포시에는 false로 한다 
sequelize.sync({ force: false })  //비동기 작업임
    .then(() => {
        console.log('데이터 베이스 연결성공');
    })
    .catch((err: Error) => {
        console.error(err);
    })

if(prod) {
    app.use(hpp());
    app.use(helmet());
    app.use(morgan('combined'));
    app.use(cors({
        origin: /nodebird\.com$/,
        credentials: true
    }))
} else {
    app.use(morgan('dev'));
    app.use(cors({
        origin: true,
        credentials: true
    }))
}

app.use('/', express.static('uploads/'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET!, //확실히 있다고 '!'로 명시해서 에러를 안나게 한다.(본인은 알기 때문에)
    cookie: { 
        httpOnly: true,
        secure: false,
        domain: prod ? '.nodebird.com' : undefined
    },
    name: 'rnbck',
}))

app.use('/user', userRouter);
app.use('/post', postRouter);
app.get('/', (req, res) => {
    res.send('react nodebird Backend normal operation');
})

app.listen(app.get('port'), () => { //개발용은 3065, 배포용은 .env에서 자유자재로 바꿀수 있게 한다. 
    console.log(`server is running on ` + app.get('port'));
})  