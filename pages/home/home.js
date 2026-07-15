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
    basePets: [],
    firstDog: {}
  },
  async onShow() {
    syncTabBar(this, 0)
    const user = store.getUser()
    const [dogs, adoptions, bookings] = await Promise.all([
      store.getShelterDogs(),
      store.getAdoptions(),
      store.getBookings()
    ])
    const walkableDogs = adoptions.filter(function(item) {
      return item.isBase === true && item.canWalk === true && item.type === '狗狗'
    })
    const userBookings = user ? bookings.filter(function(booking) {
      return booking.userId === user.id
    }) : []
    const approvedCount = userBookings.filter(function(booking) {
      return booking.status === '已审批'
    }).length
    const basePets = adoptions.filter(function(item) {
      return item.isBase === true
    })
    const otherPets = adoptions.filter(function(item) {
      return item.isBase !== true
    })
    this.setData({
      adoptionCount: adoptions.length,
      dogCount: dogs.length + walkableDogs.length,
      bookingCount: userBookings.length,
      approvedCount: approvedCount,
      featuredPets: otherPets.slice(0, 3),
      basePets: basePets.slice(0, 3),
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