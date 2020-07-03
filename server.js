const express = require('express')

const app = express();

app.get('/', (req,res) => res.send('API running'))

const PORT = process.env.PORT || 5000 

app.listen(PORT, () => console.log(`Server app and running on port ${PORT}`));