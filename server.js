const express = require("express");
const app = express();
const port = 3000;

const { MongoClient } = require('mongodb');
const url = 'mongodb+srv://aveu220:I6svLdYAgvOHN71P@cluster0.txrlopn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(url);

const methodOverride = require('method-override')
app.use(methodOverride('_method'))

app.set("view engine", "ejs");
app.use(express.json()) 
app.use(express.urlencoded({extended:true})) 

app.get("/", (req, res) => {
  res.render("index.ejs"); 
});

const getDB = async () => {
  await client.connect()
  return client.db('todo')
}

app.get("/test", (req, res) => {
  res.send("테스트 페이지입니다");
});

app.get("/list", async (req, res) => {
  try {
    const db = await getDB();
    const posts = await db.collection('posts').find().sort({_id:-1}).toArray();
    res.render('list', {posts}); 
  } catch (error) {
    console.error(error);
  }
});

app.post('/add', async (req,res)=>{
  const {title,dateOfGoals,today} = req.body
  
  try {
    const db = await getDB()
    const result = await db.collection('counter').findOne({name: "counter"})
    await db.collection('posts').insertOne({_id:result.totalPost+1, title, dateOfGoals,today})
    await db.collection('counter').updateOne({name:'counter'},{$inc:{totalPost:1}});
  } catch (error) {
    console.error(error);
  }
  res.redirect('/list')
})

app.get("/detail/:id", async (req, res) => {
  const id = parseInt(req.params.id)
  console.log(id);
  try {
    const db = await getDB();
    const post = await db.collection('posts').findOne({_id: id});
    res.render('detail', {post});  //{posts:posts}
  } catch (error) {
    console.error(error);
  }
});

app.post('/delete', async (req, res)=>{
  const id = parseInt(req.body.postNum)
  console.log(id);
  try {
    const db = await getDB()
    await db.collection('posts').deleteOne({_id:id})
    res.redirect('/list');
  } catch (error) {
    console.log('delete error!!');
  }
})

// 수정페이지
app.get('/edit/:id', async (req, res)=>{
  const id = parseInt(req.params.id)
  console.log('id확인' ,id);
  try{
    const db = await getDB()
    const post =  await db.collection('posts').findOne({_id:id})
    res.render('edit', {post})
  }catch(error){
    console.log(error)
  }
})

// 수정기능
app.post('/update', async (req, res)=>{
  const {id, title, dateOfGoals, today }= req.body;
  console.log(id);
  try{
    const db = await getDB()
    await db.collection('posts').updateOne({_id:parseInt(id)},{$set:{title, dateOfGoals, today}})
    res.redirect('/list')
  }catch(error){
    console.log(error);
  }
})

app.listen(port, () => {
  console.log(`server loading... ${port}`);
});
