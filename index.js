//set up
let express = require('express')
let app = express();
let bodyParser = require('body-parser')
let databasePosts = null;

//If a client asks for a file,
//look in the public folder. If it's there, give it to them.
app.use(express.static(__dirname + '/public'));

//hello

//this lets us read POST data
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//make an empty list
let posts = [];
//let a client GET the list
function sendPostsList(request, response) {
  response.send(posts);
}
app.get('/posts', sendPostsList);
app.get('/post', function (req, res) {
   let searchId = req.query.id;
   console.log("Searching for post " + searchId);
   let post = posts.find(x => x.id == searchId);
   res.send(post);
});

//let a client POST something new
function saveNewPost(request, response) {
  console.log(request.body.message);
  console.log(request.body.author); //write it on the command prompt so we can see
  let post= {};
  post.author = request.body.author;
  post.message = request.body.message;
  post.image = request.body.image;
  post.time = new Date();
  post.id = Math.round(Math.random() * 10000);
  posts.push(post);
  response.send("thanks for your message. Press back to add another");
  databasePosts.insert(post);
}
app.post('/posts', saveNewPost);

let MongoClient = require('mongodb').MongoClient;
let databaseUrl = 'mongodb://girlcode:hats123@ds233531.mlab.com:33531/girlcode2018-term2';
let databaseName = 'girlcode2018-term2';

MongoClient.connect(databaseUrl, {useNewUrlParser: true}, function(err, client) {
  if (err) throw err;
  console.log("yay we connected to the database");
  let database = client.db(databaseName);
  databasePosts = database.collection('posts');
  databasePosts.find({}).toArray(function(err, results) {
    console.log("Found " + results.length + " results")
    posts = results
  });
});

//listen for connections on port 3000
app.listen(process.env.PORT || 3000);
console.log("Hi! I am listening at http://localhost:3000");
