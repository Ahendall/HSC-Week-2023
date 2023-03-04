import React, { useState, useEffect, useRef } from 'react';
import TextField from '@mui/material/TextField';
import { Helmet } from 'react-helmet';
import image from './img/Techsupport.png';
import './App.css';

function App() {
	const [log, setLog] = useState([]);
	const [userInField, setUserInField] = useState('');
	const messagesEndRef = useRef(null);

	const scrollToBottom = () => {
		const myDiv = messagesEndRef.current;
		const { scrollTop, scrollHeight, clientHeight } = myDiv;
    	const scrollPosition = scrollHeight - clientHeight;
    	myDiv.scrollTop = scrollPosition > 0 ? scrollPosition : 0;
	};

	const getLog = async () => {
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
		const url = process.env.REACT_APP_GET_LOG;
		const res = await fetch(url, {
			method: 'GET',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		const data = await res.json();
		await setLog(data);
		scrollToBottom();
	};

	const generateResponse = async () => {
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
		const url = process.env.REACT_APP_GENERATE_RESPONSE;
		const res = await fetch(url, {
			method: 'get',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		const data = await res.json();
	};

	const askQuestion = async (input) => {
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
		const url = process.env.REACT_APP_ASK_QUESTION;
		const res = await fetch(url, {
			method: 'POST',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				message: input,
			}),
		});
	};

	const onSubmit = async (event) => {
		let input = userInField;
		setUserInField('');
		event.preventDefault();
		await askQuestion(input);
		await getLog();
		await generateResponse();
		await getLog();
	};

	useEffect(() => {
		getLog();
	}, []);

	return (
		<div className="App">
			<Helmet>
 				<title>Chat With Support</title>
 				<link rel="icon" type="image/png" href="./images/Techsupport.png" />
 			</Helmet>
 			<main className="main">
 				<img src={image} className="icon" alt='' />
				<h3>Chat With Support</h3>
				<p style={{marginTop: '-4%', color: '#AAAAAA'}}>Please note that conversations are reset after 10 minutes of inactivity.</p>

				{/* Chatbox Area */}
				<div  ref={messagesEndRef} className="chat">
					{log.map((logLine) => (
						<div className={logLine.id === 'User' ? 'container_user' : 'container_support'}>
							<div key={logLine.id} className={logLine.id === 'User' ? 'chat_bubble_user' : 'chat_bubble_support'}>
								<p>{logLine.text}</p>
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
 						value={userInField}
 						onChange={(e) => setUserInField(e.target.value)}
 					/>
 				</form>
 			</main>
		</div>
	);
}

export default App;
