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
    const allPets = await store.getAdoptions()
    const catCount = allPets.filter(function(item) {
      return item.type === '猫咪'
    }).length
    const dogCount = allPets.filter(function(item) {
      return item.type === '狗狗'
    }).length
    this.setData({
      allPets,
      catCount,
      dogCount,
      showList: false,
      selectedCategory: ''
    })
  },
  selectCategory(event) {
    const type = event.currentTarget.dataset.type
    const pets = this.data.allPets.filter(function(item) {
      return item.type === type
    })
    this.setData({
      showList: true,
      selectedCategory: type,
      pets
    })
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
    wx.navigateTo({ url: '/pages/adopt-detail/adopt-detail?id=' + id })
  }
})