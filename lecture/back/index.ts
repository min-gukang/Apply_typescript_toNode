import * as express from 'express';

const app = express();
const prod = process.env.NODE_ENV !== 'production';

app.get('/', (req, res) => {
    res.send('react nodebird Backend normal operation');
})

app.listen(prod ? process.env.PORT : 3065, () => { //개발용은 3065, 배포용은 .env에서 자유자재로 바꿀수 있게 한다. 
    console.log(`server is running on ${process.env.PORT}`);
})