import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import styles from './index.module.css';
import TextField from '@mui/material/TextField';

export default function Main() {
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState('');
	const fs = require('fs');

	useEffect(() => {
		// Poll the server for updates every 5 seconds
		const intervalId = setInterval(() => {
			fetch('/support.log')
				.then((response) => response.text())
				.then((newLog) => {
					console.log(newLog);
					if (newLog !== messages[messages.length - 1]?.text) {
						let logDict = [];
						let counter = -1; // Hacky fix but whatevs
						for (let i = 0; i < newLog.length; i++) {
							counter++;
							if (newLog[i] === '!' && newLog[i - 1] === '$') {
								let newText = newLog.substring(i - counter, i - 1);
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

								console.log(newText);
								logDict.push({
									id: newId,
									text: newText,
								});
								counter = -1;
							}
						}
						setMessages(logDict);
					}
				});
		}, 5000);

		// Cleanup the interval when the component unmounts
		console.log(messages);
		return () => clearInterval(intervalId);
	}, [messages]);

	async function onSubmit(event) {
		event.preventDefault();
		/* Add message to Log */
		let newMessage = '[User]: ' + input + '$!';
		fs.appendFile('support.log', newMessage, function (err) {
			if (err) throw err;
			console.log('Saved!');
		});

		// try {
		// 	const response = await fetch('/api/generate', {
		// 		method: 'POST',
		// 		headers: {
		// 			'Content-Type': 'application/json',
		// 		},
		// 		body: JSON.stringify({ animal: animalInput }),
		// 	});

		// 	const data = await response.json();
		// 	if (response.status !== 200) {
		// 		throw data.error || new Error(`Request failed with status ${response.status}`);
		// 	}

		// 	setResult(data.result);
		// 	setAnimalInput('');
		// } catch (error) {
		// 	// Consider implementing your own error handling logic here
		// 	console.error(error);
		// 	alert(error.message);
		// }
	}

	return (
		<div>
			<Head>
				<title>Chat With Support</title>
				<link rel="icon" href="/Techsupport.png" />
			</Head>
			<main className={styles.main}>
				<img src="/Techsupport.png" className={styles.icon} />
				<h3>Chat With Support</h3>

				{/* Chatbox Area */}
				<div className={styles.chat}>
					{messages.map((message) => (
						<div className={message.id === 'User' ? styles.container_user : styles.container_support}>
							<div key={message.id} className={message.id === 'User' ? styles.chat_bubble_user : styles.chat_bubble_support}>
								<p>{message.text}</p>
							</div>
						</div>
					))}
				</div>

				{/* User Input Form */}
				<form onSubmit={onSubmit}>
					<TextField
						id="message"
						name="message"
						label="Enter Message"
						variant="outlined"
						value={input}
						onChange={(e) => setInput(e.target.value)}
					/>
				</form>
			</main>
		</div>
	);
}
