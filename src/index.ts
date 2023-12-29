import { connectToMongoose } from './db';
import { app } from './settings';

const PORT = process.env.PORT || 3000;

async function runServer() {
  await connectToMongoose();

  app.listen(PORT, () => {
    console.log(`App is listening on ${PORT}`);
  });
}

runServer();
