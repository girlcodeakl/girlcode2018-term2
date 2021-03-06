//set up
let express = require('express')
let app = express();
let bodyParser = require('body-parser')
let sanitizer = require('sanitizer');
let databasePosts = null;
let session = require('express-session');
app.use(session({ secret: 'girlcodesecret', cookie: { maxAge: 60000 }}));
var Filter = require('bad-words'),
  filter = new Filter();

//If a client asks for a file,
//look in the public folder. If it's there, give it to them.
app.use(express.static(__dirname + '/public'));

//hello

//this lets us read POST data
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//when someone posts to favourites, run the 'addFavourite' function
app.post("/favourites", addFavourite);

function addFavourite(request, response) {
    let postId = request.body.postId;
   if (request.session.favourites === undefined) {
        request.session.favourites = []
   }
   request.session.favourites.push(postId);
   response.send("ok");
}

//when someone gets favourites, run the 'getFavourites' function
app.get("/favourites", getFavourites);

function getFavourites(request, response) {
  if (request.session.favourites === undefined) {
    request.session.favourites = []
  }
  response.send(request.session.favourites.map(id => posts.find(post => post.id == id)));
}

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

function login(request, response) {
  console.log("someone tried to log in");
  response.send("OK");
}

app.post("/login", login);

function signup(request, response) {
  console.log("someone tried to sign up");
  response.send("OK");
}

app.post("/signup", signup);

//let a client POST something new
function saveNewPost(request, response) {
  console.log(request.body.message);
  console.log(request.body.author);
  //write it on the command prompt so we can see
  let post= {};
  let cleanAuthor = filter.clean(request.body.author);
  post.author = sanitizer.sanitize(cleanAuthor);
  let cleanMessage = filter.clean(request.body.message);
  post.message = sanitizer.sanitize(cleanMessage);
  let cleanImage = filter.clean(request.body.image);
  post.image = sanitizer.sanitize(cleanImage);
  if (post.image == "") {
  post.image = "http://4.bp.blogspot.com/-NVNKQIypEFk/T82Of_w1KiI/AAAAAAAAAQE/WXTMrw3dUb8/s1600/mickey-mouse-and-minnie-mouse-cooking-coloring-pages-1.jpg";
  }
  post.time = new Date();
  post.id = Math.round(Math.random() * 10000);
  posts.push(post);
  response.send("thanks for your message. Press back to add another");
  databasePosts.insert(post);
}
app.post('/posts', saveNewPost);


//delete message
function deleteHandler(request, response) {
   console.log("client wants to delete this post: " + request.body.postId );

   if (request.body.password === "1234") {
     let postIdNumber = parseInt(request.body.postId);
     posts = posts.filter(post => post.id != postIdNumber);
     databasePosts.deleteOne({ id : postIdNumber })
     response.send("ok");
   }
  else {
  console.log("Wrong password");
  response.send("Wrong password");
  }


}
app.post("/delete", deleteHandler);

//pick and return a random element from the given list
function pickRandomFrom(list) {
  return list[Math.floor(Math.random()*list.length)];
};

//give the client a random post
function getRandomPost(request, response) {
  let randomPost = pickRandomFrom(posts);
  let list = [randomPost]; //we put it inside a list, just because it makes our existing feed code work
  response.send(list);
}

app.get('/random', getRandomPost);

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
