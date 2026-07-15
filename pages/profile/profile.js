const store = require('../../utils/store')

function syncTabBar(page, selected) {
  if (typeof page.getTabBar === 'function' && page.getTabBar()) {
    page.getTabBar().setData({ selected })
  }
}

Page({
  data: {
    user: null,
    bookings: [],
    myAdoptions: [],
    defaultAvatar: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=300&q=80'
  },
  async onShow() {
    syncTabBar(this, 3)
    const user = store.getUser()
    const results = await Promise.all([
      store.getBookingsForUser(user && user.id),
      store.getAdoptionsForUser(user && user.id)
    ])
    this.setData({
      user,
      bookings: results[0],
      myAdoptions: results[1]
    })
  },
  goLogin() {
    wx.navigateTo({ url: '/pages/login/login' })
  },
  logout() {
    store.logout()
    this.setData({ user: null })
    wx.showToast({ title: '已退出', icon: 'success' })
  },
  goWalk() {
    wx.switchTab({ url: '/pages/walk/walk' })
  },
  goPublish() {
    wx.navigateTo({ url: '/pages/publish/publish' })
  },
  deleteAdoption(event) {
    const user = store.getUser()
    const id = event.currentTarget.dataset.id
    if (!user) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    wx.showModal({
      title: '删除领养信息',
      content: '确认删除这条领养信息吗？删除后本地无法恢复。',
      confirmText: '删除',
      confirmColor: '#B9503E',
      success: function(res) {
        if (!res.confirm) return
        store.deleteAdoption(id, user.id).then(async function() {
          this.setData({
            myAdoptions: await store.getAdoptionsForUser(user.id)
          })
          wx.showToast({ title: '已删除', icon: 'success' })
        }.bind(this))
      }.bind(this)
    })
  }
})