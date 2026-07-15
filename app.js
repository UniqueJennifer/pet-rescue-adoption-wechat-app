const store = require('./utils/store')

App({
  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({
        env: store.CLOUD_ENV,
        traceUser: true
      })
    }
    store.ensureSeedData()
  },
  globalData: {
    store
  }
})
