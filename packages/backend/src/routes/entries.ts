import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabaseClient';

const router = Router();

// Middleware to get user from Supabase session
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Attach user to the request object
  (req as any).user = user;
  next();
};

// Protect all entry routes
router.use(authenticate);

// GET all entries for the logged-in user
router.get('/entries', async (req, res) => {
  const { id: userId } = (req as any).user;

  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json(data);
});

// POST a new entry
router.post('/entries', async (req, res) => {
  const { id: userId } = (req as any).user;
  const { date, type, amount, category } = req.body;

  if (!type || !amount || !date) {
    return res.status(400).json({ error: 'Missing required fields: date, type, amount' });
  }

  const { data, error } = await supabase
    .from('entries')
    .insert([{ user_id: userId, date, type, amount, category }])
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data[0]);
});

// DELETE an entry
router.delete('/entries/:id', async (req, res) => {
    const { id: userId } = (req as any).user;
    const { id } = req.params;

    const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(204).send();
});


export default router;
