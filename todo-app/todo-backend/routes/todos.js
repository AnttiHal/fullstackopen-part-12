const express = require('express');
const { Todo } = require('../mongo')
const { getAsync, setAsync } = require('../redis')
const router = express.Router();


const Counter = async () => {

  const result = await (getAsync('count'))

  return result ? setAsync('count', Number(result)+1) : setAsync('count', 1)
}
/* GET todos listing. */
router.get('/', async (_, res) => {
  const todos = await Todo.find({})
  res.send(todos);
});

router.get('/statistics', async (_, res) => {
  const count = await getAsync('count')
  res.json({
    'added_todos': count || '0'
  })
})

/* POST todo to listing. */
router.post('/', async (req, res) => {
  Counter()
  const todo = await Todo.create({
    text: req.body.text,
    done: false
  })
  res.send(todo);
});


const singleRouter = express.Router();

const findByIdMiddleware = async (req, res, next) => {
  const { id } = req.params
  req.todo = await Todo.findById(id)
  if (!req.todo) return res.sendStatus(404)

  next()
}

/* DELETE todo. */
singleRouter.delete('/', async (req, res) => {
  await req.todo.delete()  
  res.sendStatus(200);
});

/* GET todo. */
singleRouter.get('/', (req, res) => {
  
  const todo = req.todo 
  console.log(todo)
  res.json(todo)
});

/* PUT todo. */
singleRouter.put('/', async (req, res) => {
  await Todo.findByIdAndUpdate(req.params.id, {
    text: req.body.text,
    done: req.body.done
  })
  
  res.send(req.todo)
});

router.use('/:id', findByIdMiddleware, singleRouter)


module.exports = router;
