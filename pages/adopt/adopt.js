const store = require('../../utils/store')

function syncTabBar(page, selected) {
  if (typeof page.getTabBar === 'function' && page.getTabBar()) {
    page.getTabBar().setData({ selected })
  }
}

Page({
  data: {
    showList: false,
    selectedCategory: '',
    catCount: 0,
    dogCount: 0,
    allPets: [],
    pets: []
  },
  async onShow() {
    syncTabBar(this, 1)
    const pendingFilter = wx.getStorageSync('home_adopt_filter')
    if (pendingFilter) wx.removeStorageSync('home_adopt_filter')
    const allPets = await store.getAdoptions()
    const catCount = allPets.filter(function(item) {
      return item.type === '猫咪' && (!item.status || item.status === '待领养')
    }).length
    const dogCount = allPets.filter(function(item) {
      return item.type === '狗狗' && (!item.status || item.status === '待领养')
    }).length
    this.setData({
      allPets,
      catCount,
      dogCount
    }, function() {
      if (pendingFilter) {
        this.showFilteredList(pendingFilter)
      } else {
        this.setData({ showList: false, selectedCategory: '', pets: [] })
      }
    }.bind(this))
  },
  showFilteredList(filter) {
    const type = filter.type || '全部'
    const scope = filter.scope || 'all'
    const pets = this.data.allPets.filter(function(item) {
      const isAvailable = !item.status || item.status === '待领养'
      const matchesType = type === '全部' || item.type === type
      const matchesScope = scope === 'all' ||
        (scope === 'base' && item.isBase === true) ||
        (scope === 'nonBase' && item.isBase !== true)
      return isAvailable && matchesType && matchesScope
    })
    this.setData({
      showList: true,
      selectedCategory: filter.title || (type === '全部' ? '全部待领养' : type),
      pets
    })
  },
  selectCategory(event) {
    const type = event.currentTarget.dataset.type
    this.showFilteredList({ type, scope: 'all', title: type })
  },
  goBack() {
    this.setData({
      showList: false,
      selectedCategory: '',
      pets: []
    })
  },
  goPublish() {
    wx.navigateTo({ url: '/pages/publish/publish' })
  },
  goDetail(event) {
    const id = event.currentTarget.dataset.id
    if (!id) return
    wx.navigateTo({ url: '/pages/adopt-detail/adopt-detail?id=' + encodeURIComponent(id) })
  }
})
