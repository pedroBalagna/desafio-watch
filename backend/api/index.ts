import { createApp } from '../src/server';

export default async function handler(req, res) {
  const app = await createApp();
  app(req, res);
}
