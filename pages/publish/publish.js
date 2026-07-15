const store = require('../../utils/store')

const initialForm = {
  cover: '',
  images: [],
  isBase: false,
  canWalk: false,
  name: '',
  type: '猫咪',
  breed: '',
  age: '',
  gender: '母',
  healthStatus: '无疾病',
  diseaseInfo: '',
  vaccinated: '已接种',
  locationInfo: '',
  location: '',
  intro: '',
  contact: ''
}

Page({
  data: {
    typeOptions: ['猫咪', '狗狗'],
    genderOptions: ['母', '公', '未知'],
    healthStatusOptions: ['无疾病', '治疗中', '生病中', '未知'],
    vaccinatedOptions: ['已接种', '未接种', '未完整接种', '不确定'],
    typeIndex: 0,
    genderIndex: 0,
    healthStatusIndex: 0,
    vaccinatedIndex: 0,
    form: JSON.parse(JSON.stringify(initialForm))
  },
  chooseImage() {
    const restCount = 9 - this.data.form.images.length
    if (restCount <= 0) {
      wx.showToast({ title: '最多上传9张照片', icon: 'none' })
      return
    }
    wx.chooseMedia({
      count: restCount,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['original', 'compressed'],
      success: function(res) {
        const nextImages = this.data.form.images.concat(res.tempFiles.map(function(file) {
          return file.tempFilePath
        })).slice(0, 9)
        this.setData({
          'form.images': nextImages,
          'form.cover': this.data.form.cover || nextImages[0] || ''
        })
      }.bind(this)
    })
  },
  previewImage(event) {
    const url = event.currentTarget.dataset.url
    wx.previewImage({
      current: url,
      urls: this.data.form.images
    })
  },
  removeImage(event) {
    const index = Number(event.currentTarget.dataset.index)
    const images = this.data.form.images.filter(function(_, currentIndex) {
      return currentIndex !== index
    })
    this.setData({
      'form.images': images,
      'form.cover': images.includes(this.data.form.cover) ? this.data.form.cover : images[0] || ''
    })
  },
  cropCover(event) {
    const image = event.currentTarget.dataset.url
    wx.navigateTo({
      url: '/pages/cover-crop/cover-crop?image=' + encodeURIComponent(image)
    })
  },
  toggleBase() {
    this.setData({
      'form.isBase': !this.data.form.isBase,
      'form.canWalk': false
    })
  },
  toggleCanWalk() {
    this.setData({
      'form.canWalk': !this.data.form.canWalk
    })
  },
  onInput(event) {
    const key = event.currentTarget.dataset.key
    this.setData({ ['form.' + key]: event.detail.value })
  },
  onTypeChange(event) {
    const typeIndex = event.detail.index
    this.setData({
      typeIndex,
      'form.type': this.data.typeOptions[typeIndex]
    })
  },
  onGenderChange(event) {
    const genderIndex = event.detail.index
    this.setData({
      genderIndex,
      'form.gender': this.data.genderOptions[genderIndex]
    })
  },
  onHealthStatusChange(event) {
    const healthStatusIndex = event.detail.index
    const healthStatus = this.data.healthStatusOptions[healthStatusIndex]
    this.setData({
      healthStatusIndex,
      'form.healthStatus': healthStatus
    })
  },
  chooseLocation() {
    wx.chooseLocation({
      success: function(res) {
        this.setData({
          'form.locationInfo': res.name || res.address || '',
          'form.location': res.latitude + ',' + res.longitude
        })
      }.bind(this),
      fail: function() {
        wx.showToast({ title: '定位失败，请手动输入位置', icon: 'none' })
      }
    })
  },
  onVaccinatedChange(event) {
    const vaccinatedIndex = event.detail.index
    this.setData({
      vaccinatedIndex,
      'form.vaccinated': this.data.vaccinatedOptions[vaccinatedIndex]
    })
  },
  async submit() {
    const user = store.getUser()
    if (!user) {
      wx.showModal({
        title: '请先登录',
        content: '登录后可以发布并管理自己的领养信息。',
        confirmText: '去登录',
        success: function(res) {
          if (res.confirm) wx.navigateTo({ url: '/pages/login/login' })
        }
      })
      return
    }
    const form = this.data.form
    const required = ['name', 'breed', 'age', 'intro', 'contact']
    const missed = required.some(function(key) {
      return !String(form[key]).trim()
    })
    if (missed) {
      wx.showToast({ title: '请补全必填信息', icon: 'none' })
      return
    }
    wx.showLoading({ title: '发布中' })
    try {
      const uploadedImages = form.images.length
        ? await store.uploadAdoptionImages(form.images)
        : ['https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=80']
      const uploadedCover = form.cover
        ? await store.uploadAdoptionImage(form.cover)
        : uploadedImages[0]
      const result = await store.addAdoption({
        ...form,
        images: uploadedImages,
        cover: uploadedCover
      })
      wx.hideLoading()
      if (result && result.ok === false) {
        wx.showToast({ title: result.message || '发布失败', icon: 'none' })
        return
      }
      wx.showToast({ title: '发布成功', icon: 'success' })
      setTimeout(function() {
        wx.switchTab({ url: '/pages/adopt/adopt' })
      }, 500)
    } catch (error) {
      wx.hideLoading()
      wx.showToast({ title: '发布失败，请重试', icon: 'none' })
    }
  }
})