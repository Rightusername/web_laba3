var express = require('express');
var mysql = require('mysql');
var app = express();
var bodyParser = require('body-parser')
var urlutils = require('url');
s2

var connection = mysql.createConnection({
	host: 'localhost14',
	user: 'root',
	password: '135531',
	database: 'laba3'
});
connection.connect(function (error) {
	if(!!error){
		console.log(error);
	}else{
		console.log('Database connected');
	}
});


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));



app.get('/', function (req, res) {
	res.sendFile( __dirname + "/public/" + "index.html" );
});


app.get('/getSchemaDB', (req, res)=>{
	connection.query("SHOW TABLES", function (error, rows, fields) {
		if(!!error){
			console.log("Error in the query");
		}else{
			var ar = [];
			for( var i=0; i<rows.length; i++){
				for(j in rows[i]){
					ar.push(rows[i][j]);
				}
			}
			res.json(ar);
		}
	});
});

app.post("/delRow",function (req, res) {
	console.log(req.body.table);
	console.log(req.body.id);
	connection.query("DELETE FROM "+req.body.table+" WHERE `id`='"+req.body.id +"'", function (error, rows, fields) {
		if(!!error){
			console.log("Error in the query");
			res.send("Error in the query");
		}else{
			console.log('Row deleted');
			res.send("succsesss");
		}
	});
});


app.post('/addRow',function (req, res) {
	var s = "INSERT INTO "+req.body.table +" (";
	var names = [];
	var values = [];
	for(var i in req.body){
		if(i!="table") {
			names.push(i);
			values.push('"' + req.body[i] + '"');
		}
	}

	for (var i = 0; i < names.length; i++) {
		s+=names[i];
		if(i!=names.length-1){
			s+=',';
		}

	}
	s+=") VALUES(";
	for (var i = 0; i < values.length; i++) {
		s+=values[i];
		if(i!=values.length-1){
			s+=',';
		}
	}
	s+=")";

	connection.query(s, function (error, rows, fields) {
		if(!!error){
			console.log("Error in the query");
			res.send("Error in the query");
		}else{
			console.log('Row added');
			res.send("succsesss");
		}
	});
});

app.post("/updateRow?",function (req, res) {
	updateRow(JSON.parse(req.body.json),req.body.id,req.body.table);
	console.log(JSON.parse(req.body.json));
	console.log(req.body.id, req.body.table);
});

function updateRow(obj,id,table) {
	var s = "UPDATE "+table+" SET ";
	var count=0;
	var j=0;
	for(var i in obj){
		count++;
	}
	for(var i in obj){
		j++;
		s += i + "=";
		s += '"' + obj[i] + '"';
		if (j != count) {
			s += ', '
		}
	}
	s+=' WHERE id="'+ id+'";';
	connection.query(s, function (error, rows, fields) {
		if(!!error){
			console.log("Error in the query");
		}else{
			console.log('row updated');
		} 
	});
}

app.get('/getSchemaTable',function (req, res) {
	var table = urlutils.parse(req.url,true).query.table;
	connection.query('SHOW COLUMNS FROM '+ table +' FROM laba3;', function (error, rows, fields) {
		if(error){
			console.log("Error in the query");
		}else{
			res.send(JSON.stringify(rows));
		}
	});
});

app.get('/getTable', function (req, res) {
	var table = urlutils.parse(req.url,true).query.table;
	connection.query('SELECT * FROM '+table, function (error, rows, fields) {
		if(!!error){
			console.log("Error in the query");
		}else{
			res.send(JSON.stringify(rows));
		}
	});
});

app.listen(3000, function () {
	console.log('listen on 3000');
});



