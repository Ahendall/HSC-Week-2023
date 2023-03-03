const express = require('express');
const cors = require('cors');
const fs = require('fs');
const util = require('util');
const { userInfo } = require('os');
const path = require('path');
const bodyParser = require('body-parser');
const port = 8080;
const generateText = require('./OpenAI-Generate');

/* App Init */
const app = express();
const jsonParser = bodyParser.json();

app.use(cors());
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});
app.use(express.static(process.cwd()+"/frontend/build"));

/* Helper Functions */
function parseLog(fileContent) {
	let logArray = [];
	let counter = -1; // hacky fix but works so whatevs

	/* Split log into array of messages */
	for (let i = 0; i < fileContent.length; i++) {
		counter++;

		if (fileContent[i] === '!' && fileContent[i - 1] === '$') {
			let newText = fileContent.substring(i - counter, i - 1);
			let newId;

			switch (newText.includes('[User]: ')) {
				case true:
					newText = newText.replace('[User]: ', '');
					newId = 'User';
					break;
				case false:
					newText = newText.replace('[Support]: ', '');
					newId = 'Support';
					break;
			}

			logArray.push({ id: newId, text: newText });
			counter = -1;
		}
	}

	return logArray;
}

/* Routes */
/* Function that returns the log as a json array given the user IP */
app.get('/getLog', (req, res) => {
	let ip = req.ip.replace(/:/g, '.');
	let filename = util.format('logs/%s.log', ip);

	/* Check if file exists */
	if (!fs.existsSync(filename)) {
		fs.writeFile(filename, '[Support]: How can I help you today?$!', function (err) {
			if (err) throw err;
			console.log('Wrote to new File and saved!');
		});
	}

	// Read file and return contents
	let fileContent = fs.readFileSync(filename, 'utf8');
	let logArray = parseLog(fileContent);
	res.json(JSON.parse(JSON.stringify(logArray)));
});

/* Function that saves the user's question to the log */
/* Client Side should also request to generate a response, which will be handled by a seperate function*/
app.post('/askQuestion', jsonParser, (req, res) => {
	let question = req.body.message;
	let ip = req.ip.replace(/:/g, '.');
	let filename = util.format('logs/%s.log', ip);
	let fileLine = util.format('[User]: %s$!', question);

	fs.appendFile(filename, fileLine, function (err) {
		if (err) throw err;
		console.log('Question asked and saved!');
	});

	res.json({ status: 'success' });
});

/* Function that generates and saves the support's response to the log */
app.get('/generateAiResponse', async (req, res) => {
	let ip = req.ip.replace(/:/g, '.');
	let filename = util.format('logs/%s.log', ip);
	let response = await generateText(filename);
	
	res.json({ response: response });
});


app.get('/' , (req, res) => {
	res.sendFile(process.cwd()+"/frontend/build/index.html");
});

/* Log Managing */
async function deleteOldFiles() {
	console.log('Deleting old files...');
	const logsDir = path.join(__dirname, 'logs');
	const files = await fs.promises.readdir(logsDir);
	const now = new Date();

	for (const file of files) {
		const filePath = path.join(logsDir, file);
		const stats = await fs.promises.stat(filePath);
		const lastModified = new Date(stats.mtimeMs);
		const minutesAgo = Math.floor((now - lastModified) / (1000 * 60));

		if (minutesAgo > 10) {
			await fs.promises.unlink(filePath);
			console.log(`Deleted file: ${filePath}`);
		} else {
			console.log(`Skipping file: ${filePath}`);
		}
	}
} setInterval(deleteOldFiles, 5 * 60 * 1000);




/* Run server */
app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
