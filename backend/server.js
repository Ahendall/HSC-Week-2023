const express = require('express')
const cors = require('cors')

/* App Init */
const app = express()
app.use(cors())
app.use(express.json())