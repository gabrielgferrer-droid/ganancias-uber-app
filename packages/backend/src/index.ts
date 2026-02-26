import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRouter from './routes/auth';
import entriesRouter from './routes/entries';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', authRouter);
app.use('/api', entriesRouter);

app.get('/', (req, res) => {
  res.send('Driver\'s Ledger API is running!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

