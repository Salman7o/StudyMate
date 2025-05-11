import { exec } from 'child_process';

console.log('Setting up the database schema...');

// Run the drizzle push command to apply the schema to the database
console.log('Running: npm run db:push');
exec('npm run db:push', (error, stdout, stderr) => {
  if (error) {
    console.error('\nError setting up the database:', error.message);
    process.exit(1);
  }
  
  console.log(stdout);
  
  if (stderr) {
    console.error(stderr);
  }
  
  console.log('\nDatabase setup completed successfully!');
  console.log('You can now start the application with: npm run dev');
});