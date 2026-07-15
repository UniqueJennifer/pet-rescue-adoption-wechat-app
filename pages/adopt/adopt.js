const store = require('../../utils/store')

function syncTabBar(page, selected) {
  if (typeof page.getTabBar === 'function' && page.getTabBar()) {
    page.getTabBar().setData({ selected })
  }
}

Page({
  data: {
    activeType: '全部',
    allPets: [],
    pets: []
  },
  async onShow() {
    syncTabBar(this, 1)
    const allPets = await store.getAdoptions()
    this.setData({ allPets })
    this.applyFilter()
  },
  changeType(event) {
    this.setData({ activeType: event.currentTarget.dataset.type }, () => this.applyFilter())
  },
  applyFilter() {
    const { activeType, allPets } = this.data
    const pets = activeType === '全部' ? allPets : allPets.filter((item) => item.type === activeType)
    this.setData({ pets })
  },
  goPublish() {
    wx.navigateTo({ url: '/pages/publish/publish' })
  },
  goDetail(event) {
    const id = event.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/adopt-detail/adopt-detail?id=${id}` })
  }
})
