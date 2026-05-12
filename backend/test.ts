import { getAll } from './src/modules/device-categories/device-categories.service.js';
getAll({ sortBy: 'createdAt', sortOrder: 'desc' }).then(res => {
  console.log(res);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
