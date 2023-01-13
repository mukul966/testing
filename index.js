const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
const https = require('https');
const http = require('http');
const session = require('express-session');
var MemoryStore = require('memorystore')(session);
const userjs = require('./routes/user');
const userprofjs = require('./routes/userprof');
const imghandler = require('./routes/imagehandler');
const squadjs = require('./routes/squad');
const profiles = require('./routes/profiles');
const verifyRouter = require('./routes/verify');
const profileImageRouter = require('./routes/profile_image'); //image routes
const workRouter = require('./routes/work');
const testRouter = require('./routes/test');
const squadImageRouter = require('./routes/squad_image'); //image routes
const invoiceRouter = require('./routes/invoice');
const projectRouter = require('./routes/projects')
const paymentsRouter = require('./routes/bank');

//const formsjs = require('./routes/forms');
//const createsignpdf = require('./routes/crtsignpdf')

const cors = require('cors');

app.use(cors({ origin: true }));

//app.use(bodyParser.json({ type: "application/*+json" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/user', userjs);
app.use('/api/userprof', userprofjs);
app.use('/api/imgupld', imghandler);
app.use('/api/squad', squadjs);
app.use('/api/profiles', profiles);
app.use('/api/verify', verifyRouter);
app.use('/api/profileImage', profileImageRouter);
app.use('/api/work', workRouter);
app.use('/api/squadImage', squadImageRouter);
app.use('/api/test', testRouter);
app.use('/api/invoice', invoiceRouter);
app.use('/api/projects', projectRouter);
app.use('/api/payments', paymentsRouter);

//app.use('/api/forms', formsjs);
//app.use('/api/createsignpdf', createsignpdf);

app.get('/', function (req, res) {
	// console.log("req is " + JSON.stringify(req));
	res.send('test for vms project v 1.0');
});

app.use(
	session({
		secret: 'the star wars saga',
		resave: true,
		saveUninitialized: true
	})
);

/*
if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sess.cookie.secure = true; // serve secure cookies
}
*/

// const PORT = process.env.PORT || 8080;

// if (process.env.NODE_ENV == 'production') {
// 	http.createServer(app).listen(PORT, function () {
// 		console.log(`Server listening on port ${PORT}!`);
// 	});
// } else {
// 	https
// 		.createServer(
// 			{
// 				key: fs.readFileSync('./encryption/server.key'),
// 				cert: fs.readFileSync('./encryption/server.cert')
// 			},
// 			app
// 		)
// 		.listen(PORT, function () {
// 			console.log(`workwall app listening on port ${PORT}!`);
// 		});
// }
//export GOOGLE_APPLICATION_CREDENTIALS="/Users/Viveks/Documents/code/web/firebaseKey/vmsproject.json"
app.listen(9000);