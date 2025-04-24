export async function POST(req, res) {
    try {
      const { mode } = await req.json();
  
      const response = await fetch('http://localhost:5000/switch-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
  
      if (!response.ok) throw new Error('Failed to switch mode');
  
      return res.status(200).json({ message: `Mode switched to ${mode}` });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  