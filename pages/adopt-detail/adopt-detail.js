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
    const detailPet = {
      ...pet,
      healthStatusDisplay: pet.healthStatus || pet.recovered || '未填写',
      sourceDisplay: pet.isBase ? 'TAPA 基地' : '个人救助 / 家庭送养',
      baseLocationDisplay: pet.baseLocationLabel || [pet.baseSite, pet.baseArea, pet.baseNumber].filter(Boolean).join(' · '),
      locationDisplay: pet.locationInfo || pet.livingInfo || '未填写',
      canWalkDisplay: pet.type === '狗狗' && pet.isBase ? (pet.canWalk ? '可以预约遛狗' : '暂不可预约遛狗') : ''
    }
    this.setData({ pet: detailPet, images })
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
