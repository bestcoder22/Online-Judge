import { executeJs } from './utils/executeJs.js';

(async () => {
  try {
    console.log('→ calling executeJs on testSmoke.js');
    const result = await executeJs(
      './utils/testSmoke.js',
      [{ name: 'T1', data: '' }]
    );
    console.log('← result:', result);
  } catch (err) {
    console.error('!!! error from executeJs:', err);
  }
})();