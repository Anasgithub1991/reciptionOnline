const router = require('express').Router()
const Province = require('../models/Province')

const { notifyMessage } = require('../utils/notification')


router.get('/', async (req, res) => {
    try {
        let province = await Province.all()
        res.status(200).json(province)

    } catch (error){ res.status(400).json(notifyMessage(false, 'province was not fetch', '', error)) }
})
router.post('/', (async (req, res) => { 
    try { 
        let province = await Province.insert(req.body) 
        res.status(200).json(province)
    } 
    catch(error)
     { 
res.status(400).json(notifyMessage(false, 'province was not post', '', error))
     } }))

     router.put('/', (async (req, res) => { 
        try { 
            let province = await Province.update(req.body) 
            res.status(200).json(province)
        } 
        catch(error)
         { 
    res.status(400).json(notifyMessage(false, 'province was not put ', '', error))
         } }))

         router.delete('/id/:id', (async (req, res) => { 
            console.log('req.body',req.params.id);
            try { 
                let province = await Province.delete(req.params.id) 
                res.status(200).json(province)
            } 
            catch(error)
             { 
        res.status(400).json(notifyMessage(false, 'province was not put ', '', error))
             } }))
module.exports = router