const mysql = require('mysql2');

async function testMySQL() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: ''
        });
        
        console.log('✅ MySQL connecté avec succès!');
        
        await connection.execute('CREATE DATABASE IF NOT EXISTS elearning');
        console.log('✅ Base de données "elearning" créée/vérifiée');
        
        await connection.end();
        console.log('✅ Connexion fermée');
        
    } catch (error) {
        console.error('❌ Erreur de connexion MySQL:', error.message);
        console.log('\n💡 Solutions possibles:');
        console.log('1. Démarre XAMPP Control Panel');
        console.log('2. Clique sur "Start" pour MySQL');
        console.log('3. Attends que le service soit vert');
        console.log('4. Relance ce test');
    }
}

testMySQL();
