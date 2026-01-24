import { supabase } from '../../config/config.js';
import { nanoid } from 'nanoid';

// Create a new lobby
export const createLobby = async (req, res) => {
  const { difficulty, rounds } = req.body;

  if (!difficulty || !rounds) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const maxPlayers = rounds == 4 ? 4 : 6;
    const now = new Date();
    const createdAt = now.toISOString();
    const serverCode = nanoid(6); // creates a unique 6 character code

    const { data, error } = await supabase
      .from('lobbies')
      .insert([{ created_at: createdAt, difficulty: difficulty, max_players: maxPlayers, rounds: rounds, server_code: serverCode, players: [] }])
      .select("server_code").single();

    if (error) throw error;
    console.log("Lobby Created");
    return res.status(201).json({ message: "Lobby Created", serverCode:  data.server_code});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create lobby' });
  }
};

// Get all lobbies
export const getLobbies = async (req, res) => {
  try {
    const { data, error } = await supabase.from('lobbies').select('*');
    if (error) throw error;
    res.json({ lobbies: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch lobbies' });
  }
};

// Delete a lobby
export const deleteLobby = async (serverCode) => {
  try {
    const { error } = await supabase
      .from('lobbies')
      .delete()
      .eq('server_code', serverCode);

    if (error) throw error;
    console.log(`Lobby ${serverCode} deleted from Supabase.`);
    return { success: true };
  } catch (err) {
    console.error(`Failed to delete lobby ${serverCode} from Supabase:`, err);
    return { success: false, error: err.message };
  }
};
