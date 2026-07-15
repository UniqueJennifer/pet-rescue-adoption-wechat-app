const store = require('../../utils/store')

Page({
  data: {
    pet: null,
    images: []
  },
  async onLoad(options) {
    wx.showLoading({ title: '加载中' })
    const pet = await store.getAdoptionById(options.id)
    wx.hideLoading()
    if (!pet) {
      wx.showToast({ title: '未找到领养信息', icon: 'none' })
      return
    }
    const images = pet.images && pet.images.length ? pet.images : [pet.cover].filter(Boolean)
    this.setData({ pet, images })
  },
  previewImage(event) {
    const url = event.currentTarget.dataset.url
    wx.previewImage({
      current: url,
      urls: this.data.images
    })
  },
  showContact() {
    wx.showModal({
      title: '领养联系方式',
      content: this.data.pet.contact || '未填写',
      showCancel: false,
      confirmText: '知道了'
    })
  }
})
