const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const password = 'password123';
const hash = bcrypt.hashSync(password, 10);

console.log('Generated Hash:', hash);

const users = [
    {
        "email": "akshay.srinivas@spirezenenterprises.com",
        "passwordHash": hash,
        "designation": "Software Engineer"
    },
    {
        "email": "test@example.com",
        "passwordHash": hash,
        "designation": "QA Tester"
    }
];

fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 4));
console.log('users.json updated successfully.');

// Verify immediately
const match = bcrypt.compareSync(password, hash);
console.log(`Verification for '${password}': ${match}`);
