// GitHub数据提交处理脚本
module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const data = req.body;
    
    // 基本数据验证
    if (!data.answers || !Array.isArray(data.answers)) {
      return res.status(400).send('Invalid data format');
    }

    // 触发GitHub Actions工作流
    if (!process.env.GH_DATA_COLLECTION_TOKEN) {
      throw new Error('Missing GitHub token');
    }
    
    const response = await fetch('https://api.github.com/repos/mynameisczj/htmlgame2/dispatches', {
      method: 'POST',
      headers: {
        'Authorization': `token ${process.env.GH_DATA_COLLECTION_TOKEN}`,
        'Accept': 'application/vnd.github.everest-preview+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event_type: 'experiment_data',
        client_payload: data
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('GitHub API Error:', {
        status: response.status,
        error: errorBody,
        tokenUsed: process.env.GH_DATA_COLLECTION_TOKEN ? '*****' : 'NOT SET'
      });
      throw new Error(`GitHub API Error: ${response.status} - ${errorBody}`);
    }

    console.log('Successfully triggered GitHub workflow');
    res.status(200).send('Data submitted successfully');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
};
