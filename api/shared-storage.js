const { kv } = require('@vercel/kv');

module.exports = {
  async setLatestData(data) {
    await kv.set('latestData', data);
  },

  async getLatestData() {
    return await kv.get('latestData');
  },
};