import { getAllUsers, deleteUser } from './services/database.js';

async function run() {
  const users = await getAllUsers();
  console.log('Total users:', users.length);
  const unverified = users.filter(u => u.status === 'unverified');
  console.log('Unverified users:', unverified.length);
  if (unverified.length > 0) {
    const user = unverified[0];
    console.log('Deleting user:', user.email, 'id:', user.id);
    const success = await deleteUser(user.id);
    console.log('Delete success?', success);
    const after = await getAllUsers();
    console.log('Total users after:', after.length);
  }
}
run();
