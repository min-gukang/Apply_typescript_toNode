import * as express from 'express';
import * as BlueBird from 'bluebird';
import Hashtag from '../models/hashtag';
import Image from '../models/image';
import Post from '../models/post';

import { isLoggedIn } from './middleware';
import User from '../models/user';
// import * as multer from 'multer';
// import * as multerS3 from 'multer-s3';
// import * as AWS from 'aws-sdk';

const router = express.Router();

//이미지업로드 부분은 제외함. 

router.post('/', isLoggedIn, async (req, res, next) => {
    try {
        const hashtags: string[] = req.body.content.match(/#[^\s]+/g);
        const newPost = await Post.create({
            content: req.body.content,
            UserId: req.user!.id
        })
        if(hashtags) { //해쉬태그 게시물에 넣어주기 
            const promises = hashtags.map((tag) => Hashtag.findOrCreate({
                where: { name: tag.slice(1).toLowerCase()},
            }));
            const result = await Promise.all(promises);
            await newPost.addHashtags(result.map(r => r[0]));
        }
        if( req.body.image) { //이미지 넣어주기 
            if(Array.isArray(req.body.image)) {
                const promises: BlueBird<Image>[] = req.body.image.map((image: string) => Image.create({ src: image})) //시퀄라이즈가 타이핑을 BlueBird를 쓴다
                const images = await Promise.all(promises);
                await newPost.addImages(images);
            } else {
                const image = await Image.create({ src: req.body.image });
                await newPost.addImage(image);
            }
        }
        const fullPost = await Post.findOne({
            where: { id: newPost.id },
            include: [{
                model: User,
                attributes: ['id', 'nickname'],
            }, {
                model: Image,
            }, {
                model: User,
                as: 'Likers',
                attributes: ['id'],
            }],
        });
        return res.json(fullPost);
    } catch(error) {

    }
})

router.get('/:id', async( req, res, next) => {
    try {
        const post = await Post.findOne({
            where: {id: req.params.id},
            include: [{
                model: User,
                attributes: ['id', 'nickname'],
            }, {
                model: Image,
            }, {
                model: User,
                as: 'Likers',
                attributes: ['id']
            }]
        })
        return res.json(post);
    } catch(e) {
        
    }
})

export default router;