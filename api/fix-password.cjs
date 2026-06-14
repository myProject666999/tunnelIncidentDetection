const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function main() {
  const password = '123456';
  const hash = bcrypt.hashSync(password, 10);
  console.log('Generated hash:', hash);
  console.log('Verify:', bcrypt.compareSync('123456', hash));

  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '123456',
    database: 'tunnel_incident'
  });

  try {
    const [result] = await connection.execute(
      'UPDATE user SET password = ? WHERE username = ?',
      [hash, 'admin']
    );
    console.log('Updated rows:', result.affectedRows);

    const [rows] = await connection.execute(
      'SELECT id, username, password FROM user WHERE username = ?',
      ['admin']
    );
    console.log('Stored hash:', rows[0].password);
    console.log('Verify stored hash:', bcrypt.compareSync('123456', rows[0].password));
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
