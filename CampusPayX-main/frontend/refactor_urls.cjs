const fs = require('fs');
const path = require('path');

const files = [
  'src/context/AuthContext.jsx',
  'src/context/SocketContext.jsx',
  'src/pages/Transfer.jsx',
  'src/pages/ManagerTrack.jsx',
  'src/pages/Track.jsx',
  'src/pages/StudentDashboard.jsx',
  'src/pages/ManagerDashboard.jsx',
  'src/pages/ManagerHistory.jsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('localhost:4005')) return;
  
  // Calculate relative path for import
  const folderDepth = file.split('/').length - 2;
  const configPath = folderDepth > 0 ? '../'.repeat(folderDepth) + 'config' : './config';
  
  // Add import if not present
  if (!content.includes('API_URL')) {
    const importStmt = `import { API_URL, SOCKET_URL } from '${configPath}';\n`;
    // Insert after last import
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const eolIndex = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, eolIndex + 1) + importStmt + content.slice(eolIndex + 1);
    } else {
      content = importStmt + content;
    }
  }

  // Replace endpoints:
  // e.g. axios.get('http://localhost:4005/api/users' => axios.get(`${API_URL}/users`
  content = content.replace(/['"]http:\/\/localhost:4005\/api([^'"]*)['"]/g, '`${API_URL}$1`');
  content = content.replace(/['"]http:\/\/localhost:4005([^'"]*)['"]/g, '`${SOCKET_URL}$1`');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Refactored', file);
});
