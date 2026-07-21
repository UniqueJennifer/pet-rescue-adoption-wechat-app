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
    walkDogs: []
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
    }).map(function(item) {
      return {
        id: item.id || item._id,
        name: item.name,
        size: item.breed || '未知品种',
        temperament: item.healthStatus || '健康状态未知',
        age: item.age || '年龄未知',
        gender: item.gender || '未知',
        health: item.healthStatus || '',
        note: item.baseLocationLabel || item.intro || '基地待领养狗狗',
        cover: item.cover
      }
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
    const availableAdoptions = adoptions.filter(function(item) {
      return !item.status || item.status === '待领养'
    })
    const walkDogs = dogs.concat(walkableDogs)
    this.setData({
      adoptionCount: availableAdoptions.length,
      dogCount: walkDogs.length,
      bookingCount: userBookings.length,
      approvedCount: approvedCount,
      featuredPets: otherPets.slice(0, 3),
      basePets: basePets.slice(0, 3),
      walkDogs
    })
  },
  goAdoptList(event) {
    const dataset = event.currentTarget.dataset || {}
    wx.setStorageSync('home_adopt_filter', {
      type: dataset.type || '全部',
      scope: dataset.scope || 'all',
      title: dataset.title || '全部待领养'
    })
    wx.switchTab({ url: '/pages/adopt/adopt' })
  },
  goPublish() {
    wx.navigateTo({ url: '/pages/publish/publish' })
  },
  goWalk() {
    wx.switchTab({ url: '/pages/walk/walk' })
  },
  goWalkDog(event) {
    const id = event.currentTarget.dataset.id
    if (id) wx.setStorageSync('home_walk_target', { dogId: id })
    wx.switchTab({ url: '/pages/walk/walk' })
  },
  goBookings() {
    wx.setStorageSync('home_walk_target', { showBookings: true })
    wx.switchTab({ url: '/pages/walk/walk' })
  }
})
