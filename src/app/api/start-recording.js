export async function POST(req, res) {
    try {
      const response = await fetch('http://localhost:5000/start-recording', {
        method: 'POST',
      });
  
      if (!response.ok) throw new Error('Failed to start recording');
  
      return res.status(200).json({ message: 'Gesture recording started' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  