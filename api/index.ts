import { app } from '../server/app.js';

export default {
  fetch(request: Request) {
    return app.fetch(request);
  },
};
