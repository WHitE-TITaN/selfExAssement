const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (like HTML, CSS, JS) from the "public" folder
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('🚀 Server is up and running!');
});

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
