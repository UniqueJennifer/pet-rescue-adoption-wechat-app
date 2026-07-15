const store = require('../../utils/store')

function syncTabBar(page, selected) {
  if (typeof page.getTabBar === 'function' && page.getTabBar()) {
    page.getTabBar().setData({ selected })
  }
}

Page({
  data: {
    adoptionCount: 0,
    dogCount: 0,
    bookingCount: 0,
    featuredPets: [],
    firstDog: {}
  },
  async onShow() {
    syncTabBar(this, 0)
    const [dogs, adoptions, bookings] = await Promise.all([
      store.getShelterDogs(),
      store.getAdoptions(),
      store.getBookings()
    ])
    this.setData({
      adoptionCount: adoptions.length,
      dogCount: dogs.length,
      bookingCount: bookings.length,
      featuredPets: adoptions.slice(0, 3),
      firstDog: dogs[0] || {}
    })
  },
  goAdopt() {
    wx.switchTab({ url: '/pages/adopt/adopt' })
  },
  goPublish() {
    wx.navigateTo({ url: '/pages/publish/publish' })
  },
  goWalk() {
    wx.switchTab({ url: '/pages/walk/walk' })
  }
})
