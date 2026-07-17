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
    baseAddress: '',
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
    })
    const adoptionWalkDogs = walkableDogs.map(function(item) {
      return {
        id: item.id || item._id,
        name: item.name,
        cover: item.cover,
        temperament: item.healthStatus || '健康状态未填写',
        note: item.baseLocationLabel ? `基地位置：${item.baseLocationLabel}` : '基地待领养狗狗'
      }
    })
    const walkDogs = dogs.concat(adoptionWalkDogs).filter(function(item, index, list) {
      return item && item.id && list.findIndex(function(current) {
        return current.id === item.id
      }) === index
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
    this.setData({
      adoptionCount: availableAdoptions.length,
      dogCount: dogs.length + walkableDogs.length,
      bookingCount: userBookings.length,
      baseAddress: store.getShelterAddress(),
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
    wx.navigateTo({ url: '/pages/adopt/adopt' })
  },
  goAdoptDetail(event) {
    const id = event.currentTarget.dataset.id
    if (!id) return
    wx.navigateTo({ url: '/pages/adopt-detail/adopt-detail?id=' + encodeURIComponent(id) })
  },
  goPublish() {
    wx.navigateTo({ url: '/pages/publish/publish' })
  },
  showBaseAddress() {
    const address = this.data.baseAddress || '基地详细地址暂未填写，请联系管理员'
    wx.showModal({
      title: '基地地址',
      content: address,
      cancelText: '关闭',
      confirmText: '复制地址',
      success(result) {
        if (!result.confirm) return
        wx.setClipboardData({
          data: address,
          success() {
            wx.showToast({ title: '地址已复制', icon: 'success' })
          }
        })
      }
    })
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
