const { Configuration, OpenAIApi } =  require("openai");
const fs = require('fs');
const util = require('util');
const dotenv = require('dotenv');
dotenv.config();

async function generateText(filepath) {
	console.log("Generating text for: " + filepath);

	/* Configure API */
	const config = new Configuration({
		apiKey: process.env.OPENAI_API_KEY,
	});
	const openai = new OpenAIApi(config);
	
	/* Prepare prompt and params */
	let logContent = fs.readFileSync(filepath, 'utf8').replace(/$!/g, '\n');
	let promptBase = fs.readFileSync('prompts/prompt.txt', 'utf8');
	let params = {
		prompt: promptBase + logContent + '[Support]: ',
		max_tokens: 100,
		temperature: 0.7,
		model: 'text-davinci-003',
	};

	/* Generate response */
	let response = await openai.createCompletion(params);
	let responseText = response.data.choices[0].text;
	let responseLine = util.format('[Support]: %s$!', responseText);
	fs.appendFile(filepath, responseLine, function (err) {
		if (err) throw err;
		console.log('Response saved to log!');
	});

	return true;
}

module.exports = generateText;