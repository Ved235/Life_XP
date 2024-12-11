// public/script.js
async function loadLeaderboard() {
  try {
    const response = await fetch('/leaderboard');
    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }
    
    const data = await response.json();
    let leaderboard = data.leaderboard || [];

    leaderboard = leaderboard.sort((a, b) => (b.xp || 0) - (a.xp || 0));
    
    const leaderboardList = document.getElementById('leaderboardList');
    
    if (leaderboard.length === 0) {
      leaderboardList.innerHTML = '<li>No leaderboard entries available</li>';
      return;
    }
    
    leaderboardList.innerHTML = leaderboard
      .map((entry, index) => {
        const username = entry?.username || 'Unknown';
        const xp = entry?.xp || 0;
        
        return `
          <li>
            <span class="rank">${index + 1}.</span>
            <span class="name">${username}</span>
            <span class="xp">${xp} XP</span>
          </li>
        `;
      })
      .join('');
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    document.getElementById('leaderboardList').innerHTML = 
      '<li>Unable to load leaderboard</li>';
  }
}

document.addEventListener('DOMContentLoaded', loadLeaderboard);
document.getElementById('logActivityButton').addEventListener('click', async () => {
    const username = document.getElementById('username').value.trim();
    const userActivity = document.getElementById('userActivity').value.trim();
  
    if (!username || !userActivity) {
      alert('Please enter both username and activity');
      return;
    }
  
    try {
      const response = await fetch('http://127.0.0.1:3000/log-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, userActivity })
      });
  
      const data = await response.json();
      document.getElementById('dailyXP').textContent = `${data.xp} XP`;
      
      document.getElementById('userActivity').value = '';
      
      loadLeaderboard();
  
    } catch (error) {
      console.error('Error logging activity:', error);
      alert('Failed to log activity. Please try again.');
    }
  });