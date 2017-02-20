import chai from 'chai';
import chaiLike from 'chai-like';
import dirtyChai from 'dirty-chai';
import chaiSubset from 'chai-subset';

chai.use(dirtyChai);
chai.use(chaiLike);
chai.use(chaiSubset);

process.on('unhandledRejection', function (error) {
  console.error('Unhandled Promise Rejection:');
  console.error(error && error.stack || error);
});

process.on('uncaughtException', (error) => {
  error.stack = error.stack.split(/\n/g).slice(0, 10).join('\n');
  console.error(error);
});
