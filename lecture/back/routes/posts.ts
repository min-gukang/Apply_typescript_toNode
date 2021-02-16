import * as express from 'express';
import Hashtag from '../models/hashtag';
import Image from '../models/image';
import Post from '../models/post';
import User from '../models/user';
import * as Sequelize from 'sequelize';

const router = express.Router();

router.get('/', async ( req, res, next ) => {
    try {
        let where = {};
        if(parseInt(req.query.lastId as string, 10)) {
            where = {
                id: {
                    [Sequelize.Op.lt]: parseInt(req.query.lastId as string, 10)
                }
            }
        }
        const posts = await Post.findAll( {
            where, 
            include: [{
                model: Hashtag,
                where: { name: decodeURIComponent(req.params.tag)},
            }, {
                model: User,
                attributes: ['id', 'nickname'],
            }, {
                model: Image
            }, {
                model: User,
                as: 'Likers',
                attributes: ['id'],
            }, {
                model: Post,
                as: 'Retweet',
                include: [{
                    model: User,
                    attributes: ['id', 'nickname'],
                }, {
                    model: Image,
                }]
            }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(req.query.limit as string, 10)
        });
        return res.json(posts);
    } catch(e) {

    }
})

export default router;