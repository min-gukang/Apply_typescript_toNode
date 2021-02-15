import User, { associate as associateUser } from './user'
import Comment, { associate as associateComment } from './comment'
import Post, { associate as associatePost } from './post'
import Image, { associate as associateImage } from './image'
import Hashtag, { associate as associateHashtag } from './hashtag'

//import함과 동시에 export한다. 순환참조 문제를 해결하기 위해서 이렇게 사용한다. 
export * from './sequelize'; 


const db = { //model들 담아둘 db객체 만든다. 관계설정을 하기 위해 만든다. 
    User,
    Comment,
    Post,
    Image,
    Hashtag
}

export type dbType = typeof db;

associateUser(db);
associateHashtag(db);
associateComment(db);
associatePost(db);
associateImage(db);
