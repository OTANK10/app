export async function POST(req, res) {
    try {
      const { gesture, name, threshold } = await req.json();
  
      const response = await fetch('http://localhost:5000/save-gesture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gesture, name, threshold }),
      });
  
      if (!response.ok) throw new Error('Failed to save gesture');
  
      return res.status(200).json({ message: 'Gesture saved successfully' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  