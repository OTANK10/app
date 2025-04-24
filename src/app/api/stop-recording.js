export async function POST(req, res) {
    try {
      const response = await fetch('http://localhost:5000/stop-recording', {
        method: 'POST',
      });
  
      if (!response.ok) throw new Error('Failed to stop recording');
  
      return res.status(200).json({ message: 'Gesture recording stopped' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  